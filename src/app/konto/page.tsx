"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type JSX } from "react";
import { statusLabels, type OrderStatus } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { StatusTimeline } from "@/components/ui/StatusTimeline";
import { ClockIcon, DiamondIcon, NotebookIcon, UserIcon } from "@/components/icons/PixelIcons";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

const avatarColors = ["#ffd93d", "#42d6e0", "#4f9e3a", "#d2453f", "#3b6ec1", "#9a6fd4"];

interface OrderRow {
  id: string;
  status: OrderStatus;
  note: string | null;
  estimated_delivery: string | null;
  admin_message: string | null;
  total_diamonds: number;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number }[];
}

export default function AccountPage(): JSX.Element {
  const { role, ingameName, email, avatarColor, setAvatarColor, logout } = useAuth();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [pwSaved, setPwSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (role === "guest") return;

    let active = true;

    async function loadOrders() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("orders")
        .select("id, status, note, estimated_delivery, admin_message, total_diamonds, created_at, order_items(id, product_name, quantity)")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (active && data) {
        setOrders(data as unknown as OrderRow[]);
        setOrdersLoading(false);
      }
    }

    loadOrders();

    const channel = supabase
      .channel("my-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadOrders())
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [role, supabase]);

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

  async function cancelOrder(id: string) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)));
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwError(error.message);
      return;
    }
    setNewPassword("");
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2000);
  }

  async function handleLogout() {
    await logout();
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
            <h1 className="text-base">{ingameName}</h1>
            <p className="text-xs text-muted">{email}</p>
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
              Eigenes Bild hochladen kommt in einer späteren Version.
            </span>
          </div>
        )}
      </Panel>

      <Panel>
        <h2 className="text-sm mb-3">Passwort ändern</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-2 max-w-xs">
          <input
            type="password"
            placeholder="Neues Passwort"
            className="input-mc"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {pwError && <p className="text-xs text-red-500">{pwError}</p>}
          <Button variant="blue" type="submit" className="self-start mt-1">
            {pwSaved ? "Gespeichert ✓" : "Passwort speichern"}
          </Button>
        </form>
      </Panel>

      <div>
        <h2 className="text-base text-[var(--mc-gold-dark)] mb-3">Meine Bestellungen</h2>
        {ordersLoading && <p className="text-sm text-muted">Lade Bestellungen…</p>}
        {!ordersLoading && orders.length === 0 && (
          <p className="text-sm text-muted">Du hast noch keine Bestellungen aufgegeben.</p>
        )}
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Panel key={order.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted">
                  {new Date(order.created_at).toLocaleString("de-CH", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <DiamondIcon size={16} />
                  {order.total_diamonds}
                </span>
              </div>

              <ul className="text-sm list-disc list-inside">
                {order.order_items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product_name}
                  </li>
                ))}
              </ul>

              <StatusTimeline status={order.status} />

              {order.estimated_delivery && (
                <p className="text-xs flex items-center gap-1 text-muted">
                  <ClockIcon size={14} /> Geschätzte Lieferzeit: {order.estimated_delivery}
                </p>
              )}
              {order.admin_message && (
                <p className="text-xs flex items-center gap-1 text-muted">
                  <NotebookIcon size={14} /> {order.admin_message}
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
