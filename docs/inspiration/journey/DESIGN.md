# DESIGN.md — "Our Trail" Club History Section

A scroll-driven club history timeline for an off-road (Baja) racing team.
An off-road buggy drives along a dirt trail as the visitor scrolls. At each year it brakes at a checkpoint and a "tech inspection tag" card shows that year's story.

Reference demo: `baja-history-trail-demo.html`. It's a single file with no dependencies, so open it in a browser to see everything described here.

---

## 1. Concept

| Idea | How it shows up |
|---|---|
| History = a race run | One continuous trail from **START** (founding year) to **TODAY** (finish line) |
| Each year = a checkpoint | Buggy accelerates, brakes, stops, card appears |
| Each stretch = an obstacle | Rock garden, water crossing, log hop, jump, mud pit, each with its own reaction |
| Every year has a new car | Card back shows that year's **build spec** |
| Ends with a call to action | Finish line → confetti → "Join the crew" |

**Feel:** gritty, dusty, mechanical, hand-built. Avoid shiny or corporate looks. Paper tags, stencil type, dirt textures.

---

## 2. Design tokens

### Colours

```css
:root{
  --bg:      #110d09;  /* page background, near-black brown */
  --text:    #f3ece0;  /* off-white */
  --muted:   #a8998a;  /* secondary text */
  --line:    #3a2f25;  /* borders, panel outlines */
  --orange:  #ff6a13;  /* team / accent colour (replace with the team's colour) */
  --gold:    #ffc22e;  /* podium / best years */
  --sand:    #d9b98c;  /* dust, hints */
  --paper:   #ece3cc;  /* inspection tag card */
  --ink:     #1d1813;  /* text on paper */
}
```

| Element | Colour |
|---|---|
| Trail edge | `#2a1f16` |
| Trail dirt | `#6e5238` (centre lighter `#7d5f42`) |
| Gravel dots | `#a88a68` |
| Ruts / tyre tracks | `#4c3826` / `#2a1d12` |
| Dust particles | `#b8946a` |
| Water | `#2f5a74`, highlight `#9cc9e6` |
| Mud | `#2a1d13` / `#3a2a1c` |
| Bushes | `#24321d` / `#2b3a22` |
| Stamp PASSED / PODIUM | `#2f6d32` / `#b8261b` |

**Rule:** normal years use `--orange`, podium or award years use `--gold`. This applies to the flags, chips and card tag.

### Typography (Google Fonts)

| Role | Font | Use |
|---|---|---|
| Display / years | **Saira Stencil One** 400 | Big years, stamps, section title |
| UI / labels / HUD | **Saira Condensed** 500/700 | Uppercase labels, letter-spacing `.14–.3em` |
| Body | **Barlow** 400/500/600 | Card text, quotes |

```html
<link href="https://fonts.googleapis.com/css2?family=Saira+Stencil+One&family=Saira+Condensed:wght@500;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
```

| Token | Desktop | Mobile |
|---|---|---|
| Hero title | `clamp(48px, 10vw, 118px)` | same |
| Card year | 54px | 42px |
| Card title | 25px | 21px |
| Card body | 15.5px | 14.5px |
| Track year label | 44 SVG units | same (scales with SVG) |

### Shape & depth
- Panels (HUD, chips): radius `12px` / `6px`, background `#140f0bdd` + `backdrop-filter: blur(6px)`, 1px `--line` border.
- Card: radius `8px 20px 20px 8px` (tag shape), punched hole top-left, paper dot texture, shadow `0 30px 60px -20px #000`.
- Buttons: 6px radius, 1.5px ink border; CTA filled `--orange`.

---

## 3. Page structure

```
<header class="intro">     Title + "Scroll to fire it up ↓"         (~88vh)
<section id="history">     Tall scroll track (height set by JS)
  └ .stage (position: sticky; top:0; height:100svh)   ← pinned viewport
      ├ <svg#track>        scenery, trail, obstacles, checkpoints, dust, buggy
      ├ .hud               speed gauge · suspension meter · checkpoint · fuel · sound
      ├ .chips             year jump buttons
      ├ .card              inspection tag (flip card)
      ├ .splat             mud/water screen splatter overlay
      └ canvas#fx          confetti
<footer class="outro">     Rest of the site continues
```

### SVG layer order (bottom → top)
1. `far`: hill silhouettes top and bottom (parallax 0.7)
2. `near`: bushes and rocks (parallax 0.35)
3. `trackG`: edge → dirt → centre dirt → gravel → ruts → tyre tracks → obstacles → flags → labels
4. `dustG`: particle pool
5. shadow (separate so it can drift away during jumps)
6. `car`: the buggy

---

## 4. Layout

### Desktop (≥ 760px)
- SVG fills the full stage.
- Camera keeps the buggy at **30% from the left** and looks ahead slightly at speed.
- Card: right side, vertically centred, `width: min(380px, 36vw)`.
- HUD: top left (gauges) and top right (checkpoint + sound).
- Year chips: bottom centre.

### Mobile (< 760px)
- SVG band at the top: `top: 128px; height: 36%`.
- Camera keeps the buggy **centred (50%)**.
- Chips go under the HUD (`top: 86px`) and scroll sideways.
- Card is pinned to the bottom, full width with 16px side gutters.
- Must not scroll sideways at 375px width.

---

## 5. Trail geometry

- SVG world height is fixed at **600 units**. Width follows the screen ratio: `VW = 600 × (svgWidth / svgHeight)`.
- Checkpoints sit **820 units apart**, alternating between y = 240 and y = 380 so the trail winds.
- Neighbouring points are joined with cubic Béziers (control handles at 55% of the horizontal gap).
- The trail starts 420 units before the first checkpoint and ends one gap after the last (finish).
- Labels sit above the trail for upper checkpoints and below it for lower ones.
- Obstacles sit halfway between checkpoints, where the buggy is fastest.

Use `path.getPointAtLength()` for position and its angle (compare points ±2 units away) to place the buggy, flags and obstacles.

---

## 6. Scroll → motion

The section's scroll progress maps to a timeline of **drive** and **dwell** segments:

```
[drive 1.0] [stop 0.9] [drive 1.0] [stop 0.9] … [drive 1.0] [finish stop 0.8]
```

- **Drive:** distance follows `easeInOutCubic`, so the buggy speeds up and then brakes into the checkpoint.
- **Stop:** the buggy holds still while its nose sits on the checkpoint line (44 units before it).
- Section height = `(total units × 55vh) + 100vh`.
- **Smoothing:** the position eases towards the scroll target each frame (factor about 0.12 at 60 fps), so the buggy has weight and inertia.
- **Speed** is how far the buggy moved since the last frame. It drives the HUD, dust, shake, engine sound and how far the camera looks ahead.
- The card shows while progress is inside a stop segment, plus or minus 0.15 so it appears slightly early and leaves slightly late.

---

## 7. Components

### Buggy (top-down SVG, pointing right, ~75 × 66 units)
Knobbly tyres (striped tread pattern that moves with distance so the wheels appear to turn), suspension arms, orange body, engine block at the rear, white roll cage with a diagonal brace, helmet, headlights with a soft glow, brake light.

| State | Behaviour |
|---|---|
| Driving | Small side-to-side shake and sway that grows with speed |
| Braking | Brake light at full strength plus a red glow behind |
| Stopped | Brake light at half strength |
| Airborne (jump) | Scales up to 1.3×, shake stops, shadow moves away and fades |
| Hit an obstacle | Short bump, size depends on obstacle (rocks 6, log 9, water 4, mud 5) |

### Obstacles
| Type | Look | Reaction |
|---|---|---|
| Rock garden | 6 grey stones on the trail | Gravel flies out + strong bump |
| Water crossing | Blue puddle with ripple | Blue splash + water drops on screen |
| Log hop | Brown log across the trail | Dust puff + biggest bump |
| Jump | Light-coloured ramp | Airborne for 180 units |
| Mud pit | Dark mud patch with blobs | Mud splash + mud spatter on screen |

A small uppercase label sits next to each one ("ROCK GARDEN" and so on).

### Checkpoint
A faint chalk line across the trail, a marshal flag on each side (orange, or gold for podium years), and a label: `CP3 · ENDURANCE` with the year in stencil type underneath.

### Dust system
- A pool of about 110 SVG circles that get reused.
- **Trail dust:** sandy puffs from behind the buggy whenever it's moving; the faster it goes, the more puffs. Each grows from 5 to 22 units and fades over 0.9 s.
- **Brake cloud:** 22 large puffs (8→36 units, 1.4 s) when the buggy pulls into a checkpoint.
- **Splash:** quick small particles that fly outwards (water blue, mud brown, gravel grey).

### Inspection tag card
**Front:** header "TECH INSPECTION · CP 3/8" with a dashed line under it → stencil year + event pill → **stamp** (PASSED in green, PODIUM in red, OPEN on the finish card) that lands 0.45 s after the card appears → photo slot → title → short text → "Build spec ↻" button (plus "Join the crew →" on the finish card).

**Back** (turns over in 3D on click/tap, 0.7 s with a slight overshoot): "BUILD SPEC" header, three spec rows joined by dotted lines (`Weight ······ 205 kg`), a quote, and a "Back ↺" button.

**Entrance:** slides in from the right with a small rotation and a springy overshoot (`cubic-bezier(.2,1.6,.4,1)`). On mobile it slides up from below instead.

### HUD
- **Speed gauge:** a semicircle that fills with speed, plus the km/h number.
- **SUSP meter:** 6 bars that light up with roughness, bumps and jumps.
- **Checkpoint:** `START ZONE` → `CP3 · 2011` → `🏁 TODAY`.
- **Fuel bar:** drops from 100% to about 18% over the run. It doubles as a progress bar.
- **Sound toggle:** off by default.

### Year chips
One button per year plus 🏁. Each chip fills orange or gold once the buggy has passed that year, and the current one gets a white outline. Clicking a chip smooth-scrolls to the middle of that year's stop.

### Screen splatter
About 9 blobs at random positions over the stage. They appear instantly, then fade out over 1.6 s after a short delay. Only shown when the buggy hits water or mud fast (speed > 25).

### Finish
A chequered strip across the trail labelled TODAY, a finish card with a CTA, and a one-time confetti burst in orange, gold, sand, black and white.

### Engine sound (optional)
Web Audio: a low sawtooth note pulsed on and off at half its pitch to give a single-cylinder "thump". The pitch rises with speed and a filter opens up as it speeds up. It only starts after the user taps the sound button.

---

## 8. Parallax & atmosphere
- Distant hills move at 30% of the camera speed; bushes and rocks at 65%.
- A faint sandy haze at the bottom of the stage (`::after` gradient).
- A subtle dot texture over the stage background.

---

## 9. Content model

Each year is one data object. Edit content here only, not in the drawing code.

```js
{
  year: 2013,
  tag: 'Redesign',            // short event label (pill + checkpoint label)
  obs: 'jump',                // rocks | water | log | jump | mud  (obstacle before this year)
  title: 'Lighter. Tougher. Faster.',
  text: 'A full redesign: new chassis, new suspension geometry, 30 kg lighter.', // ≤ 140 chars
  specs: [['Weight','205 kg'], ['Top speed','58 km/h'], ['Susp. travel','230 mm']], // exactly 3
  quote: '“Every gram had to earn its place.”',
  photo: 'img/2013-car.jpg',  // replaces the placeholder gradient
  best: false                 // true = podium/award year → gold
}
```

The finish card uses the same shape (tag, title, text, specs, quote) plus a CTA link.

**Content checklist per year:** one strong photo (ideally that year's car), one headline, one or two sentences, three numbers, one quote.

---

## 10. Accessibility & performance

- **`prefers-reduced-motion`:** no smoothing, particles, splatter, shake or confetti, and cards appear instantly. All content stays reachable.
- The chips are real `<button>`s so they work with a keyboard. The card is `aria-live="polite"` so screen readers announce each year.
- Sound is off until the user switches it on.
- Never block scrolling. The user always controls the scroll, and the chips let them skip ahead.
- **Recommended:** add a visually hidden `<ol>` listing all years and their text, for screen readers and search engines.
- Animate only `transform`, `opacity` and SVG attributes. No layout changes inside the frame loop.
- One `requestAnimationFrame` loop; the particle pool is reused, never recreated.
- No 3D libraries. Total weight is about 30 KB plus fonts and photos. Serve photos as WebP, around 800px wide.

---

## 11. Implementation notes

- The demo is plain HTML/CSS/JS. To port it:
  - **React / Next.js:** put the SVG in a component and run the frame loop inside `useEffect`. Keep the frame values in refs, not state.
  - **GSAP alternative:** `ScrollTrigger` (pin + scrub) can replace the hand-written scroll progress, and `MotionPathPlugin` can replace `getPointAtLength`. The drive/stop timeline still applies.
- Replace `--orange` and the buggy body colour with the team's colours.
- To make the buggy match the team's car, redraw the `#car` group (top-down view, pointing right, centred on 0,0) or swap it for an `<image>` of a top-down render.
- Optional upgrade: a different buggy per year (one `#car` variant per year) so visitors watch the car evolve.

---

## 12. Do / Don't

**Do**
- Keep the textures earthy: dirt, paper, stencil type, dust.
- Use real team photos and numbers. The animation only works if the content is good.
- Keep each card short; the trail itself carries the excitement.

**Don't**
- Use F1/tarmac visuals (kerbs, purple sectors, open-wheel cars). They don't fit Baja.
- Take control of the scroll away from the user.
- Turn sound on automatically, or let the confetti fire more than once.
