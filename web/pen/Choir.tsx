import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ARCHETYPES, Archetype, GoatActor } from "./goats";
import { BAR_STEPS, CHATTER_STEP, chatterAt, FRAMES_PER_STEP, TrackId } from "./music";
import { ARCH_ORDER, ArchKey, TRACK_OF } from "./quizData";
import { Terrain, View } from "./terrain";
import { Spr } from "./sprites";
import { furPal, shade } from "./goats";

export type Member = { uid: string; key: ArchKey; label?: string };

export type ChoirProps = {
  vw: number;
  vh: number;
  members: Member[];
  fromSteps: Record<TrackId, number | null>;
  freshUid: string | null;
  freshAt: number | null;
  meUids: string[];
  bottomInset: number;
  view: View;
};

export type { View };

// Temporarily off: mountain, ledges, props, sleigh and snowfall. Flip to true to bring them back.
const SHOW_SCENERY = true;

const ARCH_BY_TRACK = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a])) as Record<TrackId, Archetype>;

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

// Goats behave like map pins: they shrink/grow with the map much less than distances do.
export const PIN_PX = 4;
// Goats scale with the map exactly, so if they don't overlap at one zoom they never do.
const PIN_EXP = 1;
export const pinPx = (z: number) => PIN_PX * Math.pow(z, PIN_EXP);
// A group spreads out once neighbours are at least this many goat pixels apart on screen.
const SPREAD_UNITS = 22;
// A goat's own footprint in world units at zoom 1 (added around each huddle).
const GOAT_W = 26 * PIN_PX;
const GOAT_H = 34 * PIN_PX;

type Slot = { m: Member; a: Archetype; wx: number; wy: number; flip: boolean };
type Group = {
  key: ArchKey;
  a: Archetype;
  x: number;
  y: number;
  w: number;
  h: number;
  count: number;
  spacing: number;
  cx: number;
  cy: number;
  topFeet: number;
  extentW: number;
  extentH: number;
};

export const worldWidth = (vw: number) => Math.round(vw * 18);
// The map also runs on below the screen: more slope to drag down to.
export const WORLD_H = 16;
export const worldHeight = (vh: number) => Math.round(vh * WORLD_H);

// Minimum distance between two goats so neither covers the other (boxes don't overlap).
const GAP_X = 26 * PIN_PX + 14;
// extra room below each goat for its name plate
const GAP_Y = 34 * PIN_PX + 34;

// Horizon for the scenery: sky and mountains sit above the highest goat.
export type MountainShape = { cx: number; apex: number; k: number; fg: number; terraces: { x0: number; x1: number; top: number; bottom: number }[] };
export const mountainFor = (members: Member[], vw: number, vh: number): MountainShape => {
  const { slots } = layoutChoir(members, vw, vh, 0);
  const cx = worldWidth(vw) / 2;
  const topFeet = slots.length ? Math.min(...slots.map((sl) => sl.wy)) : vh * 1.2;
  // the horizon sits a little above the highest goat's head
  const apex = topFeet - GOAT_H - 180;
  return { cx, apex, k: 0, fg: apex, terraces: [] };
};

// Starting view: the whole choir, with room under the title and above the zoom bar.
// Goats are pins (screen size ∝ z^PIN_EXP), so their height is added in screen space.
// One shared field: each archetype has a loose centre of gravity, but its goats scatter widely
// and mingle with the neighbours at the edges, so there are no visible group borders.
// No goat ever covers another anywhere on the field.
const FIELD_COLS = 4;
const layoutCache = new Map<string, { slots: Slot[]; groups: Group[] }>();
export const layoutChoir = (members: Member[], vw: number, vh: number, _bottomInset: number) => {
  const ck = `${vw}x${vh}:` + members.map((m) => m.uid).join(",");
  const hit = layoutCache.get(ck);
  if (hit) return hit;
  const present = ARCH_ORDER.filter((k) => members.some((m) => m.key === k));
  const byKey = Object.fromEntries(present.map((k) => [k, members.filter((m) => m.key === k)])) as Record<ArchKey, Member[]>;
  const avg = members.length / Math.max(1, present.length);
  // centres a bit closer than each group's own spread, so neighbours overlap into one field
  const S = Math.sqrt(Math.max(1, avg) * GAP_X * GAP_Y * 3.2);
  const cols = Math.min(FIELD_COLS, Math.max(1, present.length));
  const cx0 = worldWidth(vw) / 2;
  const top = vh * 1.2;
  const centres = present.map((_, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const inRow = Math.min(cols, present.length - r * cols);
    return { x: cx0 + (c - (inRow - 1) / 2) * S * 1.3 + (r % 2 ? S * 0.35 : 0), y: top + r * S * 0.95 };
  });
  const rnd = rng(hash(ck));
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const placed: { x: number; y: number }[] = [];
  const free = (x: number, y: number) => placed.every((p) => Math.abs(p.x - x) >= GAP_X || Math.abs(p.y - y) >= GAP_Y);
  const slots: Slot[] = [];
  // round-robin over groups so every group gets its share of the good spots
  const queues = present.map((k) => [...byKey[k]]);
  for (let left = members.length; left > 0; ) {
    queues.forEach((q, gi) => {
      const m = q.shift();
      if (!m) return;
      left--;
      const c = centres[gi];
      let sig = S * 0.75;
      let x = c.x;
      let y = c.y;
      for (let t = 0; ; t++) {
        x = c.x + gauss() * sig * 1.3;
        y = c.y + gauss() * sig * 0.8;
        if (free(x, y)) break;
        if (t % 40 === 39) sig *= 1.12;
      }
      placed.push({ x, y });
      const h = hash(m.uid);
      slots.push({ m, a: ARCH_BY_TRACK[TRACK_OF[m.key]], wx: x, wy: y, flip: (h >>> 7) % 2 === 0 });
    });
  }
  const groups: Group[] = present.map((k, gi) => {
    const own = slots.filter((sl) => sl.m.key === k);
    const xs = own.map((sl) => sl.wx);
    const ys = own.map((sl) => sl.wy);
    const x0 = Math.min(...xs) - GOAT_W / 2;
    const x1 = Math.max(...xs) + GOAT_W / 2;
    const topFeet = Math.min(...ys);
    const y1 = Math.max(...ys);
    return {
      key: k,
      a: ARCH_BY_TRACK[TRACK_OF[k]],
      x: x0,
      y: topFeet - GOAT_H,
      w: x1 - x0,
      h: y1 - topFeet + GOAT_H,
      count: own.length,
      spacing: GAP_X,
      cx: centres[gi].x,
      cy: (topFeet + y1) / 2,
      topFeet,
      extentW: x1 - x0,
      extentH: y1 - topFeet + GOAT_H,
    };
  });
  const res = { slots, groups };
  layoutCache.set(ck, res);
  return res;
};

// Starting view: the whole field, with room under the title and above the zoom bar.
export const homeView = (members: Member[], vw: number, vh: number) => {
  const { slots } = layoutChoir(members, vw, vh, 0);
  const cx = worldWidth(vw) / 2;
  if (!slots.length) return { z: 1, tx: vw / 2 - cx, ty: 0 };
  const minX = Math.min(...slots.map((sl) => sl.wx));
  const maxX = Math.max(...slots.map((sl) => sl.wx));
  const topFeet = Math.min(...slots.map((sl) => sl.wy));
  const maxY = Math.max(...slots.map((sl) => sl.wy));
  const topS = 80;
  const botS = vh - 104;
  let z = 1;
  for (let k = 0; k < 6; k++) {
    const P = pinPx(z);
    const zW = (vw - 30 - 26 * P) / Math.max(1, maxX - minX);
    const zH = (botS - topS - 36 * P) / Math.max(1, maxY - topFeet);
    z = Math.min(1.4, zW, zH);
  }
  // start a bit closer than "fit everything": sky and horizon on top, the choir filling the view
  z *= 1.5;
  const horizon = topFeet - GOAT_H - 180;
  const ty = vh * 0.2 - horizon * z;
  return { z, tx: vw / 2 - ((minX + maxX) / 2) * z, ty };
};

export const spreadZoom = (_g: { spacing: number; count: number }) => 1.6;

// Ded Moroz's sleigh, pulled by a team of galloping reindeer, flies across the sky now and then.
const SLEIGH = [
  ".........www.......",
  "........rrrrw......",
  ".......rrrrrr......",
  "......rrffkfr......",
  "...nn.rrffffr......",
  "..nnnnwwwwwwrr.....",
  ".nnNnnnwwwwwrrr....",
  ".nnnnnrwwwrrrrrll..",
  "rrrrrrrrrrrrrrrrr..",
  "rRRRRRRRRRRRRRRRr..",
  ".rrrrrrrrrrrrrrr...",
  "..y..........y.....",
  "yyyyyyyyyyyyyyyyy..",
];
const SLEIGH_PAL = {
  r: "#d8473a", R: "#a8302a", w: "#ffffff", f: "#f2c9b0", k: "#3b2b31", y: "#e8b53c", n: "#a0703c", N: "#7a5230", l: "#6b4a2c",
};
// Reindeer (facing right): 'w' fur gets automatic shading, c = cream chest, h/d = antlers, n = nose.
const DEER_TOP = [
  "..............h.h.h...",
  ".............hd.hdh...",
  "..............hhdh....",
  "...............hdh....",
  "..............wwww....",
  ".............wwkwwww..",
  ".............wwwwwwwn.",
  "............wwwwwcc...",
  "..c.wwwwwwwwwwwwcc....",
  ".ccwwwwwwwwwwwwwcc....",
  "..wwwwwwwwwwwwwwc.....",
  "..wwwwwwwwwwwwwwc.....",
  "...wwwwwwwwwwwcc......",
];
// gallop cycle: stretched, gathering, tucked, gathering
const DEER_LEGS = [
  ["..ss........ww........", ".ss..........ww.......", "kk............kk......"],
  ["...ss......ww.........", "...s.s.....w.w........", "..k...k...k...k......."],
  ["....ssw...www.........", ".....sw...ww..........", ".....kk...kk..........",],
  ["...ss......ww.........", "...s.s.....w.w........", "..k...k...k...k.......",],
];
const DEER_PAL = (lead: boolean) => ({
  ...furPal("#a8774d", "#7f5737", "#5b3c25"),
  c: "#efe2c8",
  h: "#dccaa2",
  d: "#b59f74",
  k: "#2b2124",
  n: lead ? "#ff4a3d" : "#2b2124",
});
const TEAM = 4;
const DEER_GAP = 19;
const SLEIGH_PERIOD = 1200;
const SLEIGH_DUR = 900;
const SLEIGH_FIRST = 240;
const SLEIGH_PX = 4;
export const SLEIGH_UNITS_W = 19 + 6 + TEAM * DEER_GAP;

// Position in world coordinates: the sleigh crosses the sky above the mountain as part of the map.
const sleighPos = (frame: number, ww: number, vh: number) => {
  const t = (frame - SLEIGH_FIRST) % SLEIGH_PERIOD;
  if (frame < SLEIGH_FIRST || t >= SLEIGH_DUR) return null;
  const w = SLEIGH_UNITS_W * SLEIGH_PX;
  const k = t / SLEIGH_DUR;
  return {
    x: -w + (ww + 2 * w) * k,
    y: vh * 0.07 + Math.sin(k * Math.PI * 5) * 22,
    flight: Math.floor((frame - SLEIGH_FIRST) / SLEIGH_PERIOD),
    k,
  };
};

const Sleigh: React.FC<{ frame: number; ww: number; vh: number }> = ({ frame, ww, vh }) => {
  const pos = sleighPos(frame, ww, vh);
  if (!pos) return null;
  const { x, y } = pos;
  const P = SLEIGH_PX;
  const deer = Array.from({ length: TEAM }, (_, i) => {
    const ux = 19 + 6 + i * DEER_GAP;
    const bob = Math.round(Math.sin((frame + i * 5) / 4) * 1.5);
    const legs = DEER_LEGS[Math.floor((frame + i * 3) / 4) % DEER_LEGS.length];
    return { ux, bob, rows: shade([...DEER_TOP, ...legs]), lead: i === TEAM - 1 };
  });
  // harness: from the sleigh's front to each reindeer's chest
  const pts = [{ x: 16, y: 7 }, ...deer.map((d) => ({ x: d.ux + 3, y: 9 + d.bob }))];
  const trail = Array.from({ length: 12 }, (_, i) => ({
    x: x - 6 - i * 16,
    y: y + 34 + Math.sin((frame - i * 3) / 4) * 6 + i * 1.5,
    a: 1 - i / 12,
    c: i % 3 === 0 ? "#f6d55c" : "#ffffff",
  }));
  return (
    <>
      {trail.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: 5, height: 5, background: p.c, opacity: p.a, boxShadow: "0 0 0 1px rgba(160,180,210,.4)", pointerEvents: "none" }} />
      ))}
      <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
        {pts.slice(1).map((b, i) => {
          const a = pts[i];
          const dx = (b.x - a.x) * P;
          const dy = (b.y - a.y) * P;
          return (
            <div
              key={`h${i}`}
              style={{
                position: "absolute",
                left: a.x * P,
                top: a.y * P,
                width: Math.hypot(dx, dy),
                height: 2,
                background: "#6b4a2c",
                transformOrigin: "0 50%",
                transform: `rotate(${Math.atan2(dy, dx)}rad)`,
              }}
            />
          );
        })}
        {deer.map((d, i) => (
          <Spr key={`d${i}`} rows={d.rows} pal={DEER_PAL(d.lead)} x={d.ux} y={-2 + d.bob} px={P} />
        ))}
        <Spr rows={SLEIGH} pal={SLEIGH_PAL} x={0} y={0} px={P} />
      </div>
    </>
  );
};

export const Choir: React.FC<ChoirProps> = ({ vw, vh, members, fromSteps, freshUid, freshAt, meUids, bottomInset, view }) => {
  const frame = useCurrentFrame();
  const { slots, groups } = layoutChoir(members, vw, vh, bottomInset);
  // Pins grow a little as the camera closes in, far slower than the distances between them.
  const P = pinPx(view.z);
  // names show once goats are big enough for a plate to fit between them
  const showNames = P >= 4;
  const toScreen = (wx: number, wy: number) => ({ x: view.tx + wx * view.z, y: view.ty + wy * view.z });

  // Far out a group is a tight huddle; past ~30 overlapping goats the rest are hidden behind anyway.
  const HUDDLE_CAP = 30;
  const shown = new Map<ArchKey, number>();
  const pins = slots
    .filter((s) => {
      const g = groups.find((x) => x.key === s.m.key)!;
      if (g.spacing * view.z >= SPREAD_UNITS * P || s.m.uid === freshUid) return true;
      const n = shown.get(s.m.key) ?? 0;
      shown.set(s.m.key, n + 1);
      return n < HUDDLE_CAP;
    })
    .map((s) => ({ s, ...toScreen(s.wx, s.wy) }))
    .filter((p) => p.x > -40 * P && p.x < vw + 40 * P && p.y > -10 * P && p.y < vh + 40 * P)
    .sort((p, q) => p.y - q.y);

  // Who is muttering "бе" right now (same timetable as the audio engine).
  let chatterUid: string | null = null;
  {
    const bar = Math.floor(frame / (BAR_STEPS * FRAMES_PER_STEP));
    for (const b of [bar, bar - 1]) {
      const c = chatterAt(b);
      if (!c) continue;
      const age = frame - (b * BAR_STEPS + CHATTER_STEP) * FRAMES_PER_STEP;
      if (age < 0 || age > 22) continue;
      const inGroup = slots.filter((x) => x.m.key === ARCH_ORDER[c.group]);
      if (inGroup.length) chatterUid = inGroup[Math.floor(c.pick * inGroup.length)].m.uid;
    }
  }
  const freshKey = freshUid ? members.find((m) => m.uid === freshUid)?.key : undefined;

  const flakes = Array.from({ length: 28 }, (_, i) => {
    const r = rng(i * 7 + 1);
    const speed = 0.6 + r() * 1.2;
    const size = r() < 0.25 ? 2 : 1;
    const x = (r() * vw + Math.sin((frame + i * 13) / 40) * 20 + frame * 0.3) % vw;
    const y = (r() * vh + frame * speed) % vh;
    return { x: Math.round(x / 4) * 4, y: Math.round(y / 4) * 4, size, o: 0.55 + r() * 0.45 };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: SHOW_SCENERY ? "#eef2f7" : "#ffffff", overflow: "hidden" }}>
      {SHOW_SCENERY ? <Terrain vw={vw} vh={vh} ww={worldWidth(vw)} view={view} shape={mountainFor(members, vw, vh)} /> : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: worldWidth(vw),
          height: worldHeight(vh),
          transformOrigin: "0 0",
          transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.z})`,
        }}
      >
        {SHOW_SCENERY ? <Sleigh frame={frame} ww={worldWidth(vw)} vh={vh} /> : null}
      </div>

      {/* name plates in their own layer, under every goat, so a plate never covers a goat */}
      {showNames
        ? pins.map(({ s, x, y }) =>
            s.m.label ? (
              <div key={`n${s.m.uid}`} className="plate on" style={{ left: x, top: y + 2 * P, zIndex: 0 }}>
                {s.m.label}
              </div>
            ) : null,
          )
        : null}
      {pins.map(({ s, x, y }) => (
        <GoatActor
          key={s.m.uid}
          a={s.a}
          x={Math.round(x - (s.m.key === "jester" || (hash(s.m.uid) >>> 21) % 5 === 0 ? 12.5 : s.flip ? 27.5 : 12.5) * P)}
          y={Math.round(y - 32 * P)}
          px={P}
          flip={s.flip}
          label={s.m.label}
          showPlate={false}
          fresh={s.m.uid === freshUid}
          frame={frame}
          fromStep={fromSteps[s.a.id]}
          front={s.m.key === "jester" || (hash(s.m.uid) >>> 21) % 5 === 0}
          me={meUids.includes(s.m.uid)}
          chatter={s.m.uid === chatterUid}
          cheerT={freshAt !== null && s.m.key === freshKey && s.m.uid !== freshUid ? frame - freshAt : null}
          seed={(hash(s.m.uid) % 97) + 1}
          variant={hash(s.m.uid) % 18}
          gaze={(hash(s.m.uid) >>> 11) % 4}
        />
      ))}

      {([] as typeof flakes).map((f, i) => (
        <div
          key={`f${i}`}
          style={{
            position: "absolute",
            left: f.x,
            top: f.y,
            width: f.size * 4,
            height: f.size * 4,
            background: "#ffffff",
            opacity: f.o,
            boxShadow: "0 0 0 1px rgba(160,180,210,0.35)",
            pointerEvents: "none",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
