# Review: what reviewers asked for, and how to pre-empt it

Every note below came from a real review of a trailer made with this skill. Check the draft against each one before sending it. Most of them are cheap to fix before the final render and expensive after.

## Picture

- **Is anything written on top of footage?** A corner label on a shot reads as a caption. Remove it; the voice says what is happening, or a slide between shots does.
- **Does the camera move inside a shot?** Pans, zoom-ins and zoom-outs within one take were called "too much moving around, hard to follow". One framing per shot, chosen so every element the shot uses stays in view, with a 1-2% slow push at most. Use click rings to direct the eye.
- **Does the zoom feel smooth, or does the UI look drunk?** Any wobble, jitter or quick scale change on screen footage is noticed instantly. Causes: `noise2D` or a spring on the footage transform, framing moves under 40 frames, cubic easing on a scale change. Fix: static framing with a linear 1-2% push, and for a real move the smooth-zoom recipe in `transitions.md`. A reviewer who says "ask for the zoom to be smoother and nicer" means this.
- **Is the app big enough?** At 1x in a card the Console is unreadable on a phone. Zoom to 1.3-1.9x; the smallest text should be at least 28px on the 1080p frame.
- **Do the old way and the new way look alike?** If both show a sign-in form, change the surface of one (full page vs popover, desaturated vs colour).
- **Are there enough effects to feel anything?** A static grid and three fades were called boring. Drift the grid, breathe the glow, glitch the pain shot once or twice, whip between demo shots, zoom-through into the reveal, ring the clicks.
- **Is it slow?** Speed footage up (pain 2.5x, demos 1.3-1.5x), cut code slides to the length of their spoken line, keep the whole thing under 60 s.

## Sound

- **Is the music drop on the title?** Measure it (`scripts/find-drop.sh`) and trim the music so the drop, the hit and the title landing share one frame. "Just before the title" is noticeable.
- **Does the reveal line shout?** "Introducing... <Feature>." in a calm, serious read beats the bare feature name. Start "Introducing" before the cut and let the name land after the drop (`voice.offsetFrames`).
- **Does every sentence earn its place?** "The session cookie rotates for you" was cut as unnecessary. One idea per scene.
- **Is the copy accurate and free of implementation detail?** "Right from the menu" is UI trivia. "The first one stays signed in" was imprecise; "the previous session stays alive on the device, and the new one becomes active" was right. Use the product's nouns: a device lists sessions, not accounts.
- **Does the payoff line start with the slide?** A 2-second lead-in on a 4-second slide reads as a late voice. Lead in 8-10 frames and time the counter's snap to the key word.

## Process

- Render a half-size preview and pull stills from every scene before the master. Review them yourself with the checklist above.
- Keep the sidecar API, the demo app and the PNG frame sequences until the reviewer signs off. Re-recording is the only expensive step.
- State clearly what you could not verify: voice takes you could not listen to, availability claims, SDK parameter style, licences.
