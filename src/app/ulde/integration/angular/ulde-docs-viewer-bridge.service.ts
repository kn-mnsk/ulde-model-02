// ulde/integration/angular/ulde-docs-viewer-bridge.service.ts
/**
 * Bridge Angular → ULDE pipeline.
 */
import { Injectable } from '@angular/core';
import { DefaultUldeHostApi } from '../../core/host/ulde-host-api';
import { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import { UldeConfig } from '../../core/config/ulde-config';

@Injectable({
  providedIn: 'root'
})
export class UldeDocsViewerBridgeService {
  private host = new DefaultUldeHostApi();

  async render(content: string, config?: UldeConfig): Promise<UldePhaseContext> {
    return this.host.render(content, config);
  }
}
