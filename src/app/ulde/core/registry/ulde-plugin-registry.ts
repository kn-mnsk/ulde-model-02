// ulde/core/registry/ulde-plugin-registry.ts

/**
 * ULDE v3 Plugin Registry
 *
 * This registry returns ONLY ULDE pipeline plugins:
 *   - CONTENT phase
 *   - TRANSFORM phase
 *   - DIAGNOSTICS phase
 *   - ASSEMBLE phase
 *
 * Browser DOM plugins (Mermaid, KaTeX auto-render, Anchors, ScrollSpy)
 * are NOT included here — they are registered in UldeBrowserHost.
 */

// import { UldePhase } from '../lifecycle/ulde-phases';

// ------------------------------
// CONTENT PHASE PLUGINS
// ------------------------------
import { UldeFrontmatterPlugin } from '../../plugins/content/ulde-frontmatter.plugin';
import { createUldeLinksPlugin } from '../../plugins/content/ulde-links.plugin';
import { UldeTocPlugin } from '../../plugins/content/ulde-toc.plugin';
import { UldeCodeblocksPlugin } from '../../plugins/content/ulde-codeblocks.plugin';
import { createUldeSyntaxHighlightPlugin } from '../../plugins/content/ulde-syntax-highlight.plugin';
import { UldeContainersPlugin } from '../../plugins/content/ulde-containers.plugin';

// ------------------------------
// TRANSFORM PHASE PLUGINS
// ------------------------------
import { UldeDomInjectorPlugin } from '../../plugins/transform/ulde-dom-injector.plugin';
// import { UldeKatexTransformPlugin } from '../../plugins/transform/ulde-katex-transform.plugin';
// import { UldeAnchorsTransformPlugin } from '../../plugins/transform/ulde-anchors-transform.plugin';
// import { UldeScrollspyTransformPlugin } from '../../plugins/transform/ulde-scrollspy-transform.plugin';

// ------------------------------
// DIAGNOSTICS PHASE PLUGINS
// ------------------------------
import { UldeHeadingsCheckPlugin } from '../../plugins/diagnostics/ulde-headings-check.plugin';
import { UldeBrokenLinksPlugin } from '../../plugins/diagnostics/ulde-broken-links.plugin';

// ------------------------------
// ASSEMBLE PHASE PLUGINS
// ------------------------------
import { UldeRendererPlugin } from '../../plugins/assemble/ulde-renderer.plugin';
import { createUldeTimelinePlugin } from '../../plugins/assemble/ulde-timeline.plugin';
import { createUldeDebugOverlayPlugin } from '../../plugins/assemble/ulde-debug-overlay.plugin';
import { UldeArtifactsPanelPlugin } from '../../plugins/assemble/ulde-artifacts-panel.plugin';
import { createUldeProfilerPlugin } from '../../plugins/assemble/ulde-profiler.plugin';


// -----------------------------------------------------
// BUILD REGISTRY (ORDER MATTERS)
// -----------------------------------------------------
export function createUldePluginRegistry() {
  return [

    // ---------------------------------------------
    // CONTENT PHASE
    // ---------------------------------------------
    UldeFrontmatterPlugin,
    createUldeLinksPlugin(),
    UldeTocPlugin,
    UldeCodeblocksPlugin,
    createUldeSyntaxHighlightPlugin(),
    UldeContainersPlugin,

    // ---------------------------------------------
    // TRANSFORM PHASE
    // ---------------------------------------------
    UldeDomInjectorPlugin,
    // UldeKatexTransformPlugin,
    // UldeAnchorsTransformPlugin,
    // UldeScrollspyTransformPlugin,

    // ---------------------------------------------
    // DIAGNOSTICS PHASE
    // ---------------------------------------------
    UldeHeadingsCheckPlugin,
    UldeBrokenLinksPlugin,

    // ---------------------------------------------
    // ASSEMBLE PHASE
    // ---------------------------------------------
    UldeRendererPlugin,
    createUldeTimelinePlugin(),
    createUldeDebugOverlayPlugin(),
    UldeArtifactsPanelPlugin,
    createUldeProfilerPlugin(),
  ];
}
