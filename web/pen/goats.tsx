import React from "react";
import { BODY, HEAD, LEG, TAIL } from "../../src/Goat";
import { BAR_FRAMES, FRAMES_PER_STEP, Hit, recentHits, TrackId } from "./music";
import { Box, Pal, Spr } from "./sprites";

type Fur = { w: string; s: string; g: string };

export type Archetype = {
  id: TrackId;
  name: string;
  role: string;
  color: string;
  px: number;
  fur: Fur;
  horn: { h: string; d: string } | null;
  hoof: string;
  blush: string | null;
  facing: 1 | -1;
  slot: { x: number; y: number };
};

const K = "#3b2b31";

export const ARCHETYPES: Archetype[] = [
  {
    id: "kick",
    name: "Коза-царица",
    role: "правитель · бочка",
    color: "#e0554d",
    px: 6,
    fur: { w: "#4a4347", s: "#3a3438", g: "#2a2528" },
    horn: null,
    hoof: "#151214",
    blush: null,
    facing: 1,
    slot: { x: 160, y: 170 },
  },
  {
    id: "clap",
    name: "Коза-егоза",
    role: "шут · хлопки",
    color: "#ef8a3c",
    px: 5,
    fur: { w: "#b9855b", s: "#a07048", g: "#7d5638" },
    horn: { h: "#dccbaa", d: "#b9a67e" },
    hoof: "#3a2a22",
    blush: "#d99a86",
    facing: -1,
    slot: { x: 780, y: 230 },
  },
  {
    id: "hats",
    name: "Коза-роса",
    role: "невинный · бубенцы",
    color: "#e6c03c",
    px: 4,
    fur: { w: "#fbf8f0", s: "#ebe4d4", g: "#cbc2ae" },
    horn: { h: "#c2a877", d: "#8c7048" },
    hoof: "#5a4040",
    blush: "#f2c2c8",
    facing: 1,
    slot: { x: 1400, y: 160 },
  },
  {
    id: "bass",
    name: "Коза-умница",
    role: "мудрец · бас",
    color: "#9cc34a",
    px: 5,
    fur: { w: "#dcdcd6", s: "#c2c2bb", g: "#9d9d96" },
    horn: { h: "#b8ad93", d: "#948a71" },
    hoof: "#3b3434",
    blush: null,
    facing: -1,
    slot: { x: 1990, y: 210 },
  },
  {
    id: "pad",
    name: "Коза-краса",
    role: "любовник · аккорды",
    color: "#ef8fb2",
    px: 5,
    fur: { w: "#f8e6ee", s: "#ecd0dc", g: "#d2b1c0" },
    horn: { h: "#f3dcaa", d: "#dbbd82" },
    hoof: "#6a4a55",
    blush: "#f4b3c8",
    facing: 1,
    slot: { x: 420, y: 700 },
  },
  {
    id: "lead",
    name: "Коза-дереза",
    role: "бунтарь · мелодия",
    color: "#a35ad6",
    px: 5,
    fur: { w: "#f1f1f3", s: "#d9dae0", g: "#aeb0b9" },
    horn: { h: "#5c6070", d: "#383b45" },
    hoof: K,
    blush: null,
    facing: -1,
    slot: { x: 1040, y: 690 },
  },
  {
    id: "arp",
    name: "Коза-мастерица",
    role: "творец · арпеджио",
    color: "#4a7fd8",
    px: 5,
    fur: { w: "#ece5d2", s: "#dad0b8", g: "#b5aa90" },
    horn: { h: "#cfc6b0", d: "#aaa088" },
    hoof: K,
    blush: "#eec2b8",
    facing: 1,
    slot: { x: 1640, y: 740 },
  },
  {
    id: "bleat",
    name: "Коза-воля",
    role: "искатель · бе-бе",
    color: "#d4509f",
    px: 5,
    fur: { w: "#d6ae80", s: "#c29868", g: "#9b7550" },
    horn: { h: "#e3d6bb", d: "#bfae8c" },
    hoof: "#3a2a22",
    blush: null,
    facing: -1,
    slot: { x: 2150, y: 680 },
  },
  {
    id: "bell",
    name: "Коза-простачка",
    role: "славный малый · динь-дон",
    color: "#4fae6a",
    px: 5,
    fur: { w: "#f4f6f8", s: "#dde2e6", g: "#b6bbbd" },
    horn: { h: "#c4c8ca", d: "#9aa0a2" },
    hoof: K,
    blush: "#eccfd1",
    facing: 1,
    slot: { x: 170, y: 1210 },
  },
  {
    id: "toms",
    name: "Коза-гроза",
    role: "герой · томы",
    color: "#2fa89c",
    px: 5,
    fur: { w: "#74787e", s: "#63676d", g: "#4d5156" },
    horn: { h: "#d8d3c6", d: "#b3ad9e" },
    hoof: "#1e1f22",
    blush: null,
    facing: -1,
    slot: { x: 760, y: 1250 },
  },
  {
    id: "shimmer",
    name: "Коза-чудеса",
    role: "маг · звёздная пыль",
    color: "#5cc4e0",
    px: 5,
    fur: { w: "#e4eef9", s: "#cbdbee", g: "#a9bfdb" },
    horn: { h: "#d6e2f2", d: "#b3c6e0" },
    hoof: "#8aa0c0",
    blush: "#d7d0f2",
    facing: 1,
    slot: { x: 1380, y: 1180 },
  },
  {
    id: "snore",
    name: "Коза-доброта",
    role: "заботливый · храп",
    color: "#6a62c9",
    px: 5,
    fur: { w: "#cfc9dd", s: "#bab3cc", g: "#9a92b0" },
    horn: { h: "#d9d2c2", d: "#b6ae9c" },
    hoof: "#3a3346",
    blush: "#e5bfd2",
    facing: -1,
    slot: { x: 1990, y: 1240 },
  },
];

// Local art box, in goat pixels.
export const GOAT_W = 40;
export const GOAT_H = 33;

type LegKey = keyof typeof LEG;
type EyeMode = "wobble" | "cross" | "spin" | "up" | "half" | "shock";
type FxKind = "note" | "dust" | "z" | "spark" | "heart" | "ring";
type Fx = { kind: FxKind; x: number; y: number; a: number; color?: string };

type Pose = {
  dy: number;
  dx: number;
  headDx: number;
  headDy: number;
  bodyDy: number;
  legs: [LegKey, LegKey, LegKey, LegKey];
  legDy: [number, number, number, number];
  tail: number;
  eye: EyeMode;
  eyeSpeed: number;
  mouth: 0 | 1 | 2 | 3;
  lying: boolean;
  sleepy: boolean;
  sitting: boolean;
  // lit synth key (−1 = none)
  pipe: number;
  mudra: boolean;
  rot: number;
  opacity: number;
  swing: number;
  glint: boolean;
  bubble: number;
  fx: Fx[];
  shout: string | null;
};

const pulse = (ago: number, len: number) => (ago < len ? 1 - ago / len : 0);
const DUR = (h: Hit) => h.note.len * FRAMES_PER_STEP;

const NOTE = ["..cc.", "..c.c", "..c..", "ccc..", "cc..."];
const ZED = ["cccc", "..c.", ".c..", "cccc"];
const SPARK = [".c.", "ccc", ".c."];
const HEART = ["c.c", "ccc", ".c."];
const DUST = ["cc", "cc"];

const FX_ROWS: Record<FxKind, string[]> = {
  note: NOTE,
  z: ZED,
  spark: SPARK,
  heart: HEART,
  dust: DUST,
  ring: SPARK,
};

const ellipse = (w: number, h: number) =>
  Array.from({ length: h }, (_, y) => {
    const ny = (y + 0.5 - h / 2) / (h / 2);
    const half = (w / 2) * Math.sqrt(Math.max(0, 1 - ny * ny));
    return Array.from({ length: w }, (_, x) => (Math.abs(x + 0.5 - w / 2) <= half ? "c" : ".")).join("");
  });
// One neutral colour for every goat's ground shadow/glow.
const GLOW_COLOR = "#6f809a";
const GLOW = ellipse(28, 5);
const SHADOW = ellipse(18, 3);
const GLOW_LYING = ellipse(40, 6);
const SHADOW_LYING = ellipse(32, 3);

// Upright goat: chin/beard hangs from the head, torso stands on two hind legs, forelegs act as arms.
const JAW = BODY.slice(0, 7).map((r) => r.slice(0, 14));
const TORSO = [
  "...wwwwwwww...",
  "..wwwwwwwwww..",
  ".wwwwwwwwwwwww",
  ".wwwwwwwwwwwws",
  "wwwwwwwwwwwwws",
  "wwwwwwwwwwwwss",
  "wwwwwwwwwwwwss",
  "wwwwwwwwwwwwss",
  "wwwwwwwwwwwwss",
  ".wwwwwwwwwwss.",
  ".wwwwwwwwwwss.",
  "..wwwwwwwwss..",
  "..sswwwwwsss..",
  "...ssssssss...",
];
// Stack ASCII layers (later ones on top) into one grid.
const mergeRows = (layers: { rows: string[]; x: number; y: number }[]) => {
  const x0 = Math.min(...layers.map((l) => l.x));
  const y0 = Math.min(...layers.map((l) => l.y));
  const x1 = Math.max(...layers.map((l) => l.x + Math.max(...l.rows.map((r) => r.length))));
  const y1 = Math.max(...layers.map((l) => l.y + l.rows.length));
  const grid = Array.from({ length: y1 - y0 }, () => Array.from({ length: x1 - x0 }, () => "."));
  for (const l of layers) {
    l.rows.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        if (row[rx] !== ".") grid[l.y - y0 + ry][l.x - x0 + rx] = row[rx];
      }
    });
  }
  return { rows: grid.map((r) => r.join("")), x: x0, y: y0 };
};

const POO = ["hb", "bb"];

// Tartan blankets for the sleepy caregivers: base a, stripes b, crossings c, fringe f.
const plaid = (w: number, h: number) =>
  Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      if (y === h - 1) return x % 2 ? "f" : ".";
      if (y === 0 && (x === 0 || x === w - 1)) return ".";
      const sx = x % 5 === 2;
      const sy = y % 4 === 1;
      return sx && sy ? "c" : sx || sy ? "b" : "a";
    }).join(""),
  );
const PLAID_SIDE = plaid(22, 9);
const PLAID_LAP = plaid(16, 6);
const PLAIDS = [
  { a: "#c8453c", b: "#f1e2c4", c: "#7e2a26", f: "#f1e2c4" },
  { a: "#3f5f9e", b: "#e8eef7", c: "#26395e", f: "#e8eef7" },
  { a: "#3f7a55", b: "#e0c35a", c: "#b33a36", f: "#e0c35a" },
  { a: "#d9a33a", b: "#7a4a2a", c: "#fff2d0", f: "#7a4a2a" },
  { a: "#8a6fb3", b: "#f0e8f7", c: "#523f73", f: "#f0e8f7" },
];
// Crossed legs for the yogi, hooves poking out at the sides.
const LOTUS = [
  "..wwwws..swwww..",
  ".wwwwwwsswwwwwww",
  "kwwwwwwwwwwwwwwk",
  "Kssssssssssssssk",
];
// A little synth on a stand, played with the hooves: white keys w, black keys b, purple body k.
// seen from above-front: key bed facing up towards the goat's hooves, front panel below, stand legs
const KEYS = [
  "....bwbwwbwbwbw.",
  "...wwwwwwwwwwww.",
  "..wwwwwwwwwwww..",
  "..kkkkkkkkkkkk..",
  "..kKKKKKKKKKKk..",
  "...s........s...",
  "...s........s...",
];
const KEYS_PAL = { k: "#6b5a8a", K: "#57486f", w: "#f7f4ee", b: "#2f2a33", s: "#9a8aa8" };
const KEY_LIT = "#8fd0ff";

const poopRoll = (seed: number, epoch: number) => {
  let h = Math.imul(seed * 7919 + epoch * 104729, 2654435761);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
};

// Hind legs: wide thigh, hock bending back, thin shin, fetlock tuft, cloven hoof (K = hoof highlight).
const HIND: Record<LegKey, string[]> = {
  A: ["wwws.", ".wws.", "..ws.", ".ws..", ".ws..", ".wg..", "kKk.."],
  F: ["wwws.", "wws..", "ws...", "ws...", "ws...", "wg...", "kKk.."],
  B: ["wwws.", ".wwws", "...ws", "...ws", "..ws.", "..wg.", ".kKk."],
  L: ["wwws.", "wwww.", "sww..", ".ws..", "..wg.", "..kKk", "....."],
};
// Forelegs as arms: elbow, forearm, fetlock tuft, hoof.
const ARM_DOWN = ["wws", "ws.", "ws.", "wg.", "ws.", "kK."];
const ARM_UP = ["kK.", "ws.", "wg.", "ws.", "ws.", "wws"];
// Yogi arms: elbow bent out, forearm down onto the knee, hoof in a little mudra ring.
const ARM_MUDRA = ["ws..", "ws..", "ws..", ".ws.", ".ws.", "..ws", "..kK"];
const ARM_OUT = ["kKwwwwww", "kkgsssss"];

// Automatic lighting (light from the upper left) so flat fur shapes read as round volumes:
// lit rim on the top-left edges, mid-tone then deep shade towards the bottom-right, sparse wool curls.
const FUR = new Set(["w", "s", "l", "m", "p", "g"]);
const shadeCache = new Map<string, string[]>();
export const shade = (rows: string[]) => {
  const key = rows.join("|");
  const hit = shadeCache.get(key);
  if (hit) return hit;
  const H = rows.length;
  const fur = (x: number, y: number) => FUR.has(rows[y]?.[x] ?? ".");
  const run = (x: number, y: number, dx: number, dy: number) => {
    let n = 0;
    while (n < 4 && fur(x + dx * (n + 1), y + dy * (n + 1))) n++;
    return n;
  };
  const out = rows.map((row, y) =>
    [...row]
      .map((c, x) => {
        if (c !== "w") return c;
        const right = run(x, y, 1, 0);
        const down = run(x, y, 0, 1);
        const left = run(x, y, -1, 0);
        const up = run(x, y, 0, -1);
        // lit side two pixels deep, shadow side in two bands
        if ((left === 0 || up === 0) && right + down >= 2) return "l";
        if ((left === 1 || up === 1) && right + down >= 4 && (x + y) % 2 === 0) return "l";
        if (Math.min(right, down) === 0) return "s";
        if (Math.min(right, down) === 1 || (down <= 2 && y > H * 0.55)) return "m";
        if (Math.min(right, down) === 2 && (x + y) % 2 === 0) return "m";
        if (left >= 2 && up >= 2 && right >= 2 && (x * 3 + y * 5) % 11 === 0) return "m";
        return "w";
      })
      .join(""),
  );
  shadeCache.set(key, out);
  return out;
};

const hex2 = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixHex = (a: string, b: string, t: number) => {
  if (!a.startsWith("#") || !b.startsWith("#")) return a;
  const [x, y] = [hex2(a), hex2(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
// Fur palette with the two extra tones the shading needs.
// The ramp is shifted down a step so even white fur has room for a highlight.
export const furPal = (w: string, s: string, g: string) => ({
  l: mixHex(w, "#ffffff", 0.55),
  w: mixHex(w, s, 0.25),
  m: mixHex(w, s, 0.72),
  s: mixHex(s, g, 0.45),
  g,
});


const circle = (r: number) => {
  const d = r * 2 + 1;
  return Array.from({ length: d }, (_, y) =>
    Array.from({ length: d }, (_, x) => {
      const dist = Math.hypot(x - r, y - r);
      if (dist > r + 0.4) return ".";
      return dist > r - 0.6 ? "o" : x < r && y < r ? "h" : "f";
    }).join(""),
  );
};

// Accessory art.
const BIG_HORNS = [
  "....hhhhh.....",
  "..hhhdddhh....",
  ".hhd.....dh...",
  "hhd.......dh..",
  "hd.......ddh..",
  "hd......ddh...",
  ".hd...ddhh....",
  "..hhhhhh......",
];
const WIZARD = [
  "......p....",
  ".....ppp...",
  ".....pyp...",
  "....ppppp..",
  "...pppyppp.",
  "...ppppppp.",
  "..ppyppppp.",
  ".ppppppppyp",
  "yyyyyyyyyyy",
];
// A big floppy Ded Moroz hat: white pom-pom, a tall drooping red cone, white fur trim.
const SANTA_HAT = [
  ".....ww......",
  "....wwww.....",
  "....wwww.....",
  "...rrrrr.....",
  "..rrrrrr.....",
  ".rrrrrrr.....",
  ".rrrrrrrr....",
  "rrrrrrrrrr...",
  "rrRrrrrrrrr..",
  "RrrrRrrrrrRr.",
  "wwwwwwwwwwww.",
  "wwwwwwwwwwww.",
];
const FURHAT = ["..FFFFFFFF..", ".FfFFfFFfFF.", "FFFFFFFFFFFF", "ffffffffffff"];
// Long, sharp horns swept back — the rebel's signature.
const JACKET = [
  "k............k",
  "kk..........kk",
  ".jjjjjjzjjjjjj",
  ".jpjjjjzjjjjpd",
  "jjjjjjjzjjjjjd",
  "jjpjjjjzjjjpdd",
  "jjjjjjjzjjjjdd",
  "jjpjjjjzjjjpdd",
  "jjjjjjjzjjjjdd",
  ".jjjjjjzjjjdd.",
  ".jpjjjjzjjpdd.",
  "..jjjjjzjjdd..",
  "..............",
  "..............",
];
const REBEL_HORNS = [
  "..........dd",
  ".......ddhd.",
  "....ddhhd...",
  "..ddhhd.....",
  ".dhhd.......",
  "dhhd..dd....",
  "hhd.ddhd....",
  "hd.dhhd.....",
];
const CROWN = ["y.y.y", "yyyyy", "yRyBy"];
const MOHAWK = ["r.r.r.", "rrrrrr", "RrRrRr"];
const FLOWER = [".p.p.", "ppPpp", ".PyP.", "ppPpp", ".p.p."];
const BELL = [".yy.", "yyyy", "yYyy", "yyyy", ".kk."];
const CAP = [
  "..........bb...",
  "........bbwbb..",
  ".....bbbbwbbbww",
  "...bbwwbbbbw.ww",
  "..bbbbbbbbbbb..",
  "..wwwwwwwwwww..",
];
const BEARD = [".ee.", "eeee", "eeee", "eeef", ".eef", ".ef.", "..f."];
const TIES = [
  ["rr..", ".rr.", "..r."],
  ["rr..", "rrr.", "...r"],
];

const computePose = (a: Archetype, frame: number, fromStep: number | null, seed: number, variant: number): Pose => {
  const act = fromStep !== null && frame >= fromStep * FRAMES_PER_STEP;
  const hits = (maxAge: number) => (act ? recentHits(a.id, frame, fromStep!, maxAge) : []);
  const idleNod = (frame + seed * 31) % 170 < 18 ? 1 : 0;
  const idleWag = (frame + seed * 53) % 95 < 16 ? Math.floor(frame / 4) % 3 : 0;

  const p: Pose = {
    dy: 0,
    dx: 0,
    headDx: 0,
    headDy: idleNod,
    bodyDy: 0,
    legs: ["A", "A", "A", "A"],
    legDy: [0, 0, 0, 0],
    tail: idleWag,
    eye: "wobble",
    eyeSpeed: 0.12,
    mouth: 0,
    lying: false,
    sleepy: false,
    sitting: false,
    pipe: -1,
    mudra: false,
    rot: 0,
    opacity: 1,
    swing: 0,
    glint: false,
    bubble: 0,
    fx: [],
    shout: null,
  };
  const beat = frame / (FRAMES_PER_STEP * 4);
  const stepF = frame / FRAMES_PER_STEP;
  const inActive = act ? frame - fromStep! * FRAMES_PER_STEP : 0;

  switch (a.id) {
    case "kick": {
      const [h] = hits(20);
      if (act) {
        p.eyeSpeed = 0.5;
        p.headDy = h && h.ago < 5 ? 2 : h && h.ago < 9 ? 1 : 0;
        p.bodyDy = h && h.ago < 3 ? 1 : 0;
        p.legDy = [0, 0, h && h.ago < 3 ? -1 : 0, 0];
        p.tail = h && h.ago < 6 ? 1 : 0;
        for (const x of hits(10)) {
          const spread = x.ago * 0.5;
          const al = pulse(x.ago, 10);
          p.fx.push({ kind: "dust", x: 11 - spread, y: 31 - x.ago * 0.15, a: al });
          p.fx.push({ kind: "dust", x: 19 + spread, y: 31 - x.ago * 0.15, a: al });
        }
      }
      break;
    }
    case "clap": {
      // en face: arms flung wide and up between claps, hooves meet in front of the chest on the clap
      if (act) {
        const [h] = hits(20);
        p.eye = "up";
        p.eyeSpeed = 0.4;
        if (h && h.ago < 4) {
          p.pipe = 1;
          p.mouth = 1;
          p.headDy = 1;
          const a2 = pulse(h.ago, 4);
          p.fx.push({ kind: "spark", x: 11, y: 17, a: a2, color: "#ffffff" });
          p.fx.push({ kind: "spark", x: 7, y: 14, a: a2, color: "#f6d55c" });
          p.fx.push({ kind: "spark", x: 15, y: 14, a: a2, color: "#f6d55c" });
        } else if (h && h.ago < 14) {
          p.pipe = 0;
          p.dy = h.ago < 9 ? -1 : 0;
          p.tail = 2;
        }
      }
      break;
    }
    case "hats": {
      // light, easy footwork: a toprock side-step shuffle with a gentle sway and a little hop
      if (act) {
        const cyc = ["F", "A", "B", "L"] as LegKey[];
        const i = Math.floor(stepF);
        const shift = seed % 4;
        const b = (Math.floor(beat) + shift) % 4;
        p.legs = [cyc[(i + 2) % 4], cyc[i % 4], cyc[(i + 1) % 4], cyc[(i + 3) % 4]];
        p.legs[0] = i % 2 ? "L" : "F";
        p.legs[2] = i % 2 ? "F" : "L";
        p.dy = i % 2 ? -1 : 0;
        p.dx = i % 4 < 2 ? -1 : 1;
        p.rot = Math.sin((beat / 4) * Math.PI * 2) * 8;
        p.headDy = b === 0 ? -1 : 0;
        p.tail = i % 3;
        p.eye = "wobble";
        p.eyeSpeed = 0.9;
      }
      break;
    }
    case "bass": {
      // the sage sits cross-legged like a yogi, breathing with the bar — calm, mostly open eyes,
      // with just a slow meditative half-close on the out-breath, not permanently shut
      const breathPhase = (frame % (BAR_FRAMES * 2)) / (BAR_FRAMES * 2);
      p.eye = breathPhase > 0.5 && breathPhase < 0.7 ? "half" : "wobble";
      p.eyeSpeed = 0.05;
      p.sitting = true;
      p.mudra = true;
      p.legs = ["A", "A", "A", "A"];
      p.bodyDy = Math.floor(frame / BAR_FRAMES) % 2 && (frame % BAR_FRAMES) / BAR_FRAMES > 0.5 ? -1 : 0;
      if (act) {
        const [h] = hits(12);
        p.headDy = h && h.ago < 4 ? 1 : 0;
        p.swing = h && h.ago < 6 ? (h.globalStep % 2 ? 1 : -1) : 0;
        p.tail = Math.floor(beat * 2) % 2;
        for (const x of hits(40)) {
          if (x.ago > 36) continue;
          p.fx.push({ kind: "note", x: 2 + Math.sin(x.ago / 5) * 2, y: -2 - x.ago * 0.35, a: pulse(x.ago, 36), color: a.color });
        }
      }
      break;
    }
    case "pad": {
      // soft, friendly face: open eyes looking up a little, gentle smile
      p.eye = "wobble";
      p.eyeSpeed = 0.06;
      p.mouth = 3;
      if (act) {
        // a gentle, girlish little hop on every beat, not a big leap
        const lift = Math.min(1, inActive / 20);
        const hopPhase = beat % 1;
        p.dy = -Math.round(lift * Math.max(0, Math.sin(hopPhase * Math.PI)) * 4);
        // both little hands wave up on the hop
        const waving = hopPhase < 0.6;
        p.legs = [waving ? "L" : "A", "A", waving ? "L" : "A", "A"];
        p.tail = Math.floor(frame / 10) % 3;
        const period = 20;
        for (let k = 0; k < 4; k++) {
          const age = (frame + k * 5) % period;
          const t = Math.floor((frame + k * 5) / period);
          p.fx.push({
            kind: t % 2 ? "heart" : "spark",
            x: 4 + ((t * 13 + k * 9) % 30),
            y: -2 - age * 0.4,
            a: pulse(age, period) * lift,
            color: t % 2 ? a.color : "#ffffff",
          });
        }
      }
      break;
    }
    case "lead": {
      // capricious: nose in the air, a petulant foot-stomp on the beat, head tossed side to side
      p.headDy = -1;
      if (act) {
        const [h] = hits(40);
        const singing = h && h.ago < DUR(h);
        const b4 = Math.floor(beat) % 4;
        const inBeat = beat % 1;
        p.legs = b4 % 2 === 0 && inBeat < 0.2 ? ["F", "L", "A", "B"] : ["F", "A", "A", "B"];
        p.dy = inBeat < 0.12 ? -2 : 0;
        p.headDx = b4 % 2 === 0 ? -2 : 2;
        if (singing) {
          p.headDy = -2;
          p.mouth = 1;
          p.eye = "up";
        }
        p.tail = Math.floor(beat * 2) % 3;
        for (const x of hits(45)) {
          if (x.ago > 40) continue;
          p.fx.push({ kind: "note", x: -2 + Math.sin(x.ago / 6) * 2, y: 4 - x.ago * 0.4, a: pulse(x.ago, 40), color: a.color });
        }
      }
      break;
    }
    case "arp": {
      // plays a little synth with both front hooves; one hoof taps on each note
      p.legs[0] = "F";
      p.legs[2] = "F";
      if (act) {
        const i = Math.floor(stepF);
        const [ph] = hits(4);
        if (ph && ph.ago < 2.5) {
          p.pipe = ph.globalStep % 6;
          if (ph.globalStep % 2) p.legDy[0] = -1;
          else p.legDy[2] = -1;
        }
        p.tail = i % 3;
        p.headDy = i % 4 === 0 ? 1 : 0;
        p.eye = "wobble";
        p.eyeSpeed = 0.2;
        p.glint = i % 16 < 2;
        for (const x of hits(30)) {
          if (x.globalStep % 4 !== 0 || x.ago > 26) continue;
          p.fx.push({ kind: "note", x: 16 + Math.sin(x.ago / 4) * 2, y: -1 - x.ago * 0.4, a: pulse(x.ago, 26), color: a.color });
        }
      }
      break;
    }
    case "bleat": {
      if (act) {
        const [h] = hits(60);
        const yelling = h && h.ago < DUR(h) + 3;
        if (yelling) {
          p.headDy = -1;
          p.headDx = -1;
          p.bodyDy = -1;
          p.legs = ["L", "A", "L", "A"];
          p.legDy = [-1, 0, -1, 0];
          p.mouth = 2;
          p.eye = "shock";
          p.tail = Math.floor(frame / 2) % 3;
          p.dx = Math.floor(frame / 2) % 2;
          p.shout = h.globalStep % 4 === 0 ? "БЕ!" : "БЕ-Е!";
        } else {
          p.eye = "wobble";
          p.eyeSpeed = 0.3;
        }
      }
      break;
    }
    case "bell": {
      // big obvious head-shake ringing the bell on its neck
      if (act) {
        const [h] = hits(12);
        if (h && h.ago < 8) {
          const dir = h.globalStep % 2 ? 1 : -1;
          const swing = Math.sin((h.ago / 8) * Math.PI);
          p.headDx = Math.round(dir * (1 + swing * 2));
          p.headDy = h.ago < 3 ? -1 : 0;
          p.swing = -dir;
          p.bodyDy = h.ago < 4 ? 1 : 0;
          p.fx.push({ kind: "spark", x: 12 - dir * 4, y: 15 - h.ago * 0.3, a: pulse(h.ago, 8), color: "#f2d26b" });
          p.fx.push({ kind: "spark", x: 20 + dir * 4, y: 14 - h.ago * 0.3, a: pulse(h.ago, 8), color: "#f2d26b" });
        }
        p.tail = Math.floor(beat) % 2;
        p.eyeSpeed = 0.35;
      }
      break;
    }
    case "toms": {
      // a proper stomp: one hind leg rises high, slams down with a jolt and a puff of snow,
      // alternating legs on every beat and on every tom hit
      if (act) {
        const beatAgo = (beat % 1) * FRAMES_PER_STEP * 4;
        const [h] = hits(12);
        const useHit = h && h.ago < beatAgo;
        const ago = useHit ? h.ago : beatAgo;
        const idx = useHit ? h.globalStep : Math.floor(beat);
        const near = idx % 2 === 0;
        const lift = ago < 3 ? -3 : ago < 5 ? -1 : 0;
        if (near) {
          p.legs[3] = lift < -1 ? "L" : "A";
          p.legDy[3] = lift;
        } else {
          p.legs[1] = lift < -1 ? "L" : "A";
          p.legDy[1] = lift;
        }
        // arms up like fists on the lift, body drops on the slam
        p.legs[0] = ago < 3 ? "L" : "A";
        p.legs[2] = ago < 3 ? "L" : "A";
        p.bodyDy = ago >= 3 && ago < 6 ? 1 : 0;
        p.headDy = ago >= 3 && ago < 7 ? 2 : 0;
        p.swing = Math.floor(ago / 2) % 2;
        if (ago >= 4 && ago < 14) {
          const hx = near ? 18 : 13;
          const d = ago - 4;
          p.fx.push({ kind: "dust", x: hx - 1 - d * 0.8, y: 31 - d * 0.2, a: pulse(d, 10) });
          p.fx.push({ kind: "dust", x: hx + 2 + d * 0.8, y: 31 - d * 0.2, a: pulse(d, 10) });
          p.fx.push({ kind: "dust", x: hx + 0.5, y: 30 - d * 0.5, a: pulse(d, 10) * 0.7 });
        }
        p.eyeSpeed = 0.5;
      }
      break;
    }
    case "shimmer": {
      // mostly visible, with a slow magical shimmer of their own even when silent — the
      // white-on-purple eye spins backwards, like hypnosis played in reverse
      p.opacity = 0.78 + 0.17 * Math.sin(frame / 20 + seed);
      p.dy = -2 + Math.round(Math.sin(frame / 25 + seed));
      p.eye = "spin";
      p.eyeSpeed = -0.045;
      if (act) {
        const [h] = hits(30);
        p.opacity = 0.82 + 0.18 * (h ? pulse(h.ago, 20) : 0);
        p.dy = -4 + Math.round(Math.sin(frame / 12) * 2);
        p.legs = ["L", "L", "A", "A"];
        p.eye = "up";
        for (const x of hits(36)) {
          for (let k = 0; k < 3; k++) {
            const ang = x.globalStep * 1.7 + k * 2.1;
            const r = 6 + x.ago * 0.5;
            p.fx.push({
              kind: "spark",
              x: 20 + Math.cos(ang) * r * 1.4,
              y: 12 + Math.sin(ang) * r,
              a: pulse(x.ago, 36),
              color: k === 1 ? "#ffffff" : a.color,
            });
          }
        }
      }
      break;
    }
    case "snore": {
      p.legs = ["A", "A", "A", "A"];
      // lying down, each in its own way: head resting, raised, nose in the snow, or curled up
      // in a tight cat-loaf with the tail wrapped round — the funniest of the bunch
      const catLoaf = seed % 4 === 2;
      p.lying = !catLoaf;
      p.sitting = catLoaf;
      p.sleepy = true;
      p.mudra = catLoaf;
      // head may only sink onto the body (never lift or shift), so head and body stay one solid shape
      p.headDy = catLoaf ? 2 : [0, 1, 0, 1][seed % 4];
      p.headDx = 0;
      p.tail = catLoaf ? 3 : seed % 3;
      p.bodyDy = catLoaf ? 3 : p.bodyDy;
      const slowZ = (frame + seed * 17) % 80;
      if (!act) {
        p.fx.push({ kind: "z", x: 16 + slowZ * 0.08, y: 2 - slowZ * 0.15, a: pulse(slowZ, 80) * 0.7, color: a.color });
      } else {
        const [h] = hits(80);
        if (h && h.note.midi === 0) {
          const k = Math.min(1, h.ago / DUR(h));
          p.bubble = Math.round(1 + k * 4);
          p.bodyDy = k > 0.5 ? -1 : 0;
        } else if (h) {
          if (h.ago < 4) p.fx.push({ kind: "ring", x: -3, y: 12, a: 1, color: "#bfe3f5" });
          for (let j = 0; j < 3; j++) {
            const age = h.ago - j * 6;
            if (age < 0 || age > 30) continue;
            p.fx.push({ kind: "z", x: 16 + j * 3 + age * 0.12, y: 3 - age * 0.35, a: pulse(age, 30), color: a.color });
          }
        }
      }
      break;
    }
  }
  // Six flavours of each dance so a group of identical goats never moves in lockstep.
  // Sleepers and the yogi stay calm: they only breathe.
  if (act && a.id !== "snore" && a.id !== "bass") {
    const b = Math.floor(beat);
    const inBeat = beat % 1;
    switch (variant % 6) {
      case 1: // mirrored arms, off-beat bounce
        [p.legs[0], p.legs[2]] = [p.legs[2], p.legs[0]];
        [p.legDy[0], p.legDy[2]] = [p.legDy[2], p.legDy[0]];
        p.headDx = -p.headDx;
        if (inBeat >= 0.5) p.dy -= 1;
        break;
      case 2: // side-to-side sway, one arm waving
        p.dx += b % 2 ? 1 : -1;
        if (p.legs[2] === "A") p.legs[2] = b % 2 ? "L" : "A";
        if (p.legs[0] === "A") p.legs[0] = b % 2 ? "A" : "L";
        break;
      case 3: // nods on every beat, both arms up on the bar's downbeat
        if (inBeat < 0.3) p.headDy += 1;
        if (b % 4 === 0 && inBeat < 0.6) p.legs = ["L", p.legs[1], "L", p.legs[3]];
        break;
      case 4: // swaying on half-bars, quick tail
        p.dx += Math.floor(beat / 2) % 2 ? 1 : -1;
        p.tail = Math.floor(stepF) % 3;
        if (inBeat < 0.25) p.bodyDy += 1;
        break;
      case 5: // little hop on beat 3, looks up
        if (b % 4 === 2 && inBeat < 0.5) {
          p.dy -= inBeat < 0.25 ? 2 : 1;
          p.legs = [p.legs[0], "L", p.legs[2], "L"];
        }
        if (p.eye === "wobble") p.eye = "up";
        break;
    }
  }
  // Silhouette: each archetype carries itself its own way, even standing still.
  if (!p.lying && !p.sitting && p.rot === 0) {
    if (a.id === "kick") p.headDy -= 1; // the ruler: chin up
    if (a.id === "arp") p.headDy += 1; // the creator: hunched over the keys
    if (a.id === "toms") p.legs = [p.legs[0] === "A" ? "F" : p.legs[0], p.legs[1], p.legs[2], p.legs[3] === "A" ? "B" : p.legs[3]]; // the hero: wide stance
    if (a.id === "lead") p.headDy -= 1; // the rebel: chin up, capricious
  }
  // Startle: the first half-second after being switched on, each goat reacts in its own way.
  if (act && inActive < 16) {
    const t = inActive;
    const up = t < 8 ? -Math.round(3 * Math.sin((t / 8) * Math.PI)) : 0;
    p.eye = "shock";
    p.rot = 0;
    switch (a.id) {
      case "kick": p.headDy = -2; p.fx.push({ kind: "spark", x: 11, y: -1, a: 1 - t / 16, color: "#f6d55c" }); break;
      case "clap": p.dy = up; p.legs = ["L", "L", "L", "L"]; break;
      case "hats": p.dx = t < 8 ? -2 : -1; break;
      case "bass": p.eye = t < 10 ? "shock" : "half"; break;
      case "pad": p.fx.push({ kind: "heart", x: 16, y: 2 - t * 0.4, a: 1 - t / 16 }); break;
      case "lead": p.headDx = 2; p.mouth = 2; break;
      case "arp": p.glint = true; p.headDy = -1; break;
      case "bleat": p.headDx = -1; p.mouth = 2; break;
      case "bell": p.headDx = t % 4 < 2 ? 2 : -2; break;
      case "toms": p.dy = up; p.legs = ["L", "F", "L", "F"]; break;
      case "shimmer": p.opacity = t % 4 < 2 ? 0.35 : 1; break;
      case "snore": p.eye = "shock"; break;
    }
  }
  return p;
};

// Goats have horizontal rectangular pupils; every archetype gets its own square eyes.
type EyeStyle = {
  small: number;
  big: number;
  tall?: boolean;
  pw: number;
  ph: number;
  iris?: string;
  white?: string;
  pupilColor?: string;
};

const EYE_STYLES: Record<TrackId, EyeStyle> = {
  kick: { small: 6, big: 6, pw: 3, ph: 1, iris: "#e8b53c" },
  clap: { small: 7, big: 7, pw: 4, ph: 2 },
  hats: { small: 7, big: 8, pw: 3, ph: 2, iris: "#9fd3f0" },
  bass: { small: 5, big: 6, pw: 2, ph: 1, iris: "#b9c98a" },
  pad: { small: 7, big: 8, pw: 2, ph: 2, iris: "#f4a7c3" },
  lead: { small: 4, big: 9, pw: 3, ph: 1, iris: "#e0554d" },
  arp: { small: 6, big: 7, pw: 2, ph: 2, iris: "#8fb8ee" },
  bleat: { small: 5, big: 6, tall: true, pw: 3, ph: 1, iris: "#d99a3c" },
  bell: { small: 6, big: 7, tall: true, pw: 2, ph: 2, iris: "#8a6a4a" },
  toms: { small: 6, big: 6, pw: 4, ph: 1, iris: "#e6c03c" },
  shimmer: { small: 6, big: 7, pw: 3, ph: 1, iris: "#7b6fe0", pupilColor: "#ffffff", white: "#d9f3fb" },
  snore: { small: 6, big: 7, pw: 3, ph: 2, iris: "#c9a27a" },
};

const eyeRows = (w: number, h: number, square: boolean) =>
  Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      const dx = Math.min(x, w - 1 - x);
      const dy = Math.min(y, h - 1 - y);
      if (square) return dx === 0 || dy === 0 ? "g" : "w";
      if (Math.min(w, h) >= 7) {
        if (dx + dy <= 1) return ".";
        return dx === 0 || dy === 0 || dx + dy === 2 ? "g" : "w";
      }
      if (dx + dy === 0) return ".";
      return dx === 0 || dy === 0 ? "g" : "w";
    }).join(""),
  );


const Eye: React.FC<{
  cx: number;
  cy: number;
  size: number;
  st: EyeStyle;
  px: number;
  frame: number;
  seed: number;
  mode: EyeMode;
  speed: number;
  rim: string;
  lid: string;
  blink: boolean;
  gaze: number;
  look?: { x: number; y: number };
}> = ({ cx, cy, size, st, px, frame, seed, mode, speed, rim, lid, blink, gaze, look }) => {
  const w = size;
  const h = st.tall ? size + 2 : size;
  const x = Math.round(cx - (w - 1) / 2);
  const y = Math.round(cy - (h - 1) / 2);
  const shape = eyeRows(w, h, true);
  const white = st.white ?? "#ffffff";

  if (blink) {
    return (
      <>
        <Spr outline={null} rows={shape} pal={{ g: lid, w: lid }} x={x} y={y} px={px} />
        <Box x={x + 1} y={y + Math.floor(h / 2)} w={w - 2} h={1} px={px} color={K} />
      </>
    );
  }

  const iw = w - 2;
  const ih = h - 2;
  const shock = mode === "shock";
  const pw = shock ? 1 : Math.min(st.pw, iw);
  const ph = shock ? 1 : Math.min(st.ph, ih);
  const maxX = Math.max(0, iw - pw);
  const maxY = Math.max(0, ih - ph);

  let u: number;
  let v: number;
  if (mode === "shock") {
    u = 0.5;
    v = 0.5;
  } else if (mode === "cross") {
    u = seed % 2 === 0 ? 1 : 0;
    v = 0.5;
  } else if (mode === "up") {
    u = 0.5 + Math.sin(frame * speed + seed) * 0.3;
    v = 0;
  } else if (mode === "spin") {
    const ang = frame * speed + seed * 1.7;
    u = 0.5 + Math.cos(ang) * 0.5;
    v = 0.5 + Math.sin(ang) * 0.5;
  } else if (mode === "half") {
    u = 0.5 + Math.sin(frame * speed + seed) * 0.4;
    v = 1;
  } else {
    const t = frame * speed + seed * 2.1;
    u = 0.5 + (Math.sin(t) * 0.7 + Math.sin(t * 2.3) * 0.35) * 0.5;
    v = 0.5 + (Math.cos(t * 1.4) * 0.6 + 0.3) * 0.5;
  }
  // Resting gaze per goat: 0 forward (where the snout points), 1 at the viewer, 2 down, 3 up.
  if (mode === "wobble" || mode === "half") {
    const [gu, gv] = [[0.1, 0.55], [0.5, 0.45], [0.45, 1], [0.6, 0]][((gaze % 4) + 4) % 4];
    u = gu + (u - 0.5) * 0.35;
    v = mode === "half" ? v : gv + (v - 0.5) * 0.35;
  }
  // Pupils track the cursor when a look vector is supplied, overriding the resting gaze.
  if (look && mode !== "shock" && mode !== "spin") {
    u = 0.5 + Math.max(-1, Math.min(1, look.x)) * 0.42;
    v = 0.5 + Math.max(-1, Math.min(1, look.y)) * 0.42;
  }
  const pxI = Math.max(0, Math.min(maxX, Math.round(u * maxX)));
  const pyI = Math.max(0, Math.min(maxY, Math.round(v * maxY)));
  const ppx = x + 1 + pxI;
  const ppy = y + 1 + pyI;
  const pc = st.pupilColor ?? K;

  const lidH = Math.floor(h / 2);
  return (
    <>
      <Spr outline={null} rows={shape} pal={{ g: rim, w: white }} x={x} y={y} px={px} />
      {st.iris ? (
        <Box x={Math.max(x + 1, ppx - 1)} y={Math.max(y + 1, ppy - 1)} w={Math.min(pw + 2, iw)} h={Math.min(ph + 2, ih)} px={px} color={st.iris} />
      ) : null}
      <Box x={ppx} y={ppy} w={pw} h={ph} px={px} color={pc} />
      {!st.iris && pw >= 3 ? <Box x={ppx} y={ppy} w={1} h={1} px={px} color="#ffffff" /> : null}
      {mode === "half" ? (
        <>
          <Box x={x} y={y} w={w} h={lidH} px={px} color={lid} />
          <Box x={x} y={y + lidH} w={w} h={1} px={px} color={K} />
        </>
      ) : null}
    </>
  );
};

// ---- Front view (en face) ------------------------------------------------------------------
const HEAD_F = [
  "..hd..........dh..",
  "..hdd........ddh..",
  "...hdd......ddh...",
  "....hdwwwwwwdh....",
  "gg..wwwwwwwwww..gg",
  "sggwwwwwwwwwwwwggs",
  "..swwwwwwwwwwwws..",
  "...wwwwwwwwwwww...",
  "...wwwwwwwwwwww...",
  "...pwwwwwwwwwwp...",
  "....wwwwwwwwww....",
  "....swwwwwwwws....",
  ".....swwwwwws.....",
  ".....sswkkwss.....",
  "......swwwws......",
  ".......gssg.......",
  ".......gggg.......",
  "........gg........",
];
// Back of the head: horns and ears, no face.
const HEAD_B = [
  "..hd..........dh..",
  "..hdd........ddh..",
  "...hdd......ddh...",
  "....hdwwwwwwdh....",
  "gg..wwwwwwwwww..gg",
  "sggwwwwwwwwwwwwggs",
  "..swwwwwwwwwwwws..",
  "...wwwwwwwwwwww...",
  "...wwwwwwwwwwww...",
  "....wwwwwwwwww....",
  "....swwwwwwwws....",
  ".....swwwwwws.....",
  "......swwwws......",
  ".......sssss......",
];
const TORSO_F = [
  "....wwwwww....",
  "..wwwwwwwwww..",
  ".wwwwwwwwwwww.",
  "swwwwwwwwwwwws",
  "swwwwwwwwwwwws",
  "swwwwwwwwwwwws",
  "swwwwwwwwwwwws",
  "sswwwwwwwwwwss",
  ".sswwwwwwwwss.",
  ".ssswwwwwwsss.",
  "..ssssssssss..",
];
const mirror = (rows: string[]) => rows.map((r) => [...r].reverse().join(""));

const FrontGoat: React.FC<{
  a: Archetype;
  p: Pose;
  px: number;
  frame: number;
  seed: number;
  gaze: number;
  blink: boolean;
  pal: Pal;
  legNear: Pal;
  back?: boolean;
  look?: { x: number; y: number };
}> = ({ a, p, px, frame, seed, gaze, blink, pal, legNear, back = false, look }) => {
  const sit = p.sitting ? 6 : 0;
  const bodyY = 14 + p.bodyDy + sit;
  const hx = 4 + p.headDx;
  const hy = p.headDy + p.bodyDy + sit;
  const st = EYE_STYLES[a.id];
  const headPal: Pal = a.id === "kick" ? { ...pal, h: "#ebe1c9", d: "#c7b58c" } : pal;
  const hind = (k: LegKey) => shade(HIND[k]);
  const arm = (k: LegKey, side: -1 | 1) => {
    const kk = a.id === "arp" && k === "F" ? "A" : k;
    const rows = shade(p.mudra ? ARM_MUDRA : kk === "L" ? ARM_UP : kk === "F" ? ARM_OUT : ARM_DOWN);
    const r = side === 1 ? mirror(rows) : rows;
    const x = side === -1 ? (kk === "F" ? -1 : 4) : 20;
    const y = kk === "L" ? bodyY - 3 : kk === "F" ? bodyY + 4 : bodyY + 2;
    return { r, x, y };
  };
  const merged = mergeRows([
    { rows: TORSO_F, x: 6, y: bodyY },
    { rows: back ? HEAD_B : HEAD_F, x: hx, y: hy },
  ]);
  let la = arm(p.legs[0], -1);
  let ra = arm(p.legs[2], 1);
  if (a.id === "clap" && p.pipe >= 0) {
    // clapping arms: hooves meet in front of the chest, or fly wide and up
    const shut = ["ws....", ".ws...", "..ws..", "...wkK"];
    const open = ["kK..", "ws..", ".ws.", "..ws", "..ws"];
    la = p.pipe === 1 ? { r: shade(shut), x: 7, y: bodyY + 1 } : { r: shade(open), x: 0, y: bodyY - 4 };
    ra = p.pipe === 1 ? { r: mirror(shade(shut)), x: 13, y: bodyY + 1 } : { r: mirror(shade(open)), x: 22, y: bodyY - 4 };
  }
  const n: React.ReactNode[] = [];
  if (!p.sitting) {
    n.push(<Spr key="ll" rows={hind(p.legs[1])} pal={legNear} x={8} y={25 + p.legDy[1]} px={px} />);
    n.push(<Spr key="rl" rows={mirror(hind(p.legs[3]))} pal={legNear} x={14} y={25 + p.legDy[3]} px={px} />);
  }
  n.push(<Spr key="body" rows={shade(merged.rows)} pal={headPal} x={merged.x} y={merged.y} px={px} />);
  n.push(<Spr key="la" rows={la.r} pal={legNear} x={la.x} y={la.y + p.legDy[0]} px={px} />);
  n.push(<Spr key="ra" rows={ra.r} pal={legNear} x={ra.x} y={ra.y + p.legDy[2]} px={px} />);

  if (a.id === "clap") {
    n.push(<Box key="s1" x={8} y={bodyY + 3} w={3} h={2} px={px} color="#f3ead9" />);
    n.push(<Box key="s2" x={15} y={bodyY + 6} w={2} h={2} px={px} color="#f3ead9" />);
  }
  if (a.id === "lead") {
    n.push(<Spr key="jacket" rows={JACKET} pal={{ j: "#2b2b30", d: "#1c1c20", z: "#8a8a92", k: "#7c8290", p: "#c7ccd6" }} x={6} y={bodyY} px={px} />);
  }
  if (a.id === "kick") {
    n.push(<Box key="chain" x={10} y={bodyY + 1} w={8} h={1} px={px} color="#e8b53c" />);
    n.push(<Box key="pendant" x={13} y={bodyY + 2} w={2} h={2} px={px} color="#f6d55c" />);
  }
  if (a.id === "bell" || a.id === "bleat") {
    const sc = a.id === "bell" ? "#d8473a" : "#3f8f5a";
    n.push(<Box key="sc" x={7} y={bodyY} w={12} h={2} px={px} color={sc} />);
    n.push(<Box key="sc2" x={15} y={bodyY + 2} w={2} h={4} px={px} color={sc} />);
  }
  if (a.id === "bell") {
    n.push(<Spr key="bell" rows={BELL} pal={{ y: "#e8b53c", Y: "#fff0b0", k: "#6b4a1c" }} x={11 + p.swing} y={bodyY + 2} px={px} />);
  }

  const H = (x: number, y: number) => ({ x: hx + x, y: hy + y });
  const at = (key: string, rows: string[], hp: Pal, lx: number, ly: number) => {
    const q = H(lx, ly);
    return <Spr key={key} rows={rows} pal={hp} x={q.x} y={q.y} px={px} />;
  };
  if (a.id === "hats") {
    n.push(at("beanie", SANTA_HAT, { r: "#d8473a", R: "#b8323a", w: "#ffffff" }, 2, -6));
  }
  if (a.id === "bleat") n.push(at("furhat", FURHAT, { F: "#8a5a3a", f: "#c9a27a" }, 3, 1));
  if (a.id === "toms") n.push(<Box key="band" x={H(3, 4).x} y={H(3, 4).y} w={12} h={1} px={px} color="#d8473a" />);
  if (a.id === "lead") n.push(at("mohawk", MOHAWK, { r: "#e0484f", R: "#b8323a" }, 6, 1));

  const rim = a.fur.g;
  if (back) {
    // seen from behind: no face, just a little tail tuft on the back
    n.push(<Spr key="tuft" rows={shade(["ww", "wws", ".s."])} pal={pal} x={12} y={bodyY + 2} px={px} />);
  } else if (p.sleepy) {
    n.push(<Box key="c1" x={H(3, 7).x} y={H(3, 7).y} w={5} h={1} px={px} color={K} />);
    n.push(<Box key="c2" x={H(10, 7).x} y={H(10, 7).y} w={5} h={1} px={px} color={K} />);
  } else {
    for (const [i, cx] of [5.5, 12.5].entries()) {
      const c = H(cx, 7);
      n.push(
        <Eye key={`e${i}`} cx={c.x} cy={c.y} size={st.small} st={st} px={px} frame={frame} seed={seed * 2 + i} mode={p.eye} speed={p.eyeSpeed} rim={rim} lid={a.fur.w} blink={blink} gaze={gaze === 0 ? 1 : gaze} look={look} />,
      );
    }
  }
  if (a.id === "arp" && !back) {
    const fr = "#a39383";
    for (const [i, gx] of [2, 9].entries()) {
      const q = H(gx, 3);
      n.push(<Box key={`gt${i}`} x={q.x} y={q.y} w={8} h={1} px={px} color={fr} />);
      n.push(<Box key={`gb${i}`} x={q.x} y={q.y + 7} w={8} h={1} px={px} color={fr} />);
      n.push(<Box key={`gl${i}`} x={q.x} y={q.y} w={1} h={8} px={px} color={fr} />);
      n.push(<Box key={`gr${i}`} x={q.x + 7} y={q.y} w={1} h={8} px={px} color={fr} />);
    }
  }
  if (a.id === "bass" && !back) {
    n.push(<Box key="br1" x={H(2, 3).x} y={H(2, 3).y} w={6} h={1} px={px} color="#f6f6f2" />);
    n.push(<Box key="br2" x={H(10, 3).x} y={H(10, 3).y} w={6} h={1} px={px} color="#f6f6f2" />);
    n.push(at("beard", BEARD, { e: "#f3f3ee", f: "#d0d0c8" }, 7 + p.swing, 15));
  }
  if (a.id === "kick") n.push(at("crown", CROWN, { y: "#e8b53c", R: "#e0554d", B: "#4a7fd8" }, 6.5, 0));
  if (a.id === "shimmer") n.push(at("wizard", WIZARD, { p: "#7b6fe0", y: "#f6d55c" }, 3.5, -5));
  if (a.id === "pad") n.push(at("flower", FLOWER, { p: "#f27aa8", P: "#e0578f", y: "#f6d55c" }, 13, 0));
  if (a.id === "snore") n.push(at("cap", CAP, { b: "#4a5ba8", w: "#f1eff8" }, 1.5, -1));

  if (p.sitting) n.push(<Spr key="lotus" rows={shade(LOTUS)} pal={legNear} x={5} y={bodyY + 9} px={px} />);
  if (a.id === "snore") n.push(<Spr key="plaid" rows={PLAID_LAP} pal={PLAIDS[seed % PLAIDS.length]} x={4} y={bodyY + 6} px={px} />);
  if (a.id === "arp" && !back) {
    n.push(<Spr key="keys" rows={KEYS} pal={KEYS_PAL} x={4.5} y={bodyY + 6} px={px} />);
    if (p.pipe >= 0) n.push(<Box key="lit" x={8 + p.pipe * 2} y={bodyY + 7} w={1} h={1} px={px} color={KEY_LIT} />);
  }
  if (p.mouth === 1 && !back) n.push(<Box key="m" x={H(8, 14).x} y={H(8, 14).y} w={2} h={1} px={px} color={K} />);
  if (p.mouth === 3 && !back) {
    n.push(<Box key="sm1" x={H(7, 14).x} y={H(7, 14).y} w={1} h={1} px={px} color={K} />);
    n.push(<Box key="sm2" x={H(8, 15).x} y={H(8, 15).y} w={2} h={1} px={px} color={K} />);
    n.push(<Box key="sm3" x={H(10, 14).x} y={H(10, 14).y} w={1} h={1} px={px} color={K} />);
  }
  if (p.mouth === 2 && !back) {
    n.push(<Box key="m" x={H(7, 14).x} y={H(7, 14).y} w={4} h={2} px={px} color={K} />);
    n.push(<Box key="t" x={H(8, 15).x} y={H(8, 15).y} w={2} h={1} px={px} color="#e27b8e" />);
  }
  if (p.bubble > 0 && !back) {
    const q = H(11, 13 - p.bubble);
    n.push(<Spr key="bub" rows={circle(p.bubble)} pal={{ o: "#9fd0ea", f: "rgba(210,238,250,0.75)", h: "#ffffff" }} x={q.x} y={q.y} px={px} />);
  }
  for (const [i, f] of p.fx.entries()) {
    if (f.a <= 0.02) continue;
    n.push(
      <Spr outline={null} key={`fx${i}`} rows={FX_ROWS[f.kind]} pal={{ c: f.color ?? "#d9dccf" }} x={Math.round(f.x)} y={Math.round(f.y)} px={px} style={{ opacity: f.a }} />,
    );
  }
  return <>{n}</>;
};

export const GoatActor: React.FC<{
  a: Archetype;
  x: number;
  y: number;
  frame: number;
  fromStep: number | null;
  seed: number;
  px?: number;
  flip?: boolean;
  label?: string;
  fresh?: boolean;
  front?: boolean;
  back?: boolean;
  walk?: boolean;
  moonwalk?: boolean;
  me?: boolean;
  chatter?: boolean;
  cheerT?: number | null;
  showPlate?: boolean;
  plateScale?: number;
  variant?: number;
  gaze?: number;
  look?: { x: number; y: number };
}> = ({ a, x, y, frame, fromStep, seed, px: pxOverride, flip: flipOverride, label, fresh, front = false, back = false, walk = false, moonwalk = false, me = false, chatter = false, cheerT = null, showPlate, plateScale = 1, variant = 0, gaze = 0, look }) => {
  const px = pxOverride ?? a.px;
  // Small per-goat timing drift, like real singers.
  const drift = variant >= 6 ? Math.floor(variant / 6) % 3 : 0;
  const p = computePose(a, Math.max(0, frame - drift), fromStep, seed, variant);
  // The head tips a little toward the cursor too, not just the pupils.
  if (look && !p.lying) {
    p.headDy += Math.round(look.y * 1.6);
    p.headDx += Math.round(look.x * 1.1);
  }
  if (front && p.lying) {
    // an en-face sleeper dozes sitting up, legs tucked under
    p.lying = false;
    p.sitting = true;
    p.headDy = 1;
    p.headDx = 0;
  }
  if (moonwalk) {
    // Moonwalk: one foot flat sliding back while the other rests on its toe, then swap.
    const i = Math.floor(frame / 12) % 2;
    p.legs = [i ? "F" : "A", i ? "B" : "L", i ? "A" : "F", i ? "L" : "B"];
    p.legDy = [0, i ? 0 : -1, 0, i ? -1 : 0];
    p.dy = 0;
    p.eye = "up";
  } else if (walk) {
    const cyc = ["F", "A", "B", "L"] as LegKey[];
    const i = Math.floor(frame / 4);
    p.legs = [cyc[(i + 2) % 4], cyc[i % 4], cyc[i % 4], cyc[(i + 2) % 4]];
    p.dy = i % 2 ? -1 : 0;
  }
  // Neighbours hop for joy for a couple of seconds when a new goat joins their group.
  if (cheerT !== null && cheerT >= 0 && cheerT < 64) {
    const t = (cheerT + seed * 3) % 16;
    p.dy -= Math.round(Math.sin((Math.PI * t) / 16) * 4);
    p.legs = ["L", p.legs[1], "L", p.legs[3]];
  }
  const pending = fromStep !== null && frame < fromStep * FRAMES_PER_STEP;
  const active = fromStep !== null && !pending;

  const pal: Pal = {
    ...furPal(a.fur.w, a.fur.s, a.fur.g),
    h: a.horn?.h,
    d: a.horn?.d,
    k: a.hoof,
    p: a.blush ?? a.fur.w,
  };
  const hoofHi = mixHex(a.hoof, "#ffffff", 0.3);
  const legNear: Pal = { ...furPal(a.fur.w, a.fur.s, a.fur.g), k: a.hoof, K: hoofHi };
  const legFar: Pal = { ...furPal(a.fur.s, a.fur.g, mixHex(a.fur.g, "#000000", 0.25)), k: a.hoof, K: hoofHi };
  const blink = !p.lying && !p.sleepy && (frame + seed * 37) % 113 < 3;

  // Every so often, at unpredictable moments, a goat drops a few pellets; they vanish after landing.
  const POOP_EPOCH = 220;
  const epoch = Math.floor(frame / POOP_EPOCH);
  const roll = poopRoll(seed, epoch);
  const poopT = roll < 0.22 ? (frame % POOP_EPOCH) - Math.floor(poopRoll(seed + 17, epoch) * (POOP_EPOCH - 60)) : -1;
  const pooping = !p.lying && !front && poopT >= 0 && poopT < 56;
  if (pooping && poopT < 18) {
    p.tail = 2;
    p.bodyDy = Math.max(p.bodyDy, 1);
  }
  const lyingDy = p.lying ? 7 : p.sitting ? 6 : 0;
  // some sleepy caregivers snooze on their backs, legs in the air
  const bellyUp = p.lying && a.id === "snore" && seed % 3 === 0;

  const upright = !p.lying;
  const bodyY = 11 + p.bodyDy + lyingDy;
  const headX = p.headDx;
  const headY = p.headDy + lyingDy + p.bodyDy;
  const legY = 25;

  const art: React.ReactNode[] = [];
  const armRows = (k: LegKey) => shade(p.mudra ? ARM_MUDRA : k === "L" ? ARM_UP : k === "F" ? ARM_OUT : ARM_DOWN);
  const armY = (k: LegKey) => (k === "L" ? bodyY - 3 : k === "F" ? bodyY + 4 : bodyY + 3);
  const armX = (k: LegKey, base: number) => (k === "F" ? base - 5 : base);
  const hind = (k: LegKey) => shade(HIND[k]);

  if (upright) {
    art.push(<Spr key="af" rows={armRows(p.legs[0])} pal={legFar} x={armX(p.legs[0], 20)} y={armY(p.legs[0]) + p.legDy[0]} px={px} />);
    if (!p.sitting) art.push(<Spr key="lf" rows={hind(p.legs[1])} pal={legFar} x={12} y={legY + p.legDy[1]} px={px} />);
    art.push(<Spr key="tail" rows={shade(TAIL[p.tail % TAIL.length])} pal={pal} x={21} y={bodyY + 6} px={px} />);
    // Head, chin and torso as one sprite so the outline only traces the outer silhouette.
    const merged = mergeRows([
      { rows: TORSO, x: 9, y: bodyY },
      { rows: JAW, x: headX, y: headY + 11 },
      { rows: HEAD, x: headX, y: headY },
    ]);
    art.push(<Spr key="body" rows={shade(merged.rows)} pal={pal} x={merged.x} y={merged.y} px={px} />);
  } else {
    art.push(<Spr key="tail" rows={TAIL[p.tail % TAIL.length]} pal={pal} x={35} y={8 + p.bodyDy + lyingDy} px={px} />);
    // head and lying body as one sprite, so no outline seam runs across the muzzle
    const mergedLying = mergeRows([
      { rows: BODY, x: 0, y: bodyY },
      { rows: HEAD, x: headX, y: headY },
    ]);
    art.push(<Spr key="body" rows={shade(mergedLying.rows)} pal={pal} x={mergedLying.x} y={mergedLying.y} px={px} />);
  }

  if (a.id === "clap") {
    const spot = "#f3ead9";
    art.push(<Box key="s1" x={14} y={bodyY + 3} w={3} h={2} px={px} color={spot} />);
    art.push(<Box key="s2" x={18} y={bodyY + 6} w={2} h={2} px={px} color={spot} />);
    art.push(<Box key="s3" x={12} y={bodyY + 9} w={2} h={1} px={px} color={spot} />);
  }
  if (a.id === "lead" && upright) {
    // a scuffed leather jacket, because дереза is capricious and needs the attitude to match
    art.push(<Spr key="jacket" rows={JACKET} pal={{ j: "#2b2b30", d: "#1c1c20", z: "#8a8a92", k: "#7c8290", p: "#c7ccd6" }} x={9} y={bodyY} px={px} />);
  }
  if (a.id === "kick" && upright) {
    // a gold chain to go with the crown
    art.push(<Box key="chain" x={13} y={bodyY + 1} w={8} h={1} px={px} color="#e8b53c" />);
    art.push(<Box key="chainL" x={13} y={bodyY + 2} w={1} h={1} px={px} color="#e8b53c" />);
    art.push(<Box key="chainR" x={20} y={bodyY + 2} w={1} h={1} px={px} color="#e8b53c" />);
    art.push(<Box key="pendant" x={16} y={bodyY + 3} w={2} h={2} px={px} color="#f6d55c" />);
  }

  // head group
  const head: React.ReactNode[] = [];
  if (a.id === "kick") head.push(<Spr key="crown" rows={CROWN} pal={{ y: "#e8b53c", R: "#e0554d", B: "#4a7fd8" }} x={10 + headX} y={-5 + headY} px={px} />);
  if (a.id === "kick") head.push(<Spr key="horns" rows={BIG_HORNS} pal={{ h: "#ebe1c9", d: "#c7b58c" }} x={11 + headX} y={-3 + headY} px={px} />);
  if (a.id === "hats") {
  }
  if (a.id === "lead") head.push(<Spr key="rebelHorns" rows={REBEL_HORNS} pal={{ h: "#6b7080", d: "#383b45" }} x={10 + headX} y={-4 + headY} px={px} />);
  if (a.id === "lead") head.push(<Spr key="mohawk" rows={MOHAWK} pal={{ r: "#e0484f", R: "#b8323a" }} x={14 + headX} y={1 + headY} px={px} />);
  if (a.id === "toms") {
    head.push(<Box key="band" x={7} y={4} w={11} h={1} px={px} color="#d8473a" />);
    head.push(<Spr key="ties" rows={TIES[p.swing % 2]} pal={{ r: "#d8473a" }} x={18} y={4} px={px} />);
  }

  if (a.id === "hats") head.push(<Spr key="beanie" rows={SANTA_HAT} pal={{ r: "#d8473a", R: "#b8323a", w: "#ffffff" }} x={6} y={-7} px={px} />);
  if (a.id === "bleat") head.push(<Spr key="furhat" rows={FURHAT} pal={{ F: "#8a5a3a", f: "#c9a27a" }} x={7} y={0} px={px} />);
  const rim = a.fur.g;
  if (p.lying || p.sleepy) {
    head.push(<Box key="c1" x={4} y={6} w={4} h={1} px={px} color={K} />);
    head.push(<Box key="c2" x={10} y={5} w={5} h={1} px={px} color={K} />);
    head.push(<Box key="c3" x={14} y={6} w={1} h={1} px={px} color={K} />);
  } else {
    const st = EYE_STYLES[a.id];
    // a touch of per-goat face variety: small eye-position jitter, skipped where glasses/frames
    // are fixed to the eye spots (would go out of register)
    const jitter = a.id === "arp" ? 0 : ((seed * 37) % 5) / 5 - 0.4;
    head.push(
      <Eye key="e1" cx={5.5 + jitter} cy={5.5 - jitter * 0.5} size={st.small} st={st} px={px} frame={frame} seed={seed * 2} mode={p.eye} speed={p.eyeSpeed} rim={rim} lid={a.fur.w} blink={blink} gaze={gaze} look={look} />,
    );
    head.push(
      <Eye key="e2" cx={12 - jitter} cy={4 + jitter * 0.5} size={st.big} st={st} px={px} frame={frame} seed={seed * 2 + 1} mode={p.eye} speed={p.eyeSpeed} rim={rim} lid={a.fur.w} blink={blink} gaze={gaze} look={look} />,
    );
  }

  if (a.id === "kick") {
    head.push(<Box key="b1" x={3} y={1} w={2} h={1} px={px} color={K} />);
    head.push(<Box key="b2" x={5} y={2} w={3} h={1} px={px} color={K} />);
    head.push(<Box key="b3" x={9} y={0} w={3} h={1} px={px} color={K} />);
    head.push(<Box key="b4" x={12} y={-1} w={4} h={1} px={px} color={K} />);
  }
  if (a.id === "bass") {
    head.push(<Box key="br1" x={2} y={2} w={6} h={1} px={px} color="#f6f6f2" />);
    head.push(<Box key="br2" x={8} y={0} w={8} h={1} px={px} color="#f6f6f2" />);
    head.push(<Spr key="beard" rows={BEARD} pal={{ e: "#f3f3ee", f: "#d0d0c8" }} x={1 + p.swing} y={13} px={px} />);
  }
  if (a.id === "arp") {
    const fr = "#a39383";
    head.push(<Box key="g1" x={2} y={2} w={8} h={1} px={px} color={fr} />);
    head.push(<Box key="g2" x={2} y={9} w={8} h={1} px={px} color={fr} />);
    head.push(<Box key="g3" x={2} y={2} w={1} h={8} px={px} color={fr} />);
    head.push(<Box key="g4" x={8} y={0} w={9} h={1} px={px} color={fr} />);
    head.push(<Box key="g5" x={8} y={8} w={9} h={1} px={px} color={fr} />);
    head.push(<Box key="g6" x={16} y={0} w={1} h={9} px={px} color={fr} />);
    head.push(<Box key="g7" x={8} y={2} w={1} h={7} px={px} color={fr} />);
    head.push(<Box key="g8" x={17} y={3} w={3} h={1} px={px} color={fr} />);
    if (p.glint) {
      head.push(<Box key="gl1" x={10} y={2} w={1} h={2} px={px} color="#ffffff" />);
      head.push(<Box key="gl2" x={11} y={2} w={1} h={1} px={px} color="#ffffff" />);
    }
  }
  if (a.id === "shimmer") head.push(<Spr key="wizard" rows={WIZARD} pal={{ p: "#7b6fe0", y: "#f6d55c" }} x={7} y={-8} px={px} />);
  if (a.id === "pad") head.push(<Spr key="flower" rows={FLOWER} pal={{ p: "#f27aa8", P: "#e0578f", y: "#f6d55c" }} x={16} y={0} px={px} />);
  if (a.id === "snore") head.push(<Spr key="cap" rows={CAP} pal={{ b: "#4a5ba8", w: "#f1eff8" }} x={5} y={-1} px={px} />);

  if (p.mouth === 1) head.push(<Box key="m" x={1} y={12} w={2} h={1} px={px} color={K} />);
  if (p.mouth === 3) {
    head.push(<Box key="sm1" x={1} y={12} w={1} h={1} px={px} color={K} />);
    head.push(<Box key="sm2" x={2} y={13} w={2} h={1} px={px} color={K} />);
  }
  if (p.mouth === 2) {
    head.push(<Box key="m" x={0} y={12} w={4} h={2} px={px} color={K} />);
    head.push(<Box key="t" x={1} y={13} w={2} h={1} px={px} color="#e27b8e" />);
  }
  if (p.bubble > 0) {
    head.push(
      <Spr key="bub" rows={circle(p.bubble)} pal={{ o: "#9fd0ea", f: "rgba(210,238,250,0.75)", h: "#ffffff" }} x={-1 - p.bubble * 2} y={11 - p.bubble} px={px} />,
    );
  }

  art.push(
    <div key="headgrp" style={{ position: "absolute", left: headX * px, top: headY * px }}>
      {head}
    </div>,
  );

  if ((a.id === "bell" || a.id === "bleat") && upright) {
    const sc = a.id === "bell" ? "#d8473a" : "#3f8f5a";
    art.push(<Box key="scarf" x={10} y={bodyY} w={12} h={2} px={px} color={sc} />);
    art.push(<Box key="scarf2" x={18 + (p.swing ? 1 : 0)} y={bodyY + 2} w={2} h={4} px={px} color={sc} />);
    art.push(<Box key="scarf3" x={18 + (p.swing ? 1 : 0)} y={bodyY + 4} w={2} h={1} px={px} color="#ffffff" />);
  }
  if (a.id === "bell") {
    art.push(<Box key="collar" x={11} y={bodyY + 1} w={10} h={1} px={px} color="#8a4b2d" />);
    art.push(<Spr key="bell" rows={BELL} pal={{ y: "#e8b53c", Y: "#fff0b0", k: "#6b4a1c" }} x={13 + p.swing} y={bodyY + 2} px={px} />);
  }

  // near legs
  if (p.lying) {
    if (a.id === "snore") art.push(<Spr key="plaid" rows={PLAID_SIDE} pal={PLAIDS[seed % PLAIDS.length]} x={12} y={bodyY + 2} px={px} />);
    if (bellyUp) {
      // legs in the air: drawn at the belly, the whole body is flipped upside down below
      for (const [i, lx] of [12, 16, 27, 31].entries()) {
        art.push(<Spr key={`up${i}`} rows={shade(["ws", "ws", "ws", "kK"])} pal={i % 2 ? legFar : legNear} x={lx} y={bodyY + 11 + (i % 2)} px={px} />);
      }
    } else {
      art.push(<Spr key="fold1" rows={["kk"]} pal={legNear} x={14} y={bodyY + 12} px={px} />);
      art.push(<Spr key="fold2" rows={["kk"]} pal={legNear} x={30} y={bodyY + 11} px={px} />);
    }
  } else {
    if (p.sitting) art.push(<Spr key="lotus" rows={shade(LOTUS)} pal={legNear} x={7} y={bodyY + 11} px={px} />);
    else art.push(<Spr key="ln" rows={hind(p.legs[3])} pal={legNear} x={17} y={legY + p.legDy[3]} px={px} />);
    if (a.id === "arp") {
      art.push(<Spr key="keys" rows={KEYS} pal={KEYS_PAL} x={-7} y={bodyY + 5} px={px} />);
      if (p.pipe >= 0) art.push(<Box key="lit" x={-3 + p.pipe * 2} y={bodyY + 6} w={1} h={1} px={px} color={KEY_LIT} />);
    }
    art.push(<Spr key="an" rows={armRows(p.legs[2])} pal={legNear} x={armX(p.legs[2], 10)} y={armY(p.legs[2]) + p.legDy[2]} px={px} />);
  }

  if (pooping) {
    for (let k = 0; k < 3; k++) {
      const t = poopT - k * 5;
      if (t < 0) continue;
      const fall = Math.min(1, t / 7);
      const px0 = 23 + k * 0.8 + (k === 1 ? 1 : 0);
      const py = bodyY + 12 + fall * (30.5 - bodyY - 12);
      const alpha = t < 30 ? 1 : Math.max(0, 1 - (t - 30) / 18);
      if (alpha <= 0) continue;
      art.push(
        <Spr key={`poo${k}`} rows={POO} pal={{ b: "#5b3b2b", h: "#8a6049" }} x={px0} y={py} px={px} style={{ opacity: alpha }} />,
      );
    }
  }

  const fxArt: React.ReactNode[] = [];
  for (const [i, f] of p.fx.entries()) {
    if (f.a <= 0.02) continue;
    fxArt.push(
      <Spr
        outline={null}
        key={`fx${i}`}
        rows={FX_ROWS[f.kind]}
        pal={{ c: f.color ?? "#d9dccf" }}
        x={Math.round(f.x)}
        y={Math.round(f.y)}
        px={px}
        style={{ opacity: f.a }}
      />,
    );
  }

  const W = GOAT_W * px;
  const flip = front ? false : flipOverride ?? a.facing === -1;
  const glowAlpha = fresh ? (Math.floor(frame / 5) % 2 ? 0.7 : 0.25) : active ? 0.5 : pending ? (Math.floor(frame / 6) % 2 ? 0.45 : 0.15) : 0;

  return (
    <div
      data-goat={a.id}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: W,
        height: GOAT_H * px,
        cursor: "pointer",
      }}
    >
      {p.lying ? (
        <>
          <Spr outline={null} rows={GLOW_LYING} pal={{ c: GLOW_COLOR }} x={0} y={26} px={px} style={{ opacity: glowAlpha }} />
          <Spr outline={null} rows={SHADOW_LYING} pal={{ c: "rgba(80,100,140,0.16)" }} x={5} y={28} px={px} />
        </>
      ) : (
        <>
          <Spr outline={null} rows={GLOW} pal={{ c: GLOW_COLOR }} x={2} y={29} px={px} style={{ opacity: glowAlpha }} />
          <Spr outline={null} rows={SHADOW} pal={{ c: "rgba(80,100,140,0.18)" }} x={7} y={30} px={px} />
        </>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${p.dx * px}px, ${p.dy * px}px) rotate(${p.rot}deg) ${flip ? "scaleX(-1)" : ""}`,
          transformOrigin: `50% ${20 * px}px`,
          opacity: p.opacity,
        }}
      >
        {front && !p.lying ? (
          <FrontGoat a={a} p={p} px={px} frame={frame} seed={seed} gaze={gaze} blink={blink} pal={pal} legNear={legNear} back={back} look={look} />
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, transformOrigin: `50% ${24.5 * px}px`, transform: bellyUp ? "scaleY(-1)" : undefined }}>
              {art}
            </div>
            {fxArt}
          </>
        )}
      </div>
      <div
        className={`plate${fresh || showPlate ? " on" : ""}`}
        style={{ left: (front ? 12.5 : flip ? 27 : 13) * px, top: 34 * px, borderColor: a.color, transform: `translateX(-50%) scale(${plateScale})`, transformOrigin: "50% 0" }}
      >
        {label ?? a.name}
        {pending ? " …" : ""}
      </div>
      {me ? (
        <div className="me-arrow" style={{ left: (front ? 12.5 : flip ? 27 : 13) * px, top: (-14 + Math.round(Math.sin(frame / 6) * 2)) * px }}>
          ▼
        </div>
      ) : null}
      {chatter && !p.shout ? (
        <div className="shout small" style={{ left: (front ? 12.5 : flip ? 30 : 10) * px, top: -6 * px }}>
          бе
        </div>
      ) : null}
      {p.shout ? (
        <div className="shout" style={{ left: flip ? W - 4 * px : 4 * px, top: (-8 + p.headDy) * px }}>
          {p.shout}
        </div>
      ) : null}
    </div>
  );
};
