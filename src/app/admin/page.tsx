"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { categories as initialCategories, mockOrders, mockUsers, products as initialProducts } from "@/lib/mock-data";
import type { Order, OrderStatus } from "@/lib/types";
import { statusLabels } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";
import { OrderBoard } from "./OrderBoard";
import { ProductManager } from "./ProductManager";
import { UserManager } from "./UserManager";
import { PaymentManager } from "./PaymentManager";
import { BellIcon, ChestIcon, AnvilIcon, MinecartIcon, CheckIcon, XMarkIcon } from "@/components/icons/PixelIcons";
import { useAuth } from "@/lib/auth-context";

type Tab = "bestellungen" | "produkte" | "zahlung" | "benutzer";

const demoNames = ["Creepy4Life", "RedstoneRex", "PixelPaula", "Blocky_Ben"];
const AUTO_REFRESH_MS = 3000;

export default function AdminPage(): JSX.Element {
  const { role } = useAuth();
  const [tab, setTab] = useState<Tab>("bestellungen");
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [products, setProducts] = useState(initialProducts);
  const [users, setUsers] = useState(mockUsers);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newBadge, setNewBadge] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const counts = useMemo(() => {
    const base: Record<OrderStatus, number> = {
      received: 0,
      accepted: 0,
      processing: 0,
      ready: 0,
      delivered: 0,
      rejected: 0,
      cancelled: 0,
    };
    for (const o of orders) base[o.status]++;
    return base;
  }, [orders]);

  const unpaidCount = useMemo(
    () => orders.filter((o) => !o.paid && o.status !== "rejected" && o.status !== "cancelled").length,
    [orders],
  );

  // Simuliert live Daten, bis echtes Polling/Realtime via Supabase angebunden ist.
  useEffect(() => {
    setLastUpdated(new Date());
    const interval = setInterval(() => {
      setRefreshing(true);
      setLastUpdated(new Date());
      setTimeout(() => setRefreshing(false), 400);
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  if (role !== "admin") {
    return (
      <Panel className="max-w-sm mx-auto text-center flex flex-col gap-3">
        <p className="text-sm">Dieser Bereich ist nur für Admin-Konten.</p>
        <Link href="/login" className="btn-mc btn-mc-blue self-center">
          Als Admin einloggen
        </Link>
      </Panel>
    );
  }

  function updateOrder(next: Order) {
    setOrders((prev) => prev.map((o) => (o.id === next.id ? next : o)));
  }

  function playBeep() {
    if (!soundEnabled) return;
    try {
      const ctx = audioCtxRef.current ?? new AudioContext();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.05;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio evtl. vom Browser blockiert – kein Problem, Toast reicht dann.
    }
  }

  function simulateNewOrder() {
    const name = demoNames[Math.floor(Math.random() * demoNames.length)];
    const order: Order = {
      id: `o-sim-${Date.now()}`,
      ingameName: name,
      items: [{ productId: "p-redstonestaub", name: "Redstone-Staub", quantity: 1, unitPriceDiamonds: 2 }],
      totalDiamonds: 2,
      status: "received",
      paid: false,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    setNewBadge((n) => n + 1);
    setToast(`Neue Bestellung von ${name}!`);
    playBeep();
    setTimeout(() => setToast(null), 4000);
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 500);
  }

  function focusStatus(status: OrderStatus | "all") {
    setStatusFilter(status);
    setView("list");
    setTab("bestellungen");
  }

  const statTiles: { status: OrderStatus | "all"; label: string; icon: JSX.Element; count: number }[] = [
    { status: "received", label: statusLabels.received, icon: <ChestIcon size={20} />, count: counts.received },
    { status: "accepted", label: statusLabels.accepted, icon: <ChestIcon size={20} />, count: counts.accepted },
    { status: "processing", label: statusLabels.processing, icon: <AnvilIcon size={20} />, count: counts.processing },
    { status: "ready", label: statusLabels.ready, icon: <MinecartIcon size={20} />, count: counts.ready },
    { status: "delivered", label: statusLabels.delivered, icon: <CheckIcon size={20} />, count: counts.delivered },
    {
      status: "rejected",
      label: "Abgelehnt/Storniert",
      icon: <XMarkIcon size={20} />,
      count: counts.rejected + counts.cancelled,
    },
  ];

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "bestellungen", label: "Bestellungen" },
    { key: "produkte", label: "Produkte" },
    { key: "zahlung", label: "Zahlung", badge: unpaidCount },
    { key: "benutzer", label: "Benutzer" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="fixed top-20 right-4 z-40 mc-panel-dark px-4 py-3 flex items-center gap-2 mc-fade-in">
          <BellIcon size={22} className="mc-pulse" />
          <span className="text-sm">{toast}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg text-[var(--mc-gold-dark)]">Admin-Board</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-mc text-[10px] flex items-center gap-1"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <span className={refreshing ? "inline-block animate-spin" : ""}>⟳</span>
            Aktualisieren
          </button>
          <span className="text-[10px] text-[var(--mc-text-muted)] hidden sm:inline">
            Stand: {lastUpdated ? lastUpdated.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "–"}
          </span>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
            Sound
          </label>
          <button
            type="button"
            className="btn-mc relative px-2 py-2"
            onClick={() => setNewBadge(0)}
            aria-label="Benachrichtigungen"
          >
            <BellIcon size={18} />
            {newBadge > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--mc-red)] text-white text-[9px] font-pixel w-5 h-5 flex items-center justify-center rounded-full border border-black mc-pulse">
                {newBadge}
              </span>
            )}
          </button>
          <button type="button" className="btn-mc btn-mc-blue text-[10px]" onClick={simulateNewOrder}>
            Test-Bestellung simulieren
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {statTiles.map((tile) => (
          <button
            key={tile.status}
            onClick={() => focusStatus(tile.status)}
            className="mc-panel p-3 flex flex-col items-center gap-1 hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            {tile.icon}
            <span className="text-xl font-bold leading-none">{tile.count}</span>
            <span className="text-[9px] text-center text-[var(--mc-text-muted)] leading-tight">{tile.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded w-fit" style={{ background: "var(--mc-subtle)" }}>
        {tabs.map(({ key, label, badge }) => (
          <button
            key={key}
            className={`font-pixel text-[10px] px-4 py-2 rounded transition-colors relative ${
              tab === key ? "bg-[var(--mc-gold-dark)] text-white shadow" : "text-[var(--mc-text-muted)] hover:text-[var(--mc-text)]"
            }`}
            onClick={() => setTab(key)}
          >
            {label}
            {!!badge && (
              <span className="absolute -top-1.5 -right-1.5 bg-[var(--mc-red)] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-black">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "bestellungen" && (
        <OrderBoard
          orders={orders}
          onChange={updateOrder}
          view={view}
          setView={setView}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      )}
      {tab === "produkte" && (
        <ProductManager products={products} categories={initialCategories} onChange={setProducts} />
      )}
      {tab === "zahlung" && <PaymentManager orders={orders} onChange={updateOrder} />}
      {tab === "benutzer" && <UserManager users={users} onChange={setUsers} />}
    </div>
  );
}
