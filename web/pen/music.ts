export const BPM = 120;
export const FPS = 30;
export const STEP_SEC = 60 / BPM / 4;
export const FRAMES_PER_STEP = STEP_SEC * FPS;
export const LOOP_STEPS = 128;
export const BAR_STEPS = 16;
export const BAR_FRAMES = BAR_STEPS * FRAMES_PER_STEP;

// C major, 8 bars: C C C C F C G G.
const C = [55, 60, 64];
const F = [57, 60, 65];
const G = [55, 59, 62];
export const CHORDS = [C, C, C, C, F, C, G, G];
export const ROOTS = [36, 36, 36, 36, 41, 36, 43, 43];
export const BARS = CHORDS.length;

export type Note = { step: number; midi: number; len: number; vel: number };

export const TRACK_IDS = [
  "kick",
  "clap",
  "hats",
  "bass",
  "pad",
  "lead",
  "arp",
  "bleat",
  "bell",
  "toms",
  "shimmer",
  "snore",
] as const;
export type TrackId = (typeof TRACK_IDS)[number];

const n = (step: number, midi = 0, len = 1, vel = 1): Note => ({ step, midi, len, vel });

const bars = (fn: (bar: number) => Note[]): Note[] =>
  Array.from({ length: 8 }, (_, b) => b).flatMap((b) => fn(b).map((x) => ({ ...x, step: x.step + b * BAR_STEPS })));

const ARP_SEQ = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 3, 1];

// Chorus of "Jingle Bells" (public domain), [step in bar, midi, length].
const MELODY: [number, number, number][][] = [
  [[0, 76, 4], [4, 76, 4], [8, 76, 8]],
  [[0, 76, 4], [4, 76, 4], [8, 76, 8]],
  [[0, 76, 4], [4, 79, 4], [8, 72, 6], [14, 74, 2]],
  [[0, 76, 16]],
  [[0, 77, 4], [4, 77, 4], [8, 77, 6], [14, 77, 2]],
  [[0, 77, 4], [4, 76, 4], [8, 76, 4], [12, 76, 2], [14, 76, 2]],
  [[0, 76, 4], [4, 74, 4], [8, 74, 4], [12, 76, 4]],
  [[0, 74, 8], [8, 79, 8]],
];

export const PATTERNS: Record<TrackId, Note[]> = {
  kick: bars((b) => [0, 4, 8, 12].map((s) => n(s)).concat(b % 4 === 3 ? [n(14, 0, 1, 0.7)] : [])),
  clap: bars(() => [n(4), n(12)]),
  // sleigh bells: steady 16ths with an offbeat accent
  hats: bars(() => Array.from({ length: 16 }, (_, s) => n(s, 0, 1, s % 4 === 2 ? 1 : s % 2 === 0 ? 0.6 : 0.35))),
  bass: bars((b) => {
    const r = ROOTS[b];
    return [n(0, r, 3), n(4, r + 7, 3), n(8, r, 3), n(12, r + 7, 2), n(14, r + 12, 1)];
  }),
  pad: bars((b) => CHORDS[b].map((m) => n(0, m, 16))),
  lead: bars((b) => MELODY[b].map(([s, m, l]) => n(s, m, l))),
  arp: bars((b) => {
    const c = CHORDS[b];
    const tones = [c[0] + 12, c[1] + 12, c[2] + 12, c[0] + 24];
    return ARP_SEQ.map((i, s) => n(s, tones[i], 1, s % 2 === 0 ? 1 : 0.55));
  }),
  // "бе-бе!" answers in the gaps of the tune
  bleat: [n(28, 72, 2), n(30, 76, 2), n(56, 79, 2), n(58, 76, 2), n(88, 77, 2), n(90, 72, 2), n(120, 79, 2), n(122, 74, 2)],
  // church bells "динь-дон"
  bell: bars((b) => [n(0, b % 2 ? 79 : 84, 8), n(8, b % 2 ? 72 : 79, 8)]),
  toms: bars((b) =>
    b % 4 < 3
      ? [n(10, 3), n(14, 2), n(15, 1)]
      : [n(8, 3), n(9, 3), n(10, 2), n(11, 2), n(12, 1), n(13, 1), n(14, 0), n(15, 0)],
  ),
  shimmer: bars((b) => {
    const c = CHORDS[b];
    return [n(0, c[2] + 24, 4), n(6, c[1] + 24, 4), n(10, c[0] + 36, 4)];
  }),
  snore: [0, 32, 64, 96].flatMap((s) => [n(s, 0, 12), n(s + 16, 1, 8)]),
};

const BY_STEP: Record<TrackId, Map<number, Note[]>> = Object.fromEntries(
  TRACK_IDS.map((id) => {
    const m = new Map<number, Note[]>();
    for (const note of PATTERNS[id]) {
      const arr = m.get(note.step) ?? [];
      arr.push(note);
      m.set(note.step, arr);
    }
    return [id, m];
  }),
) as Record<TrackId, Map<number, Note[]>>;

export const notesAt = (id: TrackId, globalStep: number): Note[] =>
  BY_STEP[id].get(((globalStep % LOOP_STEPS) + LOOP_STEPS) % LOOP_STEPS) ?? [];

export type Hit = { ago: number; note: Note; globalStep: number };

// Hits of a track that have sounded since `fromStep`, newest first, no older than maxAge frames.
export const recentHits = (id: TrackId, frame: number, fromStep: number, maxAge: number): Hit[] => {
  const stepF = frame / FRAMES_PER_STEP;
  const out: Hit[] = [];
  const oldest = Math.max(fromStep, Math.floor(stepF - maxAge / FRAMES_PER_STEP));
  for (let s = Math.floor(stepF); s >= oldest; s--) {
    const notes = notesAt(id, s);
    if (notes.length) out.push({ ago: (stepF - s) * FRAMES_PER_STEP, note: notes[0], globalStep: s });
  }
  return out;
};

export const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// Quiet "бе" chatter between phrases: on some bars one goat of a random group mutters at step 14.
// Shared by the picture and the sound so the bubble and the bleat line up.
const h32 = (n: number) => {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
export const CHATTER_STEP = 14;
export const chatterAt = (bar: number) => {
  if (bar < 0 || h32(bar * 5 + 1) > 0.45) return null;
  const chord = CHORDS[((bar % BARS) + BARS) % BARS];
  return {
    group: Math.floor(h32(bar * 7 + 3) * 12),
    pick: h32(bar * 11 + 5),
    midi: chord[Math.floor(h32(bar * 13 + 7) * 3)] + 12,
  };
};
