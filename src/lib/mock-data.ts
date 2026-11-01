import type { Category, Farm, Order, Product } from "./types";

/**
 * Platzhalter-Daten, damit wir das Design ohne angeschlossene Datenbank
 * anschauen können. Werden später durch echte Supabase-Abfragen ersetzt.
 */
export const categories: Category[] = [
  { id: "cat-baubloecke", name: "Baublöcke", slug: "baubloecke" },
  { id: "cat-erze", name: "Erze", slug: "erze" },
  { id: "cat-nahrung", name: "Nahrung", slug: "nahrung" },
  { id: "cat-redstone", name: "Redstone", slug: "redstone" },
  { id: "cat-werkzeuge", name: "Werkzeuge", slug: "werkzeuge" },
  { id: "cat-seltenes", name: "Seltenes", slug: "seltenes" },
];

export const products: Product[] = [
  {
    id: "p-eichenplanken",
    name: "Eichenholz-Planken",
    categoryId: "cat-baubloecke",
    description: "Klassisches Bauholz für Häuser, Böden und Möbel.",
    priceDiamonds: 1,
    unit: "stack64",
    type: "stock",
    stockQuantity: 40,
    lowStockThreshold: 10,
  },
  {
    id: "p-glas",
    name: "Glas",
    categoryId: "cat-baubloecke",
    description: "Durchsichtige Blöcke für Fenster und Gewächshäuser.",
    priceDiamonds: 2,
    unit: "stack64",
    type: "stock",
    stockQuantity: 8,
    lowStockThreshold: 10,
  },
  {
    id: "p-diamanterz",
    name: "Diamant-Erz",
    categoryId: "cat-erze",
    description: "Rohes Diamanterz, direkt aus der Mine.",
    priceDiamonds: 3,
    unit: "piece",
    type: "stock",
    stockQuantity: 0,
    lowStockThreshold: 5,
  },
  {
    id: "p-eisenbarren",
    name: "Eisen-Barren",
    categoryId: "cat-erze",
    description: "Geschmolzenes Eisen für Werkzeuge, Rüstung und Redstone-Technik.",
    priceDiamonds: 4,
    unit: "stack64",
    type: "stock",
    stockQuantity: 20,
    lowStockThreshold: 5,
  },
  {
    id: "p-goldblock",
    name: "Goldblock",
    categoryId: "cat-erze",
    description: "Glänzender Block aus purem Gold.",
    priceDiamonds: 6,
    unit: "piece",
    type: "stock",
    stockQuantity: 5,
    lowStockThreshold: 3,
  },
  {
    id: "p-steak",
    name: "Steak",
    categoryId: "cat-nahrung",
    description: "Saftiges gebratenes Steak, stillt den Hunger zuverlässig.",
    priceDiamonds: 2,
    unit: "stack64",
    type: "stock",
    stockQuantity: 30,
    lowStockThreshold: 8,
  },
  {
    id: "p-goldapfel",
    name: "Goldener Apfel",
    categoryId: "cat-nahrung",
    description: "Heilt und gibt kurzzeitig Resistenz.",
    priceDiamonds: 5,
    unit: "piece",
    type: "stock",
    stockQuantity: 8,
    lowStockThreshold: 10,
  },
  {
    id: "p-redstonestaub",
    name: "Redstone-Staub",
    categoryId: "cat-redstone",
    description: "Für Schaltkreise, Fallen und automatische Türen.",
    priceDiamonds: 2,
    unit: "stack64",
    type: "stock",
    stockQuantity: 25,
    lowStockThreshold: 10,
  },
  {
    id: "p-observer",
    name: "Observer",
    categoryId: "cat-redstone",
    description: "Erkennt Blockänderungen, nützlich für Farmen.",
    priceDiamonds: 1,
    unit: "piece",
    type: "stock",
    stockQuantity: 16,
    lowStockThreshold: 5,
  },
  {
    id: "p-diamantschwert",
    name: "Diamantschwert",
    categoryId: "cat-werkzeuge",
    description: "Scharfe Klinge aus Diamant.",
    priceDiamonds: 5,
    unit: "piece",
    type: "stock",
    stockQuantity: 4,
    lowStockThreshold: 2,
  },
  {
    id: "p-netheritepickaxe",
    name: "Netherite-Spitzhacke",
    categoryId: "cat-werkzeuge",
    description: "Die stärkste Spitzhacke im Spiel. Seltene Materialien nötig – wir müssen das annehmen.",
    priceDiamonds: 12,
    unit: "piece",
    type: "on_request",
    stockQuantity: null,
    lowStockThreshold: null,
  },
  {
    id: "p-elytra",
    name: "Elytra",
    categoryId: "cat-seltenes",
    description: "Lässt dich durch die Luft gleiten. Kommt aus dem End-Schiff.",
    priceDiamonds: 20,
    unit: "piece",
    type: "on_request",
    stockQuantity: null,
    lowStockThreshold: null,
  },
  {
    id: "p-beacon",
    name: "Beacon",
    categoryId: "cat-seltenes",
    description: "Strahlt einen weit sichtbaren Lichtstrahl aus und gibt Beacon-Effekte.",
    priceDiamonds: 15,
    unit: "piece",
    type: "on_request",
    stockQuantity: null,
    lowStockThreshold: null,
  },
  {
    id: "p-totem",
    name: "Totem der Unsterblichkeit",
    categoryId: "cat-seltenes",
    description: "Rettet dich einmal vor dem Tod. Sehr begrenzt verfügbar.",
    priceDiamonds: 10,
    unit: "piece",
    type: "stock",
    stockQuantity: 2,
    lowStockThreshold: 3,
  },
];

export const farms: Farm[] = [
  {
    id: "f-baumfarm",
    name: "Baumfarm",
    productId: "p-eichenplanken",
    productName: "Eichenholz-Planken",
    dailyAmountEstimate: "~10 Stacks/Tag",
  },
  {
    id: "f-eisengolem",
    name: "Eisengolem-Farm",
    productId: "p-eisenbarren",
    productName: "Eisen-Barren",
    dailyAmountEstimate: "~5 Stacks/Tag",
  },
  {
    id: "f-redstonefarm",
    name: "Redstone-Farm",
    productId: "p-redstonestaub",
    productName: "Redstone-Staub",
    dailyAmountEstimate: "~8 Stacks/Tag",
  },
];

export const mockOrders: Order[] = [
  {
    id: "o-1",
    ingameName: "Mogi",
    items: [
      { productId: "p-steak", name: "Steak", quantity: 2, unitPriceDiamonds: 2 },
      { productId: "p-redstonestaub", name: "Redstone-Staub", quantity: 1, unitPriceDiamonds: 2 },
    ],
    totalDiamonds: 6,
    note: "Bei Spawn liefern, bin meist abends online.",
    status: "received",
    paid: false,
    createdAt: "2026-11-01T18:20:00+01:00",
  },
  {
    id: "o-2",
    ingameName: "Mogi",
    items: [{ productId: "p-diamantschwert", name: "Diamantschwert", quantity: 1, unitPriceDiamonds: 5 }],
    totalDiamonds: 5,
    status: "ready",
    estimatedDelivery: "heute",
    adminMessage: "Bringe es zu deiner Basis bei 120, 70, -340.",
    paid: false,
    createdAt: "2026-10-31T14:05:00+01:00",
  },
  {
    id: "o-3",
    ingameName: "Mogi",
    items: [{ productId: "p-goldapfel", name: "Goldener Apfel", quantity: 3, unitPriceDiamonds: 5 }],
    totalDiamonds: 15,
    status: "delivered",
    paid: true,
    createdAt: "2026-10-29T09:40:00+01:00",
  },
  {
    id: "o-4",
    ingameName: "Mogi",
    items: [{ productId: "p-beacon", name: "Beacon", quantity: 1, unitPriceDiamonds: 15 }],
    totalDiamonds: 15,
    note: "Farbe ist egal, Hauptsache es leuchtet.",
    status: "accepted",
    estimatedDelivery: "2 bis 3 Tage",
    paid: false,
    createdAt: "2026-10-31T20:10:00+01:00",
  },
  {
    id: "o-5",
    ingameName: "Felix",
    items: [{ productId: "p-eichenplanken", name: "Eichenholz-Planken", quantity: 5, unitPriceDiamonds: 1 }],
    totalDiamonds: 5,
    status: "processing",
    estimatedDelivery: "ca. 1 Stunde",
    paid: true,
    createdAt: "2026-11-01T12:00:00+01:00",
  },
  {
    id: "o-6",
    ingameName: "Steve123",
    items: [
      { productId: "p-eisenbarren", name: "Eisen-Barren", quantity: 2, unitPriceDiamonds: 4 },
      { productId: "p-glas", name: "Glas", quantity: 1, unitPriceDiamonds: 2 },
    ],
    totalDiamonds: 10,
    note: "Koordinaten: 120 70 -340",
    status: "received",
    paid: false,
    createdAt: "2026-11-01T17:45:00+01:00",
  },
  {
    id: "o-7",
    ingameName: "Alex_99",
    items: [{ productId: "p-totem", name: "Totem der Unsterblichkeit", quantity: 1, unitPriceDiamonds: 10 }],
    totalDiamonds: 10,
    status: "rejected",
    adminMessage: "Leider aktuell nicht verfügbar, Lager ist leer.",
    paid: false,
    createdAt: "2026-10-30T08:15:00+01:00",
  },
  {
    id: "o-8",
    ingameName: "Notch_Fan",
    items: [{ productId: "p-netheritepickaxe", name: "Netherite-Spitzhacke", quantity: 1, unitPriceDiamonds: 12 }],
    totalDiamonds: 12,
    status: "cancelled",
    paid: false,
    createdAt: "2026-10-30T11:30:00+01:00",
  },
];

export interface MockUser {
  id: string;
  email: string;
  ingameName: string;
  orderCount: number;
  isBanned: boolean;
}

export const mockUsers: MockUser[] = [
  { id: "u-mogi", email: "mogi@example.com", ingameName: "Mogi", orderCount: 4, isBanned: false },
  { id: "u-felix", email: "felix@example.com", ingameName: "Felix", orderCount: 1, isBanned: false },
  { id: "u-steve", email: "steve123@example.com", ingameName: "Steve123", orderCount: 1, isBanned: false },
  { id: "u-alex", email: "alex99@example.com", ingameName: "Alex_99", orderCount: 1, isBanned: false },
  { id: "u-notch", email: "notchfan@example.com", ingameName: "Notch_Fan", orderCount: 1, isBanned: true },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
