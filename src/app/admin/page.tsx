"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import type { Category, Order, OrderStatus, Product, ProductRequest } from "@/lib/types";
import { statusLabels } from "@/lib/types";
import { mapOrder } from "@/lib/orders";
import { mapCategory, mapProduct } from "@/lib/products";
import { mapProductRequest } from "@/lib/requests";
import { Panel } from "@/components/ui/Panel";
import { OrderBoard } from "./OrderBoard";
import { ProductManager } from "./ProductManager";
import { UserManager } from "./UserManager";
import { PaymentManager } from "./PaymentManager";
import { RequestManager } from "./RequestManager";
import { BellIcon, ChestIcon, AnvilIcon, MinecartIcon, CheckIcon, XMarkIcon } from "@/components/icons/PixelIcons";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

type Tab = "bestellungen" | "produkte" | "zahlung" | "benutzer" | "anforderungen";

const ORDER_SELECT = "*, order_items(*), profiles(ingame_name)";
const REQUEST_SELECT = "*, profiles(ingame_name)";

export default function AdminPage(): JSX.Element {
  const { role } = useAuth();
  const [supabase] = useState(() => createClient());
  const [tab, setTab] = useState<Tab>("bestellungen");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newBadge, setNewBadge] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const knownOrderIds = useRef<Set<string>>(new Set());

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const playBeep = useCallback(() => {
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
  }, [soundEnabled]);

  const loadOrders = useCallback(async () => {
    const { data } = await supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false });
    if (!data) return;
    const mapped = data.map(mapOrder);

    // Neue Bestellungen seit dem letzten Laden erkennen (für Glocke/Sound/Toast).
    if (knownOrderIds.current.size > 0) {
      const fresh = mapped.filter((o) => !knownOrderIds.current.has(o.id));
      if (fresh.length > 0) {
        setNewBadge((n) => n + fresh.length);
        setToast(`Neue Bestellung von ${fresh[0].ingameName}!`);
        playBeep();
        setTimeout(() => setToast(null), 4000);
      }
    }
    knownOrderIds.current = new Set(mapped.map((o) => o.id));

    setOrders(mapped);
    setLastUpdated(new Date());
  }, [supabase, playBeep]);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("name");
    if (data) setProducts(data.map(mapProduct));
  }, [supabase]);

  const loadRequests = useCallback(async () => {
    const { data } = await supabase.from("product_requests").select(REQUEST_SELECT).order("created_at", { ascending: false });
    if (data) setRequests(data.map(mapProductRequest));
  }, [supabase]);

  useEffect(() => {
    if (role !== "admin") return;

    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => data && setCategories(data.map(mapCategory)));
    loadProducts();
    loadOrders();
    loadRequests();

    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadOrders())
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => loadOrders())
      .on("postgres_changes", { event: "*", schema: "public", table: "product_requests" }, () => loadRequests())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, supabase, loadOrders, loadProducts, loadRequests]);

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

  async function persistOrder(next: Order) {
    setOrders((prev) => prev.map((o) => (o.id === next.id ? next : o)));
    await supabase
      .from("orders")
      .update({
        status: next.status,
        estimated_delivery: next.estimatedDelivery ?? null,
        admin_message: next.adminMessage ?? null,
        paid: next.paid,
        reminder_sent_at: next.reminderSentAt ?? null,
      })
      .eq("id", next.id);
  }

  function handleRefresh() {
    setRefreshing(true);
    loadOrders().finally(() => setRefreshing(false));
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

  const openRequestCount = useMemo(() => requests.filter((r) => r.status === "open").length, [requests]);

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "bestellungen", label: "Bestellungen" },
    { key: "produkte", label: "Produkte" },
    { key: "zahlung", label: "Zahlung", badge: unpaidCount },
    { key: "anforderungen", label: "Anforderungen", badge: openRequestCount },
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
          <span className="text-[10px] text-muted hidden sm:inline">
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
            <span className="text-[9px] text-center text-muted leading-tight">{tile.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded w-fit" style={{ background: "var(--mc-subtle)" }}>
        {tabs.map(({ key, label, badge }) => (
          <button
            key={key}
            className={`font-pixel text-[10px] px-4 py-2 rounded transition-colors relative ${
              tab === key ? "bg-[var(--mc-gold-dark)] text-white shadow" : "text-muted hover:text-[var(--mc-text)]"
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
          onChange={persistOrder}
          view={view}
          setView={setView}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      )}
      {tab === "produkte" && <ProductManager products={products} categories={categories} onChange={setProducts} />}
      {tab === "zahlung" && <PaymentManager orders={orders} onChange={persistOrder} />}
      {tab === "anforderungen" && <RequestManager requests={requests} onChange={setRequests} />}
      {tab === "benutzer" && <UserManager />}
    </div>
  );
}
