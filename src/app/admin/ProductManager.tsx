"use client";

import { useRef, useState, type FormEvent, type JSX } from "react";
import type { Category, Product, ProductType, ProductUnit } from "@/lib/types";
import { unitLabels } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { InventorySlot } from "@/components/ui/InventorySlot";
import { ProductIcon } from "@/components/icons/ProductIcon";
import { matchIconByName } from "@/lib/icon-matcher";
import { DiamondIcon, SearchIcon } from "@/components/icons/PixelIcons";
import { createClient } from "@/lib/supabase/client";
import { resizeImageFile, validateImageFile } from "@/lib/image";

interface FormState {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  unit: ProductUnit;
  type: ProductType;
  stock: number;
}

const emptyForm = (categories: Category[]): FormState => ({
  name: "",
  categoryId: categories[0]?.id ?? "",
  description: "",
  price: 1,
  unit: "piece",
  type: "stock",
  stock: 10,
});

export function ProductManager({
  products,
  categories,
  onChange,
}: {
  products: Product[];
  categories: Category[];
  onChange: (products: Product[]) => void;
}): JSX.Element {
  const [supabase] = useState(() => createClient());
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(categories));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PreviewIcon = matchIconByName(form.name);

  function startAdd() {
    setEditingId("new");
    setForm(emptyForm(categories));
    setImageFile(null);
    setFormError(null);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      categoryId: p.categoryId,
      description: p.description,
      price: p.priceDiamonds,
      unit: p.unit,
      type: p.type,
      stock: p.stockQuantity ?? 10,
    });
    setImageFile(null);
    setFormError(null);
  }

  function cancelForm() {
    setEditingId(null);
    setImageFile(null);
    setFormError(null);
  }

  async function uploadImageIfNeeded(productId: string): Promise<string | null> {
    if (!imageFile) return null;
    const resized = await resizeImageFile(imageFile);
    const path = `${productId}-${Date.now()}.webp`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, resized, { contentType: "image/webp", upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (imageFile) {
      const validationError = validateImageFile(imageFile);
      if (validationError) {
        setFormError(validationError);
        return;
      }
    }

    setSaving(true);
    try {
      if (editingId === "new") {
        const { data, error } = await supabase
          .from("products")
          .insert({
            name: form.name,
            category_id: form.categoryId || null,
            description: form.description,
            price_diamonds: form.price,
            unit: form.unit,
            type: form.type,
            stock_quantity: form.type === "stock" ? form.stock : null,
            low_stock_threshold: form.type === "stock" ? 5 : null,
          })
          .select()
          .single();
        if (error) throw error;

        let imageUrl: string | null = null;
        if (imageFile) imageUrl = await uploadImageIfNeeded(data.id);
        if (imageUrl) {
          await supabase.from("products").update({ image_url: imageUrl }).eq("id", data.id);
        }

        onChange([
          {
            id: data.id,
            name: form.name,
            categoryId: form.categoryId,
            description: form.description,
            priceDiamonds: form.price,
            unit: form.unit,
            type: form.type,
            stockQuantity: form.type === "stock" ? form.stock : null,
            lowStockThreshold: form.type === "stock" ? 5 : null,
            isHidden: false,
            imageUrl,
          },
          ...products,
        ]);
      } else if (editingId) {
        const imageUrl = await uploadImageIfNeeded(editingId);
        const update: Record<string, unknown> = {
          name: form.name,
          category_id: form.categoryId || null,
          description: form.description,
          price_diamonds: form.price,
          unit: form.unit,
          type: form.type,
          stock_quantity: form.type === "stock" ? form.stock : null,
        };
        if (imageUrl) update.image_url = imageUrl;

        const { error } = await supabase.from("products").update(update).eq("id", editingId);
        if (error) throw error;

        onChange(
          products.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  name: form.name,
                  categoryId: form.categoryId,
                  description: form.description,
                  priceDiamonds: form.price,
                  unit: form.unit,
                  type: form.type,
                  stockQuantity: form.type === "stock" ? form.stock : null,
                  imageUrl: imageUrl ?? p.imageUrl,
                }
              : p,
          ),
        );
      }
      cancelForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStock(id: string, delta: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const next = Math.max(0, (product.stockQuantity ?? 0) + delta);
    onChange(products.map((p) => (p.id === id ? { ...p, stockQuantity: next } : p)));
    await supabase.from("products").update({ stock_quantity: next }).eq("id", id);
  }

  async function setStock(id: string, value: number) {
    const next = Math.max(0, value);
    onChange(products.map((p) => (p.id === id ? { ...p, stockQuantity: next } : p)));
    await supabase.from("products").update({ stock_quantity: next }).eq("id", id);
  }

  async function toggleHidden(id: string) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const next = !product.isHidden;
    onChange(products.map((p) => (p.id === id ? { ...p, isHidden: next } : p)));
    await supabase.from("products").update({ is_hidden: next }).eq("id", id);
  }

  async function deleteProduct(id: string) {
    onChange(products.filter((p) => p.id !== id));
    await supabase.from("products").delete().eq("id", id);
  }

  const visible = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const isFormOpen = editingId !== null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="green" onClick={() => (isFormOpen ? cancelForm() : startAdd())}>
          {isFormOpen ? "Abbrechen" : "+ Neuer Artikel"}
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
        <span className="text-xs text-muted">{visible.length} von {products.length} Artikeln</span>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mc-panel p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <h3 className="sm:col-span-2 text-sm font-semibold">
            {editingId === "new" ? "Neuer Artikel" : "Artikel bearbeiten"}
          </h3>
          <div className="sm:col-span-2 flex items-center gap-3">
            <InventorySlot size={48}>
              {PreviewIcon ? <PreviewIcon size={30} /> : <span className="text-[9px] text-muted">?</span>}
            </InventorySlot>
            <div className="flex-1">
              <input
                required
                placeholder="Name (z. B. Iron Ingot, Eisenbarren…)"
                className="input-mc"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <p className="text-[10px] text-muted mt-1">
                {PreviewIcon ? "Icon automatisch erkannt ✓" : "Tipp: Wörter wie „Iron“, „Gold“, „Diamond“ erkennt das System automatisch."}
              </p>
            </div>
          </div>
          <select
            className="input-mc"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Beschreibung"
            className="input-mc sm:col-span-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="number"
            min={1}
            placeholder="Preis in Diamanten"
            className="input-mc"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
          <select className="input-mc" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as ProductUnit })}>
            <option value="piece">Stück</option>
            <option value="stack64">Stack (64)</option>
            <option value="shulker">Shulker</option>
          </select>
          <select className="input-mc" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ProductType })}>
            <option value="stock">Lagerartikel</option>
            <option value="on_request">Auf Anfrage</option>
          </select>
          {form.type === "stock" && (
            <input
              type="number"
              min={0}
              placeholder="Lagerbestand"
              className="input-mc"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          )}
          <div className="sm:col-span-2 flex flex-col gap-1">
            <span className="text-[11px] text-muted">Produktbild (optional, wird automatisch verkleinert)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="input-mc"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {formError && <p className="sm:col-span-2 text-xs text-red-500">{formError}</p>}

          <Button variant="green" type="submit" className="sm:col-span-2" disabled={saving}>
            {saving ? "Speichert…" : "Artikel speichern"}
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {visible.length === 0 && <p className="text-sm text-muted">Keine Artikel gefunden.</p>}
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
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ProductIcon name={p.name} size={26} />
                )}
              </InventorySlot>
              <div className="flex-1 min-w-[140px]">
                <p className="font-semibold">{p.name}</p>
                <p className="text-[11px] text-muted">{category?.name}</p>
              </div>
              <span className="flex items-center gap-1 font-semibold w-16">
                <DiamondIcon size={14} />
                {p.priceDiamonds}
              </span>
              <span className="text-[11px] text-muted w-20">{unitLabels[p.unit]}</span>

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
                <button type="button" className="btn-mc text-[9px] px-2" onClick={() => startEdit(p)}>
                  Bearbeiten
                </button>
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
    </div>
  );
}
