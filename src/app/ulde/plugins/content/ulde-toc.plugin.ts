// ulde/plugins/content/ulde-toc.plugin.ts

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import { TocEntry } from '../../core/artifacts/ulde-artifacts';

export const UldeTocPlugin: UldePlugin = {
  meta: {
    name: 'toc',
    description: 'Extracts headings from content and builds a table of contents.',
    version: '2.0.0',
    author: 'ULDE',
  },

  phase: UldePhase.CONTENT,

  capabilities: {
    transformsContent: false,
    producesRenderArtifacts: true,
  },

  run(ctx: UldePhaseContext): void {
    const lines = ctx.content.split('\n');
    const toc: TocEntry[] = [];

    for (const line of lines) {
      const match = /^(#{1,6})\s+(.*)$/.exec(line);
      if (!match) continue;

      const level = match[1].length;
      const text = match[2].trim();
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      toc.push({ level, text, slug });
    }

    ctx.artifacts.toc = toc;

    // Optional: add TOC to Artifacts Panel
    /**done in app/ulde/plugins/assemble/ulde-artifacts-panel.plugin.ts */
    // if (ctx.artifacts.artifactsPanel) {
    //   ctx.artifacts.artifactsPanel.sections.push({
    //     title: 'Table of Contents',
    //     items: toc,
    //   });
    // }

  },
};
