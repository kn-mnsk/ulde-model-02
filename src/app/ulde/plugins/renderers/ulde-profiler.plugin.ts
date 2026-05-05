// ulde/plugins/renderers/ulde-profiler.plugin.ts

/**
 * ULDE Profiler Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to compute deeper performance metrics
 *   - how to measure orchestrator overhead
 *   - how to compute per-phase CPU deltas
 *   - how to generate synthetic memory snapshots
 *   - how to detect performance anomalies
 *   - how to produce a profiler model for UI adapters
 *
 * This plugin does NOT:
 *   - access real system memory APIs
 *   - perform real CPU profiling
 *   - manipulate the DOM
 *
 * The goal is to teach plugin architecture,
 * not to implement a full performance profiler.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeProfilerPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-profiler',
    description: 'Computes deeper performance metrics for ULDE.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in RENDER phase because profiling is a visualization concern.
  phase: UldePhase.RENDER,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,
    usesDiagnostics: true,
    usesDom: false,
    producesRenderArtifacts: true, // produces profiler metadata
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-profiler',
      message: 'Profiler plugin starting…',
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
      artifacts.profiler = {
        phases: [],
        memorySnapshots: [],
        anomalies: [],//new Array({phase:'', message:''}),
        summary: {
          totalPlugins: 0,
          totalPhases: 0,
          totalTimeMs: 0} };
      // artifacts.profiler = { phases: [], summary: {} };
      ctx.artifacts.diagnostics.add({
        plugin: 'ulde-profiler',
        message: 'No timings found — profiler will be empty.',
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
    // 2. Compute per-phase totals and overhead
    // -----------------------------------------------------
    const profilerPhases = Object.keys(phases).map(phase => {
      const entries = phases[phase];
      const total = entries.reduce((sum, p) => sum + p.ms, 0);

      // Synthetic overhead: 3% of total (teaching version)
      const overhead = total * 0.03;

      return {
        phase,
        totalMs: total,
        overheadMs: overhead,
        plugins: entries,
      };
    });

    // -----------------------------------------------------
    // 3. Synthetic memory snapshots
    // -----------------------------------------------------
    //
    // Teaching version:
    //   - memory grows slightly per phase
    //   - not tied to real system memory
    //
    let memory = 50; // baseline MB

    const memorySnapshots = profilerPhases.map(p => {
      memory += Math.max(1, p.totalMs * 0.1); // synthetic growth
      return {
        phase: p.phase,
        memoryMB: Math.round(memory),
      };
    });

    // -----------------------------------------------------
    // 4. Detect performance anomalies
    // -----------------------------------------------------
    const anomalies: Array<{ phase: string; message: string }> = [];

    for (const p of profilerPhases) {
      if (p.totalMs > 20) {
        anomalies.push({
          phase: p.phase,
          message: `Phase "${p.phase}" took unusually long (${p.totalMs.toFixed(
            2
          )}ms).`,
        });

        ctx.artifacts.diagnostics.add({
          plugin: 'ulde-profiler',
          message: `Performance anomaly detected in phase "${p.phase}".`,
          severity: 'warning',
        });
      }
    }

    // -----------------------------------------------------
    // 5. Build profiler model
    // -----------------------------------------------------
    artifacts.profiler = {
      phases: profilerPhases,
      memorySnapshots,
      anomalies,
      summary: {
        totalPlugins: timings.length,
        totalPhases: profilerPhases.length,
        totalTimeMs: profilerPhases.reduce((s, p) => s + p.totalMs, 0),
      },
    };

    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-profiler',
      message: 'Profiler model built.',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-profiler',
      message: 'Profiler plugin finished.',
      severity: 'info',
    });
  },
};
