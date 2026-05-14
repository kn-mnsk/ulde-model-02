# ULDE v2 Project

## Structure

```
ulde-docs/
├── src/
│   ├── app/
│   ├── assets/
│   ├── index.html
│   └── styles.scss
└── README.md

```

```
app/
  ├── app.config.ts
  ├── app.routes.ts
  ├── app.ts
  ├── app.html
  ├── app.scss
  
  ├── docs-viewer/
        docs-viewer.html
        docs-viewer.scss
        docs-viewer.ts

  ├── ulde/
        ulde-angular.service.ts
        core/
          lifecycle/
            ulde-orchestrator.ts
            ulde-phases.ts
            ulde-phase-context.ts
          registry/
            ulde-plugin-api.ts
            ulde-plugin-registry.ts
            ulde-registry.ts
          artifacts/
            ulde-artifacts.ts
            ulde-diagnostics.ts
            ulde-timings.ts
          config/
            ulde-config.ts
          host/
            ulde-browser-host.ts
            ulde-host-api.ts
        plugins/
          content/                  ← CONTENT PHASE (markdown → HTML)
            ulde-frontmatter.plugin.ts
            ulde-links.plugin.ts
            ulde-toc.plugin.ts
            ulde-codeblocks.plugin.ts
            ulde-syntax-highlight.plugin.ts
            ulde-containers.plugin.ts

          transform/                ← TRANSFORM PHASE (string-based HTML transforms)
            ulde-dom-injector.plugin.ts

          diagnostics/              ← DIAGNOSTICS PHASE
            ulde-headings-check.plugin.ts
            ulde-broken-links.plugin.ts

          assemble/                 ← ASSEMBLE PHASE (finalHtml)
            ulde-renderer.plugin.ts
            ulde-timeline.plugin.ts
            ulde-debug-overlay.plugin.ts
            ulde-artifacts-panel.plugin.ts
            ulde-profiler.plugin.ts

          browser/                   ← BROWSER DOM PHASE (real DOM)
            ulde-mermaid-browser.plugin.ts
            ulde-katex-browser.plugin.ts
            ulde-anchors-browser.plugin.ts
            ulde-scrollspy-browser.plugin.ts

        integration/
          angular/
            ulde-docs-viewer-bridge.service.ts 
          react/
            ulde-react-provider.tsx 
            UldeViewer.tsx
          static/
            ulde-static-runner.ts 

        ownership/
          ownership-map.json
          ownership-registry.ts
          ownership-scheme.json

        examples/
          basic-angular-docs/
          basic-react-docs/
          static-site/

        docs/
          architecture.md
          lifecycle.md
          plugin-api-v3.md              ← updated for new phases
          integration-angular.md
          integration-react.md
          migration-guide.md            ← explains v2 → v3 changes

        tests/
          core/
            ulde-pipline-smoke.test.ts
          plugins/
          integration/

```
