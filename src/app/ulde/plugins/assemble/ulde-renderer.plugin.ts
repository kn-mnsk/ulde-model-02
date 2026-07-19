// ulde/plugins/assemble/ulde-renderer.plugin.ts

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
import MarkdownIt from 'markdown-it';
import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export const UldeRendererPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-renderer',
    description: 'Minimal markdown → HTML renderer (markdwon-it version).',
    version: '2.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in RENDER phase because it produces HTML.
  phase: UldePhase.ASSEMBLE,

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
  beforeRun(ctx: UldePhaseContext) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-renderer',
      message: 'Renderer plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx: UldePhaseContext) {
    const { artifacts } = ctx;

    const markdown = artifacts.content;

    // Markdown → HTML
    const html = md.render(markdown);

    artifacts.html = html;
    artifacts.finalHtml = html;

    // console.log(`Log: [UldeRendererPlugin] html=`, html);

    artifacts.diagnostics.add({
      plugin: 'ulde-renderer',
      message: 'HTML rendering complete.',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx: UldePhaseContext) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-renderer',
      message: 'Renderer plugin finished.',
      severity: 'info',
    });
  },
};
