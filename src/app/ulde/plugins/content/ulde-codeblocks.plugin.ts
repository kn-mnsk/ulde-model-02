// ulde/plugins/content/ulde-codeblocks.plugin.ts

/**
 * ULDE Codeblocks Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to detect fenced code blocks in markdown
 *   - how to extract the language identifier (```ts, ```js, etc.)
 *   - how to store structured metadata into artifacts.codeblocks
 *   - how to add diagnostics for missing languages
 *   - how to annotate code blocks for later plugins (syntax highlight)
 *
 * This is intentionally simple:
 *   - Only supports triple-backtick fenced blocks
 *   - Does NOT support indentation-based code blocks
 *   - Does NOT support nested fences
 *   - Does NOT perform syntax highlighting
 *
 * The goal is to teach plugin architecture,
 * not to implement a full markdown parser.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { CodeblockEntry } from '../../core/artifacts/ulde-artifacts';
import { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';

export const UldeCodeblocksPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-codeblocks',
    description: 'Extracts fenced code blocks and stores metadata.',
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
    transformsContent: false,      // does not rewrite markdown
    usesDiagnostics: true,         // warns about missing languages
    usesDom: false,
    producesRenderArtifacts: false,
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx: UldePhaseContext) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-codeblocks',
      message: 'Codeblocks plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx: UldePhaseContext) {
    const { artifacts } = ctx;

    const markdown = artifacts.content;

    // -----------------------------------------------------
    // 1. Detect fenced code blocks
    // -----------------------------------------------------
    //
    // Matches:
    //
    // ```ts
    // console.log("Hello");
    // ```
    //
    // Captures:
    //   group 1 → language (optional)
    //   group 2 → code content
    //
    const codeblockRegex =
      /```([a-zA-Z0-9_-]*)\s*\n([\s\S]*?)```/g;

    const codeblocks: Array<CodeblockEntry> = [];

    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = codeblockRegex.exec(markdown)) !== null) {
      const lang = match[1]?.trim();
      // const lang = match[1]?.trim() || null;
      const code = match[2];

      if (!lang) {
        artifacts.diagnostics.add({
          plugin: 'ulde-codeblocks',
          message: `Code block #${index} has no language identifier.`,
          severity: 'warning',
        });
      }

      codeblocks.push({
        language: lang,
        code,
        index,
      });

      index++;
    }

    // -----------------------------------------------------
    // 2. Store codeblocks into artifacts
    // -----------------------------------------------------
    artifacts.codeblocks = codeblocks;

    artifacts.diagnostics.add({
      plugin: 'ulde-codeblocks',
      message: `Codeblock(s) Found ${codeblocks.length} code block(s).`,
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx: UldePhaseContext) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-codeblocks',
      message: 'Codeblocks plugin finished.',
      severity: 'info',
    });
  },
};
