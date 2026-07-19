// ulde/plugins/browser/ulde-katex-browser.plugin.ts

import type { BrowserDomPlugin } from '../../core/host/ulde-browser-host';
import renderMathInElement from 'katex/contrib/auto-render';
// import 'katex/dist/katex.min.css';

export const UldeKatexBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.katex',

  init(container: HTMLElement) {
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    if (!isBrowser) return;

    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  },
};
