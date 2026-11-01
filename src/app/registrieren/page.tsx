"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type JSX } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const { login } = useAuth();
  const [ingameName, setIngameName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Demo: hier kommt später die echte Registrierung gegen die Datenbank (Supabase Auth).
    login("customer", ingameName || "Neuer Spieler");
    router.push("/konto");
  }

  return (
    <div className="max-w-sm mx-auto">
      <Panel>
        <h1 className="text-base mb-4">Registrieren</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-semibold">
            E-Mail
            <input type="email" required className="input-mc mt-1" placeholder="du@example.com" />
          </label>
          <label className="text-sm font-semibold">
            Minecraft-Ingame-Name
            <input
              type="text"
              required
              className="input-mc mt-1"
              placeholder="z. B. Mogi"
              value={ingameName}
              onChange={(e) => setIngameName(e.target.value)}
            />
          </label>
          <label className="text-sm font-semibold">
            Passwort
            <input type="password" required minLength={8} className="input-mc mt-1" placeholder="mind. 8 Zeichen" />
          </label>
          <Button variant="green" type="submit" className="mt-2">
            Konto erstellen
          </Button>
        </form>
        <p className="text-xs mt-4 text-center text-muted">
          Schon registriert?{" "}
          <Link href="/login" className="underline">
            Einloggen
          </Link>
        </p>
      </Panel>
    </div>
  );
}
