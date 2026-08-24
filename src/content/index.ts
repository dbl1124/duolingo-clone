import { patterns } from './patterns.ts';
import type { Card, LexItem, Sentence, Unit } from './types.ts';
import { unit01 } from './units/unit01.ts';
import { unit02 } from './units/unit02.ts';
import { unit03 } from './units/unit03.ts';
import { unit04 } from './units/unit04.ts';
import { unit05 } from './units/unit05.ts';
import { unit06 } from './units/unit06.ts';
import { unit07 } from './units/unit07.ts';
import { unit08 } from './units/unit08.ts';
import { unit09 } from './units/unit09.ts';
import { unit10 } from './units/unit10.ts';

export const units: Unit[] = [
  unit01,
  unit02,
  unit03,
  unit04,
  unit05,
  unit06,
  unit07,
  unit08,
  unit09,
  unit10,
];

/**
 * Every card in curriculum order. A unit's lexical items come before its sentences,
 * because a sentence is only worth practising once its parts have been met.
 */
export const allCards: Card[] = units.flatMap((u) => [
  ...u.items.map((item): Card => ({ kind: 'lex', id: item.id, unitId: u.id, item })),
  ...u.sentences.map((s): Card => ({ kind: 'sentence', id: s.id, unitId: u.id, sentence: s })),
  // Patterns come after the unit whose grammar they drill: you meet the frame
  // once the words that fill it are in place.
  ...patterns
    .filter((p) => p.unitId === u.id)
    .map((p): Card => ({ kind: 'pattern', id: p.id, unitId: u.id, pattern: p })),
]);

const cardIndex = new Map<string, Card>(allCards.map((c) => [c.id, c]));
const unitIndex = new Map<string, Unit>(units.map((u) => [u.id, u]));
const orderIndex = new Map<string, number>(allCards.map((c, i) => [c.id, i]));

export function getCard(id: string): Card | undefined {
  return cardIndex.get(id);
}

export function getUnit(id: string): Unit | undefined {
  return unitIndex.get(id);
}

/** Position in the curriculum. Used to introduce new material in a sane order. */
export function curriculumOrder(id: string): number {
  return orderIndex.get(id) ?? Number.MAX_SAFE_INTEGER;
}

export function cardsForUnit(unitId: string): Card[] {
  return allCards.filter((c) => c.unitId === unitId);
}

/**
 * The Spanish surface form.
 *
 * A pattern has no fixed Spanish — the sentence is generated per review — so it
 * falls back to its worked example. Nothing routes a pattern here in practice;
 * this exists so a future caller cannot crash on one.
 */
export function spanishOf(card: Card): string {
  if (card.kind === 'pattern') return card.pattern.example;
  return card.kind === 'lex' ? card.item.es : card.sentence.es;
}

/** The English prompt. Patterns fall back to their title, for the same reason. */
export function englishOf(card: Card): string {
  if (card.kind === 'pattern') return card.pattern.title;
  return card.kind === 'lex' ? card.item.en : card.sentence.en;
}

/** Every Spanish string that should be accepted as a correct answer. */
export function acceptedSpanish(card: Card): string[] {
  if (card.kind === 'pattern') return [card.pattern.example];
  return card.kind === 'lex'
    ? [card.item.es, ...(card.item.esAlt ?? [])]
    : [card.sentence.es, ...(card.sentence.esAlt ?? [])];
}

/** Every English string that should be accepted as a correct answer. */
export function acceptedEnglish(card: Card): string[] {
  if (card.kind === 'pattern') return [card.pattern.title];
  return card.kind === 'lex' ? [card.item.en, ...(card.item.enAlt ?? [])] : [card.sentence.en];
}

export function lexItems(): LexItem[] {
  return units.flatMap((u) => u.items);
}

export function sentences(): Sentence[] {
  return units.flatMap((u) => u.sentences);
}

/** Conversation-repair phrases, surfaced separately so they are always one tap away. */
export function lifelines(): LexItem[] {
  return lexItems().filter((i) => i.lifeline);
}

export const totalCards = allCards.length;

export { patterns, getPattern } from './patterns.ts';
export type { Pattern } from './patterns.ts';

export type { Card, LexItem, Sentence, Unit } from './types.ts';
