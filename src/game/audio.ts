/**
 * Procedural Web Audio Sound Synthesizer for Deltarune Ch.5 Fan Game.
 * Retro 8-bit & 16-bit Undertale/Deltarune style sound effects without external audio files.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
}

export function getMuted(): boolean {
  return isMuted;
}

export function toggleMuted(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

/**
 * Bomb Throw sound: snappy whoosh and high chirp
 */
export function playBombThrow(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.linearRampToValueAtTime(0.01, now + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.17);
}

/**
 * Cross Bomb Explosion: punchy bass boom + white noise burst + square laser tone
 */
export function playBombExplosion(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Low bass punch
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bassOsc.type = 'sine';
  bassOsc.frequency.setValueAtTime(160, now);
  bassOsc.frequency.exponentialRampToValueAtTime(28, now + 0.35);

  bassGain.gain.setValueAtTime(0.45, now);
  bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
  bassOsc.connect(bassGain);
  bassGain.connect(ctx.destination);
  bassOsc.start(now);
  bassOsc.stop(now + 0.36);

  // 2. Cyber laser blast cross beam tone
  const laserOsc = ctx.createOscillator();
  const laserGain = ctx.createGain();
  laserOsc.type = 'sawtooth';
  laserOsc.frequency.setValueAtTime(580, now);
  laserOsc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

  laserGain.gain.setValueAtTime(0.25, now);
  laserGain.gain.linearRampToValueAtTime(0.01, now + 0.22);
  laserOsc.connect(laserGain);
  laserGain.connect(ctx.destination);
  laserOsc.start(now);
  laserOsc.stop(now + 0.23);

  // 3. Noise burst
  try {
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(900, now);
    noiseFilter.frequency.linearRampToValueAtTime(200, now + 0.25);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.25);
  } catch (e) {
    // Noise buffer fallback
  }
}

/**
 * Player Hurt (Soul Hit sting, classic Deltarune feel)
 */
export function playPlayerHurt(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.linearRampToValueAtTime(90, now + 0.18);

  gain.gain.setValueAtTime(0.4, now);
  gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.19);
}

/**
 * Maus Enemy Hurt / Squeak
 */
export function playEnemyHurt(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // High pitch mouse squeak
  osc.type = 'square';
  const startFreq = 880 + (Math.random() - 0.5) * 120;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.linearRampToValueAtTime(startFreq * 1.6, now + 0.05);
  osc.frequency.linearRampToValueAtTime(startFreq * 0.8, now + 0.1);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.11);
}

/**
 * Mouse Defeat Disintegrate Zap
 */
export function playEnemyDeath(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.16);
}

/**
 * Item Draft Bell Fanfare (every 6 waves)
 */
export function playItemDraftFanfare(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [440, 554, 659, 880]; // A major arpeggio
  notes.forEach((freq, idx) => {
    const noteStart = now + idx * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteStart);

    gain.gain.setValueAtTime(0.22, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(noteStart);
    osc.stop(noteStart + 0.36);
  });
}

/**
 * UI Button Click / Menu Blip
 */
export function playMenuBlip(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.setValueAtTime(880, now + 0.03);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.linearRampToValueAtTime(0.01, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}

/**
 * Determination Revive sound
 */
export function playReviveSound(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.linearRampToValueAtTime(0.01, now + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.46);
}
