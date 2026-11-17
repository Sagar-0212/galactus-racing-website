// Team page, rendered from src/data/team.json + subteams.json at build time.
// Markup mirrors archive/claude-design/Team.dc.html.
import { esc, t, pad2, button, headline, slot } from './ui.js';
import { header, contactDetails, footerBar } from './layout.js';

export function renderTeam({ team, subteams, contact }) {
  const leads = team.filter((m) => m.group === 'Leadership');
  const subs = subteams.map((s, i) => ({ ...s, n: pad2(i + 2), members: team.filter((m) => m.group === s.label) }));
  const crewCount = leads.length + subs.reduce((n, s) => n + s.members.length, 0);
  const jump = [{ href: '#leadership', label: 'Leadership', n: '01' }, ...subs.map((s) => ({ href: '#' + s.id, label: s.label, n: s.n }))];

  const leadCards = leads.map((p, i) => `<article class="tm-card" data-card="" data-delay="${i * 110}">
      <div class="tm-card__photo tm-card__photo--portrait">${slot({ src: p.photo, alt: p.name, placeholder: 'Portrait: ' + p.role })}</div>
      <div class="tm-card__body tm-card__body--lead">
        <span class="tm-card__role">${esc(p.role)}</span>
        <span class="tm-card__name">${esc(p.name)}</span>
        <span class="tm-card__bio">${t(p.bio)}</span>
      </div>
    </article>`).join('');

  const subSections = subs.map((s) => `<section id="${esc(s.id)}" class="tm-sub">
      <div class="tm-sub__intro">
        <span class="micro tm-micro">${s.n} · Sub-team</span>
        <h2 class="tm-h2">${esc(s.label)}</h2>
        <p class="tm-sub__desc">${t(s.desc)}</p>
      </div>
      <div class="tm-sub__grid">${s.members.map((m, j) => `<article class="tm-card" data-card="" data-delay="${(j % 4) * 90}">
          <div class="tm-card__photo">${slot({ src: m.photo, alt: m.name, placeholder: 'Photo: ' + m.role })}</div>
          <div class="tm-card__body">
            <span class="tm-card__mname">${esc(m.name)}</span>
            <div class="tm-card__row"><span class="tm-card__mrole">${esc(m.role)}</span><a href="${esc(m.linkedin || '#')}" class="tm-card__in" aria-label="LinkedIn">in ↗</a></div>
          </div>
        </article>`).join('')}</div>
    </section>`).join('');

  const main = `<main>
    <section class="tm-intro">
      <div class="tm-intro__bigtext" data-hx="" aria-hidden="true">Pit crew · Pit crew · Pit crew</div>
      <div class="tm-intro__top">
        ${button({ label: '← Back to home', variant: 'outline', attr: { 'data-href': 'index.html' } })}
        <span class="micro tm-micro">${crewCount} members · ${subs.length} sub-teams</span>
      </div>
      <div class="tm-intro__h" data-in="">${headline({ as: 'h1', size: 'xl', text: 'The pit crew.', accent: 'crew.' })}</div>
      <nav class="tm-jump" aria-label="Jump to sub-team">${jump.map((j) => `<a href="${j.href}" class="tm-jump__link"><span class="tm-jump__n">${j.n}</span>${esc(j.label)}</a>`).join('')}</nav>
    </section>
    <section id="leadership" class="tm-lead">
      <div class="tm-lead__head"><h2 class="tm-h2">Leadership</h2><span class="micro tm-micro">01</span></div>
      <div class="tm-lead__grid">${leadCards}</div>
    </section>
    ${subSections}
    <section class="tm-recruit">
      <div class="tm-recruit__box" data-in="">
        <div class="tm-recruit__text">
          <span class="eyebrow eyebrow--inv">Recruitment 2026–27</span>
          ${headline({ as: 'h2', size: 'm', inverse: true, text: 'Want to build a race car?', accent: 'race car?' })}
          <p class="tm-recruit__p">No experience needed. If you can stay late in the workshop and learn from mistakes, there is a seat for you. FE and SE students from every branch can apply.</p>
        </div>
        ${button({ label: 'Apply to join', variant: 'inverse', size: 'lg', iconRight: '↗' })}
      </div>
    </section>
  </main>`;

  const footer = `<footer id="contact" class="tm-foot">
    <div class="tm-foot__inner">
      <p class="tm-foot__title">Let's <span class="contact__race">race.</span></p>
      ${contactDetails({ contact, wrapEmail: true })}
    </div>
    <div class="foot foot--team">${footerBar({ links: [['index.html', 'Home'], ['index.html#journey', 'Our journey']] })}</div>
  </footer>`;

  return { 'team-chrome': header({ page: 'team' }), 'team-main': main + footer };
}
