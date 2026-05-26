// app/ulde/plugins/assemble/ulde-adebug-overlay-html.plugin.ts

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';

export const UldeDebugOverlayHtmlPlugin: UldePlugin = {
  meta: {
    name: 'ulde-debug-overlay-html',
    description: 'Renders HTML for the debug overlay.',
    version: '2.0.0',
  },

  phase: UldePhase.ASSEMBLE,

  capabilities: {
    transformsContent: false,
    producesRenderArtifacts: true,
  },

  run(ctx: UldePhaseContext) {
    const { artifacts } = ctx;

    const debugOverlay = artifacts.debugOverlay;
    if (!debugOverlay) return;

    const diagnostics = debugOverlay.diagnostics
    const summary = debugOverlay.summary
    const timings = debugOverlay.timings

    // -----------------------------------------------------
    // Render debug overlay HTML
    // -----------------------------------------------------
    const debugOverlayHtml = `
      <div class="ulde-debug-overlay-content">

        <header class="ap-header">
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

        <div class="ulde-debug-overlay-diagnostics">
          <div class="ulde-debug-overlay-diagnostics-header">
            <span class="ulde-debug-overlay-diagnostics-title">Diagnostic</span>
          </div>
          <div class="ulde-debug-overlay-diagnostics-body">
            ${diagnostics.length === 0
        ? `<div class="ulde-ap-empty">No Diagnostics Entries</div>`
        : diagnostics.map(renderEntry).join('')}
          </div>
        </div>

        <div class="ulde-debug-overlay-timings">
          <div class="ulde-debug-overlay-timings-header">
            <span class="ulde-debug-overlay-timings-title">Diagnostic</span>
          </div>
          <div class="ulde-debug-overlay-timings-body">
            ${timings.length === 0
        ? `<div class="ulde-ap-empty">No Timings Entries</div>`
        : timings.map(renderEntry).join('')}
          </div>
        </div>

      </div>
    `;

    artifacts.html = (artifacts.html ?? '') + debugOverlayHtml;
    artifacts.finalHtml = (artifacts.finalHtml ?? '') + debugOverlayHtml;

    // console.log(`Log: [UldeDebugOverlayHtmlPlugin] debugOverlatHtml=`, debugOverlayHtml);

    artifacts.diagnostics.add({
      plugin: 'ulde-debug-overlay-html',
      message: 'Debug Overlay HTML rendered.',
      severity: 'info',
    });

  },

};


// ---------------------------------------------------------
// Render Helpers
// ---------------------------------------------------------
function renderEntry(entry: any): string {
  return `
    <div class="ulde-ap-item">
      <pre>${escapeHtml(JSON.stringify(entry, null, 2))}</pre>
    </div>
  `;
}

// ---------------------------------------------------------
// Utility
// ---------------------------------------------------------
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

