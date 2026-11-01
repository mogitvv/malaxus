import type { Category, Product, ProductType, ProductUnit } from "./types";

interface DbProduct {
  id: string;
  name: string;
  category_id: string | null;
  description: string;
  price_diamonds: number;
  unit: string;
  type: string;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  image_url: string | null;
  is_hidden: boolean;
}

interface DbCategory {
  id: string;
  name: string;
  slug: string;
}

export function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id ?? "",
    description: row.description,
    priceDiamonds: Number(row.price_diamonds),
    unit: row.unit as ProductUnit,
    type: row.type as ProductType,
    stockQuantity: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
    isHidden: row.is_hidden,
    imageUrl: row.image_url,
  };
}

export function mapCategory(row: DbCategory): Category {
  return { id: row.id, name: row.name, slug: row.slug };
}
