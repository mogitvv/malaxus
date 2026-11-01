"use client";

import { useState, type JSX } from "react";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { DiamondIcon } from "@/components/icons/PixelIcons";
import { formatRelativeTime } from "@/lib/format";

export function PaymentManager({
  orders,
  onChange,
}: {
  orders: Order[];
  onChange: (order: Order) => void;
}): JSX.Element {
  const [confirmations, setConfirmations] = useState<Record<string, string>>({});

  const unpaid = orders.filter(
    (o) => !o.paid && o.status !== "rejected" && o.status !== "cancelled",
  );

  function markPaid(order: Order) {
    onChange({ ...order, paid: true });
  }

  function sendReminder(order: Order) {
    onChange({ ...order, reminderSentAt: new Date().toISOString() });
    setConfirmations((prev) => ({ ...prev, [order.id]: "Erinnerung vermerkt – Versand per E-Mail folgt später" }));
    setTimeout(() => setConfirmations((prev) => ({ ...prev, [order.id]: "" })), 3000);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--mc-text-muted)]">
        Alle Bestellungen, bei denen die Diamanten noch nicht eingegangen sind. Kunden mit einer offenen
        Zahlung können erst wieder bestellen, sobald sie als bezahlt markiert sind.
      </p>

      {unpaid.length === 0 && (
        <p className="mc-panel p-4 text-sm text-center">Keine offenen Zahlungen 🎉</p>
      )}

      <div className="flex flex-col gap-2">
        {unpaid.map((order) => (
          <div key={order.id} className="mc-panel p-3 flex flex-wrap items-center gap-3 text-sm border-l-[6px] border-[var(--mc-red)]">
            <div className="flex-1 min-w-[160px]">
              <p className="font-semibold">{order.ingameName}</p>
              <p className="text-[11px] text-[var(--mc-text-muted)]">
                {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
              </p>
              <p className="text-[10px] text-[var(--mc-text-muted)]">
                Bestellt {formatRelativeTime(order.createdAt)}
                {order.reminderSentAt && ` · Erinnerung ${formatRelativeTime(order.reminderSentAt)} gesendet`}
              </p>
            </div>
            <span className="flex items-center gap-1 font-semibold">
              <DiamondIcon size={16} />
              {order.totalDiamonds}
            </span>
            <Button variant="gold" onClick={() => sendReminder(order)}>
              Zahlungserinnerung senden
            </Button>
            <Button variant="green" onClick={() => markPaid(order)}>
              Zahlung erhalten
            </Button>
            {confirmations[order.id] && (
              <span className="text-[11px] text-[var(--mc-green-dark)] font-semibold w-full">{confirmations[order.id]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
