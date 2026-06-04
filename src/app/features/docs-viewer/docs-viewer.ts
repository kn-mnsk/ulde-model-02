// app/feature/docs-viewer/docs-viewer.ts

import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, input, signal, Inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { TocResizerDirective } from './toc-resizer.directive';
import { UldeDocsViewerBridge } from '../../ulde/integration/angular/ulde-docs-viewer-bridge.service';
import { UldeAngularService } from '../../ulde/integration/angular/ulde-angular.service';

import { TocEntry, ArtifactsPanelModel, DebugOverlayModel } from '../../ulde/core/artifacts/ulde-artifacts';

import { ThemeService } from '../../core/services/theme.service';
import { ThemeToggle } from './theme-toggle';

// import { DebugOverlay } from './debug-overlay';
// import { ArtifactsPanel } from './artifacts-panel';



@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  imports: [
    ThemeToggle, TocResizerDirective,
    // DebugOverlay,
    //  ArtifactsPanel
  ],
  templateUrl: './docs-viewer.html'
})
export class DocsViewer implements AfterViewInit, OnDestroy {

  // External readonly inputs
  $docId = input<string>('');
  $reload = input<boolean>(false);

  // Internal writable signals
  private $currentDocId = signal('');
  private $currentReload = signal(false);

  // Environment
  $isBrowser = signal(false);

  // ULDE outputs
  toc = signal<TocEntry[]>([]);
  debugOverlay = signal<DebugOverlayModel | null>(null);
  artifactsPanel = signal<ArtifactsPanelModel | null>(null);

  // UI state
  $activeHeading = signal<string | null>(null);
  $showDebugOverlay = signal(false);
  $showArtifacts = signal(false);
  $showToc = signal(false);
  $dvTocRef = signal<ElementRef<HTMLElement> | undefined>(undefined);

  private cleanupFn: (() => void) | null = null;
  private finalHtml: string | null = null;

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;
  @ViewChild('dvToc', { static: false }) dvTocRef!: ElementRef<HTMLElement>;

  constructor(
    private bridge: UldeDocsViewerBridge,
    private ulde: UldeAngularService,
    private theme: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {

    // Detect browser environment
    this.$isBrowser.set(isPlatformBrowser(this.platformId));
    if (!this.$isBrowser()) return;

    // Sync external docId → internal writable docId
    effect(() => {
      const id = this.$docId();
      if (id) {
        this.$currentDocId.set(id);
        this.$currentReload.set(true);
      }
    });

    // Sync external reload → internal reload
    effect(() => {
      if (this.$reload()) {
        this.$currentReload.set(true);
      }
    });

    // React to internal docId changes
    effect(() => {
      const id = this.$currentDocId();
      if (id && this.$isBrowser()) {
        this.loadAndRender(id);
      }
    });

    // React to internal reload flag
    effect(() => {
      if (this.$currentReload() && this.$isBrowser()) {
        this.loadAndRender(this.$currentDocId());
      }
    });

    // ULDE pipeline subscription
    this.ulde.result$.subscribe(result => {
      if (!result) return;

      this.finalHtml = result.finalHtml;
      this.toc.set(result.toc ?? []);
      this.debugOverlay.set(result.debugOverlay);
      this.artifactsPanel.set(result.artifactsPanel);

      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      }

      this.cleanupFn = this.bridge.run({
        host: this.hostRef.nativeElement,
        docId: this.$currentDocId(),
        reload: this.$currentReload(),
        html: result.finalHtml,
        onScrollSpy: id => this.$activeHeading.set(id),
        onNavigate: newDocId => {
          this.$currentDocId.set(newDocId);
          this.$currentReload.set(true);
        }
      });

      this.$dvTocRef.set(this.dvTocRef);
    });
  }

  ngAfterViewInit() {
    if (!this.$isBrowser()) return;

  }

  ngOnDestroy() {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
  }

  // Load markdown and run ULDE
  private async loadAndRender(docId: string) {
    const url = `assets/${docId}.md`;

    try {
      const response = await fetch(url);

      if (response.redirected) {
        this.hostRef.nativeElement.innerHTML = `
          <div class="page-not-found">
            <h1>Page not found</h1>
            <p><strong>Invalid URL: ${url}</strong></p>
          </div>
        `;
        throw new Error(`Invalid URL: ${url}`);
      }

      const markdown = await response.text();
      await this.ulde.renderMarkdown(markdown);

    } catch (err) {
      console.error('[DocsViewer] loadAndRender error:', err);
    }
  }

  // Navigation
  backToIndex() {
    this.$currentDocId.set('docs/index');
    this.$currentReload.set(true);
  }

  reloadDoc() {
    this.$currentReload.set(true);
  }

  // Scroll to heading
  scrollTo(slug: string) {
    const el = document.getElementById(slug);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  // Theme toggle
  async onToggleTheme() {
    // console.log(`Log: [DocsViewer] theme isDark=`, isDark);
    this.theme.toggleTheme();
    if (this.finalHtml) {
      await this.bridge.host.run(this.hostRef.nativeElement, this.finalHtml);
    }
  }

  // UI toggles
  toggleShowToc() {
    // this.$dvTocRef.set(this.dvTocRef);
    this.$showToc.update(v => !v);
  }

  toggleArtifacts() {
    this.$showArtifacts.update(v => !v);
  }

  toggleDebugOverlay() {
    this.$showDebugOverlay.update(v => !v);
  }
}







/**
 *
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

// import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, input, signal, PLATFORM_ID, Inject, inject, AfterViewChecked } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { UldeDocsViewerBridge } from '../../ulde/integration/angular/ulde-docs-viewer-bridge.service';
// import { UldeAngularService, UldeRunResult } from '../../ulde/integration/angular/ulde-angular.service';
// import { ArtifactsPanelModel, TocEntry } from '../../ulde/core/artifacts/ulde-artifacts';
// import { DebugOverlayModel } from '../../ulde/core/artifacts/ulde-artifacts';
// import { ThemeService } from '../../core/services/theme.service';
// import { BehaviorSubject } from 'rxjs';

// @Component({
//   selector: 'app-docs-viewer',
//   standalone: true,
//   templateUrl: './docs-viewer.html'
// })
// export class DocsViewer implements AfterViewChecked, AfterViewInit, OnDestroy {

//   $docId = input<string>('');
//   $reload = input<boolean>(false);
//   $isBrowser = signal<boolean>(false);

//   private cleanupFn: (() => void) | null = null;
//   // Internal writable signals
//   private $currentDocId = signal('');
//   private $currentReload = signal(false);

//   private finalHtml: string | null = null;

//   // Placeholder TOC (will be replaced by ULDE TOC later)
//   toc: TocEntry[] = [];
//   $activeHeading = signal<string | null>(null);

//   debugOverlay: DebugOverlayModel | null = null;
//   $showDebugOverlay = signal(false);
//   @ViewChild('debugOverlayHost') debugOverlayHost?: ElementRef<HTMLElement>;

//   artifactsPanel: ArtifactsPanelModel | null = null;
//   $showArtifacts = signal(false);
//   @ViewChild('artifactsHost') artifactsHost?: ElementRef<HTMLElement>;

//   @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;

//   private isResizing!: boolean;
//   private mouseDownHandler = this.onMouseDown.bind(this);
//   private mouseMoveHandler = this.onMouseMove.bind(this);
//   private mouseUpHandler = this.onMouseUp.bind(this);
//   private keyDownHandler = this.onKeyDown.bind(this);


//   private readonly dvTocState$ = new BehaviorSubject<HTMLElement | null>(null);
//   @ViewChild('dvToc', { static: false }) dvToc!: ElementRef<HTMLElement>;

//   private readonly dvTocResizerState$ = new BehaviorSubject<HTMLElement | null>(null);
//   @ViewChild('dvTocResizer', { static: false }) dvTocResizer!: ElementRef<HTMLElement>;

//   public readonly tocState$ = new BehaviorSubject<TocEntry[] | []>([]);

//   showToc: boolean = false;

//   constructor(
//     private bridge: UldeDocsViewerBridge,
//     private ulde: UldeAngularService,
//     private theme: ThemeService,
//     @Inject(PLATFORM_ID) private platformId: Object,
//   ) {

//     this.$isBrowser.set(isPlatformBrowser(this.platformId));
//     if (!this.$isBrowser()) return;
//     // React to ULDE pipeline results

//     this.ulde.result$.subscribe(result => {
//       if (!result) return;

//       const html = this.finalHtml = result.finalHtml;
//       // console.log(`Log: [DocsViewer] contructor  result.finalHtml=`, html);

//       this.tocState$.next(result.toc ?? []);

//       this.debugOverlay = result.debugOverlay;
//       this.artifactsPanel = result.artifactsPanel;
//       // console.log(`Log: [DocsViewer] contructor result=`, result.finalHtml);

//       if (this.cleanupFn) {
//         this.cleanupFn();
//         this.cleanupFn = null;
//       }

//       // console.log(`Log: [DocsViewer] result$ subscribe this.hostRef.nativeElement=`, this.hostRef.nativeElement);

//       this.cleanupFn = this.bridge.run({
//         host: this.hostRef.nativeElement,
//         docId: this.$currentDocId(),
//         reload: this.$currentReload(),
//         html,
//         onScrollSpy: (id: string) => {
//           this.$activeHeading.set(id);
//         },
//         onNavigate: (newDocId: string) => {
//           this.$currentDocId.set(newDocId);
//           this.$currentReload.set(true);
//         }
//       });

//     });

//     // React to external docId input
//     effect(() => {
//       const id = this.$docId();
//       if (id) {
//         this.$currentDocId.set(id);
//         this.$currentReload.set(true);
//       }
//     });

//     // React to internal docId changes
//     effect(() => {
//       const id = this.$currentDocId();
//       if (id && this.$isBrowser()) {
//         this.loadAndRender(id);
//       }
//     });

//   }

//   ngAfterViewInit(): void {
//     if (!this.$isBrowser()) return;
//     document.addEventListener("keydown", this.keyDownHandler);
//   }


//   ngAfterViewChecked() {
//     if (!this.$isBrowser()) return;

//     this.eventsRemove();
//     requestAnimationFrame(() => {

//       const dvToc = this.dvToc?.nativeElement ?? null;
//       const dvTocResizer = this.dvTocResizer?.nativeElement ?? null;
//       // console.log(`Log: [DocsViewer] ngAfterViewChecked `, dvToc, dvTocResizer);
//       if (dvToc !== this.dvTocState$.value) {
//         this.dvTocState$.next(dvToc);
//       }

//       if (dvTocResizer !== this.dvTocResizerState$.value) {
//         this.dvTocResizerState$.next(dvTocResizer);
//       }

//       this.eventsRegister();

//     });

//   }


//   ngOnDestroy(): void {
//     if (this.cleanupFn) {
//       this.cleanupFn();
//       this.cleanupFn = null;
//     }
//     this.eventsRemove();
//     this.dvTocState$.complete();
//     this.dvTocResizerState$.complete();
//   }

//   private async loadAndRender(docId: string) {
//     const url = `assets/${docId}.md`;
//     let markdown: string = '';

//     try {
//       const response = await fetch(url);
//       // console.log(`Log:`, response)
//       if (response.redirected) {
//         this.hostRef.nativeElement.innerHTML = `
//         <div class="page-not-found">
//           <h1>Page not found</h1>
//           <p><strong>Invalid Url = ${url} </strong></p>
//         </div>
//         `;

//         throw new Error(`HTTP error! Status: ${url} is wrong`);
//       }
//       // Parse JSON safely
//       markdown = await response.text();
//       await this.ulde.renderMarkdown(markdown);

//     } catch (e) {
//       console.error(`Error: [DocsViewer] loadAndRender \nurl=`, url, e);

//     }


//   }

//   // Navigate back to index (placeholder)
//   backToIndex() {
//     // Temporary: navigate to a known doc or index page
//     this.$currentDocId.set('docs/index');
//     this.$currentReload.set(true);
//   }

//   // Reload current doc
//   reloadDoc() {
//     this.$currentReload.set(true);
//     this.loadAndRender(this.$currentDocId());
//   }

//   // Scroll to heading
//   scrollTo(slug: string) {

//     const el = document.getElementById(slug);
//     if (el) {
//       el.scrollIntoView({ behavior: 'instant', block: 'start' });
//     }
//   }

//   toggleArtifacts() {
//     const artifactsPanel = document.querySelector('.dv-artifacts-panel') as HTMLElement | null;
//     artifactsPanel?.classList.toggle('hidden');
//     this.$showArtifacts.update(v => !v);
//   }


//   async onToggleTheme() {
//     this.theme.toggleTheme();
//     //  re-run browser dom plugins so as to update mermaid theme
//     await this.bridge.host.run(this.hostRef.nativeElement, this.finalHtml as string)
//   }

//   toggleShowToc() {
//     this.showToc = !this.showToc;
//   }

//   private eventsRegister() {

//     this.isResizing = false;

//     this.dvTocResizerState$.value?.addEventListener("mousedown", this.mouseDownHandler);
//     this.dvTocState$.value?.addEventListener("mousemove", this.mouseMoveHandler);
//     this.dvTocState$.value?.addEventListener("mouseup", this.mouseUpHandler);

//     // console.log(`Log: [DocsViewer] eventsRegistered finished`);

//   }

//   private eventsRemove() {

//     this.dvTocResizerState$.value?.removeEventListener("mousedown", this.mouseDownHandler);
//     this.dvTocState$.value?.removeEventListener("mousemove", this.mouseMoveHandler);
//     this.dvTocState$.value?.removeEventListener("mouseup", this.mouseUpHandler);
//   }


//   private onMouseDown(e: MouseEvent) {

//     if (!this.dvToc || !this.dvTocResizer) return;
//     this.isResizing = true;
//     this.dvToc.nativeElement.style.cursor = "e-resize";
//     this.dvTocResizer.nativeElement.style.width = "10px";
//     this.dvTocResizer.nativeElement.style.background = "#4a87f8";
//     e.preventDefault();

//   }

//   private onMouseMove(e: MouseEvent) {

//     if (!this.dvToc || !this.dvTocResizer) return;
//     if (!this.isResizing) return;

//     this.dvTocResizer.nativeElement.style.width = "10px";
//     this.dvTocResizer.nativeElement.style.background = " #4a87f8";
//     const newWidth = e.clientX;
//     if (newWidth > 150 && newWidth < 500) {
//       this.dvToc.nativeElement.style.width = newWidth + "px";
//     }
//   }

//   private onMouseUp(e: MouseEvent) {

//     if (!this.dvToc || !this.dvTocResizer) return;
//     if (this.isResizing) {
//       this.isResizing = false;
//       this.dvToc.nativeElement.style.cursor = "";
//       this.dvTocResizer.nativeElement.style.background = "transparent";
//       this.dvTocResizer.nativeElement.style.width = "10px";

//     }
//   }

//   private onKeyDown(e: KeyboardEvent) {
//     if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
//       e.preventDefault();
//       const debugOverlay = document.querySelector('.dv-debug-overlay') as HTMLElement | null;
//       debugOverlay?.classList.toggle('hidden');
//       this.$showDebugOverlay.update(v => !v);
//       // console.log(`Log: [DocsViewer] keydown event`, e, `this.debugOverlay=`, debugOverlay);
//     }
//   }


// }
