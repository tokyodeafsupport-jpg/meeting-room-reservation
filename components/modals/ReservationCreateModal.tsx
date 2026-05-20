"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { SUPPORTED_END_DATE, SUPPORTED_START_DATE } from "@/lib/constants";
import { normalizeTime, toDisplayDate } from "@/lib/time";
import type { DraftReservation } from "@/components/calendar/DraftReservationBlock";
import type { ReservationInsert, Room, User } from "@/types/database";

type ReservationCreateModalProps = {
  draft: DraftReservation;
  rooms: Room[];
  users: User[];
  onClose: () => void;
  onSubmit: (input: ReservationInsert) => Promise<void>;
};

export function ReservationCreateModal({ draft, rooms, users, onClose, onSubmit }: ReservationCreateModalProps) {
  const [userId, setUserId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const room = useMemo(() => rooms.find((item) => item.id === draft.room_id), [draft.room_id, rooms]);

  return (
    <Dialog
      footer={
        <>
          <Button disabled={submitting} onClick={onClose}>キャンセル</Button>
          <Button
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await onSubmit({
                  room_id: draft.room_id,
                  user_id: userId,
                  date: draft.date,
                  start_time: draft.start_time,
                  end_time: draft.end_time,
                  purpose,
                });
              } finally {
                setSubmitting(false);
              }
            }}
            variant="primary"
          >
            OK
          </Button>
        </>
      }
      title="予約情報入力"
      onClose={onClose}
    >
      <div className="grid gap-4">
        <Field label="会議室">
          <input className="h-10 w-full rounded-md border border-line bg-[#f4f7fa] px-3 text-sm" readOnly value={room?.name ?? ""} />
        </Field>
        <Field label="予約者・団体">
          <Select value={userId} onChange={(event) => setUserId(event.target.value)}>
            <option value="">選択してください</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} / {user.organization}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="利用日">
            <input
              className="h-10 w-full rounded-md border border-line bg-[#f4f7fa] px-3 text-sm"
              max={SUPPORTED_END_DATE}
              min={SUPPORTED_START_DATE}
              readOnly
              value={toDisplayDate(draft.date)}
            />
          </Field>
          <Field label="開始">
            <input className="h-10 w-full rounded-md border border-line bg-[#f4f7fa] px-3 text-sm" readOnly value={normalizeTime(draft.start_time)} />
          </Field>
          <Field label="終了">
            <input className="h-10 w-full rounded-md border border-line bg-[#f4f7fa] px-3 text-sm" readOnly value={normalizeTime(draft.end_time)} />
          </Field>
        </div>
        <Field label="利用目的">
          <textarea
            className="min-h-24 w-full resize-none rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
          />
        </Field>
        {users.length === 0 ? <p className="rounded-md bg-[#fff5d9] px-3 py-2 text-sm font-semibold text-[#725300]">先にユーザー管理画面で予約者・団体を登録してください。</p> : null}
      </div>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-muted">{label}</span>
      {children}
    </label>
  );
}
