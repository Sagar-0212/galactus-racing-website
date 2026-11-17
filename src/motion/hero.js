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
    details: q('[data-l="details"]'), tilt: q('[data-car-tilt]'), streak: qa('[data-streak] i'), dust: qa('[data-dust] i'),
    spec: qa('[data-hero-spec] > span'), scrollLink: q('[data-hero-scroll]'), badge: q('[data-hero-badge]'), ui: q('[data-hero-ui]'),
  };
}

const W = (H) => H.sticky.clientWidth;
const Ht = (H) => H.sticky.clientHeight;

// Scroll (scrub, linear): GALACTUS exits left, RACING right, Abhimanyu drives forward (toward the
// viewer = left and a little bigger, anchored at its bottom edge so it never leaves the frame),
// the wedge lags behind (sinks), details fade and lift.
export function heroScroll(H, desktop) {
  if (!H) return null;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: H.hero, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
  });
  tl.to(H.gL, { x: () => -W(H) * 0.62, y: () => -Ht(H) * 0.03, scale: 1.16, duration: 1 }, 0).to(H.gL, { opacity: 0, duration: 0.74 }, 0)
    .to(H.rL, { x: () => W(H) * 0.62, y: () => Ht(H) * 0.03, scale: 1.16, duration: 1 }, 0).to(H.rL, { opacity: 0, duration: 0.74 }, 0)
    .to(H.carL, desktop ? { x: () => -W(H) * 0.06, scale: 1.08, duration: 1 } : { scale: 1.03, duration: 1 }, 0)
    .to(H.wedgeL, { y: () => Ht(H) * 0.07, duration: 1 }, 0);
  const fade = [H.details, H.badge, H.ui].filter(Boolean);
  tl.to(fade, { y: -40, duration: 1 }, 0).to(fade, { autoAlpha: 0, duration: 1 / 3.2 }, 0);
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
export function heroIntro(H) {
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
  if (H.dust.length) {
    tl.fromTo(H.dust, { opacity: 0.85, x: 0, y: 0, scale: 0.6 },
      { opacity: 0, x: (i) => 24 + ((i * 37) % 60), y: (i) => -(8 + ((i * 23) % 30)), scale: 1.6, duration: 0.6, stagger: 0.02, clearProps: 'transform,opacity' }, 0.62);
  }
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
