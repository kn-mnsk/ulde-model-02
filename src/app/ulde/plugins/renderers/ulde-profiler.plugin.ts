import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import type { ProfilerModel, ProfilerPhaseEntry, MemorySnapshot } from '../../core/artifacts/ulde-artifacts';

export function createUldeProfilerPlugin(): UldePlugin {
  return {
    meta: {
      name: 'ulde-profiler',
      version: '1.0.0',
      description: 'Aggregates profiling information across phases.',
    },
    phase: UldePhase.DIAGNOSTICS,

    run(ctx: UldePhaseContext) {
      const { artifacts, config } = ctx;

      if (!config.enableProfiler) return;

      const timings = artifacts.timings.all();

      const phasesMap = new Map<string, { totalMs: number; plugins: Map<string, number> }>();

      for (const t of timings) {
        if (!phasesMap.has(t.phase)) {
          phasesMap.set(t.phase, {
            totalMs: 0,
            plugins: new Map(),
          });
        }
        const phase = phasesMap.get(t.phase)!;
        phase.totalMs += t.ms;
        phase.plugins.set(
          t.plugin,
          (phase.plugins.get(t.plugin) ?? 0) + t.ms
        );
      }

      const phases: ProfilerPhaseEntry[] = Array.from(phasesMap.entries()).map(
        ([phase, data]) => ({
          phase,
          totalMs: data.totalMs,
          overheadMs: 0,
          plugins: Array.from(data.plugins.entries()).map(
            ([plugin, ms]) => ({ plugin, ms })
          ),
        })
      );

      const memorySnapshots: MemorySnapshot[] = [];

      const summary: ProfilerModel['summary'] = {
        totalPlugins: new Set(timings.map(t => t.plugin)).size,
        totalPhases: phases.length,
        totalTimeMs: timings.reduce((sum, t) => sum + t.ms, 0),
      };

      const profiler: ProfilerModel = {
        phases,
        memorySnapshots,
        anomalies: [],
        summary,
      };

      artifacts.profiler = profiler;
    },
  };
}
