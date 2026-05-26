// ulde/plugins/diagnostics/ulde-broken-links.plugin.ts

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import { DiagnosticEntry } from '../../core/artifacts/ulde-artifacts';

export const UldeBrokenLinksPlugin: UldePlugin = {
  meta: {
    name: 'broken-links',
    description: 'Detects links that do not match the configured validDocs list.',
    version: '2.0.0',
    author: 'ULDE',
  },

  phase: UldePhase.DIAGNOSTICS,

  capabilities: {
    usesDiagnostics: true,
    producesRenderArtifacts: false,
  },

  beforeRun(ctx: UldePhaseContext): void {
    // Teaching note:
    // This hook is optional. Here we could log or prepare state.
    // For now, we keep it simple and do nothing.
  },

  run(ctx: UldePhaseContext): void {
    const { config, artifacts } = ctx;


    // 1. Read config safely (typed)
    const validDocs = config.validDocs ?? [];

    // 2. Read links from artifacts (typed)
    const links = artifacts.links ?? [];

    // 3. Compute broken links
    const broken = links.filter(link => !validDocs.includes(link.href));

    // 4. Add diagnostics for each broken link
    for (const link of broken) {
      const diagnostic: DiagnosticEntry = {
        plugin: this.meta.name,
        message: `Broken link: ${link.href}`,
        severity: 'warning',
      };

      ctx.artifacts.diagnostics.add(diagnostic);
    }

    // 5. Add a section to the Artifacts Panel (if enabled)
    /**done in app/ulde/plugins/assemble/ulde-artifacts-panel.plugin.ts */
    // if (ctx.artifacts.artifactsPanel) {
    //   ctx.artifacts.artifactsPanel.sections.push({
    //     title: 'Broken Links',
    //     items: broken,
    //   });
    // }

    // Teaching note:
    // We DO NOT write arbitrary fields like artifacts.brokenLinks.
    // Everything goes through typed artifacts, diagnostics, or artifactsPanel.
  },

  afterRun(ctx: UldePhaseContext): void {
    // Teaching note:
    // This hook is also optional. Could be used for logging or cleanup.
  },
};
