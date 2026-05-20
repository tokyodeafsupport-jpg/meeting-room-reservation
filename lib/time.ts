import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isBefore,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ja } from "date-fns/locale";
import { BUSINESS_END, BUSINESS_START, SLOT_MINUTES } from "@/lib/constants";

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function toDisplayDate(dateKey: string) {
  return format(parseISO(dateKey), "M月d日(E)", { locale: ja });
}

export function toDisplayMonth(date: Date) {
  return format(date, "yyyy年M月", { locale: ja });
}

export function startOfBusinessWeek(date: Date) {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getWeekDays(date: Date) {
  const start = startOfBusinessWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function getMonthDays(date: Date) {
  const monthStart = startOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(date);
  const days: Date[] = [];
  let cursor = gridStart;

  while (days.length < 42 || isBefore(cursor, monthEnd)) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function getAdjacentPeriod(date: Date, viewMode: "week" | "month", direction: -1 | 1) {
  return viewMode === "week" ? addDays(date, direction * 7) : addMonths(date, direction);
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function normalizeTime(time: string) {
  return time.slice(0, 5);
}

export function makeTimeSlots() {
  const start = timeToMinutes(BUSINESS_START);
  const end = timeToMinutes(BUSINESS_END);
  const slots: string[] = [];

  for (let minutes = start; minutes <= end; minutes += SLOT_MINUTES) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
}

export function clampReservationAround(slotTime: string) {
  const min = timeToMinutes(BUSINESS_START);
  const max = timeToMinutes(BUSINESS_END);
  const center = timeToMinutes(slotTime);
  let start = center - SLOT_MINUTES;
  let end = center + SLOT_MINUTES;

  if (start < min) {
    start = min;
    end = min + SLOT_MINUTES * 2;
  }

  if (end > max) {
    end = max;
    start = max - SLOT_MINUTES * 2;
  }

  return {
    start_time: minutesToTime(start),
    end_time: minutesToTime(end),
  };
}

export function getBlockStyle(startTime: string, endTime: string) {
  const dayStart = timeToMinutes(BUSINESS_START);
  const dayEnd = timeToMinutes(BUSINESS_END);
  const start = timeToMinutes(normalizeTime(startTime));
  const end = timeToMinutes(normalizeTime(endTime));
  const total = dayEnd - dayStart;

  return {
    top: `${((start - dayStart) / total) * 100}%`,
    height: `${((end - start) / total) * 100}%`,
  };
}

export function getTimeOptions() {
  return makeTimeSlots();
}
