/**
 * ULDE Artifacts Ownership IntelliSense Helper
 * --------------------------------------------
 * This file augments the real UldeArtifacts interface
 * with JSDoc ownership information.
 *
 * It does NOT change runtime behavior.
 */

import {UldeArtifacts} from '../src/app/ulde/core/artifacts/ulde-artifacts';

// declare module UldeArtifacts  {
// declare module 'ULDE'  {
  export interface UldeArtifacts {
    /**
     * Raw or transformed content.
     * Written by: Markdown Parser, KaTeX Plugin, Links Plugin, Containers Plugin
     * Read by: All content-phase plugins
     */
    content: string;

    /**
     * Table of contents entries.
     * Written by: TOC Plugin
     * Read by: Anchors Plugin, Debug Overlay Plugin
     */
    toc?: artifacts.TocEntry[];

    /**
     * Link metadata extracted from content.
     * Written by: Links Plugin
     * Read by: Debug Overlay Plugin
     */
    links?: artifacts.LinkEntry[];

    /**
     * Frontmatter key-value pairs.
     * Written by: Frontmatter Plugin
     * Read by: Any plugin
     */
    frontmatter?: artifacts.FrontmatterData;

    /**
     * Extracted code blocks.
     * Written by: Codeblock Extractor Plugin
     * Read by: Syntax Highlight Plugin
     */
    codeblocks?: artifacts.CodeblockEntry[];

    /**
     * Highlight requests for the renderer.
     * Written by: Syntax Highlight Plugin
     * Read by: Highlight Renderer
     */
    highlightRequests?: artifacts.HighlightRequest[];

    /**
     * Container blocks (note, warning, tip, etc.)
     * Written by: Containers Plugin
     * Read by: Debug Overlay Plugin
     */
    containers?: artifacts.ContainerEntry[];

    /**
     * Diagnostics collected across all plugins.
     * Written by: Any plugin
     * Read by: Debug Overlay Plugin, Profiler Plugin
     */
    diagnostics: {
      add(entry: artifacts.DiagnosticEntry): void;
      all(): artifacts.DiagnosticEntry[];
    };

    /**
     * Anchor entries derived from TOC.
     * Written by: Anchors Plugin
     * Read by: ScrollSpy Plugin
     */
    anchors?: artifacts.AnchorEntry[];

    /**
     * ScrollSpy state.
     * Written by: ScrollSpy Plugin
     * Read by: DOM renderer
     */
    scrollspy?: artifacts.ScrollSpyEntry[];

    /**
     * Intermediate HTML.
     * Written by: HTML Renderer
     * Read by: Final Render Plugin
     */
    html?: string;

    /**
     * Final HTML output.
     * Written by: Final Render Plugin
     * Read by: Exporters, UI
     */
    finalHtml?: string;

    /**
     * Timeline of plugin execution.
     * Written by: Timeline Plugin
     * Read by: Debug Overlay Plugin, Profiler Plugin
     */
    timeline?: artifacts.TimelineModel;

    /**
     * Debug overlay model.
     * Written by: Debug Overlay Plugin
     * Read by: DevTools
     */
    debugOverlay?: artifacts.DebugOverlayModel;

    /**
     * Profiler model.
     * Written by: Profiler Plugin
     * Read by: DevTools
     */
    profiler?: artifacts.ProfilerModel;

    /**
     * Artifacts Panel model.
     * Written by: Artifacts Panel Plugin
     * Read by: DevTools UI
     */
    artifactsPanel?: artifacts.ArtifactsPanelModel;

    /**
     * Timing entries for all plugins.
     * Written by: Orchestrator
     * Read by: Timeline Plugin, Profiler Plugin, Debug Overlay Plugin
     */
    timings: {
      add(entry: artifacts.TimelineEntry): void;
      all(): artifacts.TimelineEntry[];
    };
  }
// }




// /**
//  * ULDE Artifacts Ownership Map
//  * -----------------------------------------
//  * This file provides IntelliSense hints for:
//  *   - which plugin writes each artifact field
//  *   - which plugin reads each artifact field
//  *   - which lifecycle phase owns the field
//  *
//  * This is NOT used at runtime.
//  * It exists only to help contributors understand ULDE’s architecture.
//  */

// declare namespace ULDE {
//   /**
//    * CONTENT PHASE
//    * -----------------------------------------
//    */

//   interface ContentArtifactsOwnership {
//     /**
//      * Raw or transformed content.
//      * Written by: Markdown Parser, KaTeX Plugin, Links Plugin, Containers Plugin
//      * Read by: All content-phase plugins
//      */
//     content: string;

//     /**
//      * Table of contents entries.
//      * Written by: TOC Plugin
//      * Read by: Anchors Plugin, Debug Overlay Plugin
//      */
//     toc?: import('../src/app/ulde/core/artifacts/ulde-artifacts').TocEntry[];

//     /**
//      * Link metadata extracted from content.
//      * Written by: Links Plugin
//      * Read by: Debug Overlay Plugin
//      */
//     links?: import('../src/app/ulde/core/artifacts/ulde-artifacts').LinkEntry[];

//     /**
//      * Frontmatter key-value pairs.
//      * Written by: Frontmatter Plugin
//      * Read by: Any plugin
//      */
//     frontmatter?: import('../src/app/ulde/core/artifacts/ulde-artifacts').FrontmatterData;

//     /**
//      * Extracted code blocks.
//      * Written by: Codeblock Extractor Plugin
//      * Read by: Syntax Highlight Plugin
//      */
//     codeblocks?: import('../src/app/ulde/core/artifacts/ulde-artifacts').CodeblockEntry[];

//     /**
//      * Highlight requests for the renderer.
//      * Written by: Syntax Highlight Plugin
//      * Read by: Highlight Renderer
//      */
//     highlightRequests?: import('../src/app/ulde/core/artifacts/ulde-artifacts').HighlightRequest[];

//     /**
//      * Container blocks (note, warning, tip, etc.)
//      * Written by: Containers Plugin
//      * Read by: Debug Overlay Plugin
//      */
//     containers?: import('../src/app/ulde/core/artifacts/ulde-artifacts').ContainerEntry[];
//   }

//   /**
//    * DIAGNOSTICS PHASE
//    * -----------------------------------------
//    */

//   interface DiagnosticsArtifactsOwnership {
//     /**
//      * Diagnostics collected across all plugins.
//      * Written by: Any plugin
//      * Read by: Debug Overlay Plugin, Profiler Plugin
//      */
//     diagnostics: import('../src/app/ulde/core/artifacts/ulde-artifacts').UldeArtifacts['diagnostics'];
//   }

//   /**
//    * DOM PHASE
//    * -----------------------------------------
//    */

//   interface DomArtifactsOwnership {
//     /**
//      * Anchor entries derived from TOC.
//      * Written by: Anchors Plugin
//      * Read by: ScrollSpy Plugin
//      */
//     anchors?: import('../src/app/ulde/core/artifacts/ulde-artifacts').AnchorEntry[];

//     /**
//      * ScrollSpy state.
//      * Written by: ScrollSpy Plugin
//      * Read by: DOM renderer
//      */
//     scrollspy?: import('../src/app/ulde/core/artifacts/ulde-artifacts').ScrollSpyEntry[];
//   }

//   /**
//    * RENDER PHASE
//    * -----------------------------------------
//    */

//   interface RenderArtifactsOwnership {
//     /**
//      * Intermediate HTML.
//      * Written by: HTML Renderer
//      * Read by: Final Render Plugin
//      */
//     html?: string;

//     /**
//      * Final HTML output.
//      * Written by: Final Render Plugin
//      * Read by: Exporters, UI
//      */
//     finalHtml?: string;

//     /**
//      * Timeline of plugin execution.
//      * Written by: Timeline Plugin
//      * Read by: Debug Overlay Plugin, Profiler Plugin
//      */
//     timeline?: import('../src/app/ulde/core/artifacts/ulde-artifacts').TimelineModel;

//     /**
//      * Debug overlay model.
//      * Written by: Debug Overlay Plugin
//      * Read by: DevTools
//      */
//     debugOverlay?: import('../src/app/ulde/core/artifacts/ulde-artifacts').DebugOverlayModel;

//     /**
//      * Profiler model.
//      * Written by: Profiler Plugin
//      * Read by: DevTools
//      */
//     profiler?: import('../src/app/ulde/core/artifacts/ulde-artifacts').ProfilerModel;
//   }

//   /**
//    * DEVTOOLS
//    * -----------------------------------------
//    */

//   interface DevToolsArtifactsOwnership {
//     /**
//      * Artifacts Panel model.
//      * Written by: Artifacts Panel Plugin
//      * Read by: DevTools UI
//      */
//     artifactsPanel?: import('../src/app/ulde/core/artifacts/ulde-artifacts').ArtifactsPanelModel;
//   }

//   /**
//    * TIMINGS
//    * -----------------------------------------
//    */

//   interface TimingArtifactsOwnership {
//     /**
//      * Timing entries for all plugins.
//      * Written by: Orchestrator
//      * Read by: Timeline Plugin, Profiler Plugin, Debug Overlay Plugin
//      */
//     timings: import('../src/app/ulde/core/artifacts/ulde-artifacts').UldeArtifacts['timings'];
//   }

//   /**
//    * MASTER OWNERSHIP MAP
//    * -----------------------------------------
//    * This merges all ownership interfaces into one IntelliSense helper.
//    */

//   interface ArtifactsOwnershipMap
//     extends ContentArtifactsOwnership,
//       DiagnosticsArtifactsOwnership,
//       DomArtifactsOwnership,
//       RenderArtifactsOwnership,
//       DevToolsArtifactsOwnership,
//       TimingArtifactsOwnership {}
// }
