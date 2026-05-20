"use client";

import { Check, GripHorizontal, X } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { BUSINESS_END, BUSINESS_START, SLOT_MINUTES } from "@/lib/constants";
import { getBlockStyle, minutesToTime, normalizeTime, timeToMinutes } from "@/lib/time";

export type DraftReservation = {
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
};

type DraftReservationBlockProps = {
  draft: DraftReservation;
  onChange: (draft: DraftReservation) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const ROW_HEIGHT = 32;

export function DraftReservationBlock({ draft, onChange, onConfirm, onCancel }: DraftReservationBlockProps) {
  const startResize = useCallback(
    (edge: "start" | "end", initialY: number) => {
      const initialStart = timeToMinutes(draft.start_time);
      const initialEnd = timeToMinutes(draft.end_time);
      const min = timeToMinutes(BUSINESS_START);
      const max = timeToMinutes(BUSINESS_END);

      const handleMove = (event: MouseEvent) => {
        const deltaSlots = Math.round((event.clientY - initialY) / ROW_HEIGHT);
        const deltaMinutes = deltaSlots * SLOT_MINUTES;

        if (edge === "start") {
          const nextStart = Math.min(Math.max(initialStart + deltaMinutes, min), initialEnd - SLOT_MINUTES);
          onChange({ ...draft, start_time: minutesToTime(nextStart) });
        } else {
          const nextEnd = Math.max(Math.min(initialEnd + deltaMinutes, max), initialStart + SLOT_MINUTES);
          onChange({ ...draft, end_time: minutesToTime(nextEnd) });
        }
      };

      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [draft, onChange],
  );

  return (
    <div
      className="absolute left-1 right-1 z-30 rounded-md border-2 border-dashed border-brand bg-white/95 px-2 py-1 shadow-panel"
      style={getBlockStyle(draft.start_time, draft.end_time)}
    >
      <button
        aria-label="開始時刻をドラッグで変更"
        className="absolute left-1/2 top-0 flex h-4 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded bg-brand text-white"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          startResize("start", event.clientY);
        }}
      >
        <GripHorizontal size={14} />
      </button>
      <div className="flex h-full min-h-16 flex-col justify-between gap-2">
        <div className="text-xs font-bold text-brand">
          {normalizeTime(draft.start_time)}〜{normalizeTime(draft.end_time)}
        </div>
        <div className="flex items-center gap-2">
          <Button aria-label="仮予約を確定" className="h-7 w-8 px-0" onClick={onConfirm} variant="primary">
            <Check size={15} />
          </Button>
          <Button aria-label="仮予約を破棄" className="h-7 w-8 px-0" onClick={onCancel} variant="ghost">
            <X size={15} />
          </Button>
        </div>
      </div>
      <button
        aria-label="終了時刻をドラッグで変更"
        className="absolute bottom-0 left-1/2 flex h-4 w-12 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded bg-brand text-white"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          startResize("end", event.clientY);
        }}
      >
        <GripHorizontal size={14} />
      </button>
    </div>
  );
}
