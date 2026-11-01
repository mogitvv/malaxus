"use client";

import Link from "next/link";
import { useState, type FormEvent, type JSX } from "react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

/** Knopf für Spieler, um ein Produkt anzufragen, das es noch nicht im Shop gibt. */
export function RequestProductButton(): JSX.Element {
  const { role } = useAuth();
  const [supabase] = useState(() => createClient());
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Bitte erst einloggen.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("product_requests").insert({
      user_id: userData.user.id,
      item_name: itemName,
      quantity,
      note: note || null,
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setDone(true);
    setItemName("");
    setQuantity(1);
    setNote("");
  }

  return (
    <div>
      <button type="button" className="btn-mc text-[10px] px-3" onClick={() => setOpen((v) => !v)}>
        {open ? "Abbrechen" : "+ Produkt anfordern"}
      </button>

      {open && (
        <div className="mc-panel p-3 mt-2 max-w-sm flex flex-col gap-2 text-sm">
          {role === "guest" ? (
            <>
              <p>Du musst eingeloggt sein, um ein Produkt anzufragen.</p>
              <Link href="/login" className="btn-mc btn-mc-blue self-start">
                Zum Login
              </Link>
            </>
          ) : done ? (
            <p className="text-[var(--mc-green-dark)] font-semibold">
              Danke! Wir legen einen Preis fest und melden uns in deinem Konto.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <p className="text-xs text-muted">
                Gibt es ein Produkt nicht im Shop, das du brauchst? Schreib uns, was und wie viel – wir legen
                einen Preis fest und melden uns.
              </p>
              <input
                required
                placeholder="Was brauchst du? (z. B. Netherit-Rüstung)"
                className="input-mc"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <input
                type="number"
                min={1}
                placeholder="Menge"
                className="input-mc"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
              <textarea
                placeholder="Notiz (optional)"
                className="input-mc min-h-[60px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button variant="green" type="submit" disabled={submitting}>
                {submitting ? "Wird gesendet…" : "Anfrage senden"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
