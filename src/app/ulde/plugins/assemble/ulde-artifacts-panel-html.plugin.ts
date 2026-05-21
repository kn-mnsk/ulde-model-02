// app/ulde/plugins/assemble/ulde-artifacts-panel-html.plugin.ts

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { ArtifactsPanelGroup } from '../../core/artifacts/ulde-artifacts';

export const UldeArtifactsPanelHtmlPlugin: UldePlugin = {
  meta: {
    name: 'ulde-artifacts-panel-html',
    description: 'Renders grouped HTML for the artifacts panel.',
    version: '2.0.0',
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
    // Render grouped HTML
    // -----------------------------------------------------
    const html = `
      <div class="ulde-artifacts-panel-content">

        <header class="ulde-ap-header">
          <h2>Artifacts</h2>
          <input
            type="text"
            class="ulde-ap-search"
            placeholder="Search artifacts…"
          />
        </header>

        <div class="ulde-ap-groups">
          ${groups.map(renderGroup).join('')}
        </div>

      </div>
    `;

    ctx.artifacts.finalHtml = (ctx.artifacts.finalHtml ?? '') + html;

    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-artifacts-panel-html',
      message: 'Grouped artifacts panel HTML rendered.',
      severity: 'info',
    });
  },
};

// ---------------------------------------------------------
// Render Helpers
// ---------------------------------------------------------

function renderGroup(group: ArtifactsPanelGroup): string {
  return `
    <section class="ulde-ap-group" data-group="${group.id}">
      <div class="ulde-ap-group-header">
        <span class="ulde-ap-group-icon">${group.icon}</span>
        <span class="ulde-ap-group-title">${group.title}</span>
        <span class="chevron">▸</span>
      </div>

      <div class="ulde-ap-group-body">
        ${group.sections.map(renderSection).join('')}
      </div>
    </section>
  `;
}

function renderSection(sec: any): string {
  return `
    <div class="ulde-ap-section" data-section="${sec.id}">
      <div class="ulde-ap-section-header">
        <span class="ulde-ap-icon">${sec.icon}</span>
        <span class="ulde-ap-section-title">${sec.title}</span>
        <span class="chevron">▸</span>
      </div>

      <div class="ulde-ap-section-body">
        ${sec.items.length === 0
          ? `<div class="ulde-ap-empty">No items</div>`
          : sec.items.map(renderItem).join('')}
      </div>
    </div>
  `;
}

function renderItem(item: any): string {
  return `
    <div class="ulde-ap-item">
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
