// ulde/plugins/dom/ulde-anchors.plugin.ts

/**
 * ULDE Anchors Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to generate stable heading IDs (slugs)
 *   - how to detect duplicate slugs
 *   - how to store anchor metadata for DOM-phase plugins
 *   - how to warn about structural issues
 *
 * This plugin does NOT:
 *   - modify HTML directly
 *   - inject <a> tags
 *   - rewrite artifacts.content
 *
 * The goal is to teach plugin architecture,
 * not to implement a full DOM transformer.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeAnchorsPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-anchors',
    description: 'Generates heading IDs and anchor metadata.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in DOM phase because it prepares data for DOM manipulation.
  phase: UldePhase.DOM,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,      // does not rewrite markdown
    usesDiagnostics: true,         // warns about duplicate slugs
    usesDom: true,                 // DOM-phase plugin
    producesRenderArtifacts: true, // produces anchor metadata
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-anchors',
      message: 'Anchors plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts } = ctx;

    // We rely on headingStructure created by the Headings Check plugin.
    const headings = artifacts.anchors ?? [];
    // const headings = artifacts.headingStructure ?? [];

    const anchors: Array<{
      text: string;
      level: number;
      slug: string;
      index: number;
    }> = [];

    const slugCounts: Record<string, number> = {};

    // -----------------------------------------------------
    // 1. Generate slugs for each heading
    // -----------------------------------------------------
    for (let i = 0; i < headings.length; i++) {
      const h = headings[i];

      // Basic slug generator:
      //   - lowercase
      //   - remove non-alphanumerics
      //   - replace spaces with hyphens
      let slug = h.text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      // -----------------------------------------------------
      // 2. Detect duplicate slugs
      // -----------------------------------------------------
      if (slugCounts[slug]) {
        slugCounts[slug]++;

        const newSlug = `${slug}-${slugCounts[slug]}`;

        ctx.artifacts.diagnostics.add({
          plugin: 'ulde-anchors',
          message: `Duplicate heading slug "${slug}" detected. Renamed to "${newSlug}".`,
          severity: 'warning',
        });

        slug = newSlug;
      } else {
        slugCounts[slug] = 1;
      }

      anchors.push({
        text: h.text,
        level: h.level,
        slug,
        index: i,
      });
    }

    // -----------------------------------------------------
    // 3. Store anchor metadata
    // -----------------------------------------------------
    artifacts.anchors = anchors;

    artifacts.diagnostics.add({
      plugin: 'ulde-anchors',
      message: `Generated ${anchors.length} anchor(s).`,
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-anchors',
      message: 'Anchors plugin finished.',
      severity: 'info',
    });
  },
};
