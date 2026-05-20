"use client";

import { CalendarDays, ChevronLeft, ChevronRight, UsersRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { toDateKey, toDisplayMonth } from "@/lib/time";

type CalendarHeaderProps = {
  currentDate: Date;
  viewMode: "week" | "month";
  onViewModeChange: (viewMode: "week" | "month") => void;
  onToday: () => void;
  onMove: (direction: -1 | 1) => void;
  onDateChange: (date: Date) => void;
};

export function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onToday,
  onMove,
  onDateChange,
}: CalendarHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold">会議室予約</h1>
        <p className="mt-1 text-sm text-muted">2026年4月1日〜2035年3月31日</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex overflow-hidden rounded-md border border-line">
          <Button
            className="rounded-none border-0"
            onClick={() => onViewModeChange("week")}
            variant={viewMode === "week" ? "primary" : "ghost"}
          >
            週
          </Button>
          <Button
            className="rounded-none border-0"
            onClick={() => onViewModeChange("month")}
            variant={viewMode === "month" ? "primary" : "ghost"}
          >
            月
          </Button>
        </div>

        <Button aria-label="前へ" className="h-9 w-9 px-0" onClick={() => onMove(-1)}>
          <ChevronLeft size={18} />
        </Button>
        <Button onClick={onToday}>今週</Button>
        <Button aria-label="次へ" className="h-9 w-9 px-0" onClick={() => onMove(1)}>
          <ChevronRight size={18} />
        </Button>

        <label className="flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold">
          <CalendarDays size={16} />
          <input
            className="w-[132px] outline-none"
            max="2035-03-31"
            min="2026-04-01"
            type="date"
            value={toDateKey(currentDate)}
            onChange={(event) => onDateChange(new Date(`${event.target.value}T00:00:00`))}
          />
        </label>

        <div className="min-w-[120px] text-right text-lg font-bold">{toDisplayMonth(currentDate)}</div>

        <Link href="/users">
          <Button variant="primary">
            <UsersRound size={17} />
            ユーザー管理
          </Button>
        </Link>
      </div>
    </header>
  );
}
