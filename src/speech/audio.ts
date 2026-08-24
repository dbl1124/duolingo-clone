import { audioKey, audioPath } from '../lib/audioKey';
import { cancel as cancelDevice, speak as speakWithDevice, type SpeakOptions } from './tts';

/**
 * Audio playback, with recorded clips preferred over the device's synthesiser.
 *
 * Why both exist: WebKit publishes only a subset of installed system voices to
 * the Web Speech API, so a good Spanish voice downloaded on the phone may simply
 * be unreachable from a web page. Recorded clips sidestep that entirely.
 *
 * The fallback is not a nicety — it is what makes the recordings optional. With
 * no `audio/` directory the app behaves exactly as it did before, so the
 * curriculum can grow ahead of the recordings and a newly added card is audible
 * the day it lands rather than the day someone re-runs the generator.
 */

let manifest: Set<string> | null = null;
let loading: Promise<void> | null = null;

/**
 * Load the list of recorded clips. A missing manifest is the normal state before
 * any audio has been generated, so a 404 is not an error.
 */
export function loadAudioManifest(base = './audio/manifest.json'): Promise<void> {
  if (manifest) return Promise.resolve();
  if (loading) return loading;
  loading = fetch(base)
    .then((r) => (r.ok ? r.json() : null))
    .then((json: unknown) => {
      const keys = Array.isArray(json)
        ? json
        : json && typeof json === 'object' && Array.isArray((json as { keys?: unknown }).keys)
          ? (json as { keys: unknown[] }).keys
          : [];
      manifest = new Set(keys.filter((k): k is string => typeof k === 'string'));
    })
    .catch(() => {
      manifest = new Set();
    });
  return loading;
}

export function recordedCount(): number {
  return manifest?.size ?? 0;
}

export function hasRecording(text: string): boolean {
  return manifest?.has(audioKey(text)) ?? false;
}

let current: HTMLAudioElement | null = null;

export function cancelClip(): void {
  if (!current) return;
  current.pause();
  current.currentTime = 0;
  current = null;
}

/**
 * Play a recorded clip. Resolves false when there is nothing recorded for this
 * text, or when playback fails — the caller then falls back to the synthesiser.
 */
function playClip(text: string, rate: number, onEnd?: () => void): Promise<boolean> {
  if (!hasRecording(text)) return Promise.resolve(false);
  cancelClip();

  const el = new Audio(audioPath(text));
  // playbackRate preserves pitch in every current browser, so the 0.8x learner
  // default works on recordings exactly as it does on synthesised speech.
  el.playbackRate = Math.min(1.3, Math.max(0.6, rate));
  el.preservesPitch = true;

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (current === el) current = null;
      if (ok) onEnd?.();
      resolve(ok);
    };

    el.onended = () => finish(true);
    el.onerror = () => finish(false);

    current = el;
    el.play().catch(() => finish(false));
  });
}

/**
 * Say a line of Spanish: the recording if there is one, the device voice if not.
 *
 * `onEnd` fires exactly once either way, so callers never have to know which
 * path was taken.
 */
export function play(text: string, opts: SpeakOptions = {}): void {
  const { rate = 0.8, onEnd } = opts;
  void playClip(text, rate, onEnd).then((played) => {
    if (!played) speakWithDevice(text, opts);
  });
}

/** Stop whichever source is currently playing. */
export function cancel(): void {
  cancelClip();
  cancelDevice();
}

/** Test seam: install a manifest without fetching one. */
export function __setManifestForTests(keys: string[]): void {
  manifest = new Set(keys);
  loading = Promise.resolve();
}
