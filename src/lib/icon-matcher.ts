import type { JSX, SVGProps } from "react";
import {
  IronIcon,
  GoldIcon,
  NetheriteIcon,
  CoalIcon,
  EmeraldIcon,
  WoodIcon,
  StoneIcon,
  GlassIcon,
  SwordIcon,
  AppleIcon,
  TotemIcon,
  BeaconIcon,
  WheatIcon,
  RedstoneIcon,
  PickaxeIcon,
  ShulkerIcon,
  DiamondIcon,
  ChestIcon,
  StarIcon,
  BlockIcon,
  OreIcon,
} from "@/components/icons/PixelIcons";

type IconComponent = (props: SVGProps<SVGSVGElement> & { size?: number }) => JSX.Element;

/**
 * Jeder Eintrag listet Stichwörter (Deutsch + Englisch, wie Minecraft-Item-IDs),
 * die beim Tippen im Produktname erkannt werden. Erster Treffer gewinnt.
 * Damit erscheint beim Admin-Formular automatisch ein passendes Icon,
 * z. B. "Iron Ingot" oder "Eisenbarren" -> IronIcon.
 */
const keywordIcons: Array<{ keywords: string[]; icon: IconComponent }> = [
  { keywords: ["netherite"], icon: NetheriteIcon },
  { keywords: ["iron", "eisen"], icon: IronIcon },
  { keywords: ["gold"], icon: GoldIcon },
  { keywords: ["coal", "kohle"], icon: CoalIcon },
  { keywords: ["emerald", "smaragd"], icon: EmeraldIcon },
  { keywords: ["diamond", "diamant"], icon: DiamondIcon },
  { keywords: ["wood", "holz", "plank", "planke", "log", "stamm"], icon: WoodIcon },
  { keywords: ["glass", "glas"], icon: GlassIcon },
  { keywords: ["stone", "stein", "cobble", "pflaster"], icon: StoneIcon },
  { keywords: ["sword", "schwert"], icon: SwordIcon },
  { keywords: ["pickaxe", "spitzhacke", "axe", "axt", "shovel", "schaufel", "hoe", "hacke"], icon: PickaxeIcon },
  { keywords: ["apple", "apfel", "steak", "beef", "bread", "brot", "carrot", "karotte"], icon: AppleIcon },
  { keywords: ["wheat", "weizen", "farm"], icon: WheatIcon },
  { keywords: ["redstone"], icon: RedstoneIcon },
  { keywords: ["shulker"], icon: ShulkerIcon },
  { keywords: ["totem"], icon: TotemIcon },
  { keywords: ["beacon"], icon: BeaconIcon },
  { keywords: ["chest", "truhe"], icon: ChestIcon },
  { keywords: ["ore", "erz"], icon: OreIcon },
  { keywords: ["star", "rare", "selten", "elytra", "netherstar"], icon: StarIcon },
];

/** Sucht anhand des Produktnamens ein passendes, selbst gezeichnetes Icon. */
export function matchIconByName(name: string): IconComponent | null {
  const lower = name.toLowerCase();
  for (const entry of keywordIcons) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.icon;
    }
  }
  return null;
}

export { BlockIcon as FallbackIcon };
