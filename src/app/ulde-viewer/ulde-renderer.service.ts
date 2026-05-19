// app/ulde-viewer/ulde-renderer.service.ts

import { Injectable, ElementRef } from '@angular/core';
import {
  createUldeRenderer,
  UldeRendererHandle,
  UldeRendererConfig,
  UldeRendererEvents,
  UldeRendererState
} from './ulde-renderer-api';

@Injectable({ providedIn: 'root' })
export class UldeRendererService {
  private handle?: UldeRendererHandle;

  init(
    host: ElementRef<HTMLElement>,
    config: Omit<UldeRendererConfig, 'container'>,
    events?: UldeRendererEvents
  ) {
    this.dispose();

    this.handle = createUldeRenderer(
      { container: host.nativeElement, ...config },
      events
    );
  }

  setState(state: Partial<UldeRendererState>) {
    this.handle?.setState(state);
  }

  getState(): UldeRendererState | null {
    return this.handle ? this.handle.getState() : null;
  }

  dispose() {
    this.handle?.dispose();
    this.handle = undefined;
  }



}
