# Copy: what goes on screen

Text in a trailer is read in two seconds by someone scrolling. It has to land instantly. The rules below exist because every default an LLM reaches for (long sentences, superlatives, triplets, hedges) fails in that window.

## Rules

1. **Short.** Headline ≤ 6 words. Supporting line ≤ 10 words. One idea per slide. If you need two sentences, you need two slides.
2. **Concrete.** Use the product's own nouns: the button label, the field name, the SDK method, the CLI flag. "Click Rotate." beats "Rotate credentials with ease."
3. **Imperative or declarative, present tense.** "Deploy from any branch." "Rows sync in 40 ms." Not "You can now deploy from any branch, which lets you..."
4. **Numbers over adjectives.** "12 lines" beats "much less code". If there is no number, find the noun: "No cron." "One config file."
5. **Big.** Nothing under 28px on a 1080p frame. Headlines 72-120px. If text does not fit, cut words, do not shrink the font.
6. **No subtitles.** Never a caption bar at the bottom narrating what the footage shows. Text is a slide or a label that is part of the composition (`layouts.md`). If the footage needs a caption to be understood, the footage is wrong.
7. **Plain English words.** A developer should read it the way they would read a good commit message.

## Banned

Words: unlock, seamless(ly), effortless(ly), revolutionize, revolutionary, elevate, empower, game-changer, supercharge, leverage, cutting-edge, world-class, next-level, robust, powerful (as a standalone adjective), delight, journey, experience (as a noun for the product), "the future of", "reimagined", "like never before", "say goodbye to", "say hello to".

Structures: "It's not X, it's Y." "No X. No Y. Just Z." Three-item lists for rhythm ("Fast. Simple. Secure."). Rhetorical questions ("Tired of...?", "What if...?"). "In today's fast-paced world." Em-dash chains. A closing summary line that restates the video. Exclamation marks.

## Good vs bad

| Bad | Good |
|---|---|
| Unlock the power of real-time collaboration | Rows update live. No refresh. |
| Seamlessly manage your API keys with confidence | Rotate a key. Old one keeps working for 24h. |
| Effortless deployments, reimagined | Push to main. It's live. |
| Say goodbye to manual configuration! | Zero config. |
| Fast. Simple. Secure. | Signed URLs in one call. |
| Experience next-level database performance | 2M rows. 38 ms. |
| What if backups just worked? | Backups run nightly. Restore in one click. |

## Slide text patterns that work

- **The verb line.** "Click Rotate." Pairs with footage of exactly that.
- **The noun line.** "Key rotation" as a reveal title. Set in the display font, nothing else on screen.
- **The number line.** "4 steps" → "1 click". Two slides or a split.
- **The constraint line.** "No cron. No worker. No queue." Only when each item is literally true and the feature's point is removing them. Use at most once per video, and never as the closing line.
- **The location line.** "Settings → API keys → Rotate". Breadcrumb set in mono, tells people where to find it.
- **The availability line.** "Available now. All plans." or "Cloud, Pro and up. Self-hosted 2.8+." Facts the viewer will ask about next.

## Labels on footage

A label is 1-4 words in a small card anchored to a corner or next to the cursor. It names the step ("Create key", "Scopes", "Rotate"). Labels are not sentences and never explain; the footage explains. Use the Console badge style from `design-tokens.md`: 1px border, 6px radius, 28-32px text, muted background.

## Voice check before rendering

Read every line out loud. If it sounds like a landing page, rewrite it. If it sounds like something you would say to a colleague while showing them the feature, keep it.
