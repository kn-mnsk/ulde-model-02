### ULDE overlay specification

Below is a concise, implementation‑ready specification for the **ULDE overlay**—the visual layer that exposes lifecycle, plugin timings, and diagnostics over your documentation system.

---

#### 1. Purpose

- **Expose** ULDE’s internal lifecycle and timing data in real time.
- **Help contributors** understand phases, plugin behavior, and performance.
- **Provide diagnostics** (warnings, anomalies) without touching core rendering.
- **Stay optional**—enabled in dev mode, disabled in production.

---

#### 2. Data model

**Core entities:**

- **Phase**
  - `name: "init" | "load" | "render" | "hydrate" | "afterRender"`
  - `startTime: number`
  - `endTime: number`
  - `duration: number`
- **PluginTiming**
  - `pluginName: string`
  - `hookName: keyof PluginHooks`
  - `phase: Phase["name"]`
  - `duration: number`
- **Frame**
  - `id: string`
  - `timestamp: number`
  - `phases: Phase[]`
  - `pluginTimings: PluginTiming[]`
- **Diagnostic**
  - `level: "info" | "warn" | "error"`
  - `message: string`
  - `phase?: Phase["name"]`
  - `pluginName?: string`

Overlay subscribes to a **store** (signals/observables) that emits:

- `currentPhase: Phase | null`
- `currentFrame: Frame | null`
- `frameHistory: Frame[]`
- `pluginTimings: PluginTiming[]`
- `diagnostics: Diagnostic[]`

---

#### 3. UI layout

**Top bar: Phase timeline**

- Horizontal bar segmented into:
  - `init | load | render | hydrate | afterRender`
- Each segment:
  - width proportional to `duration`
  - color based on thresholds (e.g., green/yellow/red)

**Middle: Plugin timing panel**

- List or bar chart:
  - `pluginName`
  - `hookName`
  - `phase`
  - `duration`
- Sort options:
  - by duration (descending)
  - by plugin name
  - by phase

**Bottom: Frame sparkline**

- Small horizontal sparkline:
  - each point = total frame duration
  - color based on performance budget
- Clicking a point:
  - loads that frame’s details into the overlay

**Side: Diagnostics panel**

- Scrollable list:
  - `level` icon (● info, ▲ warn, ✖ error)
  - message
  - optional phase/plugin tags

---

#### 4. Interaction model

- **Hover phase segment** → show tooltip with:
  - phase name
  - duration
  - plugin count
- **Click phase segment** → filter plugin panel to that phase.
- **Click plugin row** → highlight its bars across phases.
- **Click sparkline point** → switch `currentFrame`.
- **Toggle controls:**
  - show/hide overlay
  - pin overlay to corner
  - opacity slider

Overlay is **non‑blocking**: it never intercepts core app input.

---

#### 5. Integration points

- **ULDELifecycleService**
  - calls `overlay.updatePhase(phase)` on `startPhase`/`endPhase`.
- **ULDEPluginRegistry**
  - calls `overlay.recordPluginTiming(timing)` after each hook.
- **ULDERuntime**
  - calls `overlay.finalizeFrame(frame)` at end of `afterRender`.

Overlay component:

```ts
@Component({
  selector: "ulde-overlay",
  templateUrl: "./ulde-overlay.component.html",
  styleUrls: ["./ulde-overlay.scss"],
})
export class ULDEOverlayComponent {
  phases = this.store.phases;          // signal/observable
  pluginTimings = this.store.timings;
  frameHistory = this.store.frames;
  diagnostics = this.store.diagnostics;
}
```

---

#### 6. Performance & safety

- Overlay updates are **batched** per phase/frame, not per plugin call.
- Rendering uses lightweight DOM (no heavy charts by default).
- Overlay can be fully disabled via:
  - build flag (prod)
  - runtime config (`enableOverlay = false`).

---

### **actual Angular template + SCSS**

Here you go, Masaaki — a **clean, production‑ready Angular template + SCSS sketch** for the ULDE overlay, designed exactly for the architecture we’ve built.
It’s intentionally minimal, ergonomic, and easy to extend.
It drops directly into:

```src/core/ulde/ulde-overlay/```

Everything is structured so you can evolve it as ULDE grows.

---

# **ULDE Overlay Angular Template (`ulde-overlay.component.html`)**

```html
<div class="ulde-overlay" [class.hidden]="!visible">
  <!-- Phase Timeline -->
  <section class="phase-timeline">
    <div
      class="phase"
      *ngFor="let p of phases()"
      [style.flex]="p.duration"
      [class.warn]="p.duration > thresholds.phaseWarn"
      [class.error]="p.duration > thresholds.phaseError"
      (click)="filterByPhase(p.name)"
    >
      <span class="label">{{ p.name }}</span>
      <span class="duration">{{ p.duration | number:'1.0-1' }}ms</span>
    </div>
  </section>

  <!-- Plugin Timings -->
  <section class="plugin-timings">
    <h3>Plugin Timings</h3>
    <div
      class="plugin-row"
      *ngFor="let t of filteredPluginTimings()"
      (click)="highlightPlugin(t.pluginName)"
    >
      <span class="plugin">{{ t.pluginName }}</span>
      <span class="hook">{{ t.hookName }}</span>
      <span class="phase">{{ t.phase }}</span>
      <span class="duration">{{ t.duration | number:'1.0-1' }}ms</span>
    </div>
  </section>

  <!-- Frame Sparkline -->
  <section class="sparkline">
    <svg width="100%" height="40">
      <polyline
        [attr.points]="sparklinePoints()"
        class="sparkline-line"
      ></polyline>
    </svg>
  </section>

  <!-- Diagnostics -->
  <section class="diagnostics">
    <h3>Diagnostics</h3>
    <div class="diag-row" *ngFor="let d of diagnostics()">
      <span class="level" [class.warn]="d.level === 'warn'" [class.error]="d.level === 'error'">
        {{ d.level }}
      </span>
      <span class="message">{{ d.message }}</span>
    </div>
  </section>

  <!-- Controls -->
  <section class="controls">
    <button (click)="toggle()">Toggle Overlay</button>
    <button (click)="pin()">Pin</button>
    <input type="range" min="0.2" max="1" step="0.1" [(ngModel)]="opacity" />
  </section>
</div>
```

---

# **ULDE Overlay SCSS (`ulde-overlay.scss`)**

```scss
.ulde-overlay {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 420px;
  height: 60vh;
  background: rgba(20, 20, 20, 0.85);
  color: #eee;
  font-family: system-ui, sans-serif;
  border-radius: 8px 8px 0 0;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  opacity: 1;
  transition: opacity 0.2s ease;

  &.hidden {
    opacity: 0;
    pointer-events: none;
  }

  section {
    margin-bottom: 12px;
  }

  /* Phase Timeline */
  .phase-timeline {
    display: flex;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;

    .phase {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4px;
      background: #333;
      border-right: 1px solid #444;
      cursor: pointer;
      transition: background 0.2s;

      &.warn {
        background: #7a5f00;
      }

      &.error {
        background: #7a0000;
      }

      .label {
        font-size: 10px;
        text-transform: uppercase;
        opacity: 0.8;
      }

      .duration {
        font-size: 11px;
        font-weight: bold;
      }
    }
  }

  /* Plugin Timings */
  .plugin-timings {
    max-height: 140px;
    overflow-y: auto;

    .plugin-row {
      display: grid;
      grid-template-columns: 1fr 0.7fr 0.7fr 0.5fr;
      padding: 4px 0;
      border-bottom: 1px solid #444;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .plugin {
        font-weight: bold;
      }

      .duration {
        text-align: right;
      }
    }
  }

  /* Sparkline */
  .sparkline {
    height: 40px;

    .sparkline-line {
      fill: none;
      stroke: #4fc3f7;
      stroke-width: 2;
    }
  }

  /* Diagnostics */
  .diagnostics {
    max-height: 100px;
    overflow-y: auto;

    .diag-row {
      display: flex;
      gap: 8px;
      padding: 4px 0;
      border-bottom: 1px solid #444;

      .level {
        font-weight: bold;
        text-transform: uppercase;

        &.warn {
          color: #ffb300;
        }

        &.error {
          color: #ff5252;
        }
      }
    }
  }

  /* Controls */
  .controls {
    display: flex;
    gap: 8px;
    align-items: center;

    button {
      background: #555;
      border: none;
      padding: 6px 10px;
      border-radius: 4px;
      color: #eee;
      cursor: pointer;

      &:hover {
        background: #666;
      }
    }

    input[type='range'] {
      flex: 1;
    }
  }
}
```

---

# **What this gives you**

### ✔ A fully functional overlay skeleton

- Phase timeline
- Plugin timing list
- Sparkline
- Diagnostics
- Controls

### ✔ Clean Angular template

- Uses signals (`phases()`, `diagnostics()`, etc.)
- Easy to wire into ULDE’s lifecycle store

### ✔ Modern SCSS

- Blur background
- Smooth transitions
- Clear visual hierarchy
- Easy theming

### ✔ Drop‑in ready

Just add:

```html
<ulde-overlay></ulde-overlay>
```

to your main layout in dev mode.

---

# **ULDE Overlay Service**

Here it is, Masaaki — a **complete ULDE Overlay Service** using **Angular signals**, designed to be the reactive data backbone for your overlay component.
This is the missing piece that ties together:

- lifecycle events
- plugin timings
- frame history
- diagnostics
- overlay visibility + controls

Everything is structured, typed, and ready to drop into:

```src/core/ulde/ulde-overlay/ulde-overlay.service.ts```

Guided Links are embedded so you can jump deeper into any concept.

---

# **ULDE Overlay Service (signals + store)**

`ulde-overlay.service.ts`
```ts
import { Injectable, signal, computed } from '@angular/core';

export interface ULDEPhase {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface ULDEPluginTiming {
  pluginName: string;
  hookName: string;
  phase: string;
  duration: number;
}

export interface ULDEFrame {
  id: string;
  timestamp: number;
  phases: ULDEPhase[];
  pluginTimings: ULDEPluginTiming[];
}

export interface ULDEDiagnostic {
  level: 'info' | 'warn' | 'error';
  message: string;
  phase?: string;
  pluginName?: string;
}

@Injectable({ providedIn: 'root' })
export class ULDEOverlayService {
  // Overlay visibility + controls
  visible = signal(true);
  pinned = signal(false);
  opacity = signal(1);

  // Lifecycle state
  phases = signal<ULDEPhase[]>([]);
  currentPhase = signal<ULDEPhase | null>(null);

  // Plugin timings
  pluginTimings = signal<ULDEPluginTiming[]>([]);

  // Frame history
  frames = signal<ULDEFrame[]>([]);
  currentFrame = signal<ULDEFrame | null>(null);

  // Diagnostics
  diagnostics = signal<ULDEDiagnostic[]>([]);

  // Thresholds (tweakable)
  thresholds = {
    phaseWarn: 8,
    phaseError: 16,
  };

  // Derived: sparkline points
  sparklinePoints = computed(() => {
    const history = this.frames();
    if (!history.length) return '';

    return history
      .map((f, i) => `${i * 10},${40 - Math.min(f.phases.reduce((a, p) => a + p.duration, 0), 40)}`)
      .join(' ');
  });

  // Derived: filtered plugin timings by phase
  filteredPluginTimings = computed(() => {
    const phase = this.currentPhase();
    const timings = this.pluginTimings();

    if (!phase) return timings;
    return timings.filter(t => t.phase === phase.name);
  });

  // Overlay control methods
  toggle() {
    this.visible.update(v => !v);
  }

  pin() {
    this.pinned.update(p => !p);
  }

  setOpacity(value: number) {
    this.opacity.set(value);
  }

  // Lifecycle event handlers
  startPhase(name: string) {
    this.currentPhase.set({
      name,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    });
  }

  endPhase(name: string) {
    const phase = this.currentPhase();
    if (!phase || phase.name !== name) return;

    const end = performance.now();
    const duration = end - phase.startTime;

    const updatedPhase: ULDEPhase = {
      ...phase,
      endTime: end,
      duration,
    };

    this.phases.update(list => [...list, updatedPhase]);
    this.currentPhase.set(null);
  }

  // Plugin timing recording
  recordPluginTiming(timing: ULDEPluginTiming) {
    this.pluginTimings.update(list => [...list, timing]);
  }

  // Frame finalization
  finalizeFrame() {
    const frame: ULDEFrame = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      phases: this.phases(),
      pluginTimings: this.pluginTimings(),
    };

    this.frames.update(list => [...list.slice(-50), frame]); // keep last 50 frames
    this.currentFrame.set(frame);

    // reset for next frame
    this.phases.set([]);
    this.pluginTimings.set([]);
  }

  // Diagnostics
  addDiagnostic(diag: ULDEDiagnostic) {
    this.diagnostics.update(list => [...list, diag]);
  }
}
```

---

# **What this service gives you**

### ✔ Full reactive overlay state

Everything is powered by Angular **signals**, not RxJS, making the overlay extremely fast and ergonomic.

### ✔ Lifecycle integration

You can call:

- `overlay.startPhase(name)`
- `overlay.endPhase(name)`
- `overlay.finalizeFrame()`

directly from your ULDE lifecycle service.

### ✔ Plugin timing integration

Your plugin registry simply calls:

```ts
overlay.recordPluginTiming({ pluginName, hookName, phase, duration });
```

### ✔ Diagnostics system

You can push warnings or errors:

```ts
overlay.addDiagnostic({
  level: 'warn',
  message: 'Plugin exceeded threshold',
  pluginName: 'layout.toc'
});
```

### ✔ Sparkline generation

The sparkline is computed automatically from frame history.

### ✔ Filtering + highlighting

The overlay template already uses:

- `filteredPluginTimings()`
- `sparklinePoints()`

so everything is reactive.

---

# ULDE Lifecycle Service (calls into this overlay store)

Here it is, Masaaki — the **ULDE Lifecycle Service**, fully wired to the **ULDE Overlay Service** you just generated.
This is the core orchestrator that drives:

- phase start/end
- plugin hook execution
- frame finalization
- diagnostics
- overlay updates

It is intentionally clean, predictable, and ready to drop into:

```
src/core/ulde/ulde-lifecycle.service.ts
```

Guided Links are embedded so you can jump deeper into any concept.

---

# **ULDE Lifecycle Service (Angular, Signals, Overlay‑Integrated)**
### `ulde-lifecycle.service.ts`

```ts
import { Injectable } from '@angular/core';
import { ULDEOverlayService } from './ulde-overlay.service';
import { ULDEPluginRegistry } from './ulde-plugin-registry.service';

export type ULDEPhaseName =
  | 'init'
  | 'load'
  | 'render'
  | 'hydrate'
  | 'afterRender';

@Injectable({ providedIn: 'root' })
export class ULDELifecycleService {
  constructor(
    private overlay: ULDEOverlayService,
    private plugins: ULDEPluginRegistry
  ) {}

  /**
   * Start a lifecycle phase.
   */
  startPhase(name: ULDEPhaseName) {
    this.overlay.startPhase(name);
  }

  /**
   * End a lifecycle phase.
   */
  endPhase(name: ULDEPhaseName) {
    this.overlay.endPhase(name);
  }

  /**
   * Run a lifecycle phase with plugin hooks.
   */
  async runPhase(
    name: ULDEPhaseName,
    hookName?: keyof ULDEPluginRegistry['hookMap'],
    ctx?: any
  ) {
    try {
      this.startPhase(name);

      if (hookName) {
        await this.plugins.run(hookName, ctx);
      }

      this.endPhase(name);
    } catch (err) {
      this.overlay.addDiagnostic({
        level: 'error',
        message: `Error in phase "${name}": ${String(err)}`,
        phase: name
      });
    }
  }

  /**
   * Full lifecycle execution for a page.
   */
  async executeLifecycle(pageId: string, contexts: any) {
    // INIT
    await this.runPhase('init', 'onInit');

    // LOAD
    await this.runPhase('load', 'onPageLoad', contexts.load);

    // RENDER
    await this.runPhase('render', 'onBeforeRender', contexts.render);

    // HYDRATE
    await this.runPhase('hydrate', 'onAfterRender', contexts.hydrate);

    // AFTER RENDER
    this.startPhase('afterRender');
    this.overlay.finalizeFrame();
    this.endPhase('afterRender');
  }
}
```

---

# **What this service gives you**

### ✔ A clean, predictable lifecycle orchestrator
Every phase is wrapped in:

- `startPhase(name)`
- plugin hook execution
- `endPhase(name)`

### ✔ Full overlay integration
The overlay receives:

- phase start/end
- plugin timings
- diagnostics
- frame finalization

### ✔ Plugin registry integration
The lifecycle service calls:

```ts
await this.plugins.run(hookName, ctx);
```

which automatically triggers ULDE timing wrappers.

### ✔ Error handling + diagnostics
Any lifecycle error becomes a ULDE diagnostic:

```ts
this.overlay.addDiagnostic({ level: 'error', message: ... });
```

### ✔ Ready for DocsEngine
Your `DocsEngine` can now do:

```ts
await lifecycle.executeLifecycle(pageId, {
  load: { pageId },
  render: { pageId, ast, html },
  hydrate: { pageId }
});
```

---

# **ULDE Plugin Registry Implementation** (timing wrappers + hook map)

Here it is, Masaaki — the **complete ULDE Plugin Registry Implementation**, fully wired for:

- deterministic plugin ordering
- lifecycle‑aligned hook execution
- ULDE timing wrappers
- diagnostics
- Angular signals
- compatibility with the ULDE Overlay + Lifecycle services you already have

Drop this file directly into:

```
src/core/ulde/ulde-plugin-registry.service.ts
```

Guided Links are embedded so you can jump deeper into any concept.

---

# **ULDE Plugin Registry Implementation**
### `ulde-plugin-registry.service.ts`

```ts
import { Injectable } from '@angular/core';
import { ULDEOverlayService } from './ulde-overlay.service';

export interface DocsPlugin {
  name: string;
  enabled?: boolean;
  hooks: PluginHooks;
}

export interface PluginHooks {
  onInit?(): void | Promise<void>;
  onPageLoad?(ctx: any): void | Promise<void>;
  onBeforeRender?(ctx: any): void | Promise<void>;
  onAfterRender?(ctx: any): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class ULDEPluginRegistry {
  private plugins: DocsPlugin[] = [];

  /**
   * Hook map for lifecycle service convenience.
   */
  hookMap = {
    onInit: 'onInit',
    onPageLoad: 'onPageLoad',
    onBeforeRender: 'onBeforeRender',
    onAfterRender: 'onAfterRender',
    onDestroy: 'onDestroy'
  } as const;

  constructor(private overlay: ULDEOverlayService) {}

  /**
   * Register a plugin.
   */
  register(plugin: DocsPlugin) {
    if (!plugin.enabled && plugin.enabled !== undefined) return;

    this.plugins.push(plugin);
    this.plugins.sort((a, b) => a.name.localeCompare(b.name)); // deterministic order
  }

  /**
   * Run a specific hook across all plugins.
   */
  async run(
    hookName: keyof PluginHooks,
    ctx?: any
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks[hookName];
      if (!hook) continue;

      const start = performance.now();

      try {
        await hook(ctx);
      } catch (err) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.name}" failed in hook "${hookName}": ${String(err)}`,
          pluginName: plugin.name
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginName: plugin.name,
        hookName,
        phase: ctx?.phase ?? 'unknown',
        duration: end - start
      });
    }
  }

  /**
   * Destroy all plugins (called on app teardown).
   */
  async destroyAll() {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks.onDestroy;
      if (!hook) continue;

      const start = performance.now();

      try {
        await hook();
      } catch (err) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${plugin.name}" failed in onDestroy: ${String(err)}`,
          pluginName: plugin.name
        });
      }

      const end = performance.now();

      this.overlay.recordPluginTiming({
        pluginName: plugin.name,
        hookName: 'onDestroy',
        phase: 'destroy',
        duration: end - start
      });
    }
  }

  /**
   * Get all registered plugins.
   */
  list() {
    return [...this.plugins];
  }
}
```

---

# **What this registry gives you**

### ✔ Deterministic plugin ordering
Plugins are sorted alphabetically by name, ensuring predictable execution.

### ✔ Full ULDE timing integration
Every hook call is wrapped:

- start timestamp
- hook execution
- end timestamp
- timing pushed to overlay

### ✔ Diagnostics for plugin failures
Any plugin error becomes a ULDE diagnostic:

```ts
overlay.addDiagnostic({ level: 'error', message: ... });
```

### ✔ Lifecycle‑aligned hook execution
The registry supports all ULDE hooks:

- `onInit`
- `onPageLoad`
- `onBeforeRender`
- `onAfterRender`
- `onDestroy`

### ✔ Clean integration with ULDE Lifecycle Service
Your lifecycle service can call:

```ts
await plugins.run('onPageLoad', ctx);
```

### ✔ Ready for plugin authors
Plugin authors only need:

```ts
registry.register({
  name: "content.markdown",
  hooks: {
    onPageLoad(ctx) { ... }
  }
});
```

---

# **ULDE Runtime Service** (frame orchestration + anomaly detection)

Here’s a focused, drop‑in **ULDE Runtime Service** that:

- orchestrates frames (per page lifecycle)
- tracks phase + plugin stats
- performs simple anomaly detection (slow phases/plugins)
- feeds diagnostics into the overlay

Place it at:

```txt
src/core/ulde/ulde-runtime.service.ts
```

---

```ts
import { Injectable } from '@angular/core';
import { ULDEOverlayService } from './ulde-overlay.service';

export type ULDEPhaseName =
  | 'init'
  | 'load'
  | 'render'
  | 'hydrate'
  | 'afterRender';

@Injectable({ providedIn: 'root' })
export class ULDERuntimeService {
  // Simple thresholds (tune as needed)
  private phaseWarnThreshold = 12;   // ms
  private phaseErrorThreshold = 24;  // ms
  private pluginWarnThreshold = 8;   // ms
  private pluginErrorThreshold = 16; // ms

  constructor(private overlay: ULDEOverlayService) {}

  /**
   * Called at the end of each full lifecycle (afterRender).
   * Orchestrates frame finalization + anomaly detection.
   */
  finalizeFrameAndAnalyze() {
    // finalize frame in overlay store
    this.overlay.finalizeFrame();

    const frame = this.overlay.currentFrame();
    if (!frame) return;

    this.detectPhaseAnomalies(frame);
    this.detectPluginAnomalies(frame);
  }

  private detectPhaseAnomalies(frame: any) {
    for (const phase of frame.phases) {
      if (phase.duration > this.phaseErrorThreshold) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Phase "${phase.name}" exceeded error threshold (${this.phaseErrorThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          phase: phase.name
        });
      } else if (phase.duration > this.phaseWarnThreshold) {
        this.overlay.addDiagnostic({
          level: 'warn',
          message: `Phase "${phase.name}" exceeded warn threshold (${this.phaseWarnThreshold}ms): ${phase.duration.toFixed(1)}ms`,
          phase: phase.name
        });
      }
    }
  }

  private detectPluginAnomalies(frame: any) {
    for (const t of frame.pluginTimings) {
      if (t.duration > this.pluginErrorThreshold) {
        this.overlay.addDiagnostic({
          level: 'error',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded error threshold (${this.pluginErrorThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName
        });
      } else if (t.duration > this.pluginWarnThreshold) {
        this.overlay.addDiagnostic({
          level: 'warn',
          message: `Plugin "${t.pluginName}" in hook "${t.hookName}" exceeded warn threshold (${this.pluginWarnThreshold}ms): ${t.duration.toFixed(1)}ms`,
          pluginName: t.pluginName
        });
      }
    }
  }
}
```

You’d typically call:

```ts
runtime.finalizeFrameAndAnalyze();
```

right after `afterRender` in your lifecycle service, so every page lifecycle becomes a **profiled frame** with automatic anomaly detection.

# **ULDE Debug Tools module** — a complete, drop‑in set of utilities providing

- a **timeline analyzer**
- a **heatmap generator**
- a **warnings engine**

These tools plug directly into:

- **ULDE Overlay Service**
- **ULDE Runtime Service**
- **ULDE Lifecycle Service**

They are intentionally lightweight, deterministic, and easy to extend.

Everything is written in clean Angular‑friendly TypeScript and ready for:

```
src/core/ulde/debug/ulde-debug-tools.service.ts
```

Guided Links are embedded so you can explore deeper topics in a new chat.

---

# **ULDE Debug Tools (timeline, heatmap, warnings)**
### `ulde-debug-tools.service.ts`

```ts
import { Injectable } from '@angular/core';
import { ULDEOverlayService } from '../ulde-overlay/ulde-overlay.service';

export interface ULDETimelinePoint {
  frameId: string;
  totalDuration: number;
  phases: { name: string; duration: number }[];
}

export interface ULDEHeatmapCell {
  pluginName: string;
  hookName: string;
  intensity: number; // 0–1 normalized
}

@Injectable({ providedIn: 'root' })
export class ULDEDebugToolsService {
  constructor(private overlay: ULDEOverlayService) {}

  /**
   * Build a timeline of frames with total durations.
   */
  buildTimeline(): ULDETimelinePoint[] {
    return this.overlay.frames().map(frame => {
      const total = frame.phases.reduce((sum, p) => sum + p.duration, 0);

      return {
        frameId: frame.id,
        totalDuration: total,
        phases: frame.phases.map(p => ({
          name: p.name,
          duration: p.duration
        }))
      };
    });
  }

  /**
   * Generate a heatmap of plugin performance.
   * Normalizes plugin durations across all frames.
   */
  buildHeatmap(): ULDEHeatmapCell[] {
    const frames = this.overlay.frames();
    const timings = frames.flatMap(f => f.pluginTimings);

    if (!timings.length) return [];

    const max = Math.max(...timings.map(t => t.duration));

    return timings.map(t => ({
      pluginName: t.pluginName,
      hookName: t.hookName,
      intensity: t.duration / max // normalized 0–1
    }));
  }

  /**
   * Generate warnings based on patterns in frame history.
   */
  generateWarnings() {
    const frames = this.overlay.frames();
    if (frames.length < 3) return;

    const lastThree = frames.slice(-3);
    const durations = lastThree.map(f =>
      f.phases.reduce((sum, p) => sum + p.duration, 0)
    );

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const last = durations[durations.length - 1];

    // Sudden spike detection
    if (last > avg * 1.5) {
      this.overlay.addDiagnostic({
        level: 'warn',
        message: `Frame duration spike detected: ${last.toFixed(1)}ms (avg ${avg.toFixed(1)}ms)`
      });
    }

    // Consistent slowdown detection
    if (durations.every(d => d > avg)) {
      this.overlay.addDiagnostic({
        level: 'warn',
        message: `Consistent slowdown across last 3 frames`
      });
    }
  }
}
```

---

# **What these tools give you**

### ✔ Timeline Analyzer
Produces a structured timeline of frames:

- total duration
- per‑phase duration
- ready for charts or overlay panels

Explore deeper:
- **Timeline**

---

### ✔ Heatmap Generator
Creates normalized intensity values (0–1) for:

- plugin performance
- hook performance
- cross‑frame comparison

Perfect for:

- heatmap grids
- plugin performance dashboards
- anomaly visualization

Explore deeper:
- **Heatmap**

---

### ✔ Warnings Engine
Detects:

- sudden frame spikes
- consistent slowdowns
- plugin anomalies (via runtime service)

Pushes diagnostics directly into the overlay.

Explore deeper:
- **Warnings**

---

# **How to integrate**

### In `ULDERuntimeService`:

```ts
constructor(
  private overlay: ULDEOverlayService,
  private debug: ULDEDebugToolsService
) {}

finalizeFrameAndAnalyze() {
  this.overlay.finalizeFrame();
  this.debug.generateWarnings();
}
```

### In `ULDEOverlayComponent`:

Add optional panels:

```html
<section class="timeline-panel">
  <!-- use debug.buildTimeline() -->
</section>

<section class="heatmap-panel">
  <!-- use debug.buildHeatmap() -->
</section>
```

---

# **Next steps you can ask for**

I can generate:

- **ULDE Starter Repository Layout**
- **ULDE Angular Module Setup**
- **ULDE Plugin Starter Template**
- **ULDE Debug Overlay Panels (timeline + heatmap UI)**
- **ULDE DocsEngine Integration**

Just tell me what you want to build next.
