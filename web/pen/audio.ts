import { BAR_STEPS, CHATTER_STEP, chatterAt, FPS, midiToHz, Note, notesAt, STEP_SEC, TRACK_IDS, TrackId } from "./music";

const LOOKAHEAD = 0.12;

// size: 0 for a lone goat … 1 for a crowd of ~30; drives depth, spread and hall beyond the 5 voices.
type Bus = { out: GainNode; fromStep: number | null; voices: GainNode[]; count: number; size: number; shelf: BiquadFilterNode };

// Up to 5 voices per group, like singers in a choir section: detuned unisons that come in a
// little late, each a shade darker, plus an octave layer for depth from the fourth singer on.
const MAX_VOICES = 5;
const VOICE_PAN = [0, -0.55, 0.55, -0.2, 0.85];
const VOICE_DELAY = [0, 0.014, 0.022, 0.008, 0.033];
const VOICE_SEMIS = [0, -0.16, 0.14, -12, 0.24];
const VOICE_TONE = [20000, 7500, 6500, 4200, 5200];
const VOICE_LEVEL = [1, 0.9, 0.9, 0.75, 0.8];
const PITCHED = new Set<TrackId>(["bass", "pad", "lead", "arp", "bleat", "bell", "shimmer"]);
// Bass doubles an octave up instead of down so the low end stays clean.
const OCTAVE_UP = new Set<TrackId>(["bass"]);
const HUMANIZE = 0.006;

type Voice = (e: Engine, bus: GainNode, t: number, note: Note) => void;

export class Engine {
  ctx: BaseAudioContext;
  master: GainNode;
  reverbIn: GainNode;
  delayIn: GainNode;
  noise: AudioBuffer;
  t0: number;
  nextStep: number;
  buses: Record<TrackId, Bus>;
  sends: Record<TrackId, { rev: GainNode; dly: GainNode }>;
  chatter: GainNode;

  constructor(startFrame: number, offline?: BaseAudioContext) {
    this.ctx = offline ?? new AudioContext({ latencyHint: "interactive" });
    const ctx = this.ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.1;
    this.master = ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(comp).connect(limiter).connect(ctx.destination);

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(2.4);
    this.reverbIn = ctx.createGain();
    const revOut = ctx.createGain();
    revOut.gain.value = 0.55;
    this.reverbIn.connect(reverb).connect(revOut).connect(this.master);

    const delay = ctx.createDelay(1);
    delay.delayTime.value = STEP_SEC * 3;
    const fb = ctx.createGain();
    fb.gain.value = 0.42;
    const dlp = ctx.createBiquadFilter();
    dlp.type = "lowpass";
    dlp.frequency.value = 3200;
    this.delayIn = ctx.createGain();
    this.delayIn.connect(delay);
    delay.connect(dlp).connect(fb).connect(delay);
    dlp.connect(this.master);
    dlp.connect(this.reverbIn);

    const buses = {} as Record<TrackId, Bus>;
    const sends = {} as Record<TrackId, { rev: GainNode; dly: GainNode }>;
    for (const id of TRACK_IDS) {
      const out = ctx.createGain();
      out.gain.value = 1;
      const level = ctx.createGain();
      level.gain.value = MIX[id].vol;
      const rev = ctx.createGain();
      rev.gain.value = MIX[id].rev;
      const dly = ctx.createGain();
      dly.gain.value = MIX[id].dly;
      const shelf = ctx.createBiquadFilter();
      shelf.type = "lowshelf";
      shelf.frequency.value = 160;
      shelf.gain.value = 0;
      out.connect(shelf).connect(level).connect(this.master);
      level.connect(rev).connect(this.reverbIn);
      level.connect(dly).connect(this.delayIn);
      const voices = VOICE_PAN.map((pan, v) => {
        const g = ctx.createGain();
        const tone = ctx.createBiquadFilter();
        tone.type = "lowpass";
        tone.frequency.value = VOICE_TONE[v];
        const p = ctx.createStereoPanner();
        p.pan.value = pan;
        g.connect(tone).connect(p).connect(out);
        return g;
      });
      buses[id] = { out, fromStep: null, voices, count: 1, size: 0, shelf };
      sends[id] = { rev, dly };
    }
    this.buses = buses;
    // Background "бе" mutter: quiet, a little roomy.
    this.chatter = ctx.createGain();
    this.chatter.gain.value = 0.12;
    this.chatter.connect(this.master);
    const chatterRev = ctx.createGain();
    chatterRev.gain.value = 0.4;
    this.chatter.connect(chatterRev).connect(this.reverbIn);
    this.sends = sends;

    this.t0 = ctx.currentTime - startFrame / FPS;
    this.nextStep = Math.ceil(this.stepAt(ctx.currentTime));
    if (!offline) window.setInterval(() => this.schedule(), 25);
  }

  private impulse(sec: number) {
    const len = Math.floor(this.ctx.sampleRate * sec);
    const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return buf;
  }

  stepAt(time: number) {
    return (time - this.t0) / STEP_SEC;
  }

  timeOfStep(step: number) {
    return this.t0 + step * STEP_SEC;
  }

  // Frame that matches what is audible right now.
  visualFrame() {
    const c = this.ctx as AudioContext;
    const lat = c.outputLatency || c.baseLatency || 0;
    return (this.ctx.currentTime - lat - this.t0) * FPS;
  }

  // Returns the global step (a bar boundary) where the track comes in.
  activate(id: TrackId): number {
    let from = Math.ceil(this.stepAt(this.ctx.currentTime) / BAR_STEPS) * BAR_STEPS;
    if (from < this.nextStep) from += BAR_STEPS;
    const bus = this.buses[id];
    bus.fromStep = from;
    const g = bus.out.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setValueAtTime(1, this.ctx.currentTime);
    return from;
  }

  deactivate(id: TrackId) {
    const bus = this.buses[id];
    bus.fromStep = null;
    const now = this.ctx.currentTime;
    const g = bus.out.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + 0.06);
    // Notes already queued inside the lookahead window stay muted.
    g.setValueAtTime(1, now + LOOKAHEAD + 0.1);
  }

  private schedule() {
    const horizon = this.ctx.currentTime + LOOKAHEAD;
    while (this.timeOfStep(this.nextStep) < horizon) {
      const s = this.nextStep;
      const t = this.timeOfStep(s);
      for (const id of TRACK_IDS) {
        const bus = this.buses[id];
        if (bus.fromStep === null || s < bus.fromStep) continue;
        for (const note of notesAt(id, s)) {
          for (let v = 0; v < bus.count; v++) {
            let n = note;
            if (v && PITCHED.has(id)) {
              const semis = VOICE_SEMIS[v] === -12 ? (OCTAVE_UP.has(id) ? 12 : -12) : VOICE_SEMIS[v] * (1 + bus.size * 1.5);
              n = { ...note, midi: note.midi + semis };
            }
            const jitter = v ? (Math.random() - 0.5) * 2 * HUMANIZE : 0;
            VOICES[id](this, bus.voices[v], t + VOICE_DELAY[v] * (1 + bus.size * 1.6) + jitter * (1 + bus.size), n);
          }
        }
      }
      if (s % BAR_STEPS === CHATTER_STEP) {
        const c = chatterAt(Math.floor(s / BAR_STEPS));
        if (c) VOICES.bleat(this, this.chatter, t, { step: s, midi: c.midi, len: 1, vel: 1 });
      }
      this.nextStep++;
    }
  }

  // Thicker part for bigger groups; loudness grows gently rather than linearly.
  setVoices(id: TrackId, goats: number) {
    const bus = this.buses[id];
    bus.count = Math.max(1, Math.min(MAX_VOICES, goats));
    bus.size = Math.min(1, Math.log2(Math.max(1, goats)) / Math.log2(30));
    const now = this.ctx.currentTime;
    // More goats → deeper: lift the lows, up to +9 dB for a crowd of ~30.
    bus.shelf.gain.setTargetAtTime(bus.size * 9, now, 0.2);
    // A bigger section is clearly louder (≈n^0.6 overall) and sits in a larger hall.
    const g = 1 / Math.pow(bus.count, 0.4);
    bus.voices.forEach((v, i) => v.gain.setTargetAtTime(g * VOICE_LEVEL[i], now, 0.05));
    this.sends[id].rev.gain.setTargetAtTime(Math.min(1, MIX[id].rev * (1 + bus.size * 1.4) + bus.size * 0.18), now, 0.1);
  }

  resume() {
    if (this.ctx instanceof AudioContext) void this.ctx.resume();
  }

  noiseSrc(t: number, dur: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur);
    return src;
  }
}

const MIX: Record<TrackId, { vol: number; rev: number; dly: number }> = {
  kick: { vol: 0.8, rev: 0, dly: 0 },
  clap: { vol: 0.9, rev: 0.25, dly: 0 },
  hats: { vol: 0.5, rev: 0.15, dly: 0 },
  bass: { vol: 0.45, rev: 0, dly: 0 },
  pad: { vol: 0.32, rev: 0.6, dly: 0 },
  lead: { vol: 0.42, rev: 0.35, dly: 0.3 },
  arp: { vol: 0.55, rev: 0.25, dly: 0.35 },
  bleat: { vol: 0.5, rev: 0.3, dly: 0.15 },
  bell: { vol: 0.45, rev: 0.45, dly: 0 },
  toms: { vol: 0.6, rev: 0.2, dly: 0 },
  shimmer: { vol: 0.5, rev: 0.8, dly: 0.6 },
  snore: { vol: 0.6, rev: 0.15, dly: 0 },
};

const env = (g: AudioParam, t: number, peak: number, attack: number, decay: number) => {
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(peak, t + attack);
  g.exponentialRampToValueAtTime(0.0001, t + attack + decay);
};

export const VOICES: Record<TrackId, Voice> = {
  kick: (e, bus, t, note) => {
    const { ctx } = e;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(165, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.13);
    env(g.gain, t, note.vel, 0.003, 0.42);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.5);
    const click = e.noiseSrc(t, 0.02);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2500;
    const cg = ctx.createGain();
    env(cg.gain, t, 0.25 * note.vel, 0.001, 0.015);
    click.connect(hp).connect(cg).connect(bus);
  },

  clap: (e, bus, t) => {
    const { ctx } = e;
    const src = e.noiseSrc(t, 0.3);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1400;
    bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    for (const k of [0, 0.011, 0.022]) {
      g.gain.setValueAtTime(0.9, t + k);
      g.gain.exponentialRampToValueAtTime(0.15, t + k + 0.009);
    }
    g.gain.setValueAtTime(0.8, t + 0.033);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    src.connect(bp).connect(g).connect(bus);
  },

  // Sleigh bells: inharmonic metal partials plus a bright noise shake.
  hats: (e, bus, t, note) => {
    const { ctx } = e;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3200;
    const g = ctx.createGain();
    env(g.gain, t, 0.5 * note.vel, 0.002, note.vel > 0.9 ? 0.16 : 0.08);
    for (const f of [2430, 3170, 4260, 5390]) {
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.01);
      const og = ctx.createGain();
      og.gain.value = 0.12;
      o.connect(og).connect(hp);
      o.start(t);
      o.stop(t + 0.2);
    }
    const src = e.noiseSrc(t, 0.15);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 7000;
    bp.Q.value = 2;
    src.connect(bp).connect(hp);
    hp.connect(g).connect(bus);
  },

  bass: (e, bus, t, note) => {
    const { ctx } = e;
    const dur = note.len * STEP_SEC;
    const f = midiToHz(note.midi);
    const o1 = ctx.createOscillator();
    o1.type = "sawtooth";
    o1.frequency.value = f;
    const o2 = ctx.createOscillator();
    o2.type = "square";
    o2.frequency.value = f / 2;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 7;
    lp.frequency.setValueAtTime(1500, t);
    lp.frequency.exponentialRampToValueAtTime(260, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.1);
    g.gain.setValueAtTime(0.4, t + dur - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06);
    const g2 = ctx.createGain();
    g2.gain.value = 0.5;
    o1.connect(lp);
    o2.connect(g2).connect(lp);
    lp.connect(g).connect(bus);
    for (const o of [o1, o2]) {
      o.start(t);
      o.stop(t + dur + 0.1);
    }
  },

  pad: (e, bus, t, note) => {
    const { ctx } = e;
    const dur = note.len * STEP_SEC;
    const f = midiToHz(note.midi);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1300;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.35);
    g.gain.setValueAtTime(0.16, t + dur - 0.1);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.5);
    for (const cents of [-8, 8]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = cents;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.6);
    }
    lp.connect(g).connect(bus);
  },

  lead: (e, bus, t, note) => {
    const { ctx } = e;
    const dur = note.len * STEP_SEC;
    const f = midiToHz(note.midi);
    const o = ctx.createOscillator();
    o.type = "square";
    // a capricious little flounce into each note, then a whiny wobble and a pouty slide off the end
    o.frequency.setValueAtTime(f * 0.9, t);
    o.frequency.exponentialRampToValueAtTime(f * 1.03, t + 0.05);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.09);
    o.frequency.setValueAtTime(f, t + Math.max(0.09, dur - 0.09));
    o.frequency.exponentialRampToValueAtTime(f * 0.9, t + dur + 0.07);
    const o2 = ctx.createOscillator();
    o2.type = "triangle";
    o2.frequency.value = f * 2;
    const vib = ctx.createOscillator();
    vib.frequency.value = 6.8;
    const vibG = ctx.createGain();
    vibG.gain.setValueAtTime(0, t);
    vibG.gain.linearRampToValueAtTime(f * 0.02, t + 0.2);
    vib.connect(vibG).connect(o.frequency);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.012);
    g.gain.setValueAtTime(0.26, t + dur - 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o.connect(lp);
    o2.connect(g2).connect(lp);
    lp.connect(g).connect(bus);
    for (const x of [o, o2, vib]) {
      x.start(t);
      x.stop(t + dur + 0.1);
    }
  },

  arp: (e, bus, t, note) => {
    const { ctx } = e;
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.value = midiToHz(note.midi);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(3500, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 0.12);
    const g = ctx.createGain();
    env(g.gain, t, 0.35 * note.vel, 0.002, 0.14);
    const pan = ctx.createStereoPanner();
    pan.pan.value = ((note.step % 4) - 1.5) / 2.5;
    o.connect(lp).connect(g).connect(pan).connect(bus);
    o.start(t);
    o.stop(t + 0.2);
  },

  // A goat "mehhh": buzzy source through vowel formants with a fast bleat trill.
  bleat: (e, bus, t, note) => {
    const { ctx } = e;
    const dur = note.len * STEP_SEC;
    const f = midiToHz(note.midi);
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f * 1.08, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    o.frequency.setValueAtTime(f, t + dur * 0.7);
    o.frequency.exponentialRampToValueAtTime(f * 0.9, t + dur + 0.1);
    const trill = ctx.createOscillator();
    trill.type = "triangle";
    trill.frequency.value = 9;
    const trillG = ctx.createGain();
    trillG.gain.value = f * 0.045;
    trill.connect(trillG).connect(o.frequency);
    const am = ctx.createGain();
    am.gain.value = 0.6;
    const amLfo = ctx.createOscillator();
    amLfo.frequency.value = 9;
    const amDepth = ctx.createGain();
    amDepth.gain.value = 0.4;
    amLfo.connect(amDepth).connect(am.gain);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.03);
    g.gain.setValueAtTime(0.8, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.14);
    o.connect(am);
    for (const [freq, q, lvl] of [
      [700, 6, 1],
      [1650, 9, 0.7],
      [2700, 12, 0.35],
    ]) {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = freq;
      bp.Q.value = q;
      const lg = ctx.createGain();
      lg.gain.value = lvl * 2.2;
      am.connect(bp).connect(lg).connect(g);
    }
    g.connect(bus);
    for (const x of [o, trill, amLfo]) {
      x.start(t);
      x.stop(t + dur + 0.2);
    }
  },

  // Church bell: stacked inharmonic sine partials with long decay.
  bell: (e, bus, t, note) => {
    const { ctx } = e;
    const f = midiToHz(note.midi);
    for (const [ratio, amp, dec] of [
      [0.5, 0.35, 2.2],
      [1, 0.5, 1.8],
      [2.76, 0.25, 0.9],
      [5.4, 0.12, 0.5],
      [8.93, 0.06, 0.3],
    ]) {
      const o = ctx.createOscillator();
      o.frequency.value = f * ratio;
      const g = ctx.createGain();
      env(g.gain, t, amp, 0.003, dec);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + dec + 0.05);
    }
  },

  toms: (e, bus, t, note) => {
    const { ctx } = e;
    const f = [82, 110, 147, 196][note.midi];
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(f * 1.7, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    const g = ctx.createGain();
    env(g.gain, t, 0.9, 0.002, 0.38);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.45);
    const nz = e.noiseSrc(t, 0.06);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    const ng = ctx.createGain();
    env(ng.gain, t, 0.2, 0.001, 0.05);
    nz.connect(lp).connect(ng).connect(bus);
  },

  shimmer: (e, bus, t, note) => {
    const { ctx } = e;
    const f = midiToHz(note.midi);
    const car = ctx.createOscillator();
    car.frequency.value = f;
    const mod = ctx.createOscillator();
    mod.frequency.value = f * 3.5;
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(f * 2.2, t);
    mg.gain.exponentialRampToValueAtTime(1, t + 0.9);
    mod.connect(mg).connect(car.frequency);
    const g = ctx.createGain();
    env(g.gain, t, 0.3, 0.004, 1.6);
    car.connect(g).connect(bus);
    for (const x of [car, mod]) {
      x.start(t);
      x.stop(t + 1.7);
    }
  },

  snore: (e, bus, t, note) => {
    const { ctx } = e;
    const dur = note.len * STEP_SEC;
    const src = e.noiseSrc(t, dur + 0.2);
    const g = ctx.createGain();
    if (note.midi === 0) {
      // Inhale: throaty rattle.
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 480;
      lp.Q.value = 5;
      const rattle = ctx.createGain();
      rattle.gain.value = 0.5;
      const lfo = ctx.createOscillator();
      lfo.type = "square";
      lfo.frequency.value = 26;
      const depth = ctx.createGain();
      depth.gain.value = 0.5;
      lfo.connect(depth).connect(rattle.gain);
      lfo.start(t);
      lfo.stop(t + dur + 0.2);
      const hum = ctx.createOscillator();
      hum.type = "sawtooth";
      hum.frequency.setValueAtTime(70, t);
      hum.frequency.linearRampToValueAtTime(95, t + dur);
      const hg = ctx.createGain();
      hg.gain.value = 0.25;
      hum.connect(hg).connect(lp);
      hum.start(t);
      hum.stop(t + dur + 0.2);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.9, t + dur * 0.75);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      src.connect(lp).connect(rattle).connect(g).connect(bus);
    } else {
      // Exhale: little "pfffiu" whistle.
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 6;
      bp.frequency.setValueAtTime(2400, t);
      bp.frequency.exponentialRampToValueAtTime(900, t + dur);
      const wh = ctx.createOscillator();
      wh.type = "sine";
      wh.frequency.setValueAtTime(1500, t);
      wh.frequency.exponentialRampToValueAtTime(700, t + dur * 0.8);
      const wg = ctx.createGain();
      env(wg.gain, t, 0.12, 0.08, dur * 0.8);
      wh.connect(wg).connect(bus);
      wh.start(t);
      wh.stop(t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.7, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp).connect(g).connect(bus);
    }
  },
};
