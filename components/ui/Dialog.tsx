"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type DialogProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

export function Dialog({ title, children, footer, onClose }: DialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/45">
      <section className="w-[560px] rounded-lg border border-line bg-white shadow-panel">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button aria-label="閉じる" className="h-8 w-8 px-0" onClick={onClose} variant="ghost">
            <X size={18} />
          </Button>
        </header>
        <div className="px-5 py-5">{children}</div>
        {footer ? <footer className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</footer> : null}
      </section>
    </div>
  );
}
