// ulde/plugins/dom/ulde-dom-injector.plugin.ts

/**
 * ULDE DOM Injector Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to apply ULDE metadata to rendered HTML
 *   - how to inject heading anchors
 *   - how to wrap containers (:::note, :::warning)
 *   - how to apply syntax highlight metadata
 *   - how to mark scrollspy sections
 *
 * This plugin does NOT:
 *   - access the real DOM
 *   - attach event listeners
 *   - use querySelector or DOM APIs
 *
 * The goal is to teach plugin architecture,
 * not to implement a full DOM transformer.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeDomInjectorPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-dom-injector',
    description: 'Injects anchors, containers, and highlight metadata into HTML.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in DOM phase because it transforms HTML using metadata.
  phase: UldePhase.DOM,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: true,       // rewrites HTML
    usesDiagnostics: true,
    usesDom: false,                // model ULDE does not touch real DOM
    producesRenderArtifacts: true, // produces final HTML
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-dom-injector',
      message: 'DOM Injector plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts } = ctx;

    let html = artifacts.html ?? '';

    const anchors = artifacts.anchors ?? [];
    const containers = artifacts.containers ?? [];
    const highlightRequests = artifacts.highlightRequests ?? [];
    const scrollspy = artifacts.scrollspy ?? [];

    // -----------------------------------------------------
    // 1. Inject heading anchors
    // -----------------------------------------------------
    //
    // Convert:
    //   <h2>Installation</h2>
    //
    // Into:
    //   <h2 id="installation" data-spy="section">Installation</h2>
    //
    for (const a of anchors) {
      const regex = new RegExp(`<h${a.level}>${escapeRegex(a.text)}</h${a.level}>`);
      html = html.replace(
        regex,
        `<h${a.level} id="${a.slug}" data-spy="section">${a.text}</h${a.level}>`
      );
    }

    // -----------------------------------------------------
    // 2. Wrap containers
    // -----------------------------------------------------
    //
    // Convert:
    //   <p>:::note</p>
    //   <p>content…</p>
    //   <p>:::</p>
    //
    // Into:
    //   <div class="ulde-container note">content…</div>
    //
    for (const c of containers) {
      const start = new RegExp(`<p>:::${c.type}</p>`);
      const end = new RegExp(`<p>:::</p>`);

      html = html.replace(start, `<div class="ulde-container ${c.type}">`);
      html = html.replace(end, `</div>`);
    }

    // -----------------------------------------------------
    // 3. Apply syntax highlight metadata
    // -----------------------------------------------------
    //
    // Convert:
    //   <pre><code data-lang="ts">...</code></pre>
    //
    // Into:
    //   <pre><code class="lang-ts">...</code></pre>
    //
    for (const req of highlightRequests) {
      if (!req.highlight || !req.language) continue;

      const regex = new RegExp(
        `<pre><code data-lang="${req.language}">([\\s\\S]*?)</code></pre>`
      );

      html = html.replace(
        regex,
        `<pre><code class="lang-${req.language}">$1</code></pre>`
      );
    }

    // -----------------------------------------------------
    // 4. Mark scrollspy sections
    // -----------------------------------------------------
    //
    // Add:
    //   data-scrollspy="slug"
    //
    for (const s of scrollspy) {
      const regex = new RegExp(`<h${s.level} id="${s.slug}"`);
      html = html.replace(
        regex,
        `<h${s.level} id="${s.slug}" data-scrollspy="${s.slug}"`
      );
    }

    // -----------------------------------------------------
    // 5. Store final HTML
    // -----------------------------------------------------
    artifacts.finalHtml = html;

    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-dom-injector',
      message: 'DOM injection complete.',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-dom-injector',
      message: 'DOM Injector plugin finished.',
      severity: 'info',
    });
  },
};

// -----------------------------------------------------------
// Helper: escape regex special characters
// -----------------------------------------------------------
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
