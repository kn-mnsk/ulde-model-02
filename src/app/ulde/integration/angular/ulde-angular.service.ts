// app/ulde/ulde-angular.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { runUldeStringPluginPipeline } from '../../core/lifecycle/ulde-orchestrator';
import { TocEntry } from '../../core/artifacts/ulde-artifacts';

import {
  DebugOverlayModel,
  ArtifactsPanelModel,
} from '../../core/artifacts/ulde-artifacts';

export interface UldeRunResult {
  finalHtml: string;
  debugOverlay: DebugOverlayModel | null;
  artifactsPanel: ArtifactsPanelModel | null;
  toc: TocEntry[] | null;
}

@Injectable({ providedIn: 'root' })
export class UldeAngularService {
  private readonly _result$ = new BehaviorSubject<UldeRunResult | null>(null);
  readonly result$ = this._result$.asObservable();

  async renderMarkdown(markdown: string): Promise<void> {

    // console.log(`Log: [UldeAngularService] rrenderMarkdown raw markdown=`, markdown);

    const ctx = await runUldeStringPluginPipeline({
      content: markdown,
      config: {
        enableProfiler: true,
        enableDebugOverlay: true,
        enableArtifactsPanel: true,
        highlightLanguages: ['ts', 'js', 'html'],
      },
    });

      // console.log(`Log: [UldeAngularService] rrenderMarkdown runUldePipeline finished ctx=`, ctx);

    this._result$.next({
      finalHtml: ctx.artifacts.finalHtml ?? ctx.artifacts.html ?? '',
      debugOverlay: ctx.artifacts.debugOverlay ?? null,
      artifactsPanel: ctx.artifacts.artifactsPanel ?? null,
      toc: ctx.artifacts.toc ?? null
    });
  }


}
