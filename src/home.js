// Home page entry. Markup is rendered at build time (src/render/home.js); this file wires up behaviour.
import './styles/base.css';
import './styles/components.css';
import './styles/home.css';
import galleryData from './data/gallery.json';
import carsData from './data/cars.json';
import { initHomeMotion, scrollToEl, bindCard, animateLb, animateSheet, flipGallery, slideMsg, toastIn, toastOut, loadFlip } from './motion/index.js';
import { initMenu } from './ui/menu.js';
import { initMaps } from './ui/map.js';
import { submitEnquiry } from './api/enquiries.js';
import { galleryGrid, galColCount, GAL_CATS, specTable } from './render/home.js';
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
let sheetOpen = false; // spec panel open
const menu = initMenu({ isOtherOverlayOpen: () => lb != null || sheetOpen });

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
  // data-open = index in the full list; the lightbox walks the filtered list.
  $$('[data-open]', galGrid).forEach((b) => b.addEventListener('click', () => openLb(galItems().indexOf(galleryData[+b.dataset.open]))));
}
function renderGallery({ refresh = true } = {}) {
  galGrid.style.setProperty('--cols', galCols);
  galGrid.innerHTML = galleryGrid(galleryData, galCols, galFilter);
  bindGalleryCards();
  if (refresh && motion) motion.refreshGallery(galGrid);
}
// Filter: move the existing figures (same nodes, so Flip can animate them) into their new columns.
function layoutGallery() {
  const byId = new Map($$('[data-flip-id]', galGrid).map((f) => [f.dataset.flipId, f]));
  const cols = $$('.gal__col', galGrid), vis = galItems();
  vis.forEach((g, k) => { const f = byId.get(g.id); f.hidden = false; cols[k % cols.length].appendChild(f); });
  galleryData.filter((g) => !vis.includes(g)).forEach((g) => { const f = byId.get(g.id); f.hidden = true; cols[0].appendChild(f); });
}
const galTabs = $('[data-gal-tabs]');
// Tab pattern keys: arrows / Home / End move to a filter and apply it (one Tab stop for the row).
if (galTabs) galTabs.addEventListener('keydown', (e) => {
  const list = $$('[role="tab"]', galTabs), i = list.indexOf(document.activeElement); if (i < 0) return;
  const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[e.key]; if (j == null) return;
  e.preventDefault();
  const t = list[(j + list.length) % list.length]; t.focus(); t.click();
});
if (galTabs) ['pointerover', 'focusin', 'touchstart'].forEach((ev) => galTabs.addEventListener(ev, () => loadFlip(), { once: true, passive: true }));
$$('[data-gal-tabs] [role="tab"]').forEach((tab) => tab.addEventListener('click', () => {
  if (tab.dataset.value === galFilter) return;
  galFilter = tab.dataset.value;
  $$('[data-gal-tabs] [role="tab"]').forEach((t) => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
  flipGallery(galGrid, layoutGallery);
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

// ---------- Cars: spec panel + compare toggle ----------
// Any [data-specs="<car id>"] button opens the panel; [data-compare] opens it already comparing.
// Compare = the current car (Abhimanyu) next to the previous car, current car first.
const sheetEl = $('[data-sheet]');
const curCar = carsData.find((c) => c.current) || carsData[0];
const prevCar = carsData.find((c) => c !== curCar);
const shortName = (c) => c.name.replace(' [TODO]', '');
let sheetCar = null, sheetCmp = false, sheetReturn = null;
function renderSheet() {
  const other = sheetCar === curCar ? prevCar : curCar;
  $('[data-sheet-title]', sheetEl).innerHTML = sheetCmp && other
    ? specTitle(curCar) + ' <span class="sheet__vs">vs</span> ' + specTitle(sheetCar === curCar ? prevCar : sheetCar)
    : specTitle(sheetCar);
  const tog = $('[data-sheet-cmp]', sheetEl);
  tog.hidden = !other;
  tog.setAttribute('aria-checked', String(sheetCmp));
  $('[data-sheet-cmp-label]', sheetEl).textContent = 'Compare with ' + (other ? shortName(other) : '');
  const a = sheetCmp && other ? curCar : sheetCar, b = sheetCmp && other ? (sheetCar === curCar ? prevCar : sheetCar) : null;
  $('[data-sheet-body]', sheetEl).innerHTML = specTable(a, b);
}
function specTitle(c) { return c.name.replace(/\[TODO\]/g, '<span class="todo">[TODO]</span>'); }
function openSheet(id, cmp) {
  sheetCar = carsData.find((c) => c.id === id) || curCar; sheetCmp = !!cmp;
  sheetReturn = document.activeElement;
  renderSheet();
  sheetOpen = true; sheetEl.hidden = false;
  document.documentElement.style.overflow = 'hidden';
  if (motion && motion.lenis) motion.lenis.stop();
  animateSheet(sheetEl, true);
  $('.sheet__close', sheetEl).focus({ preventScroll: true });
}
function closeSheet() {
  if (!sheetOpen) return;
  sheetOpen = false;
  animateSheet(sheetEl, false, () => {
    sheetEl.hidden = true;
    document.documentElement.style.overflow = menu.isOpen() || lb != null ? 'hidden' : '';
    if (motion && motion.lenis) motion.lenis.start();
    if (sheetReturn && sheetReturn.focus) sheetReturn.focus({ preventScroll: true });
  });
}
$$('[data-specs]').forEach((b) => b.addEventListener('click', () => openSheet(b.dataset.specs, b.hasAttribute('data-compare'))));
$$('[data-sheet-close]', sheetEl).forEach((b) => b.addEventListener('click', closeSheet));
$('[data-sheet-cmp]', sheetEl).addEventListener('click', () => { sheetCmp = !sheetCmp; renderSheet(); });
document.addEventListener('keydown', (e) => {
  if (!sheetOpen) return;
  if (e.key === 'Escape') { e.preventDefault(); closeSheet(); }
  else if (e.key === 'Tab') {
    const els = $$('button:not([hidden])', sheetEl); if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!sheetEl.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }
});

// ---------- Sponsorship enquiry form ----------
const form = $('[data-enquiry]');
const formData = {};
const interestSel = $('select[name="interest"]', form);
// The message slides in under the field when it first appears (not when its text just changes).
function setFieldError(name, msg) {
  const f = $(`[data-field="${name}"]`, form); if (!f) return;
  f.classList.toggle('is-error', !!msg);
  const el = $(`[name="${name}"]`, f); if (el) el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  const m = $('.field__msg', f), was = !m.hidden;
  m.textContent = msg || ''; m.hidden = !msg;
  if (msg && !was) slideMsg(m);
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
function showToast({ title, message }) {
  const fresh = toastWrap.hidden;
  toastWrap.innerHTML = toast({ title, message });
  toastWrap.hidden = false;
  $('.toast__close', toastWrap).addEventListener('click', hideToast);
  if (fresh) toastIn(toastWrap);
  clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, 5000);
}
function hideToast() {
  clearTimeout(toastTimer);
  if (toastWrap.hidden) return;
  toastOut(toastWrap, () => { toastWrap.hidden = true; toastWrap.innerHTML = ''; });
}

let sending = false;
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (sending) return;
  const d = formData, errors = {};
  if (!(d.name || '').trim()) errors.name = 'Tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) errors.email = 'Enter a valid email.';
  if (!(d.message || '').trim()) errors.message = 'Add a short message.';
  ['name', 'email', 'message'].forEach((k) => setFieldError(k, errors[k]));
  const bad = ['name', 'email', 'message'].find((k) => errors[k]);
  if (bad) { $(`[name="${bad}"]`, form).focus({ preventScroll: true }); return; }
  const btn = $('[data-submit]', form), label = $('.btn__label', btn);
  sending = true; btn.disabled = true; label.textContent = 'Sending…';
  try {
    await submitEnquiry(d); // simulated until Supabase is wired in (src/api/enquiries.js)
    form.reset(); Object.keys(formData).forEach((k) => delete formData[k]);
    showToast({ title: 'Enquiry sent', message: 'Our sponsorship lead will reply within 48 hours.' });
  } catch (err) {
    showToast({ title: 'Not sent', message: (err && err.message) || 'Something went wrong. Try again or email us.' });
  } finally {
    sending = false; btn.disabled = false; label.textContent = 'Send enquiry';
  }
});

// ---------- Contact: click the email to copy it ----------
// Falls back to the normal mailto: link when the clipboard API isn't available or is refused.
$$('[data-copy-email]').forEach((a) => a.addEventListener('click', (e) => {
  if (!navigator.clipboard || !window.isSecureContext) return;
  e.preventDefault();
  const email = a.dataset.copyEmail;
  navigator.clipboard.writeText(email).then(
    () => showToast({ title: 'Email copied', message: email }),
    () => { location.href = a.href; },
  );
}));
initMaps(root);

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
  // Section motion builds in small steps behind the start lights. The one start-up refresh runs inside
  // start(), after the layout steps (the car rail's height is set by one of them); jump to a #hash
  // once everything is built.
  motion.start(() => { layoutH = document.documentElement.scrollHeight; }).then(() => {
    const id = decodeURIComponent((location.hash || '').slice(1));
    if (id && document.getElementById(id)) go(id, true);
  });
}
let layoutH = 0;
const imgReady = !heroImg ? Promise.resolve() : heroImg.decode ? heroImg.decode().catch(() => {}) : new Promise((res) => { heroImg.onload = heroImg.onerror = res; });
Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), imgReady]).then(() => requestAnimationFrame(show));
setTimeout(show, 3000);
// Late layout changes (images that finish after show()) get one more refresh on window load.
addEventListener('load', () => { if (shown && layoutH && document.documentElement.scrollHeight !== layoutH) motion.refresh(); }, { once: true });
