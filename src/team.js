// Team page entry. Markup is rendered at build time (src/render/team.js).
import './styles/base.css';
import './styles/components.css';
import './styles/team.css';
import { initTeamMotion } from './motion/index.js';
import { initMenu } from './ui/menu.js';
import { initMaps } from './ui/map.js';

initMenu();
initMaps();
document.querySelectorAll('[data-href]').forEach((b) => b.addEventListener('click', () => { location.href = b.dataset.href; }));
initTeamMotion();
