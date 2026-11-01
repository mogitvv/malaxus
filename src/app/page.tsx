import Link from "next/link";
import type { JSX } from "react";
import { createClient } from "@/lib/supabase/server";
import { mapCategory, mapProduct } from "@/lib/products";
import { ShopProductGrid } from "@/components/shop/ShopProductGrid";

interface ShopPageProps {
  searchParams: Promise<{ q?: string; cat?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps): Promise<JSX.Element> {
  const { q = "", cat = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const supabase = await createClient();
  const [{ data: categoryRows }, { data: productRows }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("*").eq("is_hidden", false).order("name"),
  ]);

  const categories = (categoryRows ?? []).map(mapCategory);
  const products = (productRows ?? []).map(mapProduct);

  const visible = products.filter((p) => {
    if (cat && p.categoryId !== cat) return false;
    if (query && !`${p.name} ${p.description}`.toLowerCase().includes(query)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <section
        className="p-6 border-2"
        style={{
          background: "linear-gradient(135deg, var(--mc-wood-dark), #2b2d33)",
          borderColor: "var(--mc-panel-dark-border)",
        }}
      >
        <h1 className="text-lg sm:text-xl text-[var(--mc-gold)] drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
          Willkommen im Malaxus-Shop
        </h1>
        <p className="text-sm mt-2 text-white" style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}>
          Bestelle Items, bezahle in Diamanten im Spiel – wir liefern sie dir direkt an deine Basis.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className={`btn-mc text-[10px] px-3 ${!cat ? "btn-mc-blue" : ""}`}
        >
          Alle
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/?cat=${c.id}`}
            className={`btn-mc text-[10px] px-3 ${cat === c.id ? "btn-mc-blue" : ""}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {query && (
        <p className="text-sm text-muted">
          Suchergebnisse für „{q}“ ({visible.length})
        </p>
      )}

      <ShopProductGrid initialProducts={visible} />
    </div>
  );
}
