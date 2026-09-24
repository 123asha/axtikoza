import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const PX = 12;
export const SCENE_W = 100;
export const SCENE_H = 60;
export const DURATION = 480;

const C = {
  sky: "#cdd2d8",
  hill: "#c2c8cf",
  hillShade: "#bac0c7",
  cloud: "#e4e7ea",
  cloudShade: "#d9dde1",
  ground: "#b8bec3",
  groundTop: "#abb2b6",
  groundDeep: "#afb5ba",
  tuft: "#9ea6a3",
  pebble: "#c9cdd1",
  shadow: "#a4abaf",
  w: "#f5f7f9",
  s: "#dde2e6",
  g: "#b6bbbd",
  d: "#9aa0a2",
  h: "#c4c8ca",
  k: "#3b2b31",
  p: "#eccfd1",
};

const PAL: Record<string, string> = {
  w: C.w,
  s: C.s,
  g: C.g,
  d: C.d,
  h: C.h,
  k: C.k,
  p: C.p,
};

// Goat faces left. Rows 0-10 are the head (bobs separately), 11+ the body.
export const HEAD = [
  "............hdd..hdd........",
  "...........hdd..hdd.........",
  "..........hdd..hdd..........",
  ".........hdd..hdd...........",
  "........wwwwwwwww...........",
  "......wwwwwwwwwwwsgg........",
  ".....wwwwwwwwwwwwwssgg......",
  "....wwwwwwwwwwwwwwws........",
  "...wwwwwwwwwwwwwwwwws.......",
  ".wwwwwwwwwwwwwwwwwwwws......",
  "wwwwwppwwwwwwwwwwwwwwws.....",
];

export const BODY = [
  "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww.....",
  "wkwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww..",
  ".wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww.",
  "..ssswwssswwwwwwwwwwwwwwwwwswwwwwwwwww",
  "...gs...sswwwwwwwwwswwwwwwwwsswwwwwwww",
  "...gg....swwwwwwwwwsswwwwwwwwwwwwwwwws",
  "....g....sswwwwwwwwwwwwwwwwwwwwwwwwwws",
  "..........swwwwwwwwwwwwwwwwwswwwwwwwss",
  "..........sswwwwwwwwwwwwwwwwsswwwwwss.",
  "...........ssswwwwwwwwwwwwwwwwwwwsss..",
  "............sssswwwwwwwwwwwwwwssss....",
  ".............gsgsssssssssssssgsg......",
  "..............g.gs.gs.sg.sg.g.........",
]

export const TAIL = [
  ["..ww", ".wws", "gws.", "g..."],
  ["...w", "..ww", ".wws", "gs.."],
  [".ww.", ".wws", "gws.", "g..."],
];

// 4-wide leg poses: forward reach, planted, push back, lifted.
export const LEG = {
  F: [".ws.", ".ws.", ".ws.", ".ws.", ".ws.", "ws..", "ws..", "ws..", "ws..", "kk.."],
  A: [".ws.", ".ws.", ".ws.", ".ws.", ".ws.", ".ws.", ".ws.", ".ws.", ".ws.", ".kk."],
  B: [".ws.", ".ws.", ".ws.", ".ws.", ".ws.", "..ws", "..ws", "..ws", "..ws", "..kk"],
  L: [".ws.", ".ws.", ".ws.", ".ws.", ".ws.", "..ws", "..ws", ".ws.", ".kk.", "...."],
};
export const CYCLE = [LEG.F, LEG.A, LEG.B, LEG.L];

export const EYE_BIG = ["..ggg..", ".gwwwg.", "gwwwwwg", "gwwwwwg", "gwwwwwg", ".gwwwg.", "..ggg.."];
export const EYE_SMALL = [".gggg.", "gwwwwg", "gwwwwg", "gwwwwg", "gwwwwg", ".gggg."];

const Sprite: React.FC<{
  rows: string[];
  x: number;
  y: number;
  pal?: Record<string, string>;
}> = ({ rows, x, y, pal = PAL }) => (
  <>
    {rows.flatMap((row, ry) =>
      [...row].map((c, rx) =>
        c === "." ? null : (
          <div
            key={`${rx}-${ry}`}
            style={{
              position: "absolute",
              left: (x + rx) * PX,
              top: (y + ry) * PX,
              // Slight overlap hides hairline seams when the player scales down.
              width: PX + 0.5,
              height: PX + 0.5,
              background: pal[c],
            }}
          />
        ),
      ),
    )}
  </>
);

const Rect: React.FC<{ x: number; y: number; w: number; h: number; color: string }> = ({
  x,
  y,
  w,
  h,
  color,
}) => (
  <div
    style={{
      position: "absolute",
      left: x * PX,
      top: y * PX,
      width: w * PX,
      height: h * PX,
      background: color,
    }}
  />
);

type EyeMode = "wobble" | "cross" | "spin" | "up";

const GooglyEye: React.FC<{
  x: number;
  y: number;
  big: boolean;
  frame: number;
  seed: number;
  blink: boolean;
  mode: EyeMode;
}> = ({ x, y, big, frame, seed, blink, mode }) => {
  const shape = big ? EYE_BIG : EYE_SMALL;
  const inner = shape.length - 2;
  const max = inner - 2;
  const mid = max / 2;

  let fx: number;
  let fy: number;
  if (mode === "cross") {
    fx = seed === 0 ? max : 0;
    fy = mid + 0.5;
  } else if (mode === "up") {
    fx = mid - 0.6;
    fy = 0;
  } else if (mode === "spin") {
    const a = frame * 0.55 + seed * 1.7;
    fx = mid + Math.cos(a) * mid;
    fy = mid + Math.sin(a) * mid;
  } else {
    const t = frame * 0.8 + seed * 2.1;
    fx = mid + (Math.sin(t) * 0.7 + Math.sin(t * 2.3) * 0.35) * mid;
    fy = mid + (Math.cos(t * 1.4) * 0.6 + 0.3) * mid;
  }
  let px = Math.max(0, Math.min(max, Math.round(fx)));
  let py = Math.max(0, Math.min(max, Math.round(fy)));
  // Keep the pupil off the cut corners of the round eye.
  if (big && (px === 0 || px === max) && (py === 0 || py === max)) {
    py = py === 0 ? 1 : max - 1;
  }

  if (blink) {
    const lidPal = { ...PAL, w: C.w, g: C.w };
    const midRow = Math.floor(shape.length / 2);
    return (
      <>
        <Sprite rows={shape} x={x} y={y} pal={lidPal} />
        <Rect x={x + 1} y={y + midRow} w={shape.length - 2} h={1} color={C.k} />
        <Rect x={x} y={y + midRow - 1} w={1} h={1} color={C.k} />
      </>
    );
  }

  return (
    <>
      <Sprite rows={shape} x={x} y={y} />
      <Rect x={x + 1 + px} y={y + 1 + py} w={2} h={2} color={C.k} />
      {big ? <Rect x={x + 1 + px} y={y + 1 + py} w={1} h={1} color="#ffffff" /> : null}
    </>
  );
};

const CLOUD = [
  "....cccc........",
  "..cccccccc.cc...",
  ".cccccccccccccc.",
  "eeeeeeeeeeeeeeee",
];

const HILL = [
  "..........hhhhhh..........",
  "......hhhhhhhhhhhhhh......",
  "..hhhhhhhhhhhhhhhhhhhhhh..",
  "hhhhhhhhhhhhhhhhhhhhhhhhhh",
];

const wrap = (v: number, period: number) => ((v % period) + period) % period;

const Scenery: React.FC<{ step: number; frame: number }> = ({ step, frame }) => {
  const HORIZON = 46;
  const cloudShift = Math.floor(frame / 15);
  const hillShift = Math.floor(frame / 10);

  const clouds = [
    { x: 4, y: 7 },
    { x: 38, y: 3 },
    { x: 70, y: 10 },
  ];
  const hills = [0, 30, 55, 80];

  const tufts: React.ReactNode[] = [];
  for (let i = -1; i < SCENE_W / 24 + 1; i++) {
    const base = i * 24 + wrap(step, 24);
    tufts.push(
      <React.Fragment key={i}>
        <Rect x={base + 3} y={HORIZON + 3} w={1} h={1} color={C.tuft} />
        <Rect x={base + 5} y={HORIZON + 2} w={1} h={2} color={C.tuft} />
        <Rect x={base + 7} y={HORIZON + 3} w={1} h={1} color={C.tuft} />
        <Rect x={base + 15} y={HORIZON + 7} w={2} h={1} color={C.pebble} />
        <Rect x={base + 20} y={HORIZON + 11} w={1} h={1} color={C.tuft} />
        <Rect x={base + 21} y={HORIZON + 10} w={1} h={2} color={C.tuft} />
        <Rect x={base + 10} y={HORIZON + 13} w={3} h={1} color={C.groundDeep} />
      </React.Fragment>,
    );
  }

  return (
    <>
      {clouds.map((c, i) => (
        <Sprite
          key={i}
          rows={CLOUD}
          x={wrap(c.x + cloudShift + 16, SCENE_W + 16) - 16}
          y={c.y}
          pal={{ c: C.cloud, e: C.cloudShade }}
        />
      ))}
      {hills.map((hx, i) => (
        <Sprite
          key={i}
          rows={HILL}
          x={wrap(hx + hillShift + 26, SCENE_W + 26) - 26}
          y={HORIZON - 4}
          pal={{ h: i % 2 ? C.hill : C.hillShade }}
        />
      ))}
      <Rect x={0} y={HORIZON} w={SCENE_W} h={SCENE_H - HORIZON} color={C.ground} />
      <Rect x={0} y={HORIZON} w={SCENE_W} h={1} color={C.groundTop} />
      {tufts}
    </>
  );
};

export const Goat: React.FC = () => {
  const frame = useCurrentFrame();

  const STEP = 5;
  const step = Math.floor(frame / STEP);
  const leg = (o: number) => CYCLE[(step + o) % CYCLE.length];

  const bob = step % 2 === 0 ? 0 : -1;
  const headBob = step % 4 === 1 ? 1 : 0;

  const loopF = frame % 120;
  const blink = (loopF >= 26 && loopF < 30) || (loopF >= 104 && loopF < 107);
  const mode: EyeMode =
    loopF >= 44 && loopF < 62
      ? "cross"
      : loopF >= 72 && loopF < 90
        ? "spin"
        : loopF >= 90 && loopF < 100
          ? "up"
          : "wobble";

  const tail = TAIL[Math.floor(frame / 4) % TAIL.length];

  const gx = 31;
  const gy = 18 + bob;
  const legY = gy + 19 - bob;
  const farLeg = { ...PAL, w: C.g, s: C.d };

  return (
    <AbsoluteFill style={{ backgroundColor: C.sky }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <Scenery step={step} frame={frame} />

        {/* shadow */}
        <Rect x={gx + 7} y={47} w={30} h={1} color={C.shadow} />
        <Rect x={gx + 11} y={48} w={22} h={1} color={C.shadow} />

        <Sprite rows={leg(2)} x={gx + 10} y={legY} pal={farLeg} />
        <Sprite rows={leg(0)} x={gx + 26} y={legY} pal={farLeg} />

        <Sprite rows={tail} x={gx + 35} y={gy + 8} />
        <Sprite rows={BODY} x={gx} y={gy + 11} />

        <div style={{ position: "absolute", left: 0, top: headBob * PX }}>
          <Sprite rows={HEAD} x={gx} y={gy} />
          <GooglyEye x={gx + 3} y={gy + 3} big={false} frame={frame} seed={0} blink={blink} mode={mode} />
          <GooglyEye x={gx + 9} y={gy + 1} big frame={frame} seed={1} blink={blink} mode={mode} />
        </div>

        <Sprite rows={leg(0)} x={gx + 16} y={legY} />
        <Sprite rows={leg(2)} x={gx + 31} y={legY} />
      </div>
    </AbsoluteFill>
  );
};
