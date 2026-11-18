// Home page sections, rendered from src/data/*.json at build time.
// Markup mirrors archive/claude-design/Galactus Racing.dc.html; data-* hooks are used by src/motion/.
import { esc, t, todo, pad2, inr, button, iconButton, headline, card, tag, tabs, input, select, slot } from './ui.js';
import { header, contactDetails, footerBar } from './layout.js';

const spec = (car, k) => (car.specs.find((s) => s.k === k) || {}).v || '';

export function hero({ cars }) {
  const car = cars.find((c) => c.current) || cars[0];
  const heroSpec = [car.name, spec(car, 'Weight'), spec(car, 'Top speed')];
  // Layers: [data-l] wrappers are driven by the scroll timeline, [data-in] children by the intro,
  // so the two never fight over the same transform.
  return `<section id="home" class="hero" data-hero="" data-sector-label="S01 / Home">
    <div class="hero__sticky" data-hero-sticky="">
      <div class="hero__wedge-l" data-l="wedge" aria-hidden="true"><div class="hero__wedge" data-in="wedge"></div></div>
      <h1 class="hero__title">
        <span class="hero__word hero__word--g" data-l="galactus"><span class="hero__ink" data-in="galactus">Galactus</span></span>
        <span class="hero__word hero__word--r" data-l="racing"><span class="hero__ink" data-in="racing">Racing</span></span>
        <span class="sr-only"> — Freedom for failure</span>
      </h1>
      <div class="hero__car" data-l="car">
        <div class="hero__car-tilt" data-car-tilt="">
          <div class="hero__car-in" data-in="car">
            <span class="hero__streak" data-streak="" aria-hidden="true"><i></i><i></i><i></i></span>
            <canvas class="hero__dust" data-dust="" aria-hidden="true"></canvas>
            <img data-hero-main="" fetchpriority="high" src="/assets/hero-car.webp" srcset="/assets/hero-car-640.webp 640w, /assets/hero-car-800.webp 800w, /assets/hero-car.webp 1200w" sizes="(min-width: 900px) 55vw, calc(100vw - 40px)" width="1200" height="823" decoding="async" alt="Team Galactus Racing Baja car Abhimanyu, number M04" draggable="false">
          </div>
        </div>
      </div>
      <div class="hero__details" data-l="details">
        <span class="hero__spec" data-hero-spec="">${heroSpec.map((s) => `<span>${t(s)}</span>`).join('')}</span>
        <a href="#about" class="hero__scroll" data-hero-scroll="" aria-label="Scroll to next section"><span class="hero__scroll-line"></span>Scroll ↓</a>
      </div>
      <div class="hero__badge" data-hero-badge="">
        <div class="hero__badge-text"><span>Baja SAE India</span><span>Est. 2008</span><span>RIT Rajaramnagar</span></div>
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


// Digit strips for the lap-timer roll (stats) and split-flap (journey years). Each digit is a column
// that clips a vertical strip of digits; the strip's resting transform (CSS, --i / --n) shows the real
// value, so no-JS and reduced motion get the final number. Motion animates the strip from the top.
const strip = (seq, cls) => `<span class="${cls}__col"><span class="${cls}__strip" data-strip="" style="--n:${seq.length};--i:${seq.length - 1}">${seq.map((c) => `<span>${c}</span>`).join('')}</span></span>`;
// Roll: the rightmost digit spins the most (like a lap timer's fast column), all land together.
// Non-digits (the commas in ₹7,80,000) stay put.
function roll(n) {
  const ds = String(n).split(''), nd = ds.filter((d) => /\d/.test(d)).length;
  let p = -1;
  return `<span class="roll" aria-hidden="true">${ds.map((d) => {
    if (!/\d/.test(d)) return `<span class="roll__static">${esc(d)}</span>`;
    p++;
    const cycles = Math.max(0, 2 - (nd - 1 - p));
    const seq = [];
    for (let c = 0; c < cycles; c++) for (let k = 0; k < 10; k++) seq.push(k);
    for (let k = 0; k <= +d; k++) seq.push(k);
    return strip(seq, 'roll');
  }).join('')}</span><span class="sr-only">${esc(String(n))}</span>`;
}
// Flap: each digit flicks through a few characters, later digits flick longer so they settle left to right.
function flap(text) {
  let p = 0;
  return `<span class="flap" aria-hidden="true">${String(text).split('').map((ch) => {
    if (!/[0-9]/.test(ch)) return `<span class="flap__static">${esc(ch)}</span>`;
    const k = 4 + 2 * p++, d = +ch, seq = [];
    for (let j = k; j >= 0; j--) seq.push((d - j + 20) % 10);
    return strip(seq, 'flap');
  }).join('')}</span><span class="sr-only">${esc(String(text))}</span>`;
}

export function about({ stats }) {
  const events = BAJA_EVENTS.map((g, gi) => `<div class="about__evgroup">
      <span class="micro micro--inv">${esc(g.group)}</span>
      <div class="about__evitems">${g.items.map((label, i) => `<span class="about__ev"><span class="about__ev-n">${pad2(gi * 3 + i + 1)}</span>${esc(label)}</span>`).join('')}</div>
    </div>`).join('');
  const statsHtml = stats.map((s, i) => `<div class="stat" data-reveal="" data-delay="${i * 90}">
      <span class="micro micro--inv">${pad2(i + 1)}</span>
      <span class="stat__num" data-roll="" data-delay="${i * 80}">${roll(s.n)}<span class="stat__suffix">${esc(s.suffix)}</span></span>
      <span class="stat__label">${esc(s.label)}${todo(s.todo)}</span>
      <div class="stat__track"><div class="stat__bar" data-bar="100"></div></div>
    </div>`).join('');
  return `<section id="about" class="about" data-scene="" data-sector-label="S02 / Who we are">
    <div class="about__bigtext" data-hx="-0.8" data-bigtext="" aria-hidden="true">Freedom for failure — Freedom for failure</div>
    <div class="about__top" data-reveal="">
      <span class="eyebrow eyebrow--inv"><span class="eyebrow__line"></span>Who we are</span>
      <span class="micro micro--inv about__since">RIT Rajaramnagar · Since 2008</span>
    </div>
    <div class="about__grid">
      <div data-lines="">${headline({ as: 'h2', size: 'l', inverse: true, text: 'Every crash teaches us something.', accent: 'teaches us something.' })}</div>
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
  const items = chapters.map((c, i) => `<li class="jr__item" data-reveal="" data-delay="${(i % 3) * 90}" data-jitem="">
      <span class="jr__dot" data-jdot="" aria-hidden="true"></span>
      <span class="jr__year">${flap(c.date)}</span>
      <div class="jr__body"><strong class="jr__title">${esc(c.title)}</strong><span class="jr__story">${t(c.story)}</span></div>
    </li>`).join('');
  return `<section id="journey" class="jr" data-scene="" data-sector-label="S02 / Journey">
    <div class="jr__bigtext" data-hx="0.9" aria-hidden="true">2008 — 2026 — 2008 — 2026</div>
    <div class="jr__grid">
      <div class="jr__side">
        <span class="eyebrow" data-reveal=""><span class="eyebrow__line"></span>Our journey</span>
        <div data-reveal="">${headline({ as: 'h2', size: 'l', text: 'Built crash by crash.', accent: 'crash by crash.' })}</div>
        <p class="jr__lead" data-reveal="">Every car we build carries the scars of the one before it. Six chapters, from one borrowed welding machine to the podium.</p>
        <div class="jr__counter" data-reveal=""><span class="jr__count" aria-hidden="true"><span class="jr__count-strip" data-jcount="">${chapters.map((_, k) => `<span>${pad2(k + 1)}</span>`).join('')}</span></span><span class="micro jr__of">/ ${pad2(chapters.length)} chapters</span></div>
      </div>
      <ol class="jr__list" data-jlist="">
        <span class="jr__rail" aria-hidden="true"><span class="jr__fill" data-jfill=""></span><span class="jr__tip" data-jtip=""></span></span>
        ${items}
      </ol>
    </div>
  </section>`;
}

// ---------- S03 Cars: Abhimanyu teardown, previous cars, evolution ----------
// Teardown stops live in cars.json (current car → teardown[]): `box` = the part's bounding box and
// `anchors` = points on the part, both as fractions of the cut-out image; `closeup` = optional photo
// that replaces the zoomed crop for that stop. Desktop camera maths: src/motion/cars.js.
const numTxt = (sp) => (sp.n == null ? null : Number(sp.n).toFixed(sp.dp || 0));

function tdSpec(sp) {
  const n = numTxt(sp);
  const val = n == null
    ? '<span class="todo">[TODO]</span>'
    : `<b class="td__n" data-tdn="${n}" data-dp="${sp.dp || 0}">${n}</b>`;
  return `<div class="td__spec"><span class="td__spec-k">${esc(sp.k)}</span><span class="td__spec-v">${val}<span class="td__unit">${esc(sp.unit)}</span>${n != null ? todo(sp.todo) : ''}</span></div>`;
}

function tdCallout(st, i, total, extra = '') {
  return `<div class="td__call${extra}" data-td-call="${i}">
      <span class="td__sec"><span class="td__tick" aria-hidden="true"></span>S${i + 1} / ${pad2(total)}</span>
      <h3 class="td__title">${t(st.title)}</h3>
      <p class="td__line">${t(st.line)}</p>
      ${tdSpec(st.spec)}
    </div>`;
}

// Mobile / reduced-motion crop: the cut-out scaled so the part's box fills a 4:3 frame.
// Positions are % of the frame, so they hold at any card width.
function tdCrop(st, car) {
  const [W, H] = car.photoSize, ar = W / H, FH = 0.75; // frame height / width
  const [x0, y0, x1, y1] = st.box, bx = (x0 + x1) / 2, by = (y0 + y1) / 2;
  const s = Math.min(st.zoom || 2, 0.9 / (x1 - x0), (0.9 * FH * ar) / (y1 - y0));
  const pct = (v) => (v * 100).toFixed(2) + '%';
  const left = 0.5 - bx * s, top = FH / 2 - (by * s) / ar;
  const at = (a) => ({ x: 0.5 + (a[0] - bx) * s, y: (FH / 2 + ((a[1] - by) * s) / ar) / FH });
  const pts = st.closeup ? [{ x: 0.5, y: 0.5 }] : st.anchors.map(at);
  const dot = pts[0];
  const img = st.closeup
    ? `<img class="tdm__close" src="${esc(st.closeup)}" alt="${esc(st.title)} close-up" loading="lazy" decoding="async">`
    : `<img class="tdm__img" src="${esc(car.photo)}" alt="" width="${W}" height="${H}" loading="lazy" decoding="async" style="width:${pct(s)};left:${pct(left)};top:${pct(top / FH)}">`;
  return `<div class="tdm__frame">${img}
      <span class="tdm__ln" data-tdm-ln="" style="left:${pct(dot.x)};top:${pct(dot.y)}" aria-hidden="true"></span>
      ${pts.map((q) => `<span class="tdm__dot" data-tdm-dot="" style="left:${pct(q.x)};top:${pct(q.y)}" aria-hidden="true"></span>`).join('')}
    </div>`;
}

function carCard(car) {
  return `<article class="car" data-scene="">
      <div class="car__media">
        <span class="car__code" data-px="0.25" aria-hidden="true">${esc(car.code)}</span>
        <div class="car__photo" data-px="-0.12">${slot({ src: car.photo, alt: car.name, placeholder: 'Cut-out photo of ' + car.name.replace(' [TODO]', ''), fit: 'contain' })}</div>
        <span class="car__tag">${t(car.tag)}</span>
      </div>
      <div class="car__info">
        <h3 class="car__name">${t(car.name)}</h3>
        <p class="car__desc">${t(car.desc)}</p>
        <div class="car__btns">${button({ label: 'View specs', variant: 'outline', size: 'sm', iconRight: '↗', attr: { 'data-specs': car.id, 'aria-haspopup': 'dialog' } })}</div>
      </div>
    </article>`;
}

export function cars({ cars: list, evolution }) {
  const car = list.find((c) => c.current) || list[0];
  const prev = list.filter((c) => c !== car);
  const stops = car.teardown || [];
  const [W, H] = car.photoSize || [1513, 1035];
  const n = stops.length;
  const short = (c) => c.name.replace(' [TODO]', '');

  const lines = stops.map((st, i) => (st.closeup ? [0] : st.anchors).map((_, j) => `<span class="td__ln" data-td-ln="${i}" data-j="${j}"></span><span class="td__dot" data-td-dot="${i}" data-j="${j}"></span>`).join('')).join('');
  const closes = stops.map((st, i) => (st.closeup ? `<div class="td__close" data-td-close="${i}"><img src="${esc(st.closeup)}" alt="${esc(st.title)} close-up" loading="lazy" decoding="async"></div>` : '')).join('');
  const sectors = stops.map((st, i) => `<li class="td__s" data-td-s="${i}"><span class="td__s-label"><b>S${i + 1}</b> ${esc(st.title)}</span><span class="td__s-track"><span class="td__s-fill" data-td-fill="${i}"></span></span></li>`).join('');
  const btns = button({ label: 'View specs', variant: 'primary', size: 'md', iconRight: '↗', attr: { 'data-specs': car.id, 'aria-haspopup': 'dialog' } })
    + (prev[0] ? button({ label: 'Compare with ' + short(prev[0]), variant: 'outline', size: 'md', iconRight: '→', attr: { 'data-specs': car.id, 'data-compare': '', 'aria-haspopup': 'dialog' } }) : '');
  const intro = (attr) => `<div class="td__intro"${attr}>
        ${headline({ as: 'h2', size: 'l', text: 'Our cars.', accent: 'cars.' })}
        <span class="td__tag">${t(car.tag)}</span>
        <p class="td__name">${t(car.name)}</p>
        <p class="td__desc">${t(car.desc)}</p>
        <div class="td__btns">${btns}</div>
      </div>`;

  const cards = stops.map((st, i) => `<li class="tdm__card" data-tdm="">${tdCrop(st, car)}${tdCallout(st, i, n, ' td__call--static')}</li>`).join('');

  const evo = evolution.map((e) => {
    const cur = String(e.year) === String(car.season);
    return `<li class="evo__item${cur ? ' evo__item--current' : ''}"><span class="evo__ym"><span class="evo__year" data-evo-year="">${esc(e.year)}</span></span><strong class="evo__name">${esc(e.name)}</strong><span class="evo__note">${t(e.note)}</span></li>`;
  }).join('');

  // Desktop camera data (box / anchors / zoom / side per stop), read by src/motion/cars.js.
  const camData = JSON.stringify(stops.map(({ box, anchors, zoom, side, closeup }) => ({ box, anchors, zoom, side, closeup: !!closeup })));

  return `<section id="cars" class="cars" data-pin="" data-sector-label="S03 / Cars">
    <div class="td-wrap" data-td-wrap="" style="--td-len:${n * 1.25 + 1}">
    <div class="td" data-td="" data-stops="${esc(camData)}">
      <div class="td__top micro"><span>${esc(car.name)} · teardown</span><span>Scroll ↓</span></div>
      <img class="td__img" data-td-cam="" src="${esc(car.photo)}" alt="${esc(car.name)}, our current car" width="${W}" height="${H}" loading="lazy" decoding="async" draggable="false">
      ${closes}
      <div class="td__lines" aria-hidden="true">${lines}</div>
      ${stops.map((st, i) => tdCallout(st, i, n, st.side === 'left' ? ' td__call--left' : '')).join('')}
      ${intro(' data-td-intro=""')}
      <ol class="td__sectors" aria-label="Teardown sectors">${sectors}</ol>
    </div>
    </div>
    <div class="tdm">
      ${intro('')}
      <ol class="tdm__list">${cards}</ol>
    </div>
    <div class="rail-wrap" data-rail-wrap="">
    <div class="cars__rail" data-rail="">
      <div class="cars__top micro"><span>Previous cars</span><span>Scroll to drive →</span></div>
      <div class="cars__track" data-track="">
        <div class="cars__intro">
          ${headline({ as: 'h2', size: 'm', text: 'Before Abhimanyu.', accent: 'Abhimanyu.' })}
          <p class="cars__lead">Seventeen seasons, one rule: lighter, stiffer, faster than last year.<span class="todo"> [TODO]</span></p>
        </div>
        <div class="prev" data-prev="">${prev.map(carCard).join('')}</div>
        <div class="evo" data-evo="">
          <span class="eyebrow eyebrow--plain">Evolution</span>
          <ol class="evo__list">${evo}</ol>
        </div>
      </div>
      <div class="cars__progress"><div class="cars__bar" data-pinbar=""></div></div>
    </div>
    </div>
  </section>`;
}

// Spec panel (dialog), filled at runtime with specTable().
export function specSheet() {
  return `<div class="sheet" data-sheet="" data-lenis-prevent="" role="dialog" aria-modal="true" aria-labelledby="sheet-title" hidden>
    <div class="sheet__scrim" data-sheet-close=""></div>
    <div class="sheet__panel" data-sheet-panel="">
      <div class="sheet__top"><span class="micro">Spec sheet</span><button type="button" class="sheet__close" data-sheet-close="">Close ✕</button></div>
      <h2 class="sheet__title" id="sheet-title" data-sheet-title=""></h2>
      <button type="button" class="sheet__toggle" role="switch" aria-checked="false" data-sheet-cmp=""><span class="sheet__sw" aria-hidden="true"><i></i></span><span data-sheet-cmp-label=""></span></button>
      <div class="sheet__body" data-sheet-body=""></div>
    </div>
  </div>`;
}

// Full spec table for one car, or two cars side by side.
export function specTable(a, b) {
  const keys = [...new Set([...a.specs.map((s) => s.k), ...(b ? b.specs.map((s) => s.k) : [])])];
  const v = (c, k) => (c.specs.find((s) => s.k === k) || {}).v || '[TODO]';
  const head = b ? `<thead><tr><th scope="col"><span class="sr-only">Spec</span></th><th scope="col">${t(a.name)}</th><th scope="col">${t(b.name)}</th></tr></thead>` : '';
  const rows = keys.map((k) => `<tr><th scope="row">${esc(k)}</th><td>${t(v(a, k))}</td>${b ? `<td>${t(v(b, k))}</td>` : ''}</tr>`).join('');
  return `<table class="sheet__table${b ? ' sheet__table--cmp' : ''}">${head}<tbody>${rows}</tbody></table>`;
}

export function achievements({ achievements: a }) {
  const cards = a.podiums.map((p, i) => `<div class="ach__slot" data-grid="${i}">${card({ eyebrow: `${p.place} · ${p.year}`, title: p.title, body: t(p.detail), tone: p.featured ? 'ink' : 'paper', interactive: true })}</div>`).join('');
  const ms = a.milestones.map((m) => `<li class="ach__ms" data-reveal=""><span class="ach__ms-year">${m.year}</span><div class="ach__ms-body"><strong class="ach__ms-title">${esc(m.title)}</strong><span class="ach__ms-note">${t(m.detail)}</span></div></li>`).join('');
  const totals = a.totals.map((c, i) => `<div class="ach__total"><span class="ach__total-n" data-count="${c.n}" data-delay="${i * 80}">0</span><span class="ach__total-label">${esc(c.label)}${todo(c.todo)}</span></div>`).join('');
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
          <div class="ach__awards" data-awards="">${a.awards.map((x) => tag(x.title)).join('')}</div>
        </div>
      </div>
    </div>
  </section>`;
}

export const GAL_CATS = { race: 'Race day', workshop: 'Workshop', team: 'Team', testing: 'Testing' };
export const galColCount = (w) => (w < 640 ? 1 : w < 960 ? 2 : 3);

// Also used at runtime by src/home.js when the column count changes. Every photo is rendered (so the
// filter can move the same nodes with GSAP Flip); the ones outside `filter` are [hidden] at the end of
// column 1. data-open is the photo's index in the full list.
export function galleryGrid(items, nCols, filter = 'all') {
  // Column drift rates (see columnParallax): the middle column lags, the outer ones lead.
  const speeds = [0.12, 0.04, 0.09];
  const vis = items.filter((g) => filter === 'all' || g.category === filter);
  const cols = Array.from({ length: nCols }, () => []);
  vis.forEach((g, k) => cols[k % nCols].push(g));
  items.filter((g) => !vis.includes(g)).forEach((g) => cols[0].push(g));
  return cols.map((col, i) => `<div class="gal__col" data-speed="${nCols === 1 ? 0 : speeds[i]}">${col.map((g, r) => {
    const cat = GAL_CATS[g.category], gi = items.indexOf(g);
    return `<figure class="gal__fig" data-reveal="" data-delay="${i * 90 + r * 120}" data-flip-id="${esc(g.id)}"${vis.includes(g) ? '' : ' hidden'}>
        <div class="gal__card" data-gcard="" style="aspect-ratio:${esc(g.shape)}">
          <div class="gal__img" data-gimg="">${slot({ src: g.photo, alt: g.alt || g.caption, placeholder: g.caption })}</div>
          <div class="gal__ov" data-gov="" aria-hidden="true"></div>
          <div class="gal__cap" data-gcap="" aria-hidden="true"><span class="gal__cap-cat">${esc(cat)}</span><span class="gal__cap-text">${esc(g.caption)}</span><span class="gal__cap-line"></span></div>
          <button type="button" class="gal__btn" data-gbtn="" data-open="${gi}" aria-label="View ${esc(g.caption)} fullscreen">↗</button>
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
  return `<div class="lb" data-lb="" data-lenis-prevent="" role="dialog" aria-modal="true" aria-label="Gallery viewer" hidden>
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
  // Real logos (sponsors[], shaped like the admin panel: {logo, name, tier, url, active}) fill their tier
  // first; the rest stay placeholders. A logo sits in colour under a greyscale copy that fades out on
  // hover (opacity only; same file, one download). An empty Title tier shows the "Your brand here" slot.
  const live = (sp.sponsors || []).filter((s) => s.active !== false && s.logo);
  const logo = (s, h) => {
    const img = (cls) => `<img class="sp__logo ${cls}" src="${esc(s.logo)}" alt="${cls === 'sp__logo--grey' ? '' : esc(s.name)}" loading="lazy" decoding="async">`;
    const inner = img('sp__logo--colour') + img('sp__logo--grey');
    return s.url ? `<a class="sp__slot sp__slot--logo" style="height:${esc(h)}" href="${esc(s.url)}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="sp__slot sp__slot--logo" style="height:${esc(h)}">${inner}</div>`;
  };
  const brand = (h) => `<a class="sp__slot sp__brand" style="height:${esc(h)}" href="#invest" data-brand=""><span class="sp__brand-ring" data-brand-ring="" aria-hidden="true"></span><span class="sp__brand-title">Your brand here</span><span class="sp__brand-cta">Title slot open ↗</span></a>`;
  const tiers = sp.tiers.map((tr) => {
    const mine = live.filter((s) => (s.tier || '').toLowerCase() === tr.id);
    const slots = mine.map((s) => logo(s, tr.height));
    if (tr.id === 'title' && !mine.length) slots.push(brand(tr.height));
    for (let i = slots.length; i < tr.slots; i++) slots.push(`<div class="sp__slot" style="height:${esc(tr.height)}">${slot({ placeholder: `${tr.slotLabel} ${i + 1}`, fit: 'contain' })}</div>`);
    return `<div class="sp__tier" data-reveal="">
      <div class="sp__tier-name"><span class="sp__tier-title">${esc(tr.name)}</span><span class="micro">${esc(tr.note)}</span></div>
      ${slots.join('')}
    </div>`;
  }).join('');
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
    return `<li class="inv__b"><span class="inv__b-pct">${pct}%</span><div class="inv__b-track"><div class="inv__b-bar" data-ibar="" style="--p:${pct / 100}"></div></div><span class="inv__b-label">${esc(b.label)}</span><span class="inv__b-amt">${inr(b.amount)}${todo(f.todo)}</span></li>`;
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
        <span class="inv__raised-n">₹<span data-iroll="">${roll(f.raised.toLocaleString('en-IN'))}</span></span>
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
        ${f.brochure ? `<a href="${esc(f.brochure)}" class="inv__brochure" download>Download sponsorship brochure <span>↓</span></a>` : '<!-- Brochure link hidden until fundraising.json has "brochure" (docs/TODO-FACTS.md §8) -->'}
      </aside>
    </div>
  </section>`;
}

export function contactSection({ contact }) {
  return `<section id="contact" class="contact" data-scene="" data-sector-label="S09 / Contact">
    <div class="contact__wedge" data-wedge="rise" aria-hidden="true"></div>
    <div class="contact__inner">
      <h2 class="contact__title" data-cwipe=""><span class="contact__w"><span class="contact__word">Let's</span></span> <span class="contact__w contact__race"><span class="contact__word">race.</span></span></h2>
      ${contactDetails({ contact, copyEmail: true })}
    </div>
    <footer class="foot foot--home">${footerBar({ links: [['team.html', 'Team'], ['#journey', 'Our journey']] })}</footer>
  </section>`;
}

export function loader() {
  return `<div class="loader" data-loader="" role="status" aria-label="Loading Galactus Racing">
    <div class="loader__lights" aria-hidden="true"><i data-light=""></i><i data-light=""></i><i data-light=""></i></div>
    <span class="loader__text" data-loader-text="">S00 / Start</span>
  </div>`;
}

export function renderHome(d) {
  return {
    'home-chrome': loader() + '<div class="progress" data-progress=""></div>' + header({ page: 'home' }),
    'home-main': [hero(d), about(d), journey(d), cars(d), achievements(d), gallery(d), sponsors(d), invest(d), contactSection(d)].join('\n'),
    'home-overlays': lightbox() + specSheet() + '<div class="toast-wrap" data-toast="" hidden></div>',
  };
}
