// ulde/plugins/renderers/ulde-renderer.plugin.ts

/**
 * ULDE Renderer Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to convert markdown → HTML in a minimal, predictable way
 *   - how to support basic markdown features (headings, paragraphs, code, lists)
 *   - how to prepare HTML for DOM-phase plugins (anchors, containers, highlight)
 *   - how to add diagnostics for unsupported markdown
 *
 * This is intentionally simple:
 *   - NOT a full markdown engine
 *   - does NOT support nested lists
 *   - does NOT support inline HTML
 *   - does NOT support tables
 *
 * The goal is to teach plugin architecture,
 * not to implement a full markdown parser.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeRendererPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-renderer',
    description: 'Minimal markdown → HTML renderer (teaching version).',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in RENDER phase because it produces HTML.
  phase: UldePhase.RENDER,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: true,       // rewrites markdown → HTML
    usesDiagnostics: true,         // warns about unsupported markdown
    usesDom: false,
    producesRenderArtifacts: true, // produces HTML output
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-renderer',
      message: 'Renderer plugin starting…',
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
    // 1. Split into lines
    // -----------------------------------------------------
    const lines = markdown.split('\n');

    const htmlLines: string[] = [];

    // -----------------------------------------------------
    // 2. Simple state machine for code blocks
    // -----------------------------------------------------
    let inCode = false;
    let codeLang: string | null = null;
    let codeBuffer: string[] = [];

    const flushCode = () => {
      if (!inCode) return;

      htmlLines.push(
        `<pre><code data-lang="${codeLang ?? ''}">` +
          codeBuffer.join('\n') +
        `</code></pre>`
      );

      inCode = false;
      codeLang = null;
      codeBuffer = [];
    };

    // -----------------------------------------------------
    // 3. Process each line
    // -----------------------------------------------------
    for (const line of lines) {
      // Code block start/end
      const codeMatch = /^```(\w*)/.exec(line);

      if (codeMatch) {
        if (!inCode) {
          // Start code block
          inCode = true;
          codeLang = codeMatch[1] || null;
        } else {
          // End code block
          flushCode();
        }
        continue;
      }

      if (inCode) {
        codeBuffer.push(line);
        continue;
      }

      // Headings
      const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        htmlLines.push(`<h${level}>${text}</h${level}>`);
        continue;
      }

      // Unordered list
      const listMatch = /^[-*+]\s+(.*)$/.exec(line);
      if (listMatch) {
        htmlLines.push(`<ul><li>${listMatch[1]}</li></ul>`);
        continue;
      }

      // Paragraph
      if (line.trim()) {
        htmlLines.push(`<p>${line.trim()}</p>`);
      }
    }

    // Flush any unclosed code block
    flushCode();

    // -----------------------------------------------------
    // 4. Join HTML
    // -----------------------------------------------------
    const html = htmlLines.join('\n');

    // -----------------------------------------------------
    // 5. Store HTML output
    // -----------------------------------------------------
    artifacts.html = html;

    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-renderer',
      message: 'HTML rendering complete.',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-renderer',
      message: 'Renderer plugin finished.',
      severity: 'info',
    });
  },
};
