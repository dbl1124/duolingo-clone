import { lifelines, units } from '../content';
import type { Settings } from '../store/state';
import { AudioButton, Marked, RichText } from './ui';

/**
 * The reference section.
 *
 * Every grammar note is readable at any time, not gated behind reaching a unit.
 * Adults are self-directing learners — Knowles' first principle — and locking
 * explanations away to preserve a drip-feed treats a 47-year-old like a child who
 * would be confused by knowing what is coming.
 */
export function Reference({ settings }: { settings: Settings }) {
  return (
    <div className="stack">
      <section className="card">
        <div className="card-title">Lifelines</div>
        <p className="small dim">
          The phrases that keep a conversation alive when it gets away from you. Worth
          knowing cold before anything else.
        </p>
        <ul className="list-reset divide" style={{ marginTop: 12 }}>
          {lifelines().map((item) => (
            <li key={item.id}>
              <div className="row">
                <div>
                  <div className="answer-es">{item.es}</div>
                  <div className="gloss">{item.en}</div>
                </div>
                <div className="spacer" />
                <AudioButton text={item.es} rate={settings.audioRate} />
              </div>
              {item.note && (
                <div className="small dim" style={{ marginTop: 6 }}>
                  {item.note}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {units.map((unit) => (
        <section className="card" key={unit.id}>
          <div className="card-title">
            Unit {unit.n} · {unit.title}
          </div>
          <p className="small dim">{unit.canDo}</p>

          {unit.grammar.map((note) => (
            <details className="expander" key={note.id} style={{ marginTop: 12 }}>
              <summary>{note.title}</summary>
              <div className="stack" style={{ gap: 12, marginTop: 10 }}>
                <div className="note">
                  <RichText>{note.summary}</RichText>
                </div>

                {note.body.map((para, i) => (
                  <p key={i} className="small">
                    <RichText>{para}</RichText>
                  </p>
                ))}

                <div className="card flat">
                  <div className="card-title">Examples</div>
                  <ul className="list-reset" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {note.examples.map((ex, i) => (
                      <li key={i} className="row">
                        <div className="example">
                          <b>
                            <Marked text={ex.es} mark={ex.hl} />
                          </b>
                          <span>{ex.en}</span>
                        </div>
                        <div className="spacer" />
                        <AudioButton text={ex.es} rate={settings.audioRate} />
                      </li>
                    ))}
                  </ul>
                </div>

                {note.hook && (
                  <div className="hook small">
                    <RichText>{note.hook}</RichText>
                  </div>
                )}

                {note.pitfall && (
                  <div className="feedback close">
                    <div className="verdict">Watch out</div>
                    <div className="small">
                      <RichText>{note.pitfall}</RichText>
                    </div>
                  </div>
                )}
              </div>
            </details>
          ))}

          {unit.pron && (
            <details className="expander" style={{ marginTop: 12 }}>
              <summary>Pronunciation · {unit.pron.title}</summary>
              <div className="stack" style={{ gap: 12, marginTop: 10 }}>
                <div className="note">
                  <RichText>{unit.pron.summary}</RichText>
                </div>
                {unit.pron.body.map((para, i) => (
                  <p key={i} className="small">
                    <RichText>{para}</RichText>
                  </p>
                ))}
                {unit.pron.pairs && (
                  <div className="card flat">
                    <div className="card-title">Minimal pairs — same word but one sound</div>
                    <ul className="list-reset" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {unit.pron.pairs.map((pair) => (
                        <li key={`${pair.a}-${pair.b}`}>
                          <div className="small dim">{pair.contrast}</div>
                          <div className="row" style={{ gap: 10, marginTop: 4 }}>
                            <div className="example" style={{ flex: 1 }}>
                              <b>{pair.a}</b>
                              <span>{pair.aEn}</span>
                            </div>
                            <AudioButton text={pair.a} rate={settings.audioRate} label="" />
                            <div className="example" style={{ flex: 1 }}>
                              <b>{pair.b}</b>
                              <span>{pair.bEn}</span>
                            </div>
                            <AudioButton text={pair.b} rate={settings.audioRate} label="" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </section>
      ))}
    </div>
  );
}
