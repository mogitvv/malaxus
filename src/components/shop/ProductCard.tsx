"use client";

import Link from "next/link";
import { useState, type JSX } from "react";
import type { Product } from "@/lib/types";
import { InventorySlot } from "@/components/ui/InventorySlot";
import { Button } from "@/components/ui/Button";
import { ProductIcon } from "@/components/icons/ProductIcon";
import { DiamondIcon } from "@/components/icons/PixelIcons";
import { useCart } from "@/lib/cart-context";

export function ProductCard({ product }: { product: Product }): JSX.Element {
  const { addItem } = useCart();
  const [error, setError] = useState<string | null>(null);
  const soldOut = product.type === "stock" && (product.stockQuantity ?? 0) <= 0;

  function handleAdd() {
    const result = addItem(
      {
        productId: product.id,
        name: product.name,
        unitPriceDiamonds: product.priceDiamonds,
        unit: product.unit,
        amount: product.amount,
      },
      1,
    );
    if (!result.ok) {
      setError(result.reason ?? "Konnte nicht hinzugefügt werden.");
      setTimeout(() => setError(null), 3500);
    }
  }

  return (
    <div className="mc-panel p-3 flex flex-col gap-2">
      <Link href={`/produkt/${product.id}`} className="flex flex-col gap-2 flex-1">
        <InventorySlot
          size={72}
          className="mx-auto"
          badge={product.type === "stock" ? product.stockQuantity : "?"}
          overlay={soldOut ? <span className="font-pixel text-[9px] text-red-400">Ausverkauft</span> : undefined}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ProductIcon name={product.name} size={40} />
          )}
        </InventorySlot>
        <h3 className="text-sm font-semibold text-center leading-tight">{product.name}</h3>
        <p className="text-[11px] text-center text-muted line-clamp-2">{product.description}</p>
      </Link>

      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 font-semibold">
          <DiamondIcon size={16} />
          {product.priceDiamonds}
        </span>
        <span className="text-[10px] text-muted">
          für {product.amount} {product.unit}
        </span>
      </div>

      {product.type === "on_request" ? (
        <span className="btn-mc btn-mc-gold text-center text-[10px] block">Auf Anfrage</span>
      ) : (
        <Button variant={soldOut ? "gold" : "green"} onClick={handleAdd}>
          {soldOut ? "Anfrage trotzdem stellen" : "In den Warenkorb"}
        </Button>
      )}

      {error && <p className="text-[10px] text-red-600 text-center">{error}</p>}
    </div>
  );
}
