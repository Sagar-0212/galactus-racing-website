/* Galactus Racing admin: data layer.
   The screens talk ONLY to the functions exported here. This is the DEMO (mock) version:
   it seeds from src/data/*.json and saves in this browser's localStorage.
   When Supabase is connected, only this file gets a new implementation with the same functions:

     login(email, password)          -> {email, name}       throws Error(message)
     logout()                        -> void
     session()                       -> {email, name} | null
     list(type)                      -> item[]              (in display order)
     get(type, id)                   -> item | null
     create(type, data, {at})        -> item                (at = position, used by Undo)
     update(type, id, patch)         -> item
     remove(type, id)                -> {item, index}
     reorder(type, ids)              -> item[]
     uploadImage(blob, {name})       -> {url, bytes}
     enquiries.list()                -> enquiry[]           (newest first)
     enquiries.setStatus(id, status) -> enquiry             ('New' | 'Contacted' | 'Closed')
     enquiries.setRead(id, read)     -> enquiry

   Types (one Supabase table each later): see SEED below.
   Demo login: DEMO_LOGIN below. It is NOT security: this page is left out of the production build. */
import cars from '../data/cars.json';
import evolution from '../data/evolution.json';
import team from '../data/team.json';
import subteams from '../data/subteams.json';
import gallery from '../data/gallery.json';
import journey from '../data/journey.json';
import achievements from '../data/achievements.json';
import sponsorsData from '../data/sponsors.json';
import fundraising from '../data/fundraising.json';
import packages from '../data/packages.json';
import stats from '../data/stats.json';
import contact from '../data/contact.json';
import site from '../data/site.json';

export const DEMO = true;
const DEMO_LOGIN = { email: 'demo@galactusracing.in', password: 'pitstop-demo', name: 'Demo admin' };
const KEY = 'gr-admin:v1:';
const LATENCY = 180;

const primaryEmail = (contact.find((c) => c.kind === 'Email' && c.primary) || {}).value || '';
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString();

const SEED = {
  cars: () => cars,
  evolution: () => evolution,
  team: () => team,
  subteams: () => subteams,
  gallery: () => gallery,
  journey: () => journey,
  podiums: () => achievements.podiums,
  milestones: () => achievements.milestones,
  totals: () => achievements.totals,
  awards: () => achievements.awards,
  sponsors: () => sponsorsData.sponsors,
  tiers: () => sponsorsData.tiers,
  fundraising: () => [{ id: 'main', raised: fundraising.raised, goal: fundraising.goal, todo: fundraising.todo, brochure: fundraising.brochure || '', interestOptions: fundraising.interestOptions }],
  budget: () => fundraising.budget,
  packages: () => packages,
  stats: () => stats,
  contact: () => contact,
  settings: () => [{ id: 'site', siteName: site.name, contactEmail: primaryEmail }],
  admins: () => [{ id: 'u1', name: DEMO_LOGIN.name, email: DEMO_LOGIN.email, role: 'Owner' }],
  enquiries: () => [
    { id: 'e1', status: 'New', read: false, interest: 'Gold', name: 'Sample enquiry', company: 'Example Pvt Ltd', email: 'name@example.com', phone: '', message: 'This is a sample enquiry so you can see how the inbox works. Delete it any time.', receivedAt: ago(3) },
    { id: 'e2', status: 'Contacted', read: true, interest: 'In-kind (parts / services)', name: 'Sample enquiry 2', company: '', email: 'someone@example.com', phone: '', message: 'A second sample, already marked as contacted.', receivedAt: ago(96) },
    { id: 'e3', status: 'Closed', read: true, interest: 'Individual donation', name: 'Sample enquiry 3', company: '', email: 'alumni@example.com', phone: '+91 00000 00000', message: 'A third sample, closed.', receivedAt: ago(400) },
  ],
};
export const TYPES = Object.keys(SEED);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clone = (v) => structuredClone(v);
const newId = (type) => type.slice(0, 2) + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function read(type) {
  if (!SEED[type]) throw new Error('Unknown content type: ' + type);
  try {
    const raw = localStorage.getItem(KEY + type);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through to seed */ }
  return clone(SEED[type]());
}
function write(type, items) {
  try { localStorage.setItem(KEY + type, JSON.stringify(items)); }
  catch (e) { throw new Error('This browser’s demo storage is full. Remove a few photos, or reset the demo data in Settings.'); }
}
const find = (items, id) => {
  const i = items.findIndex((x) => x.id === id);
  if (i < 0) throw new Error('That item no longer exists. It may have been deleted.');
  return i;
};
function requireLogin() { if (!session()) { const e = new Error('You have been signed out. Sign in again.'); e.code = 'auth'; throw e; } }

export async function login(email, password) {
  await sleep(LATENCY * 2);
  const ok = String(email || '').trim().toLowerCase() === DEMO_LOGIN.email && password === DEMO_LOGIN.password;
  if (!ok) throw new Error('That email and password don’t match. Check both and try again.');
  const user = { email: DEMO_LOGIN.email, name: DEMO_LOGIN.name };
  sessionStorage.setItem(KEY + 'session', JSON.stringify(user));
  return user;
}
export function logout() { sessionStorage.removeItem(KEY + 'session'); }
export function session() {
  try { return JSON.parse(sessionStorage.getItem(KEY + 'session')); } catch (e) { return null; }
}

export async function list(type) { await sleep(LATENCY / 3); requireLogin(); return clone(read(type)); }
export async function get(type, id) { requireLogin(); const items = read(type); return clone(items.find((x) => x.id === id) || null); }

export async function create(type, data, { at } = {}) {
  await sleep(LATENCY); requireLogin();
  const items = read(type);
  const item = { ...clone(data), id: data.id || newId(type) };
  const i = Number.isInteger(at) ? Math.max(0, Math.min(at, items.length)) : items.length;
  items.splice(i, 0, item);
  write(type, items);
  return clone(item);
}
export async function update(type, id, patch) {
  await sleep(LATENCY); requireLogin();
  const items = read(type), i = find(items, id);
  items[i] = { ...items[i], ...clone(patch), id };
  write(type, items);
  return clone(items[i]);
}
export async function remove(type, id) {
  await sleep(LATENCY); requireLogin();
  const items = read(type), index = find(items, id);
  const [item] = items.splice(index, 1);
  write(type, items);
  return { item, index };
}
export async function reorder(type, ids) {
  await sleep(LATENCY); requireLogin();
  const items = read(type), byId = new Map(items.map((x) => [x.id, x]));
  const next = ids.map((id) => byId.get(id)).filter(Boolean);
  for (const x of items) if (!ids.includes(x.id)) next.push(x);
  write(type, next);
  return clone(next);
}

// Demo: the photo (already resized to WebP by the screen) is kept as a data URL in localStorage.
// Supabase: upload to Storage and return the public URL.
export async function uploadImage(blob, { name = 'photo.webp' } = {}) {
  requireLogin();
  const url = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error('Could not read that photo. Try another file.'));
    r.readAsDataURL(blob);
  });
  await sleep(LATENCY);
  const used = Object.keys(localStorage).filter((k) => k.startsWith(KEY)).reduce((n, k) => n + localStorage.getItem(k).length, 0);
  if (used + url.length > 4.5e6) throw new Error('This browser’s demo storage is full. Remove a few photos, or reset the demo data in Settings.');
  return { url, bytes: blob.size, name };
}

export const enquiries = {
  async list() {
    await sleep(LATENCY / 3); requireLogin();
    return clone(read('enquiries')).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  },
  async setStatus(id, status) {
    if (!['New', 'Contacted', 'Closed'].includes(status)) throw new Error('Unknown status.');
    return update('enquiries', id, { status, read: true });
  },
  async setRead(id, read) { return update('enquiries', id, { read: !!read }); },
};

// Demo only: forget every change made in this browser.
export function resetDemo() { for (const t of TYPES) localStorage.removeItem(KEY + t); }
