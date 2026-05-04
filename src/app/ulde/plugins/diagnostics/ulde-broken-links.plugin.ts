// ulde/plugins/diagnostics/ulde-broken-links.plugin.ts

/**
 * ULDE Broken Links Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to read links from artifacts.content
 *   - how to check them against a simple registry or base URL
 *   - how to detect broken links
 *   - how to add diagnostics
 *
 * This is intentionally simple:
 *   - It does NOT perform network requests
 *   - It does NOT validate external URLs
 *   - It only checks internal links (relative links)
 *
 * The goal is to teach plugin architecture,
 * not to implement a full link checker.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeBrokenLinksPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-broken-links',
    description: 'Checks internal links against a registry and reports broken ones.',
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
    usesDiagnostics: true,         // reports broken links
    usesDom: false,
    producesRenderArtifacts: false,
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-broken-links',
      message: 'Broken Links plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts, config } = ctx;

    const markdown = artifacts.content;

    // -----------------------------------------------------
    // 1. Extract links from markdown
    // -----------------------------------------------------
    //
    // Matches:
    //   [text](url)
    //
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    const links: Array<{ text: string; url: string }> = [];

    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(markdown)) !== null) {
      links.push({
        text: match[1],
        url: match[2].trim(),
      });
    }

    // -----------------------------------------------------
    // 2. Determine internal link registry
    // -----------------------------------------------------
    //
    // The registry is a simple list of valid internal paths.
    // Example:
    //   config.validDocs = ["index.md", "guide/intro.md"]
    //
    const registry: string[] = config?.validDocs ?? [];

    // -----------------------------------------------------
    // 3. Check each link
    // -----------------------------------------------------
    const broken: Array<{ text: string; url: string }> = [];

    for (const link of links) {
      const url = link.url;

      // Skip external links
      const isExternal =
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('#');

      if (isExternal) continue;

      // Normalize URL (remove leading slash)
      const normalized = url.replace(/^\//, '');

      // Check against registry
      const exists = registry.includes(normalized);

      if (!exists) {
        broken.push(link);

        artifacts.diagnostics.add({
          plugin: 'ulde-broken-links',
          message: `Broken link detected: "${url}" (text: "${link.text}")`,
          severity: 'warning',
        });
      }
    }

    // -----------------------------------------------------
    // 4. Store debug info (optional)
    // -----------------------------------------------------
    artifacts.brokenLinks = broken;

    artifacts.diagnostics.add({
      plugin: 'ulde-broken-links',
      message: `Checked ${links.length} link(s), found ${broken.length} broken.`,
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-broken-links',
      message: 'Broken Links plugin finished.',
      severity: 'info',
    });
  },
};
