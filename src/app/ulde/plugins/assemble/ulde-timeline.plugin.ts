import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import type { TimelineEntry, TimelineModel } from '../../core/artifacts/ulde-artifacts';

export const UldeTimelinePlugin: UldePlugin = {
  meta: {
    name: 'ulde-timeline',
    version: '1.0.0',
    description: 'Builds a timeline model from timing entries.',
  },
  phase: UldePhase.ASSEMBLE,
  // phase: UldePhase.DIAGNOSTICS,

  run(ctx: UldePhaseContext) {
    const { artifacts } = ctx;

    const timings: TimelineEntry[] = artifacts.timings.all();

    if (timings.length === 0) {
      const emptyTimeline: TimelineModel = {
        entries: [],
        totalMs: 0,
      };
      artifacts.timeline = emptyTimeline;
      return;
    }

    const entries: TimelineEntry[] = timings.map(t => ({
      plugin: t.plugin,
      phase: t.phase,
      ms: t.ms,
    }));

    const totalMs = entries.reduce((sum, e) => sum + e.ms, 0);


    const timeline: TimelineModel = {
      entries,
      totalMs,
    };

    artifacts.timeline = timeline;


    artifacts.diagnostics.add({
      plugin: 'ulde-timeline',
      message: 'Timeline model built.',
      severity: 'info',
    });

  },
};

