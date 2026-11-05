# Transitions and motion

A transition is a sentence connector. "And then" is a cut. "Meanwhile" is a push. "Look closer" is a zoom-through. "Instead" is a wipe. Choose by meaning, then by rhythm. Decoration is what makes trailers look like templates.

## Catalogue

| Transition | Meaning | Duration | Easing | Remotion |
|---|---|---|---|---|
| **Hard cut** | Next step, same thought. The default | 0 | none | Adjacent `Sequence`s |
| **Crossfade** | Time passes, mood shifts | 300-500ms | linear or inOut | `fade()` |
| **Dip to colour** | Chapter break, breath before the reveal | 400-600ms, 150ms hold | in → out | custom: fade to `#19191c` or pink, then from |
| **Push** | Sequential steps, equal weight | 350-500ms | inOut cubic, or spring damping 200 | `slide({direction})` |
| **Slide over** | A panel or sheet enters on top | 300-400ms | out cubic | `slide()` with the exiting scene static (custom) |
| **Wipe** (linear, angled, iris, clock) | Before/after, on/off, old/new | 400-600ms | inOut | `wipe({direction})`, `iris()`, `clockWipe()` |
| **Zoom-through** | Look inside this element | 500-700ms | in cubic, cut at ~90% | custom: scale the exiting scene 1→3 toward the target point, cut to new scene at scale 1.05→1 |
| **Scale + blur** | Depth change, a modal or detail | 300-450ms | out cubic | custom presentation, `filter: blur()` baked small |
| **Mask reveal** | Text or UI revealed along a shape | 400-600ms | out expo | custom: `clip-path: inset()` or `circle()` driven by progress |
| **Match cut** | Same object, new context | 0, but align 1:1 | none | Position the element identically in both scenes |
| **Whip pan** | Energetic jump to another screen | 200-350ms | inOut strong | `slide()` wrapped in `<CameraMotionBlur>` |
| **Split / curtain** | Compare two states | 400-600ms | inOut | custom: two halves translate apart |
| **Morph** | One object changes role | 500-800ms | spring damping 14-20 | Animate the shared element's position/size across the cut |
| **Stagger-in** | A headline then its lines | 300-400ms each, 40-80ms offsets | out cubic | `spring` with `delay` per line |
| **Typewriter** | Terminal, code, prompts | 25-50ms per char | linear | `text.slice(0, Math.floor(frame * cps / fps))` |
| **Counter roll** | A metric that matters | 800-1200ms | out expo | `interpolate` + `Math.round`, tabular numerals |
| **Parallax drift** | Keep a hold alive | 3-6s, 2-5% travel | linear | `translate` by `noise2D` or linear interpolate |
| **Flicker / glitch** | Something is broken (the old way) | 100-250ms | step | Only on pain scenes, at most twice per video, never on brand or CTA |

## Rules of rhythm

- **Three to four distinct transition types per 60 seconds**, counting the hard cut. More and the viewer notices the editing instead of the product.
- **Land cuts on beats.** At 120 BPM a beat is 500ms (15 frames at 30fps). Put scene changes on beat 1 or 3 of a bar. Get the BPM and first-downbeat offset of the music and store them in `script.json`; compute `beatFrame(n) = (offset + n * 60 / bpm) * fps`.
- **Entrances ease out, exits ease in.** Entrances can be 100% of the duration, exits about 75%. Exits are less interesting than arrivals.
- **One motion at a time.** When a headline is animating, the background is still. When footage is zooming, no text is moving.
- **Holds are not pauses.** A static frame for more than 2 seconds needs a parallax drift, a cursor move, or a glow shifting slowly.
- **Match cuts beat transitions.** If the button the cursor clicks is the same shape as the card in the next scene, align them and cut. The brain fills the rest.
- **The reveal is the one place for a big move.** Spend the whip pan or the zoom-through there. Everywhere else, cuts and pushes.

## Easing presets

```ts
export const ease = {
  out:   Easing.bezier(0.2, 0.8, 0.2, 1),      // entrances, "expo-ish"
  in:    Easing.bezier(0.6, 0, 0.9, 0.4),      // exits
  inOut: Easing.bezier(0.65, 0, 0.35, 1),      // moves, pushes, wipes
  snap:  Easing.bezier(0.3, 1.4, 0.4, 1),      // small UI reactions, slight overshoot
}
export const springs = {
  settle: { damping: 200 },                    // no bounce, smooth
  soft:   { damping: 20, stiffness: 120 },     // gentle overshoot for cards
  pop:    { damping: 12, stiffness: 180 },     // a badge or check appearing
}
```

## Custom presentations

Build these once in `src/fx/` and reuse. Each is a `TransitionPresentation` whose component receives `presentationProgress` (0→1) and `presentationDirection` (`entering` | `exiting`).

**Mask reveal (inset from the left):**
```tsx
const maskReveal = (): TransitionPresentation<{}> => ({
  component: ({ children, presentationProgress: p, presentationDirection: d }) => (
    <AbsoluteFill style={d === 'entering' ? { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` } : { opacity: 1 - p * 0.3 }}>
      {children}
    </AbsoluteFill>
  ), props: {},
})
```

**Zoom-through toward a point:**
```tsx
const zoomThrough = ({ x = 0.5, y = 0.5 }): TransitionPresentation<{}> => ({
  component: ({ children, presentationProgress: p, presentationDirection: d }) => {
    const s = d === 'exiting' ? interpolate(p, [0, 1], [1, 2.6], { easing: Easing.in(Easing.cubic) }) : interpolate(p, [0, 1], [1.08, 1], { easing: Easing.out(Easing.cubic) })
    const o = d === 'exiting' ? interpolate(p, [0.7, 1], [1, 0], { extrapolateLeft: 'clamp' }) : 1
    return <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${x * 100}% ${y * 100}%`, opacity: o }}>{children}</AbsoluteFill>
  }, props: {},
})
```

**Dip to colour:** two `fade()` transitions with a 4-frame solid `Sequence` of the colour between them, or a custom presentation that fades the exiting scene to a colour overlay in the first half and the entering scene from it in the second.

**Push with motion blur:** `slide()` for the geometry, `<CameraMotionBlur shutterAngle={200} samples={6}>` around the `TransitionSeries` during that transition only (it is expensive).

## Inside-scene motion

- Headline enter: `translateY 24→0` plus `opacity 0→1` over 14 frames, `ease.out`. Supporting line follows with `delay: 5`.
- Card enter: `scale 0.96→1`, `opacity 0→1`, `springs.soft`.
- Footage enter in a card: card enters first, footage fades in 6 frames later so the frame is "built" before it plays.
- Cursor callout: a 1px pink ring that scales from 1.4→1 and fades in over 8 frames at the click point.
- Badge flip: cross-fade between the two badge states over 6 frames plus `springs.pop` scale on the new one.
- Highlighted line of code: a `--selection-background` mint or pink-at-12% bar sliding in from the left over 8 frames.

Text hold: `Math.ceil((words / 2.5 + 0.5) * fps)` frames minimum, after the entrance finishes.
