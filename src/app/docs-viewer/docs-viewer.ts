// app/docs-viewer/docs-viewer.ts
/**
 * Final Architecture (Locked In)
 * docId
  ↓
fetch /docs/{docId}.md
  ↓
UldeAngularService.renderMarkdown(markdown)
  ↓
runUldePipeline()
  ↓
result$ emits:
  - finalHtml
  - debugOverlay
  - artifactsPanel
  ↓
DocsViewerBridge.run()
  ↓
BrowserHost DOM plugins
  ↓
Rendered document
 */


import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  effect,
  input
} from '@angular/core';

import { UldeDocsViewerBridge } from '../ulde/integration/angular/ulde-docs-viewer-bridge.service';
import { UldeAngularService, UldeRunResult } from '../ulde/integration/angular/ulde-angular.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  templateUrl: './docs-viewer.html'
})
export class DocsViewer implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  $docId = input<string>('');
  $reload = input<boolean>(false);

  private cleanupFn: (() => void) | null = null;

  constructor(
    private bridge: UldeDocsViewerBridge,
    private ulde: UldeAngularService,
  ) {
    // React to ULDE pipeline results
    this.ulde.result$.subscribe(result => {
      if (!result) return;

      const html = result.finalHtml;

      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      }

      this.cleanupFn = this.bridge.run({
        host: this.hostRef.nativeElement,
        docId: this.$docId(),
        reload: this.$reload(),
        html
      });
    });

    // React to docId changes
    effect(() => {
      const id = this.$docId();
      if (!id) return;

      this.loadAndRender(id);
    });
  }
  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
  }

  private async loadAndRender(docId: string) {
    const url = `/docs/${docId}.md`;
    const markdown = await fetch(url).then(r => r.text());
    await this.ulde.renderMarkdown(markdown);
  }
}
