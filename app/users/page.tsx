"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { UserForm } from "@/components/users/UserForm";
import { UserTable } from "@/components/users/UserTable";
import { Button } from "@/components/ui/Button";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { hasSupabaseConfig, supabase } from "@/lib/supabase/client";
import { createUser, deleteUser, fetchUsers, updateUser } from "@/lib/users";
import type { User } from "@/types/database";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const loadData = useCallback(async () => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setUsers(await fetchUsers());
    } catch (error) {
      showToast(error instanceof Error ? error.message : "ユーザー取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel("users-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => void loadData())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadData]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">ユーザー管理</h1>
          <p className="mt-1 text-sm text-muted">予約者・団体と表示色を管理します。</p>
        </div>
        <Link href="/">
          <Button>
            <ArrowLeft size={17} />
            カレンダーへ
          </Button>
        </Link>
      </header>

      <main className="grid gap-5 p-5">
        {!hasSupabaseConfig ? (
          <div className="rounded-lg border border-line bg-white px-5 py-4 text-sm font-semibold text-danger">
            NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定してください。
          </div>
        ) : null}

        <UserForm
          editingUser={editingUser}
          onCancelEdit={() => setEditingUser(null)}
          onSubmit={async (input) => {
            if (!input.name.trim() || !input.organization.trim()) {
              showToast("予約者名と団体名を入力してください。");
              return;
            }

            try {
              if (editingUser) {
                const updated = await updateUser(editingUser.id, input);
                setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
                setEditingUser(null);
                showToast("ユーザーを更新しました。", "success");
                return;
              }

              const created = await createUser(input);
              setUsers((current) => [...current, created]);
              showToast("ユーザーを登録しました。", "success");
            } catch (error) {
              showToast(error instanceof Error ? error.message : "保存に失敗しました。");
            }
          }}
        />

        {loading ? (
          <div className="rounded-lg border border-line bg-white px-5 py-8 text-center text-sm font-semibold text-muted">読み込み中</div>
        ) : (
          <UserTable
            users={users}
            onDelete={async (user) => {
              try {
                await deleteUser(user.id);
                setUsers((current) => current.filter((item) => item.id !== user.id));
                showToast("ユーザーを削除しました。", "success");
              } catch (error) {
                showToast(error instanceof Error ? error.message : "削除に失敗しました。予約があるユーザーは削除できません。");
              }
            }}
            onEdit={setEditingUser}
          />
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
}
