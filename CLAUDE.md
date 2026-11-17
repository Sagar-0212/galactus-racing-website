# Galactus Racing website — rules for Claude Code

Claude Code reads this file on every turn. Keep it in the project root.

## What this project is
Website for **Galactus Racing**, the Baja SAE team of Rajarambapu Institute of Technology (RIT), Rajaramnagar, Islampur. Founded 2008. Races SAE BAJA, MEGA ATV and the ATV Championship. Tagline: **"Freedom for failure."**
Goal, in order: 1) win sponsors (Invest in Us), 2) recruit students (Join), 3) show the cars and results.
Visitors: company sponsors on laptops, students on mid-range Android phones, judges, alumni.

## What's in the folder (converted to Vite, Prompt 2)
| Path | What it is |
|---|---|
| `index.html` | **Home page.** 10 sections: hero (pinned), about, journey, cars (pinned horizontal), achievements, gallery + lightbox, sponsors, invest (packages + enquiry form), contact, footer. Body is `<!-- @render … -->` markers filled at build time |
| `team.html` | Team page: intro, leadership, sub-teams, recruitment |
| `admin.html` | Admin panel, **dev only** (not in the production build). Still runs on the Claude Design runtime (`src/admin/support.js`, loads React from a CDN) with the **mock** API in `src/admin/admin-api.js`. Rebuild it when the real backend exists |
| `src/data/*.json` | **All content** (stats, cars, evolution, journey, achievements, gallery, team, subteams, sponsors, packages, fundraising, contact). Unverified facts carry `[TODO]` |
| `src/render/*.js` | Turns the JSON into HTML. `ui.js` = design-system components (Button, Card, Headline…), `layout.js` = header/menu/footer, `home.js`, `team.js`. Run at build time by the plugin in `vite.config.js`; the gallery grid is also re-rendered at runtime |
| `src/home.js`, `src/team.js` | Page behaviour: menu, gallery filter, lightbox, enquiry form |
| `src/motion/` | GSAP + ScrollTrigger + Lenis (Prompt 3). `core.js` = plugins, token durations/easings, Lenis, `reveal()`; `hero.js`, `effects.js` (chrome, counts, bars, journey, parallax, cars pin, marquee, wedge), `gallery.js` (hover, lightbox), `index.js` = `initHomeMotion` / `initTeamMotion` with `gsap.matchMedia` |
| `src/styles/*.css` | `base.css` (tokens import, header, menu, footer), `components.css` (design-system components), `home.css`, `team.css` |
| `public/assets/` | Images shipped as-is: logo, favicon, car cut-out `hero-car.webp` (1200w) + `hero-car-640.webp` (= Abhimanyu, M04; cut with rembg isnet from `archive/assets/photos/abhimanyu-hero-source.png`, contact shadow baked in). Dust is a canvas (`src/motion/dust.js`). The hero headline and wedge are HTML/CSS, `photos/abhimanyu-real-01.jpg`, `gallery/g8.webp` |
| `_ds/mtvna-design-system-*/` | **Our design system** (tokens, fonts, rules in `readme.md`) |
| `archive/claude-design/` | The original Claude Design source (`.dc.html` pages, runtime, export). **Visual reference** for "how it looked before". Serve the repo root (`archive` config in `.claude/launch.json`) and open `/archive/claude-design/Galactus%20Racing.dc.html` |
| `archive/assets/` | Images no page uses (hero-bg, hero-full, hero-galactus, hero-car png/webp, old hero-l-* text layers, hero-car-clean.png + hero-car-poster*.webp old poster cut-outs, photos/abhimanyu-hero-source.png) |
| `archive/baja-website/` | Old first draft. Ignore |
| `uploads/`, `scraps/` | Reference images only. Don't ship |

Don't build anything inside `.dc.html` any more; the archive is reference only.

## Hero car: Abhimanyu (M04)
- **Abhimanyu (M04) is our current car and THE car the landing page showcases.** The old placeholder name "GR-26 Valkyrie" is gone everywhere (hero spec strip, cars section, evolution row, gallery captions, data, admin seed).
- Hero: Abhimanyu is the main visual. Cut-out: `public/assets/hero-car.webp` (srcset with `hero-car-640.webp`). Real photo: `public/assets/photos/abhimanyu-real-01.jpg`.
- Cars section: Abhimanyu comes first and gets the big scroll-driven showcase (Prompt 5). Older cars become a smaller "previous cars" row after it.
- The hero spec strip reads its values from the current car in `src/data/cars.json` (single source).
- Abhimanyu's specs are **not verified**: every value is marked `[TODO]`; top speed shows `[TODO] km/h` until confirmed (the old site said 38 in the hero and 58 in the table).
- Older cars (GR-25 Raptor, GR-24 Titan, GR-01/05/09/12): names, years and specs are AI placeholders, all `[TODO]`.
- The full list of facts to confirm is in `docs/TODO-FACTS.md`.

## Target stack (after conversion)
- **Vite 8, multi-page, vanilla JS + CSS.** Pages: `index.html`, `team.html` (built), `admin.html` (dev only). No React on the public pages.
- Content lives in `src/data/*.json` (stats, cars, journey, achievements, gallery, team, sponsors, packages, contact), shaped like the `SEED` in `admin-api.js`, so the admin panel and a future backend can feed it later.
- Animation: **GSAP + ScrollTrigger**, **Lenis** smooth scroll driven from the GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`).
- 3D: **Three.js** (plain, ES modules via npm). Only in the Cars section, and only if it beats the photo.
- Before using any GSAP, ScrollTrigger, Lenis or Three.js API, check the current docs (Context7 MCP). Their APIs change.
- **Backend (decided): Supabase** — database + email login + image storage. It is wired into the admin panel only **after the frontend is done**. Until then: keep `admin.html` working in dev on its current runtime (mock API), keep `src/data/*.json` shaped like `SEED` in `src/admin/admin-api.js`, and don't add any other backend (no Formspree/EmailJS/Firebase etc.).
- Deploy target: **Vercel** (`vercel.json`: build `npm run build`, output `dist`). Not deployed yet. Repo: `Sagar-0212/G` (empty right now).

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
- Total page weight on first load under 1.5MB on mobile. Images WebP/AVIF, `srcset`, lazy below the fold. Don't preload PNGs when a WebP exists.
- Keep unused heavy files out of `public/` (anything there ships). Unused originals live in `archive/assets/`.
- 3D: GLB under 2MB (Draco/Meshopt), lazy-loaded, render paused off-screen, DPR max 1.5, static image fallback on phones.
- Target: Lighthouse mobile performance 85+, 60fps scroll on a mid-range laptop.

## Content and honesty
Much of the current copy was written by AI as a placeholder. **Never invent or "improve" facts.** These must come from me, until then they are marked `[TODO]` in `src/data/*.json` (shown on the page as a small red `[TODO]`). The full checklist is `docs/TODO-FACTS.md`; when I confirm a fact, update the JSON, remove its `[TODO]`, and tick it there.
- Car names: our current car is **Abhimanyu (M04)** (confirmed). Older car names (GR-25 Raptor, GR-24 Titan, GR-01…12) are placeholders.
- Stats, results, awards, journey chapters, fundraising (₹7,80,000 of ₹12,00,000), package prices: placeholders.
- Abhimanyu's top speed: unknown (old site said 38 and 58 km/h).
- Email `team@galactusracing.in`, phone, socials, UPI: placeholders.
- Never put bank account numbers on the page. Never ship the mock admin password as real security.
- Real photos only: our car, our team, our events. Sponsor logos only for sponsors we actually have.

## How to work with me
- I'm comfortable with code (backend Java), newer to animation and 3D. Explain choices in short plain English.
- **One step at a time:** plan → build → verify → commit. Don't start the next step until I say go.
- **Verify every step yourself** before reporting: run `npm run dev`, use Playwright/Chrome DevTools MCP to screenshot at **1440px and 390px**, scroll through animations in small steps, check the console is clean, and compare against the previous commit (or `archive/claude-design/` for the original look). Fix problems first, then report.
- Report: what changed, what you checked (with numbers), what's left. Short.
- Git commit after each working step.
