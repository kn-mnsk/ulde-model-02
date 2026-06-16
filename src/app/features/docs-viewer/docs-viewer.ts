// app/feature/docs-viewer/docs-viewer.ts

import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, input, signal, Inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';

import { TocResizerDirective } from './toc-resizer.directive';
import { UldeDocsViewerBridge } from '../../ulde/integration/angular/ulde-docs-viewer-bridge.service';
import { UldeAngularService } from '../../ulde/integration/angular/ulde-angular.service';

import { TocEntry, ArtifactsPanelModel, DebugOverlayModel, TocNode } from '../../ulde/core/artifacts/ulde-artifacts';

import { ThemeService } from '../../core/services/theme.service';
import { ThemeToggle } from './theme-toggle';


@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  imports: [
    ThemeToggle, TocResizerDirective, NgTemplateOutlet
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
  $currentDocId = signal('');
  previousDocId: string = '';
  private $currentReload = signal(false);

  // Environment
  $isBrowser = signal(false);

  // ULDE outputs
  $toc = signal<TocEntry[]>([]);
  readonly $tocTree = computed(() => this.buildTocTree(this.$toc()));
  readonly $isParentActive = computed(() => {
    const toc = this.$toc();
    const active = this.$activeHeading();
    return (item: TocEntry) => this.isParentOfActive(item, toc, active);
  });

  readonly isParentActive = (node: TocNode) =>
    this.isAncestor(node, this.$activeHeading());


  // activeHeading = signal<string | null>(null);
  $debugOverlay = signal<DebugOverlayModel | null>(null);
  $artifactsPanel = signal<ArtifactsPanelModel | null>(null);


  // UI state
  $activeHeading = signal<string | null>(null);
  $showDebugOverlay = signal(false);
  $showArtifacts = signal(false);
  $showDebugMermaid = signal(false);
  $isMermaidPanelFilled = signal<boolean>(true);
  $showToc = signal(false);
  $dvTocRef = signal<ElementRef<HTMLElement> | undefined>(undefined);
  $savedScrollTop = signal(0);

  private cleanupFn: (() => void) | null = null;
  private scrollSpyHandler?: (e: any) => void;
  private finalHtml: string | null = null;

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;
  @ViewChild('dvToc', { static: false }) dvTocRef!: ElementRef<HTMLElement>;
  @ViewChild('overlay', { static: true }) hostOverlayRef!: ElementRef<HTMLElement>;

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
        // this.$previousDocId.set(this.$currentDocId());
        this.$currentDocId.set(id);
        // this.$currentReload.set(true);
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
      // this.previousDocId = id;
      if (id && this.$isBrowser()) {

        // Load saved scroll position
        const key = `ulde:scrollpos:${id}`;
        const saved = Number(localStorage.getItem(key) ?? 0);
        this.$savedScrollTop.set(saved);

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
      this.$toc.set(result.toc ?? []);
      this.$debugOverlay.set(result.debugOverlay);
      this.$artifactsPanel.set(result.artifactsPanel);

      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      }

      this.hostOverlayRef.nativeElement.classList.remove('hidden');

      this.cleanupFn = this.bridge.run({
        host: this.hostRef.nativeElement,
        docId: this.$currentDocId(),
        reload: this.$currentReload(),
        html: result.finalHtml,
        onScrollSpy: id => this.$activeHeading.set(id),
        onScrollPos: pos => this.$savedScrollTop.set(pos),
        onNavigate: newDocId => {
          this.$currentDocId.set(newDocId);
          // this.$currentReload.set(true);
        }
      });

      // 2. Attach ScrollSpy event listener
      this.attachScrollEvents();
      // Listen for scrollpos events

      // After rendering
      requestAnimationFrame(() => {
        // DOM mounted
        requestAnimationFrame(() => {
          // layout + paint complete
          queueMicrotask(() => {
            // scrollTop applied after paint

            const pos = this.$savedScrollTop();
            this.hostRef.nativeElement.scrollTop = pos;

            // Fade out overlay
            this.hostOverlayRef.nativeElement.classList.add('hidden');
          });
        });
      });

      this.$dvTocRef.set(this.dvTocRef);
      // this.checkMermaidPanelContent()
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

    if (this.scrollSpyHandler) {
      this.hostRef.nativeElement.removeEventListener(
        'ulde:scrollspy',
        this.scrollSpyHandler
      );
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

      // this.checkMermaidPanelContent()


    } catch (err) {
      console.error('[DocsViewer] loadAndRender error:', err);
    }
  }

  // Navigation
  backToIndex() {
    this.previousDocId = this.$currentDocId(); //
    this.$currentDocId.set('docs/index');
    // this.$currentReload.set(true);
  }

  reloadDoc() {
    this.$currentReload.set(true);
  }

  attachScrollEvents() {
    const host = this.hostRef?.nativeElement;
    if (!host) return;

    // ---------------------------------------------
    // 1. Heading activation
    // ---------------------------------------------

    host.addEventListener('ulde:scrollspy', (e: any) => {
      console.log(`Log: [DocsViewer] ulde:scrollspy event e=`, e.detail.id);
      this.$activeHeading.set(e.detail.id);
    });

    // ---------------------------------------------
    // 2. Scroll position
    // ---------------------------------------------
    host.addEventListener('ulde:scrollpos', (e: any) => {
      const pos = e.detail.scrollTop;
      this.$savedScrollTop.set(pos);
      // Persist per-doc scroll position
      const key = `ulde:scrollpos:${this.$currentDocId()}`;
      localStorage.setItem(key, String(pos));
    });


  }


  // Scroll to heading
  scrollTo(slug: string) {
    const el = document.getElementById(slug);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Optional: highlight the target
    this.highlightElement(el);
  }

  private highlightElement(el: HTMLElement) {
    el.classList.add('inline-highlight');
    setTimeout(() => el.classList.remove('inline-highlight'), 700);
  }


  // Theme toggle
  async onToggleTheme() {
    // console.log(`Log: [DocsViewer] theme isDark=`, isDark);
    this.theme.toggleTheme();
    if (this.finalHtml) {
      await this.bridge.host.run(this.hostRef.nativeElement, this.finalHtml);
      // await this.checkMermaidPanelContent()
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

  toggleDebugMermaid() {

    this.$showDebugMermaid.update(v => !v);
  }

  private buildTocTree(entries: TocEntry[]): TocNode[] {
    const root: TocNode[] = [];
    const stack: TocNode[] = [];

    for (const entry of entries) {
      const node: TocNode = {
        entry,
        children: [],
        collapsed: false
      };

      while (stack.length && stack[stack.length - 1].entry.level >= entry.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    }

    console.log(`Log: buildTocTree() root=`, root);

    return root;
  }

  isParentOfActive(item: TocEntry, toc: TocEntry[], activeSlug: string | null): boolean {
    const activeIndex = toc.findIndex(t => t.slug === activeSlug);
    if (activeIndex === -1) return false;

    const active = toc[activeIndex];

    // A parent has a lower level and appears before the active heading
    return item.level < active.level &&
      toc.indexOf(item) < activeIndex;
  }

  private isAncestor(node: TocNode, activeSlug: string | null): boolean {
    // console.log(`Log: [DocsViewer] isAncestor() node`,node);
    for (const child of node.children) {
      if (child.entry.slug === activeSlug) {
        // console.log(`Log: [DocsViewer] isAncestor() child.entry.slug === activeSlug=`, activeSlug);
        return true;
      }
      if (this.isAncestor(child, activeSlug)) {
        // console.log(`Log: [DocsViewer] this.isAncestor(child, activeSlug) `, child, activeSlug);
        return true;
      }
    }
    return false;
  }


}

