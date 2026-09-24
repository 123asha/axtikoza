import React, { useEffect, useState } from "react";
import { ARCHETYPES, GoatActor } from "./goats";
import { ArchKey, CLUSTERS, ClusterId, clusterOf, GOATS, NAME_MAX, personalName, Q1, QS, resolve, TRACK_OF } from "./quizData";

const useTicker = () => {
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

// Result intro: the goat walks out onto the snow, stops in the middle and starts to dance.
const WALK_FRAMES = 110;
const ResultScene: React.FC<{ k: ArchKey; label: string; frame: number }> = ({ k, label, frame }) => {
  const a = ARCHETYPES.find((g) => g.id === TRACK_OF[k])!;
  const px = 4;
  const [w, setW] = useState(560);
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const t = Math.min(1, frame / WALK_FRAMES);
  const ease = 1 - Math.pow(1 - t, 2);
  const walking = frame < WALK_FRAMES;
  const feetX = -60 + (w / 2 + 60) * ease;
  const flakes = Array.from({ length: 26 }, (_, i) => {
    const sx = (i * 97.3) % w;
    const sp = 0.5 + ((i * 37) % 10) / 10;
    return { x: (sx + Math.sin((frame + i * 20) / 30) * 10 + w) % w, y: ((i * 53) % 190) + frame * sp, s: i % 4 === 0 ? 6 : 4 };
  });
  return (
    <div className="scene" ref={ref}>
      <div className="scene-peaks" />
      <div className="scene-snow" />
      <GoatActor
        a={a}
        x={Math.round(feetX - 12.5 * px)}
        y={Math.round(180 - 32 * px)}
        px={px}
        flip={false}
        frame={frame}
        fromStep={walking ? null : 0}
        seed={5}
        moonwalk={walking}
        gaze={1}
        label={label}
        showPlate={!walking}
      />
      {flakes.map((f, i) => (
        <i key={i} className="flake" style={{ left: f.x, top: f.y % 210, width: f.s, height: f.s }} />
      ))}
    </div>
  );
};

type Phase = "questions" | "result";

export const Quiz: React.FC<{
  onClose: () => void;
  onSend: (key: ArchKey, name: string) => void;
  onResult: (key: ArchKey) => void;
}> = ({ onClose, onSend, onResult }) => {
  const frame = useTicker();
  const [cluster, setCluster] = useState<ClusterId | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("questions");
  const [resultAt, setResultAt] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const step = cluster === null ? 0 : answers.length + 1;
  const done = cluster !== null && answers.length === 3;
  const result = done ? resolve(cluster!, answers) : null;

  const pick = (i: number) => {
    if (cluster === null) setCluster(CLUSTERS[i].id);
    else {
      const next = [...answers, i];
      setAnswers(next);
      if (next.length === 3) {
        setPhase("result");
        setResultAt(frame);
        // your goat's own part starts playing as it moonwalks in
        onResult(resolve(cluster, next).winner);
      }
    }
  };
  const back = () => {
    if (phase === "result") {
      setPhase("questions");
      setAnswers(answers.slice(0, -1));
      return;
    }
    if (answers.length) setAnswers(answers.slice(0, -1));
    else setCluster(null);
  };

  let body: React.ReactNode;
  if (phase === "questions" || !result) {
    const q = cluster === null ? Q1 : QS[cluster][answers.length];
    body = (
      <>
        <div className="q-top">
          <div className="dots">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} className={i === step ? "now" : i < step ? "done" : ""} />
            ))}
            <span>{step + 1} из 4</span>
          </div>
          {step > 0 ? (
            <button className="link" onClick={back}>
              назад
            </button>
          ) : null}
        </div>
        <h2>{q.prompt}</h2>
        <div className="opts">
          {q.options.map((t, i) => (
            <button key={i} className="opt" onClick={() => pick(i)}>
              {t}
            </button>
          ))}
        </div>
      </>
    );
  } else {
    const w = GOATS[result.winner];
    const cl = clusterOf(result.winner);
    const label = name.trim() ? personalName(name, result.winner) : w.name;
    body = (
      <>
        <div className="q-top">
          <span className="kicker">{cl.title}</span>
          <button className="link" onClick={back}>
            назад
          </button>
        </div>
        <ResultScene k={result.winner} label={label} frame={frame - resultAt} />
        <div className="goat-name">{w.name}</div>
        <div className="arch">{w.arch}</div>
        <p className="full">{w.full}</p>
        <p className="short">{w.short}</p>
        <form
          className="name-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onSend(result.winner, name);
          }}
        >
          <label htmlFor="goat-name">Как тебя зовут?</label>
          <div className="name-row">
            <input
              id="goat-name"
              maxLength={NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Аша"
              autoComplete="off"
            />
          </div>
          <div className="name-hint">до {NAME_MAX} символов · осталось {NAME_MAX - name.length}</div>
          <button className="btn big" disabled={!name.trim()}>
            отправить на гору
          </button>
        </form>
      </>
    );
  }

  return (
    <div className="quiz-back" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="quiz" role="dialog" aria-modal="true" aria-label="Какая ты коза">
        <button className="close" onClick={onClose} aria-label="закрыть">
          ×
        </button>
        {body}
      </div>
    </div>
  );
};
