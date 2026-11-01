"use client";

import type { JSX } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { statusLabels } from "@/lib/types";
import { OrderCard } from "./OrderCard";

/** Nur der aktive Bestell-Fluss bekommt eine Kanban-Spalte – Abgelehnt/Storniert
 * sind über die Übersichts-Kacheln + Listenansicht erreichbar, damit die Spalten
 * nicht breiter werden als der Bildschirm. */
const kanbanColumns: OrderStatus[] = ["received", "accepted", "processing", "ready", "delivered"];
const allStatuses: OrderStatus[] = [...kanbanColumns, "rejected", "cancelled"];

const columnAccent: Record<OrderStatus, string> = {
  received: "#3b6ec1",
  accepted: "#4f9e3a",
  processing: "#c99a1a",
  ready: "#1fa8b8",
  delivered: "#2f6b20",
  rejected: "#d2453f",
  cancelled: "#767c88",
};

export function OrderBoard({
  orders,
  onChange,
  view,
  setView,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: {
  orders: Order[];
  onChange: (order: Order) => void;
  view: "kanban" | "list";
  setView: (v: "kanban" | "list") => void;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: OrderStatus | "all";
  setStatusFilter: (v: OrderStatus | "all") => void;
}): JSX.Element {
  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search && !o.ingameName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex p-1 rounded" style={{ background: "var(--mc-subtle)" }}>
          <button
            className={`text-[10px] font-pixel px-3 py-2 rounded ${view === "kanban" ? "bg-[var(--mc-blue)] text-white" : "text-[var(--mc-text-muted)]"}`}
            onClick={() => setView("kanban")}
          >
            Kanban
          </button>
          <button
            className={`text-[10px] font-pixel px-3 py-2 rounded ${view === "list" ? "bg-[var(--mc-blue)] text-white" : "text-[var(--mc-text-muted)]"}`}
            onClick={() => setView("list")}
          >
            Liste
          </button>
        </div>
        <input
          className="input-mc text-xs max-w-[160px]"
          placeholder="Ingame-Name suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-mc text-xs max-w-[180px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
        >
          <option value="all">Alle Status</option>
          {allStatuses.map((c) => (
            <option key={c} value={c}>
              {statusLabels[c]}
            </option>
          ))}
        </select>
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {kanbanColumns.map((status) => {
            const columnOrders = orders.filter((o) => o.status === status);
            return (
              <div key={status} className="mc-panel-dark p-2 flex flex-col gap-2">
                <h3
                  className="font-pixel text-[10px] text-center py-2 rounded-t"
                  style={{ background: columnAccent[status], color: "#111" }}
                >
                  {statusLabels[status]} ({columnOrders.length})
                </h3>
                <div className="flex flex-col gap-2 min-h-[40px] max-h-[70vh] overflow-y-auto pr-1">
                  {columnOrders.length === 0 && (
                    <p className="text-[11px] text-white/40 text-center py-4">Keine Bestellungen</p>
                  )}
                  {columnOrders.map((o) => (
                    <OrderCard key={o.id} order={o} onChange={onChange} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && <p className="text-sm text-[var(--mc-text-muted)]">Keine Bestellungen gefunden.</p>}
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}
