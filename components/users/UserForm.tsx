"use client";

import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/database";

type UserFormProps = {
  editingUser: User | null;
  onCancelEdit: () => void;
  onSubmit: (input: { name: string; organization: string; color: string }) => Promise<void>;
};

const defaultColor = "#1f7a8c";

export function UserForm({ editingUser, onCancelEdit, onSubmit }: UserFormProps) {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setOrganization(editingUser.organization);
      setColor(editingUser.color);
      return;
    }

    setName("");
    setOrganization("");
    setColor(defaultColor);
  }, [editingUser]);

  return (
    <form
      className="grid grid-cols-[1fr_1fr_160px_auto] items-end gap-3 rounded-lg border border-line bg-white p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
          await onSubmit({ name, organization, color });
          if (!editingUser) {
            setName("");
            setOrganization("");
            setColor(defaultColor);
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <Field label="予約者名">
        <input
          className="h-10 rounded-md border border-line px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field label="団体名">
        <input
          className="h-10 rounded-md border border-line px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          required
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
        />
      </Field>
      <Field label="表示色">
        <div className="flex h-10 items-center gap-2 rounded-md border border-line px-2">
          <input className="h-7 w-9" type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          <input
            className="min-w-0 flex-1 text-sm uppercase outline-none"
            pattern="^#[0-9A-Fa-f]{6}$"
            required
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>
      </Field>
      <div className="flex gap-2">
        <Button disabled={submitting} type="submit" variant="primary">
          <Save size={16} />
          {editingUser ? "更新" : "登録"}
        </Button>
        {editingUser ? (
          <Button disabled={submitting} type="button" onClick={onCancelEdit}>
            <X size={16} />
          </Button>
        ) : null}
      </div>
    </form>
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
