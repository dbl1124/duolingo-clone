import { useEffect, useMemo, useRef, useState } from 'react';
import { acceptedSpanish, englishOf, spanishOf } from '../content';
import type { Card } from '../content/types';
import { checkAnswer, missedOnlyAccents, type Verdict } from '../lib/answer';
import { choicesFor } from '../lib/distractors';
import { mulberry32 } from '../session/builder';
import { realizePattern } from '../session/generate';
import { listenOnce, recognitionSupported, type ListenError } from '../speech/asr';
import { Grade } from '../srs/fsrs';
import { AudioButton, RichText, SlowAudioButton } from './ui';

export interface ExerciseProps {
  card: Card;
  /** First time this card has been seen, so a pattern can introduce its frame. */
  isNew?: boolean;
  /** Whether a word has been introduced — gates which fillers a pattern may use. */
  isKnown?: (cardId: string) => boolean;
  audioRate: number;
  showHooks: boolean;
  seed: number;
  /** Overrides the prompt heading, so the recap can phrase itself as a quiz. */
  promptLabel?: string;
  onGrade: (grade: Grade, elapsedMs: number) => void;
}

/**
 * Answering quickly is evidence of a stronger memory than answering slowly, so a
 * fast correct answer is graded Easy and earns a longer interval. Three and a half
 * seconds is deliberately tight — it should catch genuine fluency, not a lucky
 * guess typed at speed.
 */
const FAST_MS = 3500;

function gradeFor(verdict: Verdict, elapsedMs: number): Grade {
  if (verdict === 'wrong') return Grade.Again;
  if (verdict === 'close') return Grade.Hard;
  return elapsedMs < FAST_MS ? Grade.Easy : Grade.Good;
}

function useTimer(resetKey: string) {
  const start = useRef(Date.now());
  useEffect(() => {
    start.current = Date.now();
  }, [resetKey]);
  return () => Date.now() - start.current;
}

/** Correct spelling, usage note, and replayable audio — shown after every answer. */
function AnswerDetail({
  card,
  audioRate,
  showHooks,
}: {
  card: Card;
  audioRate: number;
  showHooks: boolean;
}) {
  const es = spanishOf(card);
  const item = card.kind === 'lex' ? card.item : null;
  return (
    <>
      <div className="row">
        <div className="answer-es">{es}</div>
        <div className="spacer" />
        <AudioButton text={es} rate={audioRate} />
      </div>
      <div className="gloss">{englishOf(card)}</div>
      {item?.literal && (
        <div className="gloss">
          Literally: <em>{item.literal}</em>
        </div>
      )}
      {item?.note && <div className="note small">{item.note}</div>}
      {showHooks && item?.hook && (
        <div className="hook small">
          <RichText>{item.hook}</RichText>
        </div>
      )}
    </>
  );
}

function Feedback({
  verdict,
  card,
  audioRate,
  showHooks,
  accentsOnly,
}: {
  verdict: Verdict;
  card: Card;
  audioRate: number;
  showHooks: boolean;
  accentsOnly?: boolean;
}) {
  const heading =
    verdict === 'correct'
      ? accentsOnly
        ? 'Correct — accents shown below'
        : 'Correct'
      : verdict === 'close'
        ? 'Almost — just a typo'
        : 'Not quite';
  return (
    <div className={`feedback ${verdict}`}>
      <div className="verdict">{heading}</div>
      <AnswerDetail card={card} audioRate={audioRate} showHooks={showHooks} />
    </div>
  );
}

/* ---------------------------------------------------------------- teach ---- */

/**
 * First exposure.
 *
 * Two phases in one screen: study, then an immediate recognition check. Testing an
 * item seconds after meeting it feels almost pointless and is not — the testing
 * effect starts on the very first retrieval, and a card that is only ever *read*
 * on introduction arrives at its first real review with nothing built.
 */
export function Teach({ card, audioRate, showHooks, seed, onGrade }: ExerciseProps) {
  const [phase, setPhase] = useState<'study' | 'check' | 'done'>('study');
  const [picked, setPicked] = useState<string | null>(null);
  const elapsed = useTimer(card.id);

  const es = spanishOf(card);
  const en = englishOf(card);
  const item = card.kind === 'lex' ? card.item : null;
  const options = useMemo(() => choicesFor(card, 4, mulberry32(seed)), [card, seed]);

  useEffect(() => {
    setPhase('study');
    setPicked(null);
  }, [card.id]);

  if (phase === 'study') {
    return (
      <div className="stack">
        <div className="card">
          <div className="row">
            <span className="pill new">New</span>
            <div className="spacer" />
            <AudioButton text={es} rate={audioRate} auto />
          </div>
          <div className="prompt-es" style={{ marginTop: 12 }}>
            {es}
          </div>
          <div className="prompt" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
            {en}
          </div>
          {item?.literal && (
            <div className="gloss">
              Literally: <em>{item.literal}</em>
            </div>
          )}
          <div className="row" style={{ marginTop: 12 }}>
            <SlowAudioButton text={es} rate={audioRate} />
          </div>
        </div>

        {item?.note && <div className="note">{item.note}</div>}
        {showHooks && item?.hook && (
          <div className="card flat">
            <div className="card-title">Memory hook</div>
            <div className="hook">
              <RichText>{item.hook}</RichText>
            </div>
          </div>
        )}

        <div className="spacer" />
        <div className="footer-actions">
          <button type="button" className="btn-primary" onClick={() => setPhase('check')}>
            Got it — check me
          </button>
        </div>
      </div>
    );
  }

  const answered = picked !== null;

  return (
    <div className="stack">
      <div className="card">
        <div className="prompt-label">What does this mean?</div>
        <div className="prompt-es">{es}</div>
      </div>

      <div className="choices">
        {options.map((option) => {
          const isRight = option === en;
          const cls = !answered
            ? 'choice'
            : isRight
              ? 'choice right'
              : option === picked
                ? 'choice wrong'
                : 'choice';
          return (
            <button
              key={option}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => setPicked(option)}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <Feedback
          verdict={picked === en ? 'correct' : 'wrong'}
          card={card}
          audioRate={audioRate}
          showHooks={showHooks}
        />
      )}

      <div className="spacer" />
      {answered && (
        <div className="footer-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              // A missed check on first exposure is graded Hard, not Again. You have
              // known this word for eight seconds; failing it is expected, and
              // treating it as a lapse would poison the card's difficulty estimate.
              onGrade(picked === en ? Grade.Good : Grade.Hard, elapsed())
            }
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ recognize ---- */

export function Recognize({ card, audioRate, showHooks, seed, promptLabel, onGrade }: ExerciseProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const elapsed = useTimer(card.id);
  const es = spanishOf(card);
  const en = englishOf(card);
  const options = useMemo(() => choicesFor(card, 4, mulberry32(seed)), [card, seed]);

  useEffect(() => setPicked(null), [card.id]);
  const answered = picked !== null;

  return (
    <div className="stack">
      <div className="card">
        <div className="row">
          <div className="prompt-label">{promptLabel ?? 'What does this mean?'}</div>
          <div className="spacer" />
          <AudioButton text={es} rate={audioRate} />
        </div>
        <div className="prompt-es">{es}</div>
      </div>

      <div className="choices">
        {options.map((option) => {
          const cls = !answered
            ? 'choice'
            : option === en
              ? 'choice right'
              : option === picked
                ? 'choice wrong'
                : 'choice';
          return (
            <button
              key={option}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => setPicked(option)}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <Feedback
          verdict={picked === en ? 'correct' : 'wrong'}
          card={card}
          audioRate={audioRate}
          showHooks={showHooks}
        />
      )}

      <div className="spacer" />
      {answered && (
        <div className="footer-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onGrade(picked === en ? Grade.Good : Grade.Again, elapsed())}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- listen ---- */

/**
 * Audio first, text on demand.
 *
 * The transcript is one tap away rather than absent or automatic. High-frequency
 * hearing loss begins in the forties and blurs exactly the consonants Spanish uses
 * to distinguish words — but revealing the text automatically would turn a
 * listening exercise into a reading one.
 */
export function Listen({ card, audioRate, showHooks, seed, onGrade }: ExerciseProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const elapsed = useTimer(card.id);
  const es = spanishOf(card);
  const en = englishOf(card);
  const options = useMemo(() => choicesFor(card, 4, mulberry32(seed)), [card, seed]);

  useEffect(() => {
    setPicked(null);
    setRevealed(false);
  }, [card.id]);
  const answered = picked !== null;

  return (
    <div className="stack">
      <div className="card">
        <div className="prompt-label">Listen — what did you hear?</div>
        <div className="row" style={{ marginTop: 12, gap: 10 }}>
          <AudioButton text={es} rate={audioRate} label="Play" auto />
          <SlowAudioButton text={es} rate={audioRate} />
        </div>
        {revealed || answered ? (
          <div className="prompt-es" style={{ marginTop: 14 }}>
            {es}
          </div>
        ) : (
          <button
            type="button"
            className="btn-ghost"
            style={{ marginTop: 10 }}
            onClick={() => setRevealed(true)}
          >
            Show the words
          </button>
        )}
      </div>

      <div className="choices">
        {options.map((option) => {
          const cls = !answered
            ? 'choice'
            : option === en
              ? 'choice right'
              : option === picked
                ? 'choice wrong'
                : 'choice';
          return (
            <button
              key={option}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => setPicked(option)}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <Feedback
          verdict={picked === en ? 'correct' : 'wrong'}
          card={card}
          audioRate={audioRate}
          showHooks={showHooks}
        />
      )}

      <div className="spacer" />
      {answered && (
        <div className="footer-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              onGrade(
                picked === en ? (revealed ? Grade.Hard : Grade.Good) : Grade.Again,
                elapsed(),
              )
            }
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- produce ---- */

/** English prompt, type the Spanish. The generation exercise — the point of the app. */
export function Produce({ card, audioRate, showHooks, promptLabel, onGrade }: ExerciseProps) {
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const elapsed = useTimer(card.id);

  const accepted = acceptedSpanish(card);
  const en = englishOf(card);

  useEffect(() => {
    setValue('');
    setVerdict(null);
    inputRef.current?.focus();
  }, [card.id]);

  const submit = () => {
    if (verdict !== null || value.trim() === '') return;
    setVerdict(checkAnswer(value, accepted));
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="prompt-label">{promptLabel ?? 'Say this in Spanish'}</div>
        <div className="prompt">{en}</div>
        {card.kind === 'lex' && card.item.register && card.item.register !== 'neutral' && (
          <span className="pill">{card.item.register}</span>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Type in Spanish"
          disabled={verdict !== null}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label={`Type the Spanish for: ${en}`}
        />
        <div className="small dim" style={{ marginTop: 6 }}>
          Accents optional — <em>como estas</em> counts as correct.
        </div>
      </div>

      {verdict !== null && (
        <Feedback
          verdict={verdict}
          card={card}
          audioRate={audioRate}
          showHooks={showHooks}
          accentsOnly={missedOnlyAccents(value, accepted)}
        />
      )}

      <div className="spacer" />
      <div className="footer-actions">
        {verdict === null ? (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={submit}
              disabled={value.trim() === ''}
            >
              Check
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setValue('');
                setVerdict('wrong');
              }}
            >
              I don't know — show me
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onGrade(gradeFor(verdict, elapsed()), elapsed())}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- cloze ---- */

/** A sentence with a hole in it. Tests grammar in context rather than in isolation. */
export function Cloze({ card, audioRate, showHooks, onGrade }: ExerciseProps) {
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const elapsed = useTimer(card.id);

  if (card.kind !== 'sentence' || !card.sentence.cloze) {
    return <Produce card={card} audioRate={audioRate} showHooks={showHooks} seed={0} onGrade={onGrade} />;
  }

  const { es, en, cloze } = card.sentence;
  const at = es.indexOf(cloze);
  const before = es.slice(0, at);
  const after = es.slice(at + cloze.length);

  const submit = () => {
    if (verdict !== null || value.trim() === '') return;
    setVerdict(checkAnswer(value, [cloze]));
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="prompt-label">Fill the gap</div>
        <div className="prompt-es" style={{ marginTop: 8 }}>
          {before}
          <span className="cloze-blank">{verdict !== null ? cloze : ' '}</span>
          {after}
        </div>
        <div className="gloss" style={{ marginTop: 8 }}>
          {en}
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Type the missing words"
        disabled={verdict !== null}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="Type the missing words"
      />

      {verdict !== null && (
        <div className={`feedback ${verdict}`}>
          <div className="verdict">
            {verdict === 'correct' ? 'Correct' : verdict === 'close' ? 'Almost — just a typo' : 'Not quite'}
          </div>
          <div className="row">
            <div className="answer-es">{es}</div>
            <div className="spacer" />
            <AudioButton text={es} rate={audioRate} />
          </div>
          <div className="gloss">{en}</div>
        </div>
      )}

      <div className="spacer" />
      <div className="footer-actions">
        {verdict === null ? (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={submit}
              disabled={value.trim() === ''}
            >
              Check
            </button>
            <button type="button" className="btn-ghost" onClick={() => setVerdict('wrong')}>
              I don't know — show me
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onGrade(gradeFor(verdict, elapsed()), elapsed())}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- speak ---- */

type SpeakPhase =
  | { kind: 'ready' }
  | { kind: 'listening' }
  | { kind: 'result'; transcript: string; score: number }
  | { kind: 'error'; error: ListenError };

export function Speak({ card, audioRate, showHooks, onGrade }: ExerciseProps) {
  const [phase, setPhase] = useState<SpeakPhase>({ kind: 'ready' });
  const elapsed = useTimer(card.id);
  const es = spanishOf(card);
  const en = englishOf(card);

  useEffect(() => setPhase({ kind: 'ready' }), [card.id]);

  const start = () => {
    setPhase({ kind: 'listening' });
    listenOnce(
      es,
      (r) => setPhase({ kind: 'result', transcript: r.transcript, score: r.score }),
      (error) => setPhase({ kind: 'error', error }),
    );
  };

  if (!recognitionSupported()) {
    return <Produce card={card} audioRate={audioRate} showHooks={showHooks} seed={0} onGrade={onGrade} />;
  }

  const errorMessage: Record<ListenError, string> = {
    unsupported: 'Speech recognition is not available in this browser.',
    'no-permission': 'Microphone access was blocked. You can still grade yourself below.',
    'no-speech': "I didn't catch anything. Try again, a little closer to the mic.",
    failed: 'The microphone had a problem. You can still grade yourself below.',
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="prompt-label">Say this out loud</div>
        <div className="prompt">{en}</div>
      </div>

      {phase.kind === 'result' && (
        <div className={`feedback ${phase.score >= 82 ? 'correct' : phase.score >= 60 ? 'close' : 'wrong'}`}>
          <div className="verdict">
            {phase.score >= 82
              ? 'Clear — that would be understood'
              : phase.score >= 60
                ? 'Close enough to understand'
                : "That didn't come through clearly"}
          </div>
          <div className="gloss">I heard: “{phase.transcript}”</div>
          <div className="row" style={{ marginTop: 8 }}>
            <div className="answer-es">{es}</div>
            <div className="spacer" />
            <AudioButton text={es} rate={audioRate} label="Model" />
          </div>
        </div>
      )}

      {phase.kind === 'error' && (
        <div className="note">
          {errorMessage[phase.error]}
          <div className="row" style={{ marginTop: 10 }}>
            <div className="answer-es">{es}</div>
            <div className="spacer" />
            <AudioButton text={es} rate={audioRate} label="Model" />
          </div>
        </div>
      )}

      <div className="spacer" />
      <div className="footer-actions">
        {phase.kind === 'ready' && (
          <>
            <button type="button" className="btn-primary" onClick={start}>
              🎤 Start recording
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onGrade(Grade.Again, elapsed())}
            >
              Skip — I can't speak right now
            </button>
          </>
        )}

        {phase.kind === 'listening' && (
          <button type="button" className="btn-primary" disabled>
            Listening…
          </button>
        )}

        {(phase.kind === 'result' || phase.kind === 'error') && (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                onGrade(
                  phase.kind === 'result'
                    ? phase.score >= 82
                      ? Grade.Good
                      : phase.score >= 60
                        ? Grade.Hard
                        : Grade.Again
                    : Grade.Hard,
                  elapsed(),
                )
              }
            >
              Continue
            </button>
            <div className="btn-row">
              <button type="button" className="btn-secondary" onClick={start}>
                Try again
              </button>
              {/*
                The override matters. Browser speech recognition is a transcriber
                tuned for native speakers, and it mis-hears good learner Spanish
                often enough that treating it as an examiner would mean marking
                correct answers wrong. The learner is the better judge.
              */}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onGrade(Grade.Good, elapsed())}
              >
                I said it right
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


/* ---------------------------------------------------------------- build ---- */

/**
 * Build a sentence you have never seen.
 *
 * The exercise the rest of the app was missing. Everywhere else the answer exists
 * somewhere to be recalled; here it is generated from a frame plus words the
 * learner already knows, so the only route to it is construction. Getting it right
 * is evidence of the grammar, not of the memory.
 *
 * The frame is named above the prompt on purpose. This is not a puzzle about
 * *which* rule applies — the rules were taught explicitly, and hiding which one is
 * in play would turn a grammar exercise into a guessing game.
 */
export function Build({ card, audioRate, showHooks, seed, isNew, isKnown, onGrade }: ExerciseProps) {
  const [intro, setIntro] = useState(false);
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const elapsed = useTimer(card.id);

  const known = isKnown ?? (() => true);
  const built = useMemo(
    () =>
      card.kind === 'pattern' ? realizePattern(card.pattern, known, mulberry32(seed)) : null,
    // `known` is derived from the learner's whole state; re-deriving the sentence
    // on every keystroke would change the question mid-answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card.id, seed],
  );

  useEffect(() => {
    setIntro(!!isNew);
    setValue('');
    setVerdict(null);
    if (!isNew) inputRef.current?.focus();
  }, [card.id, isNew]);

  // A pattern that cannot currently generate — every filler slot empty — would be
  // a dead end mid-session, so it degrades to the ordinary produce exercise.
  if (card.kind !== 'pattern' || !built) {
    return <Produce card={card} audioRate={audioRate} showHooks={showHooks} seed={seed} onGrade={onGrade} />;
  }

  if (intro) {
    return (
      <div className="stack">
        <div className="card">
          <div className="row">
            <span className="pill new">New pattern</span>
          </div>
          <h2 style={{ marginTop: 12, marginBottom: 6 }}>{card.pattern.title}</h2>
          <div className="note">
            <RichText>{card.pattern.example}</RichText>
          </div>
          <p className="small dim" style={{ marginTop: 12, marginBottom: 0 }}>
            From here on this one gives you a different sentence every time, built from
            words you already know. There is nothing to memorise — you assemble it.
          </p>
        </div>
        <div className="spacer" />
        <div className="footer-actions">
          <button type="button" className="btn-primary" onClick={() => setIntro(false)}>
            Try one
          </button>
        </div>
      </div>
    );
  }

  const accepted = [built.es, ...built.esAlt];
  const submit = () => {
    if (verdict !== null || value.trim() === '') return;
    setVerdict(checkAnswer(value, accepted));
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="prompt-label">Build this sentence</div>
        <div className="prompt">{built.en}</div>
        <div className="frame-name">{card.pattern.title}</div>
      </div>

      <div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Build it in Spanish"
          disabled={verdict !== null}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label={`Build the Spanish for: ${built.en}`}
        />
        <div className="small dim" style={{ marginTop: 6 }}>
          You have not seen this exact sentence — put it together from the pattern.
        </div>
      </div>

      {verdict !== null && (
        <div className={`feedback ${verdict}`}>
          <div className="verdict">
            {verdict === 'correct'
              ? 'Correct — you built that'
              : verdict === 'close'
                ? 'Almost — just a typo'
                : 'Not quite'}
          </div>
          <div className="row">
            <div className="answer-es">{built.es}</div>
            <div className="spacer" />
            <AudioButton text={built.es} rate={audioRate} />
          </div>
          <div className="gloss">{built.en}</div>
          {showHooks && (
            <div className="hook small" style={{ marginTop: 8 }}>
              <RichText>{card.pattern.example}</RichText>
            </div>
          )}
        </div>
      )}

      <div className="spacer" />
      <div className="footer-actions">
        {verdict === null ? (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={submit}
              disabled={value.trim() === ''}
            >
              Check
            </button>
            <button type="button" className="btn-ghost" onClick={() => setVerdict('wrong')}>
              I don't know — show me
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onGrade(gradeFor(verdict, elapsed()), elapsed())}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
