// Home page scroll effects: counts, bars, parallax, cars pin, marquee, contact wedge,
// page chrome (progress bar, header line, sector label). All driven by ScrollTrigger; layout is only
// measured on refresh (load / resize), never per frame.
import { gsap, ScrollTrigger, tokens, reveal } from './core.js';

// Scroll position cached by ScrollTrigger (reading window.scrollY after GSAP writes forces a reflow).
let scrollPos = 0;

// ---------- Page chrome: top progress bar, header hairline, sector label + active nav ----------
export function chrome(root, onActive) {
  const bar = root.querySelector('[data-progress]'), hdr = root.querySelector('[data-hdr]'), sectorEl = root.querySelector('[data-sector]');
  const setBar = bar ? gsap.quickSetter(bar, 'scaleX') : null;
  const top = (y) => hdr && hdr.classList.toggle('is-top', y <= 40);
  top(window.scrollY);
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => { scrollPos = self.scroll(); if (setBar) setBar(self.progress); top(scrollPos); },
    onRefresh: (self) => { if (setBar) setBar(self.progress); },
  });
  const secs = [...root.querySelectorAll('[data-sector-label]')];
  let active = null;
  const set = (i) => {
    const sec = secs[Math.max(0, i)]; if (!sec || active === sec) return; active = sec;
    if (sectorEl) sectorEl.textContent = sec.dataset.sectorLabel;
    if (onActive) onActive(sec.id || 'home');
  };
  secs.forEach((sec, i) => ScrollTrigger.create({ trigger: sec, start: 'top 40%', onEnter: () => set(i), onLeaveBack: () => set(i - 1) }));
  set(0);
}

// ---------- Reveals ----------
export function reveals(els, mobile, offset = 0) {
  els.forEach((el, k) => {
    const d = el.dataset.delay, i = k + offset;
    reveal(el, { delay: (d != null && d !== '' ? +d : (i % 4) * 70) / 1000, y: mobile ? 28 : 56, skew: mobile ? 0 : 2 });
  });
}

// ---------- Count-ups and bars ----------
const fmt = (el, v) => (el.dataset.fmt === 'inr' ? v.toLocaleString('en-IN') : String(v)) + (el.dataset.suffix || '');
export function counts(root) {
  const t = tokens();
  root.querySelectorAll('[data-count]').forEach((el) => {
    const o = { v: 0 }, target = +el.dataset.count;
    el.textContent = fmt(el, 0);
    // 2× the wipe token (≈ the original 1.5s), quartic ease-out like the original.
    gsap.to(o, { v: target, duration: t.wipe * 2, ease: 'power3.out', delay: (+el.dataset.delay || 0) / 1000, scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => { el.textContent = fmt(el, Math.round(o.v)); } });
  });
  root.querySelectorAll('[data-bar]').forEach((el) => {
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: +el.dataset.bar / 100, duration: t.wipe, ease: t.out, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
}
export function finalCounts(root) { root.querySelectorAll('[data-count]').forEach((el) => { el.textContent = fmt(el, +el.dataset.count); }); }

// ---------- Parallax (desktop). Same maths as the original: offset ∝ distance of the scene centre
// from the viewport centre, so it is linear from "scene top at screen bottom" to "scene bottom at top". ----------
export function parallax(els) {
  return els.map((el) => {
    const scene = el.closest('[data-scene]') || el.parentElement;
    const sp = +el.dataset.speed || 0, hx = +el.dataset.hx || 0;
    if (!sp && !hx) return null;
    const A = () => (innerHeight + scene.offsetHeight) / 2;
    return gsap.fromTo(el, { x: () => -A() * hx * 0.5, y: () => -A() * sp }, {
      x: () => A() * hx * 0.5, y: () => A() * sp, ease: 'none',
      scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  }).filter(Boolean);
}

// ---------- Gallery columns: parallax that never rises above the grid's top edge while the heading
// can be on screen. Offset is linear in scroll and crosses 0 exactly when the grid's top reaches the
// viewport top (by then the heading has scrolled out above). Before that every column sits at or below
// its resting slot; after it, columns drift up at different rates (data-speed = rate, 0..~0.15). ----------
export function columnParallax(els) {
  return els.map((el) => {
    const r = Math.abs(+el.dataset.speed || 0); if (!r) return null;
    const grid = el.parentElement;
    return gsap.fromTo(el, { y: () => r * innerHeight }, {
      y: () => -r * grid.offsetHeight, ease: 'none',
      scrollTrigger: { trigger: grid, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  }).filter(Boolean);
}

// ---------- Cars: previous cars + evolution on a pinned horizontal track (desktop only; under 900px
// the CSS turns it into a scroll-snap row). Returns the track tween for containerAnimation triggers. ----------
let railWrap = null, railHooked = false;
export function carsPin(root) {
  const sec = root.querySelector('[data-rail]'); if (!sec) return null;
  const track = sec.querySelector('[data-track]'), pb = sec.querySelector('[data-pinbar]');
  if (!track) return null;
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const setPb = pb ? gsap.quickSetter(pb, 'scaleX') : null;
  // The rail is position: sticky inside .rail-wrap; the wrapper's height is the scroll length.
  // Set before every refresh measures anything (CSS forces height: auto under 900px / reduced motion).
  const wrap = sec.parentElement;
  railWrap = () => { wrap.style.height = innerHeight + dist() + 'px'; };
  if (!railHooked) { railHooked = true; ScrollTrigger.addEventListener('refreshInit', () => railWrap && railWrap()); }
  railWrap();
  const move = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true,
      onUpdate: (s) => setPb && setPb(s.progress), onRefresh: (s) => setPb && setPb(s.progress) },
  });
  // Horizontal parallax inside each car (code numeral and photo drift against the track).
  sec.querySelectorAll('[data-px]').forEach((el) => {
    const scene = el.closest('[data-scene]') || el.parentElement, px = +el.dataset.px;
    const A = () => (innerWidth + scene.offsetWidth) / 2;
    gsap.fromTo(el, { x: () => -A() * px }, { x: () => A() * px, ease: 'none',
      scrollTrigger: { trigger: scene, containerAnimation: move, start: 'left right', end: 'right left', scrub: true, invalidateOnRefresh: true } });
  });
  return move;
}

// ---------- Contact: the paper wedge rises as the section scrolls in ----------
export function wedgeRise(root) {
  const w = root.querySelector('[data-wedge="rise"]'); if (!w) return;
  gsap.fromTo(w, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 60%)', ease: 'none',
    scrollTrigger: { trigger: w.parentElement, start: 'top bottom', end: 'top top', scrub: true } });
}

// ---------- Sponsor tapes: constant drift, faster and skewed with scroll speed ----------
export function marquee(root) {
  const tapes = [...root.querySelectorAll('[data-marq]')]; if (!tapes.length) return;
  const sec = tapes[0].closest('section');
  let half = tapes.map((m) => m.scrollWidth / 2), on = false, mq = 0, vel = 0, lastY = scrollPos, skWas = null;
  const setX = tapes.map((m) => gsap.quickSetter(m, 'x', 'px')), setSk = tapes.map((m) => gsap.quickSetter(m, 'skewX', 'deg'));
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => { on = s.isActive; },
    onRefresh: () => { half = tapes.map((m) => m.scrollWidth / 2); } });
  const tick = (time, dt) => {
    const y = scrollPos, k = Math.min(dt, 100) / (1000 / 60);
    vel += ((y - lastY) / Math.max(k, 0.01) - vel) * 0.15; lastY = y;
    if (!on) return;
    mq += (0.6 + Math.min(Math.abs(vel), 60) * 0.35) * k;
    tapes.forEach((m, i) => { const h = half[i]; if (!h) return; const off = mq % h; setX[i](m.dataset.marq === '1' ? -off : off - h); });
    const sk = Math.max(-9, Math.min(9, -vel * 0.3)).toFixed(2);
    if (sk !== skWas) { skWas = sk; setSk.forEach((s) => s(+sk)); }
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}
