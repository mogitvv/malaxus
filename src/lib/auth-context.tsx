"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { JSX, ReactNode } from "react";
import type { UserRole } from "./types";

interface AuthState {
  role: UserRole | "guest";
  ingameName: string | null;
}

interface AuthContextValue extends AuthState {
  /** Demo-Login ohne Backend – wird später durch echten Supabase-Auth-Flow ersetzt. */
  login: (role: UserRole, ingameName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "malaxus-auth-demo";

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<AuthState>({ role: "guest", ingameName: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState(JSON.parse(raw));
      } catch {
        // kaputte Daten im Storage ignorieren
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  function login(role: UserRole, ingameName: string) {
    setState({ role, ingameName });
  }

  function logout() {
    setState({ role: "guest", ingameName: null });
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden");
  return ctx;
}
