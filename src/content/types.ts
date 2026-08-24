/**
 * Content model.
 *
 * The unit of scheduling is a *card*, and there is exactly one card per learnable
 * item. We deliberately do NOT create separate cards for recognise/produce/speak:
 * that multiplies the daily review load by 3-4x, which a 10-minute session cannot
 * absorb honestly. Instead a single card escalates through harder retrieval modes
 * as its memory strength grows (see `src/session/ladder.ts`). Same item, harder
 * ask — which is the retrieval-practice finding applied to scheduling rather than
 * bolted on beside it.
 */

import type { Pattern } from './patterns.ts';

export type Pos =
  | 'noun'
  | 'verb'
  | 'adj'
  | 'adv'
  | 'prep'
  | 'pron'
  | 'conj'
  | 'interj'
  | 'phrase'
  | 'num'
  | 'det';

/** A word or fixed phrase. Phrases ("mucho gusto") are first-class, not decomposed. */
export interface LexItem {
  id: string;
  /** Spanish surface form, as it should be spoken and written. */
  es: string;
  /** Primary English meaning shown when teaching and used as the produce-prompt. */
  en: string;
  /** Extra English renderings accepted when answering ES -> EN. */
  enAlt?: string[];
  /** Extra Spanish renderings accepted when answering EN -> ES. */
  esAlt?: string[];
  pos: Pos;
  gender?: 'm' | 'f';
  /** Word-for-word gloss, when the idiom would otherwise look arbitrary. */
  literal?: string;
  /** When and with whom to use it. */
  note?: string;
  /**
   * Etymology or cognate hook. This is the single biggest lever an adult learner
   * has over a child: a 47-year-old has ~40k English words already encoded, many
   * sharing a Latin root with the Spanish target. Free retrieval scaffolding.
   */
  hook?: string;
  /** Approximate frequency rank in spoken Spanish. Lower = learn earlier. */
  rank?: number;
  register?: 'formal' | 'informal' | 'neutral';
  /** Marks conversation-repair phrases, which are front-loaded regardless of rank. */
  lifeline?: boolean;
}

/** A full sentence. Used for cloze and for whole-sentence production. */
export interface Sentence {
  id: string;
  es: string;
  en: string;
  esAlt?: string[];
  /** Lex item ids this sentence exercises — drives interleaving and unlocking. */
  uses: string[];
  /**
   * Exact substring of `es` to blank out for cloze. Must appear verbatim in `es`;
   * validated by the content test suite.
   */
  cloze?: string;
}

export interface GrammarExample {
  es: string;
  en: string;
  /** Substring of `es` to highlight. Must appear verbatim; validated by tests. */
  hl?: string;
}

/**
 * An explicit grammar explanation, shown *before* practice.
 *
 * Norris & Ortega's meta-analysis found explicit instruction substantially
 * outperforms implicit for adults (d ~ 1.13). Guess-the-rule-from-examples is
 * optimised for children who cannot use a rule even when handed one; it wastes
 * the strongest advantage an adult learner has.
 */
export interface GrammarNote {
  id: string;
  title: string;
  /** The rule itself, in one or two sentences. Never longer. */
  summary: string;
  /** Expanded explanation, one string per paragraph. */
  body: string[];
  examples: GrammarExample[];
  /** Etymology that makes the rule feel motivated instead of arbitrary. */
  hook?: string;
  /** The specific mistake an English speaker makes here. */
  pitfall?: string;
}

/** Two sounds English merges that Spanish distinguishes, or vice versa. */
export interface MinimalPair {
  a: string;
  b: string;
  aEn: string;
  bEn: string;
  /** What to actually listen for. */
  contrast: string;
}

export interface PronFocus {
  id: string;
  title: string;
  summary: string;
  body: string[];
  pairs?: MinimalPair[];
}

export interface Unit {
  id: string;
  n: number;
  title: string;
  /**
   * The communicative can-do statement. This is what the progress screen reports
   * against — "you can now handle X" rather than "you have 412 points", which is
   * the andragogy finding (adults are task-centred, not reward-driven) taken
   * seriously rather than decorated over.
   */
  canDo: string;
  /** One-line description of where you'd actually use this. */
  scenario: string;
  grammar: GrammarNote[];
  items: LexItem[];
  sentences: Sentence[];
  pron?: PronFocus;
}

/**
 * Every schedulable thing, flattened.
 *
 * A pattern card is different in kind from the other two: it carries no fixed
 * text. What is scheduled is the *frame*, and the sentence is generated fresh at
 * every review, so the answer can never be recalled — only constructed.
 */
export type Card =
  | { kind: 'lex'; id: string; unitId: string; item: LexItem }
  | { kind: 'sentence'; id: string; unitId: string; sentence: Sentence }
  | { kind: 'pattern'; id: string; unitId: string; pattern: Pattern };
