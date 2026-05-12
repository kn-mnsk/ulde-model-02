# ULDE-MODEL-01 Architecture

ULDE-MODEL-01 is a **string-based documentation pipeline** with a **separate browser runtime** for DOM-only behavior.

At a high level:

- ULDE pipeline (Node or browser) operates on **strings only**
- Browser host operates on the **real DOM**
- Browser plugins (Mermaid, KaTeX, Anchors, ScrollSpy) run **after** HTML is in the DOM

---

## Pipeline overview

The ULDE pipeline has four phases:

1. **CONTENT**  
2. **TRANSFORM**  
3. **DIAGNOSTICS**  
4. **ASSEMBLE**

Each phase is implemented by plugins. Plugins are registered in a central registry.

### Phase 1: CONTENT

**Goal:** Convert markdown + frontmatter into structured HTML and metadata.

Typical responsibilities:

- Parse frontmatter
- Resolve links
- Build table of contents
- Process code blocks
- Attach syntax highlight metadata
- Process custom containers

**Folder:**

- `plugins/content/`

Example plugins:

- `ulde-frontmatter.plugin.ts`
- `ulde-links.plugin.ts`
- `ulde-toc.plugin.ts`
- `ulde-codeblocks.plugin.ts`
- `ulde-syntax-highlight.plugin.ts`
- `ulde-containers.plugin.ts`

---

### Phase 2: TRANSFORM

**Goal:** Perform string-based HTML rewriting.

Important constraint: **no real DOM access**. This phase works on HTML strings only.

Typical responsibilities:

- Inject wrapper elements
- Add data attributes
- Add markers for browser plugins

**Folder:**

- `plugins/transform/`

Example plugins:

- `ulde-dom-injector.plugin.ts`

(KaTeX, Anchors, ScrollSpy are now handled in the browser, not here.)

---

### Phase 3: DIAGNOSTICS

**Goal:** Analyze content and produce diagnostics and warnings.

Typical responsibilities:

- Broken link detection
- Heading structure checks
- Collecting warnings and notes

**Folder:**

- `plugins/diagnostics/`

Example plugins:

- `ulde-headings-check.plugin.ts`
- `ulde-broken-links.plugin.ts`

---

### Phase 4: ASSEMBLE

**Goal:** Assemble the final HTML and artifacts.

Typical responsibilities:

- Build `finalHtml`
- Build debug overlay model
- Build artifacts panel model
- Collect profiler data

**Folder:**

- `plugins/assemble/`

Example plugins:

- `ulde-renderer.plugin.ts`
- `ulde-timeline.plugin.ts`
- `ulde-debug-overlay.plugin.ts`
- `ulde-artifacts-panel.plugin.ts`
- `ulde-profiler.plugin.ts`

---

## Browser runtime

The browser runtime is **not** a pipeline phase. It is a separate layer that:

1. Receives `finalHtml` from the pipeline
2. Injects it into a container element
3. Runs browser-only plugins on the real DOM

### UldeBrowserHost

**File:**

- `core/host/ulde-browser-host.ts`

Responsibilities:

- Run `runUldePipeline()` with markdown input
- Insert `finalHtml` into a DOM container
- Run registered browser DOM plugins

### Browser DOM plugins

**Folder:**

- `plugins/browser/`

Examples:

- `ulde-mermaid-browser.plugin.ts`
- `ulde-katex-browser.plugin.ts`
- `ulde-anchors-browser.plugin.ts`
- `ulde-scrollspy-browser.plugin.ts`

Each plugin implements:

```ts
export interface BrowserDomPlugin {
  id: string;
  init(container: HTMLElement): Promise<void> | void;
}
```

### Plugin registry

The plugin registry defines which plugins run in which phase and in what order.

__File:__

- core/registry/ulde-plugin-registry.ts

It returns an ordered list of pipeline plugins (CONTENT → TRANSFORM → DIAGNOSTICS → ASSEMBLE). Browser plugins are not included here.

### Orchestrator

The orchestrator runs the pipeline phases in order.

__File:__

- core/lifecycle/ulde-orchestrator.ts

__Key function:__

```ts
runUldePipeline({ content, config }): Promise<UldePhaseContext>
```

__It:__

- Builds the plugin registry
- Creates the initial context
- Runs each phase in order
- Returns the final context with artifacts.finalHtml

