/**
 * Text-to-speech via the Web Speech API.
 *
 * No audio files and no network: the device's own Spanish voices do the work, so
 * the app stays fully offline and every one of the 365 cards has audio without
 * anyone recording it.
 *
 * The catch is that phones ship several Spanish voices of very different quality,
 * and the low-quality "compact" ones sound robotic enough to teach the wrong
 * rhythm. Taking whatever voice happens to be listed first is how you end up
 * learning from a 1990s answering machine, so voices are scored and the best one
 * wins — and the learner can override the choice entirely.
 */

export interface RankedVoice {
  voice: SpeechSynthesisVoice;
  voiceURI: string;
  name: string;
  lang: string;
  score: number;
  /** True when the name advertises a neural / enhanced / premium engine. */
  enhanced: boolean;
  /** False means the voice is synthesised server-side and needs a connection. */
  local: boolean;
  /** Human-readable region, for the picker. */
  region: string;
}

/**
 * Regional preference. Mexican first because that is the target variety; the rest
 * of Latin America next; Spain last, since distinción and vosotros are actively
 * unhelpful here. A Castilian voice is still far better than no voice.
 */
const REGION_SCORE: Record<string, { score: number; label: string }> = {
  'es-mx': { score: 100, label: 'Mexico' },
  'es-us': { score: 85, label: 'US Spanish' },
  'es-419': { score: 85, label: 'Latin America' },
  'es-la': { score: 85, label: 'Latin America' },
  'es-co': { score: 70, label: 'Colombia' },
  'es-ar': { score: 68, label: 'Argentina' },
  'es-cl': { score: 68, label: 'Chile' },
  'es-pe': { score: 70, label: 'Peru' },
  'es-ve': { score: 68, label: 'Venezuela' },
  'es-ec': { score: 68, label: 'Ecuador' },
  'es-gt': { score: 68, label: 'Guatemala' },
  'es-cr': { score: 68, label: 'Costa Rica' },
  'es-pa': { score: 68, label: 'Panama' },
  'es-do': { score: 66, label: 'Dominican Republic' },
  'es-cu': { score: 66, label: 'Cuba' },
  'es-pr': { score: 66, label: 'Puerto Rico' },
  'es-uy': { score: 66, label: 'Uruguay' },
  'es-py': { score: 66, label: 'Paraguay' },
  'es-bo': { score: 66, label: 'Bolivia' },
  'es-sv': { score: 66, label: 'El Salvador' },
  'es-hn': { score: 66, label: 'Honduras' },
  'es-ni': { score: 66, label: 'Nicaragua' },
  es: { score: 55, label: 'Spanish' },
  'es-es': { score: 45, label: 'Spain' },
};

/** Names that advertise a modern engine. Worth far more than the exact region. */
const ENHANCED = /premium|enhanced|neural|natural|siri/i;
/** Names that advertise the old formant synthesisers — these are the robotic ones. */
const ROBOTIC = /compact|eloquence|espeak|pico/i;
const GOOGLE = /google/i;
const MICROSOFT = /microsoft/i;

export function normalizeLang(lang: string): string {
  return lang.replace('_', '-').toLowerCase();
}

/**
 * Score a voice for this app. Returns -Infinity for anything that is not Spanish.
 *
 * Engine quality outweighs region deliberately: an enhanced Castilian voice is a
 * better teacher than a robotic Mexican one. Accent differences between Spanish
 * varieties are far smaller than the difference between a neural voice and a
 * formant synthesiser.
 */
export function scoreVoice(voice: Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>): number {
  const lang = normalizeLang(voice.lang);
  if (lang !== 'es' && !lang.startsWith('es-')) return -Infinity;

  let score = REGION_SCORE[lang]?.score ?? 50;

  if (ENHANCED.test(voice.name)) score += 60;
  else if (GOOGLE.test(voice.name)) score += 35;
  else if (MICROSOFT.test(voice.name)) score += 25;

  if (ROBOTIC.test(voice.name)) score -= 55;

  // Prefer on-device voices when scores are otherwise close, so the offline
  // promise survives. A network voice can still win on quality, and the picker
  // labels it so the trade is visible.
  if (voice.localService) score += 15;

  return score;
}

export function regionLabel(lang: string): string {
  const l = normalizeLang(lang);
  return REGION_SCORE[l]?.label ?? l.toUpperCase();
}

/** Every Spanish voice on the device, best first. */
export function rankSpanishVoices(voices: SpeechSynthesisVoice[]): RankedVoice[] {
  return voices
    .map((voice) => ({
      voice,
      voiceURI: voice.voiceURI,
      name: voice.name,
      lang: voice.lang,
      score: scoreVoice(voice),
      enhanced: ENHANCED.test(voice.name) || GOOGLE.test(voice.name),
      local: voice.localService,
      region: regionLabel(voice.lang),
    }))
    .filter((v) => Number.isFinite(v.score))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

let cachedVoice: SpeechSynthesisVoice | null = null;
let cachedRanked: RankedVoice[] = [];
let cachedRaw: SpeechSynthesisVoice[] = [];
let voicesReady = false;
let pinnedURI: string | null = null;
let listening = false;

const voiceListeners = new Set<() => void>();

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Notified whenever the device's voice list changes. */
export function subscribeVoices(listener: () => void): () => void {
  voiceListeners.add(listener);
  return () => voiceListeners.delete(listener);
}

/**
 * Re-read the device voice list and re-resolve the active voice.
 *
 * Must stay cheap — it runs on every `voiceschanged`, which some engines fire
 * several times during startup.
 */
export function refreshVoices(): RankedVoice[] {
  if (!speechSupported()) return [];
  cachedRaw = window.speechSynthesis.getVoices();
  cachedRanked = rankSpanishVoices(cachedRaw);
  cachedVoice = pickVoice(cachedRaw, pinnedURI);
  if (cachedRaw.length > 0) voicesReady = true;
  for (const l of voiceListeners) l();
  return cachedRanked;
}

/**
 * Stay subscribed to `voiceschanged` for the lifetime of the page.
 *
 * The original bug: this listener was registered with `{ once: true }` and only
 * when the first `getVoices()` came back empty. On iOS the first call routinely
 * returns a *partial* list — often just the built-in compact voices — and the
 * full set, including anything downloaded through Settings, arrives in a later
 * `voiceschanged`. Resolving on the first non-empty answer and never listening
 * again meant a newly installed voice could never show up, no matter how many
 * times the app was restarted.
 */
function startListening(): void {
  if (listening || !speechSupported()) return;
  listening = true;
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    refreshVoices();
  });
}

/**
 * Resolve the voice list, waiting for a late-arriving one.
 *
 * Even a non-empty first answer gets a short grace period, because on iOS that
 * first answer is frequently incomplete.
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  startListening();

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    voicesReady = true;
    // Give a late `voiceschanged` a moment to land, then take whatever is there.
    return new Promise((resolve) => {
      setTimeout(() => resolve(window.speechSynthesis.getVoices()), 250);
    });
  }

  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timeout);
      voicesReady = true;
      resolve(window.speechSynthesis.getVoices());
    };
    const timeout = setTimeout(
      () => resolve(window.speechSynthesis.getVoices()),
      2000,
    );
    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true });
  });
}

/** Every voice the browser reports, Spanish or not. For the diagnostics panel. */
export function rawVoices(): SpeechSynthesisVoice[] {
  return cachedRaw;
}

/**
 * The voice to speak with: the learner's pinned choice if it is still installed,
 * otherwise the highest-scoring Spanish voice available.
 */
export function pickVoice(
  voices: SpeechSynthesisVoice[],
  preferredURI?: string | null,
): SpeechSynthesisVoice | null {
  const ranked = rankSpanishVoices(voices);
  if (preferredURI) {
    const pinned = ranked.find((v) => v.voiceURI === preferredURI);
    // A pinned voice can disappear — uninstalled, or a different device entirely.
    // Falling through to the best available beats going silent.
    if (pinned) return pinned.voice;
  }
  return ranked[0]?.voice ?? null;
}

export async function primeVoices(preferredURI?: string | null): Promise<boolean> {
  pinnedURI = preferredURI ?? null;
  await loadVoices();
  // Go through refreshVoices so cachedRaw is populated and subscribers are told,
  // rather than duplicating the caching here and letting the two drift apart.
  refreshVoices();
  return cachedVoice !== null;
}

/** Re-resolve the active voice after the learner changes the setting. */
export function setPreferredVoice(voiceURI: string | null): void {
  pinnedURI = voiceURI;
  if (!speechSupported()) return;
  cachedVoice = pickVoice(window.speechSynthesis.getVoices(), voiceURI);
}

export function availableSpanishVoices(): RankedVoice[] {
  return cachedRanked;
}

export function activeVoice(): SpeechSynthesisVoice | null {
  return cachedVoice;
}

export function hasSpanishVoice(): boolean {
  return cachedVoice !== null;
}

export interface SpeakOptions {
  rate?: number;
  /** Speak with a specific voice regardless of the current setting, for previews. */
  voiceURI?: string | null;
  /** Called when playback finishes or fails, so the UI can re-enable its button. */
  onEnd?: () => void;
}

let current: SpeechSynthesisUtterance | null = null;

export function speak(text: string, { rate = 0.8, voiceURI, onEnd }: SpeakOptions = {}): void {
  if (!speechSupported()) {
    onEnd?.();
    return;
  }
  cancel();

  const voice =
    voiceURI !== undefined
      ? pickVoice(window.speechSynthesis.getVoices(), voiceURI)
      : (cachedVoice ?? pickVoice(window.speechSynthesis.getVoices(), pinnedURI));

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? 'es-MX';
  // Below ~0.7 the older synthesisers start smearing consonants and teaching the
  // wrong rhythm, so clamp rather than trusting the slider.
  utterance.rate = Math.min(1.3, Math.max(0.7, rate));
  utterance.pitch = 1;

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    current = null;
    onEnd?.();
  };
  utterance.onend = finish;
  utterance.onerror = finish;

  // Everything below can throw on a flaky or unusual speech engine, and a throw
  // here would skip onEnd entirely — leaving the play button stuck mid-playback
  // with no way to retry. Silence is a bad outcome; a wedged control is worse.
  try {
    if (voice) utterance.voice = voice;
  } catch {
    // Assigning the voice failed; the utterance still speaks in the default one.
  }

  current = utterance;
  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    finish();
  }
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
