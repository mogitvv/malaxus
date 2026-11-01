"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent, type JSX } from "react";
import { siteConfig } from "@/config/site";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { LogoMark, MinecartIcon, SearchIcon, UserIcon } from "@/components/icons/PixelIcons";
import { ThemeToggle } from "./ThemeToggle";

export function Header(): JSX.Element {
  const { totalCount } = useCart();
  const { role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
  }

  function navClass(href: string, extra = "") {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `btn-mc text-[10px] px-2 py-2 ${active ? "btn-mc-gold" : ""} ${extra}`;
  }

  return (
    <header className="texture-wood border-b-4 border-black/60 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[var(--mc-gold-dark)] shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
            <LogoMark size={26} />
          </span>
          <span className="font-pixel text-sm sm:text-base text-[var(--mc-gold)] drop-shadow-[2px_2px_0_rgba(0,0,0,0.7)]">
            {siteConfig.name}
          </span>
        </Link>

        <form onSubmit={handleSearch} className="order-3 sm:order-none flex-1 min-w-[160px] max-w-sm flex gap-1">
          <input
            className="input-mc"
            placeholder="Items suchen…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-mc px-2" aria-label="Suchen">
            <SearchIcon size={16} />
          </button>
        </form>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className={navClass("/")}>
            Shop
          </Link>

          {role !== "guest" && (
            <Link href="/konto" className={navClass("/konto")}>
              Konto
            </Link>
          )}

          {role === "admin" && (
            <Link href="/admin" className={navClass("/admin")}>
              Admin
            </Link>
          )}

          {role === "guest" && (
            <Link href="/login" className="btn-mc text-[10px] px-2 py-2 flex items-center gap-1">
              <UserIcon size={14} />
              Login
            </Link>
          )}

          <ThemeToggle />

          <Link href="/warenkorb" className="btn-mc btn-mc-blue relative px-2 py-2" aria-label="Warenkorb">
            <MinecartIcon size={18} />
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--mc-red)] text-white text-[9px] font-pixel w-5 h-5 flex items-center justify-center rounded-full border border-black">
                {totalCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
