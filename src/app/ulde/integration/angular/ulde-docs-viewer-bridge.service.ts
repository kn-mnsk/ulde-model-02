// ulde/integration/angular/ulde-docs-viewer-bridge.service.ts

import { Injectable } from '@angular/core';
import { UldeBrowserHost } from '../../core/host/ulde-browser-host';

// Browser DOM plugins
import { UldeMermaidBrowserPlugin } from '../../plugins/browser/ulde-mermaid-browser.plugin';
import { UldeKatexBrowserPlugin } from '../../plugins/browser/ulde-katex-browser.plugin';
import { UldeAnchorsBrowserPlugin } from '../../plugins/browser/ulde-anchors-browser.plugin';
import { UldeScrollSpyBrowserPlugin } from '../../plugins/browser/ulde-scrollspy-browser.plugin';

@Injectable({ providedIn: 'root' })
export class UldeDocsViewerBridge {
  private host = new UldeBrowserHost();

  constructor() {
    // Register browser DOM plugins
    this.host.registerBrowserDomPlugin(UldeMermaidBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeKatexBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeAnchorsBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeScrollSpyBrowserPlugin);
  }


  run(options: { host: HTMLElement; docId: string; reload?: number }) {
    const { host, docId } = options;

    // TODO: resolve docId → HTML
    const html = this.resolveHtml(docId);


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
