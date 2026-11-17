// S03 Cars motion.
// Desktop: pinned "teardown" of Abhimanyu. A camera (transform on the cut-out image) zooms and pans
// through the stops in cars.json, a red hairline draws from the part to its callout, the spec counts
// up and the S1–S4 bar fills. All layout is measured on refresh; scrolling only scrubs a timeline
// that animates transform / opacity / clip-path. Nothing runs when the section is not being scrolled.
// Mobile: the same stops as stacked cards (static crops), revealed on scroll.
import { gsap, ScrollTrigger, tokens } from './core.js';

const STEP = 2.2; // timeline units per stop: camera move 1, callout in, hold, callout out
const LEAD = 0.3; // units of full car before stop 1
const GAP = 56; // px between the part's region and its callout

const fmt = (v, dp) => Number(v).toFixed(dp);

// Count-up writer that only touches the DOM when the text changes.
function counter(el) {
  const n = +el.dataset.tdn, dp = +el.dataset.dp || 0, o = { v: n };
  let last = el.textContent;
  const write = () => { const s = fmt(o.v, dp); if (s !== last) { el.textContent = s; last = s; } };
  return { o, n, write };
}

export function teardown(root) {
  const td = root.querySelector('[data-td]'); if (!td) return null;
  const T = tokens();
  const stops = JSON.parse(td.dataset.stops || '[]');
  const img = td.querySelector('[data-td-cam]');
  const intro = td.querySelector('[data-td-intro]');
  const sectors = td.querySelector('.td__sectors');
  const top = td.querySelector('.td__top');
  const calls = stops.map((_, i) => td.querySelector(`.td__call[data-td-call="${i}"]`));
  const lns = stops.map((_, i) => [...td.querySelectorAll(`[data-td-ln="${i}"]`)]);
  const dots = stops.map((_, i) => [...td.querySelectorAll(`[data-td-dot="${i}"]`)]);
  const closes = stops.map((_, i) => td.querySelector(`[data-td-close="${i}"]`));
  const fills = stops.map((_, i) => td.querySelector(`[data-td-fill="${i}"]`));
  const segs = stops.map((_, i) => td.querySelector(`[data-td-s="${i}"]`));
  const nums = calls.map((c) => { const el = c && c.querySelector('[data-tdn]'); return el ? counter(el) : null; });
  const ar = (+img.getAttribute('width')) / (+img.getAttribute('height'));

  // Geometry, in px of the pinned stage. Recomputed on every refresh (load, resize, font swap).
  const G = { cam: [], rest: { x: 0, y: 0, s: 1 } };
  function measure() {
    const W = td.clientWidth, H = innerHeight;
    const gut = parseFloat(getComputedStyle(td.querySelector('.td__top')).paddingLeft) || 72;
    const yTop = top.offsetTop + top.offsetHeight + 20;
    const yBot = H - sectors.offsetHeight - 12;
    const availH = yBot - yTop, cy0 = yTop + availH / 2;
    // Rest: the whole car to the right of the intro text.
    const ix = intro.offsetLeft + intro.offsetWidth + 32;
    const bw = Math.min(W - ix - gut, availH * ar * 0.98);
    const bh = bw / ar;
    const cx0 = ix + (W - gut - ix) / 2;
    img.style.width = bw + 'px';
    img.style.left = cx0 - bw / 2 + 'px';
    img.style.top = cy0 - bh / 2 + 'px';
    const L = cx0 - bw / 2, Tp = cy0 - bh / 2;
    const P = (u, v) => [L + u * bw, Tp + v * bh]; // image fraction -> rest screen px

    G.cam = stops.map((st, i) => {
      const call = calls[i], cw = call.offsetWidth, ch = call.offsetHeight;
      const left = st.side === 'left';
      // The part goes in the region beside the callout; the callout never enters that region.
      const r0 = left ? gut + cw + GAP : gut, r1 = left ? W - gut : W - gut - cw - GAP;
      const RW = r1 - r0, Tx = r0 + RW / 2, Ty = cy0;
      const [x0, y0] = P(st.box[0], st.box[1]), [x1, y1] = P(st.box[2], st.box[3]);
      const s = Math.min(st.zoom || 2, (0.92 * RW) / (x1 - x0), (0.92 * availH) / (y1 - y0));
      const bcx = (x0 + x1) / 2, bcy = (y0 + y1) / 2;
      const x = Tx - cx0 - s * (bcx - cx0), y = Ty - cy0 - s * (bcy - cy0);
      const scr = ([u, v]) => { const [px, py] = P(u, v); return [cx0 + s * (px - cx0) + x, cy0 + s * (py - cy0) + y]; };
      // Callout: outer edge of the stage, vertically centred on the part, kept between the bars.
      const cl = left ? gut : W - gut - cw;
      const ct = Math.max(yTop, Math.min(yBot - ch, Ty - ch / 2));
      call.style.left = cl + 'px'; call.style.top = ct + 'px';
      const attach = [left ? cl + cw : cl, ct + 1];
      // Close-up photo (if any) fills the part region at 4:3; the hairline starts at its edge.
      let anchors = st.anchors.map(scr);
      const cu = closes[i];
      if (cu) {
        const fw = Math.min(0.9 * RW, 0.9 * availH * 4 / 3), fh = fw * 3 / 4;
        Object.assign(cu.style, { left: Tx - fw / 2 + 'px', top: Ty - fh / 2 + 'px', width: fw + 'px', height: fh + 'px' });
        anchors = [[left ? Tx - fw / 2 : Tx + fw / 2, Ty]];
      }
      anchors.forEach(([ax, ay], j) => {
        const ln = lns[i][j], dot = dots[i][j]; if (!ln) return;
        const dx = attach[0] - ax, dy = attach[1] - ay;
        ln.style.left = ax + 'px'; ln.style.top = ay + 'px'; ln.style.width = Math.hypot(dx, dy) + 'px';
        gsap.set(ln, { rotation: (Math.atan2(dy, dx) * 180) / Math.PI });
        dot.style.left = ax + 'px'; dot.style.top = ay + 'px';
      });
      // Kept for the verify step (window.__td): part rect vs callout rect at this stop.
      const [px0, py0] = scr([st.box[0], st.box[1]]), [px1, py1] = scr([st.box[2], st.box[3]]);
      return { x, y, s, part: [px0, py0, px1, py1], call: [cl, ct, cl + cw, ct + ch] };
    });
  }
  measure();
  window.__td = G;

  const n = stops.length;
  const cam = (i) => (i < 0 || i >= n ? G.rest : G.cam[i]);
  const camVars = (i) => ({ x: () => cam(i).x, y: () => cam(i).y, scale: () => cam(i).s });

  // Count-ups follow the timeline time directly (a scrub that jumps over a tween skips its callbacks).
  const counts = (time) => nums.forEach((c, i) => {
    if (!c) return;
    const p = Math.min(1, Math.max(0, (time - (LEAD + i * STEP + 1.1)) / 0.6));
    c.o.v = c.n * T.out(p); c.write();
  });
  let active = -2;
  const setActive = (time) => {
    counts(time);
    const i = time < LEAD || time >= LEAD + n * STEP ? -1 : Math.floor((time - LEAD) / STEP);
    if (i === active) return; active = i;
    segs.forEach((s, k) => s && s.classList.toggle('is-on', k === i));
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: td, start: 'top top', end: () => '+=' + Math.round(innerHeight * (n * 1.25 + 1)),
      pin: true, scrub: true, invalidateOnRefresh: true, refreshPriority: 2,
      onRefreshInit: measure,
      onToggle: (st) => td.classList.toggle('is-live', st.isActive),
      onUpdate: () => setActive(tl.time()),
      onRefresh: () => setActive(tl.time()),
    },
  });
  tl.fromTo(intro, { opacity: 1, y: 0 }, { opacity: 0, y: -24, duration: 0.45, ease: T.inOut }, LEAD);
  stops.forEach((st, i) => {
    const t0 = LEAD + i * STEP;
    tl.fromTo(img, camVars(i - 1), { ...camVars(i), duration: 1, ease: T.inOut, immediateRender: i === 0 }, t0);
    if (fills[i]) tl.fromTo(fills[i], { scaleX: 0 }, { scaleX: 1, duration: STEP }, t0);
    if (closes[i]) tl.fromTo(closes[i], { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0 + 0.75);
    tl.fromTo(dots[i], { scale: 0 }, { scale: 1, duration: 0.12 }, t0 + 0.9);
    tl.fromTo(lns[i], { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: T.out }, t0 + 0.95);
    tl.fromTo(calls[i], { opacity: 0, y: 16, clipPath: 'inset(0% 0% 100% 0%)' },
      { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, ease: T.out }, t0 + 1.05);
    // Out, just before the camera leaves for the next stop.
    const tOut = t0 + STEP - 0.35;
    tl.to(calls[i], { opacity: 0, y: -12, duration: 0.3 }, tOut);
    tl.to(lns[i], { scaleX: 0, duration: 0.25 }, tOut);
    tl.to(dots[i], { scale: 0, duration: 0.2 }, tOut + 0.05);
    if (closes[i]) tl.to(closes[i], { opacity: 0, duration: 0.3 }, tOut);
  });
  const tEnd = LEAD + n * STEP;
  tl.fromTo(img, camVars(n - 1), { ...camVars(n), duration: 1, ease: T.inOut, immediateRender: false }, tEnd);
  tl.fromTo(intro, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: T.out, immediateRender: false }, tEnd + 0.7);
  tl.set({}, {}, tEnd + 1.6); // hold the full car before the pin releases
  return tl;
}

// Mobile / no pin: each card's crop wipes in, the dot and hairline draw, the spec counts up.
export function teardownCards(root) {
  const T = tokens();
  root.querySelectorAll('[data-tdm]').forEach((card) => {
    const frame = card.querySelector('.tdm__frame'), dot = card.querySelectorAll('[data-tdm-dot]'), ln = card.querySelector('[data-tdm-ln]');
    const call = card.querySelector('.td__call'), numEl = card.querySelector('[data-tdn]');
    const c = numEl ? counter(numEl) : null;
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' } });
    tl.fromTo(frame, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: T.wipe, ease: T.out })
      .fromTo(dot, { scale: 0 }, { scale: 1, duration: T.base, ease: T.out }, T.slow)
      .fromTo(ln, { scaleY: 0 }, { scaleY: 1, duration: T.slow, ease: T.out }, T.slow + 0.08)
      .fromTo(call, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: T.slow, ease: T.out }, T.slow);
    if (c) tl.fromTo(c.o, { v: 0 }, { v: c.n, duration: T.wipe, ease: T.out, onUpdate: c.write }, T.slow + 0.1);
  });
}

// Evolution: the years slide up into their masks, one after another. On desktop the row sits in the
// horizontal track, so the trigger runs on that track's animation (containerAnimation).
export function evoIn(root, move) {
  const evo = root.querySelector('[data-evo]'); if (!evo) return;
  const T = tokens();
  gsap.fromTo(evo.querySelectorAll('[data-evo-year]'), { yPercent: 105 }, {
    yPercent: 0, duration: T.slow, ease: T.out, stagger: 0.07,
    scrollTrigger: move ? { trigger: evo, containerAnimation: move, start: 'left 70%', toggleActions: 'play none none none' } : { trigger: evo, start: 'top 80%', toggleActions: 'play none none none' },
  });
}

// Spec sheet: scrim fades, the panel wipes in from the right (clip-path). Closing reverses, quicker.
export function animateSheet(el, open, done) {
  const panel = el.querySelector('[data-sheet-panel]'), scrim = el.querySelector('.sheet__scrim');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { if (done) done(); return; }
  const T = tokens();
  gsap.killTweensOf([panel, scrim]);
  if (open) {
    gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: T.base, ease: T.out });
    gsap.fromTo(panel, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: T.wipe, ease: T.out, clearProps: 'clipPath' });
  } else {
    gsap.to(scrim, { opacity: 0, duration: T.base, ease: T.out });
    gsap.to(panel, { clipPath: 'inset(0% 0% 0% 100%)', duration: T.slow, ease: T.out, onComplete: () => { gsap.set([panel, scrim], { clearProps: 'all' }); if (done) done(); } });
  }
}
