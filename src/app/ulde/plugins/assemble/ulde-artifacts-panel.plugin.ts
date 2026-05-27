// app/ulde/plugins/assemble/ulde-artifacts-panel.plugin.ts

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
import { UldeArtifacts, ArtifactsPanelSection, ArtifactsPanelGroup } from '../../core/artifacts/ulde-artifacts';


function buildGroupedSections(artifacts: UldeArtifacts): ArtifactsPanelGroup[] {
  return [
    // ---------------------------------------------------------
    // CONTENT GROUP
    // ---------------------------------------------------------
    {
      id: 'content',
      title: 'Content',
      icon: '📄',
      sections: [
        {
          id: 'frontmatter',
          title: 'Frontmatter',
          icon: '📝',
          items: artifacts.frontmatter ? [artifacts.frontmatter] : []
        },
        {
          id: 'toc',
          title: 'Table of Contents',
          icon: '🧭',
          items: artifacts.toc ?? []
        },
        {
          id: 'codeblocks',
          title: 'Codeblocks',
          icon: '🔧',
          items: artifacts.codeblocks ?? []
        },
        {
          id: 'containers',
          title: 'Containers',
          icon: '📦',
          items: artifacts.containers ?? []
        }
      ]
    },

    // ---------------------------------------------------------
    // NAVIGATION GROUP
    // ---------------------------------------------------------
    {
      id: 'navigation',
      title: 'Navigation',
      icon: '🧭',
      sections: [
        {
          id: 'anchors',
          title: 'Anchors',
          icon: '🪝',
          items: artifacts.anchors ?? []
        },
        {
          id: 'scrollspy',
          title: 'ScrollSpy',
          icon: '🎯',
          items: artifacts.scrollspy ?? []
        }
      ]
    },

    // ---------------------------------------------------------
    // DIAGNOSTICS GROUP
    // ---------------------------------------------------------
    {
      id: 'diagnostics',
      title: 'Diagnostics',
      icon: '🧪',
      sections: [
        {
          id: 'diagnostics',
          title: 'Diagnostics',
          icon: '🧪',
          items: artifacts.diagnostics?.all?.() ?? []
        }
      ]
    },

    // ---------------------------------------------------------
    // PERFORMANCE GROUP
    // ---------------------------------------------------------
    {
      id: 'performance',
      title: 'Performance',
      icon: '⏱️',
      sections: [
        {
          id: 'timings',
          title: 'Timings',
          icon: '⏱️',
          items: artifacts.timings?.all?.() ?? []
        }
      ]
    }
  ];
}

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
  phase: UldePhase.ASSEMBLE,
  // phase: UldePhase.RENDER,

  // ---------------------------------------------------------
  // 3. Capabilities
  // ---------------------------------------------------------
  capabilities: {
    transformsContent: false,
    // usesDiagnostics: true,
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
    const { artifacts, config } = ctx;

    if (!config.enableArtifactsPanel) return;

    // Build grouped model
    const groups = buildGroupedSections(artifacts);

    // Store final grouped model
    artifacts.artifactsPanel = {
      groups
    };

    artifacts.diagnostics.add({
      plugin: 'ulde-artifacts-panel',
      message: 'Artifacts panel model built.',
      severity: 'info',
    });

    // console.log(`Log: [UldeArtifactsPanelPlugin] run finished`, artifacts.artifactsPanel);
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
