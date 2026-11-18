// Team page, rendered from src/data/team.json + subteams.json at build time.
// Markup mirrors archive/claude-design/Team.dc.html.
import { esc, t, pad2, button, headline, slot } from './ui.js';
import { header, contactDetails, footerBar } from './layout.js';

export function renderTeam({ team, subteams, contact }) {
  const leads = team.filter((m) => m.group === 'Leadership');
  const subs = subteams.map((s, i) => ({ ...s, n: pad2(i + 2), members: team.filter((m) => m.group === s.label) }));
  const crewCount = leads.length + subs.reduce((n, s) => n + s.members.length, 0);
  const jump = [{ href: '#leadership', label: 'Leadership', n: '01' }, ...subs.map((s) => ({ href: '#' + s.id, label: s.label, n: s.n }))];

  // Portrait / photo: duotone (ink + paper) layer over the colour photo; hover fades the duotone out.
  // No photo yet: the dashed placeholder plus a red [TODO] tag, so it is never mistaken for real.
  const photo = (p, label) => p.photo
    ? `<div class="tm-duo"><img class="tm-duo__img" src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy" decoding="async"><div class="tm-duo__tone" aria-hidden="true"><img class="tm-duo__img" src="${esc(p.photo)}" alt="" loading="lazy" decoding="async"></div></div>`
    : `${slot({ placeholder: label })}<span class="todo tm-card__todo">[TODO] photo</span>`;

  const leadCards = leads.map((p, i) => `<article class="tm-card tm-card--lead" data-card="" data-delay="${i * 110}">
      <div class="tm-card__photo tm-card__photo--portrait">${photo(p, 'Portrait: ' + p.role)}</div>
      <div class="tm-card__body tm-card__body--lead">
        <span class="tm-card__role">${esc(p.role)}</span>
        <span class="tm-card__name">${esc(p.name)}</span>
        <span class="tm-card__bio">${t(p.bio)}</span>
      </div>
    </article>`).join('');

  // Sub-teams: an ARIA tablist and ONE tabpanel (aria-labelledby follows the active tab). The panel
  // holds every sub-team's intro and member cards; the inactive ones are [hidden]. Switching runs a
  // GSAP Flip over the indicator, intros and cards (src/motion/team.js): the red indicator slides to the
  // new tab, old cards fade out in place, new ones rise in.
  const first = subs[0].id;
  const tabList = subs.map((s, i) => `<button type="button" role="tab" class="tm-tab" id="tab-${esc(s.id)}" aria-controls="subteam-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${esc(s.id)}"><span class="tm-tab__n">${s.n}</span>${esc(s.label)}${i === 0 ? '<span class="tm-tabs__ind" data-tab-ind="" data-flip-id="tab-ind" aria-hidden="true"></span>' : ''}</button>`).join('');
  const hid = (s) => (s.id === first ? '' : ' hidden');
  const intros = subs.map((s) => `<div class="tm-panel__intro" data-team="${esc(s.id)}" data-flip-id="intro-${esc(s.id)}"${hid(s)}>
        <span class="micro tm-micro">${s.n} · Sub-team · ${s.members.length} members</span>
        <h3 class="tm-h2">${esc(s.label)}</h3>
        <p class="tm-sub__desc">${t(s.desc)}</p>
      </div>`).join('');
  const cards = subs.flatMap((s) => s.members.map((m) => `<article class="tm-card" data-team="${esc(s.id)}" data-flip-id="m-${esc(m.id)}"${hid(s)}>
          <div class="tm-card__photo">${photo(m, 'Photo: ' + m.role)}</div>
          <div class="tm-card__body">
            <span class="tm-card__mname">${esc(m.name)}</span>
            <div class="tm-card__row"><span class="tm-card__mrole">${esc(m.role)}</span>${m.linkedin ? `<a href="${esc(m.linkedin)}" class="tm-card__in" target="_blank" rel="noopener" aria-label="LinkedIn: ${esc(m.name)}">in ↗</a>` : ''}</div>
          </div>
        </article>`)).join('');
  const panel = `<div role="tabpanel" class="tm-panel" id="subteam-panel" aria-labelledby="tab-${esc(first)}" tabindex="0" data-panel="" data-in="">
      <div class="tm-panel__intros">${intros}</div>
      <div class="tm-sub__grid">${cards}</div>
    </div>`;

  // Apply: the Google Form when contact.json has it ("Apply" entry), otherwise the contact footer.
  const apply = (contact.find((c) => c.kind === 'Apply') || {}).value;
  const applyAttr = apply ? `href="${esc(apply)}" target="_blank" rel="noopener"` : 'href="#contact"';

  const main = `<main>
    <section class="tm-intro">
      <div class="tm-intro__bigtext" data-hx="" aria-hidden="true">Pit crew · Pit crew · Pit crew</div>
      <div class="tm-intro__wedge" data-wedge="" aria-hidden="true"><span class="tm-intro__wedge-i"></span></div>
      <div class="tm-intro__top">
        ${button({ label: '← Back to home', variant: 'outline', attr: { 'data-href': 'index.html' } })}
        <span class="micro tm-micro">${crewCount} members · ${subs.length} sub-teams</span>
      </div>
      <div class="tm-intro__h" data-lines="">${headline({ as: 'h1', size: 'xl', text: 'The pit crew.', accent: 'crew.' })}</div>
      <nav class="tm-jump" aria-label="Jump to a team">${jump.map((j) => `<a href="${j.href === '#leadership' ? '#leadership' : '#subteams'}" class="tm-jump__link"${j.href === '#leadership' ? '' : ` data-jump="${esc(j.href.slice(1))}"`}><span class="tm-jump__n">${j.n}</span>${esc(j.label)}</a>`).join('')}</nav>
    </section>
    <section id="leadership" class="tm-lead">
      <div class="tm-lead__head"><h2 class="tm-h2">Leadership</h2><span class="micro tm-micro">01</span></div>
      <div class="tm-lead__grid">${leadCards}</div>
    </section>
    <section id="subteams" class="tm-subs">
      <div class="tm-lead__head"><h2 class="tm-h2">Sub-teams</h2><span class="micro tm-micro">02–${subs[subs.length - 1].n}</span></div>
      <div class="tm-tabs" role="tablist" aria-label="Sub-teams" data-tabs="">${tabList}</div>
      ${panel}
    </section>
    <section class="tm-recruit">
      <div class="tm-recruit__box" data-in="">
        <div class="tm-recruit__text">
          <span class="eyebrow eyebrow--inv">Recruitment 2026–27 <span class="todo">[TODO]</span></span>
          <div data-lines="">${headline({ as: 'h2', size: 'm', inverse: true, text: 'Want to build a race car?', accent: 'race car?' })}</div>
          <p class="tm-recruit__p">No experience needed. If you can stay late in the workshop and learn from mistakes, there is a seat for you. FE and SE students from every branch can apply.</p>
        </div>
        <a class="btn btn--inverse btn--lg" ${applyAttr} data-apply=""><span class="btn__label">Apply to join</span><span class="btn__icon" aria-hidden="true">${apply ? '↗' : '↓'}</span></a>
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
