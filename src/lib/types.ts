export type ProductType = "stock" | "on_request";
export type ProductUnit = "piece" | "stack64" | "shulker";
export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "received"
  | "accepted"
  | "processing"
  | "ready"
  | "delivered"
  | "rejected"
  | "cancelled";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  priceDiamonds: number;
  unit: ProductUnit;
  type: ProductType;
  /** nur bei type "stock" relevant, sonst null */
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  isHidden?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPriceDiamonds: number;
}

export interface Order {
  id: string;
  ingameName: string;
  items: OrderItem[];
  totalDiamonds: number;
  note?: string;
  status: OrderStatus;
  estimatedDelivery?: string;
  adminMessage?: string;
  paid: boolean;
  createdAt: string;
  /** Zeitpunkt der letzten Zahlungserinnerung (Stub, bis E-Mail-Versand angebunden ist). */
  reminderSentAt?: string;
}

export interface Farm {
  id: string;
  name: string;
  productId: string;
  productName: string;
  dailyAmountEstimate: string;
}

export const unitLabels: Record<ProductUnit, string> = {
  piece: "Stück",
  stack64: "Stack (64)",
  shulker: "Shulker",
};

export const statusLabels: Record<OrderStatus, string> = {
  received: "Eingegangen",
  accepted: "Angenommen",
  processing: "In Bearbeitung",
  ready: "Bereit zur Lieferung",
  delivered: "Geliefert",
  rejected: "Abgelehnt",
  cancelled: "Storniert",
};

/** Die normale Reihenfolge eines Bestell-Lebenszyklus (ohne Sonderfälle). */
export const statusFlow: OrderStatus[] = [
  "received",
  "accepted",
  "processing",
  "ready",
  "delivered",
];
