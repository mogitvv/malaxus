"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type JSX } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [ingameName, setIngameName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await register(email, password, ingameName);
    setSubmitting(false);

    if (result.error) {
      setError(
        result.error.includes("duplicate") || result.error.toLowerCase().includes("unique")
          ? "Dieser Ingame-Name ist schon vergeben."
          : result.error,
      );
      return;
    }

    if (result.needsEmailConfirmation) {
      setConfirmPending(true);
      return;
    }

    router.push("/konto");
  }

  if (confirmPending) {
    return (
      <div className="max-w-sm mx-auto">
        <Panel className="text-center flex flex-col gap-2">
          <h1 className="text-base">Fast geschafft!</h1>
          <p className="text-sm text-muted">
            Wir haben dir eine Bestätigungs-E-Mail an <strong>{email}</strong> geschickt. Klick auf den Link darin,
            dann kannst du dich einloggen.
          </p>
          <Link href="/login" className="btn-mc btn-mc-blue self-center mt-2">
            Zum Login
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <Panel>
        <h1 className="text-base mb-4">Registrieren</h1>
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
            <input
              type="password"
              required
              minLength={8}
              className="input-mc mt-1"
              placeholder="mind. 8 Zeichen"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button variant="green" type="submit" className="mt-2" disabled={submitting}>
            {submitting ? "Wird erstellt…" : "Konto erstellen"}
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
