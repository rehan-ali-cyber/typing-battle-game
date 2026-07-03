// High-Fidelity Audio Engine for Typing Battle Arena
// Supports custom audio assets (MP3) inside public/audio/ with automatic Web Audio API fallback.

let audioCtx: AudioContext | null = null;
let isMuted = false;

// Custom audio elements cache
const sfxCache: Record<string, HTMLAudioElement> = {};
let bgMusic: HTMLAudioElement | null = null;

function preloadSFX(name: string, url: string) {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(url);
    audio.volume = name === "key" ? 0.22 : 0.45;
    audio.addEventListener("canplaythrough", () => {
      sfxCache[name] = audio;
    }, { once: true });
    audio.addEventListener("error", () => {
      // Silent catch: file is missing, will fall back to Web Audio API
    });
  } catch (err) {
    // Ignore preloading issues
  }
}

// Preload custom audio assets when module loads in browser
if (typeof window !== "undefined") {
  preloadSFX("key", "/audio/key_click.mp3");
  preloadSFX("error", "/audio/error.mp3");
  preloadSFX("slash", "/audio/slash.mp3");
  preloadSFX("cast", "/audio/cast.mp3");
  preloadSFX("hit", "/audio/hit.mp3");
  preloadSFX("block", "/audio/block.mp3");
  preloadSFX("victory", "/audio/victory.mp3");
  preloadSFX("defeat", "/audio/defeat.mp3");

  // Setup loopable background music
  try {
    bgMusic = new Audio("/audio/bg_music.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.08; // Soft lofi looping volume
    bgMusic.addEventListener("error", () => {
      bgMusic = null;
    });
  } catch (err) {
    bgMusic = null;
  }
}

function getAudioContext() {
  if (isMuted) return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(name: string, fallback: () => void) {
  if (isMuted) return;
  const custom = sfxCache[name];
  if (custom) {
    try {
      const clone = custom.cloneNode() as HTMLAudioElement;
      clone.volume = custom.volume;
      clone.play().catch(() => fallback());
    } catch (e) {
      fallback();
    }
  } else {
    fallback();
  }
}

export const audioManager = {
  toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
      if (audioCtx) {
        audioCtx.close().then(() => {
          audioCtx = null;
        });
      }
      if (bgMusic) {
        bgMusic.pause();
      }
    } else {
      if (bgMusic) {
        bgMusic.play().catch(() => {});
      }
    }
    return isMuted;
  },

  getMuted() {
    return isMuted;
  },

  startMusic() {
    if (isMuted || !bgMusic) return;
    bgMusic.play().catch(() => {
      // Browser autoplay policy might block music until user interacts
    });
  },

  stopMusic() {
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  },

  // Typewriter/Keypress scratch click sound
  playKey() {
    playSound("key", () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 0.05; // 50ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1800 + Math.random() * 600;
      filter.Q.value = 4.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    });
  },

  // Low frequency error scratch
  playError() {
    playSound("error", () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.15);

      filter.type = "lowpass";
      filter.frequency.value = 350;

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    });
  },

  // Sword slash frequency sweep noise
  playSlash() {
    playSound("slash", () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 0.25; // 250ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.2);
      filter.Q.value = 2.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.23);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    });
  },

  // Magical spell FM tone sweep
  playCast() {
    playSound("cast", () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.3);

      modulator.type = "sine";
      modulator.frequency.setValueAtTime(35, ctx.currentTime);
      modGain.gain.setValueAtTime(150, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

      modulator.connect(modGain);
      modGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(ctx.destination);

      modulator.start();
      osc.start();
      modulator.stop(ctx.currentTime + 0.35);
      osc.stop(ctx.currentTime + 0.35);
    });
  },

  // solid hitting sound (thud)
  playHit() {
    playSound("hit", () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

      filter.type = "lowpass";
      filter.frequency.value = 280;

      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    });
  },

  // Deflecting metallic shield ring sound
  playBlock() {
    playSound("block", () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(650, ctx.currentTime + 0.12);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1240, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.18);
    });
  },

  // Victory fanfare
  playVictory() {
    playSound("victory", () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.08, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    });
  },

  // Defeat ditty
  playDefeat() {
    playSound("defeat", () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [293.66, 277.18, 261.63, 220.00]; // D4, C#4, C4, A3
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.08, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.5);
      });
    });
  }
};
