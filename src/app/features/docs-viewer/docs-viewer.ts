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

import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, input, signal, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UldeDocsViewerBridge } from '../../ulde/integration/angular/ulde-docs-viewer-bridge.service';
import { UldeAngularService, UldeRunResult } from '../../ulde/integration/angular/ulde-angular.service';
import { ArtifactsPanelModel, TocEntry } from '../../ulde/core/artifacts/ulde-artifacts';
import { DebugOverlayModel } from '../../ulde/core/artifacts/ulde-artifacts';
import { ThemeService } from '../../core/services/theme.service';
import { abort } from 'process';
// import { isBrowser } from '../../global.utils/global.utils';

import { CURRENT_THEME } from '../../core/tokens/theme.token';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  templateUrl: './docs-viewer.html'
})
export class DocsViewer implements AfterViewInit, OnDestroy {

  $docId = input<string>('');
  $reload = input<boolean>(false);
  $isBrowser = signal<boolean>(false);

  private cleanupFn: (() => void) | null = null;
  // Internal writable signals
  private $currentDocId = signal('');
  private $currentReload = signal(false);

  private finalHtml: string | null = null;

  // Placeholder TOC (will be replaced by ULDE TOC later)
  toc: TocEntry[] = [];
  $activeHeading = signal<string | null>(null);

  debugOverlay: DebugOverlayModel | null = null;
  $showDebugOverlay = signal(false);
  @ViewChild('debugOverlayHost') debugOverlayHost?: ElementRef<HTMLElement>;

  // artifactsPanel: any = null;
  artifactsPanel: ArtifactsPanelModel | null = null;
  $showArtifacts = signal(false);
  @ViewChild('artifactsHost') artifactsHost?: ElementRef<HTMLElement>;

  // @ViewChild('docsViewer', { static: true }) hostRef!: ElementRef<HTMLElement>;
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;

  private dvToc: HTMLElement | undefined = undefined;
  // @ViewChild('dvToc', { static: true }) dvToc!: ElementRef<HTMLElement>;

  private dvTocResizer: HTMLElement | null = null; undefined = undefined;
  // @ViewChild('dvTocResizer', { static: true }) dvTocResizer!: ElementRef<HTMLElement>;
  private isResizing!: boolean;
  private mouseDownHandler = this.onMouseDown.bind(this);
  private mouseMoveHandler = this.onMouseMove.bind(this);
  private mouseUpHandler = this.onMouseUp.bind(this);


  private readonly _tocResult$ = new BehaviorSubject<TocEntry[] | []>([]);
  readonly tocResult$ = this._tocResult$.asObservable();


  constructor(
    private bridge: UldeDocsViewerBridge,
    private ulde: UldeAngularService,
    private theme: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {

    this.$isBrowser.set(isPlatformBrowser(this.platformId));
    if (!this.$isBrowser()) return;
    // React to ULDE pipeline results
    // if (this.$isBrowser()) {
    this.ulde.result$.subscribe(result => {
      if (!result) return;

      const html = this.finalHtml = result.finalHtml;
      // const html = result.finalHtml;
      // console.log(`Log: [DocsViewer] contructor  result.finalHtml=`, html);
      // NEW: store debug + artifacts
      this._tocResult$.next(result.toc ?? []);
      // this.toc = result.toc ?? [];
      // console.log(`Log: [DocsViewer] toc lenghth=`, this.toc.length, this.toc)

      this.debugOverlay = result.debugOverlay;
      // console.log(`Log: [DocsViewer] contructor debugOverlay=`, result.debugOverlay);

      // if (this.debugOverlayHost && result.debugOverlay?.html) {
      //   this.debugOverlayHost.nativeElement.innerHTML = result.debugOverlay?.html
      // }

      this.artifactsPanel = result.artifactsPanel;

      // if (this.artifactsHost && result.artifactsPanel) {
      //   this.artifactsHost.nativeElement.innerHTML = result.finalHtml;
      // }
      // if (this.artifactsHost && result.artifactsPanel) {
      //   this.artifactsHost.nativeElement.innerHTML =html;
      // }

      // console.log(`Log: [DocsViewer] contructor result=`, result.finalHtml);

      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      }

      // console.log(`Log: [DocsViewer] result$ subscribe this.hostRef.nativeElement=`, this.hostRef.nativeElement);

      this.cleanupFn = this.bridge.run({
        host: this.hostRef.nativeElement,
        docId: this.$currentDocId(),
        reload: this.$currentReload(),
        html,
        onScrollSpy: (id: string) => {
          this.$activeHeading.set(id);
        },
        onNavigate: (newDocId: string) => {
          this.$currentDocId.set(newDocId);
          this.$currentReload.set(true);
        }
      });

    });

    // Add keyboard shortcut
    if (this.$isBrowser() === true) {

      this.dvToc = document.querySelector('.dv-toc') as HTMLElement;
      this.dvTocResizer = document.querySelector('.dv-toc_resizer') as HTMLElement;
      // const theme = inject(CURRENT_THEME);
      // (window as any).__APP_THEME__ = this.theme;
      console.log(`Log: [DocsViewer] ngAfterViewInit `, this.dvToc, this.dvTocResizer);

      document.addEventListener('keydown', (e) => {
        // e.preventDefault();
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
          e.preventDefault();
          const debugOverlay = document.querySelector('.dv-debug-overlay') as HTMLElement | null;
          debugOverlay?.classList.toggle('hidden');
          this.$showDebugOverlay.update(v => !v);
          // console.log(`Log: [DocsViewer] keydown event`, e, `this.debugOverlay=`, debugOverlay);
        }
      });
    }


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
      if (id && this.$isBrowser()) {
        // if (id && this.$isBrowser()) {

        this.loadAndRender(id);
      }
    });

  }

  ngAfterViewInit(): void {
    if (!this.$isBrowser()) return;

    // this.dvToc = document.querySelector('.dv-toc') as HTMLElement;
    // this.dvTocResizer = document.querySelector('.dv-toc_resizer') as HTMLElement;
    console.log(`Log: [DocsViewer] ngAfterViewInit `, this.dvToc, this.dvTocResizer);
    requestAnimationFrame(() => {

      requestAnimationFrame(() => {
        this.tocResult$.subscribe((toc) => {
          if (toc.length === 0) return;
          this.dvToc?.classList.remove('hidden');

          this.toc = toc;
          console.log(`Log: [DocsViewer] ngAfterViewInit toc=`, toc);
          // if (this.toc.length > 0) {
          //   const dvToc = document.querySelector('.dv-toc') as HTMLElement;
          //   dvToc.classList.remove('hidden');
          //   console.log(`Log: [DocsViewer] ngAfterViewInit toc=`, toc);
          // }


          // requestAnimationFrame(() => {
          //   requestAnimationFrame(() => {
          //     // this.domHost.attach(uldeLayoutMain, this.injector);
          //     this.eventsRegister();
          //     // this.restoreScroll(this.$inputDocId(), uldeLayoutMain);

        });
      });


    });


    // requestAnimationFrame(() => {
    //   requestAnimationFrame(() => {
    //     // this.domHost.attach(uldeLayoutMain, this.injector);
    //     this.eventsRegister();
    //     // this.restoreScroll(this.$inputDocId(), uldeLayoutMain);

    //   });
    // });
    this.eventsRegister();
  }




  ngOnDestroy(): void {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }

    this.eventsRemove();
  }

  private async loadAndRender(docId: string) {
    // const url = `assets/docs/${docId}.md`;
    const url = `assets/${docId}.md`;
    let markdown: string = '';

    try {
      const response = await fetch(url);
      // console.log(`Log:`, response)
      if (response.redirected) {
        this.hostRef.nativeElement.innerHTML = `
        <div class="page-not-found">
          <h1>Page not found</h1>
          <p><strong>Invalid Url = ${url} </strong></p>
        </div>
        `;

        throw new Error(`HTTP error! Status: ${url} is wrong`);
      }
      // Parse JSON safely
      markdown = await response.text();
      await this.ulde.renderMarkdown(markdown);

    } catch (e) {
      console.error(`Error: [DocsViewer] loadAndRender \nurl=`, url, e);
      // throw e;
    }


  }

  // Navigate back to index (placeholder)
  backToIndex() {
    // Temporary: navigate to a known doc or index page
    this.$currentDocId.set('docs/index');
    // this.$currentDocId.set('docs/APPREADME'); // test
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
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }

  toggleArtifacts() {
    const artifactsPanel = document.querySelector('.dv-artifacts-panel') as HTMLElement | null;
    artifactsPanel?.classList.toggle('hidden');
    this.$showArtifacts.update(v => !v);
  }


  async onToggleTheme() {
    this.theme.toggleTheme();
    // reload to mermaid theme
    // this.reloadDoc();
    // re-run browser dom plugins to update mermaid theme
    await this.bridge.host.run(this.hostRef.nativeElement, this.finalHtml as string)
  }


  private eventsRegister() {

    this.isResizing = false;

    this.dvTocResizer?.addEventListener("mousedown", this.mouseDownHandler);
    // this.dvTocResizer.nativeElement.addEventListener("mousedown", this.mouseDownHandler);
    this.dvToc?.addEventListener("mousemove", this.mouseMoveHandler);
    // this.dvToc.nativeElement.addEventListener("mousemove", this.mouseMoveHandler);
    this.dvToc?.addEventListener("mouseup", this.mouseUpHandler);
    // this.dvToc.nativeElement.addEventListener("mouseup", this.mouseUpHandler);

    console.log(`Log: [DocsViewer] eventsRegistered finished`);

    // this.uldeLayoutMain?.nativeElement.addEventListener('ulde-link-click', this.uldeLinkClickHandler);
    // this.uldeLayoutMain?.nativeElement.addEventListener('ulde-scroll', this.uldeScrollHandler);

  }

  private eventsRemove() {
    if (this.dvTocResizer) {

      this.dvTocResizer.removeEventListener("mousedown", this.mouseDownHandler);
    }
    // this.dvTocResizer.nativeElement.removeEventListener("mousedown", this.mouseDownHandler);
    if (this.dvToc) {
      this.dvToc.removeEventListener("mousemove", this.mouseMoveHandler);
      // this.dvToc.nativeElement.removeEventListener("mousemove", this.mouseMoveHandler);
      this.dvToc.removeEventListener("mouseup", this.mouseUpHandler);
    }
    // this.dvToc.nativeElement.removeEventListener("mouseup", this.mouseUpHandler);

    // this.uldeLayoutMain?.nativeElement.removeEventListener('ulde-link-click', this.uldeLinkClickHandler);
    // this.uldeLayoutMain?.nativeElement.removeEventListener('ulde-scroll', this.uldeScrollHandler);


  }

  private onMouseDown(e: MouseEvent) {

    if (!this.dvToc || !this.dvTocResizer) return;
    this.isResizing = true;
    this.dvToc.style.cursor = "e-resize";
    // this.dvToc.nativeElement.style.cursor = "e-resize";
    this.dvTocResizer.style.width = "10px";
    // this.dvTocResizer.nativeElement.style.width = "10px";
    this.dvTocResizer.style.background = "#4a87f8";
    // this.dvTocResizer.nativeElement.style.background = "#4a87f8";
    e.preventDefault();

  }

  private onMouseMove(e: MouseEvent) {

    if (!this.dvToc || !this.dvTocResizer) return;
    if (!this.isResizing) return;

    this.dvTocResizer.style.width = "10px";
    // this.dvTocResizer.nativeElement.style.width = "10px";
    this.dvTocResizer.style.background = " #4a87f8";
    // this.dvTocResizer.nativeElement.style.background = " #4a87f8";
    const newWidth = e.clientX;
    if (newWidth > 150 && newWidth < 500) { // min/max width
      this.dvToc.style.width = newWidth + "px";
      // this.dvToc.nativeElement.style.width = newWidth + "px";
    }
  }

  private onMouseUp(e: MouseEvent) {

    if (!this.dvToc || !this.dvTocResizer) return;
    if (this.isResizing) {
      this.isResizing = false;
      this.dvToc.style.cursor = "";
      // this.dvToc.nativeElement.style.cursor = "";
      this.dvTocResizer.style.background = "transparent";
      // this.dvTocResizer.nativeElement.style.background = "transparent";
      this.dvTocResizer.style.width = "10px";
      // this.dvTocResizer.nativeElement.style.width = "10px";

    }
  }


}
