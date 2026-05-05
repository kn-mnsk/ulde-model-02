// ulde/core/config/ulde-config.ts
/**
 *This is the canonical config type
  * Plugins now know exactly what config fields exist
  * Contributors can extend config safely
  * No more Record<string, any> ambiguity
  * Angular can autocomplete config fields
 */
export interface UldeConfig {
  /** List of valid document slugs for Broken Links plugin */
  validDocs?: string[];

  /** Languages allowed for syntax highlighting */
  highlightLanguages?: string[];

  /** Enable or disable the Profiler plugin */
  enableProfiler?: boolean;

  /** Enable or disable the Debug Overlay plugin */
  enableDebugOverlay?: boolean;

  /** Enable or disable the Artifacts Panel plugin */
  enableArtifactsPanel?: boolean;

  /** Reserved for future ULDE features */
  [key: string]: any;
}
