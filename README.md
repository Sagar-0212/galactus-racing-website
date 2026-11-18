# Galactus Racing website

Website for **Galactus Racing**, the Baja SAE team of Rajarambapu Institute of Technology (RIT), Rajaramnagar, Islampur. Founded 2008. *Freedom for failure.*

The site has three jobs, in this order: win sponsors (Invest in Us), recruit students (Join), and show the cars and results.

- **Home** (`index.html`): hero, about, journey, cars (Abhimanyu teardown + previous cars), results, gallery, sponsors, invest (packages + enquiry form), contact.
- **Team** (`team.html`): leadership, sub-teams, recruitment.
- **404** (`404.html`).

> Content marked `[TODO]` on the page is placeholder text that still needs the real facts. The checklist is in [`docs/TODO-FACTS.md`](docs/TODO-FACTS.md).

## Tech stack

- **Vite 8**, multi-page, plain JavaScript + CSS (no framework on the public pages)
- **GSAP** + ScrollTrigger (scroll motion), **Lenis** (smooth scroll, driven from the GSAP ticker)
- **MTVNA design system** for tokens, fonts and components (`_ds/`)
- Content in JSON (`src/data/*.json`), rendered to static HTML at build time by a small Vite plugin (`vite.config.js`)
- Deploy target: **Vercel** (`vercel.json`: build `npm run build`, output `dist`)

## Run it

Needs Node 20+.

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve dist/ at http://localhost:4173
```

## Folder map

| Path | What it is |
|---|---|
| `index.html`, `team.html`, `404.html` | Pages. Their bodies are `<!-- @render … -->` markers filled at build time |
| `src/data/*.json` | All content (cars, journey, results, gallery, team, sponsors, packages, contact) and `site.json` (domain, used for canonical/OG tags, sitemap, robots) |
| `src/render/` | Turns the JSON into HTML (design-system components in `ui.js`, header/footer in `layout.js`) |
| `src/home.js`, `src/team.js`, `src/notfound.js` | Page behaviour: menu, gallery filter, lightbox, spec sheet, enquiry form, team tabs |
| `src/motion/` | GSAP / ScrollTrigger / Lenis motion (hero, cars teardown, sections, gallery, team) |
| `src/styles/` | CSS per page plus shared base and components |
| `src/api/enquiries.js` | Enquiry form submit. **Simulated** for now (nothing is stored or emailed) |
| `src/admin/`, `admin.html` | Admin panel, **dev only** (`npm run dev` → `/admin.html`), runs on a mock API |
| `public/` | Files shipped as-is: images, icons, `favicon.ico`, `site.webmanifest` |
| `_ds/` | MTVNA design system (tokens, fonts, rules) |
| `docs/` | Build prompts, guides, and `TODO-FACTS.md` |
| `archive/`, `uploads/` | Reference only (old design source, unused images). Not shipped |

## Backend (later)

The admin panel and the enquiry form will connect to **Supabase** (database, email login, image storage) once the frontend is finished. Until then the admin dashboard (`admin.html`) runs in demo mode: content is seeded from `src/data/*.json` and changes are saved only in your browser (`src/admin/api.js`, which also holds the demo login). That is not real security, and the page is not part of the production build; build it for testing with `npm run build:admin`, then `npm run preview` and open `/admin.html`. Supabase keys will live in `.env` files, which are git-ignored.
