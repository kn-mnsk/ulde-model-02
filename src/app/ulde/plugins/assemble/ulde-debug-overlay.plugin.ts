// app/ulde/plugins/assemble/ulde-debug-overlay.plugin.ts

import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import type { DiagnosticEntry, TimelineEntry } from '../../core/artifacts/ulde-artifacts';

export const UldeDebugOverlayPlugin: UldePlugin = {
  meta: {
    name: 'ulde-debug-overlay',
    version: '1.1.0',
    description: 'Builds a debug overlay model from diagnostics and timings.',
  },

  phase: UldePhase.ASSEMBLE,

  capabilities: {
    transformsContent: false,
    usesDiagnostics: true,
    usesDom: false,
    producesRenderArtifacts: true,
  },

  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-debug-overlay',
      message: 'Debug Overlay plugin starting…',
      severity: 'info',
    });
  },

  run(ctx: UldePhaseContext) {
    const { artifacts, config } = ctx;

    if (!config.enableDebugOverlay) return;

    const diagnostics: DiagnosticEntry[] = artifacts.diagnostics.all();
    const timings: TimelineEntry[] = artifacts.timings.all();

    const summary = {
      totalPlugins: new Set(timings.map(t => t.plugin)).size,
      totalDiagnostics: diagnostics.length,
      totalTimeMs: timings.reduce((sum, t) => sum + t.ms, 0),
    };

    artifacts.debugOverlay = {
      summary,
      diagnostics,
      timings,
    };

    artifacts.diagnostics.add({
      plugin: 'ulde-debug-overlay',
      message: 'Debug overlay model built.',
      severity: 'info',
    });
  },

  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-debug-overlay',
      message: 'Debug Overlay plugin finished.',
      severity: 'info',
    });
  },
};
