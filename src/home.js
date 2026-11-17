// Home page entry. Markup is rendered at build time (src/render/home.js); this file wires up behaviour.
import './styles/base.css';
import './styles/components.css';
import './styles/home.css';
import galleryData from './data/gallery.json';
import { initHomeMotion, scrollToEl, bindCard, animateLb } from './motion/index.js';
import { initMenu } from './ui/menu.js';
import { galleryGrid, galColCount, GAL_CATS } from './render/home.js';
import { slot, toast, pad2 } from './render/ui.js';

const root = document.querySelector('[data-gr-root]');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- Active nav link (driven by ScrollTrigger in src/motion) ----------
const NAV_FOR = { home: 'home', about: 'home', journey: 'journey', cars: 'cars', gallery: 'gallery', sponsors: 'sponsors', contact: 'contact' };
function setActive(id) {
  const act = NAV_FOR[id];
  $$('.hdr__link, .menu__link').forEach((a) => {
    const on = a.getAttribute('href').slice(1) === act;
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    if (a.classList.contains('hdr__link')) a.classList.toggle('is-current', on);
  });
}


// ---------- Scrolling to sections ----------
// Anchors scroll through Lenis, landing just under the fixed header. Pinned sections (hero, cars)
// land exactly at their top so the pin is engaged.
function go(id, immediate = false) {
  const el = document.getElementById(id); if (!el) return;
  const hdr = $('[data-hdr]');
  const pinned = el.hasAttribute('data-pin') || el.hasAttribute('data-hero');
  scrollToEl(el, pinned ? 0 : (hdr ? hdr.offsetHeight : 0) + (el.tagName === 'SECTION' ? 0 : 16), { immediate });
}

let motion = null; // set at start, after the gallery is laid out
let lb = null; // open lightbox index, or null
const menu = initMenu({ isOtherOverlayOpen: () => lb != null });

document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a || !root.contains(a)) return;
  e.preventDefault();
  const id = a.getAttribute('href').slice(1);
  if (!id || !document.getElementById(id)) return;
  if (menu.isOpen()) {
    menu.close();
    requestAnimationFrame(() => requestAnimationFrame(() => go(id)));
    return;
  }
  go(id);
});
$$('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));

// ---------- Gallery: filter tabs + responsive columns ----------
let galFilter = 'all';
let galCols = galColCount(innerWidth);
const galGrid = $('[data-gal-grid]');
const galItems = () => galleryData.filter((g) => galFilter === 'all' || g.category === galFilter);

function bindGalleryCards() {
  $$('[data-gcard]', galGrid).forEach(bindCard);
  $$('[data-open]', galGrid).forEach((b) => b.addEventListener('click', () => openLb(+b.dataset.open)));
}
function renderGallery({ refresh = true } = {}) {
  galGrid.style.setProperty('--cols', galCols);
  galGrid.innerHTML = galleryGrid(galItems(), galCols);
  bindGalleryCards();
  if (refresh && motion) motion.refreshGallery(galGrid);
}
$$('[data-gal-tabs] [role="tab"]').forEach((tab) => tab.addEventListener('click', () => {
  galFilter = tab.dataset.value;
  $$('[data-gal-tabs] [role="tab"]').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
  renderGallery();
}));

// ---------- Lightbox ----------
const lbEl = $('[data-lb]');
let lbDir = 1, lbReturn = null;

function lbBox(item) {
  const w = innerWidth, vh = innerHeight;
  const [ra, rb] = item.shape.split('/').map(Number), rt = ra / rb;
  const aw = w - (w < 700 ? 24 : 260), ah = vh - (w < 700 ? 190 : 230);
  const bw = Math.max(120, Math.min(aw, ah * rt));
  return { w: Math.round(bw) + 'px', h: Math.round(bw / rt) + 'px' };
}
function renderLb() {
  const items = galItems(), item = items[lb];
  const stage = $('[data-lb-stage]', lbEl), box = lbBox(item);
  stage.style.width = box.w; stage.style.height = box.h;
  stage.innerHTML = slot({ src: item.photo, alt: item.alt || item.caption, placeholder: item.caption, fit: 'contain', lazy: false });
  $('[data-lb-pos]', lbEl).textContent = pad2(lb + 1);
  $('[data-lb-total]', lbEl).textContent = pad2(items.length);
  $('[data-lb-cat]', lbEl).textContent = GAL_CATS[item.category];
  $('[data-lb-cap]', lbEl).textContent = item.caption;
  const dots = $('[data-lb-dots]', lbEl);
  dots.innerHTML = items.map((g, i) => `<button type="button" class="lb__dot${i === lb ? ' is-on' : ''}" data-dot="${i}" aria-label="Show ${g.caption.replace(/"/g, '&quot;')}"><span></span></button>`).join('');
  $$('[data-dot]', dots).forEach((d) => d.addEventListener('click', () => { const i = +d.dataset.dot; lbDir = i > (lb || 0) ? 1 : -1; setLb(i); }));
}
function setLb(i) {
  const opened = lb == null && i != null, closed = i == null && lb != null;
  lb = i;
  document.documentElement.style.overflow = lb != null || menu.isOpen() ? 'hidden' : '';
  if (closed) { lbEl.hidden = true; if (lbReturn && lbReturn.focus) lbReturn.focus({ preventScroll: true }); return; }
  renderLb();
  if (opened) { lbEl.hidden = false; $('[data-lb-close]', lbEl).focus({ preventScroll: true }); }
  animateLb(lbEl, opened, lbDir);
}
function openLb(i) { lbReturn = document.activeElement; lbDir = 1; setLb(i); }
const closeLb = () => setLb(null);
function lbGo(d) { const n = galItems().length; if (!n) return; lbDir = d; setLb(((lb == null ? 0 : lb) + d + n) % n); }

$('[data-lb-close]', lbEl).addEventListener('click', closeLb);
$('[data-lb-prev]', lbEl).addEventListener('click', () => lbGo(-1));
$('[data-lb-next]', lbEl).addEventListener('click', () => lbGo(1));
lbEl.addEventListener('click', (e) => { if (e.target.hasAttribute('data-lb') || e.target.hasAttribute('data-lb-mid')) closeLb(); });
let tx = 0;
lbEl.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
lbEl.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) lbGo(dx < 0 ? 1 : -1); });
document.addEventListener('keydown', (e) => {
  if (lb == null) return;
  if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); lbGo(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); lbGo(-1); }
  else if (e.key === 'Tab') {
    const els = $$('button', lbEl); if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!lbEl.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }
});

// ---------- Sponsorship enquiry form ----------
const form = $('[data-enquiry]');
const formData = {};
const interestSel = $('select[name="interest"]', form);
function setFieldError(name, msg) {
  const f = $(`[data-field="${name}"]`, form); if (!f) return;
  f.classList.toggle('is-error', !!msg);
  const m = $('.field__msg', f); m.textContent = msg || ''; m.hidden = !msg;
}
$$('input, textarea, select', form).forEach((el) => el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => {
  formData[el.name] = el.value;
  setFieldError(el.name, '');
}));
$$('[data-choose]').forEach((b) => b.addEventListener('click', () => {
  interestSel.value = b.dataset.choose; formData.interest = b.dataset.choose;
  go('enquiry');
}));

const toastWrap = $('[data-toast]');
let toastTimer;
function showToast() {
  toastWrap.innerHTML = toast({ title: 'Enquiry sent', message: 'Our sponsorship lead will reply within 48 hours.' });
  toastWrap.hidden = false;
  $('.toast__close', toastWrap).addEventListener('click', hideToast);
  clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, 5000);
}
function hideToast() { toastWrap.hidden = true; toastWrap.innerHTML = ''; }

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = formData, errors = {};
  if (!(d.name || '').trim()) errors.name = 'Tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) errors.email = 'Enter a valid email.';
  if (!(d.message || '').trim()) errors.message = 'Add a short message.';
  ['name', 'email', 'message'].forEach((k) => setFieldError(k, errors[k]));
  if (Object.keys(errors).length) return;
  // BACKEND: save the enquiry to Supabase here, once the frontend is done. [TODO]
  const label = $('[data-submit] .btn__label', form);
  label.textContent = 'Sending…';
  setTimeout(() => { label.textContent = 'Send enquiry'; showToast(); }, 700);
});

// ---------- Hero image fallback ----------
const heroImg = $('[data-hero-main]');
if (heroImg) heroImg.addEventListener('error', () => { heroImg.style.visibility = 'hidden'; });

// ---------- Resize ----------
addEventListener('resize', () => {
  const n = galColCount(innerWidth);
  if (n !== galCols) { galCols = n; renderGallery(); }
  if (lb != null) renderLb();
});

// ---------- Start ----------
// The build renders 3 gallery columns; re-lay them out for this screen before the motion loop starts.
if (galCols !== 3) renderGallery({ refresh: false }); else bindGalleryCards();
motion = initHomeMotion(root, { onActive: setActive });

// Reveal the page once fonts and the hero image are ready (loader covers it until then).
let shown = false;
function show() {
  if (shown) return; shown = true;
  const ld = $('[data-loader]');
  motion.intro(ld);
  motion.refresh();
  const id = decodeURIComponent((location.hash || '').slice(1));
  if (id && document.getElementById(id)) setTimeout(() => go(id, true), 60);
}
const imgReady = !heroImg ? Promise.resolve() : heroImg.decode ? heroImg.decode().catch(() => {}) : new Promise((res) => { heroImg.onload = heroImg.onerror = res; });
Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), imgReady]).then(() => requestAnimationFrame(show));
setTimeout(show, 3000);
