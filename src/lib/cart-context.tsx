"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { JSX, ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  unitPriceDiamonds: number;
  unit: string;
  amount: number;
  quantity: number;
}

export interface AddItemResult {
  ok: boolean;
  reason?: string;
}

/** Maximal so viele verschiedene Produkte gleichzeitig im Warenkorb (Mengen pro Produkt sind unbegrenzt). */
export const MAX_DISTINCT_CART_ITEMS = 5;

interface CartContextValue {
  items: CartItem[];
  note: string;
  setNote: (note: string) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => AddItemResult;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalDiamonds: number;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "malaxus-cart";

export function CartProvider({ children }: { children: ReactNode }): JSX.Element {
  const [items, setItems] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setItems(parsed.items ?? []);
        setNote(parsed.note ?? "");
      } catch {
        // kaputte Daten im Storage ignorieren
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, note }));
  }, [items, note, hydrated]);

  function addItem(item: Omit<CartItem, "quantity">, quantity: number): AddItemResult {
    let result: AddItemResult = { ok: true };
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      if (prev.length >= MAX_DISTINCT_CART_ITEMS) {
        result = {
          ok: false,
          reason: `Maximal ${MAX_DISTINCT_CART_ITEMS} verschiedene Produkte gleichzeitig im Warenkorb. Gib zuerst eine Bestellung auf oder entferne etwas.`,
        };
        return prev;
      }
      return [...prev, { ...item, quantity }];
    });
    return result;
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
    setNote("");
  }

  const totalDiamonds = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPriceDiamonds * i.quantity, 0),
    [items],
  );
  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, note, setNote, addItem, updateQuantity, removeItem, clear, totalDiamonds, totalCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart muss innerhalb von <CartProvider> verwendet werden");
  return ctx;
}
