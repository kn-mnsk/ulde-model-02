// ulde/core/lifecycle/ulde-phase-context.ts

import { UldePhase } from './ulde-phases';

export interface UldePhaseContext {
  phase: UldePhase;
  content: string;
  artifacts: any; // UldeArtifacts (later)
  config: Record<string, any>;
}
