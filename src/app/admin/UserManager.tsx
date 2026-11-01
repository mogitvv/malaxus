"use client";

import { useEffect, useState, type JSX } from "react";
import { UserIcon } from "@/components/icons/PixelIcons";
import { createClient } from "@/lib/supabase/client";

interface UserRow {
  id: string;
  email: string;
  ingame_name: string;
  is_banned: boolean;
  orderCount: number;
}

export function UserManager(): JSX.Element {
  const [supabase] = useState(() => createClient());
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: orders }] = await Promise.all([
        supabase.from("profiles").select("id, email, ingame_name, is_banned").order("ingame_name"),
        supabase.from("orders").select("user_id"),
      ]);
      if (!profiles) return;

      const counts = new Map<string, number>();
      for (const o of orders ?? []) {
        counts.set(o.user_id, (counts.get(o.user_id) ?? 0) + 1);
      }

      setUsers(
        profiles.map((p) => ({
          id: p.id,
          email: p.email,
          ingame_name: p.ingame_name,
          is_banned: p.is_banned,
          orderCount: counts.get(p.id) ?? 0,
        })),
      );
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function toggleBan(id: string) {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const next = !user.is_banned;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_banned: next } : u)));
    await supabase.from("profiles").update({ is_banned: next }).eq("id", id);
  }

  if (loading) return <p className="text-sm text-muted">Lade Benutzer…</p>;

  return (
    <div className="flex flex-col gap-2">
      {users.length === 0 && <p className="text-sm text-muted">Noch keine registrierten Spieler.</p>}
      {users.map((u) => (
        <div key={u.id} className="mc-panel p-3 flex flex-wrap items-center gap-3 text-sm">
          <UserIcon size={24} />
          <div className="flex-1 min-w-[160px]">
            <p className="font-semibold">{u.ingame_name}</p>
            <p className="text-[11px] text-muted">{u.email}</p>
          </div>
          <span className="text-[11px] text-muted">{u.orderCount} Bestellungen</span>
          {u.is_banned && <span className="text-[10px] text-red-500 font-semibold">Gesperrt</span>}
          <button
            type="button"
            className={`btn-mc text-[9px] px-2 ml-auto ${u.is_banned ? "" : "btn-mc-red"}`}
            onClick={() => toggleBan(u.id)}
          >
            {u.is_banned ? "Entsperren" : "Sperren"}
          </button>
        </div>
      ))}
    </div>
  );
}
