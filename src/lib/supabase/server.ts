import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase-Client für Server Components/Actions (liest/schreibt Session-Cookies). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component ohne Schreibrecht auf Cookies – wird vom Middleware-Refresh abgedeckt.
          }
        },
      },
    },
  );
}
