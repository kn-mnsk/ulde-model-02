// ulde/core/artifacts/ulde-artifacts.ts

// ---------------------------------------------------------
// CONTENT PHASE ARTIFACTS
// ---------------------------------------------------------

export interface TocEntry {
  level: number;
  text: string;
  slug: string;
}

export interface TocNode {
  entry: TocEntry;
  children: TocNode[];
  collapsed: boolean;
}

export interface LinkEntry {
  href: string;
  text: string;
  isExternal: boolean;
}

export interface FrontmatterData {
  [key: string]: any;
}

export interface CodeblockEntry {
  index: number;
  language: string;
  code: string;
}

export interface HighlightRequest {
  index: number;
  language: string;
  highlight: boolean;
}

export interface ContainerEntry {
  index: number;
  type: string;       // note, warning, tip, etc.
  /**
   * Raw or transformed content.
   * Written by: Markdown Parser, KaTeX Plugin, Links Plugin, Containers Plugin
   * Read by: All content-phase plugins
   */
  content: string;
}

// ---------------------------------------------------------
// DIAGNOSTICS PHASE ARTIFACTS
// ---------------------------------------------------------

export type DiagnosticSeverity = 'info' | 'warning' | 'error';

export interface DiagnosticEntry {
  plugin: string;
  message: string;
  severity: DiagnosticSeverity;
}

// ---------------------------------------------------------
// DOM PHASE ARTIFACTS
// ---------------------------------------------------------

export interface AnchorEntry {
  slug: string;
  text: string;
  level: number;
}

export interface ScrollSpyEntry {
  slug: string;
  level: number;
  active?: boolean;
}

// ---------------------------------------------------------
// RENDER PHASE ARTIFACTS
// ---------------------------------------------------------

export interface TimelineEntry {
  plugin: string;
  phase: string;
  ms: number;
}

export interface TimelineModel {
  entries: TimelineEntry[];
  totalMs: number;
}

export interface DebugOverlayModel {
  summary: {
    totalPlugins: number;
    totalDiagnostics: number;
    totalTimeMs: number;
  };
  diagnostics: DiagnosticEntry[];
  /**
   * Timing entries for all plugins.
   * Written by: Orchestrator
   * Read by: Timeline Plugin, Profiler Plugin, Debug Overlay Plugin
   */
  timings: TimelineEntry[];
}

export interface ProfilerPhaseEntry {
  phase: string;
  totalMs: number;
  overheadMs: number;
  plugins: Array<{ plugin: string; ms: number }>;
}

export interface MemorySnapshot {
  phase: string;
  memoryMB: number;
}

export interface ProfilerModel {
  phases: ProfilerPhaseEntry[];
  memorySnapshots: MemorySnapshot[];
  anomalies: Array<{ phase: string; message: string }>;
  summary: {
    totalPlugins: number;
    totalPhases: number;
    totalTimeMs: number;
  };
}

// ---------------------------------------------------------
// ARTIFACTS PANEL MODEL
// ---------------------------------------------------------

export interface ArtifactsPanelSection {
  id: string;
  title: string;
  icon: string;
  items: any[];
}

export interface ArtifactsPanelModel {
  groups: ArtifactsPanelGroup[];
  // sections: ArtifactsPanelSection[];
}

export interface ArtifactsPanelGroup {
  id: string;
  title: string;
  icon: string;
  sections: ArtifactsPanelSection[];
}


// ---------------------------------------------------------
// MASTER ARTIFACTS INTERFACE
// ---------------------------------------------------------

export interface UldeArtifacts {
  // Content
  /**
   * Raw or transformed content.
   * Written by: Markdown Parser, KaTeX Plugin, Links Plugin, Containers Plugin
   * Read by: All content-phase plugins
   */
  content: string;
  /**
   * Table of contents entries.
   * Written by: TOC Plugin
   * Read by: Anchors Plugin, Debug Overlay Plugin
   */
  toc?: TocEntry[];
  /**
   * Link metadata extracted from content.
   * Written by: Links Plugin
   * Read by: Debug Overlay Plugin
   */
  links?: LinkEntry[];
  frontmatter?: FrontmatterData;
  codeblocks?: CodeblockEntry[];
  /**
   * Highlight requests for the renderer.
   * Written by: Syntax Highlight Plugin
   * Read by: Highlight Renderer
   */
  highlightRequests?: HighlightRequest[];
  containers?: ContainerEntry[];

  // Diagnostics
  diagnostics: {
    add(entry: DiagnosticEntry): void;
    all(): DiagnosticEntry[];
  };

  // DOM
  /**
   * Anchor entries derived from TOC.
   * Written by: Anchors Plugin
   * Read by: ScrollSpy Plugin
   */
  anchors?: AnchorEntry[];
  scrollspy?: ScrollSpyEntry[];

  // Render
  html?: string;
  finalHtml?: string;
  /**
   * Timeline of plugin execution.
   * Written by: Timeline Plugin
   * Read by: Debug Overlay Plugin, Profiler Plugin
   */
  timeline?: TimelineModel;
  /**
   * Debug overlay model.
   * Written by: Debug Overlay Plugin
   * Read by: DevTools
   */
  debugOverlay?: DebugOverlayModel;
  /**
   * Profiler model.
   * Written by: Profiler Plugin
   * Read by: DevTools
   */
  profiler?: ProfilerModel;

  // DevTools
  artifactsPanel?: ArtifactsPanelModel;

  // Timings
  /**
   * Timing entries for all plugins.
   * Written by: Orchestrator
   * Read by: Timeline Plugin, Profiler Plugin, Debug Overlay Plugin
   */
  timings: {
    add(entry: TimelineEntry): void;
    all(): TimelineEntry[];
  };
}
