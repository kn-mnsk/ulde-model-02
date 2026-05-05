// ulde/core/lifecycle/ulde-orchestrator.ts

/**
 * ULDE Orchestrator (Teaching Version)
 *
 * This orchestrator:
 *   - creates the ULDE context
 *   - initializes artifacts
 *   - runs plugins in registry order
 *   - collects timings
 *   - returns the final context
 *
 * This is intentionally simple and explicit.
 */
// ulde/core/lifecycle/ulde-orchestrator.ts

import { UldePhaseContext } from './ulde-phase-context';
import { UldePhase } from './ulde-phases';
import { UldePlugin } from '../registry/ulde-plugin-api';
import { UldeConfig } from '../config/ulde-config';

export interface UldePipelineInput {
  content: string;
  plugins: UldePlugin[];
  config?: UldeConfig;
}

export async function runUldePipeline(input: UldePipelineInput): Promise<UldePhaseContext> {
  const ctx: UldePhaseContext = {
    phase: UldePhase.CONTENT,
    content: input.content,
    config: input.config ?? {},
    artifacts: {
      content: input.content,
      diagnostics: createDiagnosticsStore(),
      timings: createTimingsStore(),
    },
  };

  for (const plugin of input.plugins) {
    ctx.phase = plugin.phase;

    const start = performance.now();

    plugin.beforeRun?.(ctx);
    plugin.run(ctx);
    plugin.afterRun?.(ctx);

    const end = performance.now();

    ctx.artifacts.timings.add({
      plugin: plugin.meta.name,
      phase: plugin.phase,
      ms: end - start,
    });
  }

  return ctx;
}


// -----------------------------------------------------------
// Diagnostics store (teaching version)
// -----------------------------------------------------------
function createDiagnosticsStore() {
  const list: any[] = [];
  return {
    add(entry: any) {
      list.push(entry);
    },
    all() {
      return [...list];
    },
  };
}

// -----------------------------------------------------------
// Timings store (teaching version)
// -----------------------------------------------------------
function createTimingsStore() {
  const list: any[] = [];
  return {
    add(entry: any) {
      list.push(entry);
    },
    all() {
      return [...list];
    },
  };
}
