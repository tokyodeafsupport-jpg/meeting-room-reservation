"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/database";

type UserTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => Promise<void>;
};

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-[#eef3f7]">
          <tr>
            <th className="w-20 px-4 py-3 text-left">色</th>
            <th className="px-4 py-3 text-left">予約者名</th>
            <th className="px-4 py-3 text-left">団体名</th>
            <th className="px-4 py-3 text-left">登録日時</th>
            <th className="w-32 px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr className="border-t border-line" key={user.id}>
              <td className="px-4 py-3">
                <span className="block h-6 w-10 rounded border border-black/10" style={{ backgroundColor: user.color }} />
              </td>
              <td className="px-4 py-3 font-semibold">{user.name}</td>
              <td className="px-4 py-3">{user.organization}</td>
              <td className="px-4 py-3 text-muted">{new Date(user.created_at).toLocaleString("ja-JP")}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button aria-label="編集" className="h-8 w-8 px-0" onClick={() => onEdit(user)}>
                    <Pencil size={15} />
                  </Button>
                  <Button
                    aria-label="削除"
                    className="h-8 w-8 px-0"
                    onClick={async () => {
                      if (window.confirm(`${user.name} / ${user.organization} を削除しますか？`)) {
                        await onDelete(user);
                      }
                    }}
                    variant="danger"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-muted" colSpan={5}>
                登録済みの予約者・団体はありません。
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
