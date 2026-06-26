// app/feature/docs-viewer/docs-viewer.ts

import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, input, signal, Inject, PLATFORM_ID, computed, Renderer2 } from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';

import { TocResizerDirective } from './toc-resizer.directive';
import { UldeDocsViewerBridge } from '../../ulde/integration/angular/ulde-docs-viewer-bridge.service';
import { UldeAngularService } from '../../ulde/integration/angular/ulde-angular.service';

import { TocEntry, ArtifactsPanelModel, DebugOverlayModel, TocNode } from '../../ulde/core/artifacts/ulde-artifacts';

import { ThemeName, ThemeService } from '../../core/services/theme.service';
import { ThemeToggle } from './theme-toggle';
import { ScrollService } from '../../core/services/scroll.service';
import { writeSessionState, readSessionState } from '../../core/services/session-state.manage';
import { OverlayManager } from '../../core/services/overlay-manager.service';
import { ScrollSpyController } from '../../core/services/scrollspy-controller';


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

  private cleanupFn: (() => void) | null = null;
  private finalHtml: string | null = null;
  private rafPending = false;

  // ScrollSpy
  private scrollSpy = new ScrollSpyController();
  private scrollSpyDebounce: any = null;
  private lastSpyId: string | null = null;
  private lastScrollTop = 0;
  private scrollDirection: 'up' | 'down' | null = null;

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
      // check refresh (, reload, too)
      let id: string | null = null;
      this.restoreFromSessionState().then(b => {
        if (b) { // refreshed
          const { docId, prevDocId } = readSessionState(this.$isBrowser());
          if (!docId || !prevDocId) return;
          id = docId;
          this.$prevDocId.set(prevDocId);
          this.$currentDocId.set(id);
        } else {
          id = this.$inputDocId();
          if (!id) return;
          writeSessionState({ docId: id, prevDocId: id }, this.$isBrowser());
          this.$prevDocId.set(id);
          this.$currentDocId.set(id);
        }

      });

      // if (id) {
      //   // this.previousDocId = id;
      //   writeSessionState({ docId: id, prevDocId: id }, this.$isBrowser());
      //   this.$prevDocId.set(id);
      //   this.$currentDocId.set(id);
      // }

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
        // const key = `ulde:scrollpos:${id}`;
        // const saved = Number(localStorage.getItem(key) ?? 0);
        // const { scrollPos } = readSessionState(this.$isBrowser())
        // this.$savedScrollTop.set(scrollPos);
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
        docId: this.$currentDocId(),
        reload: this.$currentReload(),
        html: result.finalHtml,
        onScrollSpy: e => this.handleScrollSpy(e),
        onScrollPos: e => this.handleScrollPos(e),
        onNavigate: newDocId => this.handleNavigate(newDocId)
      });

      // Ensure ScrollSpy is active
      // this.scrollSpy.allow();

      // Restore scroll + hide overlays
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          queueMicrotask(() => {

            // this.restoreFromSessionState();

            const { scrollPos } = readSessionState(this.$isBrowser())
            this.hostWrapperRef.nativeElement.scrollTop = scrollPos;

            // const pos = this.$savedScrollTop();
            // this.hostWrapperRef.nativeElement.scrollTop = pos;

            this.scrollSpy.allow();

            this.overlay.hide(this.tocOverlayRef);
            this.overlay.hide(this.hostOverlayRef);
          });
        });
      });

      this.$dvTocRef.set(this.dvTocRef);
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
    // this.removeScrollListener = this.renderer.listen(
    //   document,
    //   'scroll',
    //   (event: Event) => this.onScroll(event),
    // );
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

  private async restoreFromSessionState(): Promise<boolean> {
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
        scrollPos: 0,
        prevScrollPos: 0,
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

      const scrollPos = state.scrollPos ?? 0;

      writeSessionState({ refreshed: false }, this.$isBrowser());

      this.scrollService.setPosition(docId, scrollPos, 0);

      this.$currentDocId.set(docId);
      // this.$reload.update(n => n + 1);
      console.log(`Log: ${this.component} restoreFromSessionState() DocsViewer \nRefreshed ${state.refreshed}, \nRestored docId=${docId}, \nRestored scrollPos=${scrollPos}`);

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
    // this.previousDocId = this.$currentDocId();

    const { scrollPos } = readSessionState(this.$isBrowser());
    writeSessionState({ docId: 'docs/index', prevDocId: this.$currentDocId(), scrollPos: 0, prevScrollPos: scrollPos }, this.$isBrowser());
    this.$prevDocId.set(this.$currentDocId());
    this.$currentDocId.set('docs/index');
  }

  reloadDoc() {
    this.$currentReload.set(true);
  }

  backToPrevDoc() {

    const { docId, prevDocId, scrollPos, prevScrollPos } = readSessionState(this.$isBrowser());
    writeSessionState({ docId: prevDocId, prevDocId: docId, scrollPos: prevScrollPos, prevScrollPos: scrollPos }, this.$isBrowser());

    this.$prevDocId.set(docId as string);
    // this.$savedScrollTop.set(prevScrollPos);
    this.$currentDocId.set(prevDocId as string);


  }

  // ScrollSpy handler
  private handleScrollSpy(e: any) {
    // console.log(`Log: ${component} handleScrollSpy \nheading id=`, id, `scrollSpy.isSuppressed()=`, this.scrollSpy.isSuppressed());

    if (this.scrollSpy.isSuppressed()) return;

    this.$activeHeading.set(e.detail.id);
  }

  private handleScrollPos(e: any) {
    const pos = e.detail.scrollTop;
    const height = e.detail.scrollHeight;

    // this.$savedScrollTop.set(pos);

    // const key = `ulde:scrollpos:${this.$currentDocId()}`;
    // localStorage.setItem(key, String(pos));

    if (!this.rafPending) this.rafPending = true;

    requestAnimationFrame(() => {
      console.log(`Log: ${this.component} handleScrollPos pos=`, pos);
      this.scrollService.setPosition(this.$currentDocId(), pos, height);
      writeSessionState({ scrollPos: pos }, this.$isBrowser());
      // this.$savedScrollTop.set(pos);
      // writeSessionState({ docId: this.$currentDocId(), scrollPos: pos }, this.$isBrowser());
      this.rafPending = false;
    });
  }

  private handleNavigate(id: string) {
    const { scrollPos } = readSessionState(this.$isBrowser());
    writeSessionState({ docId: id, prevDocId: this.$currentDocId(), scrollPos: 0, prevScrollPos: scrollPos }, this.$isBrowser());
    this.$prevDocId.set(this.$currentDocId());
    this.$currentDocId.set(id);
  }

  // Scroll to heading
  scrollTo(slug: string) {
    const el = document.getElementById(slug);
    if (!el) return;

    this.scrollSpy.suppress();

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.highlightElement(el);

    console.log(`Log: ${this.component} scrollTo  final top=`, Number(el.scrollTop.toFixed(2)));

    const wrapper = this.hostWrapperRef.nativeElement;
    this.scrollSpy.detectScrollEnd(wrapper, () => {
      this.activateClickedTocItem(this.$tocTree(), slug);
      this.scrollSpy.allow();
    });
  }

  private highlightElement(el: HTMLElement) {
    el.classList.add('inline-highlight');
    setTimeout(() => el.classList.remove('inline-highlight'), 700);
  }

  private activateClickedTocItem(nodes: TocNode[], slug: string) {
    for (const node of nodes) {
      if (node.entry.slug === slug) {

        // const el = document.getElementById(slug);
        // el?.classList.add('active-heading');

        this.$activeHeading.set(slug);
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


