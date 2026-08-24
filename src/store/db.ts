import type { Grade, MemoryState } from '../srs/fsrs';

/**
 * Persistence.
 *
 * IndexedDB rather than localStorage, for two reasons. It survives better under
 * Safari's storage policy, and it holds the full review log without competing for
 * the 5MB string quota.
 *
 * The eviction risk is real and worth stating plainly: iOS clears site data for
 * pages that are *not* installed to the home screen after roughly seven days of
 * no visits. A spaced-repetition app losing its schedule is a total loss, so the
 * app prompts to install, and `exportBackup` exists so a copy can be kept
 * somewhere that no browser policy can reach.
 */

const DB_NAME = 'hablo';
const DB_VERSION = 1;

const STORE_STATES = 'states';
const STORE_REVIEWS = 'reviews';
const STORE_META = 'meta';

export interface ReviewLogEntry {
  cardId: string;
  grade: Grade;
  mode: string;
  at: number;
  /** Milliseconds from prompt to answer — a proxy for retrieval effort. */
  elapsedMs: number;
  stabilityBefore: number;
  stabilityAfter: number;
}

export interface StoredState extends MemoryState {
  id: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_STATES)) {
        db.createObjectStore(STORE_STATES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_REVIEWS)) {
        const reviews = db.createObjectStore(STORE_REVIEWS, { autoIncrement: true });
        reviews.createIndex('cardId', 'cardId');
        reviews.createIndex('at', 'at');
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open the database'));
  });
  return dbPromise;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, mode);
        const req = run(transaction.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error(`${store} operation failed`));
      }),
  );
}

export async function loadStates(): Promise<Record<string, MemoryState>> {
  const rows = await tx<StoredState[]>(STORE_STATES, 'readonly', (s) => s.getAll());
  const out: Record<string, MemoryState> = {};
  for (const { id, ...state } of rows) out[id] = state;
  return out;
}

export async function saveState(id: string, state: MemoryState): Promise<void> {
  await tx(STORE_STATES, 'readwrite', (s) => s.put({ id, ...state }));
}

export async function logReview(entry: ReviewLogEntry): Promise<void> {
  await tx(STORE_REVIEWS, 'readwrite', (s) => s.add(entry));
}

export async function allReviews(): Promise<ReviewLogEntry[]> {
  return tx<ReviewLogEntry[]>(STORE_REVIEWS, 'readonly', (s) => s.getAll());
}

export async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const row = await tx<{ key: string; value: T } | undefined>(STORE_META, 'readonly', (s) =>
    s.get(key),
  );
  return row ? row.value : fallback;
}

export async function setMeta<T>(key: string, value: T): Promise<void> {
  await tx(STORE_META, 'readwrite', (s) => s.put({ key, value }));
}

export interface Backup {
  app: 'hablo';
  version: number;
  exportedAt: number;
  states: Record<string, MemoryState>;
  reviews: ReviewLogEntry[];
  meta: Record<string, unknown>;
}

const META_KEYS = ['settings', 'daysPracticed'];

export async function exportBackup(): Promise<Backup> {
  const [states, reviews] = await Promise.all([loadStates(), allReviews()]);
  const meta: Record<string, unknown> = {};
  for (const key of META_KEYS) meta[key] = await getMeta<unknown>(key, null);
  return { app: 'hablo', version: DB_VERSION, exportedAt: Date.now(), states, reviews, meta };
}

export function isBackup(value: unknown): value is Backup {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Backup).app === 'hablo' &&
    typeof (value as Backup).states === 'object'
  );
}

/**
 * Restore from a backup, keeping whichever copy of each card is further along.
 *
 * Merging rather than overwriting matters: restoring an old export onto a device
 * that has since been practised on should not roll that progress back.
 */
export async function importBackup(backup: Backup): Promise<{ restored: number }> {
  const existing = await loadStates();
  let restored = 0;
  for (const [id, incoming] of Object.entries(backup.states)) {
    const current = existing[id];
    if (!current || incoming.reps > current.reps) {
      await saveState(id, incoming);
      restored++;
    }
  }
  for (const key of META_KEYS) {
    const value = backup.meta?.[key];
    if (value != null) await setMeta(key, value);
  }
  return { restored };
}

export async function resetAll(): Promise<void> {
  const db = await openDb();
  await Promise.all(
    [STORE_STATES, STORE_REVIEWS, STORE_META].map(
      (name) =>
        new Promise<void>((resolve, reject) => {
          const req = db.transaction(name, 'readwrite').objectStore(name).clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        }),
    ),
  );
}

/** True when the browser has promised not to evict our data under storage pressure. */
export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
