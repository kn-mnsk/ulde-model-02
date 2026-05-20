// app/ulde/plugins/browser/ulde-debug-overlay-browser.plugin.ts
import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';

export const UldeDebugOverlayBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.debug-overlay',

  init(container: HTMLElement) {
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    if (!isBrowser) return;

    // Find the ULDE-generated debug overlay content
    const embedded = container.querySelector('.ulde-debug-overlay-content');
    if (!embedded) return;

    // Find the Angular host container
    const host = container.querySelector('.dv-debug-overlay');
    if (!host) return;

    // Move the ULDE overlay HTML into the Angular container
    host.appendChild(embedded);
  }
};

