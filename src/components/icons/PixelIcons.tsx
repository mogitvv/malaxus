import type { JSX, SVGProps } from "react";

/**
 * Alle Icons hier sind selbst gezeichnete Pixel-Art (keine Mojang-Assets).
 * Jede Zeile eines Icons wird mit `row(...)` aus Farbsegmenten zusammengesetzt,
 * z. B. row(["." , 2], ["K", 10], ["." , 2]) -> 2 leere, 10 schwarze, 2 leere Zellen.
 * Das verhindert Tippfehler bei der Breite (jede Zeile summiert sich automatisch).
 */
type Segment = [string, number];
function row(...segments: Segment[]): string {
  return segments.map(([ch, n]) => ch.repeat(n)).join("");
}

type Palette = Record<string, string>;

interface IconBaseProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function PixelGrid({
  grid,
  palette,
  size = 24,
  ...rest
}: { grid: string[]; palette: Palette } & IconBaseProps): JSX.Element {
  const cols = grid[0]?.length ?? 0;
  const rows = grid.length;
  const rects: JSX.Element[] = [];
  grid.forEach((line, y) => {
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch === "." || ch === " ") continue;
      const color = palette[ch];
      if (!color) continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />);
    }
  });
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {rects}
    </svg>
  );
}

/** Erzeugt die Rauten-Form eines Edelstein-Icons (spitz oben/unten, breit in der Mitte). */
function gemGrid(w = 14): string[] {
  const grid: string[] = [];
  for (let r = 0; r < w; r++) {
    const half = Math.min(r, w - 1 - r);
    const start = Math.max(0, w / 2 - 1 - half);
    const end = Math.min(w - 1, w / 2 + half);
    let line = "";
    for (let x = 0; x < w; x++) {
      if (x < start || x > end) {
        line += ".";
      } else if (x === start || x === end) {
        line += "K";
      } else if (r <= w / 2 - 1) {
        line += "L";
      } else if (r <= w / 2 + 1) {
        line += "M";
      } else {
        line += "D";
      }
    }
    grid.push(line);
  }
  return grid;
}

/** Eigene, facettierte Diamant-Grafik: Grund-Raute plus handgesetzter Glanzpunkt und Schattenzonen. */
function buildDiamondGrid(): string[] {
  const grid = gemGrid(14).map((line) => line.split(""));
  const highlight: [number, number][] = [
    [3, 5], [3, 6], [4, 5], [4, 6], [2, 6], [5, 4], [6, 3],
  ];
  const sparkle: [number, number][] = [
    [3, 5], [2, 6],
  ];
  const shade: [number, number][] = [
    [9, 9], [10, 9], [10, 8], [11, 7], [8, 10], [9, 10],
  ];
  const deepShade: [number, number][] = [[12, 6], [12, 7]];
  for (const [r, c] of highlight) {
    if (grid[r]?.[c] && grid[r][c] !== ".") grid[r][c] = "H";
  }
  for (const [r, c] of sparkle) {
    if (grid[r]?.[c]) grid[r][c] = "W";
  }
  for (const [r, c] of shade) {
    if (grid[r]?.[c] && grid[r][c] !== ".") grid[r][c] = "S";
  }
  for (const [r, c] of deepShade) {
    if (grid[r]?.[c] && grid[r][c] !== ".") grid[r][c] = "X";
  }
  return grid.map((l) => l.join(""));
}

const diamondGrid = buildDiamondGrid();
const diamondPalette: Palette = {
  K: "#0b3a3d",
  L: "#d4fbfc",
  M: "#42d6e0",
  D: "#1a9aa6",
  H: "#a6f5f7",
  W: "#ffffff",
  S: "#0f7a86",
  X: "#0a5962",
};
function DiamondIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={diamondGrid} palette={diamondPalette} {...props} />;
}

const emeraldGrid = gemGrid(14);
const emeraldPalette: Palette = { K: "#0f3d1a", L: "#c9f7d1", M: "#3fb84f", D: "#1f7a2c" };
export function EmeraldIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={emeraldGrid} palette={emeraldPalette} {...props} />;
}

/** Barren-Form, wiederverwendet für Eisen, Gold und Netherite. */
function ingotGrid(): string[] {
  return [
    row([".", 14]),
    row([".", 14]),
    row([".", 14]),
    row([".", 14]),
    row([".", 4], ["K", 6], [".", 4]),
    row([".", 3], ["K", 1], ["L", 6], ["K", 1], [".", 3]),
    row([".", 2], ["K", 1], ["S", 8], ["K", 1], [".", 2]),
    row([".", 1], ["K", 1], ["S", 10], ["K", 1], [".", 1]),
    row(["K", 1], ["S", 12], ["K", 1]),
    row(["K", 14]),
    row([".", 14]),
    row([".", 14]),
    row([".", 14]),
    row([".", 14]),
  ];
}

const ingot = ingotGrid();
const ironPalette: Palette = { K: "#2a2a2a", L: "#f5f5f5", S: "#c7c9cc" };
export function IronIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={ingot} palette={ironPalette} {...props} />;
}

const goldPalette: Palette = { K: "#4a3a08", L: "#fff0a8", S: "#f0c419" };
export function GoldIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={ingot} palette={goldPalette} {...props} />;
}

const netheritePalette: Palette = { K: "#000000", L: "#5a4a4a", S: "#2b2626" };
export function NetheriteIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={ingot} palette={netheritePalette} {...props} />;
}

const coalGrid = [
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 4], ["K", 6], [".", 4]),
  row([".", 2], ["K", 1], ["C", 8], ["K", 1], [".", 2]),
  row([".", 1], ["K", 1], ["C", 10], ["K", 1], [".", 1]),
  row(["K", 1], ["C", 5], ["H", 1], ["C", 6], ["K", 1]),
  row(["K", 1], ["C", 12], ["K", 1]),
  row([".", 1], ["K", 1], ["C", 10], ["K", 1], [".", 1]),
  row([".", 2], ["K", 1], ["C", 8], ["K", 1], [".", 2]),
  row([".", 4], ["K", 6], [".", 4]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
];
const coalPalette: Palette = { K: "#111111", C: "#262626", H: "#4d4d4d" };
export function CoalIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={coalGrid} palette={coalPalette} {...props} />;
}

const woodGrid = [
  row([".", 14]),
  row([".", 14]),
  row([".", 2], ["K", 10], [".", 2]),
  row([".", 1], ["K", 1], ["B", 10], ["K", 1], [".", 1]),
  row(["K", 1], ["B", 2], ["W", 8], ["B", 2], ["K", 1]),
  row(["K", 1], ["B", 2], ["W", 8], ["B", 2], ["K", 1]),
  row(["K", 1], ["B", 2], ["W", 3], ["R", 2], ["W", 3], ["B", 2], ["K", 1]),
  row(["K", 1], ["B", 2], ["W", 8], ["B", 2], ["K", 1]),
  row(["K", 1], ["B", 2], ["W", 8], ["B", 2], ["K", 1]),
  row([".", 1], ["K", 1], ["B", 10], ["K", 1], [".", 1]),
  row([".", 2], ["K", 10], [".", 2]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
];
const woodPalette: Palette = { K: "#2e1d0e", B: "#5a3a1e", W: "#caa066", R: "#a67c3d" };
export function WoodIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={woodGrid} palette={woodPalette} {...props} />;
}

const stonePalette: Palette = { K: "#111111", R: "#9a9a9a", C: "#848484", Y: "#8f8f8f" };
export function StoneIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={oreGrid} palette={stonePalette} {...props} />;
}

const glassGrid = [
  row([".", 14]),
  row([".", 14]),
  row(["K", 14]),
  row(["K", 1], ["G", 5], ["K", 2], ["G", 5], ["K", 1]),
  row(["K", 1], ["G", 5], ["K", 2], ["G", 5], ["K", 1]),
  row(["K", 1], ["G", 5], ["K", 2], ["G", 5], ["K", 1]),
  row(["K", 14]),
  row(["K", 1], ["G", 5], ["K", 2], ["G", 5], ["K", 1]),
  row(["K", 1], ["G", 5], ["K", 2], ["G", 5], ["K", 1]),
  row(["K", 1], ["G", 5], ["K", 2], ["G", 5], ["K", 1]),
  row(["K", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
];
const glassPalette: Palette = { K: "#2a3a3d", G: "#d7f3f5" };
export function GlassIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={glassGrid} palette={glassPalette} {...props} />;
}

const chestGrid = [
  row([".", 14]),
  row([".", 14]),
  row([".", 2], ["K", 10], [".", 2]),
  row([".", 2], ["K", 1], ["L", 8], ["K", 1], [".", 2]),
  row([".", 2], ["K", 1], ["L", 8], ["K", 1], [".", 2]),
  row([".", 2], ["K", 10], [".", 2]),
  row([".", 1], ["K", 12], [".", 1]),
  row(["K", 1], ["B", 5], ["G", 2], ["B", 5], ["K", 1]),
  row(["K", 1], ["B", 5], ["G", 2], ["B", 5], ["K", 1]),
  row(["K", 1], ["B", 12], ["K", 1]),
  row(["K", 1], ["B", 12], ["K", 1]),
  row(["K", 14]),
  row([".", 14]),
  row([".", 14]),
];
const chestPalette: Palette = { K: "#1b1206", L: "#c79a5f", B: "#8a5a2b", G: "#ffd93d" };
export function ChestIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={chestGrid} palette={chestPalette} {...props} />;
}

const anvilGrid = [
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 2], ["K", 10], [".", 2]),
  row([".", 2], ["K", 1], ["S", 8], ["K", 1], [".", 2]),
  row([".", 3], ["K", 1], ["S", 6], ["K", 1], [".", 3]),
  row([".", 4], ["K", 1], ["S", 4], ["K", 1], [".", 4]),
  row([".", 3], ["K", 8], [".", 3]),
  row([".", 2], ["K", 1], ["S", 8], ["K", 1], [".", 2]),
  row([".", 1], ["K", 1], ["S", 10], ["K", 1], [".", 1]),
  row(["K", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
];
const anvilPalette: Palette = { K: "#1a1a1a", S: "#9a9a9a" };
export function AnvilIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={anvilGrid} palette={anvilPalette} {...props} />;
}

const minecartGrid = [
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 1], ["K", 12], [".", 1]),
  row([".", 1], ["K", 1], ["M", 10], ["K", 1], [".", 1]),
  row([".", 2], ["K", 1], ["M", 8], ["K", 1], [".", 2]),
  row([".", 3], ["K", 8], [".", 3]),
  row([".", 4], ["K", 6], [".", 4]),
  row([".", 2], ["K", 3], [".", 4], ["K", 3], [".", 2]),
  row([".", 2], ["K", 1], ["H", 1], ["K", 1], [".", 4], ["K", 1], ["H", 1], ["K", 1], [".", 2]),
  row([".", 2], ["K", 3], [".", 4], ["K", 3], [".", 2]),
  row([".", 14]),
  row([".", 14]),
];
const minecartPalette: Palette = { K: "#111111", M: "#707070", H: "#c9a227" };
export function MinecartIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={minecartGrid} palette={minecartPalette} {...props} />;
}

const bellGrid = [
  row([".", 14]),
  row([".", 14]),
  row([".", 6], ["K", 2], [".", 6]),
  row([".", 5], ["K", 1], ["Y", 2], ["K", 1], [".", 5]),
  row([".", 4], ["K", 1], ["Y", 4], ["K", 1], [".", 4]),
  row([".", 3], ["K", 1], ["Y", 6], ["K", 1], [".", 3]),
  row([".", 2], ["K", 1], ["Y", 8], ["K", 1], [".", 2]),
  row([".", 1], ["K", 1], ["Y", 10], ["K", 1], [".", 1]),
  row(["K", 1], ["Y", 12], ["K", 1]),
  row(["K", 14]),
  row([".", 6], ["K", 2], [".", 6]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
];
const bellPalette: Palette = { K: "#1a1a1a", Y: "#e0b84a" };
export function BellIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={bellGrid} palette={bellPalette} {...props} />;
}

const clockGrid = [
  row([".", 14]),
  row([".", 14]),
  row([".", 5], ["K", 4], [".", 5]),
  row([".", 3], ["K", 1], ["F", 6], ["K", 1], [".", 3]),
  row([".", 2], ["K", 1], ["F", 8], ["K", 1], [".", 2]),
  row([".", 1], ["K", 1], ["F", 10], ["K", 1], [".", 1]),
  row(["K", 1], ["F", 12], ["K", 1]),
  row(["K", 1], ["F", 5], ["K", 1], ["F", 6], ["K", 1]),
  row(["K", 1], ["F", 6], ["K", 1], ["F", 5], ["K", 1]),
  row(["K", 1], ["F", 12], ["K", 1]),
  row([".", 1], ["K", 1], ["F", 10], ["K", 1], [".", 1]),
  row([".", 2], ["K", 1], ["F", 8], ["K", 1], [".", 2]),
  row([".", 3], ["K", 1], ["F", 6], ["K", 1], [".", 3]),
  row([".", 5], ["K", 4], [".", 5]),
];
const clockPalette: Palette = { K: "#1a1a1a", F: "#e8e8e8" };
export function ClockIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={clockGrid} palette={clockPalette} {...props} />;
}

const notebookGrid = [
  row([".", 14]),
  row([".", 14]),
  row([".", 2], ["K", 10], [".", 2]),
  row([".", 2], ["K", 1], ["P", 1], ["B", 7], ["K", 1], [".", 2]),
  row([".", 2], ["K", 1], ["P", 1], ["B", 7], ["K", 1], [".", 2]),
  row([".", 2], ["K", 1], ["P", 1], ["D", 7], ["K", 1], [".", 2]),
  row([".", 2], ["K", 1], ["P", 1], ["B", 7], ["K", 1], [".", 2]),
  row([".", 2], ["K", 1], ["P", 1], ["D", 7], ["K", 1], [".", 2]),
  row([".", 2], ["K", 1], ["P", 1], ["B", 7], ["K", 1], [".", 2]),
  row([".", 2], ["K", 10], [".", 2]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
];
const notebookPalette: Palette = { K: "#1a1a1a", P: "#7a2424", B: "#f0e6c8", D: "#c9b98a" };
export function NotebookIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={notebookGrid} palette={notebookPalette} {...props} />;
}

const oreGrid = [
  row([".", 14]),
  row([".", 14]),
  row([".", 4], ["K", 6], [".", 4]),
  row([".", 2], ["K", 1], ["R", 8], ["K", 1], [".", 2]),
  row([".", 1], ["K", 1], ["R", 10], ["K", 1], [".", 1]),
  row(["K", 1], ["R", 5], ["C", 2], ["R", 5], ["K", 1]),
  row(["K", 1], ["R", 12], ["K", 1]),
  row(["K", 1], ["R", 4], ["Y", 2], ["R", 6], ["K", 1]),
  row(["K", 1], ["R", 12], ["K", 1]),
  row([".", 1], ["K", 1], ["R", 10], ["K", 1], [".", 1]),
  row([".", 2], ["K", 1], ["R", 8], ["K", 1], [".", 2]),
  row([".", 4], ["K", 6], [".", 4]),
  row([".", 14]),
  row([".", 14]),
];
const orePalette: Palette = { K: "#111111", R: "#8a8a8a", C: "#5fe0e0", Y: "#ffd93d" };
export function OreIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={oreGrid} palette={orePalette} {...props} />;
}

const blockGrid = [
  row([".", 14]),
  row([".", 1], ["K", 12], [".", 1]),
  row(["K", 1], ["S1", 12], ["K", 1]),
  row(["K", 1], ["S1", 12], ["K", 1]),
  row(["K", 1], ["S1", 12], ["K", 1]),
  row(["K", 14]),
  row(["K", 1], ["S2", 12], ["K", 1]),
  row(["K", 1], ["S2", 12], ["K", 1]),
  row(["K", 1], ["S2", 12], ["K", 1]),
  row(["K", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
];
const blockPalette: Palette = { K: "#111111", S1: "#a8a8a8", S2: "#7d7d7d" };
export function BlockIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={blockGrid} palette={blockPalette} {...props} />;
}

const shulkerGrid = [
  row([".", 14]),
  row([".", 2], ["K", 10], [".", 2]),
  row([".", 1], ["K", 1], ["P", 10], ["K", 1], [".", 1]),
  row(["K", 1], ["P", 12], ["K", 1]),
  row(["K", 1], ["P", 3], ["W", 1], ["P", 4], ["W", 1], ["P", 3], ["K", 1]),
  row(["K", 1], ["P", 12], ["K", 1]),
  row(["K", 1], ["P", 12], ["K", 1]),
  row(["K", 1], ["P", 12], ["K", 1]),
  row([".", 1], ["K", 1], ["P", 10], ["K", 1], [".", 1]),
  row([".", 2], ["K", 10], [".", 2]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
  row([".", 14]),
];
const shulkerPalette: Palette = { K: "#111111", P: "#6b3fa0", W: "#e8e0f0" };
export function ShulkerIcon(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={shulkerGrid} palette={shulkerPalette} {...props} />;
}

function rects(
  cells: Array<[number, number, number, number, string]>,
  size: number,
  viewBox = 14,
  rest: IconBaseProps = {},
): JSX.Element {
  return (
    <svg
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {cells.map(([x, y, w, h, fill], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
    </svg>
  );
}

export function CheckIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const g = "#4f9e3a";
  return rects(
    [
      [2, 7, 2, 2, g],
      [3, 8, 2, 2, g],
      [4, 9, 2, 2, g],
      [5, 10, 2, 2, g],
      [6, 9, 2, 2, g],
      [7, 8, 2, 2, g],
      [8, 7, 2, 2, g],
      [9, 6, 2, 2, g],
      [10, 5, 2, 2, g],
      [11, 4, 2, 2, g],
      [12, 3, 2, 2, g],
    ],
    size,
    14,
    rest,
  );
}

export function XMarkIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const r = "#c13b3b";
  return rects(
    [
      [2, 2, 2, 2, r],
      [4, 4, 2, 2, r],
      [6, 6, 2, 2, r],
      [8, 8, 2, 2, r],
      [10, 10, 2, 2, r],
      [10, 2, 2, 2, r],
      [8, 4, 2, 2, r],
      [4, 8, 2, 2, r],
      [2, 10, 2, 2, r],
    ],
    size,
    14,
    rest,
  );
}

export function SearchIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const c = "#e3e3e3";
  return rects(
    [
      [2, 2, 8, 2, c],
      [2, 8, 8, 2, c],
      [2, 2, 2, 8, c],
      [8, 2, 2, 8, c],
      [9, 9, 2, 2, c],
      [11, 11, 2, 2, c],
    ],
    size,
    14,
    rest,
  );
}

export function SunIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const y = "#ffd93d";
  return rects(
    [
      [5, 5, 4, 4, y],
      [6, 1, 2, 2, y],
      [6, 11, 2, 2, y],
      [1, 6, 2, 2, y],
      [11, 6, 2, 2, y],
      [2, 2, 2, 2, y],
      [10, 2, 2, 2, y],
      [2, 10, 2, 2, y],
      [10, 10, 2, 2, y],
    ],
    size,
    14,
    rest,
  );
}

export function MoonIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const c = "#c7cfe8";
  return rects(
    [
      [6, 1, 4, 2, c],
      [4, 3, 2, 2, c],
      [9, 3, 2, 2, c],
      [3, 5, 2, 6, c],
      [10, 5, 2, 3, c],
      [4, 9, 2, 2, c],
      [9, 7, 2, 4, c],
      [6, 11, 4, 2, c],
    ],
    size,
    14,
    rest,
  );
}

export function UserIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  return rects(
    [
      [5, 2, 4, 4, "#caa472"],
      [3, 7, 8, 6, "#3b6ec1"],
    ],
    size,
    14,
    rest,
  );
}

export function PickaxeIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const s = "#9a9a9a";
  const w = "#8a5a2b";
  return rects(
    [
      [2, 2, 2, 2, s],
      [4, 3, 2, 2, s],
      [6, 4, 2, 2, s],
      [8, 3, 2, 2, s],
      [10, 2, 2, 2, s],
      [6, 5, 2, 2, w],
      [7, 7, 2, 2, w],
      [8, 9, 2, 2, w],
      [9, 11, 2, 2, w],
    ],
    size,
    14,
    rest,
  );
}

export function WheatIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const g = "#e8c547";
  const s = "#a98b3d";
  return rects(
    [
      [6, 0, 2, 2, g],
      [4, 2, 2, 2, g],
      [8, 2, 2, 2, g],
      [5, 4, 2, 2, g],
      [7, 4, 2, 2, g],
      [6, 6, 2, 2, g],
      [6, 8, 2, 5, s],
    ],
    size,
    14,
    rest,
  );
}

export function RedstoneIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  return rects(
    [
      [2, 6, 10, 2, "#7a1d1d"],
      [6, 2, 2, 10, "#7a1d1d"],
      [5, 5, 4, 4, "#ff3b3b"],
    ],
    size,
    14,
    rest,
  );
}

export function StarIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const g = "#ffd93d";
  return rects(
    [
      [6, 3, 2, 8, g],
      [3, 6, 8, 2, g],
      [6, 6, 2, 2, "#fff6cf"],
      [3, 3, 2, 2, g],
      [9, 3, 2, 2, g],
      [3, 9, 2, 2, g],
      [9, 9, 2, 2, g],
    ],
    size,
    14,
    rest,
  );
}

/** Markenzeichen: ein goldener, facettierter Kristall statt eines Buchstabens. */
const logoGrid = gemGrid(12);
const logoPalette: Palette = { K: "#5c4300", L: "#fff3c4", M: "#ffd93d", D: "#c99a1a" };
export function LogoMark(props: IconBaseProps): JSX.Element {
  return <PixelGrid grid={logoGrid} palette={logoPalette} {...props} />;
}

export function SwordIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const s = "#d7dadd";
  const g = "#e8c547";
  const w = "#6b4a26";
  return rects(
    [
      [9, 1, 2, 2, s],
      [8, 3, 2, 2, s],
      [7, 5, 2, 2, s],
      [6, 7, 2, 2, s],
      [4, 8, 6, 2, g],
      [6, 10, 2, 3, w],
    ],
    size,
    14,
    rest,
  );
}

export function AppleIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const r = "#c23b3b";
  const d = "#8f251f";
  return rects(
    [
      [5, 2, 4, 1, r],
      [4, 3, 6, 6, r],
      [4, 9, 6, 1, d],
      [7, 1, 1, 2, "#5a3a1e"],
      [8, 1, 2, 1, "#4f9e3a"],
    ],
    size,
    14,
    rest,
  );
}

export function TotemIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const gold = "#e8c547";
  const body = "#2f6b20";
  const dark = "#1a1a1a";
  const base = "#5a3a1e";
  return rects(
    [
      [5, 1, 4, 3, gold],
      [6, 2, 1, 1, dark],
      [8, 2, 1, 1, dark],
      [4, 4, 6, 7, body],
      [3, 5, 1, 4, "#1f4a15"],
      [10, 5, 1, 4, "#1f4a15"],
      [4, 11, 6, 2, base],
    ],
    size,
    14,
    rest,
  );
}

export function BeaconIcon({ size = 24, ...rest }: IconBaseProps): JSX.Element {
  const beam = "#eaffff";
  const glass = "#9be8ea";
  const obsidian1 = "#241a33";
  const obsidian2 = "#1a1326";
  return rects(
    [
      [6, 0, 2, 5, beam],
      [6, 5, 2, 2, glass],
      [5, 7, 4, 2, glass],
      [4, 9, 6, 2, obsidian1],
      [3, 11, 8, 2, obsidian2],
    ],
    size,
    14,
    rest,
  );
}

export { DiamondIcon };
