// Hero: start-light loader, the intro timeline, the pinned scroll split and the cursor tilt.
// Every hero element has two layers: [data-l] (scroll timeline) wraps [data-in] (intro), so the two
// never write the same transform. Layout is pure CSS; JS only reads sizes inside function-based values,
// which ScrollTrigger re-evaluates on refresh (resize), never per frame.
import { gsap, tokens } from './core.js';

const SEEN = 'gr-lights';

export function heroEls(root) {
  const hero = root.querySelector('[data-hero]'); if (!hero) return null;
  const q = (s) => hero.querySelector(s), qa = (s) => [...hero.querySelectorAll(s)];
  const pair = (n) => [q(`[data-l="${n}"]`), q(`[data-in="${n}"]`)];
  const [wedgeL, wedge] = pair('wedge'), [gL, g] = pair('galactus'), [rL, r] = pair('racing'), [carL, car] = pair('car');
  return {
    hero, sticky: q('[data-hero-sticky]'), wedgeL, wedge, gL, g, rL, r, carL, car,
    details: q('[data-l="details"]'), tilt: q('[data-car-tilt]'), streak: qa('[data-streak] i'), dustCanvas: q('[data-dust]'),
    spec: qa('[data-hero-spec] > span'), scrollLink: q('[data-hero-scroll]'), badge: q('[data-hero-badge]'), ui: q('[data-hero-ui]'),
  };
}

const W = (H) => H.sticky.clientWidth;
const Ht = (H) => H.sticky.clientHeight;

// Leftmost visible car pixel for each 1% band of the image height, in 1/1000 of the image width
// (alpha > 24, measured from public/assets/hero-car.webp). Lets the headline grow into the empty paper
// above the roll cage and left of the helmet. Re-measure if the car image changes.
const CONTOUR = [478, 425, 394, 386, 380, 376, 372, 368, 364, 361, 357, 352, 349, 345, 341, 338, 333, 330, 326, 322,
  318, 314, 311, 307, 303, 300, 267, 261, 261, 262, 275, 263, 254, 252, 250, 250, 248, 246, 242, 240,
  238, 236, 235, 231, 228, 223, 219, 214, 210, 199, 197, 198, 208, 209, 209, 210, 210, 88, 64, 52,
  42, 37, 31, 25, 21, 19, 18, 11, 8, 8, 8, 3, 2, 1, 1, 3, 0, 0, 0, 2,
  4, 4, 5, 8, 13, 13, 16, 20, 28, 31, 12, 8, 8, 14, 527, 511, 509, 509, 517, 1000];
const GAP = 16;
export const STACKED = '(max-width: 899px), (max-aspect-ratio: 13/10)';

// Wide layout: the biggest headline that keeps every word (and the buttons) >= 16px from any car pixel
// and the buttons >= 16px above the spec strip. Binary search on the font size; runs on load and resize
// only (it reads layout). Uses offset* values, which ignore the scroll/intro transforms.
export function fitHeadline(H) {
  if (!H) return;
  const st = H.sticky;
  if (matchMedia(STACKED).matches) { st.style.removeProperty('--fs-head'); return; }
  const title = H.hero.querySelector('.hero__title'), spec = H.hero.querySelector('[data-hero-spec]'), car = H.carL;
  const edge = (y) => {
    const i = Math.floor(((y - car.offsetTop) / car.offsetHeight) * 100);
    return i < 0 || i > 99 ? Infinity : car.offsetLeft + (CONTOUR[i] / 1000) * car.offsetWidth;
  };
  const clear = (l, t, r, b) => { for (let y = t - GAP; y <= b + GAP; y += 2) if (edge(y) < r + GAP) return false; return true; };
  const fits = () => {
    for (const el of [H.g, H.r]) {
      const l = title.offsetLeft + el.offsetLeft, t = title.offsetTop + el.offsetTop;
      if (!clear(l, t, l + el.offsetWidth, t + el.offsetHeight)) return false;
    }
    const u = H.ui, ub = u.offsetTop + u.offsetHeight;
    if (!clear(u.offsetLeft, u.offsetTop, u.offsetLeft + u.offsetWidth, ub)) return false;
    return ub + GAP <= H.details.offsetTop + spec.offsetTop;
  };
  const sw = st.clientWidth, sh = st.clientHeight;
  let lo = Math.min(sw * 0.06, sh * 0.09), hi = sw * 0.154;   // hi = the c984f85 width; height is limited by fits()
  const set = (fs) => st.style.setProperty('--fs-head', fs.toFixed(1) + 'px');
  set(hi); if (fits()) return;
  for (let i = 0; i < 10; i++) { const m = (lo + hi) / 2; set(m); if (fits()) lo = m; else hi = m; }
  set(lo);
}

// Scroll exit (scrub, linear in scroll, so scrolling back up retraces it exactly).
// Wide screens (hero is 180vh with a sticky inner = pinned): badge/buttons/spec fade and rise first,
// the headline stays whole for the first 10%, then GALACTUS slides out left growing to 1.1x and fading,
// RACING slides out right, Abhimanyu drives toward the viewer and a little left (dust kicks up with
// scroll speed), the wedge lags behind.
// Phones (stacked, no pin): the hero scrolls away normally with a light fade/slide of the words.
export function heroScroll(H, dust) {
  if (!H) return null;
  const stacked = matchMedia(STACKED).matches;
  const kick = dust ? (st) => { const v = st.getVelocity(); if (v > 40 && st.progress < 0.98) dust.kick(Math.min(320, v * 0.15)); } : undefined;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: H.hero, start: 'top top', end: stacked ? 'bottom top' : 'bottom bottom', scrub: true, invalidateOnRefresh: true, onUpdate: kick },
  });
  const fade = [H.badge, H.ui, H.details].filter(Boolean);
  if (stacked) {
    tl.to(fade, { y: -24, autoAlpha: 0, duration: 0.4 }, 0)
      .to(H.gL, { x: () => -W(H) * 0.3, opacity: 0, duration: 0.6 }, 0)
      .to(H.rL, { x: () => W(H) * 0.3, opacity: 0, duration: 0.6 }, 0)
      .to(H.carL, { scale: 1.03, duration: 1 }, 0)
      .to(H.wedgeL, { y: () => Ht(H) * 0.05, duration: 1 }, 0);
    return tl;
  }
  tl.to(fade, { y: -40, autoAlpha: 0, duration: 0.3 }, 0)
    .to(H.gL, { x: () => -W(H) * 0.62, scale: 1.1, duration: 0.9 }, 0.1).to(H.gL, { opacity: 0, duration: 0.65 }, 0.1)
    .to(H.rL, { x: () => W(H) * 0.62, duration: 0.9 }, 0.1).to(H.rL, { opacity: 0, duration: 0.65 }, 0.1)
    .to(H.carL, { x: () => -W(H) * 0.08, y: () => Ht(H) * 0.05, scale: 1.16, duration: 1 }, 0)
    .to(H.wedgeL, { y: () => Ht(H) * 0.08, duration: 1 }, 0);
  return tl;
}

// Start lights: 3 reds on one by one, all out = GO, loader wipes up. Max 1s. Calls go() at "all out".
// Repeat visits (sessionStorage) and reduced motion skip straight to go().
export function startLights(loader, go, { skip = false } = {}) {
  let seen = false;
  try { seen = sessionStorage.getItem(SEEN) === '1'; sessionStorage.setItem(SEEN, '1'); } catch (e) { /* storage blocked: play */ }
  const hide = () => { if (loader) gsap.set(loader, { autoAlpha: 0, pointerEvents: 'none' }); };
  if (!loader || skip || seen) { hide(); go(); return; }
  const t = tokens(), lights = [...loader.querySelectorAll('[data-light]')], text = loader.querySelector('[data-loader-text]');
  const tl = gsap.timeline();
  lights.forEach((l, i) => tl.call(() => l.classList.add('is-on'), null, 0.08 + i * 0.2));
  tl.call(() => { lights.forEach((l) => l.classList.remove('is-on')); if (text) text.textContent = 'Go'; go(); }, null, 0.72)
    .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: t.base, ease: t.inOut }, 0.76)
    .add(hide);
  return tl;
}

// Intro, ~1.6s: wedge wipes along its diagonal, words slam in from both sides (hard stop, no
// overshoot), Abhimanyu drives in from the right with a streak + dust and one 3px suspension dip,
// the spec strip types in, then the buttons.
export function heroIntro(H, dust) {
  if (!H) return null;
  const t = tokens(), w = W(H);
  const tl = gsap.timeline({ defaults: { ease: t.out } });

  // Wedge: collapse the polygon onto its first point, then let the other points run out along the
  // diagonal and the bottom edge.
  const full = getComputedStyle(H.wedge).clipPath;
  const pts = (full.match(/polygon\((.*)\)/) || [])[1];
  if (pts) {
    const list = pts.split(',').map((p) => p.trim());
    const from = `polygon(${list.map(() => list[0]).join(', ')})`;
    tl.fromTo(H.wedge, { clipPath: from }, { clipPath: full, duration: 0.5, ease: t.inOut, clearProps: 'clipPath' }, 0);
  }
  tl.fromTo(H.g, { x: -w }, { x: 0, duration: 0.46, clearProps: 'transform' }, 0.1)
    .fromTo(H.r, { x: w }, { x: 0, duration: 0.46, clearProps: 'transform' }, 0.18);

  // Car arrives at 0.3s, settles at ~0.9s.
  tl.fromTo(H.car, { x: w * 0.75 }, { x: 0, duration: 0.6 }, 0.3);
  if (H.streak.length) {
    tl.set(H.streak, { opacity: 1, scaleX: 1 }, 0.3)
      .to(H.streak, { scaleX: 0, opacity: 0, duration: 0.42, stagger: 0.04, clearProps: 'transform,opacity' }, 0.5);
  }
  if (dust) tl.call(() => dust.kick(220), null, 0.32).call(() => dust.kick(420), null, 0.78);
  tl.to(H.car, { y: 3, duration: 0.09, ease: t.inOut }, 0.88)
    .to(H.car, { y: 0, duration: 0.16, clearProps: 'transform' }, 0.97);

  // Spec strip: each item is revealed one character at a time (monospace, so steps = characters).
  let at = 1.0;
  H.spec.forEach((s) => {
    const n = Math.max(1, s.textContent.length), d = n * 0.012;
    tl.fromTo(s, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d, ease: `steps(${n})`, clearProps: 'clipPath' }, at);
    at += d + 0.03;
  });
  const late = [H.scrollLink, ...(H.badge ? H.badge.children : []), ...(H.ui ? H.ui.children : [])].filter(Boolean);
  tl.fromTo(late, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: t.base, stagger: 0.06, clearProps: 'opacity,transform' }, Math.max(1.3, at - 0.1));
  return tl;
}

// Desktop with a mouse: the car tilts up to 1.5deg toward the cursor. Viewport width is cached.
export function carTilt(H) {
  if (!H || !H.tilt || !matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
  const t = tokens(), rot = gsap.quickTo(H.tilt, 'rotation', { duration: t.slow, ease: t.out });
  let vw = innerWidth;
  const onResize = () => { vw = innerWidth; };
  const onMove = (e) => rot((e.clientX / vw - 0.5) * 3);
  const onLeave = () => rot(0);
  addEventListener('resize', onResize);
  H.hero.addEventListener('pointermove', onMove);
  H.hero.addEventListener('pointerleave', onLeave);
  return () => {
    removeEventListener('resize', onResize);
    H.hero.removeEventListener('pointermove', onMove);
    H.hero.removeEventListener('pointerleave', onLeave);
    gsap.set(H.tilt, { clearProps: 'transform' });
  };
}
