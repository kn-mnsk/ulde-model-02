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

import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, input, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UldeDocsViewerBridge } from '../../ulde/integration/angular/ulde-docs-viewer-bridge.service';
import { UldeAngularService, UldeRunResult } from '../../ulde/integration/angular/ulde-angular.service';
import { ArtifactsPanelModel, TocEntry } from '../../ulde/core/artifacts/ulde-artifacts';
import { DebugOverlayModel } from '../../ulde/core/artifacts/ulde-artifacts';
import { ThemeService } from '../../core/services/theme.service';
import { abort } from 'process';

// import { isBrowser } from '../../global.utils/global.utils';


@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  templateUrl: './docs-viewer.html'
})
export class DocsViewer implements AfterViewInit, OnDestroy {

  $docId = input<string>('');
  $reload = input<boolean>(false);
  private $isBrowser = signal<boolean>(false);

  private cleanupFn: (() => void) | null = null;
  // Internal writable signals
  private $currentDocId = signal('');
  private $currentReload = signal(false);

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

  constructor(
    private bridge: UldeDocsViewerBridge,
    private ulde: UldeAngularService,
    private theme: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {

    this.$isBrowser.set(isPlatformBrowser(this.platformId));

    // React to ULDE pipeline results
    // if (this.$isBrowser()) {
    this.ulde.result$.subscribe(result => {
      if (!result) return;

      const html = result.finalHtml;
      // console.log(`Log: [DocsViewer] contructor  result.finalHtml=`, html);
      // NEW: store debug + artifacts
      this.toc = result.toc ?? [];
      console.log(`Log: [DocsViewer] toc lenghth=`, this.toc.length, this.toc)

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
    if (this.$isBrowser()) {
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

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
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


    // await fetch(url).then((response: Response) => {
    //   if (response.status !== 200) {
    //     console.error(`Error: [DocsViewer] loadAndRender \nurl=`, url,);

    //   }
    //   return response.text();
    // })
    //   .then((text: string) => {
    //     markdown = text;
    //     console.log(`Log: [DocsViewer] loadAndRender \nurl=`, url, `\nmarkdown=`, markdown);

    //   });



    // await this.ulde.renderMarkdown(markdown);


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
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleArtifacts() {
    const artifactsPanel = document.querySelector('.dv-artifacts-panel') as HTMLElement | null;
    artifactsPanel?.classList.toggle('hidden');
    this.$showArtifacts.update(v => !v);
  }


  onToggleTheme() {

    this.theme.toggleTheme();
  }

}
