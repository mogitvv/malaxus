import type { JSX } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapCategory, mapProduct } from "@/lib/products";
import { ProductDetailLive } from "./ProductDetailLive";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps): Promise<JSX.Element> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: productRow } = await supabase.from("products").select("*").eq("id", id).single();
  if (!productRow) notFound();
  const product = mapProduct(productRow);

  const { data: categoryRow } = product.categoryId
    ? await supabase.from("categories").select("*").eq("id", product.categoryId).single()
    : { data: null };
  const categoryName = categoryRow ? mapCategory(categoryRow).name : undefined;

  return (
    <div className="mc-panel p-6 flex flex-col sm:flex-row gap-6 max-w-3xl">
      <ProductDetailLive initialProduct={product} categoryName={categoryName} />
    </div>
  );
}
