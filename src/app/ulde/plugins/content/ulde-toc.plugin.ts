// ulde/plugins/content/ulde-toc.plugin.ts

/**
 * ULDE TOC Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to read artifacts.content
 *   - how to extract headings
 *   - how to build a table of contents structure
 *   - how to write artifacts.toc
 *   - how to add diagnostics
 *   - how to use the Plugin API v2
 *
 * This is intentionally simple:
 *   - It does NOT parse markdown fully
 *   - It only detects headings via regex
 *   - It does not generate slugs (yet)
 *
 * The goal is to teach plugin architecture,
 * not to implement a perfect TOC generator.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeTocPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-toc',
    description: 'Extracts headings from markdown and builds a TOC array.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // This plugin runs in the CONTENT phase because it reads
  // and analyzes the markdown before any DOM or render steps.
  phase: UldePhase.CONTENT,

  // ---------------------------------------------------------
  // 3. Capabilities (optional but recommended)
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,      // does not modify markdown
    usesDiagnostics: true,         // may add warnings
    usesDom: false,                // no DOM operations
    producesRenderArtifacts: false // does not produce UI artifacts
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    // This is purely educational.
    // In real plugins, this might log or prepare state.
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-toc',
      message: 'TOC plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts } = ctx;

    const markdown = artifacts.content;

    // Basic heading regex:
    //   - matches lines starting with 1–6 '#' characters
    //   - captures the heading level
    //   - captures the heading text
    const headingRegex = /^(#{1,6})\s+(.*)$/gm;

    const toc: Array<{ level: number; text: string }> = [];

    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const hashes = match[1];
      const text = match[2].trim();

      toc.push({
        level: hashes.length,
        text,
      });
    }

    // If no headings found, warn the user.
    if (toc.length === 0) {
      artifacts.diagnostics.add({
        plugin: 'ulde-toc',
        message: 'No headings found — TOC will be empty.',
        severity: 'warning',
      });
    }

    // Store the TOC in artifacts.
    artifacts.toc = toc;
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-toc',
      message: 'TOC plugin finished.',
      severity: 'info',
    });
  },
};
