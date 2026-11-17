// Shared motion setup: GSAP plugins, design-token durations/easings, Lenis smooth scroll.
// Lenis runs on the GSAP ticker so ScrollTrigger and the smooth scroll share one frame loop.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, CustomEase);

export { gsap, ScrollTrigger };

export const REDUCE = '(prefers-reduced-motion: reduce)';
export const DESKTOP = '(min-width: 900px)';

// Read --dur-* and --ease-* from the MTVNA tokens so JS motion uses the same values as CSS.
let T = null;
export function tokens() {
  if (T) return T;
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  const ms = (n, fb) => (parseFloat(v(n)) || fb) / 1000;
  const bez = (n, fb) => { const m = v(n).match(/cubic-bezier\(([^)]+)\)/); return CustomEase.create('gr' + n, m ? m[1] : fb); };
  T = {
    fast: ms('--dur-fast', 120), base: ms('--dur-base', 220), slow: ms('--dur-slow', 480), wipe: ms('--dur-wipe', 720),
    out: bez('--ease-out', '.2,.7,0,1'), inOut: bez('--ease-in-out', '.7,0,.2,1'),
  };
  return T;
}

// Smooth scroll. Not created under prefers-reduced-motion (native scroll, instant jumps).
let lenis = null;
export function smoothScroll(opts = {}) {
  if (lenis || matchMedia(REDUCE).matches) return lenis;
  lenis = new Lenis({ autoRaf: false, ...opts });
  // Smooth (wheel) scrolls update ScrollTrigger in the same tick. Native scrolls (touch, keyboard,
  // scrollbar) are already seen by ScrollTrigger's own listener; updating twice forces a second reflow.
  lenis.on('scroll', (l) => { if (l.isScrolling !== 'native') ScrollTrigger.update(); });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

// Scroll to an element, `offset` px below the top of the viewport.
// `immediate` jumps (used for #hash on page load, where Lenis may not have synced the browser's own jump).
export function scrollToEl(el, offset = 0, { immediate = false } = {}) {
  const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
  if (lenis && !immediate) lenis.scrollTo(y, { duration: 1.2, easing: tokens().inOut });
  else if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

// Reveal: clip-path wipe up + rise + slight skew (the original data-reveal effect).
// Elements already revealed carry data-done so a breakpoint change never replays them.
export function reveal(el, { delay = 0, y = 56, skew = 2, start = 'top 92%' } = {}) {
  if (el.hasAttribute('data-done')) return;
  const t = tokens();
  gsap.fromTo(el,
    { opacity: 0, y, skewY: skew, clipPath: 'inset(0% 0% 100% 0%)' },
    {
      opacity: 1, y: 0, skewY: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: t.wipe, ease: t.out, delay,
      scrollTrigger: { trigger: el, start, once: true },
      onComplete: () => { el.setAttribute('data-done', ''); gsap.set(el, { clearProps: 'opacity,transform,clipPath' }); },
    });
}
