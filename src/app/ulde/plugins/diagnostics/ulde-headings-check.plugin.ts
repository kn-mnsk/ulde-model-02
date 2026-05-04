// ulde/plugins/diagnostics/ulde-headings-check.plugin.ts

/**
 * ULDE Headings Check Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to scan markdown headings
 *   - how to detect heading level jumps (e.g., H2 → H4)
 *   - how to warn about missing H1
 *   - how to add diagnostics without modifying content
 *
 * This is intentionally simple:
 *   - Only detects ATX-style headings (#, ##, ###, ...)
 *   - Does NOT detect Setext headings (===, ---)
 *   - Does NOT validate heading text
 *
 * The goal is to teach plugin architecture,
 * not to implement a full markdown linter.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeHeadingsCheckPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-headings-check',
    description: 'Checks heading structure and reports level jumps.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in DIAGNOSTICS phase because it analyzes structure
  // after content plugins have run.
  phase: UldePhase.DIAGNOSTICS,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,      // does not modify markdown
    usesDiagnostics: true,         // reports structural issues
    usesDom: false,
    producesRenderArtifacts: false,
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-headings-check',
      message: 'Headings Check plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts } = ctx;

    const markdown = artifacts.content;

    // -----------------------------------------------------
    // 1. Extract headings
    // -----------------------------------------------------
    //
    // Matches:
    //   # Title
    //   ## Section
    //   ### Subsection
    //
    const headingRegex = /^(#{1,6})\s+(.*)$/gm;

    const headings: Array<{ level: number; text: string; line: number }> = [];

    let match: RegExpExecArray | null;
    let lineNumber = 1;

    // We need to track line numbers manually
    const lines = markdown.split('\n');

    for (const line of lines) {
      const m = headingRegex.exec(line);
      // const m = /^(#{1,6})\s+(.*)$/.exec(line);
      if (m) {
        headings.push({
          level: m[1].length,
          text: m[2].trim(),
          line: lineNumber,
        });
      }
      lineNumber++;
    }

    // -----------------------------------------------------
    // 2. Warn if no H1 exists
    // -----------------------------------------------------
    const hasH1 = headings.some(h => h.level === 1);

    if (!hasH1) {
      artifacts.diagnostics.add({
        plugin: 'ulde-headings-check',
        message: 'Document has no H1 heading.',
        severity: 'warning',
      });
    }

    // -----------------------------------------------------
    // 3. Detect heading level jumps
    // -----------------------------------------------------
    //
    // Example of a jump:
    //   ## Section (level 2)
    //   #### Subsection (level 4)  ← jump of 2 levels
    //
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1];
      const curr = headings[i];

      const diff = curr.level - prev.level;

      if (diff > 1) {
        artifacts.diagnostics.add({
          plugin: 'ulde-headings-check',
          message: `Heading level jump from H${prev.level} to H${curr.level} at line ${curr.line}.`,
          severity: 'warning',
        });
      }
    }

    // -----------------------------------------------------
    // 4. Store debug info (optional)
    // -----------------------------------------------------
    artifacts.headingStructure = headings;

    artifacts.diagnostics.add({
      plugin: 'ulde-headings-check',
      message: `Checked ${headings.length} heading(s).`,
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-headings-check',
      message: 'Headings Check plugin finished.',
      severity: 'info',
    });
  },
};
