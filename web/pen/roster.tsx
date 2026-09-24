import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ARCHETYPES, GoatActor } from "./goats";
import { Engine } from "./audio";
import { TRACK_OF, ARCH_ORDER } from "./quizData";

const PX = 6;

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

const Card: React.FC<{ id: (typeof ARCH_ORDER)[number]; frame: number; on: boolean; onToggle: () => void }> = ({
  id,
  frame,
  on,
  onToggle,
}) => {
  const a = ARCHETYPES.find((x) => x.id === TRACK_OF[id])!;
  return (
    <div className={`card${on ? " on" : ""}`} onClick={onToggle}>
      <div className="stage-cell" style={{ width: 40 * PX, height: 44 * PX }}>
        <GoatActor a={a} x={4 * PX} y={6 * PX} px={PX} flip={false} frame={frame} fromStep={on ? 0 : null} seed={3} variant={0} gaze={1} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const frame = useFrame();
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
      <div className="grid">
        {ARCH_ORDER.map((id) => (
          <Card key={id} id={id} frame={frame} on={on.has(id)} onToggle={() => toggle(id)} />
        ))}
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
