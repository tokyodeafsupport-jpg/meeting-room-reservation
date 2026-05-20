"use client";

import { getBlockStyle, normalizeTime } from "@/lib/time";
import type { Reservation, User } from "@/types/database";

type ReservationBlockProps = {
  reservation: Reservation;
  user?: User;
  onClick: (reservation: Reservation) => void;
};

export function ReservationBlock({ reservation, user, onClick }: ReservationBlockProps) {
  return (
    <button
      className="absolute left-1 right-1 z-20 overflow-hidden rounded-md border border-black/10 px-2 py-1 text-left text-[12px] font-semibold leading-snug text-white shadow-sm"
      style={{
        ...getBlockStyle(reservation.start_time, reservation.end_time),
        backgroundColor: user?.color ?? "#1f7a8c",
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick(reservation);
      }}
    >
      <span className="block truncate">{user?.name ?? "未登録"}</span>
      <span className="block truncate">{user?.organization ?? ""}</span>
      <span className="block truncate">
        {normalizeTime(reservation.start_time)}〜{normalizeTime(reservation.end_time)}
      </span>
    </button>
  );
}
