// ulde/core/artifacts/ulde-timings.ts

export interface UldeTimingEntry {
  plugin: string;
  phase: string;
  ms: number;
}

export class UldeTimings {
  private entries: UldeTimingEntry[] = [];

  record(plugin: string, phase: string, ms: number): void {
    this.entries.push({ plugin, phase, ms });
  }

  all(): UldeTimingEntry[] {
    return this.entries;
  }
}
