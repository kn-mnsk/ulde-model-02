// ulde/plugins/renderers/ulde-debug-overlay.plugin.ts

/**
 * ULDE Debug Overlay Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to gather all ULDE artifacts into a single debug model
 *   - how to prepare data for a visual overlay (rendered by Angular/React)
 *   - how to expose diagnostics, timings, anchors, scrollspy, containers, etc.
 *   - how renderer-phase plugins unify data rather than mutate content
 *
 * This plugin does NOT:
 *   - draw the overlay
 *   - manipulate the DOM
 *   - inject HTML
 *
 * The goal is to teach plugin architecture,
 * not to implement a full UI.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeDebugOverlayPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-debug-overlay',
    description: 'Builds a unified debug model for visual overlays.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in RENDER phase because it prepares visualization data.
  phase: UldePhase.RENDER,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,
    usesDiagnostics: false,
    usesDom: false,
    producesRenderArtifacts: true, // produces debug overlay metadata
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-debug-overlay',
      message: 'Debug Overlay plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts } = ctx;

    // -----------------------------------------------------
    // 1. Gather all artifacts
    // -----------------------------------------------------
    const diagnostics = artifacts.diagnostics?.all?.() ?? [];
    const timings = artifacts.timings?.all?.() ?? [];
    const toc = artifacts.toc ?? [];
    const frontmatter = artifacts.frontmatter ?? {};
    const codeblocks = artifacts.codeblocks ?? [];
    const containers = artifacts.containers ?? [];
    const anchors = artifacts.anchors ?? [];
    const scrollspy = artifacts.scrollspy ?? [];
    const timeline = artifacts.timeline ?? [];

    // -----------------------------------------------------
    // 2. Build unified debug model
    // -----------------------------------------------------
    //
    // This model is intentionally simple and UI-friendly.
    // Angular/React adapters will render it visually.
    //
    const debugModel = {
      diagnostics,
      timings,
      toc,
      frontmatter,
      codeblocks,
      containers,
      anchors,
      scrollspy,
      timeline,
      summary: {
        diagnosticsCount: diagnostics.length,
        timingsCount: timings.length,
        headingsCount: anchors.length,
        containersCount: containers.length,
        codeblocksCount: codeblocks.length,
      },
    };

    // -----------------------------------------------------
    // 3. Store debug overlay metadata
    // -----------------------------------------------------
    artifacts.debugOverlay = debugModel;

    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-debug-overlay',
      message: 'Debug overlay model built.',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-debug-overlay',
      message: 'Debug Overlay plugin finished.',
      severity: 'info',
    });
  },
};
