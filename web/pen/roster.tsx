import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ARCHETYPES, GoatActor } from "./goats";
import { Engine } from "./audio";
import { GOATS, TRACK_OF, ARCH_ORDER } from "./quizData";

const PX = 6;
const COLS = 6;
// Alternate front-facing and side-on so the choir reads as one crowd, not a repeating pattern.
const FRONT = new Set<number>([1, 3, 4, 7, 9, 10]);
// Each slot is wide enough that even the widest goat (arms out, horns, instruments) never
// reaches its neighbour; the whole grid is then scaled to fit the screen, so it's always
// centred and never overlaps, on any window size.
const SLOT_W = 230;
const SLOT_H = 260;
const GAP = 20;
const N = 12;
const ROWS = Math.ceil(N / COLS);

const useFit = () => {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const naturalW = COLS * SLOT_W + (COLS - 1) * GAP;
    const naturalH = ROWS * SLOT_H + (ROWS - 1) * GAP;
    const onResize = () => setScale(Math.min(0.85, (window.innerWidth - 200) / naturalW, (window.innerHeight - 32) / naturalH));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return scale;
};

const useFrame = () => {
  const [f, setF] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      setF(Math.floor(((now - t0) / 1000) * 30));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return f;
};

// Front-facing goats glance aside toward a neighbour every so often, so the row reads as a
// company that notices each other, not a static lineup.
const glanceGaze = (i: number, frame: number) => {
  const period = 330 + (i % 5) * 40;
  const phase = (frame + i * 97) % period;
  return phase < 22 ? 0 : 1;
};

const Goat: React.FC<{ id: (typeof ARCH_ORDER)[number]; i: number; frame: number; on: boolean; onToggle: () => void }> = ({
  id,
  i,
  frame,
  on,
  onToggle,
}) => {
  const a = ARCHETYPES.find((x) => x.id === TRACK_OF[id])!;
  const front = FRONT.has(i);
  const flip = !front && i % 2 === 0;
  return (
    <div className={`slot${on ? " on" : ""}`} onClick={onToggle}>
      <div style={{ position: "absolute", left: "50%", bottom: 20, width: 40 * PX, height: 33 * PX, transform: "translateX(-50%)", transformOrigin: "50% 100%" }}>
        <GoatActor
          a={a}
          x={0}
          y={0}
          px={PX}
          flip={flip}
          front={front}
          frame={frame}
          fromStep={on ? 0 : null}
          seed={i + 1}
          variant={i}
          gaze={front ? glanceGaze(i, frame) : 0}
        />
      </div>
      <div className="label">{GOATS[id].name.replace(/^Коза-/, "")}</div>
    </div>
  );
};

const App: React.FC = () => {
  const frame = useFrame();
  const scale = useFit();
  const engine = useRef<Engine | null>(null);
  const [on, setOn] = useState<Set<(typeof ARCH_ORDER)[number]>>(new Set());

  const toggle = (id: (typeof ARCH_ORDER)[number]) => {
    if (!engine.current) engine.current = new Engine(0);
    const e = engine.current;
    e.resume();
    const track = TRACK_OF[id];
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        e.deactivate(track);
        next.delete(id);
      } else {
        e.activate(track);
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="roster">
      <div className="grid" style={{ transform: `scale(${scale})` }}>
        {ARCH_ORDER.map((id, i) => (
          <Goat key={id} id={id} i={i} frame={frame} on={on.has(id)} onToggle={() => toggle(id)} />
        ))}
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
