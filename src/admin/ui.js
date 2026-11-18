// Small UI helpers: escaping, dialogs (native <dialog>, so focus is trapped), confirm, toasts.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// Close right away. (No exit animation: a modal dialog that is still fading out keeps the whole page
// inert, so a quick click straight after Save / Delete would be lost. Dialogs only animate in.)
export function closeDialog(dlg) {
  if (dlg.open) dlg.close();
  return Promise.resolve();
}

// Confirm dialog. Focus starts on the safe button. Resolves true / false.
export function confirmDialog({ title, body = '', ok = 'Delete', cancel = 'Cancel', danger = true }) {
  return new Promise((resolve) => {
    const dlg = el(`<dialog class="dlg" role="alertdialog" aria-labelledby="dlg-t" aria-describedby="dlg-b">
      <h2 class="dlg__title" id="dlg-t">${esc(title)}</h2>
      <p class="dlg__body" id="dlg-b">${esc(body)}</p>
      <div class="dlg__actions">
        <button type="button" class="btn btn--ghost" data-v="0">${esc(cancel)}</button>
        <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-v="1">${esc(ok)}</button>
      </div></dialog>`);
    document.body.append(dlg);
    let result = false;
    dlg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (b) { result = b.dataset.v === '1'; closeDialog(dlg); }
    });
    dlg.addEventListener('close', () => { dlg.remove(); resolve(result); });
    dlg.showModal();
    dlg.querySelector('[data-v="0"]').focus();
  });
}

// Toasts: one live region, announced politely. `action` = {label, run} (e.g. Undo).
let undoAction = null;
// The toast list lives in the top-most open dialog (if any), so a modal dialog doesn't cover it.
function toastBox() {
  let box = document.getElementById('toasts');
  if (!box || !box.isConnected) box = el('<div id="toasts" class="toasts" aria-live="polite"></div>');
  const host = [...document.querySelectorAll('dialog[open]')].pop() || document.body;
  if (box.parentElement !== host) host.append(box);
  return box;
}
export function toast(msg, { action, ms = 3000 } = {}) {
  const box = toastBox();
  const t = el(`<div class="toast"><span class="toast__msg">${esc(msg)}</span></div>`);
  let timer;
  const close = () => {
    clearTimeout(timer);
    if (undoAction && undoAction.toast === t) undoAction = null;
    t.classList.add('is-leaving');
    setTimeout(() => t.remove(), reducedMotion() ? 0 : 200);
  };
  const start = () => { clearTimeout(timer); timer = setTimeout(close, ms); };
  if (action) {
    const b = el(`<button type="button" class="toast__btn">${esc(action.label)}</button>`);
    b.addEventListener('click', () => { close(); action.run(); });
    t.append(b);
    undoAction = { toast: t, run: () => { close(); action.run(); } };
    // Keep it while the pointer or keyboard focus is on it.
    b.addEventListener('mouseenter', () => clearTimeout(timer));
    b.addEventListener('mouseleave', start);
    t.addEventListener('focusin', () => clearTimeout(timer));
    t.addEventListener('focusout', start);
  }
  box.append(t);
  start();
  return close;
}
// Ctrl+Z / Cmd+Z runs the visible Undo (keyboard users can't always reach the toast in 5 seconds).
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && undoAction && !e.target.closest('input, textarea')) {
    e.preventDefault();
    undoAction.run();
  }
});

export function announce(msg) {
  const r = document.getElementById('announcer');
  r.textContent = '';
  setTimeout(() => { r.textContent = msg; }, 30);
}

export const fmtBytes = (n) => (n < 1024 ? n + ' B' : n < 1048576 ? Math.round(n / 1024) + ' KB' : (n / 1048576).toFixed(1) + ' MB');
export function fmtDate(iso) {
  const d = new Date(iso), diff = (Date.now() - d) / 1000;
  if (diff < 3600) return Math.max(1, Math.round(diff / 60)) + ' min ago';
  if (diff < 86400) return Math.round(diff / 3600) + ' h ago';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Focus trap for every open dialog: Tab / Shift+Tab cycle inside the top-most one.
// (Native modal dialogs let Tab leave for the browser's address bar after the last button.)
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const dlg = [...document.querySelectorAll('dialog[open]')].pop();
  if (!dlg) return;
  const items = [...dlg.querySelectorAll(FOCUSABLE)].filter((x) => x.getClientRects().length && !x.closest('[hidden]'));
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1], a = document.activeElement;
  if (!dlg.contains(a)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
  else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
});
