// ulde/plugins/diagnostics/ulde-headings-check.plugin.ts

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import { DiagnosticEntry } from '../../core/artifacts/ulde-artifacts';

export const UldeHeadingsCheckPlugin: UldePlugin = {
  meta: {
    name: 'headings-check',
    description: 'Checks for heading level jumps (e.g., h2 → h4).',
    version: '2.0.0',
    author: 'ULDE',
  },

  phase: UldePhase.DIAGNOSTICS,

  capabilities: {
    usesDiagnostics: true,
  },

  run(ctx: UldePhaseContext): void {
    const { artifacts } = ctx;

    const toc = artifacts.toc ?? [];
    if (toc.length === 0) return;

    let lastLevel = toc[0].level;

    for (const entry of toc) {
      const diff = entry.level - lastLevel;

      if (diff > 1) {
        const diagnostic: DiagnosticEntry = {
          plugin: this.meta.name,
          message: `Heading level jump: from h${lastLevel} to h${entry.level} ("${entry.text}")`,
          severity: 'warning',
        };

        artifacts.diagnostics.add(diagnostic);
      }

      lastLevel = entry.level;
    }

    // Optional: add a summary section to Artifacts Panel
    /**done in app/ulde/plugins/assemble/ulde-artifacts-panel.plugin.ts */
    // if (ctx.artifacts.artifactsPanel) {
    //   ctx.artifacts.artifactsPanel.sections.push({
    //     title: 'Headings Check',
    //     items: toc,
    //   });
    // }

  },
};
