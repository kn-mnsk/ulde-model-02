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
  imports: [
    ThemeToggle, TocResizerDirective, NgTemplateOutlet
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

  $debugOverlay = signal<DebugOverlayModel | null>(null);
  $artifactsPanel = signal<ArtifactsPanelModel | null>(null);

  // UI state
  $activeHeading = signal<string | null>(null);
  $showDebugOverlay = signal(false);
  $showArtifacts = signal(false);
  $showDebugMermaid = signal(false);
  $isMermaidPanelFilled = signal<boolean>(true);
  $dvTocRef = signal<ElementRef<HTMLElement> | undefined>(undefined);
  $savedScrollTop = signal(0);

  private cleanupFn: (() => void) | null = null;
  private finalHtml: string | null = null;
  private rafPending = false;

  // scrollspy controller
  private scrollSpy = new ScrollSpyController();

  private scrollSpyDebounce: any = null;
  private lastSpyId: string | null = null;
  private lastScrollTop = 0;
  private scrollDirection: 'up' | 'down' = 'down';
  // Suppress ScrollSpy while TOC click scroll is in progress
  // private suppressScrollSpy = false;

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
    // Detect browser environment
    this.$isBrowser.set(isPlatformBrowser(this.platformId));
    if (!this.$isBrowser()) return;

    // Sync external docId → internal writable docId
    effect(() => {
      const id = this.$docId();
      if (id) {
        this.previousDocId = id;
        this.$currentDocId.set(id);
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

      // 1. Show overlays immediately
      this.overlay.show(this.tocOverlayRef);
      this.overlay.show(this.hostOverlayRef);

      // 2. Update TOC and debug artifacts
      this.$toc.set(result.toc ?? []);
      this.$debugOverlay.set(result.debugOverlay);
      this.$artifactsPanel.set(result.artifactsPanel);

      // 3. Cleanup previous ULDE host
      if (this.cleanupFn) {
        this.cleanupFn();
        this.cleanupFn = null;
      }

      // 4. Run ULDE host
      this.cleanupFn = this.bridge.run({
        host: this.hostWrapperRef.nativeElement,
        docId: this.$currentDocId(),
        reload: this.$currentReload(),
        html: result.finalHtml,
        onScrollSpy: id => this.handleScrollSpy(id),
        onScrollPos: e => this.handleScrollPos(e),
        onNavigate: newDocId => this.handleNavigate(newDocId)
      });

      // 5. After rendering: restore scroll + fade out overlays
      requestAnimationFrame(() => {
        // DOM mounted
        requestAnimationFrame(() => {
          // layout + paint complete
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
    const currentDocId = this.$currentDocId();
    this.$currentDocId.set(this.previousDocId);
    this.previousDocId = currentDocId;
  }

  private activateClickedTocItem(nodes: TocNode[], clickedSlug: string) {
    if (nodes.length === 0) return;

    for (const node of nodes) {
      if (node.entry.slug === clickedSlug) {
        const clickedItem = document.getElementById(clickedSlug);
        clickedItem?.classList.add('active-heading');
        this.$activeHeading.set(clickedSlug);
      }

      this.activateClickedTocItem(node.children, clickedSlug);
    }
  }

  // ScrollSpy handler from ULDE
  private handleScrollSpy(id: string) {
    if (this.scrollSpy.isSuppressed()) return;

    clearTimeout(this.scrollSpyDebounce);

    this.scrollSpyDebounce = setTimeout(() => {
      // Stabilization: require same ID twice
      if (this.lastSpyId !== id) {
        this.lastSpyId = id;
        return;
      }

      // Direction-aware activation
      const toc = this.$toc();
      const index = toc.findIndex(t => t.slug === id);

      if (index === -1) return;

      let finalId = id;

      if (this.scrollDirection === 'down') {
        // Prefer next heading if available
        const next = toc[index + 1];
        if (next) finalId = next.slug;
      } else {
        // Prefer previous heading if available
        const prev = toc[index - 1];
        if (prev) finalId = prev.slug;
      }

      this.$activeHeading.set(finalId);

      // Reset stabilization
      this.lastSpyId = null;
    }, 50);

  }

  private handleScrollPos(e: any) {
    const pos = e.detail.scrollTop;
    this.scrollDirection = pos > this.lastScrollTop ? 'down' : 'up';
    const height = e.detail.scrollHeight;

    this.$savedScrollTop.set(pos);

    const key = `ulde:scrollpos:${this.$currentDocId()}`;
    localStorage.setItem(key, String(pos));

    if (!this.rafPending) {
      this.rafPending = true;
    }

    requestAnimationFrame(() => {
      this.scrollService.setPosition(this.$currentDocId(), pos, height);
      writeSessionState({ scrollPos: pos }, this.$isBrowser());
      this.rafPending = false;
    });
  }

  private handleNavigate(id: string) {
    this.$currentDocId.set(id);
  };

  // Scroll to heading with deterministic scroll completion
  scrollTo(slug: string) {
    const el = document.getElementById(slug);
    if (!el) return;

    this.scrollSpy.suppress();

    // Start smooth scroll
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight animation
    this.highlightElement(el);

    // Remove previous active-heading classes
    document
      .querySelectorAll('.active-heading')
      .forEach(el => el.classList.remove('active-heading'));

    // rAF-based scroll completion detection
    const wrapper = this.hostWrapperRef.nativeElement;
    this.scrollSpy.detectScrollEnd(wrapper, () => {
      this.activateClickedTocItem(this.$tocTree(), slug);
    });

  }

  private highlightElement(el: HTMLElement) {
    el.classList.add('inline-highlight');
    setTimeout(() => el.classList.remove('inline-highlight'), 700);
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

  private buildTocTree(entries: TocEntry[]): TocNode[] {
    const root: TocNode[] = [];
    const stack: TocNode[] = [];

    for (const entry of entries) {
      const node: TocNode = {
        entry,
        children: [],
        collapsed: false
      };

      while (
        stack.length &&
        stack[stack.length - 1].entry.level >= entry.level
      ) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    }

    return root;
  }

  isParentOfActive(
    item: TocEntry,
    toc: TocEntry[],
    activeSlug: string | null
  ): boolean {
    const activeIndex = toc.findIndex(t => t.slug === activeSlug);
    if (activeIndex === -1) return false;

    const active = toc[activeIndex];

    return item.level < active.level && toc.indexOf(item) < activeIndex;
  }

  private isAncestor(node: TocNode, activeSlug: string | null): boolean {
    for (const child of node.children) {
      if (child.entry.slug === activeSlug) {
        return true;
      }
      if (this.isAncestor(child, activeSlug)) {
        return true;
      }
    }
    return false;
  }
}






// OLD VERSION
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

//   // Suppress ScrollSpy while TOC click scroll is in progress
//   private suppressScrollSpy = false;

//   @ViewChild('hostWrapper', { static: true }) hostWrapperRef!: ElementRef<HTMLElement>;
//   @ViewChild('hostOverlay', { static: true }) hostOverlayRef!: ElementRef<HTMLElement>;

//   @ViewChild('dvToc', { static: false }) dvTocRef!: ElementRef<HTMLElement>;
//   @ViewChild('tocOverlay', { static: false })
//   tocOverlayRef?: ElementRef<HTMLElement>;

//   constructor(
//     private bridge: UldeDocsViewerBridge,
//     private ulde: UldeAngularService,
//     private theme: ThemeService,
//     public scrollService: ScrollService,
//     private overlay: OverlayManager,
//     @Inject(PLATFORM_ID) private platformId: Object,
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

//     // ULDE pipeline subscription
//     this.ulde.result$.subscribe(result => {
//       if (!result) return;

//       this.finalHtml = result.finalHtml;

//       // 1. Show overlay immediately
//       this.overlay.show(this.tocOverlayRef);
//       this.overlay.show(this.hostOverlayRef);

//       // 2. Update TOC + debug panel
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
//         onScrollSpy: id => {
//           if (this.suppressScrollSpy) return;
//           // console.log(`Log: [DocsViewer] ulde:scrollspy id=`, id);
//           this.$activeHeading.set(id);
//         },
//         onScrollPos: e => { this.onScrollPos(e); },
//         onNavigate: newDocId => {
//           this.$currentDocId.set(newDocId);
//         }
//       });

//       // 5. After rendering → restore scroll + fade overlays
//       requestAnimationFrame(() => {
//         // DOM mounted
//         requestAnimationFrame(() => {
//           // layout + paint complete
//           queueMicrotask(() => {
//             // scrollTop applied after paint
//             const pos = this.$savedScrollTop();
//             this.hostWrapperRef.nativeElement.scrollTop = pos;

//             // Fade out overlay // Fade out overlays via OverlayManager
//             this.overlay.hide(this.tocOverlayRef);
//             this.overlay.hide(this.hostOverlayRef);
//           });
//         });
//       });

//       this.$dvTocRef.set(this.dvTocRef);
//       // this.checkMermaidPanelContent()
//     });
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
//     this.previousDocId = this.$currentDocId(); //
//     this.$currentDocId.set('docs/index');
//     // this.$currentReload.set(true);
//   }

//   reloadDoc() {
//     this.$currentReload.set(true);
//   }

//   backToPrevDoc() {
//     const currentDocId = this.$currentDocId();
//     this.$currentDocId.set(this.previousDocId);
//     this.previousDocId = currentDocId;
//   }


//   private onScrollPos(e: any) {
//     const pos = e.detail.scrollTop;
//     const height = e.detail.scrollHeight;

//     // console.log(`Log: [DocsViewer] ulde:scrollpos \npos=`, pos, `\nheight=`, height);

//     // current: scroll position spy
//     this.$savedScrollTop.set(pos);
//     // Persist per-doc scroll position
//     const key = `ulde:scrollpos:${this.$currentDocId()}`;
//     localStorage.setItem(key, String(pos));

//     //new: scroll position spy

//     if (!this.rafPending) {
//       this.rafPending = true;
//     }

//     requestAnimationFrame(() => {
//       this.scrollService.setPosition(this.$currentDocId(), pos, height);
//       writeSessionState({ scrollPos: pos }, this.$isBrowser());
//       this.rafPending = false;
//     });

//   };


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

//   // Scroll to heading
//   scrollTo(slug: string) {
//     const el = document.getElementById(slug);
//     // console.log(`Log: [DocsViewer] scrollTo element`, el);
//     if (!el) return;

//     this.suppressScrollSpy = true;

//     el.scrollIntoView({
//       behavior: 'smooth',
//       block: 'center'
//     });
//     this.highlightElement(el);

//     document.querySelectorAll('.active-heading').forEach(el => el.classList.remove('active-heading'));

//     // // instead, add 'active-heading' calss to the clicked toc-item
//     setTimeout(() => {
//       this.activateClickedTocItem(this.$tocTree(), slug);
//       this.suppressScrollSpy = false;
//     }, 500);
//   }

//   private highlightElement(el: HTMLElement) {
//     el.classList.add('inline-highlight');
//     setTimeout(() => el.classList.remove('inline-highlight'), 700);
//   }


//   // Theme toggle
//   async onToggleTheme() {
//     // console.log(`Log: [DocsViewer] theme isDark=`, isDark);
//     this.theme.toggleTheme();
//     if (this.finalHtml) {
//       await this.bridge.host.run(this.hostWrapperRef.nativeElement, this.finalHtml);
//       // await this.checkMermaidPanelContent()
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

//       while (stack.length && stack[stack.length - 1].entry.level >= entry.level) {
//         stack.pop();
//       }

//       if (stack.length === 0) {
//         root.push(node);
//       } else {
//         stack[stack.length - 1].children.push(node);
//       }

//       stack.push(node);
//     }

//     // console.log(`Log: buildTocTree() root=`, root);

//     return root;
//   }

//   isParentOfActive(item: TocEntry, toc: TocEntry[], activeSlug: string | null): boolean {
//     const activeIndex = toc.findIndex(t => t.slug === activeSlug);
//     if (activeIndex === -1) return false;

//     const active = toc[activeIndex];

//     // A parent has a lower level and appears before the active heading
//     return item.level < active.level &&
//       toc.indexOf(item) < activeIndex;
//   }

//   private isAncestor(node: TocNode, activeSlug: string | null): boolean {
//     // console.log(`Log: [DocsViewer] isAncestor() node`,node);
//     for (const child of node.children) {
//       if (child.entry.slug === activeSlug) {
//         // console.log(`Log: [DocsViewer] isAncestor() child.entry.slug === activeSlug=`, activeSlug);
//         return true;
//       }
//       if (this.isAncestor(child, activeSlug)) {
//         // console.log(`Log: [DocsViewer] this.isAncestor(child, activeSlug) `, child, activeSlug);
//         return true;
//       }
//     }
//     return false;
//   }


// }

