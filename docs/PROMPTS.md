# Galactus Racing — Claude Code prompts (paste in order)

## Step 0 — Setup (you do this, ~15 min)

1. Make a folder, e.g. `galactus-racing/`, and unzip the Project HTML zip you downloaded from Claude Design into it so `Galactus Racing.dc.html` sits at the top level.
2. Put `CLAUDE.md` in that folder and fill the `[ ]` brackets you already know. Leave the rest — Claude will mark them `[TODO]`.
3. Put the two guides (3D Web Toolkit, How to Build a 3D Website) in `docs/`.
4. Open the folder in **Claude Code desktop**. Pick the strongest model with `/model`.
5. Add the tools that let Claude see its own work (terminal; if one errors, check that tool's GitHub README):
   ```
   claude mcp add playwright -- npx @playwright/mcp@latest
   claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
   claude mcp add --transport http context7 https://mcp.context7.com/mcp
   ```
6. If you can get the **CAD of Abhimanyu** from your design team (SolidWorks/Fusion), export it as STEP. That's the best 3D asset you'll ever get. If not, skip; the plan works without it.

Run Prompt 1 in **Plan mode** (Shift+Tab until it says plan). Turn plan mode off for the rest.

---

## Prompt 1 — Audit and plan (Plan mode, no code changes)

```
Read CLAUDE.md, the design system in _ds/ (readme.md + tokens), the two guides in docs/, then all three .dc.html pages, admin-api.js and hero-car-3d.html.

Then, without changing any code:
1. Initialise git and commit everything as "baseline: Claude Design export". Move baja-website/ to archive/.
2. Serve the folder (npx serve .) and screenshot export/Galactus-Racing.html at 1440px and 390px, every section. Also Team.dc.html and Galactus Admin.dc.html.
3. Explain how the .dc.html format works (x-dc, {{ }} templates, DCLogic, support.js) and list every animation in the home page's frame() loop: what it does, what triggers it, and which element it moves.
4. List the bugs you see, especially on mobile (390px): hero layout, text overlap, the cars track, horizontal scroll, anything clipped.
5. List every fact on the site that looks like a placeholder or contradicts itself (car names, stats, speeds, prices, contacts).
6. Give me the conversion plan to Vite multi-page vanilla JS (index, team, admin) with content in src/data/*.json, and confirm it can look identical to today.
7. Then a numbered build order matching the prompts I'll send: convert → motion engine → hero → cars/3D → sections → team page → QA.

Keep it short and concrete. Ask me anything you're unsure about.
```

---

## Prompt 2 — Convert to normal code (same look, no new animation)

```
Go. Convert the site from .dc.html to Vite multi-page vanilla JS + CSS, exactly as planned.
- index.html (home), team.html, admin.html. Shared header, footer and styles.
- Import the design-system tokens and fonts into the build. Move inline styles into CSS files with readable class names.
- Move all content (stats, cars, journey, achievements, gallery, team, sponsors, packages, contact) into src/data/*.json, shaped like SEED in admin-api.js. Render sections from that data.
- Keep the current animations working for now (port the frame() loop as-is into one module). Don't improve them yet.
- Keep accessibility that already exists: focus trap in menu and lightbox, Escape to close, arrow keys in lightbox, real h1, skip states.
- Keep admin.html working with the mock API.
Verify: npm run dev and npm run build both work. Screenshot every section at 1440 and 390 and compare side by side with export/Galactus-Racing.html. List any visual differences and fix them. Console clean. Commit "convert to Vite".
```

---

## Prompt 3 — New motion engine (GSAP + ScrollTrigger + Lenis)

```
Replace the hand-written requestAnimationFrame loop with GSAP + ScrollTrigger + Lenis. Check current docs first.
- One src/motion/ folder: lenis.js (smooth scroll on the GSAP ticker), reveal.js, count.js, parallax.js, pins.js, marquee.js, hero.js, journey.js.
- Rebuild every existing effect 1:1 (same look and timing), but with ScrollTrigger instead of reading getBoundingClientRect every frame.
- Use gsap.matchMedia(): desktop (≥900px) gets pins + parallax; mobile gets no pinning and lighter reveals; prefers-reduced-motion jumps everything to its final state.
- Anchor links and the menu scroll through Lenis (lenis.scrollTo) with the header offset.
- Sector label (S01 / HOME …) and the top progress bar update from ScrollTrigger.
Verify: record frame times with a Chrome DevTools performance trace while scrolling the full page, before vs after (give me both numbers). Screenshot 1440 and 390. Test reduced-motion. Commit.
```

---

## Prompt 4 — Hero: fix it and make it hit harder

```
Fix and upgrade the hero. It must tell a visitor in 5 seconds: Galactus Racing, RIT's Baja team since 2008, here's our car, and two actions (Meet our cars / Invest in us).

Fix first:
- Mobile (390px): today the headline is duplicated, the car is squeezed at the bottom and the buttons overlap it. Redesign the mobile hero: headline on top, Abhimanyu cut-out large and fully visible, buttons below, nothing overlapping.
- Desktop: whole buggy always visible at every viewport size (1280, 1440, 1920, and short screens like 1366×768). No horizontal scroll, no clipping during the pinned scroll.
- Use the WebP car with srcset. Drop the PNG preload.

Then upgrade the intro, ~1.6s, all on the GSAP timeline:
1. Loader: a start-light sequence (3 red lights on → all off = GO) in our style, max 1s, skipped on repeat visits (sessionStorage) and with reduced-motion.
2. Wedge wipes in along its -17° diagonal.
3. GALACTUS slides in from the left, RACING from the right, hard stop, no bounce.
4. The buggy arrives from the right with a short dust/motion streak (CSS/canvas, cheap), settles with a quick suspension compression (2–3px, once, not a bounce).
5. Spec strip (car name, weight, top speed) types in with JetBrains Mono, then the buttons.
Keep the existing pinned scroll exit (GALACTUS left, RACING right, buggy drives forward, wedge lags) but on ScrollTrigger scrub.
Desktop only: buggy tilts 1–2° toward the cursor.

Verify: screenshots at 0 / 400 / 800 / 1600ms on load, and at 0 / 25 / 50 / 100% of the pinned scroll, at 1440, 1366×768 and 390. Lighthouse mobile. Commit.
```

---

## Prompt 5 — Cars section: the showpiece

Choose one before you send it, delete the other line:
- **A (we have CAD):** "I put the car CAD at assets/models/abhimanyu.step (or .glb)."
- **B (no CAD):** "We don't have CAD. Use photos."

```
Upgrade the Cars section into the site's showpiece. [A or B line here]

Desktop:
- Keep the pinned horizontal track and progress bar, rebuilt on ScrollTrigger.
- The current car gets a scroll-driven "teardown" panel before the other cars. As you scroll, 4 stops: Chassis, Powertrain (CVT + gearbox), Suspension, Brakes/Steering. At each stop a red hairline draws from the part to a callout: Anton title, one Archivo line, one spec counting up in JetBrains Mono. A sector bar S1–S4 shows progress.
- If A: convert the CAD to GLB (Blender, Draco, under 2MB, decimate if needed), render with Three.js in studio lighting (deep blacks, red frame), lazy-load it, and rotate / slightly explode the car per stop. Pause rendering off-screen, DPR max 1.5.
- If B: do the same stops with the Abhimanyu cut-out and part close-ups (I'll add photos to assets/cars/; use labelled placeholders until then). Camera-like zoom and pan on the photo, no fake 3D. Do NOT use hero-car-3d.html's primitive buggy on the live site; it looks worse than our real car.
- "View specs" on each car opens a panel with the full spec table; a toggle compares current vs previous car.
- Evolution row: years slide in on scroll, the current car's year in red.

Mobile: no pin. The teardown becomes 4 stacked cards with the same callouts; other cars become a swipeable row with scroll-snap.

Use only facts from src/data/cars.json; anything missing shows [TODO].
Verify: screenshot each stop at 1440 and 390, DevTools trace while scrubbing (tell me the fps), confirm callouts never cover the car at any stop. Commit.
```

---

## Prompt 6 — Other home sections (send once per section)

Replace `[SECTION]` with: About, Journey, Achievements, Gallery, Sponsors, Invest, Contact.

```
Upgrade the [SECTION] section. Keep what works, then add the idea below. Same rules: tokens only, transform/opacity/clip-path only, matchMedia for mobile, reduced-motion final state.
Ideas (use the one for this section, or propose better):
- About: "EVERY CRASH TEACHES US SOMETHING." lines mask up, red line lands last; the big outline "Freedom" text drifts slowly behind. On mobile it must not sit behind the body text (it does today). Stats count up like a lap timer, staggered.
- Journey: a vertical "track" line fills with red as you scroll; each chapter's year snaps in like a split-flap board; chapter counter 01/06 ticks.
- Achievements: podium cards enter like a starting grid (staggered from the left); P1 card on ink; totals count up; award tags slide in.
- Gallery: filter tabs re-layout with a GSAP Flip animation; hover = slow zoom + caption line draws; keep the lightbox streak transition.
- Sponsors: keep the tilted tape marquees with scroll-velocity skew; tier grid fades from greyscale to colour on hover; "YOUR BRAND HERE" slot pulses once on enter.
- Invest: the ₹ raised counter counts up and the budget bars fill in sequence; package cards get the hard-shadow lift; enquiry form: validation messages slide in, success shows a toast; form posts to [Formspree endpoint / TODO].
- Contact: "LET'S RACE." wipes in on the wedge; email copies to clipboard with a toast; map stays greyscale until hover.
Verify at 1440 and 390, scroll in small steps looking for overlap, console clean. Commit.
```

---

## Prompt 7 — Team page

```
Upgrade team.html to match the home page's motion system.
- Intro headline reveal + wedge.
- Leadership portraits: duotone (ink + paper) that turns full colour on hover, name underline draws from the left.
- Sub-team tabs (Chassis, Powertrain, Suspension, Brakes, Electrical, Manufacturing, Business & Marketing): switching animates with GSAP Flip; tabs work with keyboard arrows.
- Recruitment block: "WANT TO BUILD A RACE CAR?" with the red line landing last, Apply button links to [form link / TODO].
- Placeholder people stay clearly marked [Name] until I give real ones.
Verify 1440 and 390, keyboard-only test of the tabs. Commit.
```

---

## Prompt 8 — Final QA and launch check

```
Run a full launch check using docs/How-To-Build-3D-Websites (Launch Checklist) plus CLAUDE.md. For each item: pass / fail / can't check, with proof (number, screenshot or file).
Measure: total first-load weight (mobile), JS size, Lighthouse mobile scores (performance, accessibility, SEO), fps during the hero pin and the cars track, CLS.
Test: reduced-motion end to end, keyboard-only through menu / lightbox / tabs / form, 390px with no horizontal scroll, 1366×768, real Android phone via my local network URL.
Check meta tags, OG image (1200×630), favicon, sitemap, robots.txt.
Fix every fail you can. Then give me one list of everything that still needs me: real facts marked [TODO], photos, sponsor logos, form endpoint, domain. Then push to GitHub repo Sagar-0212/G and deploy to [Vercel / Netlify / GitHub Pages].
```

---

## Later (optional) — make the admin panel real

When the site is live, the admin panel can drive the content. `admin-api.js` already defines the REST contract (`POST /auth/login`, `GET/PUT /content/:type`, `POST /enquiries`). A Spring Boot backend that implements it is a good project for you, and a strong one for your resume.
```
Read admin-api.js. Make the public pages load content from the same API when CONFIG.useMock is false, with src/data/*.json as the fallback. Then write the API spec as docs/api.md so I can build the backend in Spring Boot.
```

---

## When something looks wrong (fix prompt template)

Be specific. "Make it better" does nothing.
```
In [section], at [scroll position / moment / screen width], [what's wrong — e.g. "the buttons overlap the buggy's front wheel at 390px", "RACING exits too slowly", "car jitters when I stop scrolling"]. Expected: [what you want]. Fix it, screenshot before and after, and tell me the cause.
```
