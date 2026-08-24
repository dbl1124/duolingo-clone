import { useCallback, useMemo, useState } from 'react';
import { getUnit } from '../content';
import type { SessionItem } from '../session/builder';
import { Grade } from '../srs/fsrs';
import { gradeCard } from '../store/state';
import type { Settings } from '../store/state';
import { Cloze, Listen, Produce, Recognize, Speak, Teach } from './exercises';
import { SessionProgress } from './ui';

export interface SessionSummary {
  answered: number;
  correct: number;
  newLearned: number;
  unitIds: string[];
  /** Recap score, when the session opened with one. */
  warmup: { asked: number; correct: number } | null;
}

/**
 * Runs one sitting.
 *
 * The queue is built once up front and then walked. A card graded Again is pushed
 * back into the queue a few positions later rather than tomorrow — you get another
 * attempt while the correction is still in mind, which is the whole "supported"
 * side of challenging-but-supported. It is requeued at most once per session, so a
 * genuinely stuck item cannot trap the learner in a loop.
 */
export function Session({
  items,
  settings,
  onFinish,
  onQuit,
}: {
  items: SessionItem[];
  settings: Settings;
  onFinish: (summary: SessionSummary) => void;
  onQuit: () => void;
}) {
  const [queue, setQueue] = useState<SessionItem[]>(items);
  const [index, setIndex] = useState(0);
  const [requeued, setRequeued] = useState<Set<string>>(new Set());
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [warmCorrect, setWarmCorrect] = useState(0);
  const [recapStarted, setRecapStarted] = useState(false);

  const current = queue[index];
  const warmupTotal = useMemo(() => items.filter((i) => i.phase === 'warmup').length, [items]);
  const warmupIndex = useMemo(
    () => queue.slice(0, index).filter((i) => i.phase === 'warmup').length,
    [queue, index],
  );
  const newLearned = useMemo(() => items.filter((i) => i.isNew).length, [items]);
  const unitIds = useMemo(() => [...new Set(items.map((i) => i.card.unitId))], [items]);

  const advance = useCallback(
    (item: SessionItem, grade: Grade) => {
      const failed = grade === Grade.Again;
      setAnswered((n) => n + 1);
      if (!failed) setCorrect((n) => n + 1);
      if (item.phase === 'warmup' && !failed) setWarmCorrect((n) => n + 1);

      setQueue((q) => {
        if (!failed || requeued.has(item.card.id)) return q;
        // Slot it three ahead so other material intervenes — an immediate retry is
        // recognition from short-term memory, not retrieval.
        const next = [...q];
        const at = Math.min(next.length, index + 4);
        next.splice(at, 0, item);
        return next;
      });
      if (failed) setRequeued((r) => new Set(r).add(item.card.id));

      setIndex((i) => i + 1);
    },
    [index, requeued],
  );

  const handleGrade = useCallback(
    (grade: Grade, elapsedMs: number) => {
      if (!current) return;
      void gradeCard(current.card.id, grade, current.mode, elapsedMs);
      advance(current, grade);
    },
    [current, advance],
  );

  if (!current) {
    return (
      <div className="stack">
        <div className="card center">
          <h2>Done for today</h2>
          <p className="dim">
            {answered} {answered === 1 ? 'answer' : 'answers'}, {correct} right.
          </p>
        </div>
        <div className="spacer" />
        <div className="footer-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              onFinish({
                answered,
                correct,
                newLearned,
                unitIds,
                warmup: warmupTotal > 0 ? { asked: warmupTotal, correct: warmCorrect } : null,
              })
            }
          >
            See what that unlocked
          </button>
        </div>
      </div>
    );
  }

  // A one-tap intro so the recap reads as a deliberate quiz rather than three
  // stray questions bolted onto the front of the session.
  if (current.phase === 'warmup' && !recapStarted) {
    const recapUnit = getUnit(current.card.unitId);
    return (
      <div className="stack">
        <div className="card">
          <div className="card-title">Before we start</div>
          <h2 style={{ marginBottom: 6 }}>
            Quick check on {recapUnit ? `Unit ${recapUnit.n}` : 'last time'}
          </h2>
          <p className="dim">
            {warmupTotal} {warmupTotal === 1 ? 'question' : 'questions'} on what you covered
            last time, before anything new arrives.
          </p>
          {recapUnit && <div className="note small">{recapUnit.canDo}</div>}
          <p className="small dim" style={{ marginTop: 12, marginBottom: 0 }}>
            Getting one wrong is useful information, not a problem — it goes straight back
            into the schedule.
          </p>
        </div>
        <div className="spacer" />
        <div className="footer-actions">
          <button type="button" className="btn-primary" onClick={() => setRecapStarted(true)}>
            Start the check
          </button>
          <button type="button" className="btn-ghost" onClick={onQuit}>
            Not now
          </button>
        </div>
      </div>
    );
  }

  const unit = getUnit(current.card.unitId);
  const Exercise =
    current.mode === 'teach'
      ? Teach
      : current.mode === 'recognize'
        ? Recognize
        : current.mode === 'listen'
          ? Listen
          : current.mode === 'cloze'
            ? Cloze
            : current.mode === 'speak'
              ? Speak
              : Produce;

  return (
    <div className="stack">
      <div>
        <SessionProgress total={queue.length} index={index} />
        <div className="row small dim session-meta">
          <span className="session-pos">
            {current.phase === 'warmup'
              ? `Quick check · ${warmupIndex + 1} of ${warmupTotal}`
              : `${index + 1} of ${queue.length}`}
          </span>
          <div className="spacer" />
          <span className="session-unit">{unit ? `Unit ${unit.n} · ${unit.title}` : ''}</span>
        </div>
      </div>

      <Exercise
        key={`${current.card.id}:${index}`}
        card={current.card}
        audioRate={settings.audioRate}
        showHooks={settings.showHooks}
        seed={index * 7919 + current.card.id.length}
        promptLabel={
          current.phase === 'warmup'
            ? current.mode === 'produce'
              ? 'How do you say…'
              : 'What does this mean?'
            : undefined
        }
        onGrade={handleGrade}
      />

      <div className="center">
        <button type="button" className="btn-ghost small" onClick={onQuit}>
          Stop here — progress is saved
        </button>
      </div>
    </div>
  );
}
