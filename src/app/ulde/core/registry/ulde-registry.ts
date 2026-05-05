// ulde/core/registry/ulde-registry.ts

import { UldePhase } from '../lifecycle/ulde-phases';
import { UldePlugin } from './ulde-plugin-api';

// export interface UldePlugin {
//   name: string;
//   phase: UldePhase;
//   run(ctx: any): Promise<void> | void;
// }

export class UldeRegistry {
  private plugins: Map<UldePhase, UldePlugin[]> = new Map();

  register(plugin: UldePlugin): void {
    if (!this.plugins.has(plugin.phase)) {
      this.plugins.set(plugin.phase, []);
    }
    this.plugins.get(plugin.phase)!.push(plugin);
  }

  getPluginsForPhase(phase: UldePhase): UldePlugin[] {
    return this.plugins.get(phase) ?? [];
  }
}
