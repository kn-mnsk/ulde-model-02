// app/ulde/ulde-angular.service.ts

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
