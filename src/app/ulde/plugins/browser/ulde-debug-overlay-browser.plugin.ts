// app/ulde/plugins/browser/ulde-debug-overlay-browser.plugin.ts

import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';

export const UldeDebugOverlayBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.debug-overlay',

  init(container: HTMLElement) {
    if (typeof window === 'undefined') return;

    // -----------------------------------------------------
    // Move ULDE-generated HTML into Angular host container
    // -----------------------------------------------------
    const embedded = container.querySelector('.dt-panel-content');
    if (!embedded) return;

    const host = document.querySelector('.dv-debug-overlay') as HTMLElement | null;
    if (!host) return;

    // to prevent duplication in case of re-run;
    const panelContent = host.querySelector('.dt-panel-content') as HTMLElement;
    if (panelContent!==null) {
      host.removeChild<HTMLElement>(panelContent);
    }
    host.appendChild(embedded);

    // -----------------------------------------------------
    // COLLAPSIBLE SECTIONS
    // -----------------------------------------------------
    host.querySelectorAll('.dt-section-title').forEach(title => {
      title.addEventListener('click', () => {
        const section = title.closest('.dt-section');
        section?.classList.toggle('collapsed');
      });
    });

    // -----------------------------------------------------
    // SEARCH + FUZZY HIGHLIGHT
    // -----------------------------------------------------
    const searchInput = host.querySelector('.dt-search') as HTMLInputElement | null;

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();

        host.querySelectorAll('.dt-item').forEach((item) => {
          const pre = item.querySelector('pre');
          if (!pre) return;

          const raw = pre.textContent ?? '';
          const lower = raw.toLowerCase();

          if (!query) {
            pre.innerHTML = escapeHtml(raw);
            item.classList.remove('hidden');
            return;
          }

          const result = highlightFuzzy(raw, lower, query);
          if (!result.isMatch) {
            item.classList.add('hidden');
          } else {
            item.classList.remove('hidden');
            pre.innerHTML = result.html;
          }
        });

        // Auto-collapse empty sections
        host.querySelectorAll('.dt-section').forEach((section) => {
          const visibleItems = section.querySelectorAll('.dt-item:not(.hidden)');
          section.classList.toggle('collapsed', visibleItems.length === 0);
        });
      });
    }

    // -----------------------------------------------------
    // DRAGGABLE PANEL
    // -----------------------------------------------------
    const dragHandle = host.querySelector('.dt-drag-handle') as HTMLElement | null;
    if (dragHandle) {
      let dragging = false;
      let offsetX = 0, offsetY = 0;

      dragHandle.addEventListener('mousedown', e => {
        dragging = true;
        offsetX = e.clientX - host.offsetLeft;
        offsetY = e.clientY - host.offsetTop;
        document.body.style.userSelect = 'none';
      });

      document.addEventListener('mousemove', e => {
        if (!dragging) return;
        host.style.left = `${e.clientX - offsetX}px`;
        host.style.top = `${e.clientY - offsetY}px`;
      });

      document.addEventListener('mouseup', () => {
        dragging = false;
        document.body.style.userSelect = '';
      });
    }

    // -----------------------------------------------------
    // UTILITIES
    // -----------------------------------------------------
    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function highlightFuzzy(raw: string, lower: string, query: string): { isMatch: boolean; html: string } {
      let qi = 0;
      const qlen = query.length;
      if (!qlen) return { isMatch: true, html: escapeHtml(raw) };

      let out = '';
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        const lch = lower[i];

        if (qi < qlen && lch === query[qi]) {
          out += `<span class="dt-highlight">${escapeHtml(ch)}</span>`;
          qi++;
        } else {
          out += escapeHtml(ch);
        }
      }

      return { isMatch: qi === qlen, html: out };
    }
  }
};
