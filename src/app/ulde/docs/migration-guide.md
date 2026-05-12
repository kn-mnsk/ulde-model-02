
# Migration Guide: ULDE v2 → ULDE-MODEL-01

This guide explains how to migrate from the older ULDE v2 mental model to **ULDE-MODEL-01**.

---

## 1. Conceptual changes

### 1.1 DOM phase removed

**Before (v2):**

- ULDE had a "DOM" phase that *conceptually* suggested real DOM access.

**Now (ULDE-MODEL-01):**

- ULDE pipeline is **string-only**.
- There is **no DOM phase**.
- Real DOM work is done by **browser plugins** via `UldeBrowserHost`.

---

### 1.2 RENDER → ASSEMBLE

**Before:**

- Final phase was often called "RENDER".

**Now:**

- Final phase is called **ASSEMBLE**.
- It assembles `finalHtml` and artifacts.
- Rendering to the DOM is handled by the host (Angular/React/browser), not by ULDE itself.

---

### 1.3 KaTeX, Mermaid, Anchors, ScrollSpy moved to browser

**Before:**

- KaTeX sometimes ran in the pipeline using `renderToString()`.
- Mermaid sometimes tried to run in the pipeline.
- Anchors and ScrollSpy sometimes mixed string and DOM logic.

**Now:**

- KaTeX auto-render runs in a **browser plugin** using `renderMathInElement()`.
- Mermaid runs in a **browser plugin** using `mermaid.run()`.
- Anchors are added in a **browser plugin** by manipulating headings in the DOM.
- ScrollSpy is implemented in a **browser plugin** using `IntersectionObserver`.

---

## 2. Phase changes

**Before (v2):**

- CONTENT
- DOM
- DIAGNOSTICS
- RENDER

**Now (ULDE-MODEL-01):**

- **CONTENT** — markdown → HTML, TOC, links, containers, codeblocks, syntax metadata  
- **TRANSFORM** — string-based HTML rewriting (no DOM)  
- **DIAGNOSTICS** — broken links, heading checks, warnings  
- **ASSEMBLE** — finalHtml, debug overlay, artifacts panel, profiler  

---

## 3. Plugin changes

### 3.1 Pipeline plugins

Pipeline plugins now live in:

- `plugins/content/`
- `plugins/transform/`
- `plugins/diagnostics/`
- `plugins/assemble/`

They must:

- Operate on strings and metadata
- Not touch the real DOM
- Declare their phase via `plugin.meta.phase`

### 3.2 Browser plugins

Browser plugins now live in:

- `plugins/browser/`

They:

- Implement `BrowserDomPlugin`
- Run only in the browser
- Receive a container `HTMLElement`
- Modify the real DOM

Examples:

- `ulde-mermaid-browser.plugin.ts`
- `ulde-katex-browser.plugin.ts`
- `ulde-anchors-browser.plugin.ts`
- `ulde-scrollspy-browser.plugin.ts`

---

## 4. Orchestrator changes

**Before:**

- Orchestrator sometimes accepted a `plugins` array.
- Phases were less clearly separated.

**Now:**

- `runUldePipeline({ content, config })` builds its own plugin registry via `createUldePluginRegistry()`.
- Phases are fixed: CONTENT → TRANSFORM → DIAGNOSTICS → ASSEMBLE.

---

## 5. Integration changes

### 5.1 Angular

**Before:**

- Angular components sometimes mixed pipeline logic and DOM logic.
- ScrollSpy and Anchors might have been pipeline artifacts.

**Now:**

- Angular service (`UldeAngularService`) calls `runUldePipeline()`.
- Angular component (`DocsViewer`) renders `finalHtml`, artifacts, debug overlay.
- ScrollSpy and Anchors are handled by browser plugins, not by Angular.

### 5.2 React

**Before:**

- React integration might have been ad-hoc.

**Now:**

- `UldeBrowserHost` is provided via React context.
- `UldeViewer` component calls `host.run(container, content)`.
- Browser plugins are registered in the provider.

---

## 6. Practical migration steps

1. **Stop using any DOM access inside pipeline plugins.**  
   Move that logic into browser plugins.

2. **Rename phases** to match ULDE-MODEL-01:  
   - Remove DOM phase  
   - Rename RENDER → ASSEMBLE  

3. **Update plugin registry** to only include pipeline plugins.

4. **Introduce `UldeBrowserHost`** and register browser plugins there.

5. **Update Angular/React integrations** to:
   - Use `runUldePipeline()` for string pipeline
   - Use `UldeBrowserHost` + browser plugins for DOM behavior

Once these steps are done, your project is aligned with **ULDE-MODEL-01**.
