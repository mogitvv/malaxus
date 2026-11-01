import type { JSX } from "react";
import { matchIconByName } from "@/lib/icon-matcher";
import { ChestIcon } from "./PixelIcons";

/** Zeigt ein zum Produktnamen passendes Icon, sonst ein neutrales Truhe-Icon als Rückfall. */
export function ProductIcon({ name, size = 24 }: { name: string; size?: number }): JSX.Element {
  const Matched = matchIconByName(name);
  if (Matched) return <Matched size={size} />;
  return <ChestIcon size={size} />;
}
