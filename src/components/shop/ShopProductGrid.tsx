"use client";

import { useEffect, useState, type JSX } from "react";
import type { Product } from "@/lib/types";
import { mapProduct } from "@/lib/products";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "./ProductCard";

interface ProductsPayload {
  id: string;
  name: string;
  category_id: string | null;
  description: string;
  price_diamonds: number;
  unit: string;
  amount: number;
  type: string;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  image_url: string | null;
  is_hidden: boolean;
}

/** Zeigt die (serverseitig gefilterte) Produktliste an und hält Preis/Lagerbestand per Realtime aktuell. */
export function ShopProductGrid({ initialProducts }: { initialProducts: Product[] }): JSX.Element {
  const [supabase] = useState(() => createClient());
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const channel = supabase
      .channel("shop-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string }).id;
            setProducts((prev) => prev.filter((p) => p.id !== oldId));
            return;
          }
          const updated = mapProduct(payload.new as ProductsPayload);
          setProducts((prev) => {
            if (updated.isHidden) return prev.filter((p) => p.id !== updated.id);
            const exists = prev.some((p) => p.id === updated.id);
            return exists ? prev.map((p) => (p.id === updated.id ? updated : p)) : prev;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (products.length === 0) {
    return <p className="text-sm text-muted">Keine Artikel gefunden.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
