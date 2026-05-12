// ulde/plugins/browser/ulde-mermaid-browser.plugin.ts

import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';
import mermaid from 'mermaid';

export const UldeMermaidBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.mermaid',

  async init(container: HTMLElement) {
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    if (!isBrowser) return;

    try {
      // Initialize Mermaid (safe to call multiple times)
      mermaid.initialize({
        startOnLoad: false
      });

      // Render all Mermaid code blocks inside the container
      await mermaid.run({
        querySelector: 'code.language-mermaid'
      });
    } catch (err) {
      console.error('[ULDE Mermaid Browser Plugin] Error:', err);
    }
  }
};
