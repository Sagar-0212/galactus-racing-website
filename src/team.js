// Team page entry. Markup is rendered at build time (src/render/team.js).
import './styles/base.css';
import './styles/components.css';
import './styles/team.css';
import { TeamLegacyMotion } from './motion/legacy.js';
import { initMenu } from './ui/menu.js';

initMenu();
document.querySelectorAll('[data-href]').forEach((b) => b.addEventListener('click', () => { location.href = b.dataset.href; }));
new TeamLegacyMotion().start();
