"use client";

import type { JSX } from "react";
import type { MockUser } from "@/lib/mock-data";
import { UserIcon } from "@/components/icons/PixelIcons";

export function UserManager({
  users,
  onChange,
}: {
  users: MockUser[];
  onChange: (users: MockUser[]) => void;
}): JSX.Element {
  function toggleBan(id: string) {
    onChange(users.map((u) => (u.id === id ? { ...u, isBanned: !u.isBanned } : u)));
  }

  return (
    <div className="flex flex-col gap-2">
      {users.map((u) => (
        <div key={u.id} className="mc-panel p-3 flex flex-wrap items-center gap-3 text-sm">
          <UserIcon size={24} />
          <div className="flex-1 min-w-[160px]">
            <p className="font-semibold">{u.ingameName}</p>
            <p className="text-[11px] text-muted">{u.email}</p>
          </div>
          <span className="text-[11px] text-muted">{u.orderCount} Bestellungen</span>
          {u.isBanned && <span className="text-[10px] text-red-500 font-semibold">Gesperrt</span>}
          <button
            type="button"
            className={`btn-mc text-[9px] px-2 ml-auto ${u.isBanned ? "" : "btn-mc-red"}`}
            onClick={() => toggleBan(u.id)}
          >
            {u.isBanned ? "Entsperren" : "Sperren"}
          </button>
        </div>
      ))}
    </div>
  );
}
