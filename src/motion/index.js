// Motion entry points for the home and team pages (replaces the old requestAnimationFrame loop).
// gsap.matchMedia: desktop (>= 900px) gets pins + parallax; under 900px no pinning and lighter reveals;
// prefers-reduced-motion skips every animation and shows final states.
import { gsap, ScrollTrigger, DESKTOP, REDUCE, smoothScroll, scrollToEl, tokens } from './core.js';
import { heroEls, heroScroll, heroIntro, startLights, carTilt } from './hero.js';
import { createDust } from './dust.js';
import { chrome, reveals, counts, finalCounts, journey, parallax, carsPin, wedgeRise, marquee } from './effects.js';

export { scrollToEl };
export { bindCard, animateLb } from './gallery.js';

export function initHomeMotion(root, { onActive } = {}) {
  tokens();
  const lenis = smoothScroll();
  const H = heroEls(root);
  // Dust: lighter on phones, one static haze frame under reduced motion.
  const phone = !matchMedia(DESKTOP).matches;
  const dust = H && createDust(H.dustCanvas, { reduce: matchMedia(REDUCE).matches, max: phone ? 60 : 150, haze: phone ? 10 : 22, dprMax: phone ? 1 : 1.5 });
  chrome(root, onActive);

  const mm = gsap.matchMedia();
  let ctx = null, desktop = false, galTweens = [];
  const galCols = () => [...root.querySelectorAll('.gal__col[data-speed]')];

  mm.add({ desktop: DESKTOP, mobile: '(max-width: 899px)', reduce: REDUCE }, (c) => {
    const { reduce } = c.conditions;
    ctx = c; desktop = c.conditions.desktop;
    if (reduce) { finalCounts(root); journey(root, true); ctx = null; return; }
    reveals([...root.querySelectorAll('[data-reveal]')], !desktop);
    counts(root);
    journey(root, false);
    heroScroll(H, desktop, dust);
    wedgeRise(root);
    const stopMarq = marquee(root);
    let stopTilt = null;
    if (desktop) {
      stopTilt = carTilt(H);
      carsPin(root);
      parallax([...root.querySelectorAll('[data-speed],[data-hx]')].filter((el) => !el.matches('.gal__col')));
      galTweens = parallax(galCols());
    }
    return () => { if (stopMarq) stopMarq(); if (stopTilt) stopTilt(); galTweens = []; };
  });

  return {
    lenis,
    // Start lights, then the hero intro. Reduced motion: loader goes, final hero shows at once.
    intro: (loader) => startLights(loader, () => { if (!matchMedia(REDUCE).matches) heroIntro(H, dust); }, { skip: matchMedia(REDUCE).matches }),
    refresh: () => ScrollTrigger.refresh(),
    // Gallery grid was re-rendered (filter / column change): new reveals + column parallax.
    refreshGallery(grid) {
      galTweens.forEach((tw) => { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); });
      galTweens = [];
      if (ctx) ctx.add(() => {
        reveals([...grid.querySelectorAll('[data-reveal]')], !desktop);
        if (desktop) galTweens = parallax(galCols());
      });
      ScrollTrigger.refresh();
    },
  };
}

export function initTeamMotion() {
  tokens();
  const hdr = document.querySelector('[data-hdr]');
  smoothScroll({ anchors: { offset: -((hdr && hdr.offsetHeight) || 68) } });
  const mm = gsap.matchMedia();
  mm.add({ desktop: DESKTOP, reduce: REDUCE }, (c) => {
    if (c.conditions.reduce) return;
    // Cards and blocks rise in (no clip/skew on this page, as before).
    document.querySelectorAll('[data-card], [data-in]').forEach((el) => {
      if (el.hasAttribute('data-done')) return;
      const t = tokens();
      gsap.fromTo(el, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: t.wipe, ease: t.out, delay: (+el.dataset.delay || 0) / 1000,
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
        onComplete: () => { el.setAttribute('data-done', ''); gsap.set(el, { clearProps: 'opacity,transform' }); } });
    });
    // Big outlined "Pit crew" text slides left as the page scrolls (desktop).
    const hx = document.querySelector('[data-hx]');
    if (hx && c.conditions.desktop) gsap.to(hx, { x: () => -ScrollTrigger.maxScroll(window) * 0.35, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true, invalidateOnRefresh: true } });
  });
}

