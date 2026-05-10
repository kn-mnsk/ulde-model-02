import mermaid from 'mermaid';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { DOCUMENT } from '@angular/core';

export const UldeMermaidPlugin: UldePlugin = {
  meta: {
    name: 'mermaid',
    description: 'render mermaid graph',
    version: '1.0',
    author: 'mnsk'
  },
  phase: UldePhase.DOM,

  async run(ctx) {
    // SSR guard: only run in the browser
    // SSR guard
    const isBrowser =
  typeof globalThis === 'object' &&
  typeof (globalThis as any).window !== 'undefined' &&
  typeof (globalThis as any).document !== 'undefined';

if (!isBrowser) return;


    try {
      // Initialize Mermaid (safe to call multiple times)
      mermaid.initialize({
        startOnLoad: false
      });

      // Render all <code class="language-mermaid"> blocks
      await mermaid.run({
        querySelector: 'code.language-mermaid'
      });
    } catch (error) {
      // Optional: you can also push this into ULDE diagnostics
      console.error('[ULDE Mermaid Plugin] Failed to render Mermaid diagrams:', error);
    }
  }
};
