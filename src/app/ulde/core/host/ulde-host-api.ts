// ulde/core/host/ulde-host-api.ts
/**
 * A tiny abstraction that all integrations (Angular, React, static) use to run ULDE.
 */
import { runUldePipeline } from '../lifecycle/ulde-orchestrator';
import { UldeConfig } from '../config/ulde-config';
import { UldePhaseContext } from '../lifecycle/ulde-phase-context';

export interface UldeHostApi {
  render(content: string, config?: UldeConfig): Promise<UldePhaseContext>;
}

export class DefaultUldeHostApi implements UldeHostApi {
  async render(content: string, config?: UldeConfig): Promise<UldePhaseContext> {
    return runUldePipeline({ content, config });
  }
}
