import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { getUnit } from './content';
import { Home } from './components/Home';
import { Progress } from './components/Progress';
import { Reference } from './components/Reference';
import { Session, type SessionSummary } from './components/Session';
import { SettingsView } from './components/SettingsView';
import { Meter } from './components/ui';
import {
  DEFAULT_SESSION_CONFIG,
  type SessionConfig,
  type SessionItem,
  buildSession,
  unitProgress,
} from './session/builder';
import { recognitionSupported } from './speech/asr';
import { primeVoices, speechSupported } from './speech/tts';
import { currentRetrievability } from './srs/fsrs';
import { clearSessionLog, init, useApp } from './store/state';

type Tab = 'practice' | 'progress' | 'reference' | 'settings';

type Screen =
  | { view: 'tabs' }
  | { view: 'session'; items: SessionItem[] }
  | { view: 'complete'; summary: SessionSummary };

export default function App() {
  const state = useApp();
  const [tab, setTab] = useState<Tab>('practice');
  const [screen, setScreen] = useState<Screen>({ view: 'tabs' });
  const [now, setNow] = useState(() => Date.now());
  const [voiceReady, setVoiceReady] = useState(false);

  useEffect(() => {
    void init();
  }, []);

  // Voices load asynchronously and the learner's pinned choice arrives with the
  // settings, so this waits for both rather than resolving a voice at boot.
  useEffect(() => {
    if (!state.loaded) return;
    void primeVoices(state.settings.voiceURI).then(setVoiceReady);
  }, [state.loaded, state.settings.voiceURI]);

  // Apply reading preferences to the document rather than threading them through
  // every component.
  useEffect(() => {
    document.documentElement.style.setProperty('--scale', String(state.settings.textScale));
    if (state.settings.theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', state.settings.theme);
    }
  }, [state.settings.textScale, state.settings.theme]);

  const cfg: SessionConfig = useMemo(
    () => ({
      ...DEFAULT_SESSION_CONFIG,
      dailyNewCap: state.settings.dailyNewCap,
      targetItems: state.settings.targetItems,
      now,
      // The ladder only offers a spoken prompt when the device can hear one and the
      // learner has asked for it. Everything degrades to typing otherwise.
      caps: {
        canListen: speechSupported() && voiceReady,
        canSpeak: state.settings.micEnabled && recognitionSupported(),
      },
      seed: Math.floor(now / 60_000),
    }),
    [state.settings.dailyNewCap, state.settings.targetItems, state.settings.micEnabled, now, voiceReady],
  );

  const start = useCallback(
    (minimal: boolean) => {
      const fresh = Date.now();
      setNow(fresh);
      clearSessionLog();
      const items = buildSession(state.states, { ...cfg, now: fresh, minimal });
      if (items.length > 0) setScreen({ view: 'session', items });
    },
    [state.states, cfg],
  );

  const finish = useCallback((summary: SessionSummary) => {
    setNow(Date.now());
    setScreen({ view: 'complete', summary });
  }, []);

  const backToTabs = useCallback(() => {
    setNow(Date.now());
    setScreen({ view: 'tabs' });
  }, []);

  if (!state.loaded) {
    return (
      <div className="app">
        <div className="empty">
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (screen.view === 'session') {
    return (
      <div className="app">
        <Session
          items={screen.items}
          settings={state.settings}
          onFinish={finish}
          onQuit={backToTabs}
        />
      </div>
    );
  }

  if (screen.view === 'complete') {
    return (
      <div className="app">
        <Complete summary={screen.summary} onDone={backToTabs} states={state.states} now={now} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          Hablo <small>Español</small>
        </div>
      </header>

      {tab === 'practice' && (
        <Home
          state={state}
          cfg={cfg}
          onStart={() => start(false)}
          onStartMinimal={() => start(true)}
        />
      )}
      {tab === 'progress' && <Progress state={state} now={now} />}
      {tab === 'reference' && <Reference settings={state.settings} />}
      {tab === 'settings' && <SettingsView settings={state.settings} />}

      <nav className="bottom-nav" role="tablist" aria-label="Sections">
        {NAV.map(({ id, label, icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            aria-label={label}
            onClick={() => setTab(id)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const NAV: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: 'practice',
    label: 'Today',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19v14H6.5A2.5 2.5 0 0 0 4 20.5z" {...strokeProps} />
        <path d="M9 9h6M9 13h4" {...strokeProps} />
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19h16" {...strokeProps} />
        <path d="M7 19v-6M12 19V7M17 19v-9" {...strokeProps} />
      </svg>
    ),
  },
  {
    id: 'reference',
    label: 'Guide',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20 17V4.6a.6.6 0 0 0-.7-.6C17.6 4.3 15 5 13 6.4v13C15 18 17.7 17.2 20 17Z"
          {...strokeProps}
        />
        <path
          d="M4 17V4.6a.6.6 0 0 1 .7-.6C6.4 4.3 9 5 11 6.4v13C9 18 6.3 17.2 4 17Z"
          {...strokeProps}
        />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2" {...strokeProps} />
        <path
          d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6"
          {...strokeProps}
        />
      </svg>
    ),
  },
];

/**
 * End of session.
 *
 * Reports the can-do statement for the units just practised rather than a score.
 * "You are 61% of the way to ordering in a restaurant" is a fact about your memory;
 * "you earned 40 XP" is a fact about the app.
 */
function Complete({
  summary,
  states,
  now,
  onDone,
}: {
  summary: SessionSummary;
  states: Parameters<typeof unitProgress>[0];
  now: number;
  onDone: () => void;
}) {
  const progress = useMemo(
    () => unitProgress(states, now, currentRetrievability),
    [states, now],
  );
  const touched = progress.filter((u) => summary.unitIds.includes(u.unitId));
  const accuracy = summary.answered === 0 ? 0 : Math.round((summary.correct / summary.answered) * 100);

  return (
    <div className="stack">
      <section className="card">
        <h2>Session done</h2>
        <div className="stat-grid" style={{ marginTop: 12 }}>
          <div className="stat">
            <b>{summary.answered}</b>
            <span>answered</span>
          </div>
          <div className="stat">
            <b>{accuracy}%</b>
            <span>right first time</span>
          </div>
          <div className="stat">
            <b>{summary.newLearned}</b>
            <span>new items met</span>
          </div>
        </div>
        {accuracy >= 95 && summary.answered >= 8 && (
          <p className="small dim" style={{ marginTop: 12, marginBottom: 0 }}>
            Nearly everything right — which usually means the intervals are shorter than
            they need to be. They will stretch on their own over the next few sessions.
          </p>
        )}
        {accuracy < 60 && summary.answered >= 8 && (
          <p className="small dim" style={{ marginTop: 12, marginBottom: 0 }}>
            A hard one. Missed cards come back sooner now, so this evens out — it does not
            need fixing.
          </p>
        )}
      </section>

      {touched.length > 0 && (
        <section className="card">
          <div className="card-title">Where that leaves you</div>
          <ul className="list-reset divide">
            {touched.map((u) => (
              <li key={u.unitId}>
                <div className="progress-line">
                  <strong>{u.canDo}</strong>
                  <span className="progress-value">{Math.round(u.coverage * 100)}%</span>
                </div>
                <Meter value={u.coverage} thin />
                <div className="small dim" style={{ marginTop: 4 }}>
                  {getUnit(u.unitId)?.scenario}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card flat">
        <p className="small" style={{ marginBottom: 0 }}>
          Come back tomorrow rather than pushing on now. Consolidation happens between
          sessions — and overnight in particular — which is why two ten-minute sessions on
          two days beat one twenty-minute session today.
        </p>
      </section>

      <div className="spacer" />
      <div className="footer-actions">
        <button type="button" className="btn-primary" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
