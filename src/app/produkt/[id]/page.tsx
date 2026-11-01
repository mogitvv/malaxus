import type { JSX } from "react";
import { notFound } from "next/navigation";
import { categories, getProductById } from "@/lib/mock-data";
import { unitLabels } from "@/lib/types";
import { InventorySlot } from "@/components/ui/InventorySlot";
import { ProductIcon } from "@/components/icons/ProductIcon";
import { DiamondIcon } from "@/components/icons/PixelIcons";
import { AddToCartPanel } from "./AddToCartPanel";

export const instant = false;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps): Promise<JSX.Element> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.categoryId);
  const lowStock =
    product.type === "stock" &&
    product.lowStockThreshold != null &&
    (product.stockQuantity ?? 0) > 0 &&
    (product.stockQuantity ?? 0) <= product.lowStockThreshold;

  return (
    <div className="mc-panel p-6 flex flex-col sm:flex-row gap-6 max-w-3xl">
      <InventorySlot size={128} className="mx-auto sm:mx-0">
        <ProductIcon name={product.name} size={72} />
      </InventorySlot>

      <div className="flex flex-col gap-3 flex-1">
        <div>
          <span className="text-[10px] uppercase tracking-wide text-muted">{category?.name}</span>
          <h1 className="text-lg">{product.name}</h1>
        </div>

        <p className="text-sm text-muted">{product.description}</p>

        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 font-semibold text-base">
            <DiamondIcon size={20} />
            {product.priceDiamonds}
          </span>
          <span className="text-muted">pro {unitLabels[product.unit]}</span>
        </div>

        {product.type === "on_request" ? (
          <span className="btn-mc btn-mc-gold inline-block self-start text-[10px]">Auf Anfrage – wir bestätigen im Admin-Board</span>
        ) : lowStock ? (
          <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600">
            Nur noch <strong className="text-sm">{product.stockQuantity}</strong> verfügbar – knapper Bestand!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 self-start text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--mc-subtle)" }}>
            <strong className="text-sm">{product.stockQuantity}</strong> auf Lager
          </span>
        )}

        <AddToCartPanel product={product} />
      </div>
    </div>
  );
}
