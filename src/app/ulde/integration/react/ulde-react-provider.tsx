// ulde/integration/react/UldeProvider.tsx

import React, { createContext, ReactNode } from 'react';
import { UldeBrowserHost } from '../../core/host/ulde-browser-host';

// Browser DOM plugins
import { UldeMermaidBrowserPlugin } from '../../plugins/browser/ulde-mermaid-browser.plugin';
import { UldeKatexBrowserPlugin } from '../../plugins/browser/ulde-katex-browser.plugin';
import { UldeAnchorsBrowserPlugin } from '../../plugins/browser/ulde-anchors-browser.plugin';
import { UldeScrollBrowserPlugin } from '../../plugins/browser/ulde-scroll-browser.plugin';

export const UldeContext = createContext<UldeBrowserHost | null>(null);

export const UldeProvider = ({ children }: {children: ReactNode}) => {
  const host = new UldeBrowserHost();

  host.registerBrowserDomPlugin(UldeMermaidBrowserPlugin);
  host.registerBrowserDomPlugin(UldeKatexBrowserPlugin);
  host.registerBrowserDomPlugin(UldeAnchorsBrowserPlugin);
  host.registerBrowserDomPlugin(UldeScrollBrowserPlugin);

  return (
    <UldeContext.Provider value={host}>
      {children}
    </UldeContext.Provider>
  );
};
