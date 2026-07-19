// ulde/core/lifecycle/ulde-orchestrator.ts

import { UldePhase } from './ulde-phases';
import type { UldePhaseContext } from './ulde-phase-context';
import { createUldeStringPluginRegistry } from '../registry/ulde-plugin-registry';
import { UldeRegistry } from '../registry/ulde-registry';
import type { UldeConfig } from '../config/ulde-config';

/**
 * ULDE Pipeline Input
 */
export interface UldePipelineInput {
  content: string;
  config?: UldeConfig;
}

/**
 * ULDE v3 Pipeline
 *
 * Runs the 4-phase string-based pipeline:
 *   1. CONTENT
 *   2. TRANSFORM
 *   3. DIAGNOSTICS
 *   4. ASSEMBLE
 *
 * Browser DOM plugins are NOT executed here.
 */
export async function runUldeStringPluginPipeline(
  input: UldePipelineInput
): Promise<UldePhaseContext> {

  // ---------------------------------------------------------
  // 1. Build plugin registry
  // ---------------------------------------------------------
  const registry = new UldeRegistry();
  const plugins = createUldeStringPluginRegistry();

  for (const plugin of plugins) {
    registry.register(plugin);
  }

  // ---------------------------------------------------------
  // 2. Create initial context
  // ---------------------------------------------------------
  const ctx: UldePhaseContext = {
    phase: UldePhase.CONTENT,
    content: input.content,
    config: input.config ?? {},
    artifacts: {
      content: input.content,
      html: '',
      finalHtml: '',
      diagnostics: createDiagnosticsStore(),
      timings: createTimingsStore(),
    },
  };

  // ---------------------------------------------------------
  // 3. Execute phases in order
  // ---------------------------------------------------------
  const phases: UldePhase[] = [
    UldePhase.CONTENT,
    UldePhase.TRANSFORM,
    UldePhase.DIAGNOSTICS,
    UldePhase.ASSEMBLE,
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
        phase,
        ms: end - start,
      });
    }
  }

  return ctx;
}

// -----------------------------------------------------------
// Diagnostics store
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
// Timings store
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
