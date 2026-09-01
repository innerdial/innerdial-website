/**
 * The site's ambient sound bed.
 *
 * There is no audio file. The bed is six sine voices held on an F# minor 9th,
 * each swelling on its own slow LFO, run through a drifting lowpass and a
 * generated reverb, with a sparse bell struck every half-minute or so.
 *
 * Three reasons it is synthesised rather than streamed:
 *
 *   1. It weighs nothing. A licensed loop is a megabyte or two on a page whose
 *      whole point is that it loads fast, and it would compete with the hero
 *      image for the same bandwidth.
 *   2. It never repeats. The voice LFOs run at rates with no common multiple
 *      (19s, 23s, 29s, 34s, 43s, 47s), so the texture takes the better part of
 *      an hour to come back round — a short loop announces itself on the second
 *      pass and then becomes the only thing a visitor can hear.
 *   3. It is ours. No attribution line, no licence to renew, and nothing to
 *      take down if a catalogue changes hands.
 *
 * Nothing here runs until someone asks for it: the AudioContext is built on the
 * first `start()`, which is always inside a user gesture. Constructing one at
 * module scope would claim a device audio unit on every page load and earn an
 * autoplay warning in the console for a sound nobody chose to hear.
 */

/** How loud the bed sits at full volume. Background, not foreground. */
const LEVEL = 0.16;

const FADE_IN = 2.6;
const FADE_OUT = 1.1;

/**
 * F# minor 9th, low to high. Voiced wide at the bottom and thin at the top so
 * the chord reads as one warm body rather than six audible pitches — the ear
 * should find it hard to say what note is playing.
 *
 * `level` is the voice's share of the bed, `rate` is how often it breathes in
 * Hz, and `detune` is the spread in cents between the voice's two oscillators,
 * whose slow beating is what keeps a pure sine from sounding like a test tone.
 */
const VOICES = [
  { freq: 92.5, level: 1.0, rate: 1 / 43, detune: 4 }, // F#2
  { freq: 138.59, level: 0.82, rate: 1 / 29, detune: 5 }, // C#3
  { freq: 185.0, level: 0.66, rate: 1 / 23, detune: 6 }, // F#3
  { freq: 220.0, level: 0.5, rate: 1 / 47, detune: 5 }, // A3
  { freq: 277.18, level: 0.36, rate: 1 / 19, detune: 7 }, // C#4
  { freq: 415.3, level: 0.22, rate: 1 / 34, detune: 6 }, // G#4 — the ninth
];

/** Chord tones the bell may pick from, so a strike can never clash. */
const BELL_NOTES = [554.37, 739.99, 830.61, 1108.73];
const BELL_LEVEL = 0.09;
const BELL_DECAY = 6;
const BELL_GAP_MIN = 17;
const BELL_GAP_MAX = 36;

/**
 * @param {number} min
 * @param {number} max
 */
function between(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * A reverb tail, drawn rather than recorded.
 *
 * White noise under an exponential decay is the standard cheap impulse
 * response: it has no early reflections, so it reads as a large soft room
 * rather than a describable place, which is exactly what a pad wants. Roughly
 * two milliseconds to fill, once per session.
 *
 * @param {BaseAudioContext} ctx
 */
function reverbImpulse(ctx) {
  const seconds = 2.8;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel += 1) {
    const samples = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.6;
    }
  }

  return buffer;
}

/**
 * Wire a low-frequency oscillator to modulate an AudioParam.
 *
 * A param's value sums with whatever is connected to it, so the caller sets the
 * centre on the param itself and this supplies the swing either side.
 *
 * @param {AudioContext} ctx
 * @param {AudioParam} param
 * @param {number} rate cycles per second
 * @param {number} depth the param's own units, either side of its value
 * @param {number} phase 0 → 1, so the voices do not all swell together
 */
function modulate(ctx, param, rate, depth, phase) {
  const lfo = ctx.createOscillator();
  lfo.frequency.value = rate;

  const amount = ctx.createGain();
  amount.gain.value = depth;

  lfo.connect(amount).connect(param);

  /*
    Each LFO starts part-way through its own cycle. Without the offset every
    voice would begin at the same point in its swell and the whole chord would
    pulse as one block for the first minute, until the differing rates pulled
    it apart.
  */
  lfo.start(ctx.currentTime + phase / rate);

  return lfo;
}

/**
 * Build the graph. Called once, the first time the bed is started.
 *
 * @param {AudioContext} ctx
 */
function build(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const dry = ctx.createGain();
  dry.gain.value = 0.72;
  dry.connect(master);

  const reverb = ctx.createConvolver();
  reverb.buffer = reverbImpulse(ctx);

  const wet = ctx.createGain();
  wet.gain.value = 0.42;
  reverb.connect(wet).connect(master);

  /** Everything meets here and is split between the two paths. */
  const mix = ctx.createGain();
  mix.connect(dry);
  mix.connect(reverb);

  /*
    The bed's colour. A pad this simple is all fundamental, and left open it
    sounds like a hum from a nearby appliance; pulled down under a kilohertz it
    sits behind the page the way a room does. The cutoff drifts on an LFO of
    its own, which is most of why the texture feels alive rather than held.
  */
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 880;
  tone.Q.value = 0.5;
  tone.connect(mix);

  /** Sources that still need starting. The LFOs start themselves, on phase. */
  const oscillators = [];

  modulate(ctx, tone.frequency, 1 / 37, 320, 0.5);

  VOICES.forEach((spec, index) => {
    const gain = ctx.createGain();
    gain.connect(tone);

    // Two oscillators share the voice, so each takes half the headroom.
    const level = (LEVEL * spec.level) / 2;
    gain.gain.value = level * 0.62;
    modulate(ctx, gain.gain, spec.rate, level * 0.38, index / VOICES.length);

    for (const direction of [-1, 1]) {
      const osc = ctx.createOscillator();
      osc.frequency.value = spec.freq;
      osc.detune.value = spec.detune * direction;
      osc.connect(gain);
      oscillators.push(osc);
    }
  });

  for (const osc of oscillators) {
    osc.start();
  }

  return { master, mix };
}

/**
 * One bell, struck and left to ring out.
 *
 * A single sine with a fast attack and a long exponential tail. It is the only
 * event in the bed, and it is deliberately rare and quiet: often enough that
 * the sound is music rather than a drone, seldom enough that it never becomes
 * something a reader finds themselves waiting for.
 *
 * @param {AudioContext} ctx
 * @param {AudioNode} dest
 */
function strike(ctx, dest) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.frequency.value = BELL_NOTES[Math.floor(Math.random() * BELL_NOTES.length)];

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(BELL_LEVEL, now + 0.05);
  // Exponential, and never to a true zero — the ramp is undefined at 0.
  gain.gain.exponentialRampToValueAtTime(0.0001, now + BELL_DECAY);

  osc.connect(gain);

  /** @type {AudioNode} */
  let tail = gain;

  if (typeof ctx.createStereoPanner === 'function') {
    const pan = ctx.createStereoPanner();
    pan.pan.value = between(-0.55, 0.55);
    gain.connect(pan);
    tail = pan;
  }

  tail.connect(dest);

  osc.start(now);
  osc.stop(now + BELL_DECAY + 0.2);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
    tail.disconnect();
  };
}

/**
 * The ambient bed, as a handle the UI can hold.
 *
 * `start` and `stop` are safe to call in any order and any number of times.
 * Stopping suspends the context rather than tearing the graph down, so turning
 * the sound back on resumes the same chord mid-swell instead of restarting it
 * from the top — the second listen should not sound like a replay.
 */
export function createAmbience() {
  /** @type {AudioContext | null} */
  let ctx = null;
  /** @type {{ master: GainNode, mix: GainNode } | null} */
  let graph = null;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let bellTimer;

  let playing = false;

  function scheduleBell() {
    bellTimer = setTimeout(
      () => {
        if (playing && ctx && graph) {
          strike(ctx, graph.mix);
          scheduleBell();
        }
      },
      between(BELL_GAP_MIN, BELL_GAP_MAX) * 1000,
    );
  }

  /**
   * @param {number} target
   * @param {number} seconds
   */
  function fade(target, seconds) {
    if (!ctx || !graph) {
      return;
    }

    const { gain } = graph.master;
    const now = ctx.currentTime;

    gain.cancelScheduledValues(now);
    // Ramping from wherever the last fade actually got to, not from the value
    // it was heading for: a toggle flipped twice in a second must not jump.
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(target, now + seconds);
  }

  return {
    /**
     * Whether sound is meant to be coming out. Not the same as the context's
     * state, which is also `running` throughout the fade out.
     */
    get playing() {
      return playing;
    },

    /**
     * Begin, or resume.
     *
     * Must be called from inside a user gesture the first time — every browser
     * refuses to start a context outside one, and `resume()` rejects rather
     * than silently doing nothing, so the caller can tell the control not to
     * claim it is playing when it is not.
     *
     * @returns {Promise<boolean>} whether sound is now running
     */
    async start() {
      const AudioCtx = window.AudioContext ?? /** @type {any} */ (window).webkitAudioContext;
      if (!AudioCtx) {
        return false;
      }

      if (!ctx) {
        ctx = new AudioCtx();
        graph = build(ctx);
      }

      try {
        await ctx.resume();
      } catch {
        return false;
      }

      if (ctx.state !== 'running') {
        return false;
      }

      playing = true;
      fade(1, FADE_IN);
      clearTimeout(bellTimer);
      scheduleBell();
      return true;
    },

    /** Fade out, then let go of the audio device while keeping the graph. */
    stop() {
      playing = false;
      clearTimeout(bellTimer);

      if (!ctx) {
        return;
      }

      const context = ctx;
      fade(0, FADE_OUT);
      setTimeout(() => {
        // Another `start()` may have landed inside the fade.
        if (!playing) {
          context.suspend();
        }
      }, FADE_OUT * 1000 + 60);
    },

    /** Release the audio device for good. */
    destroy() {
      playing = false;
      clearTimeout(bellTimer);
      ctx?.close();
      ctx = null;
      graph = null;
    },
  };
}
