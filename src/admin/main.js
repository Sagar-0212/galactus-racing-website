// Galactus Racing admin dashboard. Vanilla JS, hash routes (#/team, #/gallery …).
// All data goes through ./api.js (demo: localStorage; later Supabase). Screens never touch storage.
import '../styles/admin.css';
import * as api from './api.js';
import { COLLECTIONS, SCREENS, todoFields, validateItem } from './schema.js';
import { buildForm } from './form.js';
import { esc, el, $, $$, confirmDialog, closeDialog, toast, announce, fmtDate } from './ui.js';

const app = document.getElementById('app');
const FROM = { team: 'from the team', gallery: 'from the gallery', sponsors: 'from the sponsors', cars: 'from the cars', admins: 'from the admin users', journey: 'from the journey', packages: 'from the packages' };
const state = { screen: null, items: {}, query: '', enqFilter: 'All' };
let editor = null; // the open edit panel: {isDirty, forceClose}
let lastHash = location.hash;
let orderToast = null;

const badge = '<span class="badge badge--todo">Needs info</span>';
// Item names shown in lists, without the [TODO] marker (the Needs info badge says it instead).
const nameOf = (coll, x) => String(COLLECTIONS[coll].label(x) ?? '').replace(/\s*\[TODO\]/g, '').trim();
const banner = '<div class="demo" role="note"><strong>Demo mode:</strong> changes are saved only in this browser.</div>';
const ordered = (coll) => {
  const def = COLLECTIONS[coll], items = state.items[coll] || [];
  return def.sort ? [...items].sort(def.sort) : items;
};

// ====================================================================== login
function renderLogin(message = '') {
  document.title = 'Sign in · Galactus admin';
  app.innerHTML = `${banner}
  <main class="login" id="main">
    <div class="login__card">
      <img class="login__logo" src="/assets/logo-gr.webp" alt="" width="129" height="90">
      <h1 class="title">Admin sign in</h1>
      <p class="login__lead">For Galactus Racing team members. Sign in to update the website.</p>
      <form class="form" id="login" novalidate>
        <div class="form__summary" role="alert" ${message ? '' : 'hidden'}>${esc(message)}</div>
        <div class="field" data-field="email">
          <label class="field__label" for="l-email">Email</label>
          <input type="email" id="l-email" name="email" autocomplete="username" inputmode="email" required aria-describedby="l-email-err">
          <p class="field__error" id="l-email-err" hidden></p>
        </div>
        <div class="field" data-field="password">
          <label class="field__label" for="l-pass">Password</label>
          <input type="password" id="l-pass" name="password" autocomplete="current-password" required aria-describedby="l-pass-err">
          <p class="field__error" id="l-pass-err" hidden></p>
          <label class="check check--small"><input type="checkbox" id="l-show"><span>Show password</span></label>
        </div>
        <button type="submit" class="btn btn--primary btn--block">Sign in</button>
      </form>
      <p class="login__help">Forgot your password? Ask the team’s website lead to reset it.</p>
    </div>
  </main>`;
  const form = $('#login'), email = $('#l-email'), pass = $('#l-pass'), btn = $('button[type=submit]', form), summary = $('.form__summary', form);
  $('#l-show').addEventListener('change', (e) => { pass.type = e.target.checked ? 'text' : 'password'; });
  const setErr = (input, msg) => {
    const e = $('#' + input.id + '-err');
    e.textContent = msg; e.hidden = !msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  };
  [email, pass].forEach((i) => i.addEventListener('input', () => setErr(i, '')));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    summary.hidden = true;
    setErr(email, email.value.trim() ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? '' : 'That doesn’t look like an email. Example: name@example.com') : 'Enter your email.');
    setErr(pass, pass.value ? '' : 'Enter your password.');
    const bad = $('[aria-invalid="true"]', form);
    if (bad) return bad.focus();
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      await api.login(email.value, pass.value);
      if (!location.hash || location.hash === '#') history.replaceState(null, '', '#/home');
      renderShell();
      route({ focus: true });
    } catch (err) {
      summary.textContent = err.message; summary.hidden = false;
      btn.disabled = false; btn.textContent = 'Sign in';
      pass.select(); pass.focus();
    }
  });
  if (message) pass.focus(); else email.focus();
}

// ====================================================================== shell
function navHtml(id) {
  return `<ul class="nav__list">${SCREENS.map((s) => `<li><a class="nav__link" href="#/${s.id}" data-screen="${s.id}">${esc(s.title)}${s.id === 'enquiries' ? '<span class="nav__count" data-new-count hidden></span>' : ''}</a></li>`).join('')}</ul>
    <div class="nav__foot">
      <a class="nav__link nav__site" href="/" target="_blank" rel="noopener">View website ↗</a>
      <p class="nav__user">Signed in as<br><span>${esc((api.session() || {}).email || '')}</span></p>
      <button type="button" class="btn btn--ghost btn--block" data-act="logout" id="${id}-logout">Sign out</button>
    </div>`;
}
function renderShell() {
  app.innerHTML = `<a class="skip" href="#main">Skip to content</a>
  ${banner}
  <header class="topbar">
    <a class="brand" href="#/home"><img src="/assets/logo-gr.webp" alt="" width="129" height="90"><span>Galactus admin</span></a>
    <button type="button" class="btn btn--ghost" id="menu-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="drawer">Menu</button>
  </header>
  <div class="layout">
    <nav class="side" aria-label="Admin sections">
      <a class="brand" href="#/home"><img src="/assets/logo-gr.webp" alt="" width="129" height="90"><span>Galactus admin</span></a>
      ${navHtml('side')}
    </nav>
    <main class="main" id="main" tabindex="-1"></main>
  </div>
  <dialog class="drawer" id="drawer" aria-label="Menu">
    <div class="drawer__head"><span class="brand"><img src="/assets/logo-gr.webp" alt="" width="129" height="90"><span>Galactus admin</span></span>
      <button type="button" class="btn btn--ghost btn--sq" data-act="close-drawer" aria-label="Close menu">✕</button></div>
    <nav aria-label="Admin sections">${navHtml('drawer')}</nav>
  </dialog>`;
  const drawer = $('#drawer'), menuBtn = $('#menu-btn');
  menuBtn.addEventListener('click', () => { drawer.showModal(); menuBtn.setAttribute('aria-expanded', 'true'); $('.nav__link[aria-current]', drawer)?.focus(); });
  drawer.addEventListener('close', () => { menuBtn.setAttribute('aria-expanded', 'false'); });
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer || e.target.closest('[data-act="close-drawer"]') || e.target.closest('.nav__link')) closeDialog(drawer);
  });
  app.addEventListener('click', onAppClick);
  refreshNewCount();
}
async function refreshNewCount() {
  const n = (await api.enquiries.list()).filter((x) => x.status === 'New').length;
  $$('[data-new-count]').forEach((c) => { c.textContent = n; c.hidden = !n; c.setAttribute('aria-label', `${n} new`); });
}

function onAppClick(e) {
  if (e.target.closest('[data-act="logout"]')) {
    api.logout();
    app.removeEventListener('click', onAppClick);
    history.replaceState(null, '', '#/home');
    renderLogin();
    announce('Signed out.');
  }
}

// ====================================================================== routing
function parseHash() {
  const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const screen = SCREENS.find((s) => s.id === path) || SCREENS[0];
  return { screen, params: new URLSearchParams(qs || '') };
}
async function route({ focus = false } = {}) {
  if (!api.session()) return renderLogin();
  const { screen, params } = parseHash();
  const changed = state.screen !== screen.id;
  state.screen = screen.id;
  if (changed) state.query = '';
  $$('.nav__link[data-screen]').forEach((a) => (a.dataset.screen === screen.id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  document.title = `${screen.title} · Galactus admin`;
  try {
    if (screen.id === 'home') await renderHome();
    else if (screen.id === 'enquiries') await renderEnquiries();
    else await renderContent(screen);
  } catch (err) { return handleError(err); }
  if (focus && changed) $('#main h1')?.focus();
  // Deep links: #/team?add=team  or  #/team?coll=team&edit=t5&field=bio
  const add = params.get('add'), edit = params.get('edit'), coll = params.get('coll') || add;
  if (add || edit) {
    history.replaceState(null, '', '#/' + screen.id);
    lastHash = location.hash;
    if (COLLECTIONS[coll]) openEditor(coll, edit || null, { field: params.get('field') });
  }
}
window.addEventListener('hashchange', async () => {
  if (editor) {
    if (editor.isDirty()) {
      const leave = await confirmDialog({ title: 'Leave without saving?', body: 'Your changes will be lost.', ok: 'Discard changes', cancel: 'Keep editing' });
      if (!leave) { history.pushState(null, '', lastHash); return; }
    }
    await editor.forceClose();
  }
  lastHash = location.hash;
  route({ focus: true });
});
window.addEventListener('beforeunload', (e) => { if (editor && editor.isDirty()) { e.preventDefault(); e.returnValue = ''; } });

function handleError(err) {
  if (err.code === 'auth') { renderLogin(err.message); return; }
  toast(err.message, { ms: 6000 });
}

const pageHead = (screen, lead = '') => `<div class="page__head">
    <div><h1 class="title" tabindex="-1">${esc(screen.title)}</h1>${lead ? `<p class="page__lead">${lead}</p>` : ''}</div>
    <a class="page__site" href="${esc(screen.site)}" target="_blank" rel="noopener">View on website <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>
  </div>`;

// ====================================================================== home
async function renderHome() {
  const main = $('#main');
  const colls = SCREENS.flatMap((s) => s.sections || []);
  await Promise.all(colls.map(async (c) => { state.items[c] = await api.list(c); }));
  const enq = await api.enquiries.list();
  const newEnq = enq.filter((e) => e.status === 'New').length;
  const groups = SCREENS.filter((s) => s.sections).map((s) => ({
    screen: s,
    entries: s.sections.flatMap((c) => ordered(c).flatMap((item) => todoFields(c, item).map((t) => ({ ...t, coll: c, item })))),
  })).filter((g) => g.entries.length);
  const total = groups.reduce((n, g) => n + g.entries.length, 0);
  const count = (n, label, href) => `<a class="stat" href="${href}"><span class="stat__n">${n}</span><span class="stat__label">${label}</span></a>`;
  const name = ((api.session() || {}).name || '').split(' ')[0];
  main.innerHTML = `<div class="page">
    ${pageHead(SCREENS[0], `Hello${name ? ' ' + esc(name) : ''}. Pick a section in the menu to change what the website shows.`)}
    <section aria-labelledby="h-counts"><h2 class="sr-only" id="h-counts">At a glance</h2>
      <div class="stats">
        ${count(state.items.team.length, 'Team members', '#/team')}
        ${count(state.items.gallery.length, 'Photos', '#/gallery')}
        ${count(state.items.sponsors.length, 'Sponsors', '#/sponsors')}
        ${count(newEnq, newEnq === 1 ? 'New enquiry' : 'New enquiries', '#/enquiries')}
      </div>
    </section>
    <section class="sec" aria-labelledby="h-short"><h2 class="sec__title" id="h-short">Shortcuts</h2>
      <div class="shortcuts">
        <a class="btn btn--primary" href="#/gallery?add=gallery">+ Add photo</a>
        <a class="btn btn--ghost" href="#/team?add=team">+ Add team member</a>
        <a class="btn btn--ghost" href="/" target="_blank" rel="noopener">View website ↗<span class="sr-only"> (opens in a new tab)</span></a>
      </div>
    </section>
    <section class="sec" aria-labelledby="h-missing">
      <div class="sec__head"><h2 class="sec__title" id="h-missing">Missing info <span class="sec__count">${total}</span></h2></div>
      ${total ? `<p class="sec__note">These facts are not confirmed yet. The website shows them with a small red “[TODO]”. Choose one to check and fill it in.</p>
      <div class="missing">${groups.map((g, gi) => `<details class="missing__group"${gi === 0 ? ' open' : ''}>
          <summary><span>${esc(g.screen.title)}</span> <span class="badge badge--todo">${g.entries.length}</span></summary>
          <ul>${g.entries.map((t) => `<li><a href="#/${g.screen.id}?coll=${t.coll}&edit=${encodeURIComponent(t.item.id)}&field=${encodeURIComponent(t.path)}">
            <span class="missing__item">${esc(nameOf(t.coll, t.item))}</span><span class="missing__field">${esc(t.label)}</span><span aria-hidden="true">→</span></a></li>`).join('')}</ul>
        </details>`).join('')}</div>` : '<p class="sec__note">Nothing missing. Every fact is confirmed. ✓</p>'}
    </section>
  </div>`;
}

// ====================================================================== content screens
async function renderContent(screen) {
  const main = $('#main');
  await Promise.all(screen.sections.map(async (c) => { state.items[c] = await api.list(c); }));
  // Search only where there is enough to search through.
  const searchable = screen.sections.reduce((n, c) => n + (COLLECTIONS[c].single ? 0 : state.items[c].length), 0) >= 8;
  main.innerHTML = `<div class="page">
    ${pageHead(screen)}
    ${searchable ? `<div class="search"><label class="sr-only" for="q">Search ${esc(screen.title)}</label>
      <input type="search" id="q" placeholder="Search ${esc(screen.title.toLowerCase())}" value="${esc(state.query)}" autocomplete="off">
      <p class="search__count" id="q-count" aria-live="polite"></p></div>` : ''}
    ${screen.sections.map((c) => `<section class="sec" data-sec="${c}" aria-labelledby="h-${c}"></section>`).join('')}
    ${screen.id === 'settings' ? `<section class="sec" aria-labelledby="h-demo"><h2 class="sec__title" id="h-demo">Demo data</h2>
      <p class="sec__note">Undo every change made in this browser and go back to the original website content.</p>
      <button type="button" class="btn btn--danger" data-act="reset">Reset demo data</button></section>` : ''}
  </div>`;
  screen.sections.forEach(renderSection);
  updateSearchCount();
  const q = $('#q');
  if (q) q.addEventListener('input', () => { state.query = q.value; screen.sections.forEach(renderSection); updateSearchCount(); });
  main.onclick = onListClick;
  main.onkeydown = onListKey;
  main.onpointerdown = onDragStart;
}

const matches = (item, q) => !q || JSON.stringify(item).toLowerCase().includes(q.toLowerCase());
function updateSearchCount() {
  const c = $('#q-count');
  if (!c) return;
  if (!state.query) { c.textContent = ''; return; }
  const n = $$('.rows .row').length;
  c.textContent = n ? `${n} ${n === 1 ? 'match' : 'matches'}` : 'No matches. Try a different word.';
}

function renderSection(coll) {
  const sec = $(`[data-sec="${coll}"]`);
  if (!sec) return;
  const def = COLLECTIONS[coll], all = ordered(coll), q = state.query.trim();
  if (def.single) {
    const item = all[0] || {};
    const todo = todoFields(coll, item).length;
    sec.innerHTML = `<div class="sec__head"><h2 class="sec__title" id="h-${coll}">${esc(def.title)}</h2></div>
      <div class="card" data-coll="${coll}" data-id="${esc(item.id)}"><div class="card__text"><p class="row__title">${esc(nameOf(coll, item))} ${todo ? badge : ''}</p><p class="row__sub">${esc(def.sub(item))}</p></div>
      <button type="button" class="btn btn--ghost" data-act="edit" aria-label="Edit ${esc(def.title.toLowerCase())}">Edit</button></div>`;
    return;
  }
  const items = all.filter((x) => matches(x, q));
  const canMove = def.ordered && !q && items.length > 1;
  sec.innerHTML = `<div class="sec__head">
      <h2 class="sec__title" id="h-${coll}">${esc(def.title)} <span class="sec__count">${all.length}</span></h2>
      <button type="button" class="btn btn--primary" data-act="add" data-coll="${coll}">+ ${esc(def.add)}</button>
    </div>
    ${def.note ? `<p class="sec__note">${esc(def.note)}</p>` : ''}
    ${def.ordered && q && items.length ? '<p class="sec__note">Clear the search to change the order.</p>' : ''}
    ${canMove ? '<p class="sec__note sec__note--hint">The order here is the order on the website. Drag ↕ or use the ↑ ↓ buttons.</p>' : ''}
    ${!all.length ? `<p class="empty">${esc(def.empty || `Nothing here yet. Use “${def.add}” to add the first one.`)}</p>` : ''}
    <ul class="rows" data-coll="${coll}">${items.map((x) => rowHtml(coll, x, canMove, all.indexOf(x), all.length)).join('')}</ul>`;
}

function rowHtml(coll, x, canMove, i, n) {
  const def = COLLECTIONS[coll], label = nameOf(coll, x) || `(no ${def.singular} name)`, sub = def.sub ? String(def.sub(x) ?? '').replace(/\s*\[TODO\]/g, '') : '';
  const todo = todoFields(coll, x).length;
  const thumb = def.thumb ? `<span class="row__thumb">${x[def.thumb] ? `<img src="${esc(x[def.thumb])}" alt="" loading="lazy">` : '<span>No photo</span>'}</span>` : '';
  const L = esc(label);
  return `<li class="row" data-id="${esc(x.id)}">
    ${canMove ? `<span class="row__handle" data-drag aria-hidden="true" title="Drag to reorder">↕</span>` : ''}
    ${thumb}
    <div class="row__text"><p class="row__title">${L}${todo ? ' ' + badge : ''}</p>${sub ? `<p class="row__sub">${esc(sub)}</p>` : ''}</div>
    <div class="row__actions">
      ${canMove ? `<button type="button" class="btn btn--ghost btn--sq" data-act="up" aria-label="Move ${L} up" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button type="button" class="btn btn--ghost btn--sq" data-act="down" aria-label="Move ${L} down" ${i === n - 1 ? 'disabled' : ''}>↓</button>` : ''}
      <button type="button" class="btn btn--ghost" data-act="edit" aria-label="Edit ${L}">Edit</button>
      <button type="button" class="btn btn--ghost btn--danger-text" data-act="delete" aria-label="Delete ${L}">Delete</button>
    </div></li>`;
}

async function onListClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const act = b.dataset.act;
  if (act === 'reset') return resetDemo();
  const coll = b.dataset.coll || b.closest('[data-coll]')?.dataset.coll;
  const id = b.closest('[data-id]')?.dataset.id;
  if (act === 'add') openEditor(coll, null);
  else if (act === 'edit') openEditor(coll, id);
  else if (act === 'delete') deleteItem(coll, id, b);
  else if (act === 'up' || act === 'down') move(coll, id, act === 'up' ? -1 : 1, act);
}
function onListKey(e) {
  // Esc in the search box clears it.
  if (e.key === 'Escape' && e.target.id === 'q' && e.target.value) { e.target.value = ''; e.target.dispatchEvent(new Event('input')); }
}

async function saveOrder(coll, ids) {
  try {
    state.items[coll] = await api.reorder(coll, ids);
    if (orderToast) orderToast();
    orderToast = toast('Order saved ✓');
    return true;
  } catch (err) { handleError(err); return false; }
}
async function move(coll, id, delta, act) {
  const ids = ordered(coll).map((x) => x.id), i = ids.indexOf(id), j = i + delta;
  if (j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const item = state.items[coll].find((x) => x.id === id);
  if (!(await saveOrder(coll, ids))) return;
  renderSection(coll);
  const row = $(`[data-sec="${coll}"] .row[data-id="${CSS.escape(id)}"]`);
  const btn = $(`[data-act="${act}"]`, row);
  (btn && !btn.disabled ? btn : $(`[data-act="${act === 'up' ? 'down' : 'up'}"]`, row))?.focus();
  announce(`Moved ${COLLECTIONS[coll].label(item)} to position ${j + 1} of ${ids.length}.`);
}

// Drag to reorder with the ↕ handle (pointer events, so it also works with touch).
function onDragStart(e) {
  const handle = e.target.closest('[data-drag]');
  if (!handle || e.button !== 0) return;
  e.preventDefault();
  const row = handle.closest('.row'), list = row.parentElement, coll = list.dataset.coll;
  const before = [...list.children].map((r) => r.dataset.id).join();
  row.classList.add('is-dragging');
  list.classList.add('is-sorting');
  let raf = 0, lastY = e.clientY, lastX = e.clientX;
  const step = () => {
    raf = 0;
    const edge = 70;
    if (lastY < edge) window.scrollBy(0, -12); else if (lastY > innerHeight - edge) window.scrollBy(0, 12);
    const over = document.elementFromPoint(lastX, lastY)?.closest('.row');
    if (!over || over === row || over.parentElement !== list) return;
    const r = over.getBoundingClientRect();
    list.insertBefore(row, lastY < r.top + r.height / 2 ? over : over.nextSibling);
  };
  const onMove = (ev) => { lastY = ev.clientY; lastX = ev.clientX; if (!raf) raf = requestAnimationFrame(step); };
  const onUp = async () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
    cancelAnimationFrame(raf);
    row.classList.remove('is-dragging');
    list.classList.remove('is-sorting');
    const ids = [...list.children].map((r) => r.dataset.id);
    if (ids.join() === before) return;
    if (await saveOrder(coll, ids)) {
      const item = state.items[coll].find((x) => x.id === row.dataset.id);
      announce(`Moved ${COLLECTIONS[coll].label(item)} to position ${ids.indexOf(row.dataset.id) + 1} of ${ids.length}.`);
    }
    renderSection(coll);
  };
  // Listen on the document, not with pointer capture: moving the row in the DOM would drop the capture.
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);
}

async function deleteItem(coll, id, btn) {
  const def = COLLECTIONS[coll], item = state.items[coll].find((x) => x.id === id);
  if (!item) return;
  const label = nameOf(coll, item);
  const ok = await confirmDialog({
    title: `Delete ‘${label}’${FROM[coll] ? ' ' + FROM[coll] : ''}?`,
    body: `It disappears from the website. You can undo this for a few seconds afterwards.`,
    ok: `Delete ${def.singular}`,
  });
  if (!ok) return btn.focus();
  const rows = $$(`[data-sec="${coll}"] .row`), idx = rows.findIndex((r) => r.dataset.id === id);
  const nextId = (rows[idx + 1] || rows[idx - 1])?.dataset.id;
  try {
    const { item: removed, index } = await api.remove(coll, id);
    state.items[coll] = await api.list(coll);
    renderSection(coll);
    updateSearchCount();
    ($(`[data-sec="${coll}"] .row[data-id="${CSS.escape(nextId || '')}"] [data-act="delete"]`) || $(`[data-sec="${coll}"] [data-act="add"]`))?.focus();
    toast(`Deleted ‘${label}’.`, {
      ms: 5000,
      action: { label: 'Undo', run: async () => {
        try {
          await api.create(coll, removed, { at: index });
          state.items[coll] = await api.list(coll);
          if ($(`[data-sec="${coll}"]`)) { renderSection(coll); updateSearchCount(); $(`[data-sec="${coll}"] .row[data-id="${CSS.escape(id)}"] [data-act="edit"]`)?.focus(); }
          toast(`Restored ‘${label}’ ✓`);
        } catch (err) { handleError(err); }
      } },
    });
  } catch (err) { handleError(err); }
}

async function resetDemo() {
  const ok = await confirmDialog({ title: 'Reset all demo data?', body: 'Every change made in this browser is undone. This can’t be undone.', ok: 'Reset demo data' });
  if (!ok) return;
  api.resetDemo();
  toast('Demo data reset ✓');
  refreshNewCount();
  route();
}

// ====================================================================== edit panel
async function openEditor(coll, id, { field } = {}) {
  if (editor) return;
  const def = COLLECTIONS[coll], isNew = !id;
  let item;
  try { item = isNew ? structuredClone(def.defaults || {}) : await api.get(coll, id); } catch (err) { return handleError(err); }
  if (!item) return toast('That item no longer exists. It may have been deleted.');
  const opener = document.activeElement;
  const title = isNew ? def.add : `Edit ${def.singular}`;
  const dlg = el(`<dialog class="panel" aria-labelledby="panel-t">
    <div class="panel__head">
      <div><h2 class="panel__title" id="panel-t">${esc(title)}</h2>${isNew ? '' : `<p class="panel__sub">${esc(nameOf(coll, item))}</p>`}</div>
      <button type="button" class="btn btn--ghost btn--sq" data-act="close" aria-label="Close">✕</button>
    </div>
    <div class="panel__body"></div>
    <div class="panel__foot">
      <button type="button" class="btn btn--primary" data-act="save">${isNew ? 'Save' : 'Save changes'}</button>
      <button type="button" class="btn btn--ghost" data-act="close">Cancel</button>
    </div></dialog>`);
  const saveBtn = $('[data-act="save"]', dlg);
  let saving = false;
  const form = buildForm({ coll, item, isNew, onBusy: (b) => { saveBtn.disabled = b || saving; } });
  $('.panel__body', dlg).append(form.el);
  document.body.append(dlg);

  const close = async () => {
    editor = null;
    await closeDialog(dlg);
    dlg.remove();
  };
  let asking = false;
  const tryClose = async () => {
    if (asking) return;
    if (form.isBusy()) return toast('Wait a moment, the photo is still uploading.');
    if (form.isDirty()) {
      asking = true;
      const leave = await confirmDialog({ title: 'Leave without saving?', body: `Your changes to this ${def.singular} will be lost.`, ok: 'Discard changes', cancel: 'Keep editing' });
      asking = false;
      if (!leave) return;
    }
    await close();
    if (opener && document.contains(opener)) opener.focus(); else $('#main h1')?.focus();
  };
  editor = { dlg, isDirty: form.isDirty, forceClose: close };

  // Esc: handle it on keydown. Chrome doesn't let a page cancel the dialog's own Esc close twice in a row
  // without a click in between, so the browser must never get to close it by itself.
  dlg.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); tryClose(); } });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); tryClose(); });
  dlg.addEventListener('close', () => { if (editor && editor.dlg === dlg) { editor = null; dlg.remove(); } }); // safety net
  dlg.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || !dlg.contains(b) || b.closest('.form')) return;
    if (b.dataset.act === 'close') tryClose();
    if (b.dataset.act === 'save') save();
  });
  // Enter in a single-line field saves (like a normal form).
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input:not([type=checkbox]):not([type=file])') && !e.isComposing) { e.preventDefault(); save(); }
  });

  async function save() {
    if (saving || form.isBusy()) return;
    const value = form.value;
    const errs = validateItem(coll, value, isNew);
    if (!form.showErrors(errs)) return;
    saving = true; saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
    try {
      const saved = isNew ? await api.create(coll, value) : await api.update(coll, id, value);
      if (coll === 'cars' && saved.current) {
        for (const c of state.items.cars || []) if (c.id !== saved.id && c.current) await api.update('cars', c.id, { current: false });
      }
      await close();
      toast('Saved ✓');
      await route();
      const row = $(`[data-coll="${coll}"] [data-id="${CSS.escape(saved.id)}"] [data-act="edit"], [data-coll="${coll}"][data-id="${CSS.escape(saved.id)}"] [data-act="edit"]`);
      if (row) { row.focus(); row.closest('.row, .card')?.classList.add('is-new'); }
      else if (opener && document.contains(opener)) opener.focus();
      else $('#main h1')?.focus();
    } catch (err) {
      saving = false; saveBtn.disabled = false; saveBtn.textContent = isNew ? 'Save' : 'Save changes';
      handleError(err);
    }
  }

  dlg.showModal();
  if (!(field && form.focusPath(field))) form.firstInput()?.focus();
}

// ====================================================================== enquiries
async function renderEnquiries() {
  const main = $('#main'), screen = SCREENS.find((s) => s.id === 'enquiries');
  const all = await api.enquiries.list();
  state.items.enquiries = all;
  const FILTERS = ['All', 'New', 'Contacted', 'Closed'];
  const n = (f) => (f === 'All' ? all.length : all.filter((x) => x.status === f).length);
  const shown = state.enqFilter === 'All' ? all : all.filter((x) => x.status === state.enqFilter);
  main.innerHTML = `<div class="page">
    ${pageHead(screen, 'Sponsorship enquiries sent from the website form.')}
    <div class="toolbar">
      <div class="filters" role="group" aria-label="Show enquiries">${FILTERS.map((f) => `<button type="button" class="chip" data-filter="${f}" aria-pressed="${state.enqFilter === f}">${f} <span>${n(f)}</span></button>`).join('')}</div>
      <button type="button" class="btn btn--ghost" data-act="csv" ${all.length ? '' : 'disabled'}>Export CSV ↓</button>
    </div>
    ${shown.length ? `<ul class="rows rows--enq">${shown.map((x) => `<li class="row${x.read ? '' : ' is-unread'}" data-id="${esc(x.id)}">
      <span class="row__dot" ${x.read ? 'hidden' : ''}><span class="sr-only">Unread</span></span>
      <div class="row__text"><p class="row__title">${esc(x.name)}${x.company ? ` <span class="muted">· ${esc(x.company)}</span>` : ''}</p>
        <p class="row__sub">${esc(x.interest || 'No package chosen')} · ${esc(fmtDate(x.receivedAt))}</p></div>
      <span class="pill pill--${x.status.toLowerCase()}">${esc(x.status)}</span>
      <div class="row__actions"><button type="button" class="btn btn--ghost" data-act="open" aria-label="Open enquiry from ${esc(x.name)}">Open</button></div>
    </li>`).join('')}</ul>` : `<p class="empty">${state.enqFilter === 'All' ? 'No enquiries yet. They appear here when someone sends the form on the website.' : `No ${state.enqFilter.toLowerCase()} enquiries.`}</p>`}
  </div>`;
  main.onpointerdown = null;
  main.onkeydown = null;
  main.onclick = (e) => {
    const f = e.target.closest('[data-filter]');
    if (f) { state.enqFilter = f.dataset.filter; renderEnquiries().then(() => $(`[data-filter="${f.dataset.filter}"]`)?.focus()); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'csv') exportCsv(all);
    if (b.dataset.act === 'open') openEnquiry(b.closest('[data-id]').dataset.id, b);
  };
}

async function openEnquiry(id, opener) {
  let x = state.items.enquiries.find((e) => e.id === id);
  if (!x) return;
  if (!x.read) { x = await api.enquiries.setRead(id, true); refreshNewCount(); }
  const STATUSES = ['New', 'Contacted', 'Closed'];
  const row = (k, v) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '');
  const dlg = el(`<dialog class="panel" aria-labelledby="enq-t">
    <div class="panel__head"><div><h2 class="panel__title" id="enq-t">Enquiry from ${esc(x.name)}</h2><p class="panel__sub">${esc(fmtDate(x.receivedAt))}</p></div>
      <button type="button" class="btn btn--ghost btn--sq" data-act="close" aria-label="Close">✕</button></div>
    <div class="panel__body">
      <fieldset class="seg"><legend class="field__label">Status</legend>
        ${STATUSES.map((s) => `<label class="seg__opt"><input type="radio" name="enq-status" value="${s}"${x.status === s ? ' checked' : ''}><span>${s}</span></label>`).join('')}
      </fieldset>
      <dl class="details">
        ${row('Name', esc(x.name))}${row('Company', esc(x.company))}
        ${row('Email', `<a href="mailto:${esc(x.email)}">${esc(x.email)}</a>`)}${row('Phone', x.phone ? `<a href="tel:${esc(x.phone.replace(/\s/g, ''))}">${esc(x.phone)}</a>` : '')}
        ${row('Interested in', esc(x.interest))}${row('Received', esc(new Date(x.receivedAt).toLocaleString('en-IN')))}
        <div class="details__msg"><dt>Message</dt><dd>${esc(x.message).replace(/\n/g, '<br>')}</dd></div>
      </dl>
    </div>
    <div class="panel__foot">
      <a class="btn btn--primary" href="mailto:${esc(x.email)}?subject=${encodeURIComponent('Galactus Racing sponsorship')}">Reply by email</a>
      <button type="button" class="btn btn--ghost" data-act="unread">Mark as unread</button>
      <button type="button" class="btn btn--ghost" data-act="close">Close</button>
    </div></dialog>`);
  document.body.append(dlg);
  const done = async () => { await closeDialog(dlg); dlg.remove(); await renderEnquiries(); $(`[data-id="${CSS.escape(id)}"] [data-act="open"]`)?.focus() || opener?.focus(); };
  dlg.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); done(); } });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); done(); });
  dlg.addEventListener('change', async (e) => {
    if (e.target.name !== 'enq-status') return;
    const radios = $$('input[name="enq-status"]', dlg);
    radios.forEach((r) => (r.disabled = true));
    try { await api.enquiries.setStatus(id, e.target.value); toast('Saved ✓'); refreshNewCount(); }
    catch (err) { handleError(err); }
    finally { radios.forEach((r) => (r.disabled = false)); e.target.focus(); }
  });
  dlg.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'close') done();
    if (b.dataset.act === 'unread') { b.disabled = true; await api.enquiries.setRead(id, false); toast('Marked as unread ✓'); refreshNewCount(); done(); }
  });
  dlg.showModal();
  $('input[name="enq-status"]:checked', dlg)?.focus();
}

function exportCsv(rows) {
  const cols = [['receivedAt', 'Received'], ['status', 'Status'], ['name', 'Name'], ['company', 'Company'], ['email', 'Email'], ['phone', 'Phone'], ['interest', 'Interested in'], ['message', 'Message']];
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + [cols.map((c) => cell(c[1])).join(','), ...rows.map((r) => cols.map(([k]) => cell(k === 'receivedAt' ? new Date(r[k]).toLocaleString('en-IN') : r[k])).join(','))].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `galactus-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(`Exported ${rows.length} ${rows.length === 1 ? 'enquiry' : 'enquiries'} ✓`);
}

// ====================================================================== boot
document.body.insertAdjacentHTML('beforeend', '<div id="announcer" class="sr-only" aria-live="polite"></div>');
if (api.session()) { renderShell(); route(); } else renderLogin();
