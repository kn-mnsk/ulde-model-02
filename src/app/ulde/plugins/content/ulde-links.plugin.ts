// ulde/plugins/content/ulde-links.plugin.ts

/**
 * ULDE Links Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to scan markdown for links
 *   - how to normalize relative links
 *   - how to detect malformed links
 *   - how to add diagnostics
 *   - how to mutate artifacts.content (optional)
 *
 * This is intentionally simple:
 *   - It does NOT validate URLs deeply
 *   - It does NOT rewrite HTML links
 *   - It does NOT handle reference-style links
 *
 * The goal is to teach plugin architecture,
 * not to implement a perfect link resolver.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeLinksPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-links',
    description: 'Normalizes markdown links and reports malformed ones.',
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
    transformsContent: true,       // may rewrite links
    usesDiagnostics: true,         // reports malformed links
    usesDom: false,
    producesRenderArtifacts: false,
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-links',
      message: 'Links plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts, config } = ctx;

    let markdown = artifacts.content;

    // Basic markdown link regex:
    //   [text](url)
    //
    // Captures:
    //   group 1 → link text
    //   group 2 → link URL
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    const baseUrl = config?.baseUrl ?? ''; // optional base URL

    const rewritten: string[] = [];

    markdown = markdown.replace(linkRegex, (match: string, text: string, url: string) => {
      const originalUrl = url.trim();

      // -----------------------------------------------------
      // 1. Detect malformed links
      // -----------------------------------------------------
      if (!originalUrl) {
        artifacts.diagnostics.add({
          plugin: 'ulde-links',
          message: `Empty link target for text "${text}".`,
          severity: 'warning',
        });
        return match; // leave unchanged
      }

      // Very naive malformed URL detection
      if (originalUrl.includes(' ')) {
        artifacts.diagnostics.add({
          plugin: 'ulde-links',
          message: `Malformed link: "${originalUrl}" contains spaces.`,
          severity: 'warning',
        });
      }

      // -----------------------------------------------------
      // 2. Normalize relative links
      // -----------------------------------------------------
      let normalizedUrl = originalUrl;

      const isAbsolute =
        originalUrl.startsWith('http://') ||
        originalUrl.startsWith('https://') ||
        originalUrl.startsWith('/');

      if (!isAbsolute && baseUrl) {
        // Example:
        //   baseUrl = "/docs/"
        //   original = "guide/intro.md"
        //   result = "/docs/guide/intro.md"
        normalizedUrl = baseUrl.replace(/\/$/, '') + '/' + originalUrl;
      }

      rewritten.push(`${originalUrl} → ${normalizedUrl}`);

      // Return rewritten markdown link
      return `[${text}](${normalizedUrl})`;
    });

    // Store rewritten content
    artifacts.content = markdown;

    // Add diagnostics summary
    artifacts.diagnostics.add({
      plugin: 'ulde-links',
      message: `Links plugin rewrote ${rewritten.length} link(s).`,
      severity: 'info',
    });

    // Optionally store debug info
    artifacts.linkRewrites = rewritten;
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-links',
      message: 'Links plugin finished.',
      severity: 'info',
    });
  },
};
