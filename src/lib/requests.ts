import type { ProductRequest, ProductRequestStatus } from "./types";

interface DbProductRequest {
  id: string;
  user_id: string;
  item_name: string;
  quantity: number;
  note: string | null;
  status: ProductRequestStatus;
  price_diamonds: number | null;
  order_id: string | null;
  created_at: string;
  profiles: { ingame_name: string } | { ingame_name: string }[] | null;
}

export function mapProductRequest(row: DbProductRequest): ProductRequest {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    userId: row.user_id,
    ingameName: profile?.ingame_name ?? "Unbekannt",
    itemName: row.item_name,
    quantity: row.quantity,
    note: row.note ?? undefined,
    status: row.status,
    priceDiamonds: row.price_diamonds !== null ? Number(row.price_diamonds) : null,
    orderId: row.order_id,
    createdAt: row.created_at,
  };
}
