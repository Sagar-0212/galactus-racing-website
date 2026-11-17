# MTVNA Design System

MTVNA is a web design studio. Its visual identity is loud, editorial and motorsport-flavoured: warm paper grounds, a hard black diagonal wedge, ultra-condensed uppercase headlines with one phrase in deep red, and a tiny typeset signature (`MTVNA®` + red hairline + micro tagline).

## Sources
- `uploads/Screenshot 2026-10-10 194052.png` — a single hero section (supplied rotated 90°; upright copy at `assets/reference-rotated.png`). Headline "GIVE A SH*T?", signature "MTVNA®", tagline "BUILT DIFFERENT. / DRIVEN BY NOTHING.", cut-out racing driver photo.
- No codebase, Figma, logo files, font files or other screens were provided. Everything beyond the hero is extrapolated from that one frame.
- The reference photo shows a real athlete and third-party sponsor marks. It is kept **for reference only**; kits use an `<image-slot>` placeholder instead.

## Content fundamentals
- **Voice:** provocative, blunt, confident. Short rhetorical questions and two-beat manifestos. Mild profanity, censored with an asterisk ("SH*T").
- **Casing:** headlines and labels ALL CAPS. Body copy sentence case.
- **Structure:** headline = setup + punchline; the punchline gets the red. Taglines come in parallel pairs: "Built different. / Driven by nothing." Full stops on each beat.
- **Person:** "we" for the studio, "you" for the client. Never "I".
- **Emoji:** never. Symbols limited to ® and typographic arrows.
- **Examples:** "Give a sh*t?", "Selected work.", "Half measures? Nothing.", "Let's talk.", "We reply within 48 hours."

## Visual foundations
- **Colour:** paper `#EEE7DD` (sampled) is the default ground; ink `#010101` / `#0E0D0B` for type and the wedge; one accent, deep red `#960101` (sampled). Red is for the punchline word, hairline rules, active states and primary hover. No gradients, no other hues except muted status green/amber.
- **Type:** display = ultra-condensed heavy sans, uppercase, line-height .86, nearly zero tracking. Support text = bold grotesk caps at 9–11px with .06–.08em tracking. Body = grotesk 15/1.5. Scale jumps hard: huge display vs. tiny labels, little in between.
- **Backgrounds:** flat paper with subtle film grain (`--grain`). Signature motif is the black wedge (`--wedge-clip`) rising bottom-left to right edge. Imagery is a cut-out subject breaking across paper and wedge — no rectangles around hero photos.
- **Imagery vibe:** high-contrast, saturated studio sports photography; deep blacks; subject isolated.
- **Corners:** square (radius 0) everywhere. Only exception: pill tags.
- **Borders:** 1px ink for cards/inputs; 1px `--red-200` hairline as decorative rule (180px beside the wordmark); 2px red bar for active tabs/focus underline.
- **Shadows:** none by default. Interactive cards lift with a hard 3px offset ink shadow. Dialogs use one soft overlay shadow.
- **Cards:** paper-100 fill, 1px ink border, no radius, 24px padding, display-font title, red caps eyebrow.
- **Hover:** primary ink buttons turn red; outline buttons fill ink; arrow glyphs shift 2px up-right; links turn red. **Press:** 1px downward nudge, red darkens to `--red-700`.
- **Motion:** quick and decisive. `--ease-out` cubic-bezier(.2,.7,0,1); 120ms colour, 220ms transforms, 480–720ms section wipes. Underlines scale in from the left. No bounces.
- **Transparency/blur:** only the 72% black dialog scrim. No glassmorphism.
- **Layout:** fluid gutter `clamp(20px,5vw,72px)`, 1360px container, headline anchored top-left, header absolutely overlays the hero. Generous negative space on paper, dense contrast on ink.

## Iconography
- No icon set was present in the source. The system uses **typographic glyphs** as icons: ↗ → ← ↑ ↓ ✕ ✓ ®, set in Archivo bold.
- If a real icon set is needed, use **Lucide** from CDN (thin 1.5–2px stroke suits the hairline aesthetic) — this is a substitution, not a brand asset.
- No emoji, no PNG icons, no icon font.
- **Logo:** none supplied. The brand mark is set in type via the `Wordmark` component. Do not draw one.

## Fonts (substitutions — flagged)
Originals unknown. Self-hosted Google Fonts in `fonts/`: **Anton** (display), **Archivo** (body/labels, variable 400–800), **JetBrains Mono** (specs/metadata). Replace with the real files when available.

## Index
- `styles.css` — entry; imports `tokens/{fonts,colors,typography,spacing,effects,motion,base}.css`
- `fonts/` — woff2 files
- `assets/reference-rotated.png` — source hero, reference only
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand)
- `components/` — React primitives (below)
- `ui_kits/website/` — marketing site click-through
- `thumbnail.html`, `SKILL.md`

## Components
- brand: **Wordmark**, **Headline**
- actions: **Button**, **IconButton**
- forms: **Input**, **Select**, **Checkbox**, **Radio**, **Switch**
- display: **Card**, **Badge**, **Tag**
- navigation: **Tabs**
- overlay: **Dialog**, **Toast**, **Tooltip**

No source defined a component inventory, so this is a standard set sized for a studio site.

### Intentional additions
- **Wordmark** — the source's typeset signature lockup, reused in header/footer.
- **Headline** — the display headline with red accent phrase, the system's defining element.

## UI kits
- `ui_kits/website/index.html` — Home (hero, work, services), Work, Services, Contact (form → dialog, email → toast). Hero is source-faithful; other sections extrapolated.
