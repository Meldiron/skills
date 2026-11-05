# Appwrite Console design tokens

Extracted from the Console source (`apps/console/src/styles.css`, Tailwind v4 + shadcn "new-york", base colour zinc, Lucide icons). Use these for every slide, card, badge and fake-UI element so the trailer looks like it was shot inside the Console. The real Console you record will already match.

## Brand

| Token | Value | Use |
|---|---|---|
| Brand pink (CTA) | `#FD366E` | Logo mark, primary CTA, the single accent in a frame |
| Legacy pink | `#F02E65` | Only in the old Console theme. Do not mix the two pinks in one video |
| Globe purple | `#7C67FE` (dark: `#9B8AFF`) | Secondary accent, sparingly |
| Globe orange | `#FE9567` (dark: `#FFB088`) | Secondary accent, sparingly |
| Selection highlight | `hsl(178 54% 69%)` | Text-selection mint. Nice for a "highlight this line" effect |

Rule: one accent per frame. Pink is for the thing you want the eye to land on. Everything else is neutral.

### Extended brand palette (Pink design system, appwrite.io)

These come from `@appwrite.io/pink` v2 tokens and are what the marketing site and launch graphics use. Pick at most one of them as a secondary accent per video and keep it for the same meaning throughout (for example purple for "before", pink for "after").

| Name | Hex |
|---|---|
| Pink 200 / 500 / 600 / 700 | `#FEAFC5` `#FD366E` `#CA2B58` `#982042` |
| Purple 500 | `#7C67FE` |
| Mint 500 | `#85DBD8` |
| Orange 500 | `#FE9567` |
| Yellow 500 | `#FED367` |
| Blue 500 | `#68A3FE` |
| Neutral scale | `#FFFFFF` `#FAFAFB` `#F4F4F7` `#EDEDF0` `#E4E4E7` `#D8D8DB` `#C3C3C6` `#ADADB0` `#97979B` `#818186` `#6C6C71` `#56565C` `#414146` `#2D2D31` `#1D1D21` `#19191C` `#141416` |

Brand page facts: Appwrite Pink `#FD366E`, Light Grey `#EDEDF0`, Dark Grey `#19191D`. The Console dark theme uses `#19191C`; the one-digit difference is invisible, use the Console value.

## Dark theme (default, use this unless the feature is shown in light mode)

```css
--background: #19191c;          /* page */
--card: #1d1d21;                /* cards, popovers */
--secondary: #2d2d31;           /* muted fills, inputs, hover */
--sidebar: #141416;             /* sidebar + editor background */
--border: oklch(0.252 0.005 286.32);   /* ≈ #2c2c30 */
--foreground: oklch(0.985 0 0);        /* ≈ #fafafa */
--muted-foreground: oklch(0.705 0.015 286.067); /* ≈ #a1a1aa */
--primary: oklch(0.985 0 0);           /* default buttons are WHITE on dark, not pink */
--primary-foreground: oklch(0.21 0.006 285.885);
--destructive: oklch(0.396 0.141 25.723);
--destructive-foreground: oklch(0.637 0.237 25.331);
--ring: oklch(0.448 0.015 285.786);
--chart-brand: oklch(0.6 0.26 358);
```

## Light theme

```css
--background: #ffffff;
--card: #ffffff;
--secondary: oklch(0.967 0.001 286.375); /* ≈ #f4f4f5 */
--sidebar: oklch(0.985 0 0);
--border: oklch(0.93 0.0035 286.32);     /* ≈ #e4e4e7 */
--foreground: oklch(0.141 0.005 285.823); /* ≈ #18181b */
--muted-foreground: oklch(0.552 0.016 285.938); /* ≈ #71717a */
--primary: oklch(0.21 0.006 285.885);    /* near-black buttons */
--primary-foreground: oklch(0.985 0 0);
--destructive: oklch(0.577 0.245 27.325);
--chart-brand: oklch(0.55 0.24 358);
```

## Status colours (badges)

Badges are `rounded-md px-2 py-0.5 text-xs font-medium` with a 10% tinted background and a saturated text colour. Tailwind palette values:

| Status | Background | Text (dark theme) | Text (light theme) |
|---|---|---|---|
| success / active / completed / verified | `emerald-500/10` | `emerald-400` `#34d399` | `emerald-600` `#059669` |
| warning / pending | `amber-500/10` | `amber-400` `#fbbf24` | `amber-600` `#d97706` |
| error / failed / unverified | `red-500/10` | `red-400` `#f87171` | `red-600` `#dc2626` |
| info / building | `slate-500/10` | `slate-400` `#94a3b8` | `slate-600` `#475569` |
| processing / deployment ready | `blue-500/10` | `blue-400` `#60a5fa` | `blue-600` `#2563eb` |

## Code syntax palette

Dark: plain `#9cdcfe`, keyword `#fe86a8`, module keyword `#9685fe`, function/property `#67a3fe`, string `#4ad4ab`, comment `#6e6e71`. Light: plain `#000`, keyword `#e85d8a`, module `#7b6aee`, function `#4a8fe8`, string `#2db88a`, comment `#6e6e71`. Editor background dark `#141416`.

## Logo

Bundled in `assets/logos/` (copied from the Console):

| File | Use on |
|---|---|
| `logo-on-dark.svg` | Dark backgrounds. Grey `#EDEDF0` wordmark + pink mark. 132x24 viewBox |
| `logo-on-light.svg` | Light backgrounds. `#19191C` wordmark + pink mark |
| `mark-pink.svg` | Standalone pink mark, works on both. Use for the intro sting and the thumbnail |
| `mark-white.svg` | Standalone white mark, for pink or photo backgrounds |
| `logotype-black.svg` / `logotype-white.svg` | Single-colour wordmark variants |

Official downloads: `https://appwrite.io/assets.zip`, `https://appwrite.io/assets/logomark/logo.svg`, `https://appwrite.io/assets/logotype/black.svg` (for dark backgrounds; the file is named after the background), `https://appwrite.io/assets/logotype/white.svg` (for light backgrounds). Brand rules from appwrite.io/assets: write "Appwrite" with a lowercase w, never alter the logo, prefer the logotype over the mark alone, put it on a neutral background. Mark-only is fine for the intro and the end card where the wordmark follows.

## Typography

| Role | Font | Notes |
|---|---|---|
| Headlines, hero text | **Aeonik Pro** (Regular 400, Medium 500, Bold 700) | Commercial font licensed to Appwrite. Cloud serves it from `https://fonts.appwrite.io/aeonik-pro/AeonikPro-{Regular,Medium,Bold}.woff2`; the Console repo also ships `AeonikPro-Regular.ttf` and `AeonikPro-Medium.ttf` in `apps/console/public/fonts-ttf/`. Copy into the Remotion `public/fonts/` and load with `@font-face`. Never commit it to a public repo. Appwrite headings use weight 400 with `letter-spacing: -0.144px` at UI sizes; at hero sizes use Medium 500 and `-0.02em` |
| Monospace brand (optional) | **Aeonik Fono** | Cloud only, same CDN path. Fira Code is the OSS fallback |
| UI, body, labels | **Inter** | Free. `@remotion/google-fonts/Inter` |
| Code | **Source Code Pro** / Menlo fallback | `@remotion/google-fonts/SourceCodePro` |

Fallback when Aeonik Pro is unavailable: Inter with `letter-spacing: -0.02em` at display sizes. It reads close enough.

Console sizes: section titles `15px/600`, table headers `12px/600 uppercase tracking-wider`, table cells `13px/500`, buttons `14px/500`. For video, scale up: the smallest text on a 1920x1080 frame should be ≥ 28px so it survives a phone screen and a YouTube thumbnail.

## Shape

- Radius: `--radius: 0.625rem` (10px). Buttons and badges use `rounded-md` (6px). Cards `rounded-lg` (8px).
- Borders: 1px, `--border`. Cards are `border border-border bg-card`. No drop shadows in the Console dark theme. Light theme has none either; depth comes from fills, not shadows.
- Buttons: default `h-9 px-4 text-sm font-medium rounded-md`. Variants: default (white on dark / black on light), `brandCta` (pink `#FD366E`, white text), `outline` (border, muted text), `secondary`, `ghost`, `destructive`.
- Header height `h-14` (56px). Sidebar background `--sidebar`, 1px right border.
- Spacing: 4px grid. Card padding 16-24px. Gaps 8/12/16.

## Motion in the Console

The Console uses `tw-animate-css` defaults: 150-200ms ease-out for enters, fades with 2-4px translates. Dialogs scale from 95% to 100%. Match this tempo for UI-mimicking elements; use slower, bigger motion only for hero slides (see `transitions.md`).

## Minimal Remotion theme object

```ts
export const theme = {
  bg: '#19191c', card: '#1d1d21', muted: '#2d2d31', sidebar: '#141416',
  border: '#2c2c30', fg: '#fafafa', fgMuted: '#a1a1aa',
  pink: '#FD366E', purple: '#7C67FE', orange: '#FE9567',
  success: '#34d399', warning: '#fbbf24', danger: '#f87171', info: '#60a5fa',
  radius: 10, radiusSm: 6,
  display: '"Aeonik Pro", Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: '"Source Code Pro", Menlo, monospace',
} as const
```
