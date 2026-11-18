// Motion entry points for the home and team pages (replaces the old requestAnimationFrame loop).
// gsap.matchMedia: desktop (>= 900px) gets pins + parallax; under 900px no pinning and lighter reveals;
// prefers-reduced-motion skips every animation and shows final states.
import { gsap, ScrollTrigger, DESKTOP, REDUCE, BOT, smoothScroll, scrollToEl, tokens, loadFlip } from './core.js';
import { heroEls, heroScroll, heroIntro, startLights, carTilt, fitHeadline } from './hero.js';
import { createDust } from './dust.js';
import { teardown, teardownCards, evoIn } from './cars.js';
import { initJourney } from './journey.js';
import { headlineLines, bigDrift, rolls, startingGrid, awardTags, brandPulse, investRaised, contactWipe } from './sections.js';
import { chrome, reveals, counts, finalCounts, parallax, columnParallax, carsPin, wedgeRise, marquee } from './effects.js';

export { scrollToEl, loadFlip };
export { bindCard, animateLb, flipGallery } from './gallery.js';
export { animateSheet } from './cars.js';
export { slideMsg, toastIn, toastOut } from './sections.js';
export { switchTab } from './team.js';
import { wedgeWipe } from './team.js';

export function initHomeMotion(root, { onActive } = {}) {
  tokens();
  // One refresh at start-up instead of four: ScrollTrigger's own DOMContentLoaded/load refreshes are
  // dropped here because show() in home.js refreshes once fonts + hero image are ready (and again on
  // load if that comes later). Each full refresh is a forced layout of the whole page.
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,resize' });
  const lenis = smoothScroll();
  const H = heroEls(root);
  // Dust: lighter on phones, one static haze frame under reduced motion.
  const phone = !matchMedia(DESKTOP).matches;
  const dust = H && createDust(H.dustCanvas, { reduce: matchMedia(REDUCE).matches || BOT, max: phone ? 60 : 150, haze: phone ? 10 : 22, dprMax: phone ? 1 : 1.5, hold: true });
  // Journey before anything measures: its drive mode makes the section ~400vh tall, which moves every
  // trigger below it (sector labels included). Own matchMedia: it also switches on screen height.
  initJourney(root);
  chrome(root, onActive);

  // Headline size depends on the car's outline and the font: fit after fonts load and on every refresh.
  if (H) {
    ScrollTrigger.addEventListener('refreshInit', () => fitHeadline(H));
    fitHeadline(H);
    if (document.fonts) document.fonts.ready.then(() => { fitHeadline(H); if (started) ScrollTrigger.refresh(); });
  }

  const mm = gsap.matchMedia();
  let ctx = null, desktop = false, galTweens = [];
  const galCols = () => [...root.querySelectorAll('.gal__col[data-speed]')];

  // Section motion is built in small steps, one per task, instead of all at once: every new
  // ScrollTrigger measures the page when it is created, and doing ~100 of them in one go was a 0.6 s+
  // long task on a mid-range phone (Lighthouse "Total Blocking Time"). The first run starts in show()
  // (fonts + hero image ready, layout stable) while the start lights cover the page. Only the hero's
  // own motion is built up front. Steps added after a breakpoint change run at once, then refresh.
  let queue = Promise.resolve(), started = false, gen = 0;
  const yieldTask = () => new Promise((r) => (globalThis.scheduler && scheduler.yield ? scheduler.yield().then(r) : setTimeout(r, 0)));
  let pending = null; // { c, steps, g, layout } waiting for start()
  // midway(): called once the first `layout` steps have run (they set the heights of the pinned
  // sections, so everything measured before them, like the sector labels, is stale until a refresh).
  function run({ c, steps, g, layout = 0 }, after, midway) {
    queue = queue.then(async () => {
      for (let k = 0; k < steps.length; k++) {
        if (g !== gen) return; // context reverted (breakpoint changed) while queued
        c.add(steps[k]);
        if (midway && k + 1 === layout) midway();
        await yieldTask();
      }
      if (g === gen && after) after();
    });
    return queue;
  }

  mm.add({ desktop: DESKTOP, mobile: '(max-width: 899px)', reduce: REDUCE }, (c) => {
    const { reduce } = c.conditions;
    const g = ++gen;
    ctx = c; desktop = c.conditions.desktop;
    if (reduce) { finalCounts(root); ctx = null; return; }
    heroScroll(H, dust);
    let stopTilt = null, stopMarq = null;
    if (desktop) stopTilt = carTilt(H);
    const all = [...root.querySelectorAll('[data-reveal]')];
    const steps = [];
    // Layout first: the car rail wrapper's height moves everything below it.
    if (desktop) steps.push(() => evoIn(root, carsPin(root)), () => teardown(root));
    else steps.push(() => { teardownCards(root); evoIn(root, null); });
    for (let k = 0; k < all.length; k += 8) { const part = all.slice(k, k + 8), off = k; steps.push(() => reveals(part, !desktop, off)); }
    steps.push(
      () => counts(root), () => headlineLines(root), () => rolls(root),
      () => startingGrid(root, desktop), () => awardTags(root), () => brandPulse(root), () => investRaised(root),
      () => contactWipe(root, desktop), () => wedgeRise(root), () => { stopMarq = marquee(root); },
    );
    if (desktop) steps.push(
      () => parallax([...root.querySelectorAll('[data-speed],[data-hx]')].filter((el) => !el.matches('.gal__col'))),
      () => { galTweens = columnParallax(galCols()); },
    );
    else steps.push(() => bigDrift(root));
    const job = { c, steps, g, layout: desktop ? 2 : 1 };
    if (started) run(job, () => ScrollTrigger.refresh()); else pending = job;
    return () => { if (stopMarq) stopMarq(); if (stopTilt) stopTilt(); galTweens = []; };
  });

  return {
    lenis,
    // Start lights, then the hero intro. Reduced motion: loader goes, final hero shows at once.
    intro: (loader) => startLights(loader, () => { if (dust) dust.go(); if (!matchMedia(REDUCE).matches) heroIntro(H, dust); }, { skip: matchMedia(REDUCE).matches }),
    refresh: () => ScrollTrigger.refresh(),
    // First run of the queued section motion (from show()). Resolves when every step has run.
    // The start-up refresh happens here, once, right after the layout steps (car rail, teardown; the
    // Journey sets its height earlier), so every trigger created before them, sector labels included,
    // is measured on the final page. onLayout runs after that refresh.
    start(onLayout) {
      if (started) return queue;
      started = true;
      const job = pending; pending = null;
      const settle = () => { ScrollTrigger.refresh(); if (onLayout) onLayout(); };
      if (!job) { settle(); return queue; }
      return run(job, null, settle);
    },
    // Gallery grid was re-rendered (filter / column change): new reveals + column parallax.
    refreshGallery(grid) {
      galTweens.forEach((tw) => { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); });
      galTweens = [];
      if (ctx) ctx.add(() => {
        reveals([...grid.querySelectorAll('[data-reveal]')], !desktop);
        if (desktop) galTweens = columnParallax(galCols());
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
  mm.add({ desktop: DESKTOP, mobile: '(max-width: 899px)', reduce: REDUCE }, (c) => {
    if (c.conditions.reduce) return;
    // Intro + recruitment headlines: lines mask up, the red punchline line lands last. Wedge wipes in.
    // Both are light (transform + clip-path), so phones get them too.
    headlineLines(document);
    wedgeWipe(document);
    if (!c.conditions.desktop) return;
    // Desktop: cards and blocks rise in (no clip/skew on this page, as before).
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

