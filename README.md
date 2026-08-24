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

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm test           # 115 unit tests: scheduler, session builder, content integrity
npm run typecheck
npm run smoke      # builds, then drives the real app in Chromium
npm run check      # all three
```

Add it to your phone's home screen. That is not cosmetic: iOS clears site data for
uninstalled web pages after about a week of no visits, and installed apps are
exempt. Settings also has an export/restore backup as a second line of defence.

## Layout

```
src/
  content/          the curriculum — 10 units, 365 cards, hand-authored
    types.ts        content model
    units/          unit01…unit10
  srs/fsrs.ts       FSRS-5 scheduler (stability, difficulty, forgetting curve)
  session/
    ladder.ts       which exercise type an item has earned
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
the device's own Spanish voices, which means all 365 cards have audio and the app
works on a plane.

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
