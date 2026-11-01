"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type JSX } from "react";
import { mockOrders } from "@/lib/mock-data";
import { statusLabels } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { StatusTimeline } from "@/components/ui/StatusTimeline";
import { ClockIcon, DiamondIcon, NotebookIcon, UserIcon } from "@/components/icons/PixelIcons";
import { useAuth } from "@/lib/auth-context";

const FALLBACK_INGAME_NAME = "Mogi";
const avatarColors = ["#ffd93d", "#42d6e0", "#4f9e3a", "#d2453f", "#3b6ec1", "#9a6fd4"];

export default function AccountPage(): JSX.Element {
  const { role, ingameName, logout } = useAuth();
  const router = useRouter();
  const name = ingameName ?? FALLBACK_INGAME_NAME;
  const [orders, setOrders] = useState(mockOrders.filter((o) => o.ingameName === name));
  const [pwSaved, setPwSaved] = useState(false);
  const [avatarColor, setAvatarColor] = useState(avatarColors[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (role === "guest") {
    return (
      <Panel className="max-w-sm mx-auto text-center flex flex-col gap-3">
        <p className="text-sm">Du musst eingeloggt sein, um dein Konto zu sehen.</p>
        <Link href="/login" className="btn-mc btn-mc-blue self-center">
          Zum Login
        </Link>
      </Panel>
    );
  }

  function cancelOrder(id: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as const } : o)));
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    // Demo: hier kommt später das echte Ändern des Passworts gegen die Datenbank.
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2000);
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex justify-end">
        <Button variant="red" onClick={handleLogout}>
          Ausloggen
        </Button>
      </div>

      <Panel className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowAvatarPicker((v) => !v)}
            className="w-14 h-14 flex items-center justify-center border-2 border-[var(--mc-gold-dark)] shrink-0"
            style={{ background: avatarColor }}
            aria-label="Profilbild ändern"
          >
            <UserIcon size={36} />
          </button>
          <div className="flex-1">
            <h1 className="text-base">{name}</h1>
            <p className="text-xs text-muted">{name.toLowerCase()}@example.com</p>
          </div>
          {role === "admin" && <span className="btn-mc btn-mc-gold text-[9px]">Admin</span>}
        </div>

        {showAvatarPicker && (
          <div className="p-2 rounded flex items-center gap-2 flex-wrap" style={{ background: "var(--mc-subtle)" }}>
            <span className="text-[11px] text-muted">Profilfarbe wählen:</span>
            {avatarColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                className="w-6 h-6 border-2"
                style={{ background: c, borderColor: avatarColor === c ? "var(--mc-text)" : "transparent" }}
                aria-label={`Farbe ${c}`}
              />
            ))}
            <span className="text-[10px] text-muted ml-2">
              Eigenes Bild hochladen kommt, sobald Supabase Storage angebunden ist.
            </span>
          </div>
        )}
      </Panel>

      <Panel>
        <h2 className="text-sm mb-3">Passwort ändern</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-2 max-w-xs">
          <input type="password" placeholder="Aktuelles Passwort" className="input-mc" required />
          <input type="password" placeholder="Neues Passwort" className="input-mc" required minLength={8} />
          <Button variant="blue" type="submit" className="self-start mt-1">
            {pwSaved ? "Gespeichert ✓" : "Passwort speichern"}
          </Button>
        </form>
      </Panel>

      <div>
        <h2 className="text-base text-[var(--mc-gold-dark)] mb-3">Meine Bestellungen</h2>
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Panel key={order.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted">
                  {new Date(order.createdAt).toLocaleString("de-CH", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <DiamondIcon size={16} />
                  {order.totalDiamonds}
                </span>
              </div>

              <ul className="text-sm list-disc list-inside">
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.quantity}× {item.name}
                  </li>
                ))}
              </ul>

              <StatusTimeline status={order.status} />

              {order.estimatedDelivery && (
                <p className="text-xs flex items-center gap-1 text-muted">
                  <ClockIcon size={14} /> Geschätzte Lieferzeit: {order.estimatedDelivery}
                </p>
              )}
              {order.adminMessage && (
                <p className="text-xs flex items-center gap-1 text-muted">
                  <NotebookIcon size={14} /> {order.adminMessage}
                </p>
              )}

              {order.status === "received" && (
                <Button variant="red" className="self-start" onClick={() => cancelOrder(order.id)}>
                  Bestellung stornieren
                </Button>
              )}
              {order.status === "cancelled" && (
                <p className="text-xs text-red-500 font-semibold">{statusLabels.cancelled}</p>
              )}
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
