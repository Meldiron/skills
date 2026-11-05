# Intake: what you need before you write a single frame

A trailer that misunderstands the feature is worse than no trailer. Spend the first minutes understanding, then confirm the story in one short message before building. Do not start Remotion until the brief below is filled.

## Sources, in order of preference

1. **A PR or branch.** Read the description, the diff, tests, and any docs changes. Tests show the real behaviour and the edge cases the author cared about. Changelog entries and docs pages, if touched, already contain the vocabulary the team uses. Pull out: what a user does, what they see, what they could not do before.
2. **A written explanation from the user.** Ask follow-ups until you can state the pain point in one sentence a developer would nod at.
3. **A docs page or spec.** Fine for the "what", weak on the "why". Ask for the why.

If none of these are present, ask. Do not guess a feature from its name.

## The brief (fill all of it)

```
Feature:           one line, the name users will see
For whom:          the developer or team who feels the pain
Pain today:        what they do now and why it hurts (concrete: steps, time, risk)
What changes:      the one thing the feature does
Proof shot:        the single screen or interaction that makes it obvious it works
Use cases:         2-3 concrete situations, each one sentence
Where it lives:    Console page(s), SDK method(s), CLI command, API route
Prerequisites:     plan, version, flags, data needed to show it
Out of scope:      things we must not imply it does
Tone:              calm / playful / punchy (default: calm and confident)
Length:            default 60s, allowed 45-75s
Delivery:          where it will be posted (X, YouTube, docs page, launch page). Affects aspect ratio and captions
```

## Questions worth asking even when a PR exists

- What did users complain about before this? A support thread, Discord message or GitHub issue gives you the pain-point line nearly verbatim.
- What is the one number that changes? Steps, seconds, lines of code, requests, dollars. Numbers make the celebration beat land.
- Is there a before/after that fits in one screen each?
- Which parts are still rough? Avoid recording them.
- Who should be credited or thanked, if anyone?

## Confirm before building

Send back a short story outline: pain line, feature line, the demo shots in order, the closing line. Five to eight lines total. Wait for a yes, or proceed if the user said to run autonomously. This is where a wrong assumption costs a sentence instead of an afternoon.
