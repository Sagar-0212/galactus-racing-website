// Home page sections, rendered from src/data/*.json at build time.
// Markup mirrors archive/claude-design/Galactus Racing.dc.html; data-* hooks are used by src/motion/legacy.js.
import { esc, t, todo, pad2, inr, button, iconButton, headline, card, tag, tabs, input, select, slot } from './ui.js';
import { header, contactDetails, footerBar } from './layout.js';

const spec = (car, k) => (car.specs.find((s) => s.k === k) || {}).v || '';

export function hero({ cars }) {
  const car = cars.find((c) => c.current) || cars[0];
  const heroSpec = [car.name, spec(car, 'Weight'), spec(car, 'Top speed')];
  const layer = (name) =>
    `<div class="hero__layer hero__layer--${name}" data-l="${name}"><div class="hero__in" data-in="${name}"><img src="/assets/hero-l-${name}.webp" width="1724" height="912" decoding="async" alt="" draggable="false"></div></div>`;
  return `<section id="home" class="hero" data-hero="" data-sector-label="S01 / Home">
    <div class="hero__sticky" data-hero-sticky="">
      <h1 class="sr-only">Galactus Racing — Freedom for failure</h1>
      <div class="hero__stage" data-stage="">
        <div class="hero__bg" aria-hidden="true"></div>
        ${layer('wedge')}${layer('galactus')}${layer('racing')}
        <div class="hero__car" data-l="car">
          <div class="hero__car-in" data-in="car">
            <img data-hero-main="" fetchpriority="high" src="/assets/hero-car-clean.png" width="1015" height="645" decoding="async" alt="Team Galactus Racing Baja car Abhimanyu, number M04" draggable="false">
          </div>
        </div>
        <div class="hero__details" data-l="details">
          <a href="#about" class="hero__scroll" aria-label="Scroll to next section"><span class="hero__scroll-line"></span>Scroll ↓</a>
          <span class="hero__spec">${heroSpec.map((s) => `<span>${t(s)}</span>`).join('')}</span>
        </div>
      </div>
      <div class="hero__badge" data-hero-badge="">
        <div class="hero__badge-text"><span>Baja SAE India</span><span>Est. 2008</span></div>
      </div>
      <div class="hero__narrow" data-hero-narrow="">
        <img src="/assets/logo-gr.png" width="640" height="446" alt="Galactus Racing logo" class="hero__narrow-logo">
        ${headline({ as: 'p', size: 'xl', text: 'Galactus Racing.', accent: 'Racing.' })}
      </div>
      <div class="hero__ui" data-hero-ui="">
        ${button({ label: 'Meet our cars', iconRight: '→', attr: { 'data-go': 'cars' } })}
        ${button({ label: 'Invest in us', variant: 'accent', iconRight: '↗', attr: { 'data-go': 'invest' } })}
      </div>
    </div>
  </section>`;
}

const BAJA_EVENTS = [
  { group: 'Static events', items: ['Design', 'Cost', 'Sales'] },
  { group: 'Dynamic events', items: ['Acceleration', 'Hill climb', 'Suspension', 'Endurance · 4 h'] },
];

export function about({ stats }) {
  const events = BAJA_EVENTS.map((g, gi) => `<div class="about__evgroup">
      <span class="micro micro--inv">${esc(g.group)}</span>
      <div class="about__evitems">${g.items.map((label, i) => `<span class="about__ev"><span class="about__ev-n">${pad2(gi * 3 + i + 1)}</span>${esc(label)}</span>`).join('')}</div>
    </div>`).join('');
  const statsHtml = stats.map((s, i) => `<div class="stat" data-reveal="" data-delay="${i * 90}">
      <span class="micro micro--inv">${pad2(i + 1)}</span>
      <span class="stat__num"><span data-count="${s.n}">0</span><span class="stat__suffix">${esc(s.suffix)}</span></span>
      <span class="stat__label">${esc(s.label)}${todo(s.todo)}</span>
      <div class="stat__track"><div class="stat__bar" data-bar="100"></div></div>
    </div>`).join('');
  return `<section id="about" class="about" data-scene="" data-sector-label="S02 / Who we are">
    <div class="about__bigtext" data-hx="-1.1" aria-hidden="true">Freedom for failure — Freedom for failure</div>
    <div class="about__top" data-reveal="">
      <span class="eyebrow eyebrow--inv"><span class="eyebrow__line"></span>Who we are</span>
      <span class="micro micro--inv about__since">RIT Rajaramnagar · Since 2008</span>
    </div>
    <div class="about__grid">
      <div data-reveal="">${headline({ as: 'h2', size: 'l', inverse: true, text: 'Every crash teaches us something.', accent: 'teaches us something.' })}</div>
      <div class="about__col">
        <p class="about__lead" data-reveal="">Galactus Racing is the official Baja team of Rajarambapu Institute of Technology. Since 2008 we have designed, fabricated and raced single-seat off-road cars against the best college teams in India.</p>
        <div class="about__baja" data-reveal="">
          <div class="about__baja-head"><strong>What is Baja SAE?</strong><span class="micro micro--inv">The format</span></div>
          <p class="about__baja-text">Teams build a rugged off-road car around a standard engine. Cars are judged on design, cost and sales, then pushed through acceleration, hill climb, suspension and a four-hour endurance race.</p>
          <div class="about__events">${events}</div>
        </div>
      </div>
    </div>
    <div class="about__stats">${statsHtml}</div>
  </section>`;
}

export function journey({ journey: chapters }) {
  const items = chapters.map((c, i) => `<li class="jr__item" data-reveal="" data-delay="${(i % 3) * 90}">
      <span class="jr__dot" data-jdot="" aria-hidden="true"></span>
      <span class="jr__year">${esc(c.date)}</span>
      <div class="jr__body"><strong class="jr__title">${esc(c.title)}</strong><span class="jr__story">${t(c.story)}</span></div>
    </li>`).join('');
  return `<section id="journey" class="jr" data-scene="" data-sector-label="S02 / Journey">
    <div class="jr__bigtext" data-hx="0.9" aria-hidden="true">2008 — 2026 — 2008 — 2026</div>
    <div class="jr__grid">
      <div class="jr__side">
        <span class="eyebrow" data-reveal=""><span class="eyebrow__line"></span>Our journey</span>
        <div data-reveal="">${headline({ as: 'h2', size: 'l', text: 'Built crash by crash.', accent: 'crash by crash.' })}</div>
        <p class="jr__lead" data-reveal="">Every car we build carries the scars of the one before it. Six chapters, from one borrowed welding machine to the podium.</p>
        <div class="jr__counter" data-reveal=""><span class="jr__count" data-jcount="">01</span><span class="micro jr__of">/ ${pad2(chapters.length)} chapters</span></div>
      </div>
      <ol class="jr__list" data-jlist="">
        <span class="jr__rail" aria-hidden="true"><span class="jr__fill" data-jfill=""></span></span>
        ${items}
      </ol>
    </div>
  </section>`;
}

export function cars({ cars: list, evolution }) {
  const carsHtml = list.map((car) => `<article class="car" data-scene="">
      <div class="car__media">
        <span class="car__code" data-px="0.25" aria-hidden="true">${esc(car.code)}</span>
        <div class="car__photo" data-px="-0.12">${slot({ src: car.photo, alt: car.name, placeholder: 'Cut-out photo of ' + car.name.replace(' [TODO]', ''), fit: 'contain' })}</div>
        <span class="car__tag${car.current ? ' car__tag--current' : ''}">${t(car.tag)}</span>
      </div>
      <div class="car__info">
        <h3 class="car__name">${t(car.name)}</h3>
        <p class="car__desc">${t(car.desc)}</p>
        <dl class="car__specs">${car.specs.map((sp) => `<dt>${esc(sp.k)}</dt><dd>${t(sp.v)}</dd>`).join('')}</dl>
      </div>
    </article>`).join('');
  const evo = evolution.map((e) => `<li class="evo__item"><span class="evo__year">${esc(e.year)}</span><strong class="evo__name">${esc(e.name)}</strong><span class="evo__note">${t(e.note)}</span></li>`).join('');
  return `<section id="cars" class="cars" data-pin="" data-sector-label="S03 / Cars">
    <div class="cars__sticky">
      <div class="cars__top micro"><span>The machines</span><span>Scroll to drive →</span></div>
      <div class="cars__track" data-track="">
        <div class="cars__intro">
          ${headline({ as: 'h2', size: 'xl', text: 'Our cars.', accent: 'cars.' })}
          <p class="cars__lead">Seventeen seasons, one rule: lighter, stiffer, faster than last year. Current car first.<span class="todo"> [TODO]</span></p>
        </div>
        ${carsHtml}
        <div class="evo">
          <span class="eyebrow eyebrow--plain">Evolution</span>
          <ol class="evo__list">${evo}</ol>
        </div>
      </div>
      <div class="cars__progress"><div class="cars__bar" data-pinbar=""></div></div>
    </div>
  </section>`;
}

export function achievements({ achievements: a }) {
  const cards = a.podiums.map((p) => `<div data-reveal="">${card({ eyebrow: `${p.place} · ${p.year}`, title: p.title, body: t(p.detail), tone: p.featured ? 'ink' : 'paper', interactive: true })}</div>`).join('');
  const ms = a.milestones.map((m) => `<li class="ach__ms" data-reveal=""><span class="ach__ms-year">${m.year}</span><div class="ach__ms-body"><strong class="ach__ms-title">${esc(m.title)}</strong><span class="ach__ms-note">${t(m.detail)}</span></div></li>`).join('');
  const totals = a.totals.map((c) => `<div class="ach__total"><span class="ach__total-n" data-count="${c.n}">0</span><span class="ach__total-label">${esc(c.label)}${todo(c.todo)}</span></div>`).join('');
  return `<section id="achievements" class="ach" data-scene="" data-sector-label="S04 / Results">
    <span class="ach__p1" data-speed="0.4" aria-hidden="true">P1</span>
    <div class="ach__wrap">
      <div data-reveal="">${headline({ as: 'h2', size: 'xl', text: 'Podiums. Plural.', accent: 'Plural.' })}</div>
      <div class="ach__cards">${cards}</div>
      <div class="ach__grid">
        <ol class="ach__list">${ms}</ol>
        <div class="ach__side">
          <div class="ach__totals">${totals}</div>
          <span class="eyebrow eyebrow--plain">Awards &amp; recognition</span>
          <div class="ach__awards">${a.awards.map((x) => tag(x.title)).join('')}</div>
        </div>
      </div>
    </div>
  </section>`;
}

export const GAL_CATS = { race: 'Race day', workshop: 'Workshop', team: 'Team', testing: 'Testing' };
export const galColCount = (w) => (w < 640 ? 1 : w < 960 ? 2 : 3);

// Also used at runtime by src/home.js when the filter or column count changes.
export function galleryGrid(items, nCols) {
  const speeds = [-0.12, 0.1, -0.05];
  const cols = Array.from({ length: nCols }, (_, i) => ({ speed: nCols === 1 ? 0 : speeds[i], items: items.map((g, j) => ({ g, j })).filter(({ j }) => j % nCols === i) }));
  return cols.map((col, i) => `<div class="gal__col" data-speed="${col.speed}">${col.items.map(({ g, j }, r) => {
    const cat = GAL_CATS[g.category];
    return `<figure class="gal__fig" data-reveal="" data-delay="${i * 90 + r * 120}">
        <div class="gal__card" data-gcard="" style="aspect-ratio:${esc(g.shape)}">
          <div class="gal__img" data-gimg="">${slot({ src: g.photo, alt: g.alt || g.caption, placeholder: g.caption })}</div>
          <div class="gal__ov" data-gov="" aria-hidden="true"></div>
          <div class="gal__cap" data-gcap="" aria-hidden="true"><span class="gal__cap-cat">${esc(cat)}</span><span class="gal__cap-text">${esc(g.caption)}</span></div>
          <span class="gal__line" data-gline="" aria-hidden="true"></span>
          <button type="button" class="gal__btn" data-gbtn="" data-open="${j}" aria-label="View ${esc(g.caption)} fullscreen">↗</button>
        </div>
        <figcaption class="gal__figcap"><span>${esc(g.caption)}</span><span class="gal__figcap-cat">${esc(cat)}</span></figcaption>
      </figure>`;
  }).join('')}</div>`).join('');
}

export function gallery({ gallery: items }) {
  const tabItems = [{ value: 'all', label: 'All', count: items.length }, ...Object.entries(GAL_CATS).map(([value, label]) => ({ value, label }))];
  return `<section id="gallery" class="gal" data-scene="" data-sector-label="S05 / Gallery">
    <div class="gal__head">
      <div data-reveal="">${headline({ as: 'h2', size: 'l', inverse: true, text: 'Paddock diaries.', accent: 'diaries.' })}</div>
      ${tabs({ items: tabItems, value: 'all', inverse: true, attr: { 'data-gal-tabs': '' } })}
    </div>
    <div class="gal__grid" data-gal-grid="" style="--cols:3">${galleryGrid(items, 3)}</div>
  </section>`;
}

export function lightbox() {
  return `<div class="lb" data-lb="" role="dialog" aria-modal="true" aria-label="Gallery viewer" hidden>
    <div class="lb__top">
      <span class="lb__pos"><span class="lb__pos-n" data-lb-pos="">01</span> / <span data-lb-total="">01</span> · <span data-lb-cat=""></span></span>
      <button type="button" class="lb__close" data-lb-close="">Close ✕</button>
    </div>
    <div class="lb__mid" data-lb-mid="">
      <span class="lb__streak" data-lb-streak="" aria-hidden="true"></span>
      <div class="lb__stage" data-lb-stage=""></div>
      <div class="lb__nav lb__nav--prev">${iconButton({ icon: '←', label: 'Previous photo', variant: 'inverse', size: 56, attr: { 'data-lb-prev': '' } })}</div>
      <div class="lb__nav lb__nav--next">${iconButton({ icon: '→', label: 'Next photo', variant: 'inverse', size: 56, attr: { 'data-lb-next': '' } })}</div>
    </div>
    <div class="lb__bottom">
      <span class="lb__cap" data-lb-cap=""></span>
      <div class="lb__dots" data-lb-dots=""></div>
    </div>
  </div>`;
}

export function sponsors({ sponsors: sp }) {
  const marq = [...sp.marquee, ...sp.marquee].map((m) => `<span class="sp__m1-item">${esc(m)}<span class="sp__accent">↗</span></span>`).join('');
  const marq2 = [...sp.benefits, ...sp.benefits].map((m) => `<span class="sp__m2-item">${esc(m)}<span class="sp__accent">●</span></span>`).join('');
  const tiers = sp.tiers.map((tr) => `<div class="sp__tier" data-reveal="">
      <div class="sp__tier-name"><span class="sp__tier-title">${esc(tr.name)}</span><span class="micro">${esc(tr.note)}</span></div>
      ${Array.from({ length: tr.slots }, (_, i) => `<div class="sp__slot" style="height:${esc(tr.height)}">${slot({ placeholder: `${tr.slotLabel} ${i + 1}`, fit: 'contain' })}</div>`).join('')}
    </div>`).join('');
  return `<section id="sponsors" class="sp" data-scene="" data-sector-label="S07 / Sponsors">
    <div class="sp__head" data-reveal="">${headline({ as: 'h2', size: 'l', text: 'Powered by our partners.', accent: 'partners.' })}</div>
    <div class="sp__tapes">
      <div class="sp__tape sp__tape--ink"><div class="sp__m1" data-marq="1">${marq}</div></div>
      <div class="sp__tape sp__tape--paper"><div class="sp__m2" data-marq="-1">${marq2}</div></div>
    </div>
    <div class="sp__tiers">${tiers}</div>
    <div class="sp__cta">
      <p class="sp__text" data-reveal="">Your brand on a race car, in front of thousands of engineers, judges and industry leaders. Sponsors get <strong>visibility</strong> on the car, pit gear and our channels, <strong>networking</strong> at national events, early <strong>recruitment access</strong> and real <strong>CSR value</strong>.</p>
      ${button({ label: 'Become a sponsor', size: 'lg', iconRight: '↗', attr: { 'data-go': 'invest' } })}
    </div>
  </section>`;
}

export function invest({ fundraising: f, packages, contact }) {
  const total = f.budget.reduce((s, b) => s + b.amount, 0);
  const budget = f.budget.map((b) => {
    const pct = Math.round((b.amount / total) * 100);
    return `<li class="inv__b"><span class="inv__b-pct">${pct}%</span><div class="inv__b-track"><div class="inv__b-bar" data-bar="${pct}" style="width:${pct}%"></div></div><span class="inv__b-label">${esc(b.label)}</span><span class="inv__b-amt">${inr(b.amount)}${todo(f.todo)}</span></li>`;
  }).join('');
  const pk = packages.map((p) => {
    const price = inr(p.price) + (p.plus ? '+' : '') + (p.featured ? ' · Most popular' : '') + (p.todo ? ' [TODO]' : '');
    const perks = `<ul class="inv__perks">${p.perks.map((k) => `<li><span class="inv__perk-arrow">→</span>${esc(k)}</li>`).join('')}</ul>`;
    // Two spans on purpose: the original rendered "Choose" and the name as separate flex items (10px gap).
    const btn = button({ html: `<span>Choose</span><span>${esc(p.name)}</span>`, size: 'sm', variant: p.featured ? 'inverse' : 'primary', iconRight: '↗', attr: { 'data-choose': p.name } });
    return `<div class="inv__pk" data-reveal="">${card({ eyebrow: price, title: p.name, tone: p.featured ? 'ink' : 'paper', interactive: true, body: perks + btn })}</div>`;
  }).join('');
  const k = (kind) => contact.find((c) => c.kind === kind) || {};
  const support = [['Lead', k('Lead').value], ['Phone', k('Phone').display || k('Phone').value], ['UPI', k('UPI').value + (k('UPI').todo ? ' [TODO]' : '')], ['Bank', k('Bank').value]]
    .map(([dt, dd]) => `<dt>${dt}</dt><dd>${t(dd)}</dd>`).join('');
  const pct = Math.round((f.raised / f.goal) * 100);
  return `<section id="invest" class="inv" data-scene="" data-sector-label="S08 / Invest">
    <div class="inv__head">
      <div data-reveal="">${headline({ as: 'h2', size: 'xl', text: 'Fuel the season.', accent: 'season.' })}</div>
      <div class="inv__raised" data-reveal="">
        <span class="eyebrow eyebrow--plain">Raised so far${todo(f.todo)}</span>
        <span class="inv__raised-n">₹<span data-count="${f.raised}" data-fmt="inr">0</span></span>
        <span class="inv__raised-of">of ${inr(f.goal)} season goal · ${pct}%</span>
      </div>
    </div>
    <ul class="inv__budget">${budget}</ul>
    <div class="inv__pks">${pk}</div>
    <div id="enquiry" class="inv__enq">
      <form class="inv__form" data-enquiry="" novalidate>
        <span class="eyebrow eyebrow--plain">Sponsorship enquiry</span>
        <div class="inv__fields">
          ${input({ label: 'Name *', name: 'name' })}
          ${input({ label: 'Company', name: 'company' })}
          ${input({ label: 'Email *', name: 'email', type: 'email' })}
          ${input({ label: 'Phone', name: 'phone', type: 'tel' })}
        </div>
        ${select({ label: 'Sponsorship interest', name: 'interest', placeholder: 'Select a package', options: f.interestOptions })}
        ${input({ label: 'Message *', name: 'message', multiline: true })}
        <div>${button({ label: 'Send enquiry', type: 'submit', variant: 'accent', size: 'lg', iconRight: '↗', attr: { 'data-submit': '' } })}</div>
      </form>
      <aside class="inv__aside">
        <span class="eyebrow eyebrow--inv">Direct support</span>
        <dl class="inv__support">${support}</dl>
        <a href="#" class="inv__brochure">Download sponsorship brochure <span>↓</span></a>
      </aside>
    </div>
  </section>`;
}

export function contactSection({ contact }) {
  return `<section id="contact" class="contact" data-scene="" data-sector-label="S09 / Contact">
    <div class="contact__wedge" data-wedge="rise" aria-hidden="true"></div>
    <div class="contact__inner">
      <h2 class="contact__title"><span data-hx="-0.35">Let's </span><span class="contact__race" data-hx="0.35">race.</span></h2>
      ${contactDetails({ contact })}
    </div>
    <footer class="foot foot--home">${footerBar({ links: [['team.html', 'Team'], ['#journey', 'Our journey']] })}</footer>
  </section>`;
}

export function loader() {
  return `<div class="loader" data-loader="" role="status" aria-label="Loading Galactus Racing">
    <img src="/assets/logo-gr-light.png" width="640" height="446" alt="Galactus Racing logo" class="loader__logo">
    <div class="loader__track"><div class="loader__bar"></div></div>
    <span class="loader__text">Warming up the engine</span>
  </div>`;
}

export function renderHome(d) {
  return {
    'home-chrome': loader() + '<div class="progress" data-progress=""></div>' + header({ page: 'home' }),
    'home-main': [hero(d), about(d), journey(d), cars(d), achievements(d), gallery(d), sponsors(d), invest(d), contactSection(d)].join('\n'),
    'home-overlays': lightbox() + '<div class="toast-wrap" data-toast="" hidden></div>',
  };
}
