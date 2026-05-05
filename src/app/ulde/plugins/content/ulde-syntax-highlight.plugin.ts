// ulde/plugins/content/ulde-syntax-highlight.plugin.ts

/**
 * ULDE Syntax Highlight Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to read code blocks extracted by the Codeblocks plugin
 *   - how to annotate them with highlight metadata
 *   - how to warn about unknown or missing languages
 *   - how to prepare for a future DOM/render highlight plugin
 *
 * This plugin does NOT:
 *   - perform real syntax highlighting
 *   - modify artifacts.content
 *   - inject HTML
 *
 * The goal is to teach plugin architecture,
 * not to implement a full syntax highlighter.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import { HighlightRequest } from '../../core/artifacts/ulde-artifacts';

export const UldeSyntaxHighlightPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-syntax-highlight',
    description: 'Annotates code blocks with highlight metadata.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in CONTENT phase because it prepares metadata
  // before DOM or render plugins run.
  phase: UldePhase.CONTENT,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,      // does not rewrite markdown
    usesDiagnostics: true,         // warns about unknown languages
    usesDom: false,
    producesRenderArtifacts: true, // produces highlight metadata
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-syntax-highlight',
      message: 'Syntax Highlight plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts, config } = ctx;

    const codeblocks = artifacts.codeblocks ?? [];

    // A simple list of "known" languages.
    // In a real system, this would be dynamic or configurable.
    const knownLanguages: string[] =
      config?.highlightLanguages ?? ['ts', 'js', 'html', 'css', 'json', 'bash'];

    const highlightRequests:Array<HighlightRequest> =[];
    // const highlightRequests: Array<{
    //   index: number;
    //   language: string | null;
    //   code: string;
    //   highlight: boolean;
    //   reason?: string;
    // }> = [];

    for (const block of codeblocks) {
      const lang = block.language;

      // -----------------------------------------------------
      // 1. Warn if no language is provided
      // -----------------------------------------------------
      if (!lang) {
        artifacts.diagnostics.add({
          plugin: 'ulde-syntax-highlight',
          message: `Code block #${block.index} has no language — cannot highlight.`,
          severity: 'warning',
        });

        highlightRequests.push({
          index: block.index,
          language: '',//null,
          // code: block.code,
          highlight: false,
          // reason: 'missing-language',
        });

        continue;
      }

      // -----------------------------------------------------
      // 2. Warn if language is unknown
      // -----------------------------------------------------
      if (!knownLanguages.includes(lang)) {
        artifacts.diagnostics.add({
          plugin: 'ulde-syntax-highlight',
          message: `Unknown language "${lang}" in code block #${block.index}.`,
          severity: 'warning',
        });

        highlightRequests.push({
          index: block.index,
          language: lang,
          // code: block.code,
          highlight: false,
          // reason: 'unknown-language',
        });

        continue;
      }

      // -----------------------------------------------------
      // 3. Valid language → request highlight
      // -----------------------------------------------------
      highlightRequests.push({
        index: block.index,
        language: lang,
        // code: block.code,
        highlight: true,
      });
    }

    // -----------------------------------------------------
    // 4. Store highlight metadata
    // -----------------------------------------------------
    artifacts.highlightRequests = highlightRequests;

    artifacts.diagnostics.add({
      plugin: 'ulde-syntax-highlight',
      message: `Prepared ${highlightRequests.length} highlight request(s).`,
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-syntax-highlight',
      message: 'Syntax Highlight plugin finished.',
      severity: 'info',
    });
  },
};
