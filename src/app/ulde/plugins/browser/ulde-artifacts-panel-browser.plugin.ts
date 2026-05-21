// app/ulde/plugins/browser/ulde-artifacts-panel-browser.plugin.ts

import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';

export const UldeArtifactsPanelBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.artifacts-panel',

  init(container: HTMLElement) {
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    if (!isBrowser) return;

    // -----------------------------------------------------
    // Collapsible GROUPS
    // -----------------------------------------------------
    container.querySelectorAll('.ulde-ap-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.closest('.ulde-ap-group');
        group?.classList.toggle('collapsed');
      });
    });

    // -----------------------------------------------------
    // Collapsible SECTIONS
    // -----------------------------------------------------
    container.querySelectorAll('.ulde-ap-section-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.closest('.ulde-ap-section');
        section?.classList.toggle('collapsed');
      });
    });

    // -----------------------------------------------------
    // Fuzzy Search
    // -----------------------------------------------------
    const searchInput = container.querySelector('.ulde-ap-search') as HTMLInputElement | null;

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();

        // Filter items
        container.querySelectorAll('.ulde-ap-item').forEach((item) => {
          const text = item.textContent?.toLowerCase() ?? '';

          // Fuzzy match: all characters must appear in order
          const isMatch = query
            .split('')
            .every((char) => text.includes(char));

          item.classList.toggle('hidden', !isMatch);
        });

        // Auto-collapse empty sections
        container.querySelectorAll('.ulde-ap-section').forEach((section) => {
          const visibleItems = section.querySelectorAll('.ulde-ap-item:not(.hidden)');
          section.classList.toggle('collapsed', visibleItems.length === 0);
        });

        // Auto-collapse empty groups
        container.querySelectorAll('.ulde-ap-group').forEach((group) => {
          const visibleItems = group.querySelectorAll('.ulde-ap-item:not(.hidden)');
          group.classList.toggle('collapsed', visibleItems.length === 0);
        });
      });
    }

    // -----------------------------------------------------
    // Move ULDE-generated HTML into Angular host container
    // -----------------------------------------------------
    const embedded = container.querySelector('.ulde-artifacts-panel-content');
    if (!embedded) return;

    const host = container.querySelector('.dv-artifacts-panel');
    if (!host) return;

    host.appendChild(embedded);
  }
};
