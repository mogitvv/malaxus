"use client";

import type { JSX } from "react";
import { useTheme } from "@/lib/theme-context";
import { SunIcon, MoonIcon } from "@/components/icons/PixelIcons";

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-mc px-2 py-2"
      aria-label={theme === "light" ? "Dark Mode aktivieren" : "Light Mode aktivieren"}
      title={theme === "light" ? "Dark Mode" : "Light Mode"}
    >
      {theme === "light" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
    </button>
  );
}
