// ulde/core/lifecycle/ulde-phase-context.ts

import { UldePhase } from './ulde-phases';
import { UldeArtifacts } from '../artifacts/ulde-artifacts';
import { UldeConfig } from '../config/ulde-config';

export interface UldePhaseContext {
  phase: UldePhase;
  content: string;
  artifacts: UldeArtifacts;
  config: UldeConfig;
}
