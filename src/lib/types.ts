export type ProductType = "stock" | "on_request";
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
  /** Frei vom Admin beschriftete Einheit, z. B. "Stück", "Stapel", "Rüstungsteil". */
  unit: string;
  /** Wie viele Einheiten man für priceDiamonds bekommt, z. B. 6 bei "1 Diamant für 6 Stück". */
  amount: number;
  type: ProductType;
  /** nur bei type "stock" relevant, sonst null */
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  isHidden?: boolean;
  imageUrl?: string | null;
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

export type ProductRequestStatus = "open" | "fulfilled" | "rejected";

export interface ProductRequest {
  id: string;
  userId: string;
  ingameName: string;
  itemName: string;
  quantity: number;
  note?: string;
  status: ProductRequestStatus;
  priceDiamonds: number | null;
  orderId: string | null;
  createdAt: string;
}

export interface Farm {
  id: string;
  name: string;
  productId: string;
  productName: string;
  dailyAmountEstimate: string;
}

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
