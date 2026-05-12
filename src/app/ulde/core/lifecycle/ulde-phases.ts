// ulde/core/lifecycle/ulde-phases.ts

/**
 * ULDE Pipeline Phases (v3)
 *
 * These phases represent the *string-based* ULDE pipeline.
 * None of these phases operate on the real DOM.
 *
 * Browser DOM behavior - such as Mermaid, KaTeX auto-render, Anchors, ScrollSpy, Syntax highlight(real DOM), and any interractive widget -
 * is handled separately by UldeBrowserHost and is NOT part of this enum.
 */

export enum UldePhase {
  /**
   * CONTENT PHASE
   * -------------
   * Markdown → HTML
   * Frontmatter
   * Links
   * TOC
   * Containers
   * Syntax highlight metadata
   */
  CONTENT = 'content',

  /**
   * TRANSFORM PHASE
   * ----------------
   * String-based HTML rewriting:
   * - DOM injector
   * - KaTeX (SSR/string mode)
   * - Anchor injection (string)
   * - Scrollspy metadata (string)
   */
  TRANSFORM = 'transform',

  /**
   * DIAGNOSTICS PHASE
   * ------------------
   * Broken links
   * Heading checks
   * Warnings
   * Timings
   */
  DIAGNOSTICS = 'diagnostics',

  /**
   * ASSEMBLE PHASE
   * ---------------
   * Final HTML assembly:
   * - Renderer plugin
   * - Timeline
   * - Profiler
   * - Artifacts panel
   *
   * Produces: ctx.artifacts.finalHtml
   */
  ASSEMBLE = 'assemble'
}
