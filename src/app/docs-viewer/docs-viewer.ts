// app/docs-viewer/docs-viewer.ts

import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  signal,
  effect,
  input
} from '@angular/core';

//?import { UldeDocsViewerBridge } from '../ulde-core/ulde-docs-viewer-bridge';
// =>
import { UldeDocsViewerBridge } from '../ulde/integration/angular/ulde-docs-viewer-bridge.service';

@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  templateUrl: './docs-viewer.html'
})
export class DocsViewer implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  docId = input<string>('');
  // @Input() docId = '';
  reload = input<number>(0);
  // @Input() reload = 0;

  private cleanupFn: (() => void) | null = null;

  // Signals for reactive updates
  $docId = signal('');
  $reload = signal(0);

  constructor(
    private bridgeService: UldeDocsViewerBridge,
  ) {
    effect(() => {
      const id = this.$docId();
      const r = this.$reload();

      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      }

      if (id) {
        this.cleanupFn = this.bridgeService.run({
          host: this.hostRef?.nativeElement,
          docId: id,
          reload: r
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.$docId.set(this.docId());
    this.$reload.set(this.reload());
  }

  ngOnDestroy(): void {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
  }
}







// import { Component, input, signal, effect } from '@angular/core';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// import { JsonPipe } from '@angular/common';
// import { UldeAngularService, UldeRunResult } from '../ulde/ulde-angular.service';
// import { ArtifactsPanelModel, DebugOverlayModel } from '../ulde/core/artifacts/ulde-artifacts';
// import { UldeDocsViewerBridge } from '../ulde/integration/angular/ulde-docs-viewer-bridge.service';

// @Component({
//   selector: 'app-docs-viewer',
//   standalone: true,
//   imports: [JsonPipe],
//   templateUrl: './docs-viewer.html',
//   styleUrls: ['./docs-viewer.scss'],
// })
// export class DocsViewer {
//   // ---------------------------------------------------------
//   // Signal input instead of @Input()
//   // ---------------------------------------------------------
//   markdown = input<string>('');

//   // ---------------------------------------------------------
//   // Internal reactive state (signals)
//   // ---------------------------------------------------------
//   html = signal<SafeHtml | null>(null);
//   debugOverlay = signal<DebugOverlayModel | null>(null);
//   artifactsPanel = signal<ArtifactsPanelModel | null>(null);

//   constructor(
//     private readonly ulde: UldeAngularService,
//     private readonly sanitizer: DomSanitizer,
//     private readonly bridge: UldeDocsViewerBridge,
//   ) {
//     // -------------------------------------------------------
//     // React to markdown input changes
//     // -------------------------------------------------------
//     effect(() => {
//       const md = this.markdown();
//       if (!md) return;
//       this.ulde.renderMarkdown(md);
//     });

//     // -------------------------------------------------------
//     // React to ULDE pipeline results
//     // -------------------------------------------------------
//     this.ulde.result$.subscribe(result => {
//       if (!result) return;
//       this.applyResult(result);
//     });
//   }

//   // ---------------------------------------------------------
//   // Apply ULDE results into signals
//   // ---------------------------------------------------------
//   private applyResult(result: UldeRunResult) {
//     // console.log("FINAL HTML FROM PIPELINE:", result.finalHtml);

//     const html = result.finalHtml;
//     // insert HTML into Angular DOM
//     this.html.set(this.sanitizer.bypassSecurityTrustHtml(html));
//     // Run browser plugins AFTER Angular updates DOM
//     setTimeout(() => {
//       if (typeof window === 'undefined') return;
//       if (typeof document === 'undefined') return;

//       const container = document.querySelector('.docs-content') as HTMLElement;
//       if (container) {
//         this.bridge.run(container, html);
//       }
//     });


//     this.debugOverlay.set(result.debugOverlay);
//     this.artifactsPanel.set(result.artifactsPanel);

//   }

//   // Artifact sections
//   trackByTitle = (index: number, item: { title: string }) =>
//     `${item.title ?? 'untitled'}-${index}`;

//   // Artifact items
//   trackByIndex = (index: number, item: { index: number }) =>
//     `${item.index ?? index}-${index}`;

//   // Fallback
//   trackByObjectIdentity = (index: number, item: any) =>
//     `${index}-${JSON.stringify(item).length}`;

//   // optional if  artifacts have a slug or id property, prefer that as the key:
//   trackBySlug = (index: number, item: { slug?: string }) =>
//     item.slug ?? `slug-${index}`;


// }
