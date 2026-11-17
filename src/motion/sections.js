// Home sections A: About (headline line masks, outline drift, lap-timer stats), Journey (split-flap
// years, tip tick, counter strip), Achievements (starting-grid cards, award tags).
// Only transform / opacity / clip-path are animated. Digit strips rest on their final value in CSS,
// so reduced motion simply never calls these.
import { gsap, tokens } from './core.js';
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
