// Ember Court audio: every sound is synthesised with WebAudio — no audio
// files, no network. Short oscillator bleeps for play, win and loss.
let audioContext = null;
let muted = false;

/** Create the context on the first user gesture (browsers demand it). */
export function ensureAudio() {
  if (audioContext) return;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) audioContext = new Ctor();
  } catch (err) { audioContext = null; }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() { return muted; }

function bleep(frequency, duration, type, gain) {
  if (muted || !audioContext) return;
  try {
    const osc = audioContext.createOscillator();
    const amp = audioContext.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = frequency;
    amp.gain.setValueAtTime(gain || 0.12, audioContext.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    osc.connect(amp);
    amp.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  } catch (err) { /* sound is decoration; never break the game */ }
}

/** A card snapping onto the table. */
export function playSound() {
  ensureAudio();
  bleep(520, 0.09, 'triangle', 0.14);
  setTimeout(() => bleep(780, 0.12, 'triangle', 0.1), 70);
}

/** The win flourish: a rising arpeggio. */
export function winSound() {
  ensureAudio();
  [523, 659, 784, 1047].forEach((freq, i) => setTimeout(() => bleep(freq, 0.22, 'sine', 0.14), i * 110));
}

/** The loss: a low falling pair. */
export function lossSound() {
  ensureAudio();
  bleep(220, 0.3, 'sawtooth', 0.08);
  setTimeout(() => bleep(147, 0.45, 'sawtooth', 0.08), 180);
}
