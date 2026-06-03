// app/ulde/plugins/assemble/ulde-debug-overlay-html.plugin.ts

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';

export const UldeDebugOverlayHtmlPlugin: UldePlugin = {
  meta: {
    name: 'ulde-debug-overlay-html',
    description: 'Renders unified devtools HTML for the debug overlay.',
    version: '3.0.0',
  },

  phase: UldePhase.ASSEMBLE,

  capabilities: {
    transformsContent: false,
    producesRenderArtifacts: true,
  },

  run(ctx: UldePhaseContext) {
    const { artifacts } = ctx;

    const model = artifacts.debugOverlay;
    if (!model) return;

    const { summary, diagnostics, timings } = model;

    // -----------------------------------------------------
    // Unified Devtools HTML
    // -----------------------------------------------------
    const html = `
      <div class="dt-panel-content">

        <!-- Header -->
        <header class="dt-header">
          <div class="dt-title">Debug Overlay</div>
          <input class="dt-search" placeholder="Search…" />
          <div class="dt-drag-handle">⣿</div>
        </header>

        <!-- Summary -->
        <section class="dt-section" data-section="summary">
          <div class="dt-section-title">
            <span>Summary</span>
          </div>
          <div class="dt-section-body">
            <div class="dt-item">Total Diagnostics: ${summary.totalDiagnostics}</div>
            <div class="dt-item">Total Plugins: ${summary.totalPlugins}</div>
            <div class="dt-item">Total Time: ${summary.totalTimeMs.toPrecision(5)} ms</div>
          </div>
        </section>

        <!-- Diagnostics -->
        <section class="dt-section" data-section="diagnostics">
          <div class="dt-section-title">
            <span>Diagnostics</span>
          </div>
          <div class="dt-section-body">
            ${
              diagnostics.length === 0
                ? `<div class="dt-empty">No diagnostics</div>`
                : diagnostics.map(renderDiagnostic).join('')
            }
          </div>
        </section>

        <!-- Timings -->
        <section class="dt-section" data-section="timings">
          <div class="dt-section-title">
            <span>Timings</span>
          </div>
          <div class="dt-section-body">
            ${
              timings.length === 0
                ? `<div class="dt-empty">No timings</div>`
                : timings.map(renderTiming).join('')
            }
          </div>
        </section>

      </div>
    `;

    artifacts.finalHtml = (artifacts.finalHtml ?? '') + html;

    artifacts.diagnostics.add({
      plugin: 'ulde-debug-overlay-html',
      message: 'Unified devtools Debug Overlay HTML rendered.',
      severity: 'info',
    });
  },
};

// ---------------------------------------------------------
// Render Helpers
// ---------------------------------------------------------

function renderDiagnostic(d: any): string {
  return `
    <div class="dt-item dt-${d.severity}">
      <span class="dt-item-plugin">${d.plugin}</span>
      <span class="dt-item-msg">${escapeHtml(d.message)}</span>
    </div>
  `;
}

function renderTiming(t: any): string {
  return `
    <div class="dt-item">
      <span class="dt-item-plugin">${t.plugin}</span>
      <span class="dt-item-phase">${t.phase}</span>
      <span class="dt-item-time">${t.ms.toPrecision(5)} ms</span>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
