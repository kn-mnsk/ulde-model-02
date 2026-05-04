// ulde/plugins/content/ulde-containers.plugin.ts

/**
 * ULDE Containers Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to detect custom markdown containers
 *   - how to extract container type and inner content
 *   - how to store structured metadata for later DOM/render plugins
 *   - how to warn about malformed containers
 *
 * Supported syntax:
 *
 *   :::note
 *   This is a note.
 *   :::
 *
 *   :::warning
 *   Be careful!
 *   :::
 *
 * This is intentionally simple:
 *   - Only supports :::type ... ::: blocks
 *   - Does NOT support nested containers
 *   - Does NOT support attributes (e.g., :::note title="X")
 *
 * The goal is to teach plugin architecture,
 * not to implement a full container system.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeContainersPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-containers',
    description: 'Parses :::note / :::warning containers and stores metadata.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in CONTENT phase because it analyzes raw markdown.
  phase: UldePhase.CONTENT,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,      // does not rewrite markdown
    usesDiagnostics: true,         // warns about malformed containers
    usesDom: false,
    producesRenderArtifacts: true, // produces container metadata
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-containers',
      message: 'Containers plugin starting…',
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
    // 1. Detect container blocks
    // -----------------------------------------------------
    //
    // Matches:
    //
    //   :::type
    //   content...
    //   :::
    //
    // Captures:
    //   group 1 → container type (note, warning, etc.)
    //   group 2 → inner content
    //
    const containerRegex =
      /^:::(\w+)\s*\n([\s\S]*?)\n:::\s*$/gm;

    const containers: Array<{
      type: string;
      content: string;
      index: number;
    }> = [];

    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = containerRegex.exec(markdown)) !== null) {
      const type = match[1].trim();
      const content = match[2];

      // -----------------------------------------------------
      // 2. Warn about empty containers
      // -----------------------------------------------------
      if (!content.trim()) {
        artifacts.diagnostics.add({
          plugin: 'ulde-containers',
          message: `Container #${index} of type "${type}" is empty.`,
          severity: 'warning',
        });
      }

      containers.push({
        type,
        content,
        index,
      });

      index++;
    }

    // -----------------------------------------------------
    // 3. Store container metadata
    // -----------------------------------------------------
    artifacts.containers = containers;

    artifacts.diagnostics.add({
      plugin: 'ulde-containers',
      message: `Found ${containers.length} container block(s).`,
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-containers',
      message: 'Containers plugin finished.',
      severity: 'info',
    });
  },
};
