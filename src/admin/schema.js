/* What each admin screen shows and which fields each form has.
   Field types: text, textarea, number, email, url, select, checkbox, image, tags, list, confirm.
   - confirm: a "facts checked" tick box bound to the item's `todo` flag (ticked = todo false).
   - image: photo upload; `alt` = key for the "Describe this photo" text.
   - list: repeated rows of sub-fields (specs, close-up parts). `fixed` = no add/remove.
   Keys may be dotted ("spec.n") to reach nested values. */

const GROUPS = ['Leadership', 'Chassis', 'Powertrain', 'Suspension', 'Brakes', 'Electrical', 'Manufacturing', 'Business & Marketing'];
const CATS = [['race', 'Race day'], ['workshop', 'Workshop'], ['team', 'Team'], ['testing', 'Testing']];
const SHAPES = [['4/5', 'Tall (4:5)'], ['1/1', 'Square (1:1)'], ['4/3', 'Wide (4:3)'], ['3/2', 'Extra wide (3:2)']];
const TIERS = [['title', 'Title sponsor'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze']];
const KINDS = [['Email', 'Email'], ['Phone', 'Phone'], ['Address', 'Address'], ['Instagram', 'Instagram link'], ['LinkedIn', 'LinkedIn link'], ['YouTube', 'YouTube link'], ['Apply', 'Recruitment form (Google Form link)'], ['Lead', 'Contact person'], ['UPI', 'UPI ID'], ['Bank', 'Bank note']];
const rupees = (n) => (n == null || n === '' ? '' : '₹' + Number(n).toLocaleString('en-IN'));
const optLabel = (opts, v) => (opts.find((o) => o[0] === v) || [v, v])[1];
const isUrl = (v) => /^https:\/\/[^\s.]+\.[^\s]+$/.test(v);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const COLLECTIONS = {
  cars: {
    title: 'Cars', singular: 'car', add: 'Add car',
    // Current car (Abhimanyu) first, then newest season first.
    sort: (a, b) => (b.current ? 1 : 0) - (a.current ? 1 : 0) || (b.season || 0) - (a.season || 0),
    label: (x) => x.name, sub: (x) => [`Season ${x.season || '?'}`, x.current && 'Current car'].filter(Boolean).join(' · '), thumb: 'photo',
    defaults: { current: false, specs: [] },
    fields: [
      { k: 'name', label: 'Car name', required: true, help: 'Example: Abhimanyu (M04)' },
      { k: 'code', label: 'Short code', help: 'Shown on the car card. Example: M04' },
      { k: 'season', type: 'number', label: 'Season (year)', required: true, help: 'The year the car raced. Example: 2026', min: 2008, max: 2100 },
      { k: 'current', type: 'checkbox', label: 'This is our current car', help: 'The current car is shown first and in the big hero. Only one car should be ticked.' },
      { k: 'tag', label: 'Small line above the name', help: 'Example: Current car · 2026' },
      { k: 'desc', type: 'textarea', label: 'Description', help: 'Two or three sentences. Example: Our lightest car yet, built to finish the four-hour endurance.' },
      { k: 'photo', type: 'image', label: 'Photo', alt: 'photoAlt', help: 'A clear side view of the whole car.' },
      { k: 'specs', type: 'list', label: 'Specifications', add: 'Add specification', itemLabel: (r, i) => r.k || `Specification ${i + 1}`,
        fields: [
          { k: 'k', label: 'Name', required: true, help: 'Example: Engine' },
          { k: 'v', label: 'Value', help: 'Example: B&S 10 HP Vanguard, 305 cc' },
        ] },
      { k: 'teardown', type: 'list', fixed: true, label: 'Close-up parts (scroll story on the home page)', showIf: (x) => Array.isArray(x.teardown), itemLabel: (r) => r.title,
        fields: [
          { k: 'title', label: 'Part name', required: true, help: 'Example: Suspension' },
          { k: 'line', type: 'textarea', label: 'One-line description', help: 'Example: FOX shocks front and rear.' },
          { k: 'spec.k', label: 'Measurement', help: 'Example: Wheel travel' },
          { k: 'spec.n', type: 'number', label: 'Value (number only)', help: 'Example: 25.4', step: 'any' },
          { k: 'spec.unit', label: 'Unit', help: 'Example: mm' },
          { k: 'spec.todo', type: 'confirm', label: 'This measurement is checked' },
        ] },
    ],
  },
  evolution: {
    title: 'Car timeline', singular: 'timeline entry', add: 'Add timeline entry', ordered: true,
    label: (x) => `${x.year} · ${x.name}`, sub: (x) => x.note,
    fields: [
      { k: 'year', label: 'Year', required: true, help: 'Example: 2013' },
      { k: 'name', label: 'Car name', required: true, help: 'Example: GR-05' },
      { k: 'note', label: 'What changed', help: 'One short line. Example: First independent front suspension.' },
    ],
  },
  team: {
    title: 'Team members', singular: 'team member', add: 'Add team member', ordered: true,
    label: (x) => x.name, sub: (x) => [x.role, x.group].filter(Boolean).join(' · '), thumb: 'photo',
    defaults: { group: 'Chassis', bio: '', linkedin: '', photo: '' },
    fields: [
      { k: 'photo', type: 'image', label: 'Photo', alt: 'photoAlt', help: 'Head and shoulders, face clearly visible. Square photos work best.' },
      { k: 'name', label: 'Full name', required: true, help: 'Example: Rahul Patil' },
      { k: 'role', label: 'Role', required: true, help: 'Example: Chassis lead' },
      { k: 'group', type: 'select', label: 'Sub-team', required: true, options: GROUPS.map((g) => [g, g]), help: 'Leadership members are shown at the top of the team page.' },
      { k: 'bio', type: 'textarea', label: 'Short bio', help: 'One line about what they do. Example: Leads testing and validation.' },
      { k: 'linkedin', type: 'url', label: 'LinkedIn link', help: 'Optional. The full link, for example https://www.linkedin.com/in/rahul-patil' },
    ],
  },
  gallery: {
    title: 'Photos', singular: 'photo', add: 'Add photo', ordered: true,
    label: (x) => x.caption, sub: (x) => optLabel(CATS, x.category) + (x.photo ? '' : ' · No photo yet'), thumb: 'photo',
    defaults: { category: 'race', shape: '4/3', photo: '', alt: '' },
    fields: [
      { k: 'photo', type: 'image', label: 'Photo', alt: 'alt', requiredNew: true, help: 'Real photos of our car, team or events only.' },
      { k: 'caption', label: 'Caption', required: true, help: 'Shown under the photo. Example: Hill climb, SAE BAJA India 2025' },
      { k: 'category', type: 'select', label: 'Category', required: true, options: CATS, help: 'Visitors can filter the gallery by category.' },
      { k: 'shape', type: 'select', label: 'Shape in the grid', options: SHAPES, help: 'Pick the one closest to your photo. Tall suits people, wide suits the car.' },
    ],
  },
  podiums: {
    title: 'Podium finishes', singular: 'podium finish', add: 'Add podium finish',
    label: (x) => `${x.place} · ${x.title}`, sub: (x) => [x.year, x.event].filter(Boolean).join(' · '),
    defaults: { place: 'P1', featured: false },
    fields: [
      { k: 'year', type: 'number', label: 'Year', required: true, help: 'Example: 2025', min: 2008, max: 2100 },
      { k: 'place', type: 'select', label: 'Place', required: true, options: [['P1', 'P1 (first)'], ['P2', 'P2 (second)'], ['P3', 'P3 (third)']] },
      { k: 'title', label: 'Category won', required: true, help: 'Example: Endurance race' },
      { k: 'event', label: 'Event', help: 'Example: MEGA ATV Championship' },
      { k: 'detail', type: 'textarea', label: 'Details', help: 'Where and how. Example: Indore. Four hours, zero DNFs.' },
      { k: 'featured', type: 'checkbox', label: 'Show as the big featured result' },
    ],
  },
  milestones: {
    title: 'Milestones', singular: 'milestone', add: 'Add milestone',
    label: (x) => `${x.year} · ${x.title}`, sub: (x) => x.detail,
    fields: [
      { k: 'year', type: 'number', label: 'Year', required: true, help: 'Example: 2011', min: 2008, max: 2100 },
      { k: 'title', label: 'Milestone', required: true, help: 'Example: First SAE BAJA finish' },
      { k: 'detail', type: 'textarea', label: 'Details', help: 'Example: Completed the full endurance race.' },
    ],
  },
  totals: {
    title: 'Big numbers', singular: 'number', add: 'Add number',
    label: (x) => `${x.n ?? '?'} ${x.label}`,
    fields: [
      { k: 'n', type: 'number', label: 'Number', required: true, help: 'Example: 14', min: 0 },
      { k: 'label', label: 'What it counts', required: true, help: 'Example: Podiums' },
      { k: 'todo', type: 'confirm', label: 'This number is checked' },
    ],
  },
  awards: {
    title: 'Award tags', singular: 'award', add: 'Add award',
    label: (x) => x.title,
    fields: [{ k: 'title', label: 'Award and year', required: true, help: 'Example: Best design report · 2024' }],
  },
  journey: {
    title: 'Journey chapters', singular: 'chapter', add: 'Add chapter', ordered: true,
    label: (x) => `${x.date} · ${x.title}`, sub: (x) => x.story, thumb: 'photo',
    defaults: { photo: '' },
    fields: [
      { k: 'title', label: 'Chapter title', required: true, help: 'Example: First Competition' },
      { k: 'date', label: 'Date shown', required: true, help: 'A year or a range. Example: 2014 – 2019' },
      { k: 'year', type: 'number', label: 'Year for the flip counter', required: true, help: 'One year. Example: 2014', min: 2008, max: 2100 },
      { k: 'story', type: 'textarea', label: 'Story', help: 'One or two sentences.' },
      { k: 'photo', type: 'image', label: 'Photo', alt: 'photoAlt', help: 'Optional. A real photo from that time.' },
    ],
  },
  sponsors: {
    title: 'Sponsors', singular: 'sponsor', add: 'Add sponsor', ordered: true,
    label: (x) => x.name, sub: (x) => optLabel(TIERS, x.tier) + (x.active === false ? ' · Hidden' : ''), thumb: 'logo',
    defaults: { tier: 'bronze', active: true, logo: '', url: '' },
    empty: 'No sponsors yet. Add a sponsor once the agreement is signed.',
    fields: [
      { k: 'logo', type: 'image', label: 'Logo', alt: 'logoAlt', required: true, help: 'Only logos of sponsors we actually have. A PNG with a plain background works best.' },
      { k: 'name', label: 'Company name', required: true, help: 'Example: Example Engineering Pvt Ltd' },
      { k: 'tier', type: 'select', label: 'Level', required: true, options: TIERS },
      { k: 'url', type: 'url', label: 'Website', help: 'Optional. Example: https://example.com' },
      { k: 'active', type: 'checkbox', label: 'Show on the website', help: 'Untick to hide the logo without deleting it.' },
    ],
  },
  fundraising: {
    title: 'Fundraising goal', singular: 'fundraising goal', single: true,
    label: () => 'Season fundraising', sub: (x) => `${rupees(x.raised)} raised of ${rupees(x.goal)}`,
    fields: [
      { k: 'raised', type: 'number', label: 'Raised so far (₹)', required: true, help: 'Numbers only, no commas. Example: 780000', min: 0 },
      { k: 'goal', type: 'number', label: 'Season goal (₹)', required: true, help: 'Numbers only. Example: 1200000', min: 1 },
      { k: 'todo', type: 'confirm', label: 'These amounts are checked' },
      { k: 'brochure', type: 'url', label: 'Sponsorship brochure link', help: 'Optional. A link to the PDF. Leave empty to hide the download link.' },
      { k: 'interestOptions', type: 'tags', label: 'Choices in the enquiry form', add: 'Add choice', help: 'What sponsors can pick under "Sponsorship interest". Example: Gold' },
    ],
    validate: (x) => (Number(x.raised) > Number(x.goal) * 2 ? { raised: 'That is more than double the goal. Check the number.' } : {}),
  },
  budget: {
    title: 'Where the money goes', singular: 'budget line', add: 'Add budget line', ordered: true,
    label: (x) => x.label, sub: (x) => rupees(x.amount),
    fields: [
      { k: 'label', label: 'What it pays for', required: true, help: 'Example: Materials & parts' },
      { k: 'amount', type: 'number', label: 'Amount (₹)', required: true, help: 'Numbers only. Example: 420000', min: 0 },
    ],
  },
  packages: {
    title: 'Sponsorship packages', singular: 'package', add: 'Add package', ordered: true,
    label: (x) => x.name, sub: (x) => rupees(x.price) + (x.plus ? '+' : '') + (x.featured ? ' · Highlighted' : ''),
    defaults: { plus: false, featured: false, perks: [], todo: true },
    fields: [
      { k: 'name', label: 'Package name', required: true, help: 'Example: Gold' },
      { k: 'price', type: 'number', label: 'Price (₹)', required: true, help: 'Numbers only. Example: 200000', min: 0 },
      { k: 'plus', type: 'checkbox', label: 'Show “+” after the price', help: 'For starting prices, like ₹5,00,000+' },
      { k: 'featured', type: 'checkbox', label: 'Highlight this package' },
      { k: 'perks', type: 'tags', label: 'What the sponsor gets', add: 'Add benefit', help: 'One benefit per line. Example: Logo on car side panel' },
      { k: 'todo', type: 'confirm', label: 'Price and benefits are checked' },
    ],
  },
  stats: {
    title: 'Numbers on the home page', singular: 'number', add: 'Add number', ordered: true,
    label: (x) => `${x.n ?? '?'}${x.suffix || ''} ${x.label}`,
    defaults: { suffix: '', todo: true },
    fields: [
      { k: 'n', type: 'number', label: 'Number', required: true, help: 'Example: 35', min: 0 },
      { k: 'suffix', type: 'select', label: 'After the number', options: [['', 'Nothing'], ['+', '+ (plus sign)']] },
      { k: 'label', label: 'What it counts', required: true, help: 'Example: Competitions' },
      { k: 'todo', type: 'confirm', label: 'This number is checked' },
    ],
  },
  contact: {
    title: 'Contact details and links', singular: 'contact detail', add: 'Add contact detail', ordered: true,
    label: (x) => x.label || optLabel(KINDS, x.kind), sub: (x) => x.value || 'Empty',
    defaults: { kind: 'Email', primary: false, todo: false },
    fields: [
      { k: 'kind', type: 'select', label: 'Type', required: true, options: KINDS },
      { k: 'label', label: 'Name shown', help: 'Example: Team email' },
      { k: 'value', label: 'Value', help: 'The email, number, address or full link. Example: https://forms.gle/abc123' },
      { k: 'display', label: 'Number as shown on the site', help: 'Optional, if it should look different. Example: +91 98765 43210', showIf: (x) => x.kind === 'Phone' },
      { k: 'primary', type: 'checkbox', label: 'Main email of the website', showIf: (x) => x.kind === 'Email' },
      { k: 'todo', type: 'confirm', label: 'This detail is checked' },
    ],
    validate: (x) => {
      const v = String(x.value || '').trim(), e = {};
      if (!v) return e;
      if (x.kind === 'Email' && !isEmail(v)) e.value = 'That doesn’t look like an email. Example: team@example.com';
      if (['Instagram', 'LinkedIn', 'YouTube', 'Apply'].includes(x.kind) && !isUrl(v)) e.value = 'Paste the full link, starting with https://';
      if (/\d{9,}/.test(v.replace(/[\s-]/g, '')) && ['Bank', 'UPI', 'Address', 'Lead'].includes(x.kind)) e.value = 'Never put bank account numbers on the website.';
      return e;
    },
  },
  settings: {
    title: 'Website settings', singular: 'settings', single: true,
    label: (x) => x.siteName, sub: (x) => x.contactEmail,
    fields: [
      { k: 'siteName', label: 'Site name', required: true, help: 'Example: Galactus Racing' },
      { k: 'contactEmail', type: 'email', label: 'Contact email', required: true, help: 'Where new enquiries will be sent. Example: team@example.com' },
    ],
  },
  admins: {
    title: 'Admin users', singular: 'admin user', add: 'Add admin user',
    label: (x) => x.name, sub: (x) => `${x.email} · ${x.role}`,
    defaults: { role: 'Editor' },
    note: 'Preview only: new admin logins start working once the real backend is connected.',
    fields: [
      { k: 'name', label: 'Name', required: true, help: 'Example: Rahul Patil' },
      { k: 'email', type: 'email', label: 'Email', required: true, help: 'They will sign in with this. Example: rahul@example.com' },
      { k: 'role', type: 'select', label: 'Role', required: true, options: [['Editor', 'Editor (can change content)'], ['Owner', 'Owner (can also manage admins)']] },
    ],
  },
};

// Screens in the sidebar. `site` = matching public section ("View on website").
export const SCREENS = [
  { id: 'home', title: 'Home', site: '/' },
  { id: 'cars', title: 'Cars', site: '/#cars', sections: ['cars', 'evolution'] },
  { id: 'team', title: 'Team', site: '/team.html#leadership', sections: ['team'] },
  { id: 'gallery', title: 'Gallery', site: '/#gallery', sections: ['gallery'] },
  { id: 'achievements', title: 'Achievements', site: '/#achievements', sections: ['podiums', 'milestones', 'totals', 'awards'] },
  { id: 'journey', title: 'Journey', site: '/#journey', sections: ['journey'] },
  { id: 'sponsors', title: 'Sponsors', site: '/#sponsors', sections: ['sponsors'] },
  { id: 'fundraising', title: 'Fundraising & Packages', site: '/#invest', sections: ['fundraising', 'budget', 'packages'] },
  { id: 'stats', title: 'Stats', site: '/#about', sections: ['stats'] },
  { id: 'contact', title: 'Contact & Links', site: '/#contact', sections: ['contact'] },
  { id: 'enquiries', title: 'Enquiries', site: '/#invest' },
  { id: 'settings', title: 'Settings', site: '/', sections: ['settings', 'admins'] },
];
export const screenOf = (coll) => SCREENS.find((s) => s.sections && s.sections.includes(coll));

// ---- [TODO] scanning ----
export const getPath = (o, p) => String(p).split('.').reduce((v, k) => (v == null ? v : v[k]), o);
export function setPath(o, p, val) {
  const ks = String(p).split('.'), last = ks.pop();
  const t = ks.reduce((v, k) => (v[k] == null || typeof v[k] !== 'object' ? (v[k] = {}) : v[k]), o);
  t[last] = val;
}
export const hasTodo = (v) => typeof v === 'string' && v.includes('[TODO]');

// Every field of `item` (following the form schema) that still needs info.
export function todoFields(coll, item) {
  const out = [];
  const walk = (fields, obj, prefix, labelPrefix) => {
    for (const f of fields) {
      if (f.showIf && !f.showIf(obj)) continue;
      const path = prefix + f.k, v = getPath(obj, f.k);
      if (f.type === 'list') {
        (v || []).forEach((row, i) => walk(f.fields, row, `${path}.${i}.`, `${f.itemLabel ? f.itemLabel(row, i) : i + 1}: `));
      } else if (f.type === 'tags') {
        (v || []).forEach((s, i) => hasTodo(s) && out.push({ path: `${path}.${i}`, label: labelPrefix + f.label }));
      } else if (f.type === 'confirm') {
        if (v === true) out.push({ path, label: labelPrefix + f.label.replace(/^This |^These /, '').replace(/ (is|are) checked$/, '') + ' — not checked yet', confirm: true });
      } else if (hasTodo(v)) out.push({ path, label: labelPrefix + f.label });
    }
  };
  walk(COLLECTIONS[coll].fields, item, '', '');
  return out;
}

export function validateItem(coll, item, isNew) {
  const def = COLLECTIONS[coll], errs = {};
  const check = (fields, obj, prefix) => {
    for (const f of fields) {
      if (f.showIf && !f.showIf(obj)) continue;
      const path = prefix + f.k, v = getPath(obj, f.k);
      const empty = v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
      if (f.type === 'list') { (v || []).forEach((row, i) => check(f.fields, row, `${path}.${i}.`)); continue; }
      if ((f.required || (f.requiredNew && isNew)) && empty && f.type !== 'checkbox' && f.type !== 'confirm') {
        errs[path] = f.type === 'image' ? 'Add a photo.' : f.type === 'select' ? 'Choose one.' : 'Fill this in.';
        continue;
      }
      if (empty) continue;
      if (f.type === 'number') {
        const n = Number(v);
        if (!Number.isFinite(n)) errs[path] = 'Numbers only. Example: 2025';
        else if (f.min != null && n < f.min) errs[path] = `Must be ${f.min} or more.`;
        else if (f.max != null && n > f.max) errs[path] = `Must be ${f.max} or less.`;
      }
      if (f.type === 'email' && !isEmail(String(v).trim())) errs[path] = 'That doesn’t look like an email. Example: team@example.com';
      if (f.type === 'url' && !isUrl(String(v).trim())) errs[path] = 'Paste the full link, starting with https://';
      if (f.type === 'image' && f.alt && !String(obj[f.alt] || '').trim()) errs[prefix + f.alt] = 'Describe the photo in a few words, for people who can’t see it.';
    }
  };
  check(def.fields, item, '');
  return { ...errs, ...(def.validate ? def.validate(item) : {}) };
}
