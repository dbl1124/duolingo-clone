import { useMemo } from 'react';
import { totalCards } from '../content';
import { type SessionConfig, forecast, unitProgress } from '../session/builder';
import { currentRetrievability } from '../srs/fsrs';
import type { AppState } from '../store/state';
import { Meter } from './ui';

/**
 * The home screen answers one question: what can I do now, and what is today's work?
 *
 * There is deliberately no streak counter. Streaks reliably produce the behaviour
 * they measure rather than the behaviour they are proxying for — tapping through a
 * session at 11:58pm to protect a number is worse than skipping it, because it
 * feeds the scheduler false grades. What is shown instead is the can-do statement
 * each unit is built around, and an honest count of what the learner can produce
 * without prompting.
 */
export function Home({
  state,
  cfg,
  onStart,
  onStartMinimal,
}: {
  state: AppState;
  cfg: SessionConfig;
  onStart: () => void;
  onStartMinimal: () => void;
}) {
  const f = useMemo(
    () => forecast(state.states, cfg, currentRetrievability),
    [state.states, cfg],
  );
  const progress = useMemo(
    () => unitProgress(state.states, cfg.now, currentRetrievability),
    [state.states, cfg.now],
  );

  const producible = progress.reduce((n, u) => n + u.produced, 0);
  const introduced = progress.reduce((n, u) => n + u.introduced, 0);
  const active = progress.filter((u) => u.introduced > 0);
  const nothingToDo = f.total === 0;

  return (
    <div className="stack">
      <section className="card">
        <div className="card-title">Today</div>
        {nothingToDo ? (
          <>
            <h2 style={{ marginBottom: 4 }}>Nothing due</h2>
            <p className="dim">
              Everything you have learned is still holding. Come back tomorrow — reviewing
              early costs you the spacing benefit and buys nothing.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: 4 }}>
              {f.total} {f.total === 1 ? 'item' : 'items'} · about {f.estimatedMinutes} min
            </h2>
            <p className="dim small">
              {f.due > 0 && (
                <>
                  {Math.min(f.due, cfg.targetItems - f.newAvailable)} to review
                  {f.due > cfg.targetItems - f.newAvailable && (
                    <> (of {f.due} due — the rest carry to tomorrow)</>
                  )}
                </>
              )}
              {f.due > 0 && f.newAvailable > 0 && ' · '}
              {f.newAvailable > 0 && <>{f.newAvailable} new</>}
              {f.warmup > 0 && <> · opens with a {f.warmup}-question check</>}
            </p>
          </>
        )}

        {!nothingToDo && (
          <div className="footer-actions" style={{ position: 'static', background: 'none' }}>
            <button type="button" className="btn-primary" onClick={onStart}>
              Start
            </button>
            {f.due > 0 && (
              <button type="button" className="btn-ghost" onClick={onStartMinimal}>
                Short version — just the most urgent {Math.min(6, f.due)}
              </button>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-title">What you can say without looking</div>
        <div className="stat-grid">
          <div className="stat">
            <b>{producible}</b>
            <span>produced from scratch</span>
          </div>
          <div className="stat">
            <b>{introduced}</b>
            <span>met so far</span>
          </div>
          <div className="stat">
            <b>{totalCards}</b>
            <span>in the course</span>
          </div>
        </div>
        <p className="small dim" style={{ marginTop: 12, marginBottom: 0 }}>
          “Produced” means you typed or said it with nothing but the English prompt — not
          that you recognised it in a list.
        </p>
      </section>

      {active.length > 0 && (
        <section className="card">
          <div className="card-title">What that adds up to</div>
          <ul className="list-reset divide">
            {active.map((u) => (
              <li key={u.unitId}>
                <div className="progress-line">
                  <strong>{u.canDo}</strong>
                  <span className="progress-value">{Math.round(u.coverage * 100)}%</span>
                </div>
                <Meter value={u.coverage} thin />
                <div className="small dim" style={{ marginTop: 4 }}>
                  Unit {u.unitId.replace('u', '')} · {u.produced} of {u.total} solid
                </div>
              </li>
            ))}
          </ul>
          <p className="small dim" style={{ marginTop: 14, marginBottom: 0 }}>
            The percentage is your predicted recall right now across the unit, not how much
            you have clicked through. It decays between sessions, which is the point.
          </p>
        </section>
      )}

      {introduced === 0 && (
        <section className="card flat">
          <div className="card-title">Before you start</div>
          <p className="small">
            Unit 1 opens with the phrases that keep a conversation alive —{' '}
            <em>no entiendo</em>, <em>más despacio, por favor</em>, <em>¿cómo se dice…?</em> —
            before it teaches you a single colour or animal. A real conversation rarely
            fails for lack of vocabulary. It fails because someone answered at full speed
            and you had no way to slow them down.
          </p>
        </section>
      )}
    </div>
  );
}
