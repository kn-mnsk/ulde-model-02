// ulde/plugins/browser/ulde-anchors-browser.plugin.ts

import { access } from 'node:fs/promises';
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
    // 2. Internal docId routing
    //


    const internalLinks = container.querySelectorAll('a[href^="#docId:"]');

    try {
      internalLinks.forEach(a => {
        a.addEventListener('click', (e: any) => {
          e.preventDefault();

          const href = a.getAttribute('href')!;
          const docId = href.replace('#docId:', '');

          const rect = a.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const anchorPos = Number((rect.top - containerRect.top).toFixed(2));; // anchor position

          // console.log(`Log: [UldeAnchotsBrowserPlugin] Internal Doc Routing Click Event ClientY=`, e.currentTarget);

          container.dispatchEvent(new CustomEvent('ulde:navigate', {
            detail: {
              id: docId,
              // scrollTop: e.clientY
            },
            bubbles: true
          }));
        });
      });
    } catch (err) {
      console.error('Error: [UldeAnchorsBrowserPlugin]:', err);
    }

  }

};
