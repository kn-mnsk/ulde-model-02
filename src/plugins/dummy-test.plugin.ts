import type { UldePlugin } from '../app/ulde/core/registry/ulde-plugin-api';
import { UldePhase } from '../app/ulde/core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../app/ulde/core/lifecycle/ulde-phase-context';


export function createDummyTestPlugin(): UldePlugin {
  return {
    meta: {
      name: 'dummy-test',
      version: '0.0.1',
      description: 'Testing IntelliSense helper file.',
    },
    phase: UldePhase.CONTENT,

    run(ctx: UldePhaseContext) {
      const { artifacts } = ctx;

      // Try typing: artifacts.
      // VS Code will show ALL artifact fields with ownership hints.
      artifacts.links;

      // Try hovering over: artifacts.links
      const links = artifacts.links;

      // Try hovering over: artifacts.timeline
      const timeline = artifacts.timeline;

      // Try hovering over: artifacts.profiler
      const profiler = artifacts.profiler;
    },
  };
}
