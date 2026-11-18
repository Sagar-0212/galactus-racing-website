// Shared page chrome: header, mobile menu, contact block, footer bar.
import { esc, t, wordmark } from './ui.js';

const HOME_NAV = [
  ['#home', 'Home'], ['#journey', 'Journey'], ['#cars', 'Cars'], ['#gallery', 'Gallery'],
  ['team.html', 'Team'], ['#sponsors', 'Sponsors'], ['#contact', 'Contact'],
];

// page: 'home' | 'team'
export function navLinks(page) {
  return HOME_NAV.map(([href, label]) => {
    if (page === 'team') {
      const h = href === 'team.html' ? href : href === '#home' ? 'index.html' : 'index.html' + href;
      return { href: h, label, current: href === 'team.html' ? 'page' : null };
    }
    return { href, label, current: href === '#home' ? 'true' : null };
  });
}

export function header({ page }) {
  const links = navLinks(page);
  const homeHref = page === 'team' ? 'index.html' : '#home';
  const nav = links
    .map((l) => `<a class="hdr__link${l.current ? ' is-current' : ''}" href="${esc(l.href)}"${l.current ? ` aria-current="${l.current}"` : ''}>${esc(l.label)}</a>`)
    .join('');
  const sector = page === 'home' ? '<span class="hdr__sector" data-sector="">S01 / Home</span>' : '';
  return `<header class="hdr" data-hdr="">
    <div class="hdr__left">
      <a class="hdr__home" href="${homeHref}" aria-label="Galactus Racing, home">
        <img src="/assets/logo-gr.webp" width="129" height="90" alt="" class="hdr__logo">
        ${wordmark({ name: 'GALACTUS RACING', rule: false })}
      </a>${sector}
    </div>
    <nav class="hdr__nav" aria-label="Primary">${nav}</nav>
    <button type="button" class="hdr__burger" data-menu-btn="" aria-label="Open menu" aria-expanded="false" aria-controls="gr-menu">
      <span></span><span></span><span class="is-red"></span>
    </button>
  </header>
  <div id="gr-menu" class="menu${page === 'team' ? ' menu--team' : ''}" data-menu="" data-lenis-prevent="" role="dialog" aria-modal="true" aria-label="Site menu" hidden>
    <button type="button" class="menu__close" data-menu-close="" aria-label="Close menu">Close ✕</button>
    ${links.map((l) => `<a class="menu__link${l.current && page === 'team' ? ' is-current' : ''}" href="${esc(l.href)}"${l.current ? ` aria-current="${l.current}"` : ''}>${esc(l.label)}</a>`).join('')}
  </div>`;
}

const contactValue = (contact, kind) => contact.find((c) => c.kind === kind) || {};

const MAP_EMBED = 'https://www.google.com/maps?q=Rajarambapu+Institute+of+Technology+Islampur&output=embed';
const MAP_LINK = 'https://www.google.com/maps/search/?api=1&query=Rajarambapu+Institute+of+Technology+Islampur';

// copyEmail: clicking the address copies it (src/home.js) instead of opening the mail app.
export function contactDetails({ contact, wrapEmail = false, copyEmail = false }) {
  const email = contactValue(contact, 'Email');
  const phone = contactValue(contact, 'Phone');
  const addr = contactValue(contact, 'Address');
  // Links without a real URL / number are left out (no "#" links). They're listed in docs/TODO-FACTS.md §9.
  const socials = ['Instagram', 'LinkedIn', 'YouTube']
    .map((k) => contactValue(contact, k))
    .filter((s) => s.value)
    .map((s) => `<a href="${esc(s.value)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`)
    .join('');
  const phoneHtml = phone.value ? `<a href="tel:${esc(phone.value.replace(/\s/g, ''))}">${esc(phone.display || phone.value)}</a>` : `<span>${esc(phone.display || '')}</span>`;
  const anyTodo = [email, phone].some((c) => c.todo) || ['Instagram', 'LinkedIn', 'YouTube'].some((k) => contactValue(contact, k).todo);
  return `<div class="contact__grid">
    <div class="contact__info">
      <img src="/assets/logo-gr-light.webp" width="276" height="192" alt="Galactus Racing logo" class="contact__logo" loading="lazy" decoding="async">
      ${wordmark({ name: 'GALACTUS RACING', inverse: true, tagline: 'We reply within 48 hours.' })}
      <p class="contact__addr">${t(addr.value)}</p>
      <a class="contact__email${wrapEmail ? ' contact__email--wrap' : ''}" href="mailto:${esc(email.value)}"${copyEmail ? ` data-copy-email="${esc(email.value)}" title="Click to copy"` : ''}>${esc(email.value)}</a>
      ${copyEmail ? '<span class="micro micro--inv contact__copy-hint">Click to copy</span>' : ''}
      <div class="contact__links">${socials}${phoneHtml}${anyTodo ? '<span class="todo">[TODO] email, phone, socials</span>' : ''}</div>
    </div>
    <div class="contact__map" data-map="${esc(MAP_EMBED)}">
      <div class="map-ph" aria-hidden="true"><span class="map-ph__road map-ph__road--a"></span><span class="map-ph__road map-ph__road--b"></span><span class="map-ph__pin"></span></div>
      <div class="map-ph__ui">
        <span class="map-ph__label">RIT Rajaramnagar · Islampur</span>
        <button type="button" class="btn btn--inverse btn--sm" data-map-load=""><span class="btn__label">Load map</span><span class="btn__icon" aria-hidden="true">↓</span></button>
        <a class="map-ph__link" href="${esc(MAP_LINK)}" target="_blank" rel="noopener">Open in Google Maps ↗</a>
      </div>
    </div>
  </div>`;
}

export function footerBar({ links }) {
  return `<div class="foot__checker" aria-hidden="true"></div>
  <div class="foot__bar">
    <span>© 2026 Galactus Racing, RIT Rajaramnagar</span>
    <nav aria-label="Pages" class="foot__nav">${links.map(([href, label]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('')}</nav>
    <span>Freedom for failure.</span>
    <span>Made by Galactus Racing Web Team</span>
  </div>`;
}
