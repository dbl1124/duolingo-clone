# Hablo

A Spanish learning app for one specific person: an absolute beginner, 47, ten
minutes a day on a phone, learning in order to hold real conversations and travel.

It is a Duolingo-shaped app that disagrees with Duolingo about several things.
Those disagreements are the point, and each one is argued from evidence in
[`docs/LEARNING-PROFILE.md`](docs/LEARNING-PROFILE.md).

## What's different, and why

| | Duolingo | Here |
|---|---|---|
| **Exercises** | Mostly recognition — tap tiles from a word bank | Production: type it or say it, from an English prompt alone |
| **Scheduling** | Opaque, streak-driven | FSRS-5, scheduled at the point recall drops to 90% |
| **Grammar** | Infer the rule from examples | Stated explicitly up front, with etymology |
| **Motivation** | Streaks, gems, leagues | A can-do statement per unit and an honest count |
| **Content order** | Thematic | Frequency and usefulness first |
| **First lesson** | Vocabulary | The phrases that rescue a stalled conversation |

### The retrieval ladder

An item is not stuck with one exercise type. It climbs as its memory strength
grows, so the *ask* gets harder while the item stays the same:

```
teach → recognise → produce (typed) → speak (aloud)
```

A lapse steps it back down a rung. That is the "supported" half of
challenging-but-supported — failing a spoken prompt drops you to a typed one
instead of making you fail the same wall repeatedly.

### The rule that matters most

**Reviews always win.** If the review backlog would fill the session, no new
material is introduced that day. Without this rule, a missed week compounds into a
pile that cannot be cleared, which is how most spaced-repetition decks die.

## Get it on your phone

The app is a PWA, so it installs from the browser with no app store involved. It
needs to be served over HTTPS first — the microphone, the service worker, and the
install prompt are all gated on a secure origin.

**One-time setup.** On GitHub: **Settings → Pages → Build and deployment →
Source: GitHub Actions**. That's the only manual step; the workflow in
`.github/workflows/deploy.yml` handles the rest on every push, and publishes to:

```
https://dbl1124.github.io/duolingo-clone/
```

**Install on iPhone** — open that URL in **Safari** (Chrome on iOS can't install
PWAs properly), tap **Share**, then **Add to Home Screen**.

**Install on Android** — open it in Chrome, tap the **⋮** menu, then **Install
app** or **Add to Home screen**.

Installing is not cosmetic. iOS clears site data for *uninstalled* web pages after
about a week of no visits, and a spaced-repetition app that loses its schedule is
a total loss. Installed apps are exempt. Settings also has an export/restore
backup as a second line of defence — worth doing once you have a few weeks in.

## Recorded audio (optional, and worth it)

By default the app speaks through the device's own Spanish voice. On iOS that is
often the low-quality "compact" synthesiser, and Safari does **not** expose every
installed system voice to a web page — a better voice downloaded through
Settings → Accessibility → Spoken Content may simply be unreachable. Recorded
clips sidestep that entirely.

`npm run audio` generates one MP3 per distinct line of Spanish with ElevenLabs.
The whole curriculum is **710 clips, about 8,750 characters** — comfortably
inside a free month's quota.

```bash
npm run audio -- --dry           # what it would generate; no key needed
export ELEVENLABS_API_KEY=...    # your key, read from the environment only
npm run audio -- --limit 10      # try ten first, to hear the voice
npm run audio                    # generate everything missing
```

The key is read from the environment and never written to disk or committed.
Output goes to `public/audio/`, which Vite copies into the build — commit it and
the deploy picks it up.

Notes:

- **Resumable.** Clips already on disk are skipped, so an interrupted run costs
  nothing to restart and adding a card later generates only the new one.
- **Optional at every point.** With no `audio/` directory the app behaves exactly
  as before. Clips are used where they exist and the device voice fills the gaps,
  so the curriculum can grow ahead of the recordings.
- **Keyed by text, not card id.** Repeated lines collapse to one file, and a card
  can be renamed without orphaning its audio. Editing the Spanish of a card
  orphans its old clip; the generator reports orphans rather than deleting them.
- **Pick a voice** with `ELEVENLABS_VOICE_ID`; any Spanish-capable voice in your
  account works with the multilingual model.
- Settings has a **"Save all audio for offline use"** button, since clips
  otherwise cache lazily as they play — fine on wifi, no use on a plane.

## Running it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm test           # 195 unit tests: scheduler, session builder, generator, content
npm run typecheck
npm run smoke      # builds, then drives the real app in Chromium
npm run check      # all three
```

Note that `npm run dev` over your LAN is plain HTTP, so the microphone will be
blocked and the app won't offer to install. `localhost` itself is treated as
secure, so a desktop browser is fine for everything except testing the install.

## Layout

```
src/
  content/          the curriculum — 16 units, 641 cards, hand-authored
    types.ts        content model
    units/          unit01…unit16
    patterns.ts     sentence frames that generate new sentences on demand
  srs/fsrs.ts       FSRS-5 scheduler (stability, difficulty, forgetting curve)
  session/
    ladder.ts       which exercise type an item has earned
    generate.ts     realising a pattern into one sentence you have not seen
    builder.ts      what today's session contains, and in what order
  lib/
    answer.ts       answer checking — accent-tolerant, typo-tolerant
    richtext.ts     the **bold** / *italic* subset used in grammar notes
    distractors.ts  plausible wrong answers for multiple choice
  speech/           text-to-speech and mic scoring, both Web Speech API
  store/            IndexedDB persistence, settings, review log
  components/       UI
scripts/
  smoke.mjs         end-to-end browser test
  make-icons.mjs    generates the PNG icons with no image dependency
```

## Notable implementation choices

**Everything is local.** No account, no server, no network calls. Audio comes from
the device's own Spanish voices, which means every card has audio and the app
works on a plane.

**Voices are scored, not taken in listed order.** Phones ship several Spanish
voices of very different quality, and the default is often the old "compact"
formant synthesiser — the robotic one. `src/speech/tts.ts` ranks them by engine
quality first and region second, on the grounds that the gap between a neural
voice and a formant synthesiser dwarfs the gap between Spanish varieties.
Settings lists every installed voice with a preview so the choice can be
overridden, and explains how to download a better one.

**The voice list is watched, not sampled once.** iOS reports voices in more than
one batch: the first `getVoices()` often returns only the built-in compact
voices, and anything downloaded through Settings arrives in a later
`voiceschanged`. Subscribing once and caching the first non-empty answer means a
newly installed voice can never appear, no matter how many times the app is
restarted. The subscription is permanent, the ranking updates live, and Settings
has a Rescan button plus a panel showing the raw list the browser reports — so
"the browser is not exposing it" is distinguishable from "the app did not look
again".

**Sentences are generated, not only memorised.** A third kind of card holds a
grammatical *frame* rather than a fixed line — `ir a` + infinitive, `gustar`
with its backwards agreement, the preterite. Every time one comes up the slots
are filled differently, so the answer cannot be recalled, only constructed.
Eighteen frames currently span about 2,300 sentences against 189 fixed ones, and
a frame only unlocks once at least two of its slots have two or more words the
learner has actually met — otherwise it would be a fixed phrase in disguise.

**Nothing in the generator is derived by rule.** Conjugations are written out and
agreement is explicit, because a generator that guesses at morphology will
eventually teach a wrong form with complete confidence. `generate.test.ts`
expands every sentence every frame can produce — all 2,300 — and checks them
structurally. The two bugs it could not catch, "Hace sol por la noche" and "La
tienda es más rica", were both flawless Spanish describing something false, and
were found by reading the output.

**One card per item, not one per exercise type.** Separate cards for
recognise/produce/speak would triple the daily review load, which a ten-minute
session cannot absorb honestly.

**Accents are optional when typing.** Long-pressing keys mid-sentence measures
thumb dexterity, not Spanish. The accented form is always shown afterwards.

**A typo is graded Hard, not Again.** Marking `gracais` as a failure hands the
scheduler a false signal and drags a known word back to a one-day interval. Edit
distance is Damerau-Levenshtein, so a transposition costs one edit rather than two.

**Mic scoring is advisory.** Browser speech recognition is a transcriber tuned for
native speakers and mis-hears good learner Spanish often enough that treating it
as an examiner would mean marking correct answers wrong. Thresholds are lenient
and there is always an "I said it right" override.

**The review log is kept.** FSRS weights can be re-fitted from a learner's own
history. Without a log that option is permanently closed; it costs a few hundred
bytes a day to keep it open.

## Extending the curriculum

Add a unit under `src/content/units/`, export it from `src/content/index.ts`, and
the scheduler, progress screens, and reference section pick it up with no other
changes. The content test suite enforces the invariants that would otherwise fail
silently at runtime: cloze targets must appear verbatim in their sentence, grammar
highlights must exist in their example, a sentence may not use vocabulary from a
later unit, and no emphasis marker may reach the reader unparsed.

Adding vocabulary also widens the sentence frames for free: the shared filler
pools in `patterns.ts` name the cards each filler needs, so a verb added in a
late unit starts appearing in `ir a` and `tener que` the day the learner meets
it. Units 11-16 pushed `ir a` from 550 generated sentences to 950 without that
pattern being edited.
