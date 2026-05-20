// ulde/integration/angular/ulde-docs-viewer-bridge.service.ts

import { Injectable } from '@angular/core';
import { UldeBrowserHost } from '../../core/host/ulde-browser-host';

// Browser DOM plugins
import { UldeMermaidBrowserPlugin } from '../../plugins/browser/ulde-mermaid-browser.plugin';
import { UldeKatexBrowserPlugin } from '../../plugins/browser/ulde-katex-browser.plugin';
import { UldeAnchorsBrowserPlugin } from '../../plugins/browser/ulde-anchors-browser.plugin';
import { UldeScrollSpyBrowserPlugin } from '../../plugins/browser/ulde-scrollspy-browser.plugin';
import { UldeDebugOverlayBrowserPlugin } from '../../plugins/browser/ulde-debug-overlay-browser.plugin';


@Injectable({ providedIn: 'root' })
export class UldeDocsViewerBridge {
  private host = new UldeBrowserHost();

  constructor() {
    // Register browser DOM plugins
    this.host.registerBrowserDomPlugin(UldeMermaidBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeKatexBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeAnchorsBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeScrollSpyBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeDebugOverlayBrowserPlugin);

  }


  run(options: { host: HTMLElement; docId: string; reload?: boolean; html: string; onScrollSpy: (id: string) => void ; onNavigate?: (docId: string) => void }) {
    const { host, html, reload, onNavigate, onScrollSpy } = options;

    // // TODO: resolve docId → HTML
    // const html = this.resolveHtml(docId);
    if (reload) {
      host.innerHTML = '';
    }

    // Listen for ULDE navigation events
    if (onNavigate) {
      host.addEventListener('ulde:navigate', (e: any) => {
        onNavigate(e.detail.docId);
      });
    }

    if (options.onScrollSpy) {
      host.addEventListener('ulde:scrollspy', (e: any) => {
        options.onScrollSpy(e.detail.id);
      });
    }
    // This returns a Promise<void>
    this.host.run(host, html);

    // Return a no-op cleanup function
    return () => { };
  }

  private resolveHtml(docId: string): string {
    // Temporary: replace with real lookup
    return `<h1>${docId}</h1>`;
  }

  // run(container: HTMLElement, html: string) {
  //   return this.host.run(container, html);
  // }

}
