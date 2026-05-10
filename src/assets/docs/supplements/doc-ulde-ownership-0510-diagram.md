flowchart TD

  %% ============================
  %% CONTENT PHASE ARTIFACTS
  %% ============================

  A_content["content<br/><i>string</i>"]:::artifact
  A_toc["toc[]<br/><i>TocEntry</i>"]:::artifact
  A_links["links[]<br/><i>LinkEntry</i>"]:::artifact
  A_frontmatter["frontmatter<br/><i>FrontmatterData</i>"]:::artifact

  %% Writers
  P_markdown["Markdown Parser"]:::plugin
  P_toc["TOC Plugin"]:::plugin
  P_links["Links Plugin"]:::plugin
  P_frontmatter["Frontmatter Plugin"]:::plugin

  %% Reads
  P_debug["Debug Overlay Plugin"]:::plugin
  P_anchors["Anchors Plugin"]:::plugin

  %% CONTENT PHASE FLOWS
  P_markdown --> A_content
  A_content --> P_toc
  P_toc --> A_toc
  A_content --> P_links
  P_links --> A_links
  A_content --> P_frontmatter
  P_frontmatter --> A_frontmatter

  %% ============================
  %% DOM PHASE ARTIFACTS
  %% ============================

  A_anchors["anchors[]<br/><i>AnchorEntry</i>"]:::artifact
  A_mermaid["mermaid<br/><i>DomTransformation</i>"]:::artifact

  P_anchors --> A_anchors
  A_toc --> P_anchors

  %% Mermaid plugin
  P_mermaid["Mermaid Plugin"]:::plugin
  A_content --> P_mermaid
  P_mermaid --> A_mermaid

  %% ScrollSpy
  P_scrollspy["ScrollSpy Plugin"]:::plugin
  A_anchors --> P_scrollspy
  P_scrollspy --> A_scrollspy["scrollspy[]<br/><i>ScrollSpyEntry</i>"]:::artifact

  %% ============================
  %% RENDER PHASE ARTIFACTS
  %% ============================

  A_html["html<br/><i>string</i>"]:::artifact
  A_finalHtml["finalHtml<br/><i>string</i>"]:::artifact

  P_renderer["Renderer Plugin"]:::plugin
  P_renderer --> A_finalHtml

  %% ============================
  %% INTERNAL ARTIFACTS
  %% ============================

  A_diagnostics["diagnostics<br/><i>DiagnosticsModel</i>"]:::artifact
  A_timeline["timeline<br/><i>TimelineModel</i>"]:::artifact
  A_profiler["profiler<br/><i>ProfilerModel</i>"]:::artifact
  A_timings["timings<br/><i>TimingsModel</i>"]:::artifact

  P_broken["Broken Links Plugin"]:::plugin
  P_headings["Headings Check Plugin"]:::plugin
  P_profiler["Profiler Plugin"]:::plugin
  P_timelinePlugin["Timeline Plugin"]:::plugin

  %% Diagnostics flows
  P_broken --> A_diagnostics
  P_headings --> A_diagnostics

  %% Timeline / profiler flows
  P_timelinePlugin --> A_timeline
  P_profiler --> A_profiler
  Orchestrator["Orchestrator"]:::plugin --> A_timings

  %% ============================
  %% STYLES
  %% ============================

  classDef artifact fill:#eef,stroke:#336,stroke-width:1px;
  classDef plugin fill:#ffe,stroke:#663,stroke-width:1px;
