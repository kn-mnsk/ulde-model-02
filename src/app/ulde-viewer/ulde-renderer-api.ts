// ulde-viewer/ulde-renderer-api.ts

export interface UldeRendererConfig {
  container: HTMLElement;
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface UldeRendererState {
  modelId: string;
  variantId?: string;
  zoom: number;
  rotation: { x: number; y: number; z: number };
}

export interface UldeRendererEvents {
  onReady?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: UldeRendererState) => void;
}

export interface UldeRendererHandle {
  setState(state: Partial<UldeRendererState>): void;
  getState(): UldeRendererState;
  dispose(): void;
}

export function createUldeRenderer(
  config: UldeRendererConfig,
  events?: UldeRendererEvents
): UldeRendererHandle {
  // implementation in renderer layer (no Angular imports)
  // ...
  return {
    setState(partial) { /* ... */ },
    getState() { /* ... */ return {} as UldeRendererState; },
    dispose() { /* ... */ }
  };
}
