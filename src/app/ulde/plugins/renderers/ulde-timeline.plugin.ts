// ulde/plugins/renderers/ulde-timeline.plugin.ts

/**
 * ULDE Timeline Renderer Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to read plugin timings collected by the orchestrator
 *   - how to group timings by phase
 *   - how to compute relative durations (percentages)
 *   - how to produce a timeline model for UI rendering
 *
 * This plugin does NOT:
 *   - draw the timeline
 *   - manipulate the DOM
 *   - inject HTML
 *
 * The goal is to teach plugin architecture,
 * not to implement a full visualization engine.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeTimelinePlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-timeline',
    description: 'Builds a visual timeline model from plugin timings.',
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
    producesRenderArtifacts: true, // produces timeline metadata
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-timeline',
      message: 'Timeline Renderer plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts } = ctx;

    const timings = artifacts.timings?.all?.() ?? [];

    if (timings.length === 0) {
      artifacts.timeline = [];
      ctx.artifacts.diagnostics.add({
        plugin: 'ulde-timeline',
        message: 'No timings found — timeline will be empty.',
        severity: 'warning',
      });
      return;
    }

    // -----------------------------------------------------
    // 1. Group timings by phase
    // -----------------------------------------------------
    const phases: Record<string, Array<{ plugin: string; ms: number }>> = {};

    for (const t of timings) {
      if (!phases[t.phase]) phases[t.phase] = [];
      phases[t.phase].push({ plugin: t.plugin, ms: t.ms });
    }

    // -----------------------------------------------------
    // 2. Compute total time per phase
    // -----------------------------------------------------
    const phaseTotals: Record<string, number> = {};

    for (const phase of Object.keys(phases)) {
      phaseTotals[phase] = phases[phase].reduce((sum, p) => sum + p.ms, 0);
    }

    // -----------------------------------------------------
    // 3. Build timeline model
    // -----------------------------------------------------
    //
    // Each entry:
    //   {
    //     phase: "content",
    //     totalMs: 12.3,
    //     segments: [
    //       { plugin: "ulde-toc", ms: 3.1, ratio: 0.25 },
    //       { plugin: "ulde-links", ms: 9.2, ratio: 0.75 }
    //     ]
    //   }
    //
    const timeline = Object.keys(phases).map(phase => {
      const total = phaseTotals[phase];

      const segments = phases[phase].map(p => ({
        plugin: p.plugin,
        ms: p.ms,
        ratio: total > 0 ? p.ms / total : 0,
      }));

      return {
        phase,
        totalMs: total,
        segments,
      };
    });

    // -----------------------------------------------------
    // 4. Store timeline metadata
    // -----------------------------------------------------
    artifacts.timeline = timeline;

    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-timeline',
      message: `Timeline built with ${timeline.length} phase(s).`,
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-timeline',
      message: 'Timeline Renderer plugin finished.',
      severity: 'info',
    });
  },
};
