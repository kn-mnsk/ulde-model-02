// ulde/plugins/browser/ulde-scrollspy-browser.plugin.ts

import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';

export const UldeScrollSpyBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.scrollspy',

  init(container: HTMLElement) {
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    if (!isBrowser) return;

    // Collect all headings inside the rendered document
    const headings = Array.from(
      container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    );

    if (headings.length === 0) return;

    // IntersectionObserver to detect which heading is currently visible
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Remove previous active states
            container
              .querySelectorAll('.active-heading')
              .forEach(el => el.classList.remove('active-heading'));

            // Mark the current heading as active
            entry.target.classList.add('active-heading');
          }
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -60% 0px', // triggers earlier for better UX
        threshold: 0.1
      }
    );

    // Observe each heading
    headings.forEach(h => observer.observe(h));
  }
};
