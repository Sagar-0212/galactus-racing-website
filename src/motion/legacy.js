// Legacy motion: the requestAnimationFrame loop from the Claude Design export, ported as-is.
// Source: archive/claude-design/Galactus Racing.dc.html (class Component: frame, heroFx, journeyFx, ...).
// Only change: React setState calls became plain callbacks / DOM writes.
// This whole file is replaced by GSAP + ScrollTrigger + Lenis in the next step (Prompt 3).

const EZ = 'cubic-bezier(.2,.7,0,1)';

export class LegacyMotion {
  constructor(root, { onActive } = {}) {
    this.root = root;
    this.onActive = onActive;
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lastY = scrollY; this.vel = 0; this.mq = 0; this.frameN = 0;
    this.active = 'home';
  }

  start() {
    this.io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) this.reveal(en.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    this.scan(); this.sizePin();
    const loop = () => { this.frame(); this.raf = requestAnimationFrame(loop); };
    this.frame();
    this.raf = requestAnimationFrame(loop);
  }

  // Called after the page swaps DOM (gallery filter / column change).
  refresh() { this.scan(); this.els = null; }
  onResize() { this.sizePin(); this.stageKey = null; }

  reveal(el) {
    if (el.hasAttribute('data-done')) return; el.setAttribute('data-done', '');
    if (el.hasAttribute('data-count')) this.count(el);
    else if (el.hasAttribute('data-bar')) el.style.width = el.dataset.bar + '%';
    else { el.style.opacity = 1; el.style.transform = 'none'; el.style.clipPath = 'none'; }
    if (this.io) this.io.unobserve(el);
  }

  scan() {
    if (!this.root) return;
    this.root.querySelectorAll('[data-reveal]:not([data-rv]), [data-count]:not([data-rv]), [data-bar]:not([data-rv])').forEach((el, i) => {
      el.setAttribute('data-rv', '');
      if (!this.reduce) {
        if (el.hasAttribute('data-bar')) { el.style.width = '0%'; }
        else if (el.hasAttribute('data-reveal')) {
          el.style.opacity = 0; el.style.transform = 'translateY(56px) skewY(2deg)';
          el.style.clipPath = 'inset(0 0 100% 0)';
          el.style.transition = 'opacity .72s var(--ease-out), transform .72s var(--ease-out), clip-path .72s var(--ease-out)';
          el.style.transitionDelay = (el.dataset.delay != null && el.dataset.delay !== '' ? +el.dataset.delay : (i % 4) * 70) + 'ms';
        }
      }
      this.io.observe(el);
    });
  }

  sizePin() {
    if (!this.root) return;
    const pins = [...this.root.querySelectorAll('[data-pin]')];
    const hs = pins.map((sec) => { const tr = sec.querySelector('[data-track]'); return tr ? Math.max(innerHeight, tr.scrollWidth - innerWidth + innerHeight) : 0; });
    pins.forEach((sec, i) => { if (hs[i] && sec.style.height !== hs[i] + 'px') sec.style.height = hs[i] + 'px'; });
  }

  cache() {
    const R = this.root, qa = (s, el = R) => [...el.querySelectorAll(s)];
    const par = qa('[data-speed],[data-hx],[data-px]'), scenes = [];
    const parScene = par.map((el) => { const sc = el.closest('[data-scene]') || el.parentElement; let i = scenes.indexOf(sc); if (i < 0) { scenes.push(sc); i = scenes.length - 1; } return i; });
    const hero = R.querySelector('[data-hero]'), hq = (s) => hero && hero.querySelector(s);
    this.els = {
      bar: R.querySelector('[data-progress]'), hdr: R.querySelector('[data-hdr]'), sectorEl: R.querySelector('[data-sector]'), sectors: qa('[data-sector-label]'),
      par, parScene, scenes, marqs: qa('[data-marq]'), rise: R.querySelector('[data-wedge="rise"]'),
      pins: qa('[data-pin]').map((sec) => ({ sec, track: sec.querySelector('[data-track]'), pb: sec.querySelector('[data-pinbar]') })),
      tk: qa('[data-tk-skew]'),
      j: { list: R.querySelector('[data-jlist]'), fill: R.querySelector('[data-jfill]'), count: R.querySelector('[data-jcount]'), dots: qa('[data-jdot]') },
      hero, h: hero ? { sticky: hq('[data-hero-sticky]'), stage: hq('[data-stage]'), badge: hq('[data-hero-badge]'), narrow: hq('[data-hero-narrow]'), ui: hq('[data-hero-ui]'),
        L: { wedge: hq('[data-l="wedge"]'), galactus: hq('[data-l="galactus"]'), racing: hq('[data-l="racing"]'), car: hq('[data-l="car"]'), details: hq('[data-l="details"]') } } : null,
    };
  }

  count(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const fmt = (v) => el.dataset.fmt === 'inr' ? v.toLocaleString('en-IN') : String(v);
    if (this.reduce) { el.textContent = fmt(target) + suffix; return; }
    const t0 = performance.now(), dur = 1500;
    const step = (t) => { const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(Math.round(target * e)) + suffix; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  frame() {
    const R = this.root; if (!R) return;
    const vh = innerHeight, vw = innerWidth, y = window.scrollY || document.documentElement.scrollTop || 0;
    if (!this.els || ++this.frameN % 60 === 0) {
      this.scan(); this.sizePin(); this.cache();
      const pend = [...R.querySelectorAll('[data-rv]:not([data-done])')];
      const tops = pend.map((el) => el.getBoundingClientRect().top);
      pend.forEach((el, i) => { if (tops[i] < vh) this.reveal(el); });
    }
    const E = this.els;
    // ---- reads (one layout per frame) ----
    const max = document.documentElement.scrollHeight - vh;
    const secTops = E.sectors.map((s) => s.getBoundingClientRect().top);
    const sceneR = E.scenes.map((s) => s.getBoundingClientRect());
    const pinR = E.pins.map((p) => ({ r: p.sec.getBoundingClientRect(), sw: p.track ? p.track.scrollWidth : 0 }));
    const marqHalf = E.marqs.map((m) => m.scrollWidth / 2);
    const riseR = E.rise ? E.rise.parentElement.getBoundingClientRect() : null;
    const heroSize = E.hero && E.h && E.h.sticky ? { w: E.h.sticky.clientWidth, h: E.h.sticky.clientHeight, top: E.hero.getBoundingClientRect().top, total: E.hero.offsetHeight } : null;
    // ---- writes ----
    if (E.bar) E.bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (E.hdr) { E.hdr.style.background = 'var(--surface-page)'; E.hdr.style.borderColor = y > 40 ? 'var(--border-hairline)' : 'transparent'; }
    let label = null, active = 'home'; secTops.forEach((t, i) => { if (t <= vh * .4) { label = E.sectors[i].dataset.sectorLabel; active = E.sectors[i].id || active; } });
    if (active !== this.active) { this.active = active; if (this.onActive) this.onActive(active); }
    if (E.sectorEl && label && E.sectorEl.textContent !== label) E.sectorEl.textContent = label;
    this.vel += ((y - this.lastY) - this.vel) * 0.15; this.lastY = y;
    if (heroSize) this.heroFx(y, vh, vw, heroSize);
    this.journeyFx(vh);
    if (this.reduce) return;
    E.par.forEach((el, i) => {
      const r = sceneR[E.parScene[i]];
      if (r.bottom < -vh || r.top > vh * 2) return;
      const t = -(r.top + r.height / 2 - vh / 2), cx = r.left + r.width / 2 - vw / 2;
      const sp = +el.dataset.speed || 0, hx = +el.dataset.hx || 0, px = +el.dataset.px || 0;
      el.style.transform = 'translate3d(' + (t * hx * .5 - cx * px).toFixed(1) + 'px,' + (t * sp).toFixed(1) + 'px,0)';
    });
    if (riseR) { const p = Math.min(Math.max(1 - riseR.top / vh, 0), 1); E.rise.style.clipPath = 'polygon(0 0, 100% 0, 100% ' + (100 - 100 * p) + '%, 0 ' + (100 - 40 * p) + '%)'; }
    E.pins.forEach((pn, i) => {
      if (!pn.track) return;
      const { r, sw } = pinR[i], span = r.height - vh;
      const p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
      pn.track.style.transform = 'translate3d(' + (-p * Math.max(0, sw - vw)).toFixed(1) + 'px,0,0)';
      if (pn.pb) pn.pb.style.transform = 'scaleX(' + p + ')';
    });
    this.mq += .6 + Math.min(Math.abs(this.vel), 60) * .35;
    const sk = Math.max(-9, Math.min(9, -this.vel * 0.3)).toFixed(2);
    if (sk !== this.skWas) { this.skWas = sk; E.tk.forEach((el) => { el.style.transform = 'skewX(' + sk + 'deg)'; }); }
    E.marqs.forEach((m, i) => { const half = marqHalf[i]; if (!half) return; const off = this.mq % half; m.style.transform = 'translate3d(' + (m.dataset.marq === '1' ? -off : off - half) + 'px,0,0)'; });
  }

  heroFx(y, vh, vw, size) {
    const H = this.els.h; if (!H || !H.stage) return;
    const IW = 1724, IH = 912, sw = size.w, sh = size.h;
    // Fit the art so the whole buggy (and the headline) always stays inside the hero.
    const s0 = Math.max(sw / IW, sh / IH), sW = (sw - 24) / (IW * 0.954), sH = (sh - 84) / (IH * 0.779);
    const s = Math.min(s0, sW, sH), w = IW * s, h = IH * s;
    const L0 = w >= sw ? Math.min(Math.max(-(w - sw) / 2, sw - 0.989 * w - 12), 12 - 0.035 * w) : sw - w;
    const T = h >= sh ? Math.min(Math.max((sh - h) / 2, 76 - 0.18 * h), sh - 8 - 0.9594 * h) : sh - h;
    this.carBox = { x: L0 + 0.4002 * w, y: T + 0.2522 * h, w: 0.5887 * w, h: 0.7072 * h, sw, sh };
    const key = [L0, T, w, h].map((n) => n.toFixed(1)).join();
    if (this.stageKey !== key) { this.stageKey = key; Object.assign(H.stage.style, { left: L0 + 'px', top: T + 'px', width: w + 'px', height: h + 'px' }); H.stage.style.setProperty('--hu', s.toFixed(4) + 'px'); }
    if (this.reduce) return;
    // Pinned scroll: GALACTUS exits left, RACING exits right, the buggy drives forward, the wedge lags, details fade.
    const span = Math.max(1, size.total - sh), p = Math.min(Math.max(-size.top / span, 0), 1), pk = p.toFixed(4);
    if (pk === this.heroP) return;
    this.heroP = pk;
    const L = H.L, t = (a, b, sc) => 'translate3d(' + a.toFixed(1) + 'px,' + b.toFixed(1) + 'px,0)' + (sc ? ' scale(' + sc.toFixed(4) + ')' : '');
    const fade = Math.max(0, 1 - p * 1.35).toFixed(3);
    if (L.galactus) { L.galactus.style.transform = t(-p * w * 0.62, -p * h * 0.03, 1 + p * 0.16); L.galactus.style.opacity = fade; }
    if (L.racing) { L.racing.style.transform = t(p * w * 0.62, p * h * 0.03, 1 + p * 0.16); L.racing.style.opacity = fade; }
    // The buggy photo carries the wedge's dark pixels around it, so wedge + buggy stay locked together.
    // (Buggy-drives-forward and wedge-lag are switched off here; they come back in the hero step.)
    if (L.wedge) L.wedge.style.transform = '';
    if (L.car) L.car.style.transform = '';
    const dO = Math.max(0, 1 - p * 3.2), dT = t(0, -p * 40);
    [L.details, H.badge, H.ui].forEach((el) => { if (el) { el.style.opacity = dO.toFixed(3); el.style.transform = dT; el.style.visibility = dO < 0.02 ? 'hidden' : ''; } });
    if (H.narrow) { H.narrow.style.opacity = Math.max(0, 1 - p * 2).toFixed(3); H.narrow.style.transform = t(0, -p * 50); }
  }

  journeyFx(vh) {
    const J = this.els.j; if (!J || !J.list) return;
    const r = J.list.getBoundingClientRect(); if (r.bottom < -vh || r.top > vh * 2) return;
    const mark = vh * 0.6, p = Math.min(Math.max((mark - r.top) / r.height, 0), 1);
    const tops = J.dots.map((d) => d.getBoundingClientRect().top);
    if (J.fill) J.fill.style.transform = 'scaleY(' + (this.reduce ? 1 : p).toFixed(4) + ')';
    let lit = 0;
    J.dots.forEach((d, i) => { const on = this.reduce || tops[i] < mark; if (on) lit = i + 1; if (d._on !== on) { d._on = on; d.style.background = on ? 'var(--accent)' : 'var(--surface-page)'; d.style.borderColor = on ? 'var(--accent)' : 'var(--ink-900)'; } });
    const txt = String(Math.max(1, lit)).padStart(2, '0');
    if (J.count && J.count.textContent !== txt) J.count.textContent = txt;
  }

  heroIntro() {
    if (this.reduce || this.introDone) return; this.introDone = true;
    const q = (sel) => document.querySelector(sel);
    const A = (sel, kf, o) => { const el = q(sel); if (el && el.animate) el.animate(kf, { easing: EZ, fill: 'backwards', ...o }); };
    const RV = [{ clipPath: 'inset(0 100% 0 0)', transform: 'translate3d(-8%,0,0)', opacity: 0 }, { clipPath: 'inset(0 0% 0 0)', transform: 'none', opacity: 1 }];
    A('[data-in="galactus"]', RV, { duration: 1000, delay: 120, easing: 'cubic-bezier(.16,1,.3,1)' });
    A('[data-in="racing"]', RV, { duration: 1000, delay: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
    ['[data-l="details"]', '[data-hero-badge]', '[data-hero-ui]', '[data-hero-narrow]'].forEach((sel, i) => A(sel, [{ opacity: 0, transform: 'translate3d(0,16px,0)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 950 + i * 80 }));
  }

  // Lightbox open / change animation (was syncLb in the original).
  animateLb(root, opened, dir) {
    const stage = root.querySelector('[data-lb-stage]'), streak = root.querySelector('[data-lb-streak]'), cap = root.querySelector('[data-lb-cap]');
    if (this.reduce || !stage || !stage.animate) return;
    const d = dir || 1;
    if (opened) {
      root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: EZ });
      stage.animate([{ transform: 'scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, easing: EZ });
    } else {
      stage.animate([{ transform: 'translateX(' + d * 110 + 'px) skewX(' + -d * 6 + 'deg)', opacity: 0, filter: 'blur(8px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], { duration: 460, easing: EZ });
    }
    if (streak) streak.animate([{ transform: 'translateX(' + (d > 0 ? '-120%' : '120vw') + ') skewX(-17deg)' }, { transform: 'translateX(' + (d > 0 ? '120vw' : '-120%') + ') skewX(-17deg)' }], { duration: 560, easing: EZ });
    if (cap) cap.animate([{ transform: 'translateY(18px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: 90, easing: EZ, fill: 'backwards' });
  }

  // Gallery card hover (was galFx / galTilt / galLeave).
  galFx(c, on, touch) {
    const q = (sel) => c.querySelector(sel), img = q('[data-gimg]'), ov = q('[data-gov]'), cap = q('[data-gcap]'), ln = q('[data-gline]'), bt = q('[data-gbtn]');
    if (img && !on) img.style.transform = '';
    if (img && on && this.reduce) img.style.transform = 'scale(1.06)';
    if (ov) ov.style.opacity = on ? 1 : 0;
    if (cap) { cap.style.opacity = on ? 1 : 0; cap.style.transform = on ? 'none' : 'translateY(14px)'; }
    if (ln) ln.style.transform = on ? 'scaleX(1)' : 'scaleX(0)';
    if (bt && !touch) bt.style.opacity = on ? 1 : 0;
    c.style.boxShadow = on ? '0 28px 56px -28px rgba(150,1,1,.6)' : '';
  }
  galTilt(e) {
    if (this.reduce || e.pointerType !== 'mouse') return;
    const c = e.currentTarget, r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = 'rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg)';
    const img = c.querySelector('[data-gimg]'); if (img) img.style.transform = 'scale(1.1) translate(' + (-x * 14).toFixed(1) + 'px,' + (-y * 14).toFixed(1) + 'px)';
  }
}

// Team page loop (from archive/claude-design/Team.dc.html): card/heading reveals + big-text parallax.
export class TeamLegacyMotion {
  constructor() { this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; }
  start() {
    this.io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { this.show(en.target); this.io.unobserve(en.target); } }), { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    const loop = () => { this.frame(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  show(el) { el.style.opacity = 1; el.style.transform = 'none'; }
  frame() {
    const n = (this.n = (this.n || 0) + 1);
    if (n % 30 === 1) {
      document.querySelectorAll('[data-card]:not([data-rv]), [data-in]:not([data-rv])').forEach((el) => {
        el.setAttribute('data-rv', '');
        if (this.reduce) return;
        el.style.opacity = 0; el.style.transform = 'translateY(48px)';
        el.style.transition = 'opacity .7s var(--ease-out), transform .7s var(--ease-out), box-shadow 220ms var(--ease-out), translate 220ms var(--ease-out)';
        el.style.transitionDelay = (+el.dataset.delay || 0) + 'ms, ' + (+el.dataset.delay || 0) + 'ms, 0ms, 0ms';
        this.io.observe(el);
      });
      this.hx = document.querySelector('[data-hx]');
    }
    if (this.hx && !this.reduce) { const y = scrollY; if (y !== this.lastY) { this.lastY = y; this.hx.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)'; } }
  }
}
