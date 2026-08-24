import type { Card } from '../content/types';
import type { MemoryState } from '../srs/fsrs';

/**
 * The retrieval ladder.
 *
 * Duolingo's core failure mode is that its exercises stay at the *recognition*
 * end forever — tapping the right tile out of a word bank. Recognition is the
 * weakest form of retrieval practice; the generation effect says that producing
 * an answer from nothing is what actually builds a durable, usable memory.
 *
 * So an item does not get a fixed exercise type. It climbs:
 *
 *   teach -> recognise -> produce (typed) -> speak (aloud)
 *
 * Each rung demands more retrieval effort than the last, and the card only moves
 * up as its memory strength supports it. This is Bjork's desirable difficulties
 * applied where it belongs — to the *ask*, not to the interface.
 *
 * A lapse steps the card back down a rung. That is the "supported" half of
 * challenging-but-supported: failing a spoken prompt drops you to a typed one
 * rather than making you fail the same wall repeatedly.
 */
export type ExerciseMode =
  | 'teach'
  | 'recognize'
  | 'listen'
  | 'cloze'
  | 'produce'
  | 'speak'
  | 'build';

export interface LadderCapabilities {
  /** Speech synthesis is available for listening exercises. */
  canListen: boolean;
  /** Speech recognition is available and the learner wants mic scoring. */
  canSpeak: boolean;
}

/** How demanding each mode is, for ordering and for reporting progress. */
export const MODE_RANK: Record<ExerciseMode, number> = {
  teach: 0,
  recognize: 1,
  listen: 2,
  cloze: 3,
  produce: 4,
  // Building an unseen sentence from a frame asks for more than reproducing a
  // memorised one, so it ranks above plain production.
  build: 5,
  speak: 6,
};

/** Stability (days) at which an item is solid enough to be worth saying aloud. */
const SPEAK_STABILITY_THRESHOLD = 6;

/**
 * Which exercise modes are legitimate for this card right now, hardest last.
 * Never empty — always degrades to something presentable.
 */
export function modesFor(
  card: Card,
  state: MemoryState | undefined,
  caps: LadderCapabilities,
): ExerciseMode[] {
  // A pattern has no fixed answer to recognise or listen to, so it does not climb
  // the ladder — it is construction from the first review to the last. Its
  // difficulty rises on its own as more fillers become available.
  if (card.kind === 'pattern') return ['build'];

  if (!state || state.reps === 0 || state.lastReview === null) return ['teach'];

  const isSentence = card.kind === 'sentence';
  const lapsedRecently = state.state === 'relearning';
  const modes: ExerciseMode[] = [];

  // Effective rung: a recent lapse costs you a rung, so you re-earn the harder ask.
  const rung = Math.max(1, state.reps - (lapsedRecently ? 2 : 0));

  if (isSentence) {
    if (rung <= 1) {
      modes.push('cloze');
    } else if (rung <= 3) {
      modes.push('cloze', 'produce');
    } else {
      modes.push('produce');
      if (caps.canSpeak && state.stability >= SPEAK_STABILITY_THRESHOLD) modes.push('speak');
    }
  } else {
    if (rung <= 1) {
      modes.push('recognize');
      if (caps.canListen) modes.push('listen');
    } else if (rung <= 3) {
      modes.push('produce');
      if (caps.canListen) modes.push('listen');
    } else {
      modes.push('produce');
      if (caps.canSpeak && state.stability >= SPEAK_STABILITY_THRESHOLD) modes.push('speak');
      if (caps.canListen) modes.push('listen');
    }
  }

  return modes.length > 0 ? modes : ['recognize'];
}

/**
 * Choose one mode from the eligible set.
 *
 * Weighted toward the hardest eligible mode, but not deterministic — varying the
 * ask across reviews is interleaving at the exercise level, and stops the learner
 * from memorising a stimulus-response pair instead of the language.
 */
export function pickMode(
  card: Card,
  state: MemoryState | undefined,
  caps: LadderCapabilities,
  rand: () => number,
): ExerciseMode {
  const modes = modesFor(card, state, caps);
  if (modes.length === 1) return modes[0]!;

  // Hardest mode gets ~60% of the weight; the rest share what's left.
  const hardest = modes.reduce((a, b) => (MODE_RANK[b] > MODE_RANK[a] ? b : a));
  if (rand() < 0.6) return hardest;
  const others = modes.filter((m) => m !== hardest);
  if (others.length === 0) return hardest;
  return others[Math.floor(rand() * others.length) % others.length]!;
}

/** True once the learner has produced this item from scratch, not just recognised it. */
export function hasBeenProduced(state: MemoryState | undefined): boolean {
  return !!state && state.reps >= 2 && state.state !== 'relearning';
}
