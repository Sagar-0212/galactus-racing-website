// Home sections A: About (headline line masks, outline drift, lap-timer stats), Journey (split-flap
// years, tip tick, counter strip), Achievements (starting-grid cards, award tags).
// Only transform / opacity / clip-path are animated. Digit strips rest on their final value in CSS,
// so reduced motion simply never calls these.
import { gsap, ScrollTrigger, tokens, REDUCE } from './core.js';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

// Strip helpers: a strip of n cells rests on cell n-1 (CSS). Motion starts it on cell 0.
const cells = (s) => s.children.length;
const endY = (s) => -100 * (cells(s) - 1) / cells(s);

// ---------- About headline: lines mask up one by one, the red line(s) land last ----------
export function headlineLines(root) {
  const t = tokens();
  root.querySelectorAll('[data-lines] .hl').forEach((hl) => {
    if (hl.hasAttribute('data-done')) return;
    SplitText.create(hl, {
      // No SplitText mask wrapper: the mask is a clip-path on each line whose bottom inset tracks the
      // line's own yPercent, so the visible window stays fixed on the line's resting box and nothing
      // changes layout (a wrapper with padding shifted every trigger below by ~40px). The -12% insets
      // leave room for Anton's caps, which overshoot the .86 line-height.
      type: 'lines', linesClass: 'hl-line', autoSplit: true,
      onSplit(self) {
        // Plain lines first, then the accent lines after a short beat so the red punchline lands last.
        hl.setAttribute('data-split', ''); // lets CSS un-hide a headline kept hidden until it is split
        const red = self.lines.filter((l) => l.querySelector('.hl__accent'));
        const plain = self.lines.filter((l) => !red.includes(l));
        const tl = gsap.timeline({
          scrollTrigger: { trigger: hl, start: 'top 85%', once: true },
          onComplete: () => { hl.setAttribute('data-done', ''); self.revert(); },
        });
        const from = { yPercent: 100, clipPath: 'inset(-12% 0% 100% 0%)' };
        const to = { yPercent: 0, clipPath: 'inset(-12% 0% -12% 0%)', duration: t.slow, ease: t.out, stagger: 0.08 };
        tl.fromTo(plain, from, to).fromTo(red, from, to, plain.length ? '>-0.24' : 0);
        return tl;
      },
    });
  });
}

// ---------- Outline "Freedom" text on phones: slow horizontal drift in its own band ----------
export function bigDrift(root) {
  const el = root.querySelector('[data-bigtext]'); if (!el) return;
  gsap.fromTo(el, { xPercent: 0 }, { xPercent: -18, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
}

// ---------- Stats: lap-timer roll, staggered left to right ----------
// Every column runs the same duration; the ones column has the most digits, so it spins fastest.
export function rolls(root) {
  const t = tokens();
  root.querySelectorAll('[data-roll]').forEach((num) => {
    if (num.hasAttribute('data-done')) return;
    const strips = [...num.querySelectorAll('[data-strip]')];
    gsap.timeline({
      delay: (+num.dataset.delay || 0) / 1000,
      scrollTrigger: { trigger: num, start: 'top 92%', once: true },
      onComplete: () => { num.setAttribute('data-done', ''); gsap.set(strips, { clearProps: 'transform' }); },
    }).fromTo(strips, { y: 0, yPercent: 0 }, { yPercent: (i, s) => endY(s), duration: t.wipe * 1.6, ease: 'power2.out' }, 0);
  });
}

// ---------- Journey years: split-flap. Each digit flicks through its strip in hard steps ----------
// (one step per flap, ~50ms each), digits start 60ms apart so the year settles left to right.
export function flaps(root) {
  root.querySelectorAll('[data-jitem]').forEach((item) => {
    if (item.hasAttribute('data-flapped')) return;
    const strips = [...item.querySelectorAll('.flap [data-strip]')];
    if (!strips.length) return;
    const tl = gsap.timeline({
      // Starts with the item's own reveal (same trigger), a beat after the wipe begins.
      delay: (+item.dataset.delay || 0) / 1000 + 0.12,
      scrollTrigger: { trigger: item, start: 'top 92%', once: true },
      onComplete: () => { item.setAttribute('data-flapped', ''); gsap.set(strips, { clearProps: 'transform' }); },
    });
    strips.forEach((s, i) => {
      const steps = cells(s) - 1;
      tl.fromTo(s, { y: 0, yPercent: 0 }, { yPercent: endY(s), duration: steps * 0.05, ease: `steps(${steps})` }, i * 0.06);
    });
  });
}

// ---------- Achievements: podium cards roll up like a starting grid ----------
// From the left, staggered, slight speed skew that straightens on a hard stop. Desktop: one row, one
// trigger, 80ms apart. Phones: stacked, each card on its own trigger.
export function startingGrid(root, desktop) {
  const t = tokens();
  const slots = [...root.querySelectorAll('[data-grid]')].filter((el) => !el.hasAttribute('data-done'));
  if (!slots.length) return;
  const from = { x: desktop ? -160 : -64, skewX: desktop ? 8 : 4, opacity: 0 };
  const to = (el) => ({ x: 0, skewX: 0, opacity: 1, duration: t.slow, ease: 'expo.out',
    onComplete: () => { el.setAttribute('data-done', ''); gsap.set(el, { clearProps: 'transform,opacity' }); } });
  if (desktop) {
    const wrap = slots[0].parentElement;
    slots.forEach((el, i) => gsap.fromTo(el, from, { ...to(el), delay: i * 0.08, scrollTrigger: { trigger: wrap, start: 'top 85%', once: true } }));
  } else {
    slots.forEach((el) => gsap.fromTo(el, from, { ...to(el), scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  }
}

// ---------- Award tags slide in one after another ----------
export function awardTags(root) {
  const t = tokens();
  const wrap = root.querySelector('[data-awards]'); if (!wrap || wrap.hasAttribute('data-done')) return;
  const tags = [...wrap.children];
  gsap.fromTo(tags, { x: -32, opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' }, {
    x: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: t.base, ease: t.out, stagger: 0.07,
    scrollTrigger: { trigger: wrap, start: 'top 92%', once: true },
    onComplete: () => { wrap.setAttribute('data-done', ''); gsap.set(tags, { clearProps: 'transform,opacity,clipPath' }); },
  });
}

// =====================================================================================================
// Home sections B: Sponsors ("Your brand here" pulse), Invest (₹ raised roll, then budget bars),
// Contact ("LET'S RACE." wedge wipe), plus form message / toast transitions used by src/home.js.
// =====================================================================================================

// ---------- Sponsors: the open Title slot pulses once when it enters ----------
// One hard "ping": the slot kicks up 4% and a red ring expands off it and fades. No repeat.
export function brandPulse(root) {
  const el = root.querySelector('[data-brand]'); if (!el || el.hasAttribute('data-done')) return;
  const ring = el.querySelector('[data-brand-ring]'), t = tokens();
  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: 'top 80%', once: true }, delay: 0.24,
    onComplete: () => { el.setAttribute('data-done', ''); gsap.set([el, ring], { clearProps: 'transform,opacity' }); },
  });
  tl.fromTo(el, { scale: 1 }, { scale: 1.04, duration: t.fast, ease: t.out })
    .to(el, { scale: 1, duration: t.base, ease: t.inOut })
    .fromTo(ring, { scale: 1, opacity: 1 }, { scale: 1.14, opacity: 0, duration: t.slow, ease: t.out }, 0);
}

// ---------- Invest: ₹ raised rolls like the About stats, then the budget bars fill one by one ----------
// The bars wait for both: the roll finished AND the bar row on screen (on phones the row is further down).
export function investRaised(root) {
  const t = tokens();
  const num = root.querySelector('[data-iroll]'), bars = [...root.querySelectorAll('[data-ibar]')];
  const row = bars.length ? bars[0].closest('ul') : null;
  let rolled = !num || num.hasAttribute('data-done'), inView = false;
  const fill = () => {
    if (!rolled || !inView || !row || row.hasAttribute('data-done')) return;
    gsap.fromTo(bars, { scaleX: 0 }, { scaleX: (i, b) => +getComputedStyle(b).getPropertyValue('--p') || 1, duration: t.slow, ease: t.out, stagger: 0.12,
      onComplete: () => { row.setAttribute('data-done', ''); gsap.set(bars, { clearProps: 'transform' }); } });
  };
  if (row && !row.hasAttribute('data-done')) {
    gsap.set(bars, { scaleX: 0 });
    ScrollTrigger.create({ trigger: row, start: 'top 88%', once: true, onEnter: () => { inView = true; fill(); } });
  }
  if (!rolled) {
    const strips = [...num.querySelectorAll('[data-strip]')];
    gsap.timeline({
      scrollTrigger: { trigger: num, start: 'top 90%', once: true },
      onComplete: () => { num.setAttribute('data-done', ''); gsap.set(strips, { clearProps: 'transform' }); rolled = true; fill(); },
    }).fromTo(strips, { y: 0, yPercent: 0 }, { yPercent: (i, s) => endY(s), duration: t.wipe * 1.6, ease: 'power2.out' }, 0);
  }
}

// ---------- Contact: "LET'S RACE." wipes in behind a -17°-ish slanted edge, word by word ----------
// Fires as the paper wedge is rising off the top of the section. The red word lands last.
// Desktop: the two words also slide in from opposite sides, scrubbed with the wedge (same range), and
// stop at their resting place when the section reaches the top, so they never cross or touch.
export function contactWipe(root, desktop) {
  const h = root.querySelector('[data-cwipe]'); if (!h) return;
  if (desktop) {
    const sides = [...h.querySelectorAll('.contact__w')];
    gsap.fromTo(sides, { x: (i) => (i ? 1 : -1) * innerWidth * 0.12 }, { x: 0, ease: 'none',
      scrollTrigger: { trigger: h.closest('section'), start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true } });
  }
  if (h.hasAttribute('data-done')) return;
  const words = [...h.querySelectorAll('.contact__word')], t = tokens();
  gsap.fromTo(words,
    { clipPath: 'polygon(0% -15%, 0% -15%, -30% 115%, -30% 115%)', x: -24 },
    { clipPath: 'polygon(0% -15%, 130% -15%, 100% 115%, -30% 115%)', x: 0, duration: t.wipe, ease: t.out, stagger: 0.08,
      scrollTrigger: { trigger: h, start: 'top 85%', once: true },
      onComplete: () => { h.setAttribute('data-done', ''); gsap.set(words, { clearProps: 'clipPath,transform' }); } });
}

// ---------- Form + toast transitions (called from src/home.js; instant under reduced motion) ----------
const still = () => matchMedia(REDUCE).matches;
export function slideMsg(el) {
  if (still()) return;
  const t = tokens();
  gsap.fromTo(el, { y: -8, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: t.base, ease: t.out, clearProps: 'transform,opacity,clipPath' });
}
export function toastIn(el) {
  if (still()) return;
  const t = tokens();
  gsap.fromTo(el, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: t.base, ease: t.out, clearProps: 'transform,opacity' });
}
export function toastOut(el, done) {
  if (still()) { done(); return; }
  const t = tokens();
  gsap.to(el, { y: 16, opacity: 0, duration: t.base, ease: t.out, onComplete: () => { gsap.set(el, { clearProps: 'transform,opacity' }); done(); } });
}
