// ulde/integration/angular/ulde-docs-viewer-bridge.service.ts

import { Injectable } from '@angular/core';
import { UldeBrowserHost } from '../../core/host/ulde-browser-host';

// Browser DOM plugins
import { UldeMermaidBrowserPlugin } from '../../plugins/browser/ulde-mermaid-browser.plugin';
import { UldeKatexBrowserPlugin } from '../../plugins/browser/ulde-katex-browser.plugin';
import { UldeAnchorsBrowserPlugin } from '../../plugins/browser/ulde-anchors-browser.plugin';
import { UldeScrollBrowserPlugin } from '../../plugins/browser/ulde-scroll-browser.plugin';
import { UldeDebugOverlayBrowserPlugin } from '../../plugins/browser/ulde-debug-overlay-browser.plugin';
import { UldeArtifactsPanelBrowserPlugin } from '../../plugins/browser/ulde-artifacts-panel-browser.plugin';


@Injectable({ providedIn: 'root' })
export class UldeDocsViewerBridge {

  host = new UldeBrowserHost();

  constructor() {
    // Register browser DOM plugins
    this.host.registerBrowserDomPlugin(UldeDebugOverlayBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeArtifactsPanelBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeAnchorsBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeScrollBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeMermaidBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeKatexBrowserPlugin);
    // this.host.registerBrowserDomPlugin(UldeAnchorsBrowserPlugin);
    // this.host.registerBrowserDomPlugin(UldeScrollBrowserPlugin);
    // this.host.registerBrowserDomPlugin(UldeDebugOverlayBrowserPlugin);
    // this.host.registerBrowserDomPlugin(UldeArtifactsPanelBrowserPlugin);
  }

  // new version
  /**
     * Runs ULDE on the given host-wrapper element.
     * Wires scrollspy, scrollpos, and navigation events.
     */
  run(options: {
    host: HTMLElement;                     // host-wrapper (scroll container)
    docId: string;
    reload?: boolean;
    html: string;
    onScrollSpy?: (e: any) => void;
    onScrollTop?: (e: any) => void;
    onNavigate?: (docId: string) => void;
  }): () => void {

    const {
      host,
      html,
      reload,
      onScrollSpy,
      onScrollTop,
      onNavigate
    } = options;

    // Clear host-wrapper if reload requested
    if (reload) {
      host.innerHTML = '';
    }

    // -------------------------------
    // Event wiring
    // -------------------------------
    // ulde/plugins/browser/ulde-scroll-browser.plugin.ts
    const handleScrollSpy = (e: any) => {
      if (onScrollSpy) {
        // console.log(`Log: [UldeDocsViewerBridge] handleScrollSpy header index=`, e.detail.index, `id=`, e.detail.id);
        onScrollSpy(e);
      }
    };
    host.addEventListener('ulde:scrollspy', handleScrollSpy);

    // ulde/plugins/browser/ulde-scroll-browser.plugin.ts
    const handleScrollTop = (e: any) => {
      if (onScrollTop) {
        // console.log(`Log: [UldeDocsViewerBridge] handleScrollPos scrollTop=`, e.detail.scrollTop);

        onScrollTop(e);
      }
    };
    host.addEventListener('ulde:scrolltop', handleScrollTop);

    // src/app/ulde/plugins/browser/ulde-anchors-browser.plugin.ts
    // internal docId routing
    const handleNavigate = (e: any) => {
      if (onNavigate) {
        onNavigate(e);
      }
    };
    host.addEventListener('ulde:navigate', handleNavigate);

    // -------------------------------
    // Run ULDE pipeline
    // -------------------------------
    this.host.run(host, html);

    console.log(`Log: [UldeDocsViewerBridge] host.run finished`);
    // -------------------------------
    // Cleanup function
    // -------------------------------
    return () => {
      host.removeEventListener('ulde:scrollspy', handleScrollSpy);
      host.removeEventListener('ulde:scrollpos', handleScrollTop);
      host.removeEventListener('ulde:navigate', handleNavigate);
    };
  }

  /**
   * Optional helper for theme re-run:
   * DocsViewer calls: bridge.host.run(hostWrapper, html)
   */
  private resolveHtml(docId: string): string {
    return `<h1>${docId}</h1>`;
  }
}
