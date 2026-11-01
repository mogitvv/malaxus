"use client";

import Link from "next/link";
import { useEffect, useState, type JSX } from "react";
import { useCart } from "@/lib/cart-context";
import { unitLabels } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { InventorySlot } from "@/components/ui/InventorySlot";
import { ProductIcon } from "@/components/icons/ProductIcon";
import { DiamondIcon, NotebookIcon } from "@/components/icons/PixelIcons";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

export default function CartPage(): JSX.Element {
  const { items, note, setNote, updateQuantity, removeItem, clear, totalDiamonds } = useCart();
  const { role } = useAuth();
  const [supabase] = useState(() => createClient());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openPaymentAmount, setOpenPaymentAmount] = useState<number | null>(null);

  useEffect(() => {
    if (role === "guest") return;
    let active = true;

    async function checkOpenPayment() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("orders")
        .select("total_diamonds")
        .eq("user_id", userData.user.id)
        .eq("paid", false)
        .not("status", "in", "(rejected,cancelled)")
        .limit(1)
        .maybeSingle();
      if (active) setOpenPaymentAmount(data?.total_diamonds ?? null);
    }

    checkOpenPayment();
    return () => {
      active = false;
    };
  }, [role, supabase]);

  async function handleSubmit() {
    if (openPaymentAmount !== null || role === "guest") return;
    setSubmitting(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Bitte erst einloggen.");
      setSubmitting(false);
      return;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: userData.user.id, note: note || null, total_diamonds: totalDiamonds })
      .select()
      .single();

    if (orderError || !order) {
      setError(orderError?.message ?? "Bestellung konnte nicht aufgegeben werden.");
      setSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price_diamonds: item.unitPriceDiamonds,
      })),
    );

    setSubmitting(false);

    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    setSubmitted(true);
    clear();
  }

  if (submitted) {
    return (
      <div className="mc-panel p-8 max-w-md mx-auto text-center flex flex-col gap-3">
        <h1 className="text-base text-[var(--mc-green-dark)]">Bestellung aufgegeben!</h1>
        <p className="text-sm text-muted">
          Deine Bestellung ist eingegangen. Sobald sie bestätigt wird, siehst du den Status in deinem Konto.
        </p>
        <Link href="/konto" className="btn-mc btn-mc-blue self-center">
          Zu meinen Bestellungen
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mc-panel p-8 max-w-md mx-auto text-center flex flex-col gap-3">
        <h1 className="text-base">Dein Warenkorb ist leer</h1>
        <Link href="/" className="btn-mc btn-mc-blue self-center">
          Weiter stöbern
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <h1 className="text-lg text-[var(--mc-gold)]">Warenkorb</h1>

      <div className="mc-panel p-3 flex flex-col gap-2">
        {items.map((item) => {
          const subtotal = item.unitPriceDiamonds * item.quantity;
          return (
            <div
              key={item.productId}
              className="flex items-center gap-3 border-b pb-2 last:border-0"
              style={{ borderColor: "var(--mc-subtle-strong)" }}
            >
              <InventorySlot size={48}>
                <ProductIcon name={item.name} size={28} />
              </InventorySlot>
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-[11px] text-muted">
                  {item.unitPriceDiamonds} ◆ pro {unitLabels[item.unit]}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="btn-mc px-2 py-1 text-[10px]"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  className="btn-mc px-2 py-1 text-[10px]"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <span className="flex items-center gap-1 w-14 justify-end text-sm font-semibold">
                <DiamondIcon size={14} />
                {subtotal}
              </span>
              <button
                type="button"
                className="text-[11px] text-red-600 underline ml-2"
                onClick={() => removeItem(item.productId)}
              >
                Entfernen
              </button>
            </div>
          );
        })}
      </div>

      <div className="mc-panel p-3 flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <NotebookIcon size={18} />
          Notiz für uns (z. B. Lieferkoordinaten, Wünsche, wann du online bist)
        </label>
        <textarea
          className="input-mc min-h-[80px]"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="z. B. Koordinaten 120 70 -340, bin ab 19 Uhr online"
        />
      </div>

      <div className="mc-panel-dark p-4 flex items-center justify-between">
        <span className="font-pixel text-sm">Gesamt</span>
        <span className="flex items-center gap-2 text-lg font-semibold text-[var(--mc-diamond)]">
          <DiamondIcon size={20} />
          {totalDiamonds}
        </span>
      </div>

      {role === "guest" && (
        <div className="mc-panel p-3 border-l-[6px] border-[var(--mc-blue)] text-sm flex flex-col gap-2">
          <p>Du musst eingeloggt sein, um eine Bestellung aufzugeben.</p>
          <Link href="/login" className="btn-mc btn-mc-blue self-start">
            Zum Login
          </Link>
        </div>
      )}

      {openPaymentAmount !== null && (
        <div className="mc-panel p-3 border-l-[6px] border-[var(--mc-red)] text-sm flex flex-col gap-2">
          <p>
            Du hast noch eine offene Zahlung ({openPaymentAmount} ◆) für eine frühere Bestellung. Bitte zuerst
            bezahlen, bevor du eine neue Bestellung aufgibst.
          </p>
          <Link href="/konto" className="btn-mc btn-mc-blue self-start">
            Zu meinen Bestellungen
          </Link>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button variant="green" onClick={handleSubmit} disabled={openPaymentAmount !== null || role === "guest" || submitting}>
        {submitting ? "Wird aufgegeben…" : "Bestellung aufgeben"}
      </Button>
    </div>
  );
}
