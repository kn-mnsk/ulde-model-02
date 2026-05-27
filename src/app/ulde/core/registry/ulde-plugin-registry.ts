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


// ------------------------------
// CONTENT PHASE PLUGINS
// ------------------------------
import { UldeFrontmatterPlugin } from '../../plugins/content/ulde-frontmatter.plugin';
import { UldeLinksPlugin } from '../../plugins/content/ulde-links.plugin';
import { UldeTocPlugin } from '../../plugins/content/ulde-toc.plugin';
import { UldeCodeblocksPlugin } from '../../plugins/content/ulde-codeblocks.plugin';
import { UldeSyntaxHighlightPlugin } from '../../plugins/content/ulde-syntax-highlight.plugin';
import { UldeContainersPlugin } from '../../plugins/content/ulde-containers.plugin';

// ------------------------------
// TRANSFORM PHASE PLUGINS
// ------------------------------
import { UldeDomInjectorPlugin } from '../../plugins/transform/ulde-dom-injector.plugin';

// ------------------------------
// DIAGNOSTICS PHASE PLUGINS
// ------------------------------
import { UldeHeadingsCheckPlugin } from '../../plugins/diagnostics/ulde-headings-check.plugin';
import { UldeBrokenLinksPlugin } from '../../plugins/diagnostics/ulde-broken-links.plugin';

// ------------------------------
// ASSEMBLE PHASE PLUGINS
// ------------------------------
import { UldeRendererPlugin } from '../../plugins/assemble/ulde-renderer.plugin';
import { UldeTimelinePlugin } from '../../plugins/assemble/ulde-timeline.plugin';
import { UldeDebugOverlayPlugin } from '../../plugins/assemble/ulde-debug-overlay.plugin';
import { UldeArtifactsPanelPlugin } from '../../plugins/assemble/ulde-artifacts-panel.plugin';
import { UldeArtifactsPanelHtmlPlugin } from '../../plugins/assemble/ulde-artifacts-panel-html.plugin';
import { UldeProfilerPlugin } from '../../plugins/assemble/ulde-profiler.plugin';
import { UldeDebugOverlayHtmlPlugin } from '../../plugins/assemble/ulde-debug-overlay-html.plugin';


// -----------------------------------------------------
// BUILD REGISTRY (ORDER MATTERS) - String World
// -----------------------------------------------------
export function createUldeStringPluginRegistry() {
  return [

    // ---------------------------------------------
    // CONTENT PHASE
    // ---------------------------------------------
    UldeFrontmatterPlugin,
    UldeLinksPlugin,
    UldeTocPlugin,
    UldeCodeblocksPlugin,
    UldeSyntaxHighlightPlugin,
    UldeContainersPlugin,

    // ---------------------------------------------
    // TRANSFORM PHASE
    // ---------------------------------------------
    UldeDomInjectorPlugin,

    // ---------------------------------------------
    // DIAGNOSTICS PHASE
    // ---------------------------------------------
    UldeHeadingsCheckPlugin,
    UldeBrokenLinksPlugin,

    // ---------------------------------------------
    // ASSEMBLE PHASE
    // ---------------------------------------------
    UldeRendererPlugin,              // produces base HTML
    UldeTimelinePlugin,             // timeline model
    UldeProfilerPlugin,             // profiler model
    UldeDebugOverlayPlugin,          // debug overlay model
    UldeArtifactsPanelPlugin,        // artifacts panel model
    UldeDebugOverlayHtmlPlugin,     // debug overlay HTML (NEW)
    UldeArtifactsPanelHtmlPlugin,    // artifacts panel HTML (NEW)

    // UldeRendererPlugin,              // produces base HTML
    // createUldeTimelinePlugin(),      // timeline model
    // UldeDebugOverlayPlugin,          // debug overlay model
    // UldeDebugOverlayHtmlPlugin,      // debug overlay HTML (NEW)
    // UldeArtifactsPanelPlugin,        // artifacts panel model
    // UldeArtifactsPanelHtmlPlugin,    // artifacts panel HTML (NEW)
    // UldeProfilerPlugin,              // profiler model
  ];

}
