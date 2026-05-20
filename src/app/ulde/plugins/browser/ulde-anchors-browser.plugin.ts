// ulde/plugins/browser/ulde-anchors-browser.plugin.ts

import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';

export const UldeAnchorsBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.anchors',

  init(container: HTMLElement) {
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    if (!isBrowser) return;

    // Select all headings inside the rendered document
    const headings = container.querySelectorAll(
      'h1, h2, h3, h4, h5, h6'
    );

    headings.forEach(h => {
      const text = h.textContent?.trim() ?? '';
      if (!text) return;

      // Generate slug
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      // Assign ID if missing
      if (!h.id) {
        h.id = slug;
      }

      // Create anchor link
      const anchor = document.createElement('a');
      anchor.href = `#${h.id}`;
      anchor.classList.add('ulde-anchor');
      anchor.textContent = '§';

      // Insert anchor at the beginning of the heading
      h.prepend(anchor);
    });

    //
    // 2. NEW: Internal docId routing
    //
    const internalLinks = container.querySelectorAll('a[href^="#docId:"]');

    internalLinks.forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();

        const href = a.getAttribute('href')!;
        const docId = href.replace('#docId:', '');

        container.dispatchEvent(new CustomEvent('ulde:navigate', {
          detail: { docId },
          bubbles: true
        }));
      });
    });

  }

};
