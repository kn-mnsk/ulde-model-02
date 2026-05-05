// ulde/plugins/dom/ulde-scrollspy.plugin.ts

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import { ScrollSpyEntry } from '../../core/artifacts/ulde-artifacts';

export const UldeScrollSpyPlugin: UldePlugin = {
  meta: {
    name: 'scrollspy',
    description: 'Builds scrollspy entries from TOC for client-side highlighting.',
    version: '2.0.0',
    author: 'ULDE',
  },

  phase: UldePhase.DOM,

  capabilities: {
    usesDom: true,
    producesRenderArtifacts: true,
  },

  run(ctx: UldePhaseContext): void {
    const toc = ctx.artifacts.toc ?? [];
    const entries: ScrollSpyEntry[] = toc.map(entry => ({
      slug: entry.slug,
      level: entry.level,
      active: false,
    }));

    ctx.artifacts.scrollspy = entries;

    // Optional: add to Artifacts Panel
    if (ctx.artifacts.artifactsPanel) {
      ctx.artifacts.artifactsPanel.sections.push({
        title: 'ScrollSpy Entries',
        items: entries,
      });
    }
  },
};
