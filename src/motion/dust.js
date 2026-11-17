// Dust behind and around Abhimanyu's wheels: a small canvas particle system (no image edges anywhere).
// - kick(rate): throw dust for a moment (particles per second, decays quickly). Used by the intro and
//   by forward scroll.
// - At rest a light haze keeps drifting near the ground.
// - Runs on the GSAP ticker only while the canvas is on screen. Reduced motion: one static haze frame.
// The canvas sits inside the car's intro layer, so the dust travels with the car.
import { gsap } from './core.js';

// Earthy dust tones. Image content (like the photo), not UI colours, so they are not design tokens.
const TONES = [[122, 90, 60], [168, 134, 96], [196, 168, 130], [140, 108, 74]];
// Wheel contact points in canvas fractions (canvas = car box widened, see .hero__dust) and weights.
// Rear wheels (right side of the picture) throw most of the dust.
const EMIT = [
  { x: 0.82, y: 0.78, w: 4 },  // rear right
  { x: 0.64, y: 0.68, w: 3 },  // rear left (behind the body)
  { x: 0.53, y: 0.88, w: 1 },  // front right
  { x: 0.13, y: 0.80, w: 1 },  // front left
];
const WSUM = EMIT.reduce((s, e) => s + e.w, 0);

function sprite([r, g, b]) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(0.45, `rgba(${r},${g},${b},.55)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return c;
}

export function createDust(canvas, { max = 150, haze = 22, reduce = false, dprMax = 1.5 } = {}) {
  if (!canvas || !canvas.getContext) return null;
  const ctx = canvas.getContext('2d'), sprites = TONES.map(sprite);
  const P = [];
  let w = 0, h = 0, k = 1, rate = 0, acc = 0, visible = false, running = false, seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pick = () => { let r = rnd() * WSUM; for (const e of EMIT) { if ((r -= e.w) <= 0) return e; } return EMIT[0]; };

  function spawn(kind, age = 0) {
    if (P.length >= max) return;
    const e = pick(), hz = kind === 'haze';
    P.push({
      hz, x: (e.x + (rnd() - 0.5) * (hz ? 0.16 : 0.05)) * w, y: (e.y - rnd() * (hz ? 0.08 : 0.02)) * h,
      vx: (hz ? (rnd() - 0.3) * 10 : 40 + rnd() * 140) * k,   // thrown backwards = to the right
      vy: (hz ? -2 - rnd() * 6 : -20 - rnd() * 70) * k,
      s: (hz ? 34 + rnd() * 50 : 20 + rnd() * 34) * k, g: hz ? 0.6 : 1.8 + rnd() * 1.2,
      a: hz ? 0.1 + rnd() * 0.1 : 0.5 + rnd() * 0.35, life: hz ? 2.6 + rnd() * 2.4 : 0.8 + rnd() * 0.9, age, c: (rnd() * TONES.length) | 0,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of P) {
      const t = p.age / p.life, a = p.a * (t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85), s = p.s * (1 + p.g * t);
      if (a <= 0) continue;
      ctx.globalAlpha = a; ctx.drawImage(sprites[p.c], p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  function tick(time, dtMs) {
    const dt = Math.min(dtMs, 50) / 1000;
    // spawn: kicked dust (decaying rate) + keep the resting haze topped up
    acc += rate * dt; rate *= Math.exp(-dt * 2.6); if (rate < 1) rate = 0;
    while (acc >= 1) { spawn('kick'); acc -= 1; }
    let hz = 0; for (const p of P) if (p.hz) hz++;
    if (hz < haze && rnd() < 0.3) spawn('haze');
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.age += dt;
      if (p.age >= p.life) { P.splice(i, 1); continue; }
      const drag = p.hz ? 0.2 : 2.2;
      p.vx *= Math.exp(-drag * dt); p.vy = p.vy * Math.exp(-drag * dt) + (p.hz ? 0 : 18 * k * dt);
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    draw();
  }

  const start = () => { if (!running && visible && !reduce) { running = true; gsap.ticker.add(tick); } };
  const stop = () => { if (running) { running = false; gsap.ticker.remove(tick); } };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprMax);
    w = canvas.clientWidth; h = canvas.clientHeight; k = w / 900;
    canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduce) { P.length = 0; seed = 7; for (let i = 0; i < haze; i++) spawn('haze', 1.2); draw(); }
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }).observe(canvas);
  resize();

  return {
    kick(r) { if (!reduce) rate = Math.max(rate, r); },
    // fill the resting haze at once (used when there is no intro)
    settle() { if (!reduce) for (let i = P.length; i < haze; i++) spawn('haze', rnd() * 2); },
  };
}
