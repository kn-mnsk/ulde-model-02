# React Integration (ULDE-MODEL-01)

This document describes how to integrate ULDE-MODEL-01 into a React application.

The integration has three main parts:

1. `UldeBrowserHost` instance
2. React context provider (`UldeProvider`)
3. React viewer component (`UldeViewer`)

---

## 1. UldeBrowserHost

__File:__

- `core/host/ulde-browser-host.ts`

__Responsibilities:__

- Run `runUldePipeline()` with markdown input
- Inject `finalHtml` into a DOM container
- Run browser DOM plugins (Mermaid, KaTeX, Anchors, ScrollSpy)

---

## 2. React provider

__File:__

- `ulde/integration/react/ulde-react-provider.tsx`

__Example:__

```tsx
import React, { createContext } from 'react';
import { UldeBrowserHost } from '../../core/host/ulde-browser-host';

import { UldeMermaidBrowserPlugin } from '../../plugins/browser/ulde-mermaid-browser.plugin';
import { UldeKatexBrowserPlugin } from '../../plugins/browser/ulde-katex-browser.plugin';
import { UldeAnchorsBrowserPlugin } from '../../plugins/browser/ulde-anchors-browser.plugin';
import { UldeScrollSpyBrowserPlugin } from '../../plugins/browser/ulde-scrollspy-browser.plugin';

export const UldeContext = createContext<UldeBrowserHost | null>(null);

export const UldeProvider = ({ children }) => {
  const host = new UldeBrowserHost();

  host.registerBrowserDomPlugin(UldeMermaidBrowserPlugin);
  host.registerBrowserDomPlugin(UldeKatexBrowserPlugin);
  host.registerBrowserDomPlugin(UldeAnchorsBrowserPlugin);
  host.registerBrowserDomPlugin(UldeScrollSpyBrowserPlugin);

  return (
    <UldeContext.Provider value={host}>
      {children}
    </UldeContext.Provider>
  );
};
```

## 3. React viewer component

__File:__

- ulde/integration/react/UldeViewer.tsx

__Example:__

```tsx
import React, { useEffect, useRef, useContext } from 'react';
import { UldeContext } from './ulde-react-provider';

export function UldeViewer({ content }: { content: string }) {
  const host = useContext(UldeContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (host && ref.current) {
      host.run(ref.current, content);
    }
  }, [content]);

  return <div ref={ref} className="ulde-viewer"></div>;
}
```

## 4. Usage in a React app

__Example:__

```tsx
import React from 'react';
import { UldeProvider } from './ulde/integration/react/ulde-react-provider';
import { UldeViewer } from './ulde/integration/react/UldeViewer';

export function App() {
  const markdown = '# Hello ULDE-MODEL-01';

  return (
    <UldeProvider>
      <UldeViewer content={markdown} />
    </UldeProvider>
  );
}
```

__This will:__

- Run the ULDE pipeline on markdown
- Inject finalHtml into the .ulde-viewer div
- Run Mermaid, KaTeX, Anchors, ScrollSpy on the real DOM
