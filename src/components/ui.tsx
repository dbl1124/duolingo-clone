import { useEffect, useRef, useState } from 'react';
import { parseRich } from '../lib/richtext';
import { speak } from '../speech/tts';

/** Play button for Spanish audio. Replayable without limit, by design. */
export function AudioButton({
  text,
  rate,
  label = 'Play',
  auto = false,
}: {
  text: string;
  rate: number;
  label?: string;
  auto?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const played = useRef(false);

  const play = () => {
    setPlaying(true);
    speak(text, { rate, onEnd: () => setPlaying(false) });
  };

  useEffect(() => {
    // Autoplay is best-effort: browsers block audio until the page has been
    // interacted with, and the manual button is always the real path.
    if (auto && !played.current) {
      played.current = true;
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, auto]);

  return (
    <button
      type="button"
      className={`btn-icon${playing ? ' active' : ''}`}
      onClick={play}
      aria-label={`${label}: ${text}`}
    >
      <span aria-hidden="true">{playing ? '🔊' : '🔈'}</span>
      <span className="small">{label}</span>
    </button>
  );
}

/** A slower replay, for when the normal rate went past too fast. */
export function SlowAudioButton({ text, rate }: { text: string; rate: number }) {
  return <AudioButton text={text} rate={Math.max(0.6, rate - 0.2)} label="Slower" />;
}

export function Meter({ value, thin = false }: { value: number; thin?: boolean }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      className={`meter${thin ? ' thin' : ''}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Renders text with one substring highlighted. Falls back cleanly if absent. */
export function Marked({ text, mark }: { text: string; mark?: string }) {
  if (!mark) return <>{text}</>;
  const at = text.indexOf(mark);
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark>{mark}</mark>
      {text.slice(at + mark.length)}
    </>
  );
}

/** Renders the grammar-note markdown subset: **bold** and *italic*. */
export function RichText({ children }: { children: string }) {
  return (
    <>
      {parseRich(children).map((seg, i) =>
        seg.kind === 'bold' ? (
          <strong key={i}>{seg.text}</strong>
        ) : seg.kind === 'italic' ? (
          <em key={i}>{seg.text}</em>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

export function SessionProgress({ total, index }: { total: number; index: number }) {
  return (
    <div className="session-progress" aria-label={`Item ${index + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < index ? 'done' : i === index ? 'current' : ''} />
      ))}
    </div>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}
