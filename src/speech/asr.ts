import { editDistance, normalize } from '../lib/answer';

/**
 * Speech recognition, for spoken production practice.
 *
 * An honest caveat drives the design here: browser speech recognition is not a
 * pronunciation assessor. It is a transcriber optimised for native speakers, and
 * it will sometimes mis-hear a perfectly good learner. Treating its output as a
 * verdict would mean punishing correct Spanish, which is worse than not scoring
 * at all.
 *
 * So: the score is advisory, the thresholds are generous, and the UI always offers
 * an "I said it right" override that the learner can use to grade themselves. The
 * mic is a practice partner, not an examiner.
 */

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  length: number;
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function recognitionSupported(): boolean {
  return getCtor() !== null;
}

/**
 * Similarity between what was heard and what was expected, 0–100.
 *
 * Normalised edit distance rather than raw distance, so a long sentence is not
 * judged more harshly than a short word for the same proportion of error.
 */
export function scorePronunciation(transcript: string, target: string): number {
  const heard = normalize(transcript);
  const want = normalize(target);
  if (want.length === 0) return 0;
  if (heard === want) return 100;
  const distance = editDistance(heard, want);
  const similarity = 1 - distance / Math.max(heard.length, want.length);
  return Math.max(0, Math.round(similarity * 100));
}

export type PronunciationVerdict = 'good' | 'close' | 'unclear';

/**
 * Thresholds are deliberately lenient. A learner who says "quisiera una cerveza"
 * with an American accent may transcribe as "quisiera una servesa" — that is a
 * successful communication, and the app should treat it as one.
 */
export function verdictFor(score: number): PronunciationVerdict {
  if (score >= 82) return 'good';
  if (score >= 60) return 'close';
  return 'unclear';
}

export interface ListenResult {
  transcript: string;
  score: number;
  verdict: PronunciationVerdict;
}

export type ListenError = 'unsupported' | 'no-permission' | 'no-speech' | 'failed';

export interface Listener {
  stop: () => void;
}

/**
 * Listen for one utterance and score it against `target`.
 * Resolves with a result, or rejects with a `ListenError` string.
 */
export function listenOnce(
  target: string,
  onResult: (result: ListenResult) => void,
  onError: (error: ListenError) => void,
): Listener {
  const Ctor = getCtor();
  if (!Ctor) {
    onError('unsupported');
    return { stop: () => {} };
  }

  const recognition = new Ctor();
  recognition.lang = 'es-MX';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  let settled = false;
  const finish = (fn: () => void) => {
    if (settled) return;
    settled = true;
    fn();
  };

  recognition.onresult = (event) => {
    const result = event.results[0];
    if (!result) {
      finish(() => onError('no-speech'));
      return;
    }
    // Score every alternative and keep the best: the top-confidence transcript is
    // not always the closest to the target, and we care about what was said, not
    // about what the engine considers most probable in general Spanish.
    let best = { transcript: result[0].transcript, score: 0 };
    for (let i = 0; i < result.length; i++) {
      const alt = (result as unknown as Record<number, SpeechRecognitionAlternativeLike>)[i];
      if (!alt) continue;
      const score = scorePronunciation(alt.transcript, target);
      if (score > best.score) best = { transcript: alt.transcript, score };
    }
    finish(() => onResult({ ...best, verdict: verdictFor(best.score) }));
  };

  recognition.onerror = (e) => {
    const map: Record<string, ListenError> = {
      'not-allowed': 'no-permission',
      'service-not-allowed': 'no-permission',
      'no-speech': 'no-speech',
      aborted: 'no-speech',
    };
    finish(() => onError(map[e.error] ?? 'failed'));
  };

  recognition.onend = () => {
    finish(() => onError('no-speech'));
  };

  try {
    recognition.start();
  } catch {
    finish(() => onError('failed'));
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}
