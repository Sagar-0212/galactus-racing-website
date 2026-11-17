# Prompt: Build an Interactive Racing-Themed Landing Page for an Off-Road Baja Team

> Copy everything below the line into your AI tool (Claude, Cursor, etc.).
> First, fill in the **[BRACKETED]** details in Section 1. Anything you leave blank, the AI should fill with realistic placeholder content that is easy to replace later.

---

## 1. Team Details (fill these in)

- **Team / club name:** [Galactus Racing]
- **Tagline:** ["Freedom for failure "]
- **College / organisation:** [Rajarambapu Intitute of Technology Rajaramnagar Islampur]
- **Founded:** [2008]
- **Competition:** [SAE BAJA,MEGA ATV ,ATV Championship.]
- **Short about text:** [2-3 lines about the club, mission, what you build]
- **Contact email:** [EMAIL]
- **Social links:** Instagram [LINK], LinkedIn [LINK], YouTube [LINK]
- **Brand colours (if any):** [HEX CODES, or "none, you choose"]
- **Logo:** [path to logo file, or "use a placeholder"]

---

## 2. Your Role

You are a senior front-end developer and UI designer who specialises in high-energy, motorsport-style websites. Build a **complete, production-quality, single-page landing website** for an off-road **Baja SAE racing team**. The site must feel like standing in a racing paddock: loud, fast, rugged and exciting, but still clean, readable and professional enough to impress sponsors.

---

## 3. Goal of the Website

1. Introduce the team and its story in the first 5 seconds.
2. Show off the vehicles (the cars) with real technical detail.
3. Prove credibility through achievements, gallery and team members.
4. Convince companies to **sponsor** and individuals to **invest in us**.
5. Make it easy to contact the team.

**Target visitors:** sponsors and companies, college juniors who may join, judges and event organisers, fans and alumni.

---

## 4. Tech Stack

Use **plain HTML5 + CSS3 + vanilla JavaScript** so it is easy to open in VS Code and run without setup.

- No build step required. Opening `index.html` in a browser must work.
- Allowed libraries (via CDN only): **GSAP + ScrollTrigger** for animations, **AOS** (optional), **Swiper.js** for sliders, **Lightbox/GLightbox** for the gallery.
- Fonts from Google Fonts: a bold, condensed, racing-style display font (e.g. *Orbitron*, *Rajdhani*, *Teko* or *Bebas Neue*) for headings and a clean sans-serif (e.g. *Inter* or *Poppins*) for body text.
- Icons: Font Awesome or Lucide via CDN.
- Must be fully **responsive** (mobile, tablet, desktop) and mobile-first.

**Folder structure:**

```
baja-website/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   ├── images/   (hero, cars, team, gallery, sponsors, logo)
│   ├── videos/
│   └── icons/
└── README.md
```

Keep code well organised and **commented**, and use CSS variables for colours and spacing so the theme is easy to change.

---

## 5. Visual Design and Racing Atmosphere

**Overall vibe:** night-race, mud, dust, speed, engine power.

- **Colour palette (default if none given):**
  - Background: near-black `#0b0b0d` and dark charcoal `#16161a`
  - Primary accent: racing orange `#ff4d00` or safety yellow `#ffc400`
  - Secondary accent: electric white `#f5f5f5` and a steel grey `#8a8f98`
  - Optional warning-red `#e10600` for small highlights
- **Textures and details:** subtle dirt/grain overlay, tyre-tread patterns as dividers, checkered-flag strips, diagonal "speed-line" section edges, hazard-stripe borders, carbon-fibre pattern backgrounds.
- **Typography:** large uppercase headings, tight letter-spacing, italic/skewed text on key words to suggest motion.
- **Buttons:** angular (clipped corners via `clip-path`), glow on hover, a small "speed" slide animation.
- **Cards:** dark glass/steel look with orange glowing borders on hover.
- Keep a consistent design language across every section.

---

## 6. Interactive and Racing-Style Features

Include these, but keep them smooth and performant:

1. **Loading screen:** a short racing-style preloader (a speedometer needle sweeping up, or a "3-2-1-GO" start-light sequence), then fade into the site.
2. **Custom cursor (desktop only):** a small ring/crosshair that grows over buttons and links.
3. **Scroll progress bar:** a thin orange bar at the top, like a lap progress indicator.
4. **Sticky navbar:** transparent at the top, turns dark with blur after scrolling; active link highlights as you scroll (scroll-spy). Hamburger menu on mobile.
5. **Smooth scrolling** between sections.
6. **Parallax effects:** hero background and a mud/dust layer move at different speeds.
7. **Animated counters:** numbers count up when scrolled into view (podiums, wins, team members, years).
8. **Reveal-on-scroll animations:** fade, slide and clip-reveal for headings and cards.
9. **Speedometer / rev-meter widget:** a gauge that animates while scrolling (e.g. maps scroll position to RPM).
10. **Hover effects:** cars tilt slightly in 3D, gallery images zoom, team cards flip or reveal social links.
11. **Back-to-top button:** styled like a gear shifter or a small up-arrow with a glow.
12. **Optional sound toggle:** an engine-rev sound that plays only when the user clicks a button (never autoplay).
13. **Respect `prefers-reduced-motion`:** turn off heavy animations for users who ask for that.

---

## 7. Page Structure (single-page with anchor navigation)

**Navbar links in this order:** Home · Cars · Achievements · Gallery · Team · Sponsors · Invest in Us · Contact (the Contact button should be styled as a highlighted call-to-action).

### 7.1 Home (Hero)
- Full-screen hero with a looping background video or a high-quality off-road car image with dark overlay (use a placeholder if no media is given).
- Large headline with the team name and tagline, plus a short supporting sentence.
- Two buttons: **"Meet Our Cars"** and **"Invest in Us"**.
- Animated scroll-down indicator.
- Under the hero: a **stats strip** with animated counters (e.g. Years Active, Competitions, Podium Finishes, Team Members, Sponsors).
- A short **"Who We Are"** block: mission, story, and what Baja SAE is, in simple language.

### 7.2 Cars
- Showcase each vehicle the team has built (current car first, then previous ones).
- Each car card includes: name, year, photo/slider, and a short description.
- A clickable **"View Specs"** panel or modal showing:
  - Engine, transmission, suspension, brakes, chassis material, weight, top speed, tyre size, steering, safety features.
- A **timeline** or horizontal scroll showing the evolution of cars year by year.
- Optional: a simple 360° viewer or image carousel for the current car.
- Add a "Spec comparison" toggle between the current and previous car (optional, but nice).

### 7.3 Achievements
- A vertical **timeline** of milestones (year, event, result).
- Highlight cards for major wins: rank, event name, location, year.
- A trophy/medal icon style, with **animated counters** for totals.
- A section for **"Awards & Recognition"** (best design, best cost report, endurance rank, etc.).
- Link to news or event pages if available.

### 7.4 Gallery
- Responsive **masonry or grid layout** with category filter buttons: *All · Race Day · Workshop · Team · Testing*.
- Click to open a **lightbox** with next/previous arrows, captions and keyboard support.
- Lazy-load images.
- An optional embedded **video highlights** row (YouTube embed placeholders).

### 7.5 Team
- Sections: **Faculty Advisor**, **Team Captain / Leads**, **Sub-teams** (Chassis, Powertrain, Suspension, Brakes, Electrical, Manufacturing, Business & Marketing).
- Each member card: photo, name, role, and social icons (LinkedIn/Instagram).
- A filter/tab to switch between sub-teams.
- A short "What each sub-team does" description.
- A **"Join Us"** call-to-action with a recruitment message and a link/form.

### 7.6 Sponsors
- Heading: "Powered By Our Partners".
- Logo grid grouped by tier: **Title Sponsor, Gold, Silver, Bronze/Supporters**, with a grayscale-to-colour hover effect.
- An auto-scrolling **logo marquee** under the grid.
- A short paragraph on what sponsors get (brand visibility, networking, recruitment access, CSR value).
- A **"Become a Sponsor"** button that scrolls to the Invest section.

### 7.7 Invest in Us
- A persuasive section explaining **why to support the team**: where the money goes (materials, testing, travel, registration, safety gear).
- A **fund breakdown** shown as an animated chart (doughnut or progress bars), with the budget goal and amount raised (placeholder values).
- **Sponsorship packages** as pricing-style cards (e.g. Bronze / Silver / Gold / Title) listing benefits (logo on car, logo on pit shirts, social media shoutouts, banner at events, etc.), with the amounts as placeholders.
- A **"Download Sponsorship Brochure"** button (link to a PDF placeholder).
- A **contact/enquiry form** (name, company, email, phone, sponsorship interest, message). Add front-end validation and a success message. Include a clear comment where a backend or form service (e.g. Formspree/EmailJS/Google Forms) can be connected.
- Show **UPI/bank details or contact person** as placeholder text only. Do not hard-code any real account numbers.

### 7.8 Contact and Footer
- Address, email, phone, and an **embedded map** (Google Maps iframe placeholder).
- Social media icons.
- Footer with quick links, copyright, and a checkered-flag strip design.
- A small "Made by [TEAM NAME] Web Team" credit line.

---

## 8. Content Rules

- Use **realistic placeholder text** written for a Baja SAE team, never "Lorem ipsum".
- Mark every placeholder clearly with an HTML comment like `<!-- REPLACE: team photo -->` so it is easy to find and swap.
- Use placeholder images from a service such as Unsplash or placehold.co with proper `alt` text, and list in the README which images need to be replaced.
- Write copy in simple, confident, energetic English.

---

## 9. Quality Requirements

**Performance**
- Lazy-load images and videos, compress assets, defer non-critical JS.
- Aim for Lighthouse scores of 90+ for Performance, Accessibility, Best Practices and SEO.

**Accessibility**
- Semantic HTML (`header`, `nav`, `main`, `section`, `footer`).
- Good colour contrast, visible keyboard focus states, `alt` text on all images, `aria-label` on icon buttons.

**SEO**
- Proper `<title>`, meta description, Open Graph and Twitter tags, a favicon, and a logical heading hierarchy (one `h1`).

**Cross-browser**
- Works on the latest Chrome, Edge, Firefox and Safari, and on mobile browsers.

**Code quality**
- Clean, readable, commented code. No unused code. Separate files for HTML, CSS and JS.

---

## 10. Deliverables

1. All files in the folder structure above, with full working code (no "rest of the code here" shortcuts).
2. A `README.md` that explains:
   - How to run the site locally.
   - How to replace images, text, sponsors and team members.
   - How to connect the contact form.
   - How to deploy for free (GitHub Pages / Netlify / Vercel).
3. A short list of **optional upgrades** (e.g. CMS, backend for sponsor enquiries, live race countdown, blog/news section).

---

## 11. How to Work

1. First, briefly confirm the plan: the section order, colour palette and fonts you will use.
2. Then generate the code **one file at a time**: `index.html`, then `style.css`, then `main.js`, then `README.md`.
3. After the code, give a quick checklist of everything I need to replace with my real content.
4. If something is unclear, make a sensible assumption, state it in one line, and keep going rather than stopping to ask.
