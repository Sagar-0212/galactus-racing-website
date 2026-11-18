// Team page entry. Markup is rendered at build time (src/render/team.js).
import './styles/base.css';
import './styles/components.css';
import './styles/team.css';
import { initTeamMotion, switchTab, scrollToEl, loadFlip } from './motion/index.js';
import { initMenu } from './ui/menu.js';
import { initMaps } from './ui/map.js';

initMenu();
if (document.fonts) document.fonts.ready.then(() => document.documentElement.classList.add('fonts-ok')); else document.documentElement.classList.add('fonts-ok');
initMaps();
document.querySelectorAll('[data-href]').forEach((b) => b.addEventListener('click', () => { location.href = b.dataset.href; }));
initTeamMotion();

// ---------- Sub-team tabs (WAI-ARIA tabs, automatic activation) ----------
// Arrow Left/Right move to the previous/next tab (wrapping), Home/End to the first/last. Only the
// active tab is in the Tab order (roving tabindex); Tab from it goes to the panel.
const list = document.querySelector('[data-tabs]');
const panel = document.querySelector('[data-panel]');
const ind = document.querySelector('[data-tab-ind]');
const tabs = list ? [...list.querySelectorAll('[role="tab"]')] : [];
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function select(id, { focus = false } = {}) {
  const tab = tabs.find((x) => x.dataset.tab === id);
  if (!tab) return;
  if (focus) tab.focus({ preventScroll: true });
  // Keep the tab visible in the sideways-scrolling row (phones). Horizontal only, never the page.
  if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: reduce() ? 'auto' : 'smooth' });
  if (tab.getAttribute('aria-selected') === 'true') return;
  switchTab(panel, ind, () => {
    tabs.forEach((x) => { const on = x === tab; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
    tab.appendChild(ind);
    panel.setAttribute('aria-labelledby', tab.id);
    panel.querySelectorAll('[data-team]').forEach((el) => { el.hidden = el.dataset.team !== id; });
  });
}

if (list) {
  ['pointerover', 'focusin'].forEach((ev) => list.addEventListener(ev, () => { if (matchMedia('(min-width: 900px)').matches) loadFlip(); }, { once: true, passive: true }));
  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.tab)));
  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const n = tabs.length;
    const next = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (next == null) return;
    e.preventDefault();
    select(tabs[next].dataset.tab, { focus: true });
  });
  // Intro jump links open their sub-team's tab (Lenis scrolls to #subteams).
  document.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', () => select(a.dataset.jump)));
  // Old deep links (#chassis, #power, ...) open that tab.
  const h = location.hash.slice(1);
  if (tabs.some((x) => x.dataset.tab === h)) {
    select(h);
    requestAnimationFrame(() => scrollToEl(document.getElementById('subteams'), 80, { immediate: true }));
  }
}
