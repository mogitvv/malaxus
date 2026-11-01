"use client";

import { useState, type JSX } from "react";
import type { ProductRequest } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { DiamondIcon } from "@/components/icons/PixelIcons";
import { createClient } from "@/lib/supabase/client";

export function RequestManager({
  requests,
  onChange,
}: {
  requests: ProductRequest[];
  onChange: (requests: ProductRequest[]) => void;
}): JSX.Element {
  const [supabase] = useState(() => createClient());
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [addToStock, setAddToStock] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const open = requests.filter((r) => r.status === "open");
  const done = requests.filter((r) => r.status !== "open");

  async function fulfill(request: ProductRequest) {
    const price = prices[request.id];
    if (!price || price <= 0) return;
    setBusyId(request.id);

    let productId: string | null = null;
    if (addToStock[request.id]) {
      const { data: product } = await supabase
        .from("products")
        .insert({
          name: request.itemName,
          description: "",
          price_diamonds: price,
          unit: "Stück",
          amount: 1,
          type: "stock",
          stock_quantity: request.quantity,
          low_stock_threshold: 1,
        })
        .select()
        .single();
      productId = product?.id ?? null;
    }

    const { data: order } = await supabase
      .from("orders")
      .insert({
        user_id: request.userId,
        total_diamonds: price * request.quantity,
        status: "accepted",
        admin_message: "Dein angefordertes Produkt ist jetzt verfügbar – schau in deinem Konto nach!",
      })
      .select()
      .single();

    if (order) {
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: productId,
        product_name: request.itemName,
        quantity: request.quantity,
        unit_price_diamonds: price,
      });

      await supabase
        .from("product_requests")
        .update({ status: "fulfilled", price_diamonds: price, order_id: order.id })
        .eq("id", request.id);

      onChange(
        requests.map((r) =>
          r.id === request.id ? { ...r, status: "fulfilled", priceDiamonds: price, orderId: order.id } : r,
        ),
      );
    }
    setBusyId(null);
  }

  async function reject(id: string) {
    setBusyId(id);
    await supabase.from("product_requests").update({ status: "rejected" }).eq("id", id);
    onChange(requests.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
    setBusyId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Offene Anfragen ({open.length})</h3>
        {open.length === 0 && <p className="text-sm text-muted">Keine offenen Produktanfragen.</p>}
        {open.map((r) => (
          <div key={r.id} className="mc-panel p-3 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex-1 min-w-[160px]">
              <p className="font-semibold">
                {r.quantity}× {r.itemName}
              </p>
              <p className="text-[11px] text-muted">
                von {r.ingameName} ·{" "}
                {new Date(r.createdAt).toLocaleString("de-CH", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              {r.note && <p className="text-[11px] text-muted mt-1">„{r.note}“</p>}
            </div>
            <label className="flex items-center gap-1 text-[11px]">
              <DiamondIcon size={14} />
              <input
                type="number"
                min={1}
                className="input-mc w-20 text-center"
                placeholder="Preis"
                value={prices[r.id] ?? ""}
                onChange={(e) => setPrices((p) => ({ ...p, [r.id]: Number(e.target.value) }))}
              />
            </label>
            <label className="flex items-center gap-1 text-[10px] text-muted">
              <input
                type="checkbox"
                checked={addToStock[r.id] ?? false}
                onChange={(e) => setAddToStock((p) => ({ ...p, [r.id]: e.target.checked }))}
              />
              dauerhaft in den Shop
            </label>
            <Button variant="green" onClick={() => fulfill(r)} disabled={busyId === r.id || !prices[r.id]}>
              Preis festlegen & bestellen
            </Button>
            <button
              type="button"
              className="btn-mc btn-mc-red text-[9px] px-2"
              onClick={() => reject(r.id)}
              disabled={busyId === r.id}
            >
              Ablehnen
            </button>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted">Erledigt</h3>
          {done.map((r) => (
            <div key={r.id} className="mc-panel p-2 flex flex-wrap items-center gap-3 text-xs opacity-70">
              <span className="flex-1">
                {r.quantity}× {r.itemName} ({r.ingameName})
              </span>
              <span className={r.status === "fulfilled" ? "text-[var(--mc-green-dark)]" : "text-red-500"}>
                {r.status === "fulfilled" ? "Erfüllt" : "Abgelehnt"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
