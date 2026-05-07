# ULDE Artifacts Ownership Map
A definitive guide to which plugin owns which UldeArtifacts fields.

ULDE plugins operate across four lifecycle phases:

- CONTENT
- DOM
- DIAGNOSTICS
- RENDER

Each plugin may read or write specific fields in UldeArtifacts.
This document defines the canonical ownership of each field.

## 1. Content‑Phase Artifacts

### content
---
| Plugin | Reads | Writes | Notes |
| --- | --- | --- | --- |
| Markdown Parser (external) | ❌ | ✔ | Produces initial HTML/markdown content |
| KaTeX Plugin | ✔ | ✔ | Rewrites math expressions |
| Links Plugin | ✔ | ✔ | Rewrites links, updates ``artifacts.links`` |
| Syntax Highlight Plugin | ✔ | ❌ | Reads codeblocks only |
| Containers Plugin | ✔ | ✔ | Extracts container blocks |
| TOC Plugin | ✔ | ✔ | Extracts headings → ``toc`` |

### toc: TocEntry[]
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| TOC Plugin | ❌ | ✔ Primary owner |
| Anchors Plugin | ✔ | ❌ |

### links: LinkEntry[]
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Links Plugin | ❌ | ✔ Primary owner |
| Debug Overlay Plugin | ✔ | ❌ |

### frontmatter: FrontmatterData
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Frontmatter Plugin | ❌ | ✔ Primary owner |
| Any plugin | ✔ | ❌ |

### codeblocks: CodeblockEntry[]
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Codeblock Extractor | ❌ | ✔ Primary owner |
| Syntax Highlight Plugin | ✔ | ❌ |

### highlightRequests: HighlightRequest[]
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Syntax Highlight Plugin | ❌ | ✔ Primary owner |
| Highlight Renderer (external) | ✔ | ❌ |

### containers: ContainerEntry[]
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Containers Plugin | ❌ | ✔ Primary owner |
| Debug Overlay Plugin | ✔ | ❌ |

## 2. Diagnostics‑Phase Artifacts

### diagnostics: UldeDiagnostics
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Any plugin | ✔ | ✔ |
| Debug Overlay Plugin | ✔ | ❌ |
| Profiler Plugin | ✔ | ❌ |
Diagnostics is intentionally global.

## 3. DOM‑Phase Artifacts

### anchors: AnchorEntry[]
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Anchors Plugin | ✔ (toc) | ✔ Primary owner |
| ScrollSpy Plugin | ✔ | ❌ |

### scrollspy: ScrollSpyEntry[]
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| ScrollSpy Plugin | ✔ (anchors) | ✔ Primary owner |

## 4. Render‑Phase Artifacts

### html: string
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| HTML Renderer | ❌ | ✔ |
| Final Render Plugin | ✔ | ❌ |

### finalHtml: string
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Final Render Plugin | ✔ | ✔ Primary owner |

### timeline: TimelineModel
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Timeline Plugin | ✔ (timings) | ✔ Primary owner |
| Debug Overlay Plugin | ✔ | ❌ |
| Profiler Plugin | ✔ | ❌ |

### debugOverlay: DebugOverlayModel
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Debug Overlay Plugin | ✔ | ✔ Primary owner |

### profiler: ProfilerModel
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Profiler Plugin | ✔ (timings) | ✔ Primary owner |
| Debug Overlay Plugin | ✔ | ❌ |

## 5. DevTools Artifacts

### artifactsPanel: ArtifactsPanelModel
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Artifacts Panel Plugin | ✔ | ✔ Primary owner |

## 6. Timings

### timings: UldeTimings
---
| Plugin | Reads | Writes |
| --- | --- | --- |
| Orchestrator | ❌ | ✔ Primary owner |
| Timeline Plugin | ✔ | ❌ |
| Profiler Plugin | ✔ | ❌ |
| Debug Overlay Plugin | ✔ | ❌ |

### Master Table: Plugin → Artifact Ownership
---
| Plugin | Phase | Writes | Reads |
| --- | --- | --- | --- |
| Links Plugin | CONTENT | ``links``, ``content`` | ``content``, ``config`` |
| Syntax Highlight Plugin | CONTENT | ``highlightRequests`` | ``codeblocks``, ``config`` |
| Anchors Plugin | CONTENT | ``anchors`` | ``toc`` |
| Debug Overlay Plugin | RENDER | ``debugOverlay`` | ``diagnostics``, ``timings``, ``toc``, ``links``, ``codeblocks``, ``containers`` |
| Profiler Plugin | DIAGNOSTICS | ``profiler`` | ``timings`` |
| Timeline Plugin | DIAGNOSTICS | ``timeline`` | ``timings`` |
| TOC Plugin | CONTENT | ``toc`` | ``content`` |
| Containers Plugin | CONTENT | ``containers`` | ``content`` |
| Codeblock Extractor | CONTENT | ``codeblocks`` | ``content`` |
| ScrollSpy Plugin | DOM | ``scrollspy`` | ``anchors`` |
| Final Render Plugin | RENDER | ``finalHtml`` | ``html`` |

