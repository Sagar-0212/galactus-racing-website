import { defineConfig } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { renderHome } from './src/render/home.js';
import { renderTeam } from './src/render/team.js';
import { renderNotFound } from './src/render/notfound.js';

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(root, 'src/data');

// Read every src/data/*.json fresh on each request, so content edits show without a restart.
function loadData() {
  const d = {};
  for (const f of readdirSync(dataDir)) if (f.endsWith('.json')) d[f.replace('.json', '')] = JSON.parse(readFileSync(resolve(dataDir, f), 'utf8'));
  return d;
}

// Replaces <!-- @render name --> markers in the HTML pages with markup built from the JSON data.
// Content ends up in the static HTML (readable by search engines and screen readers, no JS needed).
function renderPartials() {
  return {
    name: 'galactus-render',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const data = loadData();
        html = html.replaceAll('%SITE_URL%', data.site.url.replace(/\/$/, ''));
        if (!html.includes('@render')) return html;
        const parts = { ...renderHome(data), ...renderTeam(data), ...renderNotFound(data) };
        return html.replace(/<!--\s*@render\s+([\w-]+)\s*-->/g, (m, name) => {
          if (!(name in parts)) throw new Error(`Unknown render marker: ${name}`);
          return parts[name];
        });
      },
    },
    // Build only: sitemap.xml + robots.txt from src/data/site.json (one place for the domain).
    generateBundle() {
      if (this.meta.watchMode) return;
      const { site } = loadData(), base = site.url.replace(/\/$/, '');
      const today = new Date().toISOString().slice(0, 10);
      const urls = site.pages.map((p) => `  <url><loc>${base}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n');
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nDisallow: /admin.html\n\nSitemap: ${base}/sitemap.xml\n` });
    },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(dataDir)) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig({
  plugins: [renderPartials()],
  build: {
    // admin.html is dev-only (mock API) until the real backend exists, so it is not a build input.
    rolldownOptions: {
      input: {
        main: resolve(root, 'index.html'),
        team: resolve(root, 'team.html'),
        notfound: resolve(root, '404.html'),
      },
    },
  },
});
