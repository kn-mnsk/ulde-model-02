// ulde/core/registry/ulde-plugin-api.ts

/**
 * ULDE Plugin API v2 (Teaching Version)
 *
 * This file explains the entire plugin contract in a self-contained,
 * pedagogical way. It is intentionally verbose and explicit.
 *
 * The goal:
 *   - Make plugin development obvious
 *   - Show WHY each field exists
 *   - Show HOW plugins interact with the orchestrator
 *
 * This is the "model ULDE" plugin API — small, readable, and stable.
 */

import { UldePhase } from '../lifecycle/ulde-phases';
import type { UldePhaseContext } from '../lifecycle/ulde-phase-context';
/**
 * Plugin metadata describes WHAT the plugin is.
 *
 * This is not used by the orchestrator directly,
 * but it is essential for:
 *   - diagnostics
 *   - debugging
 *   - plugin panels
 *   - developer tools
 */
export interface UldePluginMeta {
  /** Human-readable plugin name */
  name: string;

  /** Short description for docs and diagnostics */
  description?: string;

  /** Optional version string (not enforced) */
  version?: string;

  /** Optional author field (for plugin ecosystems) */
  author?: string;
}

/**
 * Plugin capabilities describe WHAT the plugin can do.
 *
 * This is intentionally simple in the model ULDE.
 * In ULDE v3, this becomes more powerful (capability negotiation).
 */
export interface UldePluginCapabilities {
  /** Whether the plugin mutates artifacts.content */
  transformsContent?: boolean;

  /** Whether the plugin reads or writes diagnostics */
  usesDiagnostics?: boolean;

  /** Whether the plugin performs DOM-like transformations */
  usesDom?: boolean;

  /** Whether the plugin produces visual artifacts (timeline, overlay, etc.) */
  producesRenderArtifacts?: boolean;
}

/**
 * The core plugin interface.
 *
 * Every plugin must implement:
 *   - meta: metadata
 *   - phase: which lifecycle phase it belongs to
 *   - run(): the plugin's main logic
 *
 * Everything else is optional.
 */
export interface UldePlugin {
  /** Metadata describing the plugin */
  meta: UldePluginMeta;

  /** The lifecycle phase this plugin runs in */
  phase: UldePhase;

  /**
   * Capabilities describe what the plugin does.
   * This is optional but strongly recommended.
   */
  capabilities?: UldePluginCapabilities;

  /**
   * The main plugin function.
   *
   * It receives a UldePhaseContext:
   *   - phase: the current lifecycle phase
   *   - artifacts: shared mutable state
   *   - config: user config
   *
   * Plugins may:
   *   - mutate artifacts.content
   *   - add diagnostics
   *   - record timings (orchestrator does this automatically)
   *   - add fields to artifacts
   *
   * Plugins may be synchronous or asynchronous.
   */
  run(ctx: UldePhaseContext): Promise<void> | void;

  /**
   * Optional hook: called BEFORE the plugin runs.
   * Useful for debugging or plugin panels.
   */
  beforeRun?(ctx: UldePhaseContext): void;

  /**
   * Optional hook: called AFTER the plugin runs.
   * Useful for cleanup or instrumentation.
   */
  afterRun?(ctx: UldePhaseContext): void;
}
