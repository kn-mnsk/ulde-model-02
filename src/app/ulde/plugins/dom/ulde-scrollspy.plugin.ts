// ulde/plugins/dom/ulde-scrollspy.plugin.ts

/**
 * ULDE ScrollSpy Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how DOM-phase plugins prepare metadata for UI behavior
 *   - how to consume anchor metadata (from Anchors plugin)
 *   - how to build a ScrollSpy model (list of sections)
 *   - how to warn about missing anchors
 *
 * This plugin does NOT:
 *   - access the DOM
 *   - attach scroll listeners
 *   - compute active heading in real time
 *
 * The goal is to teach plugin architecture,
 * not to implement a full ScrollSpy system.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeScrollSpyPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-scrollspy',
    description: 'Prepares ScrollSpy metadata from heading anchors.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in DOM phase because ScrollSpy is a DOM behavior.
  phase: UldePhase.DOM,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,
    usesDiagnostics: true,
    usesDom: true,                 // DOM-phase plugin
    producesRenderArtifacts: true, // produces scrollspy metadata
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-scrollspy',
      message: 'ScrollSpy plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts } = ctx;

    // Anchors must exist (from Anchors plugin)
    const anchors = artifacts.anchors ?? [];

    if (anchors.length === 0) {
      artifacts.diagnostics.add({
        plugin: 'ulde-scrollspy',
        message: 'No anchors found — ScrollSpy cannot operate.',
        severity: 'warning',
      });
      artifacts.scrollspy = [];
      return;
    }

    // -----------------------------------------------------
    // 1. Build ScrollSpy model
    // -----------------------------------------------------
    //
    // Each entry:
    //   {
    //     slug: "installation",
    //     level: 2,
    //     index: 0,
    //     active: false
    //   }
    //
    // The Angular/React adapter will:
    //   - attach scroll listeners
    //   - compute active heading
    //   - update UI
    //
    const scrollspy = anchors.map((a: any) => ({
      slug: a.slug,
      level: a.level,
      index: a.index,
      active: false, // UI layer will toggle this
    }));

    // -----------------------------------------------------
    // 2. Store metadata
    // -----------------------------------------------------
    artifacts.scrollspy = scrollspy;

    artifacts.diagnostics.add({
      plugin: 'ulde-scrollspy',
      message: `Prepared ScrollSpy model with ${scrollspy.length} entries.`,
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-scrollspy',
      message: 'ScrollSpy plugin finished.',
      severity: 'info',
    });
  },
};
