// Team page motion (Prompt 7): intro wedge wipe and the sub-team tab switch (GSAP Flip).
// The intro + recruitment headlines reuse headlineLines() from sections.js (red line lands last).
import { gsap, ScrollTrigger, tokens, REDUCE, DESKTOP } from './core.js';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

// Black -17° wedge wipes in from the right, a beat after the headline starts.
export function wedgeWipe(root) {
  const w = root.querySelector('[data-wedge]'); if (!w || w.hasAttribute('data-split')) return;
  const t = tokens();
  w.setAttribute('data-split', '');
  gsap.fromTo(w, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: t.wipe, ease: t.out, delay: 0.12, clearProps: 'clipPath' });
}

// Tab switch. `change()` moves the indicator into the new tab and swaps the [hidden] intros / cards.
// Desktop: one Flip over all of them: the indicator slides (scaleX for the width change), leaving
// cards + intro fade out in place (absolute), entering ones rise in. Phones: no Flip, a short fade.
// Reduced motion: instant.
let flip = null;
export function switchTab(panel, ind, change) {
  if (flip) flip.progress(1);
  const els = [ind, ...panel.querySelectorAll('[data-team]')];
  if (matchMedia(REDUCE).matches) { change(); ScrollTrigger.refresh(); return; }
  const t = tokens();
  if (!matchMedia(DESKTOP).matches) {
    change();
    const on = [...panel.querySelectorAll('[data-team]:not([hidden])')];
    gsap.fromTo(on, { opacity: 0 }, { opacity: 1, duration: t.base, ease: t.out, clearProps: 'opacity' });
    ScrollTrigger.refresh();
    return;
  }
  const state = Flip.getState(els);
  change();
  flip = Flip.from(state, {
    targets: els, duration: t.slow, ease: t.out, scale: true, absoluteOnLeave: true,
    onLeave: (out) => gsap.to(out, { opacity: 0, y: -16, duration: t.base, ease: t.out }),
    onEnter: (inn) => gsap.fromTo(inn, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: t.slow, ease: t.out, delay: 0.1, stagger: 0.06 }),
    onComplete: () => { gsap.set(els, { clearProps: 'opacity,transform' }); flip = null; ScrollTrigger.refresh(); },
  });
}
