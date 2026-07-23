// app/feature/docs-viewer/docs-viewer.ts

import { Component, ElementRef, ViewChild, effect, input, signal, Inject, PLATFORM_ID, computed, Renderer2 } from '@angular/core';
import type { AfterViewInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';

import { TocResizerDirective } from './toc-resizer.directive';
import { UldeDocsViewerBridge } from '../ulde/integration/angular/ulde-docs-viewer-bridge.service';
import { UldeAngularService } from '../ulde/integration/angular/ulde-angular.service';

import type { TocEntry, ArtifactsPanelModel, DebugOverlayModel, TocNode } from '../ulde/core/artifacts/ulde-artifacts';

import { ThemeService } from './services/theme.service';
import type { ThemeName } from './services/theme.service';
import { ThemeToggle } from './theme-toggle';
import { ScrollService } from './services/scroll.service';
import { writeSessionState, readSessionState } from './services/session-state.manage';
import { OverlayManager } from './services/overlay-manager.service';
import { ScrollSpyController } from './services/scrollspy-controller';


@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  imports: [ThemeToggle, TocResizerDirective, NgTemplateOutlet,],
  templateUrl: './docs-viewer.html'
})
export class DocsViewer implements AfterViewInit, OnDestroy {

  private readonly component: string = '[DocsViewer]';

  // External inputs
  $inputDocId = input<string>('');
  $reload = input<boolean>(false);

  // Internal state
  $currentDocId = signal('');
  $prevDocId = signal('');
  private $currentReload = signal(false);

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

  $debugOverlay = signal<DebugOverlayModel | null>(null);
  $artifactsPanel = signal<ArtifactsPanelModel | null>(null);

  // UI state
  $activeHeading = signal<string | null>(null);
  $showDebugOverlay = signal(false);
  $showArtifacts = signal(false);
  $showDebugMermaid = signal(false);
  $isMermaidPanelFilled = signal(true);
  $dvTocRef = signal<ElementRef<HTMLElement> | undefined>(undefined);
  $savedScrollTop = signal(0);
  $isBrowserRefreshed = signal<boolean | null>(null);

  private cleanupFn: (() => void) | null = null;
  private finalHtml: string | null = null;
  private rafPending = false;

  // ScrollSpy
  private scrollSpy = new ScrollSpyController();

  private removeBeforeUnloadListener?: () => void;

  @ViewChild('hostWrapper', { static: true })
  hostWrapperRef!: ElementRef<HTMLElement>;

  @ViewChild('hostOverlay', { static: true })
  hostOverlayRef!: ElementRef<HTMLElement>;

  @ViewChild('dvToc', { static: false })
  dvTocRef!: ElementRef<HTMLElement>;

  @ViewChild('tocOverlay', { static: false })
  tocOverlayRef?: ElementRef<HTMLElement>;

  constructor(
    private bridge: UldeDocsViewerBridge,
    private ulde: UldeAngularService,
    private theme: ThemeService,
    public scrollService: ScrollService,
    private overlay: OverlayManager,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    // Detect browser
    this.$isBrowser.set(isPlatformBrowser(this.platformId));
    if (!this.$isBrowser()) return;

    this.initGlobalListeners();
    this.ensureInitialSessionState();

    // Sync external docId → internal
    effect(() => {
      if (!this.$isBrowserRefreshed()) return; // avoid to react to initial value
      // check refresh (, reload, too)
      let id: string | null = null;
      // this.restoreFromSessionState().then(b => {
      if (this.$isBrowserRefreshed()) { // refreshed
        const { docId, prevDocId } = readSessionState(this.$isBrowser());
        if (!docId || !prevDocId) return;
        id = docId;
        console.log(`Log: ${this.component} effect refresh \n docid=`, id,);
        this.$prevDocId.set(prevDocId);
        this.$currentDocId.set(id);
      } else {
        id = this.$inputDocId();
        if (!id) return;
        console.log(`Log: ${this.component} effect first load \n docid=`, id,);
        writeSessionState({ docId: id, prevDocId: id }, this.$isBrowser());
        this.$prevDocId.set(id);
        this.$currentDocId.set(id);
      }

    });

    // Sync reload flag
    effect(() => {
      if (this.$reload()) {
        this.$currentReload.set(true);
      }
    });

    // React to docId changes
    effect(() => {
      const id = this.$currentDocId();
      if (id && this.$isBrowser()) {

        console.log(`Log: ${this.component} effect React to docId changes \n docid=`, id,);

        this.loadAndRender(id);
      }
    });

    // React to reload
    effect(() => {
      if (this.$currentReload() && this.$isBrowser()) {
        this.loadAndRender(this.$currentDocId());
      }
    });

    // VS Code auto-expand behavior
    effect(() => {
      const active = this.$activeHeading();
      const tree = this.$tocTree();

      if (!tree.length) return;

      if (!active) {
        // First load → expand everything
        tree.forEach(n => n.collapsed = false);
        return;
      }

      this.updateTocCollapseState(tree, active);
    });

    // ULDE pipeline subscription
    this.ulde.result$.subscribe(result => {
      if (!result) return;

      this.finalHtml = result.finalHtml;

      // Show overlays
      this.overlay.show(this.tocOverlayRef);
      this.overlay.show(this.hostOverlayRef);

      // Update TOC + debug
      this.$toc.set(result.toc ?? []);
      this.$debugOverlay.set(result.debugOverlay);
      this.$artifactsPanel.set(result.artifactsPanel);

      // Cleanup previous host
      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      }

      // Run ULDE host
      this.cleanupFn = this.bridge.run({
        host: this.hostWrapperRef.nativeElement,
        html: result.finalHtml,
        onScrollSpy: id => this.handleScrollSpy(id),
        onScrollTop: e => this.handleScrollTop(e),
        onNavigate: docId => this.handleNavigate(docId)
      });

      const { scrollTop } = readSessionState(this.$isBrowser());

      this.$dvTocRef.set(this.dvTocRef);

      this.overlay.hide(this.tocOverlayRef);
      this.overlay.hide(this.hostOverlayRef);


      requestAnimationFrame(() => {
        requestAnimationFrame(() => {

          this.hostWrapperRef.nativeElement.scrollTop = scrollTop;

          this.scrollSpy.allow();

        });
      });

    });
  }

  // VS Code auto-expand logic
  private updateTocCollapseState(tree: TocNode[], activeSlug: string | null) {
    const visit = (node: TocNode): boolean => {
      const isSelfActive = node.entry.slug === activeSlug;
      const hasActiveDesc = node.children.some(child => visit(child));

      node.collapsed = !(isSelfActive || hasActiveDesc);
      return isSelfActive || hasActiveDesc;
    };

    tree.forEach(root => visit(root));
  }

  ngAfterViewInit() {
    if (!this.$isBrowser()) return;

    this.$isBrowserRefreshed.set(this.restoreFromSessionState());

  }

  ngOnDestroy() {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }

    if (this.removeBeforeUnloadListener) {
      this.removeBeforeUnloadListener();
      this.removeBeforeUnloadListener = undefined;
    }

  }

  private ensureInitialSessionState(): void {
    // Ensure there is at least a baseline state
    const state = readSessionState(this.$isBrowser());
    // console.log(`Log: ${this.component} nsureInitialSessionState() \nstate=${JSON.stringify(state, null, 2)}`);

    writeSessionState(state, this.$isBrowser());

  }


  private initGlobalListeners(): void {
    // Before unload: mark refresh
    this.removeBeforeUnloadListener = this.renderer.listen(
      window,
      'beforeunload',
      (event: BeforeUnloadEvent) => this.onBeforeUnload(event),
    );
  }


  private onBeforeUnload(event: BeforeUnloadEvent): void {
    // Mark that a refresh/unload is happening
    writeSessionState({ refreshed: true }, this.$isBrowser());

    // Optionally: let ScrollService push last scrollPos into sessionState
    // before unload, or keep that responsibility entirely on scroll events.
  }


  // -------------------------
  // Refresh / restore logic
  // -------------------------

  private restoreFromSessionState(): boolean {

    const state = readSessionState(this.$isBrowser());

    // console.log(`Log: ${this.component} restoreFromSessionState() \nstate=${JSON.stringify(state, null, 2)}`);

    if (!state.refreshed) {
      // Normal start - show DocsViewer template which is main screen
      return state.refreshed;
    }

    // Refresh flow
    if (state.selector === 'app-root') {
      // Refreshed while on App: just clear refreshed flag
      writeSessionState({
        docId: 'docs/index',
        prevDocId: 'docs/index',
        scrollTop: 0,
        prevScrollTop: 0,
        refreshed: false,
        docTheme: 'dark',
      },
        this.$isBrowser()
      );

      return state.refreshed;
    }

    if (state.selector === 'app-docs-viewer') {
      // Refreshed while viewing DocsViewer: restore doc + scroll
      const docId = state.docId ?? 'docs/index';

      const scrollTop = state.scrollTop ?? 0;


      this.scrollService.setPosition(docId, scrollTop, 0);

      writeSessionState({ refreshed: false }, this.$isBrowser());
      // writeSessionState({ docId: docId, scrollTop: scrollTop, refreshed: false }, this.$isBrowser());

      console.log(`Log: ${this.component} restoreFromSessionState() DocsViewer \nRefreshed ${state.refreshed}, \nRestored docId=${docId}, \nRestored scrollPos=${scrollTop}`);

      return state.refreshed;
    }

    // Fallback: no opinion, just clear refresh bit
    writeSessionState({ refreshed: false }, this.$isBrowser());
    return false;
  }


  // Load markdown
  private async loadAndRender(docId: string) {

    console.log(`Log: ${this.component} loadAndRender \nid=`, docId);

    const url = `assets/${docId}.md`;

    try {
      const response = await fetch(url);

      if (response.redirected) {
        this.hostWrapperRef.nativeElement.innerHTML = `
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
      console.error('${component} loadAndRender error:', err);
    }
  }

  // Navigation
  backToIndex() {

    const { scrollTop } = readSessionState(this.$isBrowser());
    writeSessionState({ docId: 'docs/index', prevDocId: this.$currentDocId(), scrollTop: 0, prevScrollTop: scrollTop }, this.$isBrowser());
    this.$prevDocId.set(this.$currentDocId());
    this.$currentDocId.set('docs/index');
  }

  reloadDoc() {
    this.$currentReload.set(true);
  }

  backToPrevDoc() {

    if (!this.scrollSpy.isSuppressed()) {
      // console.log(`Log: ${this.component} backToPrevDoc() \this.scrollSpy.suppress()`);

      this.scrollSpy.suppress();
    }

    const { docId, prevDocId, scrollTop, prevScrollTop } = readSessionState(this.$isBrowser());
    writeSessionState({ docId: prevDocId, prevDocId: docId, scrollTop: prevScrollTop, prevScrollTop: scrollTop }, this.$isBrowser());

    console.log(`Log: ${this.component} backToPrevDoc() \n prevDocid=`, prevDocId, `\nprevScrollTop=`, prevScrollTop);

    this.$prevDocId.set(docId as string);

    // this.scrollSpy.suppress();
    this.$currentDocId.set(prevDocId as string);

  }

  // ScrollSpy handler
  private handleScrollSpy(id: string) {

    if (this.scrollSpy.isSuppressed()) return;

    this.$activeHeading.set(id);

  }

  private handleScrollTop(e: any) {

    const scrollTop = e.detail.scrollTop;
    const height = e.detail.scrollHeight;

    if (!this.rafPending) this.rafPending = true;

    requestAnimationFrame(() => {

      this.scrollService.setPosition(this.$currentDocId(), scrollTop, height);
      writeSessionState({ scrollTop: scrollTop }, this.$isBrowser());

      this.rafPending = false;

    });


  }

  // internald docId routing
  private handleNavigate(docId: string) {

    requestAnimationFrame(() => {

      const { scrollTop } = readSessionState(this.$isBrowser());

      writeSessionState({ docId: docId, prevDocId: this.$currentDocId(), scrollTop: 0, prevScrollTop: scrollTop }, this.$isBrowser());

      this.$prevDocId.set(this.$currentDocId());
      this.$currentDocId.set(docId);

    });

  }

  // Scroll to heading
  scrollTo(slug: string) {
    const el = document.getElementById(slug);
    if (!el) return;

    this.scrollSpy.suppress();

    queueMicrotask(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.highlightElement(el);
    });

    this.scrollSpy.detectScrollEnd(this.hostWrapperRef.nativeElement, () => {
      this.activateClickedTocItem(this.$tocTree(), slug);

      this.scrollSpy.allow();


    });


  }

  private highlightElement(el: HTMLElement) {
    el.classList.add('inline-highlight');
    setTimeout(() => {
      el.classList.remove('inline-highlight');
      console.log(`Log: [DocsViewer] highlightElement()`);
    },
      700);
  }

  private activateClickedTocItem(tree: TocNode[], slug: string) {
    for (const node of tree) {
      if (node.entry.slug === slug) {

        this.$activeHeading.set(slug);
        return;
      }
      this.activateClickedTocItem(node.children, slug);
    }
  }

  // Build TOC tree
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

      if (!stack.length) root.push(node);
      else stack[stack.length - 1].children.push(node);

      stack.push(node);
    }

    return root;
  }

  isParentOfActive(item: TocEntry, toc: TocEntry[], activeSlug: string | null): boolean {
    const activeIndex = toc.findIndex(t => t.slug === activeSlug);
    if (activeIndex === -1) return false;

    const active = toc[activeIndex];
    return item.level < active.level && toc.indexOf(item) < activeIndex;
  }

  private isAncestor(node: TocNode, activeSlug: string | null): boolean {
    for (const child of node.children) {
      if (child.entry.slug === activeSlug) return true;
      if (this.isAncestor(child, activeSlug)) return true;
    }
    return false;
  }


  // Theme toggle
  async onToggleTheme(theme: ThemeName) {
    this.theme.toggleTheme(theme);
    if (this.finalHtml) {
      await this.bridge.host.run(
        this.hostWrapperRef.nativeElement,
        this.finalHtml
      );
    }
  }

  // UI toggles
  toggleArtifacts() {
    this.$showArtifacts.update(v => !v);
  }

  toggleDebugOverlay() {
    this.$showDebugOverlay.update(v => !v);
  }

  toggleDebugMermaid() {
    this.$showDebugMermaid.update(v => !v);
  }


}


