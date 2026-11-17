// Google Maps click-to-load: the contact block ships a static placeholder; the iframe (and Google's
// cookies / ~1MB of map scripts) only loads when someone presses "Load map".
export function initMaps(root = document) {
  root.querySelectorAll('[data-map]').forEach((box) => {
    const btn = box.querySelector('[data-map-load]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.title = 'Map to RIT Rajaramnagar';
      f.src = box.dataset.map;
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.className = 'contact__iframe';
      box.replaceChildren(f);
      box.classList.add('is-loaded');
    }, { once: true });
  });
}
