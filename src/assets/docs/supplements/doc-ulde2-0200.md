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
src/app/
├── app.config.ts
├── app.routes.ts
├── app.ts
├── app.html
├── app.scss
│
├── pages/
│   ├── home/
│   └── docs/
│
ulde/
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
      ulde-host-api.ts ← need to be implemented

  plugins/
    content/
      ulde-toc.plugin.ts
      ulde-links.plugin.ts
      ulde-frontmatter.plugin.ts
      ulde-codeblocks.plugin.ts
      ulde-syntax-highlight.plugin.ts
      ulde-containers.plugin.ts

    diagnostics/
      ulde-headings-check.plugin.ts
      ulde-broken-links.plugin.ts

    dom/
      ulde-anchors.plugin.ts
      ulde-scrollspy.plugin.ts
      ulde-dom-injector.plugin.ts
      ulde-mermaid.plugin.ts   

    renderers/
      ulde-renderer.plugin.ts
      ulde-timeline.plugin.ts
      ulde-debug-overlay.plugin.ts
      ulde-artifacts-panel.plugin.ts
      ulde-profiler.plugin.ts

  integration/
    angular/
      ulde-angular-adapter.module.ts ← need to be implemented
      ulde-docs-viewer-bridge.service.ts ← need to be implemented
    react/
      ulde-react-provider.tsx ← need to be implemented
    static/
      ulde-static-runner.ts ← need to be implemented

  examples/
    basic-angular-docs/
    basic-react-docs/
    static-site/

  docs/
    architecture.md
    lifecycle.md
    plugin-api-v2.md
    integration-angular.md
    integration-react.md
    migration-guide.md

  tests/
    core/
    plugins/
    integration/

```
