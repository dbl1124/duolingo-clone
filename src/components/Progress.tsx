import { useMemo } from 'react';
import { totalCards } from '../content';
import { unitProgress } from '../session/builder';
import { DAY_IN_MS, currentRetrievability, isNew } from '../srs/fsrs';
import type { AppState } from '../store/state';
import { localDateKey } from '../store/state';
import { Meter } from './ui';

const WEEKS = 8;

/**
 * Progress reporting.
 *
 * The calendar is a record, not a scoreboard: days practised are marked, gaps are
 * left alone, and nothing is broken by missing one. A streak counter would turn
 * this same data into a pressure device — the point is to be able to see your own
 * pattern, not to defend a number.
 */
export function Progress({ state, now }: { state: AppState; now: number }) {
  const days = useMemo(() => {
    const practiced = new Set(state.daysPracticed);
    const today = new Date(now);
    // Start on the Sunday that begins the earliest week shown.
    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS * 7 - 1) - today.getDay());
    return Array.from({ length: WEEKS * 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = localDateKey(d.getTime());
      return { key, on: practiced.has(key), today: key === localDateKey(now) };
    });
  }, [state.daysPracticed, now]);

  const stats = useMemo(() => {
    const values = Object.values(state.states);
    const seen = values.filter((s) => !isNew(s));
    const strong = seen.filter((s) => s.stability >= 21).length;
    const totalReps = seen.reduce((n, s) => n + s.reps, 0);
    const lapses = seen.reduce((n, s) => n + s.lapses, 0);
    const liveRecall =
      seen.length === 0 ? 0 : seen.reduce((n, s) => n + currentRetrievability(s, now), 0) / seen.length;
    return { seen: seen.length, strong, totalReps, lapses, liveRecall };
  }, [state.states, now]);

  const upcoming = useMemo(() => {
    const buckets = new Array(7).fill(0) as number[];
    for (const s of Object.values(state.states)) {
      if (isNew(s)) continue;
      const inDays = Math.floor((s.due - now) / DAY_IN_MS);
      if (inDays < 0) buckets[0]!++;
      else if (inDays < 7) buckets[inDays]!++;
    }
    return buckets;
  }, [state.states, now]);

  const peak = Math.max(1, ...upcoming);
  const progress = useMemo(
    () => unitProgress(state.states, now, currentRetrievability),
    [state.states, now],
  );

  return (
    <div className="stack">
      <section className="card">
        <div className="card-title">Where you are</div>
        <div className="stat-grid">
          <div className="stat">
            <b>{stats.seen}</b>
            <span>items in memory</span>
          </div>
          <div className="stat">
            <b>{Math.round(stats.liveRecall * 100)}%</b>
            <span>predicted recall now</span>
          </div>
          <div className="stat">
            <b>{stats.strong}</b>
            <span>solid (3+ weeks)</span>
          </div>
          <div className="stat">
            <b>{stats.totalReps}</b>
            <span>total reviews</span>
          </div>
        </div>
        <p className="small dim" style={{ marginTop: 12, marginBottom: 0 }}>
          {stats.seen} of {totalCards} cards introduced. {stats.lapses} forgotten and
          relearned — that number going up is the system working, not failing.
        </p>
      </section>

      <section className="card">
        <div className="card-title">Days practised</div>
        <div className="calendar" aria-label="Practice history, last eight weeks">
          {days.map((d) => (
            <i
              key={d.key}
              className={`${d.on ? 'on' : ''}${d.today ? ' today' : ''}`}
              title={d.key}
            />
          ))}
        </div>
        <p className="small dim" style={{ marginTop: 12, marginBottom: 0 }}>
          No streak counter, on purpose. A missed day costs you a little recall, which the
          scheduler absorbs. Protecting a number by rushing a session costs you more.
        </p>
      </section>

      <section className="card">
        <div className="card-title">Coming up</div>
        <ul className="list-reset" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {upcoming.map((count, i) => (
            <li key={i} className="row" style={{ gap: 12 }}>
              <span className="small dim" style={{ width: '5.5ch', flexShrink: 0 }}>
                {i === 0 ? 'today' : `+${i}d`}
              </span>
              <div style={{ flex: 1 }}>
                <Meter value={count / peak} thin />
              </div>
              <span className="progress-value" style={{ width: '4ch', textAlign: 'right' }}>
                {count}
              </span>
            </li>
          ))}
        </ul>
        <p className="small dim" style={{ marginTop: 12, marginBottom: 0 }}>
          Sessions stay capped at your daily target regardless. A backlog stretches the
          schedule, never the sitting.
        </p>
      </section>

      <section className="card">
        <div className="card-title">By unit</div>
        <ul className="list-reset divide">
          {progress.map((u) => (
            <li key={u.unitId}>
              <div className="progress-line">
                <strong>
                  {u.unitId.replace('u', 'Unit ')} · {u.title}
                </strong>
                <span className="progress-value">
                  {u.introduced}/{u.total}
                </span>
              </div>
              <Meter value={u.total === 0 ? 0 : u.introduced / u.total} thin />
              <div className="small dim" style={{ marginTop: 4 }}>
                {u.canDo}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
