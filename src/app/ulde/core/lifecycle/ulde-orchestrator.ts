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
import { UldePhase } from './ulde-phases';
import { UldePhaseContext } from './ulde-phase-context';
import { createUldePluginRegistry } from '../registry/ulde-plugin-registry';
import { UldeRegistry } from '../registry/ulde-registry';
import { UldeConfig } from '../config/ulde-config';

export interface UldePipelineInput {
  content: string;
  config?: UldeConfig;
}

export async function runUldePipeline(input: UldePipelineInput): Promise<UldePhaseContext> {
  // 1. Build plugin registry
  const registry = new UldeRegistry();
  const plugins = createUldePluginRegistry();

  for (const plugin of plugins) {
    registry.register(plugin);
  }

  // 2. Create initial context
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

  // 3. Execute plugins phase-by-phase
  const phases = [
    UldePhase.CONTENT,
    UldePhase.DIAGNOSTICS,
    UldePhase.DOM,
    UldePhase.RENDER,
  ];

  for (const phase of phases) {
    ctx.phase = phase;

    const phasePlugins = registry.getPluginsForPhase(phase);

    for (const plugin of phasePlugins) {
      const start = performance.now();

      plugin.beforeRun?.(ctx);
      await plugin.run(ctx);
      plugin.afterRun?.(ctx);

      const end = performance.now();

      ctx.artifacts.timings.add({
        plugin: plugin.meta.name,
        phase: plugin.phase,
        ms: end - start,
      });
    }
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
