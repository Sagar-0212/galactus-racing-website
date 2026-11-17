/* Galactus Racing admin API client.
   Every call goes through fetch(). While CONFIG.useMock is true, a mock fetch backed by
   localStorage answers instead. For the backend phase: set useMock:false and baseUrl, and
   implement on the server:
     POST /auth/login {username, password} -> {token}
     GET  /content/:type -> {items, savedAt}      (stats, cars, achievements, journey, gallery, team, sponsors, fundraising, contact, enquiries, settings)
     PUT  /content/:type {items} -> {items, savedAt}
     POST /enquiries {name, email, ...}  (public) */
(function () {
  const CONFIG = { baseUrl: '/api', useMock: true, latency: 300 };
  const MOCK_USER = 'admin', MOCK_PASSWORD = 'galactus';
  const KEY = 'galactus-admin:';
  const TOKEN = KEY + 'token';

  const specs = (o) => Object.entries(o).map(([k, v]) => ({ k, v }));
  const SEED = {
    stats: [
      { id: 's1', n: 18, suffix: '', label: 'Years active' },
      { id: 's2', n: 35, suffix: '+', label: 'Competitions' },
      { id: 's3', n: 14, suffix: '', label: 'Podium finishes' },
      { id: 's4', n: 42, suffix: '', label: 'Team members' },
      { id: 's5', n: 20, suffix: '+', label: 'Sponsors' },
    ],
    cars: [
      { id: 'm04', code: 'M04', name: 'Abhimanyu (M04)', season: 2026, current: true, photo: '',
        desc: 'Our lightest and stiffest car yet. Redesigned chromoly frame, in-house tuned CVT and a four-wheel independent setup built to finish the four-hour endurance.',
        specs: specs({ Engine: 'B&S 10 HP Vanguard, 305 cc', Transmission: 'CVT + 2-stage gearbox, 9.2:1', Suspension: 'Double wishbone F / trailing arm R', Brakes: 'Hydraulic disc, inboard rear', Chassis: 'AISI 4130 chromoly, 25.4 mm', Weight: '158 kg', 'Top speed': '58 km/h', Tyres: '23×7–10 F / 22×10–10 R', Steering: 'Rack & pinion, 1.6 turns', Safety: '5-pt harness, kill switches, firewall' }) },
      { id: 'gr25', code: '25', name: 'GR-25 Raptor', season: 2025, current: false, photo: '',
        desc: 'The car that took P1 in endurance at MEGA ATV. Zero DNFs across the season.',
        specs: specs({ Engine: 'B&S 10 HP Vanguard, 305 cc', Transmission: 'CVT + single reduction, 8.4:1', Suspension: 'Double wishbone F / semi-trailing R', Brakes: 'Hydraulic disc, outboard', Chassis: 'AISI 4130 chromoly, 25.4 mm', Weight: '172 kg', 'Top speed': '55 km/h', Tyres: '23×7–10 / 22×10–10', Steering: 'Rack & pinion, 2 turns', Safety: '5-pt harness, kill switches' }) },
      { id: 'gr24', code: '24', name: 'GR-24 Titan', season: 2024, current: false, photo: '',
        desc: 'First car with a fully in-house gearbox. P2 overall at the ATV Championship.',
        specs: specs({ Engine: 'B&S 10 HP, 305 cc', Transmission: 'CVT + chain drive', Suspension: 'Double wishbone F / H-arm R', Brakes: 'Hydraulic disc, outboard', Chassis: 'AISI 1018 steel', Weight: '188 kg', 'Top speed': '52 km/h', Tyres: '23×7–10 / 22×10–10', Steering: 'Rack & pinion', Safety: '5-pt harness, kill switch' }) },
    ],
    achievements: [
      [2008, 'Milestone', 'Team founded', '', 'Twelve students and one welding machine.'],
      [2011, 'Milestone', 'First SAE BAJA finish', 'SAE BAJA India', 'Completed the full endurance race.'],
      [2016, 'Result', 'Top 10 overall', 'SAE BAJA India', '100+ teams.'],
      [2021, 'Milestone', 'In-house CVT rig', '', 'Our own drivetrain test bench.'],
      [2025, 'Event win', 'Endurance champions', 'MEGA ATV', 'P1 at MEGA ATV, zero DNFs.'],
      [2024, 'Award', 'Best design report', '', ''],
      [2023, 'Award', 'Best cost report', '', ''],
      [2022, 'Result', 'Endurance rank 4', '', ''],
      [2021, 'Award', 'Best safety innovation', '', ''],
    ].map(([year, category, title, event, detail], i) => ({ id: 'a' + (i + 1), year, category, title, event, detail })),
    gallery: [
      ['race', 'Endurance start, MEGA ATV 2025', '4/5'], ['workshop', 'Welding the Abhimanyu (M04) cage', '4/3'], ['team', 'After technical inspection', '3/2'],
      ['testing', 'Suspension test, campus track', '1/1'], ['race', 'Hill climb, SAE BAJA India', '3/2'], ['workshop', 'CVT tuning on the rig', '4/5'],
      ['testing', 'Night test session', '4/3'], ['team', 'Design presentation', '1/1'], ['race', 'Rock crawl section', '4/3'],
    ].map(([c, caption, shape], i) => ({ id: 'g' + (i + 1), photo: '', caption, category: { race: 'Race day', workshop: 'Workshop', team: 'Team', testing: 'Testing' }[c], shape, alt: '' })),
    team: [
      ['Prof. [Name]', 'Faculty advisor', 'Leadership', 'Mechanical Engineering. Guiding the team since 2015.'],
      ['[Captain]', 'Team captain', 'Leadership', 'Driver and overall vehicle integration.'],
      ['[Vice captain]', 'Vice captain', 'Leadership', 'Leads testing and validation.'],
      ['[Tech head]', 'Technical head', 'Leadership', 'Owns design review and FEA sign-off.'],
      ['[Name]', 'Chassis lead', 'Chassis'], ['[Name]', 'Design engineer', 'Chassis'], ['[Name]', 'Fabrication', 'Chassis'],
      ['[Name]', 'Powertrain lead', 'Powertrain'], ['[Name]', 'CVT tuning', 'Powertrain'], ['[Name]', 'Gearbox design', 'Powertrain'],
      ['[Name]', 'Suspension lead', 'Suspension'], ['[Name]', 'Kinematics', 'Suspension'], ['[Name]', 'Knuckle design', 'Suspension'],
      ['[Name]', 'Brakes lead', 'Brakes'], ['[Name]', 'Rotor design', 'Brakes'],
      ['[Name]', 'Electrical lead', 'Electrical'], ['[Name]', 'DAQ & sensors', 'Electrical'],
      ['[Name]', 'Manufacturing lead', 'Manufacturing'], ['[Name]', 'CNC & machining', 'Manufacturing'], ['[Name]', 'Quality', 'Manufacturing'],
      ['[Name]', 'Business head', 'Business & Marketing'], ['[Name]', 'Marketing', 'Business & Marketing'], ['[Name]', 'Cost report', 'Business & Marketing'],
    ].map(([name, role, group, bio], i) => ({ id: 't' + (i + 1), photo: '', name, role, group, bio: bio || '', linkedin: '' })),
    journey: [
      ['spark', '2008', 2008, 'The Spark', 'It started with twelve students, one borrowed welding machine and a question nobody could answer: could we build a car that survives Baja? No workshop, no sponsors, no idea how hard it would be. We said yes anyway.'],
      ['build', '2009', 2009, 'The First Build', 'Our first chassis was heavy, a little crooked and completely ours. We learned to bend tube by ruining it and to weld by grinding out bad beads at 2 a.m. When GR-01 finally fired up, half the campus came out to watch.'],
      ['debut', '2011', 2011, 'First Competition', 'We reached SAE BAJA India with spares in carry bags and nerves we could not hide. The car broke, we fixed it in the paddock, and it broke again. On the last day it crossed the endurance finish line. We celebrated like we had won.'],
      ['lessons', '2014 – 2019', 2014, 'Challenges and Lessons', 'Not every season ends in a trophy photo. We failed inspection, snapped a driveshaft on the hill climb and watched a year of work end on lap one. Every crash went into the next design review. That is where “freedom for failure” was born.'],
      ['wins', '2020 – 2025', 2025, 'Wins and Growth', 'A chromoly frame, an in-house CVT rig, a gearbox we designed ourselves. The car got lighter and the results got louder: top 10 overall, podiums, and in 2025, endurance champions at MEGA ATV with zero DNFs.'],
      ['today', '2026 and beyond', 2026, 'Today and the Road Ahead', 'Today forty-two of us share one workshop and one goal. Abhimanyu (M04) is our lightest car yet, and the next one is already on the whiteboard. The road ahead is rough and unpaved, which is exactly where we like it.'],
    ].map(([id, date, year, title, story]) => ({ id: 'j-' + id, photo: '', title, date, year, story })),
    settings: [{ id: 'site', siteTitle: 'Galactus Racing', tagline: 'Freedom for failure.', seasonGoal: 1200000, raised: 780000, recruiting: true, applyUrl: '', adminUser: 'admin' }],
    sponsors: [],
    fundraising: [
      { id: 'p1', name: 'Bronze', price: 25000, plus: false, featured: false, perks: ['Logo on team website', 'Social media thank-you', 'Partnership certificate'] },
      { id: 'p2', name: 'Silver', price: 75000, plus: false, featured: false, perks: ['Everything in Bronze', 'Logo on car side panel', 'Logo on pit shirts'] },
      { id: 'p3', name: 'Gold', price: 200000, plus: false, featured: true, perks: ['Everything in Silver', 'Large logo on car body', 'Banner at every event', 'Campus recruitment session'] },
      { id: 'p4', name: 'Title', price: 500000, plus: true, featured: false, perks: ['Team name co-branding', 'Nose and hood placement', 'Car display at your office'] },
    ],
    contact: [
      { id: 'k1', kind: 'Email', label: 'Team email', value: 'team@galactusracing.in', primary: true },
      { id: 'k2', kind: 'Phone', label: 'Team phone', value: '', primary: false },
      { id: 'k3', kind: 'Address', label: 'Workshop', value: 'Galactus Racing Workshop, Rajarambapu Institute of Technology, Rajaramnagar, Islampur, Sangli, Maharashtra 415414', primary: false },
      { id: 'k4', kind: 'Instagram', label: '', value: '', primary: false },
      { id: 'k5', kind: 'LinkedIn', label: '', value: '', primary: false },
      { id: 'k6', kind: 'YouTube', label: '', value: '', primary: false },
    ],
    enquiries: [
      { id: 'e1', status: 'New', interest: 'Gold', name: 'Sample enquiry', company: 'Example Pvt Ltd', email: 'name@example.com', phone: '', message: 'This is a sample enquiry so you can see how the inbox works. Delete it any time.', notes: '', receivedAt: new Date(Date.now() - 3 * 3600e3).toISOString() },
      { id: 'e2', status: 'Replied', interest: 'In-kind (parts / services)', name: 'Sample enquiry 2', company: '', email: 'someone@example.com', phone: '', message: 'A second sample, already marked as replied.', notes: 'Sent the sponsorship deck.', receivedAt: new Date(Date.now() - 4 * 86400e3).toISOString() },
    ],
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reply = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  async function mockFetch(url, opts = {}) {
    await sleep(CONFIG.latency);
    const method = (opts.method || 'GET').toUpperCase();
    const path = url.slice(CONFIG.baseUrl.length);
    const body = opts.body ? JSON.parse(opts.body) : {};
    if (path === '/auth/login' && method === 'POST') {
      const raw = localStorage.getItem(KEY + 'settings'), st = raw ? (JSON.parse(raw).items || [])[0] : null, user = (st && st.adminUser) || MOCK_USER;
      return String(body.username || '').toLowerCase() === user.toLowerCase() && body.password === MOCK_PASSWORD ? reply(200, { token: 'mock-' + Date.now() }) : reply(401, { error: 'Wrong username or password.' });
    }
    if (path === '/enquiries' && method === 'POST') {
      const k = KEY + 'enquiries', raw = localStorage.getItem(k), rec = raw ? JSON.parse(raw) : { items: SEED.enquiries, savedAt: null };
      const item = { id: 'e' + Date.now(), status: 'New', notes: '', receivedAt: new Date().toISOString(), ...body };
      rec.items = [item, ...rec.items];
      try { localStorage.setItem(k, JSON.stringify(rec)); } catch (e) { return reply(413, { error: 'Storage full.' }); }
      return reply(201, item);
    }
    if (!(opts.headers && opts.headers.Authorization)) return reply(401, { error: 'Session expired. Sign in again.' });
    const m = path.match(/^\/content\/([a-z]+)$/);
    if (!m) return reply(404, { error: 'Not found.' });
    const k = KEY + m[1];
    if (method === 'GET') {
      const raw = localStorage.getItem(k);
      return reply(200, raw ? JSON.parse(raw) : { items: SEED[m[1]] || [], savedAt: null });
    }
    if (method === 'PUT') {
      const rec = { items: body.items || [], savedAt: new Date().toISOString() };
      try { localStorage.setItem(k, JSON.stringify(rec)); }
      catch (e) { return reply(413, { error: 'Browser storage is full. Use fewer or smaller images.' }); }
      return reply(200, rec);
    }
    return reply(405, { error: 'Method not allowed.' });
  }

  async function request(method, path, body) {
    const doFetch = CONFIG.useMock ? mockFetch : window.fetch.bind(window);
    const token = sessionStorage.getItem(TOKEN);
    const res = await doFetch(CONFIG.baseUrl + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) { const err = new Error(data.error || 'Request failed (' + res.status + ').'); err.status = res.status; throw err; }
    return data;
  }

  window.GalactusAPI = {
    config: CONFIG,
    session: () => sessionStorage.getItem(TOKEN),
    async login(username, password) { const r = await request('POST', '/auth/login', { username, password }); sessionStorage.setItem(TOKEN, r.token); return r; },
    logout() { sessionStorage.removeItem(TOKEN); },
    list: (type) => request('GET', '/content/' + type),
    save: (type, items) => request('PUT', '/content/' + type, { items }),
    /* Public, no auth: call from the site's enquiry form. */
    submitEnquiry: (data) => request('POST', '/enquiries', data),
  };
})();
