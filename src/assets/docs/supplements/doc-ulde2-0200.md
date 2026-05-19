# ULDE v2 Project

## Structure

```

app/
  ├── app.config.ts
  ├── app.routes.ts
  ├── app.ts
  ├── app.html
  ├── app.scss
  │
  ├── docs-viewer/
  │    ├── docs-viewer.html
  │    ├── docs-viewer.routes.ts
  │    ├── docs-viewer.scss
  │    ├── docs-viewer.ts
  │
  ├── product-configurator/
  │    ├── product-configurator.html
  │    ├── product-configurator.routes.ts
  │    ├── product-configurator.ts
  │
  ├── ulde/
  │    ├── core/
  │    │    ├── artifacts/
  │    │    │    ├── ulde-artifacts.ts
  │    │    │    ├── ulde-diagnostics.ts
  │    │    │    ├── ulde-timings.ts
  │    │    │   
  │    │    ├── config/
  │    │    │    ├── ulde-config.ts
  │    │    │    
  │    │    ├── host/
  │    │    │    ├── ulde-browser-host.ts
  │    │    │    ├── ulde-host-api.ts
  │    │    │
  │    │    ├── lifecycle/
  │    │    │    ├── ulde-orchestrator.ts
  │    │    │    ├── ulde-phase-context.ts
  │    │    │    ├── ulde-phases.ts
  │    │    │
  │    │    ├── registry/
  │    │    │    ├── ulde-plugin-api.ts
  │    │    │    ├── ulde-plugin-registry.ts
  │    │    │    ├── ulde-registry.ts
  │    │    │
  │    │    ├── docs/
  │    │    │    ├── architecture-diagram.md
  │    │    │    ├── architecture.md
  │    │    │    ├── integration-angular.md
  │    │    │    ├── integration-react.md
  │    │    │    ├── integration-guide.md
  │    │    │    ├── plugin-api-v2.md
  │    │    │    ├── plugin-lifecycle-diagram.md
  │    │    │
  │    │    ├── examples/
  │    │    │    ├── basic-angular-docs/
  │    │    │    ├── basic-react-docs/
  │    │    │    ├── static-site/
  │    │    │
  │    │    ├── integration/
  │    │    │    ├── angular/
  │    │    │    │    ├── ulde-docs-viewer-bridge.service.ts
  │    │    │    │    ├── ulde-angular.service.ts
  │    │    │    │ 
  │    │    │    ├── react/
  │    │    │    │    ├── ulde-react-provider.tsx 
  │    │    │    │    ├── UldeViewer.tsx
  │    │    │    │ 
  │    │    │    ├── static/
  │    │    │    │    ├── ulde-static-runner.ts
  │    │    │
  │    │    ├── ownership/
  │    │    │    ├── ownership-map.json
  │    │    │    ├── ownership-registry.ts
  │    │    │    ├── ownership-scheme.json
  │    │    │
  │    │    ├── plugins/
  │    │    │    ├── assemble/ ← ASSEMBLE PHASE (finalHtml)
  │    │    │    │    ├── ulde-artifacts-panel.plugin.ts
  │    │    │    │    ├── ulde-debug-overlay.plugin.ts
  │    │    │    │    ├── ulde-profiler.plugin.ts
  │    │    │    │    ├── ulde-renderer.plugin.ts
  │    │    │    │    ├── ulde-timeline.plugin.ts
  │    │    │    │
  │    │    │    ├── browser/ ← BROWSER DOM PHASE (real DOM)
  │    │    │    │    ├── ulde-anchors-browser.plugin.ts
  │    │    │    │    ├── ulde-katex-browser.plugin.ts
  │    │    │    │    ├── ulde-mermaid-browser.plugin.ts
  │    │    │    │    ├── ulde-scrollspy-browser.plugin.ts
  │    │    │    │
  │    │    │    ├── content/ ← CONTENT PHASE (markdown → HTML)
  │    │    │    │    ├── ulde-codeblocks.plugin.ts
  │    │    │    │    ├── ulde-containers.plugin.ts
  │    │    │    │    ├── ulde-frontmatter.plugin.ts
  │    │    │    │    ├── ulde-links.plugin.ts
  │    │    │    │    ├── ulde-syntax-highlight.plugin.ts
  │    │    │    │    ├── ulde-toc.plugin.ts
  │    │    │    │
  │    │    │    ├── diagnostics/ ← DIAGNOSTICS PHASE
  │    │    │    │    ├── ulde-broken-links.plugin.ts
  │    │    │    │    ├── ulde-headings-check.plugin.ts
  │    │    │    │
  │    │    │    ├── transform/ ← TRANSFORM PHASE (string-based HTML transforms)
  │    │    │    │    ├── ulde-dom-injector.plugin.ts
  │    │    │    
  │    │    ├── tests/
  │    │    │    ├── core/
  │    │    │    │    ├── ulde-pipeline-smoke.test.ts
  │    │    │    │
  │    │    │    ├── integration/
  │    │    │    │
  │    │    │    ├── plugins/
  │    │    │    │    ├── node-ts.config.jason
  │    │    
  │    ├── ulde-viewer/
  │    │    ├── ulde-renderer-api.ts
  │    │    ├── ulde-renderer.service.ts
  │    │    ├── ulde-viewer.ts
  │    │        

```
