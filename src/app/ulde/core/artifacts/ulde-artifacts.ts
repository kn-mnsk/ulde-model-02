// ulde/core/artifacts/ulde-artifacts.ts

// ---------------------------------------------------------
// CONTENT PHASE ARTIFACTS
// ---------------------------------------------------------

export interface TocEntry {
  level: number;
  text: string;
  slug: string;
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
  title: string;
  items: any[];
}

export interface ArtifactsPanelModel {
  sections: ArtifactsPanelSection[];
}

// ---------------------------------------------------------
// MASTER ARTIFACTS INTERFACE
// ---------------------------------------------------------

export interface UldeArtifacts {
  // Content
  content: string;
  toc?: TocEntry[];
  links?: LinkEntry[];
  frontmatter?: FrontmatterData;
  codeblocks?: CodeblockEntry[];
  highlightRequests?: HighlightRequest[];
  containers?: ContainerEntry[];

  // Diagnostics
  diagnostics: {
    add(entry: DiagnosticEntry): void;
    all(): DiagnosticEntry[];
  };

  // DOM
  anchors?: AnchorEntry[];
  scrollspy?: ScrollSpyEntry[];

  // Render
  html?: string;
  finalHtml?: string;
  timeline?: TimelineModel;
  debugOverlay?: DebugOverlayModel;
  profiler?: ProfilerModel;

  // DevTools
  artifactsPanel?: ArtifactsPanelModel;

  // Timings
  timings: {
    add(entry: TimelineEntry): void;
    all(): TimelineEntry[];
  };
}
