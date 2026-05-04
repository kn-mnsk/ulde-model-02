// ulde/core/registry/ulde-plugin-registry.ts

/**
 * ULDE Plugin Registry (Teaching Version)
 *
 * This file demonstrates:
 *   - how ULDE discovers and orders plugins
 *   - how plugins are grouped by lifecycle phase
 *   - how the orchestrator executes them in sequence
 *   - how contributors can add new plugins safely
 *
 * This registry is intentionally explicit:
 *   - no auto-discovery
 *   - no dynamic imports
 *   - no magic
 *
 * The goal is to teach plugin architecture,
 * not to implement a full plugin loader.
 */

import { UldePlugin } from './ulde-plugin-api';
import { UldePhase } from '../lifecycle/ulde-phases';

// ------------------------------
// Import all plugins
// ------------------------------

// Content-phase plugins
import { UldeTocPlugin } from '../../plugins/content/ulde-toc.plugin';
import { UldeLinksPlugin } from '../../plugins/content/ulde-links.plugin';
import { UldeFrontmatterPlugin } from '../../plugins/content/ulde-frontmatter.plugin';
import { UldeCodeblocksPlugin } from '../../plugins/content/ulde-codeblocks.plugin';
import { UldeSyntaxHighlightPlugin } from '../../plugins/content/ulde-syntax-highlight.plugin';
import { UldeContainersPlugin } from '../../plugins/content/ulde-containers.plugin';

// Diagnostics-phase plugins
import { UldeHeadingsCheckPlugin } from '../../plugins/diagnostics/ulde-headings-check.plugin';
import { UldeBrokenLinksPlugin } from '../../plugins/diagnostics/ulde-broken-links.plugin';

// DOM-phase plugins
import { UldeAnchorsPlugin } from '../../plugins/dom/ulde-anchors.plugin';
import { UldeScrollSpyPlugin } from '../../plugins/dom/ulde-scrollspy.plugin';
import { UldeDomInjectorPlugin } from '../../plugins/dom/ulde-dom-injector.plugin';

// Render-phase plugins
import { UldeRendererPlugin } from '../../plugins/renderers/ulde-renderer.plugin';
import { UldeTimelinePlugin } from '../../plugins/renderers/ulde-timeline.plugin';
import { UldeDebugOverlayPlugin } from '../../plugins/renderers/ulde-debug-overlay.plugin';
import { UldeArtifactsPanelPlugin } from '../../plugins/renderers/ulde-artifacts-panel.plugin';
import { UldeProfilerPlugin } from '../../plugins/renderers/ulde-profiler.plugin';

// ------------------------------
// Registry builder
// ------------------------------

export function createUldePluginRegistry(): UldePlugin[] {
  /**
   * The registry is ordered by lifecycle phase:
   *
   *   1. CONTENT
   *   2. DIAGNOSTICS
   *   3. DOM
   *   4. RENDER
   *
   * Within each phase, plugins run in the order listed.
   *
   * This explicit ordering is essential for teaching:
   *   - TOC must run before Headings Check
   *   - Anchors must run before ScrollSpy
   *   - Renderer must run before DOM Injector
   *   - Timeline/Profiler/DebugOverlay must run last
   */

  return [
    // -----------------------------------------------------
    // CONTENT PHASE
    // -----------------------------------------------------
    UldeTocPlugin,
    UldeLinksPlugin,
    UldeFrontmatterPlugin,
    UldeCodeblocksPlugin,
    UldeSyntaxHighlightPlugin,
    UldeContainersPlugin,

    // -----------------------------------------------------
    // DIAGNOSTICS PHASE
    // -----------------------------------------------------
    UldeHeadingsCheckPlugin,
    UldeBrokenLinksPlugin,

    // -----------------------------------------------------
    // DOM PHASE
    // -----------------------------------------------------
    UldeAnchorsPlugin,
    UldeScrollSpyPlugin,
    UldeDomInjectorPlugin,

    // -----------------------------------------------------
    // RENDER PHASE
    // -----------------------------------------------------
    UldeRendererPlugin,
    UldeTimelinePlugin,
    UldeDebugOverlayPlugin,
    UldeArtifactsPanelPlugin,
    UldeProfilerPlugin,
  ];
}
