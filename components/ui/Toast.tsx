"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

export type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

type ToastProps = {
  toast: ToastState;
};

export function Toast({ toast }: ToastProps) {
  if (!toast) {
    return null;
  }

  const Icon = toast.type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className="fixed right-6 top-5 z-[60] flex min-w-[320px] items-center gap-3 rounded-md border border-line bg-white px-4 py-3 shadow-panel">
      <Icon className={toast.type === "success" ? "text-brand" : "text-danger"} size={20} />
      <p className="text-sm font-semibold">{toast.message}</p>
    </div>
  );
}
