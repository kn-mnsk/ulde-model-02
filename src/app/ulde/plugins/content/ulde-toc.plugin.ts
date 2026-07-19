// ulde/plugins/content/ulde-toc.plugin.ts

import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import type { TocEntry } from '../../core/artifacts/ulde-artifacts';

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

    const { content, artifacts } = ctx;

    const lines = content.split('\n');
    const toc: TocEntry[] = [];

    for (const line of lines) {

      const regex = /^(#{1,6})\s+(.*)/;
      // const regex = /^(#{1,6})\s+(.*)$/;
      const match = regex.exec(line);

      if (!match) continue;

      const level = match[1].length;
      const text = match[2].trim();
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      toc.push({ level, text, slug });
    }

    artifacts.toc = toc;

    // console.log(`Log: [UldeTocPlugin] run toc=`, toc);

    artifacts.diagnostics.add({
      plugin: 'ulde-toc',
      message: `TOC parsed with ${toc.length} toc(s).`,
      severity: 'info',
    });

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
