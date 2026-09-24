import React, { useLayoutEffect, useRef } from "react";

// World = ww × vh CSS px at zoom 1 (wider than the screen, so the map extends past the sides). Terrain is a function of world coordinates,
// redrawn per view like map tiles: screen pixels stay SCREEN_PX big, so zooming in reveals finer detail.
export type View = { z: number; tx: number; ty: number };

const SCREEN_PX = 4;


const hash2 = (x: number, y: number) => {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};



const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
// Bright winter day, several mountain layers: hazy far ranges, a middle range and the main
// peak in front, light blue sky with soft pixel clouds, a snowfield with long blue shadows.
const SKY2 = ["#bcd2ea", "#c6d9ee", "#d0e0f1", "#d9e6f4", "#e1ebf6"].map(hex);
const C = Object.fromEntries(
  Object.entries({
    // calm, low-contrast mountain so the goats are the strongest thing on screen
    lit: "#eef1f6", litShade: "#e5e9f1", litHi: "#f6f8fb", litRock: "#e5e9f1",
    sh: "#d3dbe8", shDeep: "#c9d2e2", shHi: "#dbe2ed", shRock: "#c9d2e2",
    far: "#d6e1ee", farCap: "#e4ecf5", mid: "#e6ecf4", midCap: "#f3f6fa", midShade: "#d0d9e8",
    cloud: "#f4f8fc", cloudShade: "#e8f0f8",
    fg: "#eef2f7", fgShade: "#e3e9f1", fgHi: "#ffffff",
    grass: "#a9bca4", grassDark: "#93a88f", tree: "#b7c8c6", treeBack: "#cdd9dd",
    terrace: "#f3f6fa", terraceLip: "#cfd7e5", terraceEdge: "#eaeef5",
  }).map(([k, v]) => [k, hex(v)]),
) as Record<string, number[]>;


type Terrace = { x0: number; x1: number; top: number; bottom: number };
type Shape = { cx: number; apex: number; k: number; fg: number; terraces: Terrace[] };
export const mountainTop = (m: Shape) => (x: number) => {
  const dx = x - m.cx;
  // uneven shoulders, a touch steeper on the shadow side like the reference peak
  const shoulder = dx < 0 ? Math.sin(-dx / 260) * 30 : Math.sin(dx / 200) * 22;
  return m.apex + Math.abs(dx) * m.k * (dx < 0 ? 0.92 : 1) + Math.max(0, shoulder);
};

export const Terrain: React.FC<{ vw: number; vh: number; ww: number; view: View; shape: Shape }> = ({ vw, vh, view, shape }) => {
  const shapeKey = `${shape.cx | 0},${shape.apex | 0},${shape.k.toFixed(3)},${shape.fg | 0},` + shape.terraces.map((t) => `${t.x0 | 0}:${t.top | 0}`).join(";");
  const ref = useRef<HTMLCanvasElement>(null);
  const cw = Math.ceil(vw / SCREEN_PX);
  const ch = Math.ceil(vh / SCREEN_PX);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d")!;
    const img = g.createImageData(cw, ch);
    const horizon = shape.apex;
    // A tree line on the horizon: firs of different heights with snow-dusted tiers.
    // Returns 0 = no tree, 1 = needles, 2 = snow on a tier.
    const fir = (x: number, y: number, base: number, period: number, hMin: number, hMax: number, seed: number) => {
      const i0 = Math.floor(x / period);
      let hitType = 0;
      for (let i = i0 - 1; i <= i0 + 1; i++) {
        const px = (i + 0.2 + hash2(i, seed) * 0.6) * period;
        const h = hMin + hash2(i + 77, seed) * (hMax - hMin);
        const d = y - (base - h);
        if (d < 0 || d > h) continue;
        const tier = h / 4;
        const inTier = d % tier;
        const half = h * 0.1 + d * 0.22 + inTier * 0.35;
        if (Math.abs(x - px) > half) continue;
        if (d > h * 0.93 && Math.abs(x - px) > h * 0.04) continue;
        hitType = inTier < tier * 0.22 ? 2 : 1;
      }
      return hitType;
    };
    for (let sy = 0; sy < ch; sy++) {
      for (let sx = 0; sx < cw; sx++) {
        const wx = (sx * SCREEN_PX + SCREEN_PX / 2 - view.tx) / view.z;
        const wy = (sy * SCREEN_PX + SCREEN_PX / 2 - view.ty) / view.z;
        // Sky above the horizon, two soft layers of rolling snowy hills, then the snowfield.
        let col = C.fg;
        if (wy < horizon + 40) {
          const t = Math.max(0, Math.min(0.999, (wy - (horizon - 1400)) / 1300));
          col = SKY2[Math.floor(t * SKY2.length)];
          const back = fir(wx, wy, horizon + 20, 170, 220, 380, 5);
          const front = fir(wx + 60, wy, horizon + 40, 230, 160, 300, 9);
          if (back) col = back === 2 ? C.farCap : C.treeBack;
          if (front) col = front === 2 ? C.midCap : C.tree;
        }
        if (wy >= horizon + 40) {
          // light snow texture: soft wind ripples and the odd sparkle
          const ripple = (((wx * 0.04 + wy * 0.16 + Math.sin(wx / 210) * 4) % 46) + 46) % 46;
          if (ripple < 1.6) col = C.fgShade;
        }
        const gx = Math.floor(wx / 260);
        const gy = Math.floor(wy / 200);
        if (wy > horizon + 60 && hash2(gx, gy) < 0.35) {
          const tx = (gx + 0.2 + hash2(gx + 7, gy) * 0.6) * 260;
          const ty = (gy + 0.2 + hash2(gx, gy + 7) * 0.6) * 200;
          const u = wx - tx;
          const v = ty - wy;
          if (v >= 0 && v < 22 && (Math.abs(u) < 2.5 || Math.abs(u - v * 0.45 - 5) < 2.5 || Math.abs(u + v * 0.45 + 5) < 2.5)) col = v < 8 ? C.grassDark : C.grass;
        }
        const i = (sy * cw + sx) * 4;
        img.data[i] = col[0];
        img.data[i + 1] = col[1];
        img.data[i + 2] = col[2];
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
  }, [cw, ch, vh, view.z, view.tx, view.ty, shapeKey]);

  return (
    <canvas
      ref={ref}
      width={cw}
      height={ch}
      style={{ position: "absolute", left: 0, top: 0, width: cw * SCREEN_PX, height: ch * SCREEN_PX, imageRendering: "pixelated" }}
    />
  );
};

