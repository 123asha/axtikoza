import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, PlayerRef } from "@remotion/player";
import { Engine } from "./audio";
import { BPM, FPS, FRAMES_PER_STEP, TRACK_IDS, TrackId } from "./music";
import { Choir, ChoirProps, homeView, layoutChoir, Member, spreadZoom, View, worldHeight, worldWidth } from "./Choir";
import { ARCH_ORDER, ArchKey, personalName, TRACK_OF } from "./quizData";
import { Quiz } from "./Quiz";
import { sprite } from "./sprites";

const EMPTY = Object.fromEntries(TRACK_IDS.map((id) => [id, null])) as Record<TrackId, number | null>;
const STORE = "goat-choir-v1";
const STORE_ME = "goat-choir-me";
const MAX_ZOOM = 40;
// Can zoom out a little past the starting view, never beyond the edges of the world.
const minZoom = (w: number, h: number) => Math.max(Math.min(1, homeViewNow(w, h).z) * 0.85, w / worldWidth(w), h / worldHeight(h));
// Keeps the lowest goats clear of the zoom bar.
const BOTTOM_INSET = 96;

// A conductor's baton held in a white glove: tapered stick, cork handle. The tip (0,0) is the pointer.
const BATON = [
  "w.......................",
  ".w......................",
  "..w.....................",
  "...w....................",
  "....wW..................",
  ".....wW.................",
  "......wW................",
  ".......wW...............",
  "........wW..............",
  ".........wW.............",
  "..........wW............",
  "...........wW...........",
  "............ccC.........",
  "...........cccCC........",
  "...........ccccCC.......",
  "..........ggcccCg.......",
  ".........gggggcggg......",
  "........gggggggGgg......",
  "........ggggggggGGK.....",
  ".........gggggggGGKk....",
  "..........ggggGGGKkkk...",
  "............gGGKKkkkkk..",
  "..............Kkkkkkkkk.",
  "...............kkkkkkkkk",
  "................kkkkkkkk",
];
const BATON_PAL = { w: "#ffffff", W: "#cfd6e0", c: "#c89a6a", C: "#946a44", g: "#ffffff", G: "#dfe4ec", K: "#eef1f5", k: "#2b2530" };
const BATON_PX = 2.5;
const BATON_IMG = () => sprite(BATON, BATON_PAL, 0, "rgba(43,37,48,0.9)", 1);
// the hand (pivot) in baton pixels
const BATON_PIVOT = { x: 14, y: 16 };


const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable: the choir just won't survive a reload
  }
};

// Test crowd: ?demo=30 (or window.GOAT_DEMO) puts N made-up goats in every group. Never saved.
const DEMO_NAMES = [
  "Аша", "Маша", "Петя", "Оля", "Дима", "Катя", "Ваня", "Лена", "Саша", "Юля", "Нина", "Гоша",
  "Вера", "Тёма", "Даша", "Лёша", "Соня", "Миша", "Аня", "Кирилл", "Женя", "Лиза", "Макс", "Таня",
  "Федя", "Ира", "Слава", "Настя", "Рома", "Полина", "Глеб", "Варя", "Костя", "Ника", "Паша", "Уля",
];
const demoCount = (() => {
  const fromUrl = Number(new URLSearchParams(window.location.search).get("demo"));
  const fromPage = Number((window as unknown as { GOAT_DEMO?: number }).GOAT_DEMO);
  return Math.max(0, Math.min(60, fromUrl || fromPage || 0));
})();
const DEMO: Member[] = ARCH_ORDER.flatMap((k, ki) =>
  Array.from({ length: demoCount }, (_, i) => ({
    uid: `demo-${k}-${i}`,
    key: k,
    label: personalName(DEMO_NAMES[(i * 7 + ki * 5) % DEMO_NAMES.length], k),
  })),
);

const loadNamed = () => readJson<Member[]>(STORE, []).filter((m) => ARCH_ORDER.includes(m.key) && typeof m.label === "string");

// Sections stay together, in archetype order. Only people who took the quiz stand on the mountain.
const arrange = (named: Member[]) => ARCH_ORDER.flatMap((k) => named.filter((m) => m.key === k));
let currentMembers: Member[] = [];
const homeViewNow = (w: number, h: number) => homeView(currentMembers, w, h);

const useViewport = () => {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return size;
};

const App: React.FC = () => {
  const { w, h } = useViewport();
  const [named, setNamed] = useState<Member[]>(loadNamed);
  const namedRef = useRef(named);
  namedRef.current = named;
  const [meUids, setMeUids] = useState<string[]>(() => readJson<string[]>(STORE_ME, []));
  const [fromSteps, setFromSteps] = useState(EMPTY);
  const fromRef = useRef(EMPTY);
  const [beat, setBeat] = useState(-1);
  const [quizOpen, setQuizOpen] = useState(false);
  const [fresh, setFresh] = useState<{ uid: string; at: number } | null>(null);
  const home = useCallback((): View => homeView(arrange([...DEMO, ...namedRef.current]), window.innerWidth, window.innerHeight), []);
  const [view, setView] = useState<View>(home);
  const viewRef = useRef(view);
  viewRef.current = view;
  const tween = useRef<number | null>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d0: number; z0: number } | null>(null);
  const baton = useRef<HTMLDivElement>(null);
  const batonArm = useRef<HTMLDivElement>(null);
  const batonPos = useRef<{ x: number; y: number } | null>(null);
  const player = useRef<PlayerRef>(null);
  const engine = useRef<Engine | null>(null);

  const setTrack = useCallback((ids: TrackId[], on: boolean | "toggle") => {
    if (!engine.current) engine.current = new Engine(player.current?.getCurrentFrame() ?? 0);
    const e = engine.current;
    e.resume();
    const prev = fromRef.current;
    const next = { ...prev };
    for (const id of ids) {
      const want = on === "toggle" ? prev[id] === null : on;
      if (want && prev[id] === null) next[id] = e.activate(id);
      if (!want && prev[id] !== null) {
        e.deactivate(id);
        next[id] = null;
      }
    }
    fromRef.current = next;
    setFromSteps(next);
  }, []);

  // Keep the picture locked to the audio clock; swing the baton on the beat.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = player.current;
      const e = engine.current;
      if (p) {
        let f = p.getCurrentFrame();
        if (e) {
          const want = Math.max(0, Math.round(e.visualFrame()));
          if (Math.abs(f - want) > 2) {
            p.seekTo(want);
            f = want;
          }
          if (!p.isPlaying()) p.play();
        }
        const beatF = f / (FRAMES_PER_STEP * 4);
        const b = Math.floor(beatF) % 4;
        setBeat((old) => (old === b ? old : b));
        const el = baton.current;
        const pos = batonPos.current;
        if (el && pos) {
          // a quick down-stroke of the tip on every beat, bigger on the bar's downbeat
          const phase = beatF % 1;
          const stroke = Math.pow(1 - phase, 3) * (b === 0 ? 22 : 13);
          // sits just below-right of the normal arrow, so clicks stay precise
          el.style.transform = `translate(${pos.x + 12}px, ${pos.y + 14}px)`;
          if (batonArm.current) batonArm.current.style.transform = `rotate(${-stroke}deg)`;
          el.style.opacity = "1";
        } else if (el) {
          el.style.opacity = "0";
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const clampView = useCallback(
    (v: View): View => {
      const z = Math.min(MAX_ZOOM, Math.max(minZoom(w, h), v.z));
      // a margin of sky above and around the world, like the edge of a map
      const mx = w * 0.3;
      const my = h * 0.4;
      return {
        z,
        tx: Math.min(mx, Math.max(w - worldWidth(w) * z - mx, v.tx)),
        ty: Math.min(my, Math.max(h - worldHeight(h) * z, v.ty)),
      };
    },
    [w, h],
  );

  const stopTween = () => {
    if (tween.current) cancelAnimationFrame(tween.current);
    tween.current = null;
  };

  const animateTo = useCallback(
    (target: View) => {
      stopTween();
      const from = viewRef.current;
      const to = clampView(target);
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 650);
        const e = 1 - Math.pow(1 - k, 3);
        // interpolate zoom geometrically so the motion feels even
        const z = from.z * Math.pow(to.z / from.z, e);
        setView({ z, tx: from.tx + (to.tx - from.tx) * e, ty: from.ty + (to.ty - from.ty) * e });
        tween.current = k < 1 ? requestAnimationFrame(step) : null;
      };
      tween.current = requestAnimationFrame(step);
    },
    [clampView],
  );

  // Zoom keeping the scene point under (mx, my) fixed on screen.
  const zoomAt = useCallback(
    (mx: number, my: number, nz: number) => {
      const v = viewRef.current;
      const z = Math.min(MAX_ZOOM, Math.max(minZoom(w, h), nz));
      setView(clampView({ z, tx: mx - ((mx - v.tx) * z) / v.z, ty: my - ((my - v.ty) * z) / v.z }));
    },
    [clampView, w, h],
  );

  const flyToGoat = (uid: string) => {
    const { slots, groups } = layoutChoir(arrange([...DEMO, ...namedRef.current]), w, h, BOTTOM_INSET);
    const s = slots.find((x) => x.m.uid === uid);
    if (!s) return;
    const g = groups.find((x) => x.key === s.m.key)!;
    const z = Math.min(MAX_ZOOM, Math.max(2.5, spreadZoom(g) * 1.2));
    animateTo({ z, tx: w / 2 - s.wx * z, ty: h * 0.62 - s.wy * z });
  };

  const send = (key: ArchKey, name: string) => {
    const m: Member = { uid: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, key, label: personalName(name, key) };
    const next = [...named, m];
    setNamed(next);
    namedRef.current = next;
    writeJson(STORE, next);
    const mine = [...meUids, m.uid];
    setMeUids(mine);
    writeJson(STORE_ME, mine);
    setQuizOpen(false);
    setFresh({ uid: m.uid, at: player.current?.getCurrentFrame() ?? 0 });
    window.setTimeout(() => flyToGoat(m.uid), 50);
    window.setTimeout(() => setFresh((f) => (f?.uid === m.uid ? null : f)), 8000);
    setTrack([TRACK_OF[key]], true);
  };


  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stage.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopTween();
      // trackpad pinch arrives as ctrl+wheel with small deltas
      const k = e.ctrlKey ? 0.012 : 0.0018;
      zoomAt(e.clientX, e.clientY, viewRef.current.z * Math.exp(-e.deltaY * k));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (quizOpen) return;
      if (e.key === "Escape" || e.key === "0") animateTo(home());
      if (e.key === "+" || e.key === "=") zoomAt(w / 2, h / 2, viewRef.current.z * 1.4);
      if (e.key === "-") zoomAt(w / 2, h / 2, viewRef.current.z / 1.4);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [animateTo, zoomAt, home, w, h, quizOpen]);

  useEffect(() => setView((v) => clampView(v)), [clampView]);

  const onPointerDown = (ev: React.PointerEvent) => {
    stopTween();
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    if (pointers.current.size === 2) {
      // two fingers: pinch zoom instead of dragging
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: viewRef.current.z };
      drag.current = null;
      return;
    }
    drag.current = { x: ev.clientX, y: ev.clientY, tx: viewRef.current.tx, ty: viewRef.current.ty, moved: false };
  };
  const onPointerMove = (ev: React.PointerEvent) => {
    batonPos.current = ev.pointerType === "mouse" ? { x: ev.clientX, y: ev.clientY } : null;
    if (pointers.current.has(ev.pointerId)) pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const pz = pinch.current;
    if (pz && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pz.z0 * (d / pz.d0));
      return;
    }
    const d = drag.current;
    if (!d) return;
    const dx = ev.clientX - d.x;
    const dy = ev.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) > 6) d.moved = true;
    if (d.moved) setView((v) => clampView({ ...v, tx: d.tx + dx, ty: d.ty + dy }));
  };
  const onPointerUp = (ev: React.PointerEvent) => {
    pointers.current.delete(ev.pointerId);
    if (pinch.current) {
      if (pointers.current.size < 2) pinch.current = null;
      drag.current = null;
      return;
    }
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;
    const hit = document.elementsFromPoint(ev.clientX, ev.clientY);
    const id = hit.map((el) => el.closest("[data-goat]")).find(Boolean)?.getAttribute("data-goat") as TrackId | undefined;
    if (id) setTrack([id], "toggle");
  };

  const members = arrange([...DEMO, ...named]);
  currentMembers = members;

  useEffect(() => {
    const e = engine.current;
    if (!e) return;
    for (const k of ARCH_ORDER) e.setVoices(TRACK_OF[k], members.filter((m) => m.key === k).length);
  });
  // Only the most recently added goat of this browser gets the arrow.
  const myLast = [...meUids].reverse().find((u) => named.some((m) => m.uid === u));
  const props: ChoirProps = {
    vw: w,
    vh: h,
    members,
    fromSteps,
    freshUid: fresh?.uid ?? null,
    freshAt: fresh?.at ?? null,
    meUids: myLast ? [myLast] : [],
    bottomInset: BOTTOM_INSET,
    view,
  };
  const activeCount = TRACK_IDS.filter((id) => fromSteps[id] !== null).length;

  return (
    <>
      <div
        ref={stage}
        className="stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={(ev) => {
          pointers.current.delete(ev.pointerId);
          pinch.current = null;
          drag.current = null;
        }}
        onPointerLeave={() => (batonPos.current = null)}
      >
        <Player
          ref={player}
          component={Choir}
          inputProps={props}
          durationInFrames={FPS * 60 * 60 * 24}
          fps={FPS}
          compositionWidth={Math.max(2, Math.round(w))}
          compositionHeight={Math.max(2, Math.round(h))}
          style={{ width: "100%", height: "100%" }}
          autoPlay
          loop
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
        />
      </div>
      <div ref={baton} className="baton" aria-hidden>
        <div ref={batonArm} style={{ position: "absolute", left: 0, top: 0, transformOrigin: `${BATON_PIVOT.x * BATON_PX}px ${BATON_PIVOT.y * BATON_PX}px` }}>
          {/* raw pixels: Scale2x would break the thin stick into dots */}
          <img
            src={BATON_IMG().url}
            alt=""
            style={{ position: "absolute", left: -BATON_PX, top: -BATON_PX, width: BATON_IMG().w * BATON_PX, height: BATON_IMG().h * BATON_PX, imageRendering: "pixelated" }}
          />
        </div>
      </div>

      <header className="hud top">
        <div className="title">
          <b>ah ti koza</b>
        </div>
        <button className="cta" onClick={() => setQuizOpen(true)}>
          какая ты коза?
        </button>
        <div className="transport">
          <div className="beats">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} className={beat === i && activeCount ? "on" : ""} />
            ))}
          </div>
          <span className="bpm">{BPM} BPM</span>
          <button onClick={() => setTrack([...TRACK_IDS], true)}>все вместе</button>
          <button
            onClick={() => setTrack([...TRACK_IDS], false)}
            disabled={!activeCount}
          >
            тишина
          </button>
        </div>
      </header>

      <div className="hud zoombar">
        {myLast ? (
          <button className="find-me" onClick={() => flyToGoat(myLast)}>
            ▼ найти меня
          </button>
        ) : null}
        <div className="zoom">
          <button onClick={() => zoomAt(w / 2, h / 2, view.z / 1.4)} aria-label="отдалить">
            −
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            aria-label="масштаб"
            value={Math.log(view.z / minZoom(w, h)) / Math.log(MAX_ZOOM / minZoom(w, h))}
            onChange={(e) => {
              stopTween();
              zoomAt(w / 2, h / 2, minZoom(w, h) * Math.pow(MAX_ZOOM / minZoom(w, h), Number(e.target.value)));
            }}
          />
          <button onClick={() => zoomAt(w / 2, h / 2, view.z * 1.4)} aria-label="приблизить">
            +
          </button>
          <span>×{view.z.toFixed(1)}</span>
        </div>
      </div>

      {quizOpen ? <Quiz onClose={() => setQuizOpen(false)} onSend={send} onResult={(k) => setTrack([TRACK_OF[k]], true)} /> : null}
    </>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
