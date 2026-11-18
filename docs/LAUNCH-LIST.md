# Before public launch: what still needs you

Everything here is either a fact only you can confirm, a file only you can supply, or a decision. Each fact is also marked `[TODO]` on the page; details and current placeholder values are in [`TODO-FACTS.md`](TODO-FACTS.md). Send the real value (or "remove") and it gets updated in `src/data/*.json`.

## 1. Facts to confirm (`[TODO]` on the page)

**Abhimanyu (M04)** (`cars.json`)
- [ ] Season/year · top speed (old site said 38 and 58 km/h) · weight · engine · transmission · suspension · brakes · chassis · tyres · steering · safety
- [ ] Car description paragraph
- [ ] Teardown stop lines: chassis, suspension, steering & cockpit, wheels & brakes
- [ ] Teardown specs: tube OD 25.4 mm · **wheel travel (no value yet)** · lock-to-lock 1.6 turns · rim Ø 10 in

**Older cars** (`cars.json`, `evolution.json`)
- [ ] Real names, years and one-line notes for GR-25 Raptor, GR-24 Titan, GR-12, GR-09, GR-05, GR-01 (all AI placeholders), plus their spec tables
- [ ] Cars intro line "Seventeen seasons, one rule…"

**Numbers and story** (`stats.json`, `journey.json`, `achievements.json`)
- [ ] About stats: years active 18 · competitions 35+ · podiums 14 · members 42 · sponsors 20+
- [ ] Journey: 6 chapters (2008, 2009, 2011, 2014, 2025, 2026)
- [ ] Results: 3 podium cards (P1 2025 MEGA ATV, P2 2024 ATV Championship, P3 2023 SAE BAJA)
- [ ] Milestones: 2011, 2016, 2021, 2025 (2008 founding is confirmed)
- [ ] Totals: 14 podiums · 6 event wins · 9 design awards
- [ ] Awards: best design report 2024 · best cost report 2023 · endurance rank 4 2022 · best safety innovation 2021

**Money** (`fundraising.json`, `packages.json`)
- [ ] Raised ₹7,80,000 of goal ₹12,00,000, and the 5 budget lines
- [ ] Package prices and perks: Bronze ₹25,000 · Silver ₹75,000 · Gold ₹2,00,000 · Title ₹5,00,000+
- [ ] Sponsor copy "in front of thousands of engineers, judges and industry leaders": keep or soften?

**Contact** (`contact.json`)
- [ ] Team email (now `team@galactusracing.in`)
- [ ] Phone number
- [ ] UPI ID
- [ ] Sponsorship lead's name ("[Name], Business Head")
- [ ] Workshop address wording

**People** (`team.json`, `subteams.json`)
- [ ] Faculty advisor name and "guiding since 2015"
- [ ] Captain, vice captain, technical head: names
- [ ] 19 sub-team members: names, roles, LinkedIn links
- [ ] "Recruitment 2026–27": right year?

## 2. Links

- [ ] **Google Form URL** for "Apply to join" → `contact.json`, the `"kind": "Apply"` entry (button scrolls to the footer until then)
- [ ] **Instagram, LinkedIn, YouTube** URLs → `contact.json` (hidden on the page until set)
- [ ] Sponsorship brochure PDF (optional) → the download link appears once it exists

## 3. Photos and logos (real ones only)

- [ ] **Gallery: 8 photos**, each with a one-line caption and category (race day / workshop / team / testing). Only 1 real photo so far
- [ ] **Portraits**: faculty advisor, captain, vice captain, technical head, plus the 19 members (or decide to launch without member photos)
- [ ] **Previous cars**: one cut-out photo per older car (tiles show "Cut-out photo of …" placeholders)
- [ ] **Sponsor logos**: only for sponsors you actually have, with their tier. The section is all placeholders now
- [ ] Optional: close-up photos for the 4 teardown stops

## 4. Setup and decisions

- [ ] **Domain**: after you import the repo on Vercel, put the real URL in `src/data/site.json` (now `galactus-racing-website.vercel.app`, a guess). Canonical links, social previews, `sitemap.xml` and `robots.txt` all read it
- [ ] **Enquiry form**: it is simulated (shows "Enquiry sent" but nothing is stored or emailed). It needs Supabase before launch, or the form should be hidden/replaced with the email link
- [ ] **Sign-off**: someone on the team approves every claim and figure (launch checklist item)
- [ ] **Real Android phone test** over your local network (not checked: I can only emulate phones)
- [ ] Git author name: commits on GitHub show as "CareConnect Developer" (your git config). Change it with `git config user.name "…"` if that's not what you want

## 5. Couldn't fix / for later

- Lighthouse mobile performance is 84–93 on home (single runs swing ±6 points), 95 on team. Remaining cost is the browser laying out the large home page (1,765 elements) and the start-lights loader delaying the hero image paint. Ideas for later: trim DOM (digit strips, duplicated marquees), lighter loader, split the GSAP bundle further. Inlining the CSS was tried and didn't help reliably
- Gallery "view" buttons appear on hover or keyboard focus on desktop (always visible on touch). That's by design, not a bug
- `admin.html` still runs on the mock API with demo login details; it's not in the production build. Replace it with Supabase auth before it is ever deployed
