# Galactus Racing website — rules for Claude Code

Claude Code reads this file on every turn. Keep it in the project root.

## What this project is
Website for **Galactus Racing**, the Baja SAE team of Rajarambapu Institute of Technology (RIT), Rajaramnagar, Islampur. Founded 2008. Races SAE BAJA, MEGA ATV and the ATV Championship. Tagline: **"Freedom for failure."**
Goal, in order: 1) win sponsors (Invest in Us), 2) recruit students (Join), 3) show the cars and results.
Visitors: company sponsors on laptops, students on mid-range Android phones, judges, alumni.

## What's in the folder (exported from Claude Design)
| Path | What it is |
|---|---|
| `Galactus Racing.dc.html` | **Home page, the main site.** 10 sections: hero (pinned), about, journey, cars (pinned horizontal), achievements, gallery + lightbox, sponsors, invest (packages + enquiry form), contact, footer |
| `Team.dc.html` | Team page: intro, leadership, sub-teams, recruitment |
| `Galactus Admin.dc.html` + `admin-api.js` | Admin panel. Uses a **mock** API in localStorage (login admin / galactus). Not connected to the public pages yet |
| `hero-car-3d.html` | Experiment: a buggy built from Three.js primitives. Not used on the site |
| `export/Galactus-Racing.html` | Standalone bundle of the home page. **This is the visual reference** for "how it looks today" |
| `support.js`, `image-slot.js`, `.image-slots.state.json` | Claude Design runtime. Needed only to view `.dc.html` files |
| `_ds/mtvna-design-system-*/` | **Our design system** (tokens, fonts, rules in `readme.md`) |
| `assets/` | Real images: logo, favicon, hero layers, car cut-out (`hero-car*.png/webp` = our car "Abhimanyu", M04) |
| `baja-website/` | **Old first draft** (Teko/Barlow, orange). Ignore it. Move it to `/archive` |
| `uploads/`, `scraps/` | Reference images only. Don't ship |

`.dc.html` is Claude Design's own format (`<x-dc>`, `{{ }}` templates, a `DCLogic` class, `support.js` runtime). **We are converting it to normal code.** Don't build new features inside `.dc.html`.

## Target stack (after conversion)
- **Vite, multi-page, vanilla JS + CSS.** Pages: `index.html`, `team.html`, `admin.html`. No React (keep it simple to maintain).
- Content lives in `src/data/*.json` (stats, cars, journey, achievements, gallery, team, sponsors, packages, contact), shaped like the `SEED` in `admin-api.js`, so the admin panel and a future backend can feed it later.
- Animation: **GSAP + ScrollTrigger**, **Lenis** smooth scroll driven from the GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`).
- 3D: **Three.js** (plain, ES modules via npm). Only in the Cars section, and only if it beats the photo.
- Before using any GSAP, ScrollTrigger, Lenis or Three.js API, check the current docs (Context7 MCP). Their APIs change.
- Deploy target: [Vercel / Netlify / GitHub Pages]. Repo: `Sagar-0212/G` (empty right now).

## Design system (MTVNA) — follow it
Use tokens from `_ds/.../tokens/*.css`. Never hard-code a colour, font size, easing or duration that has a token.
- Paper `--paper-200` + `--grain`, ink `--ink-1000/900`, one accent red `--red-600`. No other hues. No gradients, no glassmorphism, no glow.
- Anton (display, uppercase, line-height .86), Archivo (body, caps labels), JetBrains Mono (specs, numbers, sector labels).
- Motifs: the black diagonal wedge (-17°), headline with the punchline in red, red hairlines, sector labels like `S03 / CARS`, checkered strip in the footer.
- Square corners (pill tags only exception). Hard 3px ink shadow on card hover. Glyph icons ↗ → ↓ ✕.

## Motion rules
- Feel: **quick, decisive, mechanical. Like a pit stop.** No bounce, no elastic, no wobble, no floaty drift.
- Easing: `--ease-out` cubic-bezier(.2,.7,0,1) for entrances. Scrubbed scroll uses `ease: "none"` or `--ease-in-out`.
- Durations: 120ms colour, 220ms transforms, 480ms reveals, 720ms wipes. Stagger 40–80ms.
- **Keep the motion that already exists** (it's good): loader, hero split on scroll (GALACTUS exits left, RACING right, buggy drives forward, wedge lags), clip-path reveals, count-ups, parallax, wedge rise, horizontal car track with progress bar, scroll-velocity skew on marquees, journey timeline, sector label + top progress bar, lightbox streak. Rebuild them cleaner; don't delete them.
- Animate only `transform`, `opacity`, `clip-path`. Never read layout (`getBoundingClientRect`, `offsetTop`) every frame. Measure on resize/refresh only.
- Use `gsap.matchMedia()`: desktop gets pins and parallax; under 900px **no pinning** for the cars track (vertical stack); `prefers-reduced-motion` shows final states instantly.

## Performance limits
- Total page weight on first load under 1.5MB on mobile. Images WebP/AVIF, `srcset`, lazy below the fold. Don't preload PNGs when a WebP exists (today `hero-car-clean.png` is a 970KB preload).
- Delete unused heavy files from the build (`hero-bg.png` 2.2MB, `hero-galactus.png` 2.4MB) unless something uses them.
- 3D: GLB under 2MB (Draco/Meshopt), lazy-loaded, render paused off-screen, DPR max 1.5, static image fallback on phones.
- Target: Lighthouse mobile performance 85+, 60fps scroll on a mid-range laptop.

## Content and honesty
Much of the current copy was written by AI as a placeholder. **Never invent or "improve" facts.** These must come from me, until then mark them `[TODO]`:
- Car names: the site says GR-26 Valkyrie / GR-25 Raptor / GR-24 Titan, but our real car is **Abhimanyu (M04)**. Real names: [fill in]
- Stats (18 years, 35+ competitions, 14 podiums, 42 members, 20+ sponsors), results (P1 MEGA ATV 2025, etc.), awards, journey chapters, fundraising (₹7,78,998 of ₹12,00,000), package prices: [real / placeholder]
- Hero says top speed 38 km/h, the spec table says 58 km/h. Real: [ ]
- Email `team@galactusracing.in`, phone, socials, UPI: [real values]
- Never put bank account numbers on the page. Never ship the mock admin password as real security.
- Real photos only: our car, our team, our events. Sponsor logos only for sponsors we actually have.

## How to work with me
- I'm comfortable with code (backend Java), newer to animation and 3D. Explain choices in short plain English.
- **One step at a time:** plan → build → verify → commit. Don't start the next step until I say go.
- **Verify every step yourself** before reporting: run `npm run dev`, use Playwright/Chrome DevTools MCP to screenshot at **1440px and 390px**, scroll through animations in small steps, check the console is clean, and compare against `export/Galactus-Racing.html`. Fix problems first, then report.
- Report: what changed, what you checked (with numbers), what's left. Short.
- Git commit after each working step.
