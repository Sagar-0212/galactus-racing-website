// Builds an edit form from a collection's field list (src/admin/schema.js).
// Keeps a working copy (draft) of the item; nothing is saved until the panel's Save button.
import { COLLECTIONS, getPath, setPath, hasTodo } from './schema.js';
import { esc, el, $, $$, fmtBytes, announce } from './ui.js';
import { prepareImage } from './image.js';
import * as api from './api.js';

const fid = (path) => 'f-' + String(path).replace(/[^\w]/g, '-');
const badge = '<span class="badge badge--todo">Needs info</span>';

export function buildForm({ coll, item, isNew, onBusy = () => {} }) {
  const def = COLLECTIONS[coll];
  const draft = structuredClone(item);
  const initial = JSON.stringify(draft);
  const uploads = new Map(); // path -> {width, height, bytes, originalBytes}
  let busy = 0;
  let errors = {};
  const form = el('<form class="form" novalidate></form>');

  // ---------- rendering ----------
  function needsInfo(f, v) { return f.type === 'confirm' ? v === true : hasTodo(v); }

  function labelHtml(f, path, v, { as = 'label' } = {}) {
    const req = f.required || (f.requiredNew && isNew);
    const attr = as === 'label' ? `for="${fid(path)}"` : `id="${fid(path)}-label"`;
    return `<${as} class="field__label" ${attr}>${esc(f.label)}${req ? ' <span class="field__req">Required</span>' : ''}<span class="field__badge">${needsInfo(f, v) ? badge : ''}</span></${as}>`;
  }
  const helpHtml = (f, path, show = true) => (f.help && show ? `<p class="field__help" id="${fid(path)}-help">${esc(f.help)}</p>` : '');
  const errHtml = (path) => `<p class="field__error" id="${fid(path)}-err" ${errors[path] ? '' : 'hidden'}>${esc(errors[path] || '')}</p>`;
  const described = (f, path, show = true) => [f.help && show ? `${fid(path)}-help` : '', `${fid(path)}-err`, `${fid(path)}-todo`].filter(Boolean).join(' ');
  const todoHint = (path, v) => `<p class="field__todo" id="${fid(path)}-todo" ${hasTodo(v) ? '' : 'hidden'}>Check this fact, fix it if needed, then <button type="button" class="linkbtn" data-act="todo-clear" data-path="${esc(path)}">mark it as correct</button> (removes “[TODO]”).</p>`;

  function field(f, obj, path, showHelp = true) {
    if (f.showIf && !f.showIf(obj)) return '';
    const v = getPath(obj, f.k);
    const inv = errors[path] ? ' aria-invalid="true"' : '';
    const common = `id="${fid(path)}" data-path="${esc(path)}" aria-describedby="${described(f, path, showHelp)}"${inv}${f.required ? ' aria-required="true"' : ''}`;
    const wrap = (inner, cls = '') => `<div class="field ${cls}" data-field="${esc(path)}">${inner}${errHtml(path)}</div>`;
    switch (f.type) {
      case 'textarea':
        return wrap(labelHtml(f, path, v) + helpHtml(f, path, showHelp) + `<textarea ${common} rows="3">${esc(v)}</textarea>` + todoHint(path, v));
      case 'number':
        return wrap(labelHtml(f, path, v) + helpHtml(f, path, showHelp) + `<input type="number" inputmode="decimal" step="${f.step || 1}" ${common} value="${v ?? ''}">`, 'field--short');
      case 'select':
        return wrap(labelHtml(f, path, v) + helpHtml(f, path, showHelp) + `<select ${common}>${f.options.map(([val, lab]) => `<option value="${esc(val)}"${String(v ?? '') === val ? ' selected' : ''}>${esc(lab)}</option>`).join('')}</select>`);
      case 'checkbox':
        return wrap(`<label class="check"><input type="checkbox" ${common}${v ? ' checked' : ''}><span>${esc(f.label)}</span></label>` + helpHtml(f, path, showHelp), 'field--check');
      case 'confirm':
        return wrap(`<label class="check"><input type="checkbox" data-confirm="1" ${common}${v === true ? '' : ' checked'}><span>${esc(f.label)}</span><span class="field__badge">${v === true ? badge : ''}</span></label>` + `<p class="field__help" id="${fid(path)}-help">Tick this once the team has confirmed the facts above. Until then the website shows a small “[TODO]”.</p>`, 'field--check');
      case 'tags': {
        const arr = Array.isArray(v) ? v : [];
        return `<fieldset class="field field--tags" data-field="${esc(path)}"><legend class="field__label">${esc(f.label)}</legend>${helpHtml(f, path)}
          <ul class="tags">${arr.map((s, i) => `<li class="tags__row" data-field="${esc(path + '.' + i)}">
            <label class="sr-only" for="${fid(path + '.' + i)}">${esc(f.label)} ${i + 1}</label>
            <input type="text" id="${fid(path + '.' + i)}" data-path="${esc(path + '.' + i)}" value="${esc(s)}" aria-describedby="${fid(path + '.' + i)}-todo">
            <button type="button" class="btn btn--ghost btn--sq" data-act="tag-del" data-list="${esc(path)}" data-i="${i}" aria-label="Remove “${esc(s || 'empty')}”">✕</button>
            ${todoHint(path + '.' + i, s)}</li>`).join('')}</ul>
          <button type="button" class="btn btn--ghost" data-act="tag-add" data-list="${esc(path)}">+ ${esc(f.add || 'Add')}</button>${errHtml(path)}</fieldset>`;
      }
      case 'list': {
        const arr = Array.isArray(v) ? v : [];
        return `<fieldset class="field field--list" data-field="${esc(path)}"><legend class="field__label">${esc(f.label)}</legend>
          <ol class="sublist">${arr.map((row, i) => {
            const rp = `${path}.${i}`, name = f.itemLabel ? f.itemLabel(row, i) : `Item ${i + 1}`;
            return `<li class="sublist__row"><fieldset><legend class="sublist__legend">${esc(name || `Item ${i + 1}`)}</legend>
              <div class="sublist__grid">${f.fields.map((sf) => field(sf, row, `${rp}.${sf.k}`, i === 0)).join('')}</div>
              ${f.fixed ? '' : `<div class="sublist__actions">
                <button type="button" class="btn btn--ghost btn--sm" data-act="list-up" data-list="${esc(path)}" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move ${esc(name)} up">↑ Up</button>
                <button type="button" class="btn btn--ghost btn--sm" data-act="list-down" data-list="${esc(path)}" data-i="${i}" ${i === arr.length - 1 ? 'disabled' : ''} aria-label="Move ${esc(name)} down">↓ Down</button>
                <button type="button" class="btn btn--ghost btn--sm btn--danger-text" data-act="list-del" data-list="${esc(path)}" data-i="${i}" aria-label="Remove ${esc(name)}">✕ Remove</button></div>`}
            </fieldset></li>`;
          }).join('')}</ol>
          ${f.fixed ? '' : `<button type="button" class="btn btn--ghost" data-act="list-add" data-list="${esc(path)}">+ ${esc(f.add || 'Add')}</button>`}</fieldset>`;
      }
      case 'image': {
        const up = uploads.get(path);
        const alt = f.alt ? getPath(obj, f.alt) : '';
        const req = f.required || (f.requiredNew && isNew);
        const altF = { k: f.alt, label: 'Describe this photo', required: true, help: 'For people who can’t see it, and for Google. Example: Rahul welding the roll cage in the workshop' };
        return `<div class="field field--image" data-field="${esc(path)}">
          <span class="field__label" id="${fid(path)}-label">${esc(f.label)}${req ? ' <span class="field__req">Required</span>' : ''}</span>
          ${helpHtml(f, path)}
          <div class="drop${v ? ' has-img' : ''}" data-drop="${esc(path)}" data-alt="${esc(f.alt || '')}">
            ${v ? `<img class="drop__img" src="${esc(v)}" alt="">
              <p class="drop__meta">${up ? `${up.width} × ${up.height} px · ${fmtBytes(up.bytes)} WebP <span class="muted">(was ${fmtBytes(up.originalBytes)})</span>` : 'Current photo'}</p>
              <div class="drop__actions">
                <button type="button" class="btn btn--ghost" data-act="img-choose" data-path="${esc(path)}" id="${fid(path)}" aria-describedby="${fid(path)}-label">Replace photo</button>
                <button type="button" class="btn btn--ghost btn--danger-text" data-act="img-remove" data-path="${esc(path)}">Remove photo</button>
              </div>`
            : `<p class="drop__hint">Drag a photo here, or</p>
              <button type="button" class="btn btn--primary" data-act="img-choose" data-path="${esc(path)}" id="${fid(path)}" aria-describedby="${fid(path)}-label ${fid(path)}-err">Choose photo</button>
              <p class="drop__small">JPG, PNG or WebP. Large photos are shrunk automatically.</p>`}
            <p class="drop__status" role="status" aria-live="polite"></p>
            <input type="file" accept="image/*" class="sr-only" tabindex="-1" aria-hidden="true" data-file="${esc(path)}">
          </div>${errHtml(path)}</div>
          ${v && f.alt ? field({ ...altF }, obj, f.alt) : ''}`;
      }
      default: {
        const t = f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : 'text';
        const extra = t === 'email' ? ' autocomplete="email" inputmode="email"' : t === 'url' ? ' inputmode="url" placeholder="https://"' : '';
        return wrap(labelHtml(f, path, v) + helpHtml(f, path, showHelp) + `<input type="${t}" ${common} value="${esc(v)}"${extra}>` + todoHint(path, v));
      }
    }
  }

  function render() {
    const active = document.activeElement && form.contains(document.activeElement) ? document.activeElement.id : null;
    const n = Object.keys(errors).length;
    form.innerHTML = `<div class="form__summary" role="alert" ${n ? '' : 'hidden'}>${n ? `Fix ${n === 1 ? 'one thing' : n + ' things'} before saving. Look for the red messages below.` : ''}</div>`
      + `<p class="form__legend"><span class="field__req">Required</span> fields must be filled in.</p>`
      + def.fields.map((f) => field(f, draft, f.k)).join('');
    if (active) { const a = document.getElementById(active); if (a) a.focus(); }
  }

  // ---------- events ----------
  function coerce(input) {
    if (input.type === 'checkbox') return input.dataset.confirm ? !input.checked : input.checked; // confirm boxes store todo = !checked
    if (input.type === 'number') return input.value === '' ? null : Number(input.value);
    return input.value;
  }
  function refreshField(input) {
    const path = input.dataset.path, v = getPath(draft, path);
    const wrap = input.closest('[data-field]');
    const b = wrap && wrap.querySelector('.field__badge');
    const isConfirm = !!input.dataset.confirm;
    if (b) b.innerHTML = (isConfirm ? v === true : hasTodo(v)) ? badge : '';
    const hint = document.getElementById(fid(path) + '-todo');
    if (hint) hint.hidden = !hasTodo(v);
    if (errors[path]) {
      delete errors[path];
      input.removeAttribute('aria-invalid');
      const e = document.getElementById(fid(path) + '-err');
      if (e) e.hidden = true;
    }
  }
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.dataset.path) return;
    setPath(draft, t.dataset.path, coerce(t));
    refreshField(t);
  });
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.file) return handleFile(t.dataset.file, t.files[0], t);
    if (t.dataset.path) {
      setPath(draft, t.dataset.path, coerce(t));
      if (t.tagName === 'SELECT' || t.type === 'checkbox') render(); // fields shown depend on type choices
    }
  });
  form.addEventListener('submit', (e) => e.preventDefault());

  const arrAt = (p) => { let a = getPath(draft, p); if (!Array.isArray(a)) { a = []; setPath(draft, p, a); } return a; };
  function listDef(p) {
    const top = def.fields.find((f) => f.k === p.split('.')[0]);
    return top;
  }
  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act, p = b.dataset.list, i = Number(b.dataset.i);
    if (act === 'tag-add' || act === 'list-add') {
      const a = arrAt(p);
      if (act === 'tag-add') a.push('');
      else a.push(Object.fromEntries(listDef(p).fields.filter((f) => !f.k.includes('.')).map((f) => [f.k, ''])));
      render();
      const last = act === 'tag-add' ? `${p}.${a.length - 1}` : `${p}.${a.length - 1}.${listDef(p).fields[0].k}`;
      document.getElementById(fid(last))?.focus();
    } else if (act === 'tag-del' || act === 'list-del') {
      arrAt(p).splice(i, 1);
      render();
      announce('Removed.');
      (form.querySelector(`[data-list="${CSS.escape(p)}"][data-act$="add"]`) || form.querySelector('input, textarea, select'))?.focus();
    } else if (act === 'list-up' || act === 'list-down') {
      const a = arrAt(p), j = act === 'list-up' ? i - 1 : i + 1;
      if (j < 0 || j >= a.length) return;
      [a[i], a[j]] = [a[j], a[i]];
      render();
      const btn = form.querySelector(`[data-act="${act}"][data-list="${CSS.escape(p)}"][data-i="${j}"]`);
      (btn && !btn.disabled ? btn : form.querySelector(`[data-list="${CSS.escape(p)}"][data-i="${j}"]`))?.focus();
      announce(`Moved to position ${j + 1} of ${a.length}.`);
    } else if (act === 'todo-clear') {
      const path = b.dataset.path, v = String(getPath(draft, path) || '');
      const clean = v.replace(/\s*\[TODO\]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
      setPath(draft, path, clean);
      const input = form.querySelector(`[data-path="${CSS.escape(path)}"]:not(button)`);
      if (input) { input.value = clean; refreshField(input); input.focus(); }
      announce('Marked as correct. Remember to save.');
    } else if (act === 'img-choose') {
      form.querySelector(`[data-file="${CSS.escape(b.dataset.path)}"]`).click();
    } else if (act === 'img-remove') {
      setPath(draft, b.dataset.path, '');
      uploads.delete(b.dataset.path);
      render();
      document.getElementById(fid(b.dataset.path))?.focus();
      announce('Photo removed. Remember to save.');
    }
  });

  // Drag and drop a photo onto the drop zone.
  form.addEventListener('dragover', (e) => {
    const z = e.target.closest('[data-drop]');
    if (!z) return;
    e.preventDefault();
    z.classList.add('is-over');
  });
  form.addEventListener('dragleave', (e) => { const z = e.target.closest('[data-drop]'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over'); });
  form.addEventListener('drop', (e) => {
    const z = e.target.closest('[data-drop]');
    if (!z) return;
    e.preventDefault();
    z.classList.remove('is-over');
    handleFile(z.dataset.drop, e.dataTransfer.files[0]);
  });

  async function handleFile(path, file, input) {
    if (!file) return;
    const zone = form.querySelector(`[data-drop="${CSS.escape(path)}"]`);
    const status = zone.querySelector('.drop__status');
    const setErr = (msg) => { errors[path] = msg; render(); };
    busy++; onBusy(true);
    zone.classList.add('is-busy');
    status.textContent = 'Preparing photo…';
    try {
      const img = await prepareImage(file);
      status.textContent = 'Uploading…';
      const { url } = await api.uploadImage(img.blob, { name: img.name });
      setPath(draft, path, url);
      uploads.set(path, img);
      delete errors[path];
      render();
      const s = form.querySelector(`[data-drop="${CSS.escape(path)}"] .drop__status`);
      if (s) s.textContent = `Photo ready: ${img.width} × ${img.height} pixels, ${fmtBytes(img.bytes)}. Now describe it below.`;
      const altInput = zone.dataset.alt && document.getElementById(fid(zone.dataset.alt));
      (altInput || document.getElementById(fid(path)))?.focus();
    } catch (err) {
      setErr(err.message);
      document.getElementById(fid(path))?.focus();
    } finally {
      busy--; onBusy(busy > 0);
      if (input) input.value = '';
    }
  }

  // ---------- public ----------
  function showErrors(errs) {
    errors = errs;
    render();
    const first = Object.keys(errs)[0];
    if (first) focusPath(first, false);
    return !first;
  }
  function focusPath(path, highlight = true) {
    let target = document.getElementById(fid(path));
    if (!target) target = form.querySelector(`[data-field="${CSS.escape(path)}"] input, [data-field="${CSS.escape(path)}"] textarea, [data-field="${CSS.escape(path)}"] select, [data-field="${CSS.escape(path)}"] button`);
    if (!target) return false;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'center' });
    if (highlight) {
      const wrap = target.closest('[data-field]');
      if (wrap) { wrap.classList.add('is-target'); setTimeout(() => wrap.classList.remove('is-target'), 2400); }
    }
    return true;
  }

  render();
  return {
    el: form,
    get value() { return structuredClone(draft); },
    isDirty: () => JSON.stringify(draft) !== initial,
    isBusy: () => busy > 0,
    showErrors,
    focusPath,
    firstInput: () => form.querySelector('input:not([type=file]), textarea, select, button[data-act="img-choose"]'),
  };
}
export { $, $$ };
