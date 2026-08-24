import { useSyncExternalStore } from 'react';
import type { Grade, MemoryState } from '../srs/fsrs';
import { DEFAULT_CONFIG, newCard, review } from '../srs/fsrs';
import {
  getMeta,
  loadStates,
  logReview,
  requestPersistence,
  saveState,
  setMeta,
} from './db';

export interface Settings {
  /** Multiplier on the base font size. Defaults high — see the note below. */
  textScale: number;
  /** Playback rate for Spanish audio. */
  audioRate: number;
  /**
   * A specific device voice to speak with, or null to use the best one found.
   * Stored as a voiceURI, which is stable on a given device but meaningless on
   * another — the picker falls back to auto when it is not installed here.
   */
  voiceURI: string | null;
  /** Whether to ask for spoken answers at all. */
  micEnabled: boolean;
  /** Show the etymology and cognate notes on teach screens. */
  showHooks: boolean;
  dailyNewCap: number;
  targetItems: number;
  theme: 'system' | 'light' | 'dark';
}

/**
 * Defaults tuned for this learner, not for a screenshot.
 *
 * Text starts at 1.15x because presbyopia is effectively universal by the late
 * forties and the industry default of 16px grey-on-grey is a genuine barrier, not
 * a style choice. Audio starts at 0.8x because native Mexican Spanish runs fast
 * and elides consonants; full speed is a skill to build toward, not a starting
 * condition. Both are adjustable — but the default is the one that gets used.
 */
export const DEFAULT_SETTINGS: Settings = {
  textScale: 1.15,
  audioRate: 0.8,
  voiceURI: null,
  micEnabled: true,
  showHooks: true,
  dailyNewCap: 6,
  targetItems: 18,
  theme: 'system',
};

export interface AppState {
  loaded: boolean;
  states: Record<string, MemoryState>;
  settings: Settings;
  /** Local ISO dates (YYYY-MM-DD) on which at least one card was reviewed. */
  daysPracticed: string[];
  /** Cards graded in the current sitting, for the end-of-session summary. */
  sessionLog: { cardId: string; grade: Grade }[];
}

const initial: AppState = {
  loaded: false,
  states: {},
  settings: DEFAULT_SETTINGS,
  daysPracticed: [],
  sessionLog: [],
};

let state: AppState = initial;
const listeners = new Set<() => void>();

function set(patch: Partial<AppState>): void {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = (): AppState => state;

export function useApp(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function localDateKey(at: number = Date.now()): string {
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function init(): Promise<void> {
  const [states, settings, daysPracticed] = await Promise.all([
    loadStates(),
    getMeta<Partial<Settings>>('settings', {}),
    getMeta<string[]>('daysPracticed', []),
  ]);
  set({
    loaded: true,
    states,
    settings: { ...DEFAULT_SETTINGS, ...settings },
    daysPracticed,
  });
  void requestPersistence();
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const settings = { ...state.settings, ...patch };
  set({ settings });
  await setMeta('settings', settings);
}

/**
 * Record an answer: update the memory state, persist it, and log the raw review.
 *
 * The log is not decoration. FSRS weights can be re-fitted from a learner's own
 * history, and without a review log that door is permanently closed. It costs a
 * few hundred bytes a day to keep it open.
 */
export async function gradeCard(
  cardId: string,
  grade: Grade,
  mode: string,
  elapsedMs: number,
  now: number = Date.now(),
): Promise<MemoryState> {
  const before = state.states[cardId] ?? newCard(now);
  const after = review(before, grade, now, DEFAULT_CONFIG);

  const day = localDateKey(now);
  const isNewDay = !state.daysPracticed.includes(day);
  const daysPracticed = isNewDay ? [...state.daysPracticed, day] : state.daysPracticed;

  set({
    states: { ...state.states, [cardId]: after },
    daysPracticed,
    sessionLog: [...state.sessionLog, { cardId, grade }],
  });

  await Promise.all([
    saveState(cardId, after),
    logReview({
      cardId,
      grade,
      mode,
      at: now,
      elapsedMs,
      stabilityBefore: before.stability,
      stabilityAfter: after.stability,
    }),
    isNewDay ? setMeta('daysPracticed', daysPracticed) : Promise.resolve(),
  ]);

  return after;
}

export function clearSessionLog(): void {
  set({ sessionLog: [] });
}

export function applyRestoredStates(states: Record<string, MemoryState>): void {
  set({ states });
}

/** Test seam: reset the module store without touching the database. */
export function __resetForTests(): void {
  state = initial;
  for (const l of listeners) l();
}
