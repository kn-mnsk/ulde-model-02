// ulde/plugins/content/ulde-frontmatter.plugin.ts

/**
 * ULDE Frontmatter Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to detect YAML frontmatter at the top of a markdown file
 *   - how to parse simple key/value YAML safely (no external libs)
 *   - how to store metadata into artifacts.frontmatter
 *   - how to add diagnostics for malformed frontmatter
 *   - how to strip frontmatter from artifacts.content
 *
 * This is intentionally simple:
 *   - Only supports basic YAML: key: value
 *   - Does NOT support nested objects
 *   - Does NOT support arrays
 *   - Does NOT support multiline values
 *
 * The goal is to teach plugin architecture,
 * not to implement a full YAML parser.
 */

import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';

export const UldeFrontmatterPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-frontmatter',
    description: 'Parses YAML frontmatter and stores metadata.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in CONTENT phase because it operates on raw markdown.
  phase: UldePhase.CONTENT,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: true,       // removes frontmatter from content
    usesDiagnostics: true,         // reports malformed YAML
    usesDom: false,
    producesRenderArtifacts: false,
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx: UldePhaseContext) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-frontmatter',
      message: 'Frontmatter plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx: UldePhaseContext) {
    const { artifacts } = ctx;

    let markdown = artifacts.content;

    // -----------------------------------------------------
    // 1. Detect frontmatter block
    // -----------------------------------------------------
    //
    // YAML frontmatter looks like:
    //
    // ---
    // title: Hello
    // tags: docs
    // ---
    //
    // It must appear at the very top of the file.
    //
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

    const match = markdown.match(frontmatterRegex);

    if (!match) {
      // No frontmatter found — not an error.
      artifacts.diagnostics.add({
        plugin: 'ulde-frontmatter',
        message: 'No frontmatter found.',
        severity: 'info',
      });
      return;
    }

    const yamlBlock = match[1];

    // -----------------------------------------------------
    // 2. Parse YAML block (simple key: value pairs)
    // -----------------------------------------------------
    const metadata: Record<string, any> = {};

    const lines = yamlBlock.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) continue;

      // Must match "key: value"
      const parts = trimmed.split(':');

      if (parts.length < 2) {
        artifacts.diagnostics.add({
          plugin: 'ulde-frontmatter',
          message: `Malformed frontmatter line: "${line}"`,
          severity: 'warning',
        });
        continue;
      }

      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();

      metadata[key] = value;
    }

    // -----------------------------------------------------
    // 3. Store metadata into artifacts
    // -----------------------------------------------------
    artifacts.frontmatter = metadata;

    // -----------------------------------------------------
    // 4. Remove frontmatter from markdown content
    // -----------------------------------------------------
    markdown = markdown.replace(frontmatterRegex, '');
    artifacts.content = markdown;

    artifacts.diagnostics.add({
      plugin: 'ulde-frontmatter',
      message: `Frontmatter parsed with ${Object.keys(metadata).length} field(s).`,
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx: UldePhaseContext) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-frontmatter',
      message: 'Frontmatter plugin finished.',
      severity: 'info',
    });
  },
};
