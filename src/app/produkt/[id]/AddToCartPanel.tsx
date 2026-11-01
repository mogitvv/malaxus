"use client";

import { useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";

export function AddToCartPanel({ product }: { product: Product }): JSX.Element {
  const { addItem } = useCart();
  const router = useRouter();
  const step = Math.max(1, product.amount);
  const [quantity, setQuantity] = useState(step);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soldOut = product.type === "stock" && (product.stockQuantity ?? 0) <= 0;
  const maxQuantity =
    soldOut || product.type === "on_request" ? step * 999 : Math.max(product.stockQuantity ?? 0, 0);

  function handleAdd() {
    const result = addItem(
      {
        productId: product.id,
        name: product.name,
        unitPriceDiamonds: product.priceDiamonds,
        unit: product.unit,
        amount: product.amount,
      },
      quantity,
    );
    if (result.ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } else {
      setError(result.reason ?? "Konnte nicht hinzugefügt werden.");
      setTimeout(() => setError(null), 3500);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {soldOut && (
        <p className="text-xs text-red-600">
          Gerade ausverkauft. Du kannst trotzdem eine Anfrage stellen – wir entscheiden im Admin-Board, ob wir sie annehmen.
        </p>
      )}

      {step > 1 && (
        <p className="text-[11px] text-muted">Wird in Schritten von {step} {product.unit} gekauft.</p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-mc px-3"
          onClick={() => setQuantity((q) => Math.max(step, q - step))}
        >
          −
        </button>
        <input
          type="number"
          className="input-mc w-20 text-center"
          value={quantity}
          min={step}
          step={step}
          max={maxQuantity || undefined}
          onChange={(e) => {
            const raw = Math.max(step, Number(e.target.value) || step);
            const rounded = Math.round(raw / step) * step;
            setQuantity(Math.min(rounded, maxQuantity || step));
          }}
        />
        <button
          type="button"
          className="btn-mc px-3"
          onClick={() => setQuantity((q) => Math.min(maxQuantity || step, q + step))}
        >
          +
        </button>
      </div>

      <div className="flex gap-2">
        <Button variant={soldOut ? "gold" : "green"} onClick={handleAdd}>
          {added
            ? "Hinzugefügt ✓"
            : soldOut
              ? "Anfrage trotzdem stellen"
              : product.type === "on_request"
                ? "Anfrage in den Warenkorb"
                : "In den Warenkorb"}
        </Button>
        <Button variant="blue" onClick={() => router.push("/warenkorb")}>
          Zum Warenkorb
        </Button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
