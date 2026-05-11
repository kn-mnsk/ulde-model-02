// src/app/ulde/core/host/ulde-browser-host.ts

import { runUldePipeline } from '../lifecycle/ulde-orchestrator';
import { createUldePluginRegistry } from '../registry/ulde-plugin-registry';
import { UldeRegistry } from '../registry/ulde-registry';
import { UldePhase } from '../lifecycle/ulde-phases';

/**
 * ULDE Browser Host
 *
 * This host:
 *   1. Runs the ULDE string-phase pipeline (markdown → HTML)
 *   2. Injects the resulting HTML into a container
 *   3. Runs DOM-phase plugins (mermaid, anchors, scrollspy, etc.)
 *
 * It is intentionally simple and matches ULDE v2 teaching architecture.
 */
export class UldeBrowserHost {
  private registry: UldeRegistry;

  constructor() {
    // Build registry once
    this.registry = new UldeRegistry();
    const plugins = createUldePluginRegistry();
    for (const p of plugins) this.registry.register(p);
  }

  /**
   * Run ULDE end-to-end in the browser.
   */
  async run(container: HTMLElement, content: string) {
    // 1. Run string-phase pipeline
    const ctx = await runUldePipeline({ content });

    // 2. Inject HTML (renderer plugin stores finalHtml)
    const html = ctx.artifacts.finalHtml ?? ctx.artifacts.html ?? '';
    container.innerHTML = html;

    // 3. Run DOM-phase plugins
    const domPlugins = this.registry.getPluginsForPhase(UldePhase.DOM);

    for (const plugin of domPlugins) {
      try {
        // DOM plugins use onDomInit() instead of run()
        await plugin.onDomInit?.(container, {
          artifacts: ctx.artifacts,
          diagnostics: ctx.artifacts.diagnostics.all(),
          timings: ctx.artifacts.timings.all(),
        });
      } catch (err) {
        console.error(`[ULDE DOM Plugin Error] ${plugin.meta?.name}`, err);
      }
    }
  }
}
