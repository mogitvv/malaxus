"use client";

import { useState, type FormEvent, type JSX } from "react";
import type { Category, Product, ProductType, ProductUnit } from "@/lib/types";
import { unitLabels } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { InventorySlot } from "@/components/ui/InventorySlot";
import { ProductIcon } from "@/components/icons/ProductIcon";
import { matchIconByName } from "@/lib/icon-matcher";
import { DiamondIcon, SearchIcon } from "@/components/icons/PixelIcons";

export function ProductManager({
  products,
  categories,
  onChange,
}: {
  products: Product[];
  categories: Category[];
  onChange: (products: Product[]) => void;
}): JSX.Element {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // Demo: hier werden die Änderungen später an Supabase übergeben.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const PreviewIcon = matchIconByName(newName);

  function updateStock(id: string, delta: number) {
    onChange(
      products.map((p) =>
        p.id === id ? { ...p, stockQuantity: Math.max(0, (p.stockQuantity ?? 0) + delta) } : p,
      ),
    );
  }

  function setStock(id: string, value: number) {
    onChange(products.map((p) => (p.id === id ? { ...p, stockQuantity: Math.max(0, value) } : p)));
  }

  function toggleHidden(id: string) {
    onChange(products.map((p) => (p.id === id ? { ...p, isHidden: !p.isHidden } : p)));
  }

  function deleteProduct(id: string) {
    onChange(products.filter((p) => p.id !== id));
  }

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const type = form.get("type") as ProductType;
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: String(form.get("name") ?? "Neuer Artikel"),
      categoryId: String(form.get("categoryId") ?? categories[0]?.id),
      description: String(form.get("description") ?? ""),
      priceDiamonds: Number(form.get("price") ?? 1),
      unit: form.get("unit") as ProductUnit,
      type,
      stockQuantity: type === "stock" ? Number(form.get("stock") ?? 0) : null,
      lowStockThreshold: type === "stock" ? 5 : null,
    };
    onChange([newProduct, ...products]);
    setShowAddForm(false);
    setNewName("");
    e.currentTarget.reset();
  }

  const visible = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="green" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? "Abbrechen" : "+ Neuer Artikel"}
        </Button>
        <div className="flex items-center gap-1 flex-1 min-w-[180px] max-w-xs">
          <SearchIcon size={16} />
          <input
            className="input-mc text-sm"
            placeholder="Produkte durchsuchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-[var(--mc-text-muted)]">{visible.length} von {products.length} Artikeln</span>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="mc-panel p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="sm:col-span-2 flex items-center gap-3">
            <InventorySlot size={48}>
              {PreviewIcon ? <PreviewIcon size={30} /> : <span className="text-[9px] text-muted">?</span>}
            </InventorySlot>
            <div className="flex-1">
              <input
                name="name"
                required
                placeholder="Name (z. B. Iron Ingot, Eisenbarren…)"
                className="input-mc"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <p className="text-[10px] text-[var(--mc-text-muted)] mt-1">
                {PreviewIcon ? "Icon automatisch erkannt ✓" : "Tipp: Wörter wie „Iron“, „Gold“, „Diamond“ erkennt das System automatisch."}
              </p>
            </div>
          </div>
          <select name="categoryId" className="input-mc">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input name="description" placeholder="Beschreibung" className="input-mc sm:col-span-2" />
          <input name="price" type="number" min={1} defaultValue={1} placeholder="Preis in Diamanten" className="input-mc" />
          <select name="unit" className="input-mc">
            <option value="piece">Stück</option>
            <option value="stack64">Stack (64)</option>
            <option value="shulker">Shulker</option>
          </select>
          <select name="type" className="input-mc">
            <option value="stock">Lagerartikel</option>
            <option value="on_request">Auf Anfrage</option>
          </select>
          <input name="stock" type="number" min={0} defaultValue={10} placeholder="Lagerbestand" className="input-mc" />
          <div className="sm:col-span-2 flex flex-col gap-1">
            <span className="text-[11px] text-[var(--mc-text-muted)]">
              Eigenes Bild hochladen folgt, sobald Supabase Storage angebunden ist – bis dahin wird automatisch ein passendes Icon verwendet.
            </span>
            <input type="file" accept="image/*" disabled className="input-mc opacity-50 cursor-not-allowed" />
          </div>
          <Button variant="green" type="submit" className="sm:col-span-2">
            Artikel speichern
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {visible.length === 0 && <p className="text-sm text-[var(--mc-text-muted)]">Keine Artikel gefunden.</p>}
        {visible.map((p) => {
          const category = categories.find((c) => c.id === p.categoryId);
          const lowStock =
            p.type === "stock" &&
            p.lowStockThreshold != null &&
            (p.stockQuantity ?? 0) > 0 &&
            (p.stockQuantity ?? 0) <= p.lowStockThreshold;
          const soldOut = p.type === "stock" && (p.stockQuantity ?? 0) <= 0;

          return (
            <div
              key={p.id}
              className={`mc-panel p-2 flex flex-wrap items-center gap-3 text-sm ${p.isHidden ? "opacity-50" : ""}`}
            >
              <InventorySlot size={44}>
                <ProductIcon name={p.name} size={26} />
              </InventorySlot>
              <div className="flex-1 min-w-[140px]">
                <p className="font-semibold">{p.name}</p>
                <p className="text-[11px] text-[var(--mc-text-muted)]">{category?.name}</p>
              </div>
              <span className="flex items-center gap-1 font-semibold w-16">
                <DiamondIcon size={14} />
                {p.priceDiamonds}
              </span>
              <span className="text-[11px] text-[var(--mc-text-muted)] w-20">{unitLabels[p.unit]}</span>

              {p.type === "on_request" ? (
                <span className="btn-mc btn-mc-gold text-[9px]">Auf Anfrage</span>
              ) : (
                <div className="flex items-center gap-1">
                  <button type="button" className="btn-mc px-2 py-1 text-[10px]" onClick={() => updateStock(p.id, -1)}>
                    −
                  </button>
                  <input
                    type="number"
                    className={`input-mc w-16 text-center text-xs ${soldOut ? "text-red-500" : lowStock ? "text-amber-500" : ""}`}
                    value={p.stockQuantity ?? 0}
                    onChange={(e) => setStock(p.id, Number(e.target.value))}
                  />
                  <button type="button" className="btn-mc px-2 py-1 text-[10px]" onClick={() => updateStock(p.id, 1)}>
                    +
                  </button>
                </div>
              )}

              {soldOut && <span className="text-[10px] text-red-500 font-semibold">Ausverkauft</span>}
              {lowStock && <span className="text-[10px] text-amber-500 font-semibold">Knapp!</span>}

              <div className="flex gap-1 ml-auto">
                <button type="button" className="btn-mc text-[9px] px-2" onClick={() => toggleHidden(p.id)}>
                  {p.isHidden ? "Einblenden" : "Ausblenden"}
                </button>
                <button
                  type="button"
                  className="btn-mc btn-mc-red text-[9px] px-2"
                  onClick={() => deleteProduct(p.id)}
                >
                  Löschen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button variant="green" onClick={handleSave}>
          {saved ? "Gespeichert ✓" : "Änderungen speichern"}
        </Button>
      </div>
    </div>
  );
}
