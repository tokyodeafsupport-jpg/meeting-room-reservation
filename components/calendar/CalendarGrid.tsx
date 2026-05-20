"use client";

import { format, isSameMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { DraftReservationBlock, type DraftReservation } from "@/components/calendar/DraftReservationBlock";
import { ReservationBlock } from "@/components/calendar/ReservationBlock";
import { BUSINESS_START, RESTRICTED_END, RESTRICTED_START, SLOT_MINUTES } from "@/lib/constants";
import {
  clampReservationAround,
  getMonthDays,
  getWeekDays,
  makeTimeSlots,
  normalizeTime,
  timeToMinutes,
  toDateKey,
} from "@/lib/time";
import { isRestrictedSlot } from "@/lib/validation";
import type { Reservation, Room, User } from "@/types/database";

type CalendarGridProps = {
  currentDate: Date;
  viewMode: "week" | "month";
  rooms: Room[];
  users: User[];
  reservations: Reservation[];
  draft: DraftReservation | null;
  onDraftCreate: (draft: DraftReservation) => void;
  onDraftChange: (draft: DraftReservation) => void;
  onDraftConfirm: () => void;
  onDraftCancel: () => void;
  onReservationClick: (reservation: Reservation) => void;
};

const ROW_HEIGHT = 32;
const timeSlots = makeTimeSlots();
const slotRows = timeSlots.slice(0, -1);

function getUser(users: User[], userId: string) {
  return users.find((user) => user.id === userId);
}

export function CalendarGrid(props: CalendarGridProps) {
  if (props.viewMode === "month") {
    return <MonthGrid {...props} />;
  }

  return <WeekGrid {...props} />;
}

function WeekGrid({
  currentDate,
  rooms,
  users,
  reservations,
  draft,
  onDraftCreate,
  onDraftChange,
  onDraftConfirm,
  onDraftCancel,
  onReservationClick,
}: CalendarGridProps) {
  const days = getWeekDays(currentDate);

  return (
    <main className="p-5">
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="grid grid-cols-[148px_repeat(7,minmax(128px,1fr))] border-b border-line bg-[#eef3f7]">
          <div className="border-r border-line px-4 py-3 text-sm font-bold">会議室 / 時間</div>
          {days.map((day) => (
            <div className="border-r border-line px-3 py-3 text-center text-sm font-bold last:border-r-0" key={day.toISOString()}>
              {format(day, "M/d E", { locale: ja })}
            </div>
          ))}
        </div>

        {rooms.map((room) => (
          <section className="grid grid-cols-[148px_repeat(7,minmax(128px,1fr))] border-b border-line last:border-b-0" key={room.id}>
            <aside className="border-r border-line bg-white px-4 py-4">
              <div className="text-base font-bold">{room.name}</div>
              <div className="mt-1 text-xs text-muted">{room.floor}階</div>
              {room.has_restriction ? (
                <div className="mt-3 rounded bg-[#e7eaef] px-2 py-1 text-xs font-semibold text-muted">平日9:00〜15:00制限</div>
              ) : null}
              <div className="mt-4 space-y-[15px] text-[11px] text-muted">
                {slotRows.map((slot) => (
                  <div className="h-[17px]" key={slot}>
                    {slot.endsWith(":00") ? slot : ""}
                  </div>
                ))}
              </div>
            </aside>

            {days.map((day) => {
              const date = toDateKey(day);
              const laneReservations = reservations.filter((reservation) => reservation.room_id === room.id && reservation.date === date);
              const laneDraft = draft?.room_id === room.id && draft.date === date ? draft : null;

              return (
                <div
                  className="relative border-r border-line last:border-r-0"
                  key={`${room.id}-${date}`}
                  style={{ height: ROW_HEIGHT * slotRows.length }}
                >
                  {slotRows.map((slot) => {
                    const restricted = isRestrictedSlot(room, date, slot, minutesAfter(slot));

                    return (
                      <button
                        aria-label={`${room.name} ${date} ${slot}`}
                        className={
                          restricted
                            ? "block w-full border-b border-line bg-[#dfe3ea]"
                            : "block w-full border-b border-line bg-white hover:bg-[#eef7f8]"
                        }
                        disabled={restricted}
                        key={slot}
                        style={{ height: ROW_HEIGHT }}
                        onClick={() => {
                          const next = clampReservationAround(slot);
                          onDraftCreate({ room_id: room.id, date, ...next });
                        }}
                      />
                    );
                  })}

                  <RestrictedBand room={room} date={date} />

                  {laneReservations.map((reservation) => (
                    <ReservationBlock
                      key={reservation.id}
                      reservation={reservation}
                      user={getUser(users, reservation.user_id)}
                      onClick={onReservationClick}
                    />
                  ))}

                  {laneDraft ? (
                    <DraftReservationBlock
                      draft={laneDraft}
                      onCancel={onDraftCancel}
                      onChange={onDraftChange}
                      onConfirm={onDraftConfirm}
                    />
                  ) : null}
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </main>
  );
}

function RestrictedBand({ room, date }: { room: Room; date: string }) {
  if (!isRestrictedSlot(room, date, RESTRICTED_START, RESTRICTED_END)) {
    return null;
  }

  const dayStart = timeToMinutes(BUSINESS_START);
  const top = ((timeToMinutes(RESTRICTED_START) - dayStart) / (SLOT_MINUTES * slotRows.length)) * 100;
  const height = ((timeToMinutes(RESTRICTED_END) - timeToMinutes(RESTRICTED_START)) / (SLOT_MINUTES * slotRows.length)) * 100;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10 flex items-center justify-center bg-[#cfd5df]/70 text-xs font-bold text-muted"
      style={{ top: `${top}%`, height: `${height}%` }}
    >
      予約不可
    </div>
  );
}

function MonthGrid({ currentDate, rooms, users, reservations, onReservationClick }: CalendarGridProps) {
  const days = getMonthDays(currentDate);

  return (
    <main className="p-5">
      <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-line bg-white">
        {days.map((day) => {
          const date = toDateKey(day);
          const dayReservations = reservations.filter((reservation) => reservation.date === date);

          return (
            <section
              className={isSameMonth(day, currentDate) ? "min-h-[168px] border-b border-r border-line bg-white p-2" : "min-h-[168px] border-b border-r border-line bg-[#f0f3f7] p-2 text-muted"}
              key={date}
            >
              <div className="mb-2 text-sm font-bold">{format(day, "M/d E", { locale: ja })}</div>
              <div className="space-y-1">
                {dayReservations.slice(0, 8).map((reservation) => {
                  const user = getUser(users, reservation.user_id);
                  const room = rooms.find((item) => item.id === reservation.room_id);

                  return (
                    <button
                      className="block w-full truncate rounded px-2 py-1 text-left text-[11px] font-semibold text-white"
                      key={reservation.id}
                      style={{ backgroundColor: user?.color ?? "#1f7a8c" }}
                      onClick={() => onReservationClick(reservation)}
                    >
                      {normalizeTime(reservation.start_time)} {room?.name} {user?.name}
                    </button>
                  );
                })}
                {dayReservations.length > 8 ? <div className="text-[11px] font-semibold text-muted">他 {dayReservations.length - 8}件</div> : null}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

function minutesAfter(time: string) {
  return `${normalizeTime(minutesToString(timeToMinutes(time) + SLOT_MINUTES))}`;
}

function minutesToString(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
