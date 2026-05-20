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
  input, signal
} from '@angular/core';

import { UldeDocsViewerBridge } from '../ulde/integration/angular/ulde-docs-viewer-bridge.service';
import { UldeAngularService, UldeRunResult } from '../ulde/integration/angular/ulde-angular.service';
import { TocEntry } from '../ulde/core/artifacts/ulde-artifacts';
import { DebugOverlayModel } from '../ulde/core/artifacts/ulde-artifacts';


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
  // Internal writable signals
  private $currentDocId = signal('');
  private $currentReload = signal(false);

  // Placeholder TOC (will be replaced by ULDE TOC later)
  toc: TocEntry[] = [];
  activeHeading = signal<string | null>(null);

  debugOverlay: DebugOverlayModel | null = null;
  showDebugOverlay = signal(false);
  @ViewChild('debugOverlayHost') debugOverlayHost?: ElementRef<HTMLElement>;

  artifactsPanel: any = null;
  showArtifacts = signal(false);
  @ViewChild('artifactsHost') artifactsHost?: ElementRef<HTMLElement>;

  constructor(
    private bridge: UldeDocsViewerBridge,
    private ulde: UldeAngularService,
  ) {
    // React to ULDE pipeline results
    this.ulde.result$.subscribe(result => {
      if (!result) return;

      const html = result.finalHtml;

      // NEW: store debug + artifacts
      this.toc = result.toc ?? [];
      this.debugOverlay = result.debugOverlay;
      // if (this.debugOverlayHost && result.debugOverlay?.html) {
      //   this.debugOverlayHost.nativeElement.innerHTML = result.debugOverlay?.html
      // }

      this.artifactsPanel = result.artifactsPanel;
      // if (this.artifactsHost && result.artifactsPanel?.html) {
      //   this.artifactsHost.nativeElement.innerHTML = result.artifactsPanel.html;
      // }


      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      }

      this.cleanupFn = this.bridge.run({
        host: this.hostRef.nativeElement,
        docId: this.$currentDocId(),
        reload: this.$currentReload(),
        html,
        onNavigate: (newDocId: string) => {
          this.$currentDocId.set(newDocId);
          this.$currentReload.set(true);
        },
        onScrollSpy: (id: string) => {
          this.activeHeading.set(id);
        }
      });
    });

    // Add keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        this.showDebugOverlay.update(v => !v);
      }
    });


    // React to external docId input
    effect(() => {
      const id = this.$docId();
      if (id) {
        this.$currentDocId.set(id);
        this.$currentReload.set(true);
      }
    });

    // React to internal docId changes
    effect(() => {
      const id = this.$currentDocId();
      if (id) {
        this.loadAndRender(id);
      }
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

  // Navigate back to index (placeholder)
  backToIndex() {
    // Temporary: navigate to a known doc or index page
    this.$currentDocId.set('index');
    this.$currentReload.set(true);
  }

  // Reload current doc
  reloadDoc() {
    this.$currentReload.set(true);
    this.loadAndRender(this.$currentDocId());
  }

  // Scroll to heading
  scrollTo(slug: string) {
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleArtifacts() {
    this.showArtifacts.update(v => !v);
  }


}
