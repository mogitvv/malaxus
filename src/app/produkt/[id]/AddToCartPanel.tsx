"use client";

import { useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";

export function AddToCartPanel({ product }: { product: Product }): JSX.Element {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soldOut = product.type === "stock" && (product.stockQuantity ?? 0) <= 0;
  const maxQuantity = soldOut || product.type === "on_request" ? 99 : Math.max(product.stockQuantity ?? 0, 0);

  function handleAdd() {
    const result = addItem(
      { productId: product.id, name: product.name, unitPriceDiamonds: product.priceDiamonds, unit: product.unit },
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-mc px-3"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          −
        </button>
        <input
          type="number"
          className="input-mc w-20 text-center"
          value={quantity}
          min={1}
          max={maxQuantity || undefined}
          onChange={(e) => setQuantity(Math.min(Math.max(1, Number(e.target.value) || 1), maxQuantity || 99))}
        />
        <button
          type="button"
          className="btn-mc px-3"
          onClick={() => setQuantity((q) => Math.min(maxQuantity || 99, q + 1))}
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
