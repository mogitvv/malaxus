import type { Order, OrderStatus } from "./types";

interface DbOrderItem {
  id?: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_diamonds: number;
}

export interface DbOrder {
  id: string;
  status: OrderStatus;
  note: string | null;
  estimated_delivery: string | null;
  admin_message: string | null;
  paid: boolean;
  reminder_sent_at: string | null;
  total_diamonds: number;
  created_at: string;
  order_items: DbOrderItem[];
  profiles: { ingame_name: string } | { ingame_name: string }[] | null;
}

/** Wandelt eine per Join geladene Supabase-Bestellung in den im Admin-Board verwendeten Order-Typ um. */
export function mapOrder(row: DbOrder): Order {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    ingameName: profile?.ingame_name ?? "Unbekannt",
    items: row.order_items.map((item) => ({
      productId: item.product_id ?? "",
      name: item.product_name,
      quantity: item.quantity,
      unitPriceDiamonds: Number(item.unit_price_diamonds),
    })),
    totalDiamonds: Number(row.total_diamonds),
    note: row.note ?? undefined,
    status: row.status,
    estimatedDelivery: row.estimated_delivery ?? undefined,
    adminMessage: row.admin_message ?? undefined,
    paid: row.paid,
    createdAt: row.created_at,
    reminderSentAt: row.reminder_sent_at ?? undefined,
  };
}
