import React from "react";

export type Pal = Record<string, string | null | undefined>;

const cache = new Map<string, { url: string; w: number; h: number; off: number }>();

// Scale2x (EPX): doubles resolution and rounds diagonal edges, so sprites read finer without redrawing them.
const scale2x = (rows: string[]) => {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? "." : rows[y][x] ?? ".");
  const out: string[] = [];
  for (let y = 0; y < h; y++) {
    let top = "";
    let bottom = "";
    for (let x = 0; x < w; x++) {
      const p = at(x, y);
      const a = at(x, y - 1);
      const b = at(x + 1, y);
      const c = at(x - 1, y);
      const d = at(x, y + 1);
      top += (c === a && c !== d && a !== b ? a : p) + (a === b && a !== c && b !== d ? b : p);
      bottom += (d === c && d !== b && c !== a ? c : p) + (b === d && b !== a && d !== c ? d : p);
    }
    out.push(top, bottom);
  }
  return out;
};

// Rasterise an ASCII sprite once; the scene then uses cheap scaled <img> tags.
// Scale2x `passes` round the contours; the result is resampled to `res` subpixels per sprite pixel.
// `outline` traces a one-subpixel contour around the shape.
export const sprite = (rows: string[], pal: Pal, passes = 0, outline: string | null = null, res = 2 ** passes) => {
  const key = `${passes}|${res}|${outline}|` + rows.join("|") + JSON.stringify(pal);
  const hit = cache.get(key);
  if (hit) return hit;
  let src = rows;
  for (let i = 0; i < passes; i++) src = scale2x(src);
  const factor = 2 ** passes;
  const grid = outline ? addOutline(src) : src;
  const pad = outline ? 1 : 0;
  const out = res === factor ? grid : resample(grid, res / factor);
  const result = rasterise(out, { ...pal, "§": outline }, res, pad / factor);
  cache.set(key, result);
  return result;
};

const OUTLINE_CH = "§";

const addOutline = (rows: string[]) => {
  const w = Math.max(...rows.map((r) => r.length)) + 2;
  const h = rows.length + 2;
  const at = (x: number, y: number) => rows[y - 1]?.[x - 1] ?? ".";
  const out: string[] = [];
  for (let y = 0; y < h; y++) {
    let line = "";
    for (let x = 0; x < w; x++) {
      const c = at(x, y);
      if (c !== ".") line += c;
      else if (at(x - 1, y) !== "." || at(x + 1, y) !== "." || at(x, y - 1) !== "." || at(x, y + 1) !== ".") line += OUTLINE_CH;
      else line += ".";
    }
    out.push(line);
  }
  return out;
};

// Nearest-neighbour resample of a character grid.
const resample = (rows: string[], k: number) => {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const nw = Math.max(1, Math.round(w * k));
  const nh = Math.max(1, Math.round(h * k));
  return Array.from({ length: nh }, (_, y) => {
    const row = rows[Math.min(h - 1, Math.floor((y + 0.5) / k))];
    return Array.from({ length: nw }, (_, x) => row[Math.min(w - 1, Math.floor((x + 0.5) / k))] ?? ".").join("");
  });
};

const rasterise = (rows: string[], pal: Pal, res: number, off: number) => {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  });
  return { url: c.toDataURL(), w: w / res, h: h / res, off };
};

// Goat art: Scale2x rounds the contours, then it is resampled so one subpixel is ~4 screen px
// at the pin size (4 px per sprite pixel) — the same pixel grain as the terrain.
export const DETAIL = 2;
export const RES = 2;
export const OUTLINE = "rgba(52,40,48,0.6)";

// Offline stills capture before <img> paints, so previews draw sprites as pixel divs instead.
export const PixelDivs = React.createContext(false);

export const Spr: React.FC<{
  rows: string[];
  pal: Pal;
  x: number;
  y: number;
  px: number;
  style?: React.CSSProperties;
  outline?: string | null;
}> = ({ rows, pal, x, y, px, style, outline = OUTLINE }) => {
  const asDivs = React.useContext(PixelDivs);
  if (asDivs) {
    return (
      <div style={{ position: "absolute", left: x * px, top: y * px, pointerEvents: "none", ...style }}>
        {rows.flatMap((row, ry) =>
          [...row].map((c, rx) =>
            pal[c] ? (
              <div
                key={`${rx}-${ry}`}
                style={{ position: "absolute", left: rx * px, top: ry * px, width: px, height: px, background: pal[c]! }}
              />
            ) : null,
          ),
        )}
      </div>
    );
  }
  const s = sprite(rows, pal, DETAIL, outline, RES);
  return (
    <img
      src={s.url}
      draggable={false}
      alt=""
      style={{
        position: "absolute",
        left: (x - s.off) * px,
        top: (y - s.off) * px,
        width: s.w * px,
        height: s.h * px,
        imageRendering: "pixelated",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
};

export const Box: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  px: number;
  color: string;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, px, color, style }) => (
  <div
    style={{
      position: "absolute",
      left: x * px,
      top: y * px,
      width: w * px,
      height: h * px,
      background: color,
      pointerEvents: "none",
      ...style,
    }}
  />
);
