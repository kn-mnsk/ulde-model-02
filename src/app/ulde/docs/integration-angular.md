
# Angular Integration (ULDE-MODEL-01)

This document describes how to integrate ULDE-MODEL-01 into an Angular application.

The integration has three main parts:

1. Angular service (`UldeAngularService`)
2. Angular viewer component (`DocsViewer`)
3. Browser runtime (via `UldeBrowserHost` and browser plugins)

---

## 1. Angular service

**File:**

- `app/ulde/ulde-angular.service.ts`

Responsibilities:

- Accept markdown input
- Call `runUldePipeline()`
- Expose results via an observable

Example:

```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { runUldePipeline } from './core/lifecycle/ulde-orchestrator';

import {
  DebugOverlayModel,
  ArtifactsPanelModel,
} from './core/artifacts/ulde-artifacts';

export interface UldeRunResult {
  finalHtml: string;
  debugOverlay: DebugOverlayModel | null;
  artifactsPanel: ArtifactsPanelModel | null;
}

@Injectable({ providedIn: 'root' })
export class UldeAngularService {
  private readonly _result$ = new BehaviorSubject<UldeRunResult | null>(null);
  readonly result$ = this._result$.asObservable();

  async renderMarkdown(markdown: string): Promise<void> {
    const ctx = await runUldePipeline({
      content: markdown,
      config: {
        enableProfiler: true,
        enableDebugOverlay: true,
        enableArtifactsPanel: true,
        highlightLanguages: ['ts', 'js', 'html'],
      },
    });

    this._result$.next({
      finalHtml: ctx.artifacts.finalHtml ?? ctx.artifacts.html ?? '',
      debugOverlay: ctx.artifacts.debugOverlay ?? null,
      artifactsPanel: ctx.artifacts.artifactsPanel ?? null,
    });
  }
}
```

## 2. Angular viewer component

__File:__

app/docs-viewer/docs-viewer.ts

__Responsibilities:__

- Accept markdown as input
- Call UldeAngularService.renderMarkdown()
- Render HTML, artifacts, and debug overlay

__Example:__

```ts
import { Component, input, signal, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JsonPipe } from '@angular/common';
import { UldeAngularService, UldeRunResult } from '../ulde/ulde-angular.service';
import { ArtifactsPanelModel, DebugOverlayModel } from '../ulde/core/artifacts/ulde-artifacts';

@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './docs-viewer.html',
  styleUrls: ['./docs-viewer.css'],
})
export class DocsViewer {
  markdown = input<string>('');

  html = signal<SafeHtml | null>(null);
  debugOverlay = signal<DebugOverlayModel | null>(null);
  artifactsPanel = signal<ArtifactsPanelModel | null>(null);

  constructor(
    private readonly ulde: UldeAngularService,
    private readonly sanitizer: DomSanitizer,
  ) {
    effect(() => {
      const md = this.markdown();
      if (md === '') return;
      this.ulde.renderMarkdown(md);
    });

    this.ulde.result$.subscribe(result => {
      if (!result) return;
      this.applyResult(result);
    });
  }

  private applyResult(result: UldeRunResult) {
    this.html.set(this.sanitizer.bypassSecurityTrustHtml(result.finalHtml));
    this.debugOverlay.set(result.debugOverlay);
    this.artifactsPanel.set(result.artifactsPanel);
  }

  trackByTitle = (_: number, item: { title: string }) => item.title;
  trackByIndex = (_: number, item: { index: number }) => item.index;
  trackByObjectIdentity = (_: number, item: any) => item;
}
```

## 3. Angular viewer template

__File:__

- app/docs-viewer/docs-viewer.html

__Example:__

```html
<div class="docs-layout">

  @if (artifactsPanel()) {
    <aside class="docs-sidebar">
      <h3>Artifacts</h3>

      @for (section of artifactsPanel()?.sections; track trackByTitle($index, section)) {
        <div class="artifact-section">
          <h4>{{ section.title }}</h4>

          <ul>
            @for (item of section.items; track trackByIndex($index, item)) {
              <li>
                <pre>{{ item | json }}</pre>
              </li>
            }
          </ul>
        </div>
      }
    </aside>
  }

  <main class="docs-main">
    <div class="docs-content" [innerHTML]="html()"></div>
  </main>

  @if (debugOverlay()) {
    <section class="docs-debug-overlay">
      <h3>Debug Overlay</h3>
      <pre>{{ debugOverlay()?.summary | json }}</pre>
    </section>
  }

</div>
```

## 4. Browser plugins in Angular

Browser plugins (Mermaid, KaTeX, Anchors, ScrollSpy) are registered in the browser host, not in the Angular component.

You can either:

- Use UldeBrowserHost directly in a custom Angular component, or
- Keep Angular focused on pipeline + rendering, and let a separate integration handle browser plugins.

In ULDE-MODEL-01, the canonical browser integration is documented in the React section and can be mirrored in Angular if needed.
