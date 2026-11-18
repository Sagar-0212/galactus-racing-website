// S02 Journey: the trail.
// - drive (desktop >= 900 x 560, motion allowed): the section becomes a pinned trail (.jr--drive, CSS
//   sticky, ~50vh of scroll per chapter). One ScrollTrigger maps scroll to a drive/stop timeline:
//   drive (ease in-out: speed up, brake) -> stop at the checkpoint -> drive ... -> finish. Lenis gives
//   the weight. On each arrival the chapter's inspection card wipes in, its year split-flaps and the
//   stamp lands. At the last stop the drawn buggy gives way to the real Abhimanyu cut-out.
// - rail (phones, short screens): no pin. Red progress line scrubs down the stack, the diamonds light,
//   the counter ticks, cards reveal and years split-flap.
// - reduce: final states (full line, all lit, stamps shown), no animation.
// No rAF loop of our own: everything runs from ScrollTrigger updates; layout is measured on refresh only.
import { gsap, ScrollTrigger, tokens, reveal, smoothScroll, REDUCE, BOT } from './core.js';
import { createDust } from './dust.js';

const DRIVE = '(min-width: 900px) and (min-height: 560px)';
const RAIL = '(max-width: 899px), (max-height: 559px)';
const DRIVE_U = 1, FIRST_U = 0.6, STOP_U = 0.9, FINISH_U = 1.2, CARD_PAD = 0.15;

// Split-flap strips (see flap() in src/render/home.js): each digit flicks through its strip in hard
// steps, ~50ms per flap, digits 60ms apart so the year settles left to right.
const cells = (s) => s.children.length;
const endY = (s) => -100 * (cells(s) - 1) / cells(s);
function flapTl(item, delay = 0) {
  const strips = [...item.querySelectorAll('.flap [data-strip]')];
  const tl = gsap.timeline({ delay, onComplete: () => gsap.set(strips, { clearProps: 'transform' }) });
  strips.forEach((s, i) => {
    const steps = cells(s) - 1;
    tl.fromTo(s, { y: 0, yPercent: 0 }, { yPercent: endY(s), duration: steps * 0.05, ease: `steps(${steps})` }, i * 0.06);
  });
  return tl;
}

let dust = null; // one dust engine for the page's lifetime (it pauses itself off-screen)
let started = false;

export function initJourney(root) {
  const sec = root.querySelector('[data-jr]'); if (!sec) return;
  const mm = gsap.matchMedia();
  mm.add({ drive: DRIVE, rail: RAIL, reduce: REDUCE }, (c) => {
    const { drive, reduce } = c.conditions;
    let undo;
    if (reduce) undo = still(sec);
    else if (drive) undo = driveMode(sec);
    else undo = railMode(sec);
    // A height-only change (no breakpoint change for the rest of the page) needs its own refresh.
    if (started) requestAnimationFrame(() => ScrollTrigger.refresh());
    started = true;
    return undo;
  });
}

// ---------- Reduced motion: final states ----------
function still(sec) {
  const strip = sec.querySelector('[data-jcount]');
  if (strip) gsap.set(strip, { yPercent: -100 * (strip.children.length - 1) / strip.children.length });
  return () => { if (strip) gsap.set(strip, { clearProps: 'transform' }); };
}

// ---------- Phones / short screens: the stack on a scrubbed red line ----------
function railMode(sec) {
  const t = tokens();
  sec.classList.add('jr--rail');
  const list = sec.querySelector('[data-jlist]'), fill = sec.querySelector('[data-jfill]'), tip = sec.querySelector('[data-jtip]');
  const strip = sec.querySelector('[data-jcount]'), dots = [...sec.querySelectorAll('[data-jdot]')], items = [...sec.querySelectorAll('[data-jitem]')];
  const n = strip ? strip.children.length : 1;
  const setCount = (k) => strip && gsap.to(strip, { yPercent: -100 * (Math.max(1, k) - 1) / n, duration: t.base, ease: t.out, overwrite: true });
  gsap.set(tip, { opacity: 1 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 60%', end: 'bottom 60%', scrub: true, invalidateOnRefresh: true } });
  tl.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: 'none' }, 0)
    .fromTo(tip, { y: 0 }, { y: () => list.offsetHeight, ease: 'none' }, 0);
  // A diamond lights when it crosses the 60% line and goes dark only when scrolled back above it.
  // Positions from offsetTop (the cards carry the reveal's transform at refresh time).
  let lit = 0;
  dots.forEach((d) => ScrollTrigger.create({ trigger: list, start: () => `top+=${d.parentElement.offsetTop + d.offsetTop} 60%`,
    onEnter: () => { d.classList.add('is-on'); setCount(++lit); },
    onLeaveBack: () => { d.classList.remove('is-on'); setCount(--lit); } }));
  const phone = innerWidth < 900;
  items.forEach((item) => {
    reveal(item, { y: phone ? 28 : 56, skew: phone ? 0 : 2 });
    if (item.hasAttribute('data-flapped')) return;
    ScrollTrigger.create({ trigger: item, start: 'top 92%', once: true,
      onEnter: () => flapTl(item, 0.12).eventCallback('onComplete', () => item.setAttribute('data-flapped', '')) });
  });
  return () => { sec.classList.remove('jr--rail'); dots.forEach((d) => d.classList.remove('is-on')); gsap.set([fill, tip, strip], { clearProps: 'all' }); };
}

// ---------- Desktop: the pinned trail ----------
function driveMode(sec) {
  const t = tokens();
  const $ = (s) => sec.querySelector(s), $$ = (s) => [...sec.querySelectorAll(s)];
  const stage = $('[data-jstage]'), road = $('[data-jroad]'), world = $('[data-jworld]'), lane = $('[data-jlane]');
  const far = $('[data-jfar]'), laneFill = $('[data-jlfill]'), buggy = $('[data-jbuggy]'), flip = $('[data-jflip]');
  const startEl = $('[data-jstart]'), wedge = $('[data-jwedge]'), carWrap = $('[data-jcar]'), carImg = $('[data-jcarimg]');
  const hud = $('[data-jhud]'), hudBar = $('[data-jhudbar]');
  const gates = $$('[data-jgate]'), items = $$('[data-jitem]'), tags = $$('[data-jtag]'), wheels = $$('[data-jwheel]');
  const n = items.length, last = n - 1;
  const years = items.map((it) => (it.querySelector('.flap + .sr-only') || {}).textContent || '');

  sec.classList.add('jr--drive');
  sec.setAttribute('data-pin', ''); // nav links land at the section top, where the pin is engaged
  gsap.set(items, { autoAlpha: 0 });
  gsap.set(wheels, { transformOrigin: '50% 50%' });

  // Geometry in px, measured on refresh only. L = the buggy's nose position along the world.
  let W = 0, ax = 0, L0 = 0, stops = [], gateX = [], laneLen = 1, wheelR = 18, segs = [], U = 1;
  function measure() {
    W = road.clientWidth;
    const bw = buggy.offsetWidth;
    ax = Math.round(W * 0.3);
    const gap = Math.round(Math.min(820, Math.max(440, W * 0.46)));
    L0 = ax;
    gateX = items.map((_, i) => Math.round(ax + gap * (0.8 + i)));
    stops = gateX.map((x) => x - 6);
    const finish = gateX[last];
    laneLen = finish + W * 2;
    wheelR = bw * 18 / 160;
    world.style.width = laneLen + 'px';
    lane.style.width = laneLen + 'px';
    startEl.style.left = L0 + 'px';
    laneFill.style.left = L0 + 'px'; laneFill.style.width = laneLen - L0 + 'px'; // red line starts at START
    gates.forEach((g, i) => { g.style.left = gateX[i] + 'px'; });
    wedge.style.left = finish + 'px';
    // Abhimanyu at the finish: just past the 2026 gate label, and never under the card (it shrinks to
    // fit the room between the label and the card's left edge when the buggy stops at the gate).
    const carX = gates[last].querySelector('.jr__gate-yr').offsetWidth + 16;
    carWrap.style.height = '';
    const list = $('[data-jlist]'), cardLeft = list.getBoundingClientRect().left - road.getBoundingClientRect().left;
    const room = cardLeft - 16 - (ax + carX), cssH = carWrap.offsetHeight;
    carWrap.style.left = finish + carX + 'px';
    carWrap.style.height = Math.round(Math.max(90, Math.min(cssH, room * 439 / 640))) + 'px';
    buggy.style.left = ax - bw * 150 / 160 + 'px'; // nose (x = 150 in the 160-wide drawing) on the anchor
    // Timeline: drive (eased) then stop, per checkpoint, in scroll units.
    segs = []; let u = 0, prev = L0;
    stops.forEach((L, i) => {
      const d = i ? DRIVE_U : FIRST_U, w = i === last ? FINISH_U : STOP_U;
      segs.push({ u0: u, u1: u + d, a: prev, b: L }); u += d;
      segs.push({ u0: u, u1: u + w, a: L, b: L, stop: i }); u += w;
      prev = L;
    });
    U = u;
  }
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);

  const setWorld = gsap.quickSetter(world, 'x', 'px'), setFar = gsap.quickSetter(far, 'x', 'px');
  const setLane = gsap.quickSetter(laneFill, 'scaleX'), setHud = gsap.quickSetter(hudBar, 'scaleX'), setFlip = gsap.quickSetter(flip, 'scaleX');
  const setWheel = wheels.map((w) => gsap.quickSetter(w, 'rotation', 'deg'));

  if (!dust) dust = createDust($('[data-jdust]'), { max: 60, haze: 6, reduce: BOT, dprMax: 1.5 });

  const at = (u) => {
    const s = segs.find((g) => u <= g.u1) || segs[segs.length - 1];
    if (s.stop !== undefined) return s.a;
    const k = Math.min(1, Math.max(0, (u - s.u0) / (s.u1 - s.u0)));
    return s.a + (s.b - s.a) * t.inOut(k);
  };

  // ---------- Cards: one active at a time, wipe in behind a -17deg slanted edge ----------
  let active = -1, passed = -2, fin = false, lastL = null, forward = true, hudTxt = '';
  const CLIP_IN = 'polygon(0% -15%, 0% -15%, -30% 115%, -30% 115%)', CLIP_ON = 'polygon(0% -15%, 130% -15%, 100% 115%, -30% 115%)';
  function showCard(i) {
    const it = items[i], stamp = it.querySelector('[data-jstamp]');
    gsap.killTweensOf([it, stamp]);
    it.classList.add('is-active');
    gsap.set(it, { autoAlpha: 1 });
    gsap.fromTo(it, { clipPath: CLIP_IN, x: -24 }, { clipPath: CLIP_ON, x: 0, duration: t.slow, ease: t.out, clearProps: 'clipPath,transform' });
    flapTl(it, 0.08);
    gsap.fromTo(stamp, { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: t.base, ease: t.out, delay: 0.45 });
  }
  function hideCard(i) {
    const it = items[i], stamp = it.querySelector('[data-jstamp]');
    gsap.killTweensOf([it, stamp]);
    it.classList.remove('is-active');
    gsap.to(it, { autoAlpha: 0, x: 16, duration: t.base, ease: t.out, onComplete: () => gsap.set([it, stamp], { clearProps: 'transform,opacity' }) });
  }
  // Last stop: the drawn buggy clips out, Abhimanyu wipes in on the wedge.
  function finish(on) {
    gsap.killTweensOf([buggy, carWrap]);
    if (on) {
      if (carImg.loading === 'lazy') carImg.loading = 'eager';
      gsap.to(buggy, { autoAlpha: 0, duration: t.base, ease: t.out });
      gsap.set(carWrap, { autoAlpha: 1 });
      gsap.fromTo(carWrap, { clipPath: CLIP_IN, x: -32 }, { clipPath: CLIP_ON, x: 0, duration: t.wipe, ease: t.out, delay: 0.12 });
    } else {
      gsap.to(buggy, { autoAlpha: 1, duration: t.base, ease: t.out });
      gsap.to(carWrap, { autoAlpha: 0, duration: t.base, ease: t.out });
    }
  }
  function setActive(i) {
    if (i === active) return;
    if (active >= 0) hideCard(active);
    active = i;
    if (i >= 0) { showCard(i); if (dust) dust.kick(110); } // brake puff
    gates.forEach((g, k) => g.classList.toggle('is-current', k === i));
    tags.forEach((b, k) => { b.classList.toggle('is-on', k === i); if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    if ((i === last) !== fin) { fin = i === last; finish(fin); }
  }
  function setPassed(p) {
    if (p === passed) return; passed = p;
    gates.forEach((g, k) => g.classList.toggle('is-passed', k <= p));
    tags.forEach((b, k) => b.classList.toggle('is-done', k <= p));
    if (p === last - 1 && carImg.loading === 'lazy') carImg.loading = 'eager'; // the finish is one stretch away
  }

  function apply(u) {
    const L = at(u);
    if (lastL !== null) {
      const dL = L - lastL;
      if (Math.abs(dL) > 0.5 && (dL > 0) !== forward) { forward = dL > 0; setFlip(forward ? 1 : -1); }
      if (dust && Math.abs(dL) > 0.5) dust.kick(Math.min(90, Math.abs(dL) * 3));
    }
    lastL = L;
    const cam = ax - L;
    setWorld(cam); setFar(cam * 0.3);
    setLane((L - L0) / (laneLen - L0));
    setHud(u / U);
    const rot = (L / wheelR) * 57.2958;
    setWheel.forEach((s) => s(rot));
    let p = -1; stops.forEach((x, k) => { if (L >= x - 2) p = k; });
    setPassed(p);
    let a = -1; segs.forEach((s) => { if (s.stop !== undefined && u >= s.u0 - CARD_PAD && u <= s.u1 + CARD_PAD) a = s.stop; });
    setActive(a);
    const txt = p < 0 ? 'Start' : `CP${String(p + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')} · ${p === last ? 'Today' : years[p]}`;
    if (txt !== hudTxt) { hudTxt = txt; hud.textContent = txt; }
  }

  const st = ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
    onUpdate: (self) => apply(self.progress * U),
    onRefresh: (self) => apply(self.progress * U),
  });
  apply(st.progress * U);

  // Year tags: smooth scroll to the middle of that checkpoint's stop.
  const jump = (i) => {
    const s = segs.find((g) => g.stop === i); if (!s) return;
    const y = st.start + ((s.u0 + s.u1) / 2 / U) * (st.end - st.start);
    const lenis = smoothScroll();
    if (lenis) lenis.scrollTo(y, { duration: 1.2, easing: t.inOut }); else window.scrollTo(0, y);
  };
  const onTag = (e) => { const b = e.target.closest('[data-jtag]'); if (b) jump(+b.dataset.jtag); };
  const tagNav = tags.length ? tags[0].parentElement : null;
  if (tagNav) tagNav.addEventListener('click', onTag);

  return () => {
    ScrollTrigger.removeEventListener('refreshInit', measure);
    if (tagNav) tagNav.removeEventListener('click', onTag);
    sec.classList.remove('jr--drive'); sec.removeAttribute('data-pin');
    [world, lane, laneFill, startEl, wedge, carWrap, buggy, ...gates].forEach((el) => el.removeAttribute('style'));
    gates.forEach((g) => g.classList.remove('is-current', 'is-passed'));
    tags.forEach((b) => { b.classList.remove('is-on', 'is-done'); b.removeAttribute('aria-current'); });
    items.forEach((it) => it.classList.remove('is-active'));
    gsap.set([...items, ...items.map((it) => it.querySelector('[data-jstamp]')), far, flip, laneFill, hudBar, ...wheels], { clearProps: 'all' });
  };
}
