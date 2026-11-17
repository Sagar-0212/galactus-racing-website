// Home page scroll effects: counts, bars, journey timeline, parallax, cars pin, marquee, contact wedge,
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
export function reveals(els, mobile) {
  els.forEach((el, i) => {
    const d = el.dataset.delay;
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
    gsap.to(o, { v: target, duration: t.wipe * 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => { el.textContent = fmt(el, Math.round(o.v)); } });
  });
  root.querySelectorAll('[data-bar]').forEach((el) => {
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: +el.dataset.bar / 100, duration: t.wipe, ease: t.out, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
}
export function finalCounts(root) { root.querySelectorAll('[data-count]').forEach((el) => { el.textContent = fmt(el, +el.dataset.count); }); }

// ---------- Journey: red rail fills to the 60% line, diamonds light up, counter follows ----------
export function journey(root, reduce) {
  const list = root.querySelector('[data-jlist]'); if (!list) return;
  const fill = root.querySelector('[data-jfill]'), count = root.querySelector('[data-jcount]'), dots = [...root.querySelectorAll('[data-jdot]')];
  if (reduce) { dots.forEach((d) => d.classList.add('is-on')); if (fill) gsap.set(fill, { scaleY: 1 }); if (count) count.textContent = String(dots.length || 1).padStart(2, '0'); return; }
  if (fill) gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 60%', end: 'bottom 60%', scrub: true } });
  const sync = () => { const lit = dots.filter((d) => d.classList.contains('is-on')).length; if (count) count.textContent = String(Math.max(1, lit)).padStart(2, '0'); };
  dots.forEach((d) => ScrollTrigger.create({ trigger: d, start: 'top 60%', toggleClass: 'is-on', onToggle: sync }));
}

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

// ---------- Cars: previous cars + evolution on a pinned horizontal track (desktop only; under 900px
// the CSS turns it into a scroll-snap row). Returns the track tween for containerAnimation triggers. ----------
export function carsPin(root) {
  const sec = root.querySelector('[data-rail]'); if (!sec) return null;
  const track = sec.querySelector('[data-track]'), pb = sec.querySelector('[data-pinbar]');
  if (!track) return null;
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const setPb = pb ? gsap.quickSetter(pb, 'scaleX') : null;
  const move = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: true, invalidateOnRefresh: true, refreshPriority: 1,
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
