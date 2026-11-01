"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type JSX } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const { login } = useAuth();
  const [demoRole, setDemoRole] = useState<"customer" | "admin">("customer");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Demo: hier kommt später der echte Login gegen die Datenbank (Supabase Auth).
    login(demoRole, demoRole === "admin" ? "Mogi" : "Mogi");
    router.push(demoRole === "admin" ? "/admin" : "/konto");
  }

  return (
    <div className="max-w-sm mx-auto">
      <Panel>
        <h1 className="text-base mb-4">Anmelden</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-semibold">
            E-Mail
            <input type="email" required className="input-mc mt-1" placeholder="du@example.com" />
          </label>
          <label className="text-sm font-semibold">
            Passwort
            <input type="password" required className="input-mc mt-1" placeholder="••••••••" />
          </label>

          <div className="border rounded p-2 mt-1" style={{ background: "var(--mc-subtle)", borderColor: "var(--mc-subtle-strong)" }}>
            <p className="text-[10px] text-[var(--mc-text-muted)] mb-1">
              Demo ohne Backend – wie soll der Login dich anmelden?
            </p>
            <div className="flex gap-3 text-xs">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="demoRole"
                  checked={demoRole === "customer"}
                  onChange={() => setDemoRole("customer")}
                />
                Als Kunde
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="demoRole"
                  checked={demoRole === "admin"}
                  onChange={() => setDemoRole("admin")}
                />
                Als Admin
              </label>
            </div>
          </div>

          <Button variant="green" type="submit" className="mt-2">
            Einloggen
          </Button>
        </form>
        <p className="text-xs mt-4 text-center text-muted">
          Noch keinen Account?{" "}
          <Link href="/registrieren" className="underline">
            Registrieren
          </Link>
        </p>
      </Panel>
    </div>
  );
}
