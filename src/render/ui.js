// MTVNA design-system components as plain HTML strings.
// Ported 1:1 from the React components in _ds/.../_ds_bundle.js (no React at runtime).
// Used at build time (vite.config.js) and at runtime (gallery, lightbox, form).

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Escape text and turn every "[TODO]" into a visible marker (unverified facts).
export const t = (s) => esc(s).replace(/\[TODO\]/g, '<span class="todo">[TODO]</span>');
export const todo = (on) => (on ? ' <span class="todo">[TODO]</span>' : '');

export const attrs = (o = {}) =>
  Object.entries(o)
    .filter(([, v]) => v != null && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
    .join('');

export const pad2 = (n) => String(n).padStart(2, '0');
export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

// `html` lets a caller pass pre-built inner markup instead of a plain label.
export function button({ label, html, variant = 'primary', size = 'md', iconRight, type = 'button', cls = '', attr = {} }) {
  const icon = iconRight ? `<span class="btn__icon" aria-hidden="true">${iconRight}</span>` : '';
  return `<button${attrs({ type, class: `btn btn--${variant} btn--${size}${cls ? ' ' + cls : ''}`, ...attr })}>${html ?? `<span class="btn__label">${t(label)}</span>`}${icon}</button>`;
}

export function iconButton({ icon, label, variant = 'outline', size = 44, attr = {} }) {
  return `<button${attrs({ type: 'button', class: `ibtn ibtn--${variant} ibtn--${size}`, 'aria-label': label, title: label, ...attr })}>${icon}</button>`;
}

export function headline({ as = 'h1', size = 'l', text, accent, inverse = false, cls = '' }) {
  const parts = accent ? text.split(accent) : [text];
  const inner = parts.map(esc).join(`<span class="hl__accent">${esc(accent)}</span>`);
  return `<${as} class="hl hl--${size}${inverse ? ' hl--inverse' : ''}${cls ? ' ' + cls : ''}">${inner}</${as}>`;
}

export function wordmark({ name = 'MTVNA', tagline, rule = true, inverse = false }) {
  return `<div class="wm${inverse ? ' wm--inverse' : ''}"><div class="wm__row"><span class="wm__name">${esc(name)}<sup>®</sup></span>${rule ? '<span class="wm__rule"></span>' : ''}</div>${tagline ? `<div class="wm__tag">${esc(tagline)}</div>` : ''}</div>`;
}

export function card({ eyebrow, title, body = '', tone = 'paper', interactive = false, cls = '' }) {
  return `<article class="card card--${tone}${interactive ? ' card--interactive' : ''}${cls ? ' ' + cls : ''}"><div class="card__body">${eyebrow ? `<span class="card__eyebrow">${t(eyebrow)}</span>` : ''}${title ? `<h3 class="card__title">${t(title)}</h3>` : ''}${body ? `<div class="card__text">${body}</div>` : ''}</div></article>`;
}

export const tag = (label) => `<span class="tag">${t(label)}</span>`;

export function tabs({ items, value, inverse = false, attr = {} }) {
  const tabsHtml = items
    .map((it) => {
      const on = it.value === value;
      const count = it.count != null ? `<sup class="tabs__count">${it.count}</sup>` : '';
      return `<button role="tab" class="tabs__tab" aria-selected="${on}" data-value="${esc(it.value)}">${esc(it.label)}${count}<span class="tabs__bar"></span></button>`;
    })
    .join('');
  return `<div${attrs({ role: 'tablist', class: `tabs${inverse ? ' tabs--inverse' : ''}`, ...attr })}>${tabsHtml}</div>`;
}

export function input({ label, name, type = 'text', multiline = false, attr = {} }) {
  const field = multiline
    ? `<textarea${attrs({ class: 'field__input field__input--multi', name, rows: 4, ...attr })}></textarea>`
    : `<input${attrs({ class: 'field__input', type, name, ...attr })}>`;
  return `<label class="field" data-field="${esc(name)}"><span class="field__label">${esc(label)}</span>${field}<span class="field__msg" hidden></span></label>`;
}

export function select({ label, name, options = [], placeholder, attr = {} }) {
  const opts = (placeholder ? `<option value="" disabled selected>${esc(placeholder)}</option>` : '') + options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  return `<label class="field"><span class="field__label">${esc(label)}</span><span class="field__select"><select${attrs({ class: 'field__input field__input--select', name, ...attr })}>${opts}</select><span class="field__arrow" aria-hidden="true">↓</span></span></label>`;
}

export function toast({ title, message }) {
  return `<div class="toast" role="status"><span class="toast__dot" aria-hidden="true"></span><div class="toast__text"><span class="toast__title">${esc(title)}</span><span class="toast__msg">${esc(message)}</span></div><button type="button" class="toast__close" aria-label="Dismiss">✕</button></div>`;
}

// Replacement for Claude Design's <image-slot>: shows the photo if we have one,
// otherwise the same dashed placeholder with its caption.
const SLOT_ICON =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
export function slot({ src, alt = '', placeholder = 'Photo', fit = 'cover', lazy = true }) {
  if (src) {
    return `<div class="slot slot--filled"><img class="slot__img slot__img--${fit}" src="${esc(src)}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async" draggable="false"></div>`;
  }
  return `<div class="slot"><div class="slot__empty">${SLOT_ICON}<div class="slot__cap">${esc(placeholder)}</div></div><div class="slot__ring"></div></div>`;
}
