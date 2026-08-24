/**
 * Text-to-speech via the Web Speech API.
 *
 * No audio files and no network: the device's own Spanish voices do the work, so
 * the app stays fully offline and every one of the ~280 cards has audio without
 * anyone recording it.
 *
 * Voice quality varies by device. That is the trade, and it is the right one for
 * a beginner: hearing every item at an adjustable speed beats hearing a subset at
 * studio quality.
 */

const PREFERRED_LANGS = ['es-MX', 'es-US', 'es-419', 'es-ES', 'es'];

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady = false;

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Voices load asynchronously in most browsers and synchronously in some. Resolve
 * either way rather than assuming.
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    voicesReady = true;
    return Promise.resolve(existing);
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        clearTimeout(timeout);
        voicesReady = true;
        resolve(window.speechSynthesis.getVoices());
      },
      { once: true },
    );
  });
}

/** Best available Spanish voice, preferring Mexican and Latin American ones. */
export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const lang of PREFERRED_LANGS) {
    const exact = voices.find((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase());
    if (exact) return exact;
  }
  return voices.find((v) => v.lang.toLowerCase().startsWith('es')) ?? null;
}

export async function primeVoices(): Promise<boolean> {
  const voices = await loadVoices();
  cachedVoice = pickVoice(voices);
  return cachedVoice !== null;
}

export function hasSpanishVoice(): boolean {
  return cachedVoice !== null;
}

export interface SpeakOptions {
  rate?: number;
  /** Called when playback finishes or fails, so the UI can re-enable its button. */
  onEnd?: () => void;
}

let current: SpeechSynthesisUtterance | null = null;

export function speak(text: string, { rate = 0.8, onEnd }: SpeakOptions = {}): void {
  if (!speechSupported()) {
    onEnd?.();
    return;
  }
  cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = cachedVoice?.lang ?? 'es-MX';
  if (cachedVoice) utterance.voice = cachedVoice;
  // Below ~0.6 most engines start sounding synthetic enough to teach the wrong
  // rhythm, so clamp rather than trusting the slider.
  utterance.rate = Math.min(1.3, Math.max(0.6, rate));
  utterance.pitch = 1;
  utterance.onend = () => {
    current = null;
    onEnd?.();
  };
  utterance.onerror = () => {
    current = null;
    onEnd?.();
  };

  current = utterance;
  window.speechSynthesis.speak(utterance);
}

export function cancel(): void {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
  current = null;
}

export function isSpeaking(): boolean {
  return current !== null;
}

export function voicesLoaded(): boolean {
  return voicesReady;
}
