# **ULDE Specification Document**

Below is your **full ULDE Specification Document**, written in clean, production‑ready **Markdown**, structured for real documentation systems, and aligned with everything we’ve designed so far.

It is intentionally comprehensive, architectural, and implementation‑ready.

All key concepts include **Guided Links** so you can jump deeper in a new chat whenever you want.

---

**Unified Lifecycle‑Driven Engine**  
Version: 1.0  
Author: Masaaki  
Status: Draft / Architecture‑Complete

---

## **1. Overview**

ULDE (**Unified Lifecycle‑Driven Engine**) is a core subsystem that provides:

- A **unified lifecycle model** for documentation rendering  
- A **plugin execution framework**  
- A **profiling and observability layer**  
- A **visual debugging overlay**  
- A **stable architectural backbone** for content, layout, navigation, and interactive demos  

ULDE does **not** render documentation.  
ULDE **observes**, **coordinates**, **profiles**, and **visualizes** the rendering pipeline.

It transforms a documentation system into a **modular, measurable, contributor‑friendly platform**.

---

## **2. Goals**

### **2.1 Architectural Goals**

- Provide a **single lifecycle** for all documentation operations  
- Enable **plugin‑based extensibility**  
- Offer **real‑time observability** of phases and plugins  
- Support **incremental migration** from existing systems  
- Maintain **predictable execution order**  
- Ensure **low overhead** and **high clarity**

### **2.2 Developer Goals**

- Make plugin development easy  
- Provide visual debugging tools  
- Offer clear lifecycle contracts  
- Enable safe experimentation without breaking core logic

---

## **3. Unified Lifecycle Model**

ULDE defines five phases:

1. **init** — system boot, registry setup  
2. **load** — load page content, metadata, layout  
3. **render** — transform content → AST → HTML → layout  
4. **hydrate** — activate interactive components  
5. **afterRender** — finalize frame, update overlay  

Each phase has:

- start timestamp  
- end timestamp  
- plugin execution timings  
- ULDE diagnostic events  

### **Lifecycle Diagram (Textual)**  

```init → load → render → hydrate → afterRender```

### Explore lifecycle deeper

- **Unified Lifecycle**  
- **Phase Contracts**  

---

## **4. ULDE Architecture**

ULDE consists of five core subsystems:

### **4.1 ULDE Runtime**

Manages:

- phase transitions  
- frame lifecycle  
- timing collection  
- anomaly detection  

### **4.2 ULDE Lifecycle Service**

Provides:

- `startPhase(name)`  
- `endPhase(name)`  
- duration measurement  
- event emission  

### **4.3 ULDE Plugin Registry**

Responsibilities:

- register plugins  
- enforce namespacing  
- run hooks in deterministic order  
- wrap execution for timing  
- expose plugin metadata  

### **4.4 ULDE Overlay**

Visual debugging interface:

- phase bars  
- plugin timing bars  
- sparkline history  
- warnings  
- metadata panel  

### **4.5 ULDE Debug Tools**

Includes:

- timeline viewer  
- plugin inspector  
- lifecycle logger  
- heatmap generator  

Explore architecture deeper:

- **ULDE Runtime**  
- **ULDE Overlay**  

---

## **5. Plugin System**

ULDE provides a structured, namespaced plugin API.

### **5.1 Plugin Metadata**

```ts
interface DocsPlugin {
  name: string;
  version?: string;
  description?: string;
  enabled?: boolean;
  hooks: PluginHooks;
}
```

### **5.2 Plugin Hooks**

```ts
interface PluginHooks {
  onInit?(): void | Promise<void>;
  onPageLoad?(ctx: PageContext): void | Promise<void>;
  onBeforeRender?(ctx: RenderContext): void | Promise<void>;
  onAfterRender?(ctx: RenderContext): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
}
```

### **5.3 Execution Contract**

ULDE wraps every hook:

```ts
async executeHook(plugin, hookName, ...args) {
  const start = performance.now();
  try {
    await plugin.hooks[hookName]?.(...args);
  } finally {
    const end = performance.now();
    this.recordPluginTiming(plugin.name, hookName, end - start);
  }
}
```

### **5.4 Plugin Namespacing**

Examples:

- `content.markdown`  
- `layout.toc`  
- `demo.playground`  
- `nav.breadcrumbs`  
- `ulde.timeline`  

Explore plugins deeper:

- **Plugin API**  
- **Plugin Examples**  

---

## **6. Context Objects**

### **6.1 PageContext**

```ts
interface PageContext {
  pageId: string;
  route: string;
  frontmatter: Record<string, any>;
  rawContent: string;
}
```

### **6.2 RenderContext**

```ts
interface RenderContext {
  pageId: string;
  ast: any;
  html: string;
  layout: string;
}
```

Explore contexts deeper:

- **PageContext**  
- **RenderContext**  

---

## **7. Integration Into Documentation System**

ULDE integrates with the documentation engine:

```DocsEngine → ULDE Lifecycle → Engines → Plugins → Overlay```

### **7.1 DocsEngine Responsibilities**

- emit lifecycle events  
- call content/layout/interactive engines  
- run plugin hooks  
- coordinate rendering pipeline  

### **7.2 ULDE Responsibilities**

- observe  
- measure  
- visualize  
- warn  

Explore integration deeper:

- **DocsEngine Integration**  
- **Angular Integration**  

---

## **8. Overlay Specification**

### **8.1 Overlay Elements**

- Phase timeline  
- Plugin timing bars  
- Frame sparkline  
- Warning indicators  
- Plugin list  
- Metadata panel  

### **8.2 Overlay Data Sources**

- ULDE lifecycle events  
- ULDE plugin timings  
- ULDE frame history  

Explore overlay deeper:

- **Overlay Spec**  

---

## **9. Migration Strategy**

ULDE supports incremental migration:

### **Phase 1 — Wrap existing system**

- Introduce lifecycle  
- Add ULDE runtime  
- Add plugin registry  
- No plugins yet  

### **Phase 2 — Extract first plugins**

- Move TOC, code block transforms, etc. into plugins  

### **Phase 3 — Decompose system**

- Move layout, navigation, demos into plugins  

### **Phase 4 — Enable overlay**

- Add visual debugging  
- Add performance insights  

Explore migration deeper:  

- **Migration Guide**  

---

## **10. ULDE in One Sentence**

> **ULDE is the unified lifecycle, plugin, and observability engine that transforms your documentation system into a modular, measurable, contributor‑friendly platform.**

---

## **11. Appendix**

### **11.1 Glossary**

- **Phase** — a lifecycle segment  
- **Plugin** — an extension module  
- **Frame** — one full lifecycle execution  
- **Overlay** — visual debugging UI  
- **Engine** — subsystem performing content/layout/hydration  

### **11.2 Related Documents**

- **ULDE Architecture**  
- **ULDE Plugin Guide**  
- **ULDE Starter Project**  

---

If you want, I can now generate:

- A **ULDE README.md**  
- A **ULDE Architecture Diagram**  
- A **ULDE Plugin Author Guide**  
- A **ULDE Starter Repository Layout**  

Just tell me which one you want next.
