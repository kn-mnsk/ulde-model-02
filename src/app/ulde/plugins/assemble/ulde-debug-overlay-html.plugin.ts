// app/ulde/plugins/assemble/ulde-adebug-overlay-html.plugin.ts

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { ArtifactsPanelGroup } from '../../core/artifacts/ulde-artifacts';

export const UldeDebugOverlayHtmlPlugin: UldePlugin = {
  meta: {
    name: 'ulde-overlay-debug-html',
    description: 'Renders HTML for the debug pverlay.',
    version: '2.0.0',
  },

  phase: UldePhase.ASSEMBLE,

  capabilities: {
    transformsContent: false,
    producesRenderArtifacts: true,
  },

  run(ctx) {

    const debugOverlay = ctx.artifacts.debugOverlay;
    if (!debugOverlay) return;

    const diagnostics = debugOverlay.diagnostics
    const summary = debugOverlay.summary
    const timings = debugOverlay.timings

    // -----------------------------------------------------
    // Render debug overlay HTML
    // -----------------------------------------------------
    const debugOverlayHtml = `
      <div class="ulde-debug-overlay-content">

        <header class="ulde-debug-overlay-header">
          <h2>Debug Overlay</h2>
          <input
            name="input"
            type="text"
            class="ulde-ap-search"
            placeholder="Search artifacts…"
          />
        </header>

        <div class="ulde-debug-overlay-summary">
          <span>Total Giagnostics: ${summary.totalDiagnostics}</span>
          <span>Total Plugins: ${summary.totalPlugins}</span>
          <span>Total Time (ms): ${summary.totalTimeMs.toPrecision(5)}</span>
        </div>

        <div class="ulde-debug-overlay-summary">
          <span>Total Giagnostics: ${summary.totalDiagnostics}</span>
          <span>Total Plugins: ${summary.totalPlugins}</span>
          <span>Total Time (ms): ${summary.totalTimeMs.toPrecision(5)}</span>
        </div>

        <div class="ulde-debug-overlay-entry">
          ${diagnostics.length === 0
        ? `<div class="ulde-ap-empty">No Entries</div>`
        : diagnostics.map(renderItem).join('')}
        </div>

      </div>
`


    // ---------------------------------------------------------
    // Utility
    // ---------------------------------------------------------

    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }


    function renderItem(item: any): string {
      return `
    <div class="ulde-ap-item">
      <pre>${escapeHtml(JSON.stringify(item, null, 2))}</pre>
    </div>
  `;
    }

  }
  
}
