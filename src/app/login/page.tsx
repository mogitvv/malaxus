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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error === "Invalid login credentials" ? "E-Mail oder Passwort falsch." : result.error);
      return;
    }
    router.push("/konto");
  }

  return (
    <div className="max-w-sm mx-auto">
      <Panel>
        <h1 className="text-base mb-4">Anmelden</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-semibold">
            E-Mail
            <input
              type="email"
              required
              className="input-mc mt-1"
              placeholder="du@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="text-sm font-semibold">
            Passwort
            <input
              type="password"
              required
              className="input-mc mt-1"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button variant="green" type="submit" className="mt-2" disabled={submitting}>
            {submitting ? "Einloggen…" : "Einloggen"}
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
