# Facts to confirm

Everything below is on the site today but was written as a placeholder. Each one is marked `[TODO]` on the page.
Fill in the real value (or "remove"), and Claude will update `src/data/*.json` and drop the `[TODO]`.

File in brackets = where the value lives.

---

## 1. Abhimanyu (M04) — current car  `[src/data/cars.json → id "m04"]`

The name **Abhimanyu (M04)** is confirmed. Everything else is unverified.

| Spec | On the site now | Real value |
|---|---|---|
| Season / year | 2026 | |
| Top speed | `[TODO]` (old site said 38 km/h in the hero, 58 km/h in the table) | |
| Weight | 158 kg (also in the hero strip and evolution row) | |
| Engine | B&S 10 HP Vanguard, 305 cc | |
| Transmission | CVT + 2-stage gearbox, 9.2:1 | |
| Suspension | Double wishbone F / trailing arm R | |
| Brakes | Hydraulic disc, inboard rear | |
| Chassis | AISI 4130 chromoly, 25.4 mm | |
| Tyres | 23×7–10 F / 22×10–10 R | |
| Steering | Rack & pinion, 1.6 turns | |
| Safety | 5-pt harness, kill switches, firewall | |
| Description | "Our lightest and stiffest car yet. Redesigned chromoly frame, in-house tuned CVT and a four-wheel independent setup built to finish the four-hour endurance." | |
| Cut-out photo for the cars section | none (placeholder) | |

## 2. Older cars  `[src/data/cars.json, src/data/evolution.json]`

All names, years and specs are AI placeholders.

| On the site now | Year | Note on the site | Real name / year / note |
|---|---|---|---|
| GR-25 Raptor | 2025 | "Took P1 in endurance at MEGA ATV. Zero DNFs." 172 kg, 55 km/h, full spec table | |
| GR-24 Titan | 2024 | "First fully in-house gearbox. P2 overall at the ATV Championship." 188 kg, 52 km/h, full spec table | |
| GR-12 | 2020 | First chromoly chassis, −22 kg | |
| GR-09 | 2017 | Switched to CVT | |
| GR-05 | 2013 | First independent front suspension | |
| GR-01 | 2009 | First car. Steel frame, solid axle | |

Also: "Seventeen seasons, one rule…" (cars intro line).

## 3. About stats  `[src/data/stats.json]`

| Stat | Now | Real |
|---|---|---|
| Years active | 18 | |
| Competitions | 35+ | |
| Podium finishes | 14 | |
| Team members | 42 | |
| Sponsors | 20+ | |

## 4. Journey chapters  `[src/data/journey.json]`

| Year | Title | Story (short) | Real? |
|---|---|---|---|
| 2008 | The Spark | Twelve students, one borrowed welding machine | |
| 2009 | The First Build | GR-01, half the campus came to hear it start | |
| 2011 | First Competition | Broke, fixed in the paddock, finished endurance | |
| 2014 | Challenges and Lessons | Failed inspections, snapped driveshafts | |
| 2025 | Wins and Growth | Chromoly, CVT rig, own gearbox, endurance champions at MEGA ATV | |
| 2026 | Today and the Road Ahead | "Forty-two of us, one workshop, Abhimanyu (M04)" | |

## 5. Results  `[src/data/achievements.json]`

**Podium cards**
| Now | Real |
|---|---|
| P1 · 2025 · Endurance race · MEGA ATV Championship, Indore. Four hours, zero DNFs | |
| P2 · 2024 · Overall · ATV Championship, Pune. First car with an in-house gearbox | |
| P3 · 2023 · Hill climb · SAE BAJA India, Pithampur. Out of 100+ teams | |

**Milestones**
| Now | Real |
|---|---|
| 2008 Team founded — twelve students and one welding machine (2008 itself is confirmed) | |
| 2011 First SAE BAJA finish | |
| 2016 Top 10 overall, SAE BAJA India, 100+ teams | |
| 2021 In-house CVT rig | |
| 2025 Endurance champions, P1 at MEGA ATV | |

**Totals:** 14 podiums · 6 event wins · 9 design awards → real: 

**Awards:** Best design report 2024 · Best cost report 2023 · Endurance rank 4 2022 · Best safety innovation 2021 → real: 

## 6. Gallery  `[src/data/gallery.json]`

Only one real photo so far (g8, "Design presentation"). The other 8 tiles are empty placeholders; their captions describe photos we don't have yet. Send real photos with a one-line caption and category (race day / workshop / team / testing).

## 7. Sponsors  `[src/data/sponsors.json]`

- No real sponsor logos yet (all tiers are placeholders). Send logos only for sponsors we actually have, with their tier.
- Copy: "in front of thousands of engineers, judges and industry leaders" — keep or soften?

## 8. Fundraising and packages  `[src/data/fundraising.json, src/data/packages.json]`

| Item | Now | Real |
|---|---|---|
| Raised so far | ₹7,80,000 | |
| Season goal | ₹12,00,000 | |
| Budget: Materials & parts | ₹4,20,000 | |
| Budget: Testing & tooling | ₹2,20,000 | |
| Budget: Travel & logistics | ₹2,40,000 | |
| Budget: Registration | ₹1,80,000 | |
| Budget: Safety gear | ₹1,40,000 | |
| Bronze package | ₹25,000 — website logo, social thank-you, certificate | |
| Silver package | ₹75,000 — + side panel logo, pit shirts | |
| Gold package | ₹2,00,000 — + large car logo, event banner, recruitment session | |
| Title package | ₹5,00,000+ — co-branding, nose/hood, car display at your office | |
| Sponsorship brochure (PDF) | link is `#` | |

## 9. Contact  `[src/data/contact.json]`

| Item | Now | Real |
|---|---|---|
| Email | team@galactusracing.in | |
| Phone | +91 XXXXX XXXXX | |
| Instagram / LinkedIn / YouTube | links are `#` | |
| UPI ID | [team-upi-id]@bank | |
| Sponsorship lead | [Name], Business Head | |
| Workshop address | Galactus Racing Workshop, RIT, Rajaramnagar, Islampur, Sangli, Maharashtra 415414 | confirm wording |
| Enquiry form destination | not connected (shows a success toast only) | Formspree / email / backend? |

Never put bank account numbers on the page.

## 10. People  `[src/data/team.json, src/data/subteams.json]`

- Faculty advisor: "Prof. [Name]", "Guiding the team since 2015" `[TODO]`
- Captain, vice captain, technical head: names
- 19 sub-team members (Chassis 3, Powertrain 3, Suspension 3, Brakes 2, Electrical 2, Manufacturing 3, Business & Marketing 3): names, roles, photos, LinkedIn links
- Recruitment: "Apply to join" link, and whether "Recruitment 2026–27" is right
