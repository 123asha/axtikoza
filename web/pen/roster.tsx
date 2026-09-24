import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ARCHETYPES, GoatActor } from "./goats";
import { Engine } from "./audio";
import { TrackId } from "./music";
import { GOATS, TRACK_OF, ARCH_ORDER, ArchKey } from "./quizData";

const PX = 6;
const COLS = 6;
// The original curated front/side mix, before the cursor starts moving anyone.
const FRONT_IDX = new Set<number>([1, 3, 4, 7, 9, 10]);
// Each slot is wide enough that even the widest goat (arms out, horns, instruments) never
// reaches its neighbour; the whole grid is then scaled to fit the screen, so it's always
// centred and never overlaps, on any window size.
const SLOT_W = 230;
const SLOT_H = 260;
const GAP = 20;
const N = 12;
const ROWS = Math.ceil(N / COLS);
const NATURAL_W = COLS * SLOT_W + (COLS - 1) * GAP;
const NATURAL_H = ROWS * SLOT_H + (ROWS - 1) * GAP;
// The front-on pose is drawn narrower than the side-on one inside the same box, so a plain
// centre-of-box alignment leaves visibly uneven air between neighbours; nudge it back to true centre.
const FRONT_RECENTER = 24;

const useViewport = () => {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
};

// Before any track is on there's no audio clock yet, so the goats just idle on a plain ticker.
// The moment a track starts, we switch to the engine's own clock (what's actually audible right
// now), so every dance move lands exactly on its beat instead of drifting from a separate timer.
const useFrame = (engine: React.MutableRefObject<Engine | null>) => {
  const [f, setF] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const e = engine.current;
      setF(e ? Math.max(0, Math.round(e.visualFrame())) : Math.floor(((now - t0) / 1000) * 30));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [engine]);
  return f;
};

const useMouse = () => {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPt({ x: e.clientX, y: e.clientY });
    const onLeave = () => setPt(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return pt;
};

// Front-facing goats glance aside toward a neighbour every so often, so the row reads as a
// company that notices each other, not a static lineup. Suppressed while the mouse is around,
// since the live cursor-follow takes over.
const glanceGaze = (i: number, frame: number) => {
  const period = 330 + (i % 5) * 40;
  const phase = (frame + i * 97) % period;
  return phase < 22 ? 0 : 1;
};

type Orient = "front" | "left" | "right";

const Goat: React.FC<{
  id: ArchKey;
  i: number;
  frame: number;
  fromStep: number | null;
  onToggle: () => void;
  orient: Orient;
  look: { x: number; y: number } | null;
}> = ({ id, i, frame, fromStep, onToggle, orient, look }) => {
  const a = ARCHETYPES.find((x) => x.id === TRACK_OF[id])!;
  const front = orient === "front";
  // unflipped art faces left (head drawn at the low-x side of the body)
  const flip = !front && orient === "right";
  return (
    <div className={`slot${fromStep !== null ? " on" : ""}`} onClick={onToggle}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 20,
          width: 40 * PX,
          height: 33 * PX,
          transform: `translateX(calc(-50% + ${front ? FRONT_RECENTER : 0}px))`,
          transformOrigin: "50% 100%",
        }}
      >
        <GoatActor
          a={a}
          x={0}
          y={0}
          px={PX}
          flip={flip}
          front={front}
          frame={frame}
          fromStep={fromStep}
          seed={i + 1}
          variant={i}
          gaze={front ? glanceGaze(i, frame) : 0}
          look={look ?? undefined}
        />
      </div>
      <div className="label">{GOATS[id].name.replace(/^Коза-/, "")}</div>
    </div>
  );
};

const EMPTY = Object.fromEntries(ARCH_ORDER.map((id) => [id, null])) as Record<ArchKey, number | null>;

// Every goat's slot position is a fixed function of its index and the current fit scale, so we
// can work out, with no DOM measuring at all, exactly where each one sits on screen and how far
// (and in which direction) the cursor is from it.
const slotCenter = (i: number, scale: number, vw: number, vh: number) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const gx = col * (SLOT_W + GAP) + SLOT_W / 2;
  const gy = row * (SLOT_H + GAP) + SLOT_H * 0.4;
  return { x: vw / 2 + (gx - NATURAL_W / 2) * scale, y: vh / 2 + (gy - NATURAL_H / 2) * scale };
};

const App: React.FC = () => {
  const engine = useRef<Engine | null>(null);
  const frame = useFrame(engine);
  const { w: vw, h: vh } = useViewport();
  const scale = Math.min(0.85, (vw - 200) / NATURAL_W, (vh - 32) / NATURAL_H);
  const mouse = useMouse();
  const [fromSteps, setFromSteps] = useState<Record<ArchKey, number | null>>(EMPTY);
  const orients = useRef<Orient[]>(ARCH_ORDER.map((_, i) => (FRONT_IDX.has(i) ? "front" : i % 2 === 0 ? "left" : "right")));
  const [, bump] = useState(0);

  useEffect(() => {
    if (!mouse) return;
    let changed = false;
    ARCH_ORDER.forEach((_, i) => {
      const c = slotCenter(i, scale, vw, vh);
      const dx = mouse.x - c.x;
      const dy = mouse.y - c.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const nx = dx / dist;
      const prev = orients.current[i];
      const enter = 0.3;
      const exit = 0.15;
      let next: Orient = prev;
      if (prev === "front") next = nx < -enter ? "left" : nx > enter ? "right" : "front";
      else if (prev === "left") next = nx > -exit ? (nx > enter ? "right" : "front") : "left";
      else next = nx < exit ? (nx < -enter ? "left" : "front") : "right";
      if (next !== prev) {
        orients.current[i] = next;
        changed = true;
      }
    });
    if (changed) bump((n) => n + 1);
  }, [mouse, scale, vw, vh]);

  const looks = useMemo(
    () =>
      ARCH_ORDER.map((_, i) => {
        if (!mouse) return null;
        const c = slotCenter(i, scale, vw, vh);
        const dx = mouse.x - c.x;
        const dy = mouse.y - c.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const reach = Math.min(1, dist / 420);
        return { x: (dx / dist) * reach, y: (dy / dist) * reach };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mouse, scale, vw, vh],
  );

  const toggle = (id: ArchKey) => {
    if (!engine.current) engine.current = new Engine(0);
    const e = engine.current;
    e.resume();
    const track: TrackId = TRACK_OF[id];
    setFromSteps((prev) => {
      if (prev[id] !== null) {
        e.deactivate(track);
        return { ...prev, [id]: null };
      }
      return { ...prev, [id]: e.activate(track) };
    });
  };

  return (
    <div className="roster">
      <div className="grid" style={{ transform: `scale(${scale})` }}>
        {ARCH_ORDER.map((id, i) => (
          <Goat
            key={id}
            id={id}
            i={i}
            frame={frame}
            fromStep={fromSteps[id]}
            onToggle={() => toggle(id)}
            orient={orients.current[i]}
            look={looks[i]}
          />
        ))}
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
