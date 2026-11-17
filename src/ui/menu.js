// Mobile menu: open/close, focus trap, Escape, click on the dark backdrop, auto-close at >= 900px.
// Ported from the menu logic in the Claude Design pages (syncMenu, onKey, onOverlayClick).
export function initMenu({ isOtherOverlayOpen = () => false } = {}) {
  const menu = document.querySelector('[data-menu]');
  const btn = document.querySelector('[data-menu-btn]');
  if (!menu || !btn) return { isOpen: () => false, close() {} };
  let open = false;

  const set = (next, { focusBtn = true } = {}) => {
    if (open === next) return;
    open = next;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open || isOtherOverlayOpen() ? 'hidden' : '';
    if (open) { const first = menu.querySelector('a[href]'); if (first) first.focus(); }
    else if (focusBtn) btn.focus({ preventScroll: true });
  };

  btn.addEventListener('click', () => set(true));
  menu.querySelector('[data-menu-close]').addEventListener('click', () => set(false));
  menu.addEventListener('click', (e) => { if (e.target === menu) set(false); });
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); set(false); return; }
    if (e.key === 'Tab') {
      const els = [...menu.querySelectorAll('a[href], button')]; if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!menu.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });
  addEventListener('resize', () => { if (innerWidth >= 900) set(false, { focusBtn: false }); });

  return { isOpen: () => open, close: (opts) => set(false, opts) };
}
