# ULDE-MODEL-01 Architecture Diagram

```mermaid
flowchart TD

    %% ============================
    %% INPUT
    %% ============================
    A[Markdown Input] --> B(runUldePipeline)

    %% ============================
    %% PIPELINE PHASES
    %% ============================
    subgraph PIPELINE["ULDE Pipeline (String‑Only)"]
        direction TB

        B --> C1[CONTENT Phase<br/>• frontmatter<br/>• links<br/>• toc<br/>• codeblocks<br/>• containers<br/>• syntax metadata]

        C1 --> C2[TRANSFORM Phase<br/>• HTML rewriting<br/>• wrappers<br/>• data attributes]

        C2 --> C3[DIAGNOSTICS Phase<br/>• broken links<br/>• heading checks<br/>• warnings]

        C3 --> C4[ASSEMBLE Phase<br/>• finalHtml<br/>• artifacts panel<br/>• debug overlay<br/>• profiler]
    end

    %% ============================
    %% OUTPUT OF PIPELINE
    %% ============================
    C4 --> D[finalHtml]

    %% ============================
    %% BROWSER HOST
    %% ============================
    subgraph HOST["UldeBrowserHost (Browser Runtime)"]
        direction TB
        D --> E[Inject finalHtml into DOM container]
        E --> F[Run Browser DOM Plugins]
    end

    %% ============================
    %% BROWSER PLUGINS
    %% ============================
    subgraph BROWSER_PLUGINS["Browser DOM Plugins (Real DOM)"]
        direction TB
        F --> P1[Mermaid Plugin<br/>mermaid.run()]
        F --> P2[KaTeX Plugin<br/>renderMathInElement()]
        F --> P3[Anchors Plugin<br/>Add anchor links to headings]
        F --> P4[ScrollSpy Plugin<br/>IntersectionObserver]
    end

    %% ============================
    %% INTEGRATION LAYERS
    %% ============================
    subgraph INTEGRATIONS["Framework Integrations"]
        direction LR
        G1[Angular DocsViewer<br/>+ UldeAngularService] --> B
        G2[React UldeProvider<br/>+ UldeViewer] --> B
    end

    %% Connect integrations to host
    G1 --> E
    G2 --> E
```

## What This Diagram Shows

### ✔ ULDE Pipeline is 100% string‑based

- No DOM access.
- No Mermaid.
- No KaTeX.
- No Anchors.
- No ScrollSpy.

### ✔ Browser Host is the DOM runtime

It injects finalHtml and runs DOM plugins.

### ✔ Browser Plugins operate on the real DOM

- Mermaid → mermaid.run()
- KaTeX → renderMathInElement()
- Anchors → <a href="#slug">§</a>
- ScrollSpy → IntersectionObserver

### ✔ Angular and React integrate cleanly

Both frameworks:

- Call runUldePipeline()
- Receive finalHtml
- Use UldeBrowserHost to run DOM plugins

### ✔ ULDE‑MODEL‑01 is clean, predictable, and layered

