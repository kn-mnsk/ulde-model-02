// app/ulde/plugins/assemble/ulde-debug-overlay.plugin.ts

import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import type { DebugOverlayModel, DiagnosticEntry, TimelineEntry } from '../../core/artifacts/ulde-artifacts';

export function createUldeDebugOverlayPlugin(): UldePlugin {
  return {
    meta: {
      name: 'ulde-debug-overlay',
      version: '1.0.0',
      description: 'Builds a debug overlay model from diagnostics and timings.',
    },
    phase: UldePhase.ASSEMBLE,
    // phase: UldePhase.RENDER,

    run(ctx: UldePhaseContext) {
      const { artifacts, config } = ctx;

      if (!config.enableDebugOverlay) return;

      const diagnostics: DiagnosticEntry[] = artifacts.diagnostics.all();
      const timings: TimelineEntry[] = artifacts.timings.all();

      const summary: DebugOverlayModel['summary'] = {
        totalPlugins: new Set(timings.map(t => t.plugin)).size,
        totalDiagnostics: diagnostics.length,
        totalTimeMs: timings.reduce((sum, t) => sum + t.ms, 0),
      };

      const debugOverlay: DebugOverlayModel = {
        summary,
        diagnostics,
        timings,
      };

      artifacts.debugOverlay = debugOverlay;
    },
  };
}
