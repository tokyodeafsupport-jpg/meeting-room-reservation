"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import type { DraftReservation } from "@/components/calendar/DraftReservationBlock";
import { ReservationCreateModal } from "@/components/modals/ReservationCreateModal";
import { ReservationEditModal } from "@/components/modals/ReservationEditModal";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { fetchReservations, createReservation, deleteReservation, updateReservation } from "@/lib/reservations";
import { fetchRooms } from "@/lib/rooms";
import { hasSupabaseConfig, supabase } from "@/lib/supabase/client";
import { getAdjacentPeriod, getMonthDays, getWeekDays, toDateKey } from "@/lib/time";
import { findReservationConflict, isRestrictedSlot, validateReservation } from "@/lib/validation";
import { fetchUsers } from "@/lib/users";
import type { Reservation, ReservationInsert, Room, User } from "@/types/database";

export default function HomePage() {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [draft, setDraft] = useState<DraftReservation | null>(null);
  const [createModalDraft, setCreateModalDraft] = useState<DraftReservation | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  const dateRange = useMemo(() => {
    const days = viewMode === "week" ? getWeekDays(currentDate) : getMonthDays(currentDate);
    return {
      from: toDateKey(days[0]),
      to: toDateKey(days[days.length - 1]),
    };
  }, [currentDate, viewMode]);

  const showToast = useCallback((message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const loadData = useCallback(async () => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [nextRooms, nextUsers, nextReservations] = await Promise.all([
        fetchRooms(),
        fetchUsers(),
        fetchReservations(dateRange.from, dateRange.to),
      ]);
      setRooms(nextRooms);
      setUsers(nextUsers);
      setReservations(nextReservations);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "データ取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to, showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel("calendar-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => void loadData())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleDraftCreate = (nextDraft: DraftReservation) => {
    const room = rooms.find((item) => item.id === nextDraft.room_id);

    if (isRestrictedSlot(room, nextDraft.date, nextDraft.start_time, nextDraft.end_time)) {
      showToast("この時間帯は予約できません。");
      return;
    }

    if (findReservationConflict(nextDraft, reservations)) {
      showToast("同じ会議室・時間帯に既存予約があります。");
      return;
    }

    setDraft(nextDraft);
  };

  const handleCreate = async (input: ReservationInsert) => {
    const errors = validateReservation(input, rooms, reservations);

    if (errors.length > 0) {
      showToast(errors[0]);
      return;
    }

    try {
      const created = await createReservation(input);
      setReservations((current) => [...current, created]);
      setDraft(null);
      setCreateModalDraft(null);
      showToast("予約を登録しました。", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "予約登録に失敗しました。");
    }
  };

  const handleUpdate = async (input: ReservationInsert) => {
    if (!editingReservation) {
      return;
    }

    const errors = validateReservation(input, rooms, reservations, editingReservation.id);

    if (errors.length > 0) {
      showToast(errors[0]);
      return;
    }

    try {
      const updated = await updateReservation(editingReservation.id, input);
      setReservations((current) => current.map((reservation) => (reservation.id === updated.id ? updated : reservation)));
      setEditingReservation(null);
      showToast("予約を更新しました。", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "予約更新に失敗しました。");
    }
  };

  const handleDelete = async () => {
    if (!editingReservation) {
      return;
    }

    try {
      await deleteReservation(editingReservation.id);
      setReservations((current) => current.filter((reservation) => reservation.id !== editingReservation.id));
      setEditingReservation(null);
      showToast("予約をキャンセルしました。", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "予約キャンセルに失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onMove={(direction) => setCurrentDate((date) => getAdjacentPeriod(date, viewMode, direction))}
        onToday={() => setCurrentDate(new Date())}
        onViewModeChange={setViewMode}
      />

      {!hasSupabaseConfig ? (
        <div className="m-5 rounded-lg border border-line bg-white px-5 py-4 text-sm font-semibold text-danger">
          NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定してください。
        </div>
      ) : null}

      {loading ? (
        <div className="m-5 rounded-lg border border-line bg-white px-5 py-8 text-center text-sm font-semibold text-muted">読み込み中</div>
      ) : (
        <CalendarGrid
          currentDate={currentDate}
          draft={draft}
          reservations={reservations}
          rooms={rooms}
          users={users}
          viewMode={viewMode}
          onDraftCancel={() => setDraft(null)}
          onDraftChange={setDraft}
          onDraftConfirm={() => {
            if (!draft) {
              return;
            }

            const errors = validateReservation({ ...draft, user_id: "draft", purpose: "draft" }, rooms, reservations);
            if (errors.some((error) => error.includes("既存予約") || error.includes("予約できません"))) {
              showToast(errors.find((error) => error.includes("既存予約") || error.includes("予約できません")) ?? "予約できません。");
              return;
            }

            setCreateModalDraft(draft);
          }}
          onDraftCreate={handleDraftCreate}
          onReservationClick={setEditingReservation}
        />
      )}

      {createModalDraft ? (
        <ReservationCreateModal
          draft={createModalDraft}
          rooms={rooms}
          users={users}
          onClose={() => {
            setCreateModalDraft(null);
            setDraft(null);
          }}
          onSubmit={handleCreate}
        />
      ) : null}

      {editingReservation ? (
        <ReservationEditModal
          reservation={editingReservation}
          rooms={rooms}
          users={users}
          onClose={() => setEditingReservation(null)}
          onDelete={handleDelete}
          onSubmit={handleUpdate}
        />
      ) : null}

      <Toast toast={toast} />
    </div>
  );
}
