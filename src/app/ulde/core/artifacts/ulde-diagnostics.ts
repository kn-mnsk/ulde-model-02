// ulde/core/artifacts/ulde-diagnostics.ts

export interface UldeDiagnosticEntry {
  plugin: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export class UldeDiagnostics {
  private entries: UldeDiagnosticEntry[] = [];

  add(entry: UldeDiagnosticEntry): void {
    this.entries.push(entry);
  }

  all(): UldeDiagnosticEntry[] {
    return this.entries;
  }
}
