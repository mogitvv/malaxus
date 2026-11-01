"use client";

import { useState, type JSX } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { DiamondIcon, NotebookIcon } from "@/components/icons/PixelIcons";
import { formatRelativeTime } from "@/lib/format";

const quickEstimates = ["ca. 1 Stunde", "heute", "morgen", "2 bis 3 Tage"];

const statusAccent: Record<OrderStatus, string> = {
  received: "#3b6ec1",
  accepted: "#4f9e3a",
  processing: "#c99a1a",
  ready: "#1fa8b8",
  delivered: "#2f6b20",
  rejected: "#d2453f",
  cancelled: "#767c88",
};

export function OrderCard({
  order,
  onChange,
}: {
  order: Order;
  onChange: (next: Order) => void;
}): JSX.Element {
  const [editing, setEditing] = useState<"accept" | "reject" | null>(null);
  const [estimate, setEstimate] = useState(order.estimatedDelivery ?? quickEstimates[0]);
  const [message, setMessage] = useState(order.adminMessage ?? "");

  function setStatus(status: OrderStatus, extra: Partial<Order> = {}) {
    onChange({ ...order, status, ...extra });
    setEditing(null);
  }

  return (
    <div
      className="mc-panel p-3 flex flex-col gap-2 text-sm border-l-[6px]"
      style={{ borderLeftColor: statusAccent[order.status] }}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{order.ingameName}</span>
        <span className="text-[10px] text-muted" title={new Date(order.createdAt).toLocaleString("de-CH")}>
          {formatRelativeTime(order.createdAt)}
        </span>
      </div>

      <ul className="text-xs list-disc list-inside">
        {order.items.map((item) => (
          <li key={item.productId}>
            {item.quantity}× {item.name}
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="text-xs flex items-start gap-1 p-1.5 rounded" style={{ background: "var(--mc-subtle)" }}>
          <NotebookIcon size={14} />
          <span>{order.note}</span>
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 font-semibold">
          <DiamondIcon size={14} />
          {order.totalDiamonds}
        </span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded"
          style={{
            background: order.paid ? "#4f9e3a22" : "#d2453f22",
            color: order.paid ? "#2f6b20" : "#8f251f",
          }}
        >
          {order.paid ? "Bezahlt" : "Offen"}
        </span>
      </div>

      {order.estimatedDelivery && order.status !== "received" && (
        <p className="text-[11px] text-muted">Lieferzeit: {order.estimatedDelivery}</p>
      )}
      {order.adminMessage && order.status !== "received" && (
        <p className="text-[11px] text-muted">Notiz an Kunde: {order.adminMessage}</p>
      )}

      {editing === "accept" && (
        <div className="p-2 rounded flex flex-col gap-2" style={{ background: "var(--mc-subtle)" }}>
          <div className="flex flex-wrap gap-1">
            {quickEstimates.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEstimate(e)}
                className={`btn-mc text-[9px] px-2 py-1 ${estimate === e ? "btn-mc-blue" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            className="input-mc text-xs"
            placeholder="eigene Angabe…"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
          />
          <textarea
            className="input-mc text-xs"
            placeholder="Nachricht an Kunde (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="green" onClick={() => setStatus("accepted", { estimatedDelivery: estimate, adminMessage: message })}>
            Bestätigen
          </Button>
        </div>
      )}

      {editing === "reject" && (
        <div className="p-2 rounded flex flex-col gap-2" style={{ background: "var(--mc-subtle)" }}>
          <textarea
            className="input-mc text-xs"
            placeholder="Grund für Ablehnung (optional, für Kunde sichtbar)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="red" onClick={() => setStatus("rejected", { adminMessage: message })}>
            Ablehnung bestätigen
          </Button>
        </div>
      )}

      {editing === null && (
        <div className="flex flex-wrap gap-1">
          {order.status === "received" && (
            <>
              <Button variant="green" onClick={() => setEditing("accept")}>
                Annehmen
              </Button>
              <Button variant="red" onClick={() => setEditing("reject")}>
                Ablehnen
              </Button>
            </>
          )}
          {order.status === "accepted" && (
            <Button variant="gold" onClick={() => setStatus("processing")}>
              In Bearbeitung
            </Button>
          )}
          {order.status === "processing" && (
            <Button variant="blue" onClick={() => setStatus("ready")}>
              Bereit zur Lieferung
            </Button>
          )}
          {order.status === "ready" && (
            <Button variant="green" onClick={() => setStatus("delivered")}>
              Geliefert
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
