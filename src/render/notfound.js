// 404 page (served by Vercel for any unknown URL). Links are root-absolute because the page can be
// shown at any depth (/foo/bar), where relative links would break.
import { headline } from './ui.js';
import { header, footerBar } from './layout.js';

export function renderNotFound() {
  const main = `<main id="main" class="nf">
    <div class="nf__wedge" aria-hidden="true"></div>
    <div class="nf__in">
      <span class="nf__sector">S00 / 404</span>
      ${headline({ as: 'h1', size: 'xl', text: 'Wrong turn.', accent: 'turn.' })}
      <p class="nf__p">This page isn't on our track. The link may be old, or the address has a typo.</p>
      <div class="nf__btns">
        <a class="btn btn--primary btn--lg" href="/"><span class="btn__label">Back to home</span><span class="btn__icon" aria-hidden="true">→</span></a>
        <a class="btn btn--outline btn--lg" href="/team.html"><span class="btn__label">Meet the team</span><span class="btn__icon" aria-hidden="true">→</span></a>
      </div>
    </div>
  </main>
  <footer class="foot nf__foot">${footerBar({ links: [['/', 'Home'], ['/team.html', 'Team']] })}</footer>`;
  return { 'notfound-chrome': header({ page: '404' }), 'notfound-main': main };
}
