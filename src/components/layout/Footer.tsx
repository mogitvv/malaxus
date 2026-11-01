import type { JSX } from "react";
import { siteConfig } from "@/config/site";
import { DiamondIcon } from "@/components/icons/PixelIcons";

export function Footer(): JSX.Element {
  return (
    <footer className="texture-dirt border-t-4 border-black/60 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-[11px] text-white/85 text-center">
        <DiamondIcon size={14} />
        <span>
          {siteConfig.name} wird von Mogi und Felix betrieben – unser Lieferdienst für den Minecraft-Server. Bezahlt
          wird nur in {siteConfig.currencyName} im Spiel, kein echtes Geld.
        </span>
      </div>
    </footer>
  );
}
