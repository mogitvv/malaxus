"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { JSX, ReactNode } from "react";
import { createClient } from "./supabase/client";
import type { UserRole } from "./types";

interface Profile {
  id: string;
  email: string;
  ingameName: string;
  role: UserRole;
  avatarColor: string;
}

interface AuthResult {
  error: string | null;
  /** true, wenn Supabase eine Bestätigungs-E-Mail verschickt hat (noch keine Session). */
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  role: UserRole | "guest";
  ingameName: string | null;
  email: string | null;
  avatarColor: string;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, ingameName: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  setAvatarColor: (color: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [supabase] = useState(() => createClient());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile(userId: string) {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (mounted && data) {
        setProfile({
          id: data.id,
          email: data.email,
          ingameName: data.ingame_name,
          role: data.role,
          avatarColor: data.avatar_color ?? "#ffd93d",
        });
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id).finally(() => mounted && setLoading(false));
      } else {
        if (mounted) setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function login(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function register(email: string, password: string, ingameName: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { ingame_name: ingameName } },
    });
    if (error) return { error: error.message };
    return { error: null, needsEmailConfirmation: !data.session };
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  async function updateAvatarColor(color: string) {
    if (!profile) return;
    await supabase.from("profiles").update({ avatar_color: color }).eq("id", profile.id);
    setProfile((prev) => (prev ? { ...prev, avatarColor: color } : prev));
  }

  return (
    <AuthContext.Provider
      value={{
        role: profile?.role ?? "guest",
        ingameName: profile?.ingameName ?? null,
        email: profile?.email ?? null,
        avatarColor: profile?.avatarColor ?? "#ffd93d",
        loading,
        login,
        register,
        logout,
        setAvatarColor: updateAvatarColor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden");
  return ctx;
}
