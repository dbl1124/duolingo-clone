import { useRef, useState } from 'react';
import { recognitionSupported } from '../speech/asr';
import { speak } from '../speech/tts';
import { exportBackup, importBackup, isBackup, resetAll } from '../store/db';
import type { Settings } from '../store/state';
import { init, updateSettings } from '../store/state';

const SAMPLE = 'Disculpe, ¿me da un café, por favor?';

export function SettingsView({ settings }: { settings: Settings }) {
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<Settings>) => void updateSettings(patch);

  const doExport = async () => {
    const backup = await exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hablo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Backup downloaded.');
  };

  const doImport = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBackup(parsed)) {
        setStatus('That file is not a Hablo backup.');
        return;
      }
      const { restored } = await importBackup(parsed);
      await init();
      setStatus(`Restored ${restored} ${restored === 1 ? 'card' : 'cards'}.`);
    } catch {
      setStatus('Could not read that file.');
    }
  };

  return (
    <div className="stack">
      <section className="card">
        <div className="card-title">Reading</div>
        <label htmlFor="scale">Text size</label>
        <input
          id="scale"
          type="range"
          min={0.9}
          max={1.6}
          step={0.05}
          value={settings.textScale}
          onChange={(e) => set({ textScale: Number(e.target.value) })}
        />
        <p className="small dim" style={{ marginBottom: 0 }}>
          Currently {Math.round(settings.textScale * 100)}%. Everything in the app scales
          from this, including the exercise prompts.
        </p>
      </section>

      <section className="card">
        <div className="card-title">Audio</div>
        <label htmlFor="rate">Speaking speed</label>
        <input
          id="rate"
          type="range"
          min={0.6}
          max={1.2}
          step={0.05}
          value={settings.audioRate}
          onChange={(e) => set({ audioRate: Number(e.target.value) })}
        />
        <div className="row" style={{ marginTop: 4 }}>
          <span className="small dim">
            {settings.audioRate < 0.75
              ? 'Slow'
              : settings.audioRate < 0.95
                ? 'Learner pace'
                : 'Native pace'}{' '}
            · {Math.round(settings.audioRate * 100)}%
          </span>
          <div className="spacer" />
          <button
            type="button"
            className="btn-icon"
            onClick={() => speak(SAMPLE, { rate: settings.audioRate })}
          >
            🔈 <span className="small">Test</span>
          </button>
        </div>
        <p className="small dim" style={{ marginTop: 10, marginBottom: 0 }}>
          Starts at 80%. Native Mexican Spanish is fast and drops consonants — work up to
          100% deliberately rather than starting there and guessing.
        </p>
      </section>

      <section className="card">
        <div className="card-title">Practice</div>

        <div className="toggle-row">
          <label htmlFor="mic">Ask me to speak out loud</label>
          <input
            id="mic"
            type="checkbox"
            checked={settings.micEnabled}
            onChange={(e) => set({ micEnabled: e.target.checked })}
          />
        </div>
        {!recognitionSupported() && (
          <p className="small dim">
            This browser has no speech recognition, so spoken prompts will fall back to
            typing. Chrome on Android and Safari on iOS both support it.
          </p>
        )}

        <div className="toggle-row">
          <label htmlFor="hooks">Show word origins and cognates</label>
          <input
            id="hooks"
            type="checkbox"
            checked={settings.showHooks}
            onChange={(e) => set({ showHooks: e.target.checked })}
          />
        </div>

        <label htmlFor="cap" style={{ display: 'block', marginTop: 12 }}>
          New items per day
        </label>
        <input
          id="cap"
          type="range"
          min={2}
          max={15}
          step={1}
          value={settings.dailyNewCap}
          onChange={(e) => set({ dailyNewCap: Number(e.target.value) })}
        />
        <p className="small dim" style={{ marginBottom: 0 }}>
          {settings.dailyNewCap} a day. Raising this raises tomorrow's review load roughly
          in proportion — the ceiling on a beginner is consolidation, not appetite.
        </p>

        <label htmlFor="target" style={{ display: 'block', marginTop: 12 }}>
          Session length
        </label>
        <input
          id="target"
          type="range"
          min={8}
          max={40}
          step={2}
          value={settings.targetItems}
          onChange={(e) => set({ targetItems: Number(e.target.value) })}
        />
        <p className="small dim" style={{ marginBottom: 0 }}>
          About {settings.targetItems} prompts, roughly {Math.round((settings.targetItems * 28) / 60)}{' '}
          minutes.
        </p>
      </section>

      <section className="card">
        <div className="card-title">Appearance</div>
        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          value={settings.theme}
          onChange={(e) => set({ theme: e.target.value as Settings['theme'] })}
          style={{ width: '100%', marginTop: 6 }}
        >
          <option value="system">Match my phone</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </section>

      <section className="card">
        <div className="card-title">Your data</div>
        <p className="small">
          Everything lives on this device — no account, no server. That also means Safari
          can clear it if you use the app from a browser tab and then leave it for a week.
          Adding it to your home screen prevents that, and a backup file is the belt to
          that suspenders.
        </p>
        <div className="btn-row" style={{ marginTop: 12 }}>
          <button type="button" className="btn-secondary" onClick={() => void doExport()}>
            Export backup
          </button>
          <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
            Restore
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void doImport(file);
            e.target.value = '';
          }}
        />
        {status && (
          <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
            {status}
          </p>
        )}

        <details className="expander" style={{ marginTop: 16 }}>
          <summary>Start over</summary>
          <p className="small dim" style={{ marginTop: 8 }}>
            Deletes every card's schedule and your whole review history. There is no undo,
            so export a backup first if there is any doubt.
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (!confirm('Erase all progress? This cannot be undone.')) return;
              void resetAll().then(() => init());
              setStatus('Progress erased.');
            }}
          >
            Erase all progress
          </button>
        </details>
      </section>
    </div>
  );
}
