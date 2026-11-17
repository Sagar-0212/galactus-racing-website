# Galactus Racing — Website

Single-page site for Galactus Racing, the Baja team of Rajarambapu Institute of Technology, Rajaramnagar. Plain HTML, CSS and JavaScript. No build step.

```
baja-website/
├── index.html      page structure + static copy
├── css/style.css   all styles (theme variables at the top)
├── js/main.js      content data + all interactions
├── assets/         images/, videos/, icons/ (add your files here)
└── README.md
```

## Run locally
Open `index.html` in a browser. For the best result (map embed, form fetch), use a local server:
- VS Code: install **Live Server**, right-click `index.html` > *Open with Live Server*
- or `npx serve .` / `python -m http.server`

## Edit content
Search the project for `REPLACE` to find every placeholder.

| What | Where |
|---|---|
| Colours, fonts, spacing | `:root` in `css/style.css` |
| Hero image / video | `.hero-bg` in `index.html` (video snippet is in the comment) |
| Stats numbers | `data-count` attributes in the stats strip |
| Cars, specs, evolution | `CARS` and `EVOLUTION` in `js/main.js` |
| Gallery photos | `GALLERY` in `js/main.js` (replace the `ph(...)` call with `"assets/images/gallery/xyz.jpg"`) |
| Team members | `LEADS` and `SUBTEAMS` in `js/main.js` (the `memberCard` function sets photo + social links) |
| Sponsor logos | Sponsors section in `index.html`; marquee names in `MARQUEE` |
| Budget chart | `BUDGET` in `js/main.js` and the "raised of" label in `index.html` |
| Packages | Invest section in `index.html` |
| Achievements | Achievements section in `index.html` |
| Contact, socials, map | Contact section in `index.html` |
| YouTube videos | `data-yt="VIDEO_ID"` on each `.video` button |
| Brochure | put the PDF at `assets/sponsorship-brochure.pdf` |

**Images to replace:** hero, 3 car sets (7 photos), 9 gallery photos, 4 lead + ~19 sub-team portraits, 14 sponsor logos, 3 video thumbnails, logo, favicon, OG share image (1200×630). Use WebP/JPG under ~250 KB each.

## Connect the enquiry form
Front-end validation is built in. Without a backend, the form simulates success.
- **Formspree (easiest):** create a form at formspree.io, then set `FORM_ENDPOINT = "https://formspree.io/f/YOUR_ID"` in `js/main.js`.
- **EmailJS:** add their SDK in `index.html`, then replace the `fetch` call in `form()` with `emailjs.sendForm(serviceId, templateId, f)`.
- **Google Forms:** POST to the form's `formResponse` URL with the matching `entry.XXXX` field names (use `mode: "no-cors"`).

## Deploy (free)
- **GitHub Pages:** push the folder to a repo > Settings > Pages > Deploy from branch `main`, root.
- **Netlify:** drag the folder onto app.netlify.com/drop.
- **Vercel:** `npx vercel` in the folder, accept defaults.

## Notes
- Libraries: Google Fonts (Teko, Barlow) and Lucide icons via CDN. Everything else is vanilla JS, so no GSAP/Swiper/GLightbox dependency is needed.
- `prefers-reduced-motion` disables the preloader, parallax, grain, tilt and count-up animations.
- The engine sound is synthesised in the browser and only plays when the button is clicked.
- Never publish real bank account numbers on the page; share them on request.

## Optional upgrades
- Headless CMS (Decap CMS, Sanity) so non-developers can edit team and gallery
- Serverless backend to store sponsor enquiries in a sheet or CRM
- Live countdown to the next competition
- News / blog section for race reports
- 360° viewer for the current car (image sequence spin)
- Hindi / Marathi language toggle
