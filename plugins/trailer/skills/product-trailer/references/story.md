# Story: pain, feature, celebration

A trailer is a 60-second argument: this hurt, now it does not, here is proof. Every scene either sets up the pain, shows the feature, or celebrates the result. If a scene does none of those, cut it.

## Beat sheet for 60 seconds (30fps, 1800 frames)

| Time | Frames | Beat | What is on screen | Audio |
|---|---|---|---|---|
| 0.0-2.5s | 0-75 | **Logo sting** | Appwrite mark on brand background, mark animates in, wordmark follows. Frame 45 is the thumbnail | Music starts under, one soft hit when the mark lands |
| 2.5-12s | 75-360 | **Pain** | The old way. Real footage of the tedious path, or a slide stating the pain in ≤8 words. One concrete frustration, not a list | Music low, restrained. Click SFX on each tedious step, slightly too many of them |
| 12-17s | 360-510 | **Reveal** | Feature name, once, big. The largest motion moment of the film, on a beat | Riser into the reveal, the hit lands on the beat, music opens up |
| 17-47s | 510-1410 | **Demo** | 3-5 shots. Each shot: one action, one product reaction, one visible outcome. Footage from the Console or demo app, with a short slide or label between shots | Full music. Whoosh on scene changes, pop/click on UI reactions |
| 47-53s | 1410-1590 | **Payoff** | The number or the before/after. Counter rolls, or a split screen | Music peak, one satisfying hit |
| 53-60s | 1590-1800 | **Outro** | Logo, one line of CTA (where to find it, which plan or version), URL | Music resolves and fades over 2s. Nothing after the music ends |

These are defaults. Shift the boundaries to match the music and the feature. A feature with a visceral pain can afford 12 seconds of pain; a feature that is self-explanatory should get to the demo by second 8.

## Writing the three movements

**Pain.** Show, do not narrate. The strongest pain scenes are footage: the user clicks through four pages to do one thing, or scrolls a wall of config, or waits on a spinner. Speed it up to 2.5x so it feels tedious without being tedious, desaturate it, and give it a glitch flicker at the worst moment. Make sure it cannot be mistaken for the demo: if the new feature also involves a form, record the old way as a full-page flow and the new way inside a popover or panel, or the viewer sees the same screen twice. If footage is impossible, use one slide with one line ("Four steps to rotate a key.") and a muted screenshot. Avoid a bullet list of pains; pick the single one the feature solves best.

**Feature.** Name it once, the way the docs name it, spoken as "Introducing... <name>." with the music drop and the hit on the frame the title lands. Then stop talking and let the product work. Each demo shot has a cause and an effect inside the same shot: the cursor clicks "Enable", the badge flips to green. If the effect is invisible (latency, security), make it visible: a timer, a counter, a diff, a status badge.

**Celebration.** Not confetti. A calm, concrete result: "1 step." "0 config." "Live in every region." A before/after split with the same screen in both halves is the most convincing version. End on the logo and a single instruction for what to do next.

## With narration

If the brief says narrated, each beat gets one spoken line, written in `script.json` as `voice.text`, and the beat's timing stretches to fit the clip (`voice.md`). The beat sheet above still holds; speech fills 25-35 seconds of it, the rest is music and picture. The logo sting and the outro's last two seconds stay silent of voice.

## Choosing the story shape

Pick one shape per trailer, so trailers do not all feel alike:

- **Before / after.** Two halves. Pain footage, then the same task with the feature. Best for workflow features (fewer steps, less config).
- **Problem, then widen.** Start on one developer's pain, reveal the feature, then show three quick different use cases. Best for primitives (a new query type, a new SDK method).
- **Cold open on the result.** Skip the pain scene, open on the feature doing something impressive, then explain in two lines, then demo. Best for visual features (image transforms, realtime, globe maps). Still start with the logo sting.
- **The one number.** The whole film builds to a counter: requests, milliseconds, lines removed. Pain is "it was 400 lines", payoff is "it is 12". Best for DX features.
- **Walkthrough.** Linear, calm, one page at a time. Best for Console features where the UI itself is the story.

## Shot list template

Write it before touching Remotion. Save it as `script.json` in the trailer project (schema in `assets/templates/script.schema.json`):

```
# <Feature> trailer, 60s, 16:9, dark theme, shape: before/after
1. [0-2.5] Logo sting. Mark draws in, wordmark slides in from the mark. Thumbnail frame 45.
2. [2.5-11] Pain, footage: Console → Settings → API keys → Create → scopes list (2x speed). Label bottom-left: "Rotating a key today".
3. [11-16] Reveal, slide "Key rotation" layout: hero-center. Riser + hit.
4. [16-26] Demo 1, footage: click Rotate. Label: "One click."  Pop on badge flip.
5. [26-36] Demo 2, code slide: 6 lines, highlight the new SDK call.
6. [36-46] Demo 3, footage: old key expires, request still succeeds. Timer overlay.
7. [46-52] Payoff, split: "4 steps" vs "1 click". Counter.
8. [52-60] Outro: logo, "Available now on all plans", appwrite.io/docs/...
```

Reading-time floor for any text on screen: words divided by 2.5, plus half a second. Four words need 2.1 seconds. Do not let a slide leave before that.

## When the user has not told you enough

Stop and ask using the brief in `intake.md`. A trailer built on a guessed feature wastes everyone's time, and the person asking usually knows the pain line already; they just have not said it out loud.
