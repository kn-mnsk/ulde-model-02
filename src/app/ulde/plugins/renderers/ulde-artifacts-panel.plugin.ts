// ulde/plugins/renderers/ulde-artifacts-panel.plugin.ts

/**
 * ULDE Artifacts Panel Plugin (Teaching Version)
 *
 * This plugin demonstrates:
 *   - how to gather ULDE artifacts into a structured sidebar model
 *   - how to group artifacts by category (content, diagnostics, metadata)
 *   - how to prepare data for a visual sidebar (Angular/React)
 *   - how renderer-phase plugins unify data rather than mutate content
 *
 * This plugin does NOT:
 *   - draw the sidebar
 *   - manipulate the DOM
 *   - inject HTML
 *
 * The goal is to teach plugin architecture,
 * not to implement a full UI.
 */

import { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';

export const UldeArtifactsPanelPlugin: UldePlugin = {
  // ---------------------------------------------------------
  // 1. Metadata
  // ---------------------------------------------------------
  meta: {
    name: 'ulde-artifacts-panel',
    description: 'Builds a structured artifacts panel model for sidebar rendering.',
    version: '1.0.0',
    author: 'ULDE Model Project',
  },

  // ---------------------------------------------------------
  // 2. Lifecycle phase
  // ---------------------------------------------------------
  // Runs in RENDER phase because it prepares visualization data.
  phase: UldePhase.RENDER,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,
    usesDiagnostics: false,
    usesDom: false,
    producesRenderArtifacts: true, // produces artifacts panel metadata
  },

  // ---------------------------------------------------------
  // 4. Optional hook: beforeRun
  // ---------------------------------------------------------
  beforeRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-artifacts-panel',
      message: 'Artifacts Panel plugin starting…',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 5. Main plugin logic
  // ---------------------------------------------------------
  run(ctx) {
    const { artifacts } = ctx;

    // -----------------------------------------------------
    // 1. Gather artifacts
    // -----------------------------------------------------
    const toc = artifacts.toc ?? [];
    const frontmatter = artifacts.frontmatter ?? {};
    const codeblocks = artifacts.codeblocks ?? [];
    const containers = artifacts.containers ?? [];
    const anchors = artifacts.anchors ?? [];
    const scrollspy = artifacts.scrollspy ?? [];
    const diagnostics = artifacts.diagnostics?.all?.() ?? [];
    const timings = artifacts.timings?.all?.() ?? [];

    // -----------------------------------------------------
    // 2. Build sidebar-friendly structure
    // -----------------------------------------------------
    //
    // The structure is intentionally simple:
    //
    //   {
    //     sections: [
    //       { title: "Frontmatter", items: [...] },
    //       { title: "TOC", items: [...] },
    //       { title: "Codeblocks", items: [...] },
    //       ...
    //     ]
    //   }
    //
    const panel = {
      sections: [
        {
          title: 'Frontmatter',
          items: Object.entries(frontmatter).map(([key, value]) => ({
            key,
            value,
          })),
        },
        {
          title: 'Table of Contents',
          items: toc.map((t: any)=> ({
            level: t.level,
            text: t.text,
          })),
        },
        {
          title: 'Codeblocks',
          items: codeblocks.map((cb: any) => ({
            index: cb.index,
            language: cb.language,
            preview: cb.code.slice(0, 60) + (cb.code.length > 60 ? '…' : ''),
          })),
        },
        {
          title: 'Containers',
          items: containers.map((c: any) => ({
            index: c.index,
            type: c.type,
            preview: c.content.slice(0, 60) + (c.content.length > 60 ? '…' : ''),
          })),
        },
        {
          title: 'Anchors',
          items: anchors.map((a: any) => ({
            slug: a.slug,
            text: a.text,
            level: a.level,
          })),
        },
        {
          title: 'ScrollSpy',
          items: scrollspy.map((s: any) => ({
            slug: s.slug,
            level: s.level,
            active: s.active,
          })),
        },
        {
          title: 'Diagnostics',
          items: diagnostics.map((d: any) => ({
            plugin: d.plugin,
            severity: d.severity,
            message: d.message,
          })),
        },
        {
          title: 'Timings',
          items: timings.map((t: any) => ({
            plugin: t.plugin,
            phase: t.phase,
            ms: t.ms,
          })),
        },
      ],
    };

    // -----------------------------------------------------
    // 3. Store artifacts panel metadata
    // -----------------------------------------------------
    artifacts.artifactsPanel = panel;

    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-artifacts-panel',
      message: 'Artifacts panel model built.',
      severity: 'info',
    });
  },

  // ---------------------------------------------------------
  // 6. Optional hook: afterRun
  // ---------------------------------------------------------
  afterRun(ctx) {
    ctx.artifacts.diagnostics.add({
      plugin: 'ulde-artifacts-panel',
      message: 'Artifacts Panel plugin finished.',
      severity: 'info',
    });
  },
};
