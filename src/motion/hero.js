// Hero: fit the layered art to the screen, the intro, and the pinned scroll split.
// Layout maths is unchanged from the original (Prompt 4 reworks the hero); it now runs on load and
// on ScrollTrigger refresh (resize) instead of every frame.
import { gsap, ScrollTrigger, tokens } from './core.js';

const IW = 1724, IH = 912;

export function heroEls(root) {
  const hero = root.querySelector('[data-hero]'); if (!hero) return null;
  const q = (s) => hero.querySelector(s);
  return {
    hero, sticky: q('[data-hero-sticky]'), stage: q('[data-stage]'), badge: q('[data-hero-badge]'), narrow: q('[data-hero-narrow]'), ui: q('[data-hero-ui]'),
    L: { galactus: q('[data-l="galactus"]'), racing: q('[data-l="racing"]'), details: q('[data-l="details"]') },
    size: { w: 0, h: 0 },
  };
}

export function layoutStage(H) {
  if (!H || !H.stage) return;
  const sw = H.sticky.clientWidth, sh = H.sticky.clientHeight;
  // Fit the art so the whole buggy (and the headline) always stays inside the hero.
  const s0 = Math.max(sw / IW, sh / IH), sW = (sw - 24) / (IW * 0.954), sH = (sh - 84) / (IH * 0.779);
  const s = Math.min(s0, sW, sH), w = IW * s, h = IH * s;
  const L0 = w >= sw ? Math.min(Math.max(-(w - sw) / 2, sw - 0.989 * w - 12), 12 - 0.035 * w) : sw - w;
  const T = h >= sh ? Math.min(Math.max((sh - h) / 2, 76 - 0.18 * h), sh - 8 - 0.9594 * h) : sh - h;
  Object.assign(H.stage.style, { left: L0 + 'px', top: T + 'px', width: w + 'px', height: h + 'px' });
  H.stage.style.setProperty('--hu', s.toFixed(4) + 'px');
  H.size = { w, h };
}

// Scroll: GALACTUS exits left, RACING exits right, details fade and lift. Linear in scroll (scrub).
// (Buggy-drives-forward and wedge-lag stay off: the buggy photo carries the wedge's dark pixels; Prompt 4.)
export function heroScroll(H) {
  if (!H) return;
  const { L } = H, S = () => H.size;
  const fade = [L.details, H.badge, H.ui].filter(Boolean);
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: H.hero, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
  });
  if (L.galactus) tl.to(L.galactus, { x: () => -S().w * 0.62, y: () => -S().h * 0.03, scale: 1.16, duration: 1 }, 0).to(L.galactus, { opacity: 0, duration: 1 / 1.35 }, 0);
  if (L.racing) tl.to(L.racing, { x: () => S().w * 0.62, y: () => S().h * 0.03, scale: 1.16, duration: 1 }, 0).to(L.racing, { opacity: 0, duration: 1 / 1.35 }, 0);
  if (fade.length) tl.to(fade, { y: -40, duration: 1 }, 0).to(fade, { autoAlpha: 0, duration: 1 / 3.2 }, 0);
  if (H.narrow) tl.to(H.narrow, { y: -50, duration: 1 }, 0).to(H.narrow, { opacity: 0, duration: 0.5 }, 0);
  return tl;
}

// Intro after the loader: the two words wipe in from the left, then details rise in.
// Details animate their children so they never fight the scroll timeline on the parent.
export function heroIntro(root) {
  const t = tokens(), q = (s) => root.querySelector(s);
  const wipe = { clipPath: 'inset(0% 100% 0% 0%)', xPercent: -8, opacity: 0 };
  const done = { clipPath: 'inset(0% 0% 0% 0%)', xPercent: 0, opacity: 1, duration: t.wipe, ease: t.out, clearProps: 'clipPath,transform,opacity' };
  const g = q('[data-in="galactus"]'), r = q('[data-in="racing"]');
  if (g) gsap.fromTo(g, wipe, { ...done, delay: 0.12 });
  if (r) gsap.fromTo(r, wipe, { ...done, delay: 0.3 });
  ['[data-l="details"]', '[data-hero-badge]', '[data-hero-ui]', '[data-hero-narrow]'].forEach((sel, i) => {
    const el = q(sel); if (!el || !el.children.length) return;
    gsap.fromTo(el.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: t.slow, ease: t.out, delay: 0.95 + i * 0.08, clearProps: 'opacity,transform' });
  });
}

export function watchStage(H) {
  layoutStage(H);
  ScrollTrigger.addEventListener('refreshInit', () => layoutStage(H));
}
