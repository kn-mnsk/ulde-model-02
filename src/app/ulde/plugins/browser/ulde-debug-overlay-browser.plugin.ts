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
    console.log(`Log: [UldeDebugOverlayBrowserPlugin] \nembedded=`, embedded, `\ncontainer=`, container);

    if (!embedded) return;

    // Find the Angular host container
    const host = document.querySelector('.dv-debug-overlay') as HTMLElement | null;;
    // const host = container.querySelector('.dv-debug-overlay');
    console.log(`Log: [UldeDebugOverlayBrowserPlugin] host=`, host);

    if (!host) return;

    // Move the ULDE overlay HTML into the Angular container
    host.appendChild(embedded);
  }
  
};

