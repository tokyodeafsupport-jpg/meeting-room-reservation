"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { SUPPORTED_END_DATE, SUPPORTED_START_DATE } from "@/lib/constants";
import { getTimeOptions, normalizeTime } from "@/lib/time";
import type { ReservationInsert, Room, User } from "@/types/database";

type ReservationEditModalProps = {
  reservation: {
    id: string;
    room_id: string;
    user_id: string;
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
  };
  rooms: Room[];
  users: User[];
  onClose: () => void;
  onDelete: () => Promise<void>;
  onSubmit: (input: ReservationInsert) => Promise<void>;
};

export function ReservationEditModal({ reservation, rooms, users, onClose, onDelete, onSubmit }: ReservationEditModalProps) {
  const [roomId, setRoomId] = useState(reservation.room_id);
  const [userId, setUserId] = useState(reservation.user_id);
  const [date, setDate] = useState(reservation.date);
  const [startTime, setStartTime] = useState(normalizeTime(reservation.start_time));
  const [endTime, setEndTime] = useState(normalizeTime(reservation.end_time));
  const [purpose, setPurpose] = useState(reservation.purpose);
  const [submitting, setSubmitting] = useState(false);
  const timeOptions = getTimeOptions();

  return (
    <Dialog
      footer={
        <>
          <Button
            disabled={submitting}
            onClick={async () => {
              if (!window.confirm("この予約をキャンセルしますか？")) {
                return;
              }
              setSubmitting(true);
              try {
                await onDelete();
              } finally {
                setSubmitting(false);
              }
            }}
            variant="danger"
          >
            キャンセル
          </Button>
          <Button disabled={submitting} onClick={onClose}>
            閉じる
          </Button>
          <Button
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await onSubmit({
                  room_id: roomId,
                  user_id: userId,
                  date,
                  start_time: startTime,
                  end_time: endTime,
                  purpose,
                });
              } finally {
                setSubmitting(false);
              }
            }}
            variant="primary"
          >
            更新
          </Button>
        </>
      }
      title="予約編集・キャンセル"
      onClose={onClose}
    >
      <div className="grid gap-4">
        <Field label="会議室">
          <Select value={roomId} onChange={(event) => setRoomId(event.target.value)}>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="予約者・団体">
          <Select value={userId} onChange={(event) => setUserId(event.target.value)}>
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
              className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              max={SUPPORTED_END_DATE}
              min={SUPPORTED_START_DATE}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>
          <Field label="開始">
            <Select value={startTime} onChange={(event) => setStartTime(event.target.value)}>
              {timeOptions.slice(0, -1).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="終了">
            <Select value={endTime} onChange={(event) => setEndTime(event.target.value)}>
              {timeOptions.slice(1).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="利用目的">
          <textarea
            className="min-h-24 w-full resize-none rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
          />
        </Field>
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
