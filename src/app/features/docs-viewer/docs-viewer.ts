// app/feature/docs-viewer/docs-viewer.ts

import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, input, signal, Inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';

import { TocResizerDirective } from './toc-resizer.directive';
import { UldeDocsViewerBridge } from '../../ulde/integration/angular/ulde-docs-viewer-bridge.service';
import { UldeAngularService } from '../../ulde/integration/angular/ulde-angular.service';

import { TocEntry, ArtifactsPanelModel, DebugOverlayModel, TocNode } from '../../ulde/core/artifacts/ulde-artifacts';

import { ThemeService } from '../../core/services/theme.service';
import { ThemeToggle } from './theme-toggle';
import { ScrollService } from '../../core/services/scroll.service';
import { writeSessionState } from '../../core/services/session-state.manage';
import { OverlayManager } from '../../core/services/overlay-manager.service';
import { ScrollSpyController } from '../../core/services/scrollspy-controller';


@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  imports: [ThemeToggle, TocResizerDirective, NgTemplateOutlet],
  templateUrl: './docs-viewer.html'
})
export class DocsViewer implements AfterViewInit, OnDestroy {

  // External inputs
  $docId = input<string>('');
  $reload = input<boolean>(false);

  // Internal state
  $currentDocId = signal('');
  previousDocId = '';
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    // Detect browser
    this.$isBrowser.set(isPlatformBrowser(this.platformId));
    if (!this.$isBrowser()) return;

    // Sync external docId → internal
    effect(() => {
      const id = this.$docId();
      if (id) {
        this.previousDocId = id;
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
        const key = `ulde:scrollpos:${id}`;
        const saved = Number(localStorage.getItem(key) ?? 0);
        this.$savedScrollTop.set(saved);
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
      this.scrollSpy.allow();

      // Restore scroll + hide overlays
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          queueMicrotask(() => {
            const pos = this.$savedScrollTop();
            this.hostWrapperRef.nativeElement.scrollTop = pos;

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

  ngAfterViewInit() { }
  ngOnDestroy() {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
  }

  // Load markdown
  private async loadAndRender(docId: string) {
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
      console.error('[DocsViewer] loadAndRender error:', err);
    }
  }

  // Navigation
  backToIndex() {
    this.previousDocId = this.$currentDocId();
    this.$currentDocId.set('docs/index');
  }

  reloadDoc() {
    this.$currentReload.set(true);
  }

  backToPrevDoc() {
    const current = this.$currentDocId();
    this.$currentDocId.set(this.previousDocId);
    this.previousDocId = current;
  }

  // ScrollSpy handler
  private handleScrollSpy(e: any) {
    // console.log(`Log: [DocsViewer] handleScrollSpy \nheader id=`, id, `scrollSpy.isSuppressed()=`, this.scrollSpy.isSuppressed());

    if (this.scrollSpy.isSuppressed()) return;


    // const toc = this.$toc();
    // const currentId = id;
    // const currentIndex = toc.findIndex(t => t.slug === id);
    // const lastActivatedId = this.$activeHeading();
    // const lastActivatedIndex = toc.findIndex(t => t.slug === lastActivatedId);

    // this.$activeHeading.set(currentId);

    // console.log(`Log: [DocsViewer] handleScrollSpy this.scrollSpyDebounce \ncurrent Index=`, currentIndex, currentId, `\nlast index=`, lastActivatedIndex, lastActivatedId);

    clearTimeout(this.scrollSpyDebounce);


    this.scrollSpyDebounce = setTimeout(() => {

      const toc = this.$toc();

      const currentId = e.detail.id;
      const currentIndex = e.detail.index;

      let lastActivatedId = this.$activeHeading();
      if (!lastActivatedId) {
        lastActivatedId = currentId;
      }
      const lastActivatedIndex = toc.findIndex(t => t.slug === lastActivatedId);

      console.log(`Log: [DocsViewer] handleScrollSpy  event \ncurrent index=`, currentIndex, `\ncurrent id=`, currentId, `\nlastActivatedIndex=`, lastActivatedIndex, `\ntoc length=`, toc.length);


      if (currentIndex < 0 || lastActivatedIndex < 0) return;

      // console.log(`Log: [DocsViewer] handleScrollSpy this.scrollSpyDebounce \ncurrent Index=`, currentIndex, index, currentId, `\nlast index=`, lastActivatedIndex, lastActivatedId);

      let finalId = currentId;

      if (this.scrollDirection === 'down') {// down

        const next = toc[currentIndex + 1];
        if (next) finalId = next.slug;
      } else {
        const prev = toc[currentIndex]; // original
        // const prev = toc[currentIndex - 1]; // original
        if (prev) finalId = prev.slug;
      }

      // this.$activeHeading.set(currentId);
      this.$activeHeading.set(finalId);

      // this.lastSpyId = null;

    }, 0);

    // OLD VERSION
    // this.scrollSpyDebounce = setTimeout(() => {
    //   // console.log(`Log: [DocsViewer] handleScrollSpy this.scrollSpyDebounce \nlastSpyId=`, this.lastSpyId);


    //   if (this.lastSpyId !== id) {
    //     this.lastSpyId = id;
    //     return;
    //   }
    //   // console.log(`Log: [DocsViewer] handleScrollSpy this.scrollSpyDebounce \nlastSpyId=`, this.lastSpyId);

    //   const toc = this.$toc();
    //   let index = toc.findIndex(t => t.slug === id);
    //   if (index === -1) return;

    //   // // console.log(`Log: [DocsViewer] handleScrollSpy this.scrollSpyDebounce \ncurrent Index=`, index, id, `\nlast index=`, lastIndex, this.lastSpyId, `\nscrollDirection=`, this.scrollDirection);


    //   let finalId = id;

    //   if (this.scrollDirection === 'down') {
    //     const next = toc[index + 1];
    //     if (next) finalId = next.slug;
    //   } else if (this.scrollDirection === 'up') {
    //     const prev = toc[index - 1]; // original
    //     if (prev) finalId = prev.slug;
    //   }

    //   // console.log(`Log: [DocsViewer] handleScrollSpy this.scrollSpyDebounce \nlscrollDirection=`, this.scrollDirection, `\ncurrentIndex`, index, id, `\nlastIndex`, lastIndex, this.lastSpyId, `\nfinalId`, finalId,);


    //   this.$activeHeading.set(finalId);

    //   this.lastSpyId = null;

    // }, 50);

  }

  private handleScrollPos(e: any) {
    const pos = e.detail.scrollTop;

    // const lastScrollTop = this.$savedScrollTop();
    // this.scrollDirection = pos > lastScrollTop ? 'down' : pos < lastScrollTop ? 'up' : null;

    this.lastScrollTop = this.$savedScrollTop();
    this.scrollDirection = pos > this.lastScrollTop ? 'down' : 'up';
    this.lastScrollTop = pos;

    const height = e.detail.scrollHeight;

    this.$savedScrollTop.set(pos);
    const key = `ulde:scrollpos:${this.$currentDocId()}`;
    localStorage.setItem(key, String(pos));

    if (!this.rafPending) this.rafPending = true;

    requestAnimationFrame(() => {
      this.scrollService.setPosition(this.$currentDocId(), pos, height);
      writeSessionState({ scrollPos: pos }, this.$isBrowser());
      this.rafPending = false;
    });
  }

  private handleNavigate(id: string) {
    this.$currentDocId.set(id);
  }

  // Scroll to heading
  scrollTo(slug: string) {
    const el = document.getElementById(slug);
    if (!el) return;

    this.scrollSpy.suppress();

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.highlightElement(el);

    document.querySelectorAll('.active-heading')
      .forEach(el => el.classList.remove('active-heading'));

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
        const el = document.getElementById(slug);
        el?.classList.add('active-heading');
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
  async onToggleTheme() {
    this.theme.toggleTheme();
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



// OLD VERSION
// @Component({
//   selector: 'app-docs-viewer',
//   standalone: true,
//   imports: [
//     ThemeToggle, TocResizerDirective, NgTemplateOutlet
//   ],
//   templateUrl: './docs-viewer.html'
// })
// export class DocsViewer implements AfterViewInit, OnDestroy {
//   // External readonly inputs
//   $docId = input<string>('');
//   $reload = input<boolean>(false);

//   // Internal writable signals
//   $currentDocId = signal('');
//   previousDocId: string = '';
//   private $currentReload = signal(false);

//   // Environment
//   $isBrowser = signal(false);

//   // ULDE outputs
//   $toc = signal<TocEntry[]>([]);
//   readonly $tocTree = computed(() => this.buildTocTree(this.$toc()));
//   readonly $isParentActive = computed(() => {
//     const toc = this.$toc();
//     const active = this.$activeHeading();
//     return (item: TocEntry) => this.isParentOfActive(item, toc, active);
//   });

//   readonly isParentActive = (node: TocNode) =>
//     this.isAncestor(node, this.$activeHeading());

//   $debugOverlay = signal<DebugOverlayModel | null>(null);
//   $artifactsPanel = signal<ArtifactsPanelModel | null>(null);

//   // UI state
//   $activeHeading = signal<string | null>(null);
//   $showDebugOverlay = signal(false);
//   $showArtifacts = signal(false);
//   $showDebugMermaid = signal(false);
//   $isMermaidPanelFilled = signal<boolean>(true);
//   $dvTocRef = signal<ElementRef<HTMLElement> | undefined>(undefined);
//   $savedScrollTop = signal(0);

//   private cleanupFn: (() => void) | null = null;
//   private finalHtml: string | null = null;
//   private rafPending = false;

//   // scrollspy controller
//   private scrollSpy = new ScrollSpyController();

//   private scrollSpyDebounce: any = null;
//   private lastSpyId: string | null = null;
//   private lastScrollTop = 0;
//   private scrollDirection: 'up' | 'down' = 'down';

//   @ViewChild('hostWrapper', { static: true })
//   hostWrapperRef!: ElementRef<HTMLElement>;

//   @ViewChild('hostOverlay', { static: true })
//   hostOverlayRef!: ElementRef<HTMLElement>;

//   @ViewChild('dvToc', { static: false })
//   dvTocRef!: ElementRef<HTMLElement>;

//   @ViewChild('tocOverlay', { static: false })
//   tocOverlayRef?: ElementRef<HTMLElement>;

//   constructor(
//     private bridge: UldeDocsViewerBridge,
//     private ulde: UldeAngularService,
//     private theme: ThemeService,
//     public scrollService: ScrollService,
//     private overlay: OverlayManager,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     // Detect browser environment
//     this.$isBrowser.set(isPlatformBrowser(this.platformId));
//     if (!this.$isBrowser()) return;

//     // Sync external docId → internal writable docId
//     effect(() => {
//       const id = this.$docId();
//       if (id) {
//         this.previousDocId = id;
//         this.$currentDocId.set(id);
//       }
//     });

//     // Sync external reload → internal reload
//     effect(() => {
//       if (this.$reload()) {
//         this.$currentReload.set(true);
//       }
//     });

//     // React to internal docId changes
//     effect(() => {
//       const id = this.$currentDocId();
//       if (id && this.$isBrowser()) {
//         const key = `ulde:scrollpos:${id}`;
//         const saved = Number(localStorage.getItem(key) ?? 0);
//         this.$savedScrollTop.set(saved);

//         this.loadAndRender(id);
//       }
//     });

//     // React to internal reload flag
//     effect(() => {
//       if (this.$currentReload() && this.$isBrowser()) {
//         this.loadAndRender(this.$currentDocId());
//       }
//     });

//     // React to active heading change
//     effect(() => {
//       const active = this.$activeHeading();
//       const tree = this.$tocTree();

//       if (!active) {
//         // First load → expand everything
//         tree.forEach(node => node.collapsed = false);
//         return;
//       }

//       if (tree.length > 0) {
//         this.updateTocCollapseState(tree, active);
//       }

//     });


//     // ULDE pipeline subscription
//     this.ulde.result$.subscribe(result => {
//       if (!result) return;

//       this.finalHtml = result.finalHtml;

//       // 1. Show overlays immediately
//       this.overlay.show(this.tocOverlayRef);
//       this.overlay.show(this.hostOverlayRef);

//       // 2. Update TOC and debug artifacts
//       this.$toc.set(result.toc ?? []);
//       this.$debugOverlay.set(result.debugOverlay);
//       this.$artifactsPanel.set(result.artifactsPanel);

//       // 3. Cleanup previous ULDE host
//       if (this.cleanupFn) {
//         this.cleanupFn();
//         this.cleanupFn = null;
//       }

//       // 4. Run ULDE host
//       this.cleanupFn = this.bridge.run({
//         host: this.hostWrapperRef.nativeElement,
//         docId: this.$currentDocId(),
//         reload: this.$currentReload(),
//         html: result.finalHtml,
//         onScrollSpy: id => this.handleScrollSpy(id),
//         onScrollPos: e => this.handleScrollPos(e),
//         onNavigate: newDocId => this.handleNavigate(newDocId)
//       });

//       this.scrollSpy.allow();

//       // 5. After rendering: restore scroll + fade out overlays
//       requestAnimationFrame(() => {
//         // DOM mounted
//         requestAnimationFrame(() => {
//           // layout + paint complete
//           queueMicrotask(() => {
//             const pos = this.$savedScrollTop();
//             this.hostWrapperRef.nativeElement.scrollTop = pos;

//             this.overlay.hide(this.tocOverlayRef);
//             this.overlay.hide(this.hostOverlayRef);
//           });
//         });
//       });

//       this.$dvTocRef.set(this.dvTocRef);
//     });
//   }

//   // Auto-collapse / auto-expand TOC like VS Code
//   private updateTocCollapseState(tree: TocNode[], activeSlug: string | null) {
//     const visit = (node: TocNode): boolean => {
//       const isSelfActive = node.entry.slug === activeSlug;
//       const hasActiveDescendant = node.children.some(child => visit(child));

//       // VS Code behavior:
//       // Expand only the active branch; collapse everything else
//       node.collapsed = !(isSelfActive || hasActiveDescendant);

//       return isSelfActive || hasActiveDescendant;
//     };

//     tree.forEach(root => visit(root));
//   }


//   ngAfterViewInit() {
//     if (!this.$isBrowser()) return;
//   }

//   ngOnDestroy() {
//     if (this.cleanupFn) {
//       this.cleanupFn();
//       this.cleanupFn = null;
//     }
//   }

//   // Load markdown and run ULDE
//   private async loadAndRender(docId: string) {
//     const url = `assets/${docId}.md`;

//     try {
//       const response = await fetch(url);

//       if (response.redirected) {
//         this.hostWrapperRef.nativeElement.innerHTML = `
//           <div class="page-not-found">
//             <h1>Page not found</h1>
//             <p><strong>Invalid URL: ${url}</strong></p>
//           </div>
//         `;
//         throw new Error(`Invalid URL: ${url}`);
//       }

//       const markdown = await response.text();
//       await this.ulde.renderMarkdown(markdown);
//     } catch (err) {
//       console.error('[DocsViewer] loadAndRender error:', err);
//     }
//   }

//   // Navigation
//   backToIndex() {
//     this.previousDocId = this.$currentDocId();
//     this.$currentDocId.set('docs/index');
//   }

//   reloadDoc() {
//     this.$currentReload.set(true);
//   }

//   backToPrevDoc() {
//     const currentDocId = this.$currentDocId();
//     this.$currentDocId.set(this.previousDocId);
//     this.previousDocId = currentDocId;
//   }

//   private activateClickedTocItem(nodes: TocNode[], clickedSlug: string) {
//     if (nodes.length === 0) return;

//     for (const node of nodes) {
//       if (node.entry.slug === clickedSlug) {
//         const clickedItem = document.getElementById(clickedSlug);
//         clickedItem?.classList.add('active-heading');
//         this.$activeHeading.set(clickedSlug);
//       }

//       this.activateClickedTocItem(node.children, clickedSlug);
//     }
//   }

//   // ScrollSpy handler from ULDE
//   private handleScrollSpy(id: string) {
//     if (this.scrollSpy.isSuppressed()) return;

//     clearTimeout(this.scrollSpyDebounce);

//     this.scrollSpyDebounce = setTimeout(() => {
//       // Stabilization: require same ID twice
//       if (this.lastSpyId !== id) {
//         this.lastSpyId = id;
//         return;
//       }

//       // Direction-aware activation
//       const toc = this.$toc();
//       const index = toc.findIndex(t => t.slug === id);

//       if (index === -1) return;

//       let finalId = id;

//       if (this.scrollDirection === 'down') {
//         // Prefer next heading if available
//         const next = toc[index + 1];
//         if (next) finalId = next.slug;
//       } else {
//         // Prefer previous heading if available
//         const prev = toc[index - 1];
//         if (prev) finalId = prev.slug;
//       }

//       this.$activeHeading.set(finalId);

//       // Reset stabilization
//       this.lastSpyId = null;
//     }, 50);

//   }

//   private handleScrollPos(e: any) {
//     const pos = e.detail.scrollTop;
//     this.scrollDirection = pos > this.lastScrollTop ? 'down' : 'up';
//     this.lastScrollTop = pos;
//     const height = e.detail.scrollHeight;

//     this.$savedScrollTop.set(pos);

//     const key = `ulde:scrollpos:${this.$currentDocId()}`;
//     localStorage.setItem(key, String(pos));

//     if (!this.rafPending) {
//       this.rafPending = true;
//     }

//     requestAnimationFrame(() => {
//       this.scrollService.setPosition(this.$currentDocId(), pos, height);
//       writeSessionState({ scrollPos: pos }, this.$isBrowser());
//       this.rafPending = false;
//     });
//   }

//   private handleNavigate(id: string) {
//     this.$currentDocId.set(id);
//   };

//   // Scroll to heading with deterministic scroll completion
//   scrollTo(slug: string) {
//     const el = document.getElementById(slug);
//     if (!el) return;

//     this.scrollSpy.suppress();

//     // Start smooth scroll
//     el.scrollIntoView({ behavior: 'smooth', block: 'center' });

//     // Highlight animation
//     this.highlightElement(el);

//     // Remove previous active-heading classes
//     document
//       .querySelectorAll('.active-heading')
//       .forEach(el => el.classList.remove('active-heading'));

//     // rAF-based scroll completion detection
//     const wrapper = this.hostWrapperRef.nativeElement;
//     this.scrollSpy.detectScrollEnd(wrapper, () => {
//       this.activateClickedTocItem(this.$tocTree(), slug);
//     });

//   }

//   private highlightElement(el: HTMLElement) {
//     el.classList.add('inline-highlight');
//     setTimeout(() => el.classList.remove('inline-highlight'), 700);
//   }


//   // Theme toggle
//   async onToggleTheme() {
//     this.theme.toggleTheme();
//     if (this.finalHtml) {
//       await this.bridge.host.run(
//         this.hostWrapperRef.nativeElement,
//         this.finalHtml
//       );
//     }
//   }

//   // UI toggles
//   toggleArtifacts() {
//     this.$showArtifacts.update(v => !v);
//   }

//   toggleDebugOverlay() {
//     this.$showDebugOverlay.update(v => !v);
//   }

//   toggleDebugMermaid() {
//     this.$showDebugMermaid.update(v => !v);
//   }

//   private buildTocTree(entries: TocEntry[]): TocNode[] {
//     const root: TocNode[] = [];
//     const stack: TocNode[] = [];

//     for (const entry of entries) {
//       const node: TocNode = {
//         entry,
//         children: [],
//         collapsed: false
//       };

//       while (
//         stack.length &&
//         stack[stack.length - 1].entry.level >= entry.level
//       ) {
//         stack.pop();
//       }

//       if (stack.length === 0) {
//         root.push(node);
//       } else {
//         stack[stack.length - 1].children.push(node);
//       }

//       stack.push(node);
//     }

//     return root;
//   }

//   isParentOfActive(
//     item: TocEntry,
//     toc: TocEntry[],
//     activeSlug: string | null
//   ): boolean {
//     const activeIndex = toc.findIndex(t => t.slug === activeSlug);
//     if (activeIndex === -1) return false;

//     const active = toc[activeIndex];

//     return item.level < active.level && toc.indexOf(item) < activeIndex;
//   }

//   private isAncestor(node: TocNode, activeSlug: string | null): boolean {
//     for (const child of node.children) {
//       if (child.entry.slug === activeSlug) {
//         return true;
//       }
//       if (this.isAncestor(child, activeSlug)) {
//         return true;
//       }
//     }
//     return false;
//   }
// }

