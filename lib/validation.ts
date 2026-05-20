import {
  BUSINESS_END,
  BUSINESS_START,
  RESTRICTED_END,
  RESTRICTED_START,
  SUPPORTED_END_DATE,
  SUPPORTED_START_DATE,
} from "@/lib/constants";
import { normalizeTime, timeToMinutes } from "@/lib/time";
import type { Reservation, ReservationInsert, Room } from "@/types/database";

type ReservationLike = Pick<ReservationInsert, "room_id" | "date" | "start_time" | "end_time" | "purpose" | "user_id">;

export function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return timeToMinutes(normalizeTime(startA)) < timeToMinutes(normalizeTime(endB))
    && timeToMinutes(normalizeTime(endA)) > timeToMinutes(normalizeTime(startB));
}

export function isRestrictedSlot(room: Room | undefined, dateKey: string, startTime: string, endTime: string) {
  if (!room?.has_restriction) {
    return false;
  }

  const day = new Date(`${dateKey}T00:00:00`).getDay();
  const isWeekday = day >= 1 && day <= 5;

  return isWeekday && overlaps(startTime, endTime, RESTRICTED_START, RESTRICTED_END);
}

export function findReservationConflict(
  candidate: Pick<ReservationInsert, "room_id" | "date" | "start_time" | "end_time">,
  reservations: Reservation[],
  ignoreReservationId?: string,
) {
  return reservations.find((reservation) => {
    if (reservation.id === ignoreReservationId) {
      return false;
    }

    return reservation.room_id === candidate.room_id
      && reservation.date === candidate.date
      && overlaps(candidate.start_time, candidate.end_time, reservation.start_time, reservation.end_time);
  });
}

export function validateReservation(
  reservation: ReservationLike,
  rooms: Room[],
  reservations: Reservation[],
  ignoreReservationId?: string,
) {
  const room = rooms.find((item) => item.id === reservation.room_id);
  const errors: string[] = [];

  if (!reservation.user_id) {
    errors.push("予約者・団体を選択してください。");
  }

  if (!reservation.purpose.trim()) {
    errors.push("利用目的を入力してください。");
  }

  if (reservation.date < SUPPORTED_START_DATE || reservation.date > SUPPORTED_END_DATE) {
    errors.push("対応期間外の日付です。");
  }

  if (
    timeToMinutes(reservation.start_time) < timeToMinutes(BUSINESS_START)
    || timeToMinutes(reservation.end_time) > timeToMinutes(BUSINESS_END)
  ) {
    errors.push("予約時間は8:30〜22:00の範囲で指定してください。");
  }

  if (timeToMinutes(reservation.start_time) >= timeToMinutes(reservation.end_time)) {
    errors.push("開始時間は終了時間より前にしてください。");
  }

  if (isRestrictedSlot(room, reservation.date, reservation.start_time, reservation.end_time)) {
    errors.push("3階訓練室・3階相談室は平日9:00〜15:00に予約できません。");
  }

  if (findReservationConflict(reservation, reservations, ignoreReservationId)) {
    errors.push("同じ会議室・時間帯に既存予約があります。");
  }

  return errors;
}
