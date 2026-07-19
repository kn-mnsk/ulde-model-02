// app/ulde/plugins/assemble/ulde-artifacts-panel-html.plugin.ts

import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { ArtifactsPanelGroup } from '../../core/artifacts/ulde-artifacts';

export const UldeArtifactsPanelHtmlPlugin: UldePlugin = {
  meta: {
    name: 'ulde-artifacts-panel-html',
    description: 'Renders unified devtools HTML for the artifacts panel.',
    version: '3.0.0',
  },

  phase: UldePhase.ASSEMBLE,

  capabilities: {
    transformsContent: false,
    producesRenderArtifacts: true,
  },

  run(ctx) {
    const panel = ctx.artifacts.artifactsPanel;
    if (!panel?.groups) return;

    const groups = panel.groups as ArtifactsPanelGroup[];

    // -----------------------------------------------------
    // Render unified devtools HTML
    // -----------------------------------------------------
    const html = `
      <div class="dt-artifacts-panel-content">

        <!-- Header -->
        <header class="dt-header">
          <div class="dt-title">Artifacts</div>
          <input name="artifacts" type="text" class="dt-search" placeholder="Search artifacts…" />
          <div class="dt-drag-handle">⣿</div>
        </header>

        <!-- Groups -->
        <div class="dt-groups">
          ${groups.map(renderGroup).join('')}
        </div>

      </div>
    `;

    ctx.artifacts.finalHtml = (ctx.artifacts.finalHtml ?? '') + html;

    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-artifacts-panel-html',
      message: 'Unified devtools Artifacts Panel HTML rendered.',
      severity: 'info',
    });
  },
};

// ---------------------------------------------------------
// Render Helpers
// ---------------------------------------------------------

function renderGroup(group: ArtifactsPanelGroup): string {
  return `
    <section class="dt-section" data-group="${group.id}">
      <div class="dt-section-title">
        <span>${group.icon} ${group.title}</span>
      </div>

      <div class="dt-section-body">
        ${group.sections.map(renderSection).join('')}
      </div>
    </section>
  `;
}

function renderSection(sec: any): string {
  return `
    <div class="dt-section" data-section="${sec.id}">
      <div class="dt-section-title">
        <span>${sec.icon} ${sec.title}</span>
      </div>

      <div class="dt-section-body">
        ${
          sec.items.length === 0
            ? `<div class="dt-empty">No items</div>`
            : sec.items.map(renderItem).join('')
        }
      </div>
    </div>
  `;
}

function renderItem(item: any): string {
  return `
    <div class="dt-item">
      <pre>${escapeHtml(JSON.stringify(item, null, 2))}</pre>
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
