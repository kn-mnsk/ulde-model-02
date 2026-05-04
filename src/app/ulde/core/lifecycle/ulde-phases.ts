// ulde/core/lifecycle/ulde-phases.ts

export enum UldePhase {
  CONTENT = 'content',
  DOM = 'dom',
  DIAGNOSTICS = 'diagnostics',
  RENDER = 'render',
}

export interface UldePhaseContext {
  phase: UldePhase;
  artifacts: any; // will be UldeArtifacts, but typed later to avoid circular deps
  config: any;    // UldeConfig
}
