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
    this.host.registerBrowserDomPlugin(UldeMermaidBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeKatexBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeAnchorsBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeScrollBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeDebugOverlayBrowserPlugin);
    this.host.registerBrowserDomPlugin(UldeArtifactsPanelBrowserPlugin);
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
    onScrollPos?: (e: any) => void;
    onNavigate?: (docId: string) => void;
  }): () => void {

    const {
      host,
      html,
      reload,
      onScrollSpy,
      onScrollPos,
      onNavigate
    } = options;

    // Clear host-wrapper if reload requested
    if (reload) {
      host.innerHTML = '';
    }

    // -------------------------------
    // Event wiring
    // -------------------------------

    const handleScrollSpy = (e: any) => {
      if (onScrollSpy) {
        // console.log(`Log: [UldeDocsViewerBridge] handleScrollSpy header index=`, e.detail.index, `id=`, e.detail.id);
        onScrollSpy(e);
      }
    };

    const handleScrollPos = (e: any) => {
      if (onScrollPos) {
        // console.log(`Log: [UldeDocsViewerBridge] handleScrollPos scrollTop=`, e.detail.scrollTop);

        onScrollPos(e);
      }
    };

    const handleNavigate = (e: any) => {
      if (onNavigate) {
        onNavigate(e.detail?.docId);
      }
    };

    host.addEventListener('ulde:scrollspy', handleScrollSpy);
    host.addEventListener('ulde:scrollpos', handleScrollPos);
    host.addEventListener('ulde:navigate', handleNavigate);

    // -------------------------------
    // Run ULDE pipeline
    // -------------------------------
    this.host.run(host, html);

    // -------------------------------
    // Cleanup function
    // -------------------------------
    return () => {
      host.removeEventListener('ulde:scrollspy', handleScrollSpy);
      host.removeEventListener('ulde:scrollpos', handleScrollPos);
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
