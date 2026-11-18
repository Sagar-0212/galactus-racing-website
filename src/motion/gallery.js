// Gallery: filter re-layout (GSAP Flip), card hover (state via the .is-hover class in CSS: slow photo
// zoom + red caption line; mouse tilt here) and lightbox transitions.
import { gsap, ScrollTrigger, tokens, REDUCE, isScrolling, getFlip, loadFlip } from './core.js';

const reduced = () => matchMedia(REDUCE).matches;

export function bindCard(c) {
  let r = null;
  // Mouse: hover starts on the first real pointer move that isn't caused by the page scrolling.
  const enter = (e) => { if (e.pointerType === 'mouse' && isScrolling()) return false; c.classList.add('is-hover'); if (e.pointerType === 'mouse') r = c.getBoundingClientRect(); return true; };
  c.addEventListener('pointerenter', enter);
  c.addEventListener('pointermove', (e) => {
    if (!c.classList.contains('is-hover') && !enter(e)) return;
    if (!r || reduced() || e.pointerType !== 'mouse') return;
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = 'rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg)';
  });
  c.addEventListener('pointerleave', () => { r = null; c.classList.remove('is-hover'); c.style.transform = ''; });
}

// Filter: `change()` moves/hides the figures; Flip slides the kept ones to their new slots, new ones
// scale+fade in, removed ones fade out in place. Quick, no overshoot. Reduced motion: instant.
let flip = null;
export function flipGallery(grid, change) {
  const figs = [...grid.querySelectorAll('[data-flip-id]')];
  if (flip) flip.progress(1);
  if (reduced()) { change(); ScrollTrigger.refresh(); return; }
  const Flip = getFlip();
  if (!Flip) { loadFlip().then(() => flipGallery(grid, change), () => { change(); ScrollTrigger.refresh(); }); return; }
  // Photos still waiting for their scroll reveal: settle them first (and drop the trigger) so Flip
  // measures their real boxes and the reveal can't replay later.
  figs.forEach((f) => {
    if (f.hasAttribute('data-done')) return;
    gsap.getTweensOf(f).forEach((tw) => { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); });
    gsap.set(f, { clearProps: 'opacity,transform,clipPath' });
    f.setAttribute('data-done', '');
  });
  const t = tokens();
  const state = Flip.getState(figs);
  change();
  flip = Flip.from(state, {
    targets: figs, duration: t.slow, ease: t.out, stagger: 0.03, absoluteOnLeave: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: t.slow, ease: t.out, delay: 0.08, stagger: 0.04 }),
    onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: t.base, ease: t.out }),
    onComplete: () => { gsap.set(figs, { clearProps: 'opacity,transform' }); flip = null; ScrollTrigger.refresh(); },
  });
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
