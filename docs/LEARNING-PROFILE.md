# Learner profile and the design decisions that follow from it

This app is built for one person. Every default in it traces back to something in
this document, and this file exists so those decisions can be revisited when the
learner changes rather than rediscovered by argument.

## The profile

| | |
|---|---|
| **Language** | Spanish — Mexican / neutral Latin American |
| **Starting level** | Absolute beginner |
| **Age** | 47 |
| **Goals** | Talk with real people · travel confidently · keep the mind sharp |
| **Time** | 10 minutes a day, realistically |
| **Device** | Phone, mostly |
| **Grammar** | *Deferred to the app author — see the decision below* |
| **Speaking** | Yes, out loud, with mic scoring |
| **Difficulty** | Challenging but supported |
| **Motivation** | Visible progress toward speaking — explicitly not streaks |
| **Reading/audio** | Large text by default, slower audio by default |
| **Prior experience** | None seriously |

## What the research actually supports

### Learning styles are not the right frame

The visual/auditory/kinesthetic model (VARK) is the most widely believed idea in
education and among the least supported. People reliably *report* a preference,
but the claim that matters is the **meshing hypothesis** — that matching
instruction to a stated preference improves outcomes — and it does not survive
controlled testing. Pashler, McDaniel, Rohrer and Bjork's 2008 review found no
credible supporting evidence; Rogowsky and colleagues replicated the null result
in 2015 and again longitudinally in 2020.

So the app is not organised around a style. It is organised around techniques that
work regardless of preference.

### What does move retention

Drawn from Dunlosky et al. (2013), which rated learning techniques by evidence
strength, and from Bjork's work on desirable difficulties.

| Technique | Strength | Where it appears in the app |
|---|---|---|
| Retrieval practice | High | Every screen demands an answer; nothing is presented for passive reading |
| Spaced repetition | High | FSRS-5 scheduler (`src/srs/fsrs.ts`) |
| Generation effect | High | Typed and spoken production, not tile-tapping (`src/session/ladder.ts`) |
| Interleaving | Moderate–high | Round-robin across units within a session (`interleaveByUnit`) |
| Elaboration | Moderate | Etymology and cognate hooks on teach screens |
| Dual coding | Moderate | Audio paired with text on every item |
| Rereading, highlighting | Low | Deliberately absent |

### Language-specific findings

- **Frequency dominates early returns.** The top 1,000 words cover roughly 80% of
  everyday spoken discourse. Content is ordered by usefulness, not by theme.
- **Chunks over isolated words.** Fluency runs on formulaic sequences
  (*¿me puedes ayudar?*), not word-by-word assembly. Phrases are first-class items
  in the content model, never decomposed.
- **Input plus output plus noticing.** Krashen's comprehensible input is necessary
  but insufficient; Swain's output hypothesis and Schmidt's noticing hypothesis
  say the learner must produce, and must see the gap between what they said and
  what was correct. Hence: production exercises with the correct form always shown
  afterwards.

### Age 47 specifically

The "children learn languages better" belief is true in a narrow way and false in
the ways that matter here.

**Genuinely harder after ~40:** phonological working memory, discriminating sound
contrasts absent from English, encoding speed, high-frequency hearing (the
consonants Spanish leans on), and near vision.

**Better than a child's:** metalinguistic awareness, crystallized vocabulary and
analogical reasoning, self-regulation, and knowing why you are doing this.
Adults out-learn children in the first year; children win long-term mainly on
accent.

## The decisions that follow

### Grammar: explicit rule first, plus etymology

The learner delegated this decision. It was made deliberately:

1. **Explicit instruction outperforms implicit for adults.** Norris and Ortega's
   meta-analysis found a large advantage (d ≈ 1.13). "Guess the rule from
   examples" is optimised for children who cannot apply a stated rule; it wastes
   the single biggest advantage an adult has.
2. **Cognates are free leverage.** Spanish and English share thousands of Latin
   roots, and a 47-year-old already owns a large English vocabulary. Teaching that
   *-dad* maps to *-ty* hands over *ciudad, verdad, libertad, universidad* at once.

Constrained by the ten-minute budget: rule summaries are capped short (enforced by
a test), with etymology in an expandable section rather than a lecture.

### No streaks

The learner chose progress-toward-speaking over streaks, and the research agrees.
Streak mechanics reliably produce the behaviour they measure rather than the
behaviour they proxy for — a rushed session to protect a number feeds the
scheduler false grades, which is worse than a missed day. Knowles' andragogy work
also holds that adults are task-centred rather than reward-driven.

What is shown instead: a can-do statement per unit, a count of items producible
from scratch, and a practice calendar with no penalty attached.

### Conversation lifelines in Unit 1

Unit 1 teaches *no entiendo*, *más despacio por favor*, and *¿cómo se dice…?*
before it teaches a single colour or animal. Real conversations rarely fail for
lack of vocabulary; they fail when someone answers at native speed and the learner
has no way to slow them down.

### Accessibility defaults

- Base text 18px at 1.15× scale, adjustable to 1.6×; body contrast above 7:1
  (WCAG AAA) in both themes
- Audio at 0.8× by default, with a slower replay always available
- Transcripts available on demand in listening exercises, never forced
- 48px minimum touch targets; primary action at the bottom, in thumb reach

### Ten minutes, honestly

- ~18 prompts per session, six new items a day
- **Reviews always win.** If the backlog fills the session, no new material is
  introduced. This is the rule that stops a missed week from compounding into an
  unusable pile — the failure mode that kills most spaced-repetition decks.
- A "short version" path exists for bad days: the six most urgent reviews, nothing
  new

## What would change these decisions

- **More time per day** → raise `dailyNewCap` and `targetItems` in Settings; the
  builder adapts without code changes.
- **Reaching conversational fluency** → the ladder currently tops out at sentence
  production. Free-form conversation practice would be the next rung.
- **Accent becoming a priority** → the minimal-pair content exists but is
  reference-only; it could become a scheduled exercise type.
- **A second learner** → the store is single-profile by design. Nothing prevents
  keying it, but nothing supports it today.

## References

- Pashler, McDaniel, Rohrer & Bjork (2008). *Learning Styles: Concepts and Evidence.* Psychological Science in the Public Interest.
- Dunlosky, Rawson, Marsh, Nathan & Willingham (2013). *Improving Students' Learning With Effective Learning Techniques.* PSPI.
- Roediger & Karpicke (2006). *Test-Enhanced Learning.* Psychological Science.
- Bjork & Bjork (2011). *Making Things Hard on Yourself, But in a Good Way.*
- Cepeda, Pashler, Vul, Wixted & Rohrer (2006). *Distributed Practice in Verbal Recall Tasks.* Psychological Bulletin.
- Norris & Ortega (2000). *Effectiveness of L2 Instruction: A Research Synthesis and Quantitative Meta-Analysis.* Language Learning.
- Swain (1985). *Communicative Competence: Some Roles of Comprehensible Input and Comprehensible Output.*
- Schmidt (1990). *The Role of Consciousness in Second Language Learning.* Applied Linguistics.
- Knowles (1984). *Andragogy in Action.*
- Rogowsky, Calhoun & Tallal (2015, 2020). *Matching Learning Style to Instructional Method.* Journal of Educational Psychology / Frontiers in Psychology.
- FSRS algorithm: <https://github.com/open-spaced-repetition/fsrs4anki>
