// Gallery card hover (state via the .is-hover class in CSS, mouse tilt here) and lightbox transitions.
import { gsap, tokens, REDUCE, isScrolling } from './core.js';

const reduced = () => matchMedia(REDUCE).matches;

export function bindCard(c) {
  const img = c.querySelector('[data-gimg]');
  let r = null;
  // Mouse: hover starts on the first real pointer move that isn't caused by the page scrolling.
  const enter = (e) => { if (e.pointerType === 'mouse' && isScrolling()) return false; c.classList.add('is-hover'); if (e.pointerType === 'mouse') r = c.getBoundingClientRect(); return true; };
  c.addEventListener('pointerenter', enter);
  c.addEventListener('pointermove', (e) => {
    if (!c.classList.contains('is-hover') && !enter(e)) return;
    if (!r || reduced() || e.pointerType !== 'mouse') return;
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = 'rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg)';
    if (img) img.style.transform = 'scale(1.1) translate(' + (-x * 14).toFixed(1) + 'px,' + (-y * 14).toFixed(1) + 'px)';
  });
  c.addEventListener('pointerleave', () => { r = null; c.classList.remove('is-hover'); c.style.transform = ''; if (img) img.style.transform = ''; });
}

// Lightbox open (fade + scale in) or change (slide + skew from the side, red streak sweeps across).
export function animateLb(root, opened, dir) {
  const stage = root.querySelector('[data-lb-stage]'), streak = root.querySelector('[data-lb-streak]'), cap = root.querySelector('[data-lb-cap]');
  if (reduced() || !stage) return;
  const t = tokens(), d = dir || 1;
  if (opened) {
    gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: t.base, ease: t.out, clearProps: 'opacity' });
    gsap.fromTo(stage, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: t.slow, ease: t.out, clearProps: 'transform,opacity' });
  } else {
    gsap.fromTo(stage, { x: d * 110, skewX: -d * 6, opacity: 0 }, { x: 0, skewX: 0, opacity: 1, duration: t.slow, ease: t.out, clearProps: 'transform,opacity' });
  }
  if (streak) {
    const w = streak.offsetWidth, vw = innerWidth;
    gsap.fromTo(streak, { x: d > 0 ? -1.2 * w : 1.2 * vw, skewX: -17 }, { x: d > 0 ? 1.2 * vw : -1.2 * w, duration: t.slow, ease: t.out });
  }
  if (cap) gsap.fromTo(cap, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: t.slow, delay: 0.09, ease: t.out, clearProps: 'transform,opacity' });
}
