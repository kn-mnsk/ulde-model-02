// app/ulde/ulde-angular.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { createUldePluginRegistry } from './core/registry/ulde-plugin-registry';
import { runUldePipeline } from './core/lifecycle/ulde-orchestrator'; // teaching stub

export interface UldeRunResult {
  finalHtml: string;
  debugOverlay: any;
  artifactsPanel: any;
  scrollspy: any[];
}

@Injectable({ providedIn: 'root' })
export class UldeAngularService {
  private readonly _result$ = new BehaviorSubject<UldeRunResult | null>(null);
  readonly result$ = this._result$.asObservable();

  async renderMarkdown(markdown: string): Promise<void> {
    const plugins = createUldePluginRegistry();

    // Teaching orchestrator: run all plugins in order
    const ctx = await runUldePipeline({
      content: markdown,
      plugins,
      config: {
        validDocs: [],          // for Broken Links
        highlightLanguages: [], // for Syntax Highlight
      },
    });

    this._result$.next({
      finalHtml: ctx.artifacts.finalHtml ?? ctx.artifacts.html ?? '',
      debugOverlay: ctx.artifacts.debugOverlay ?? null,
      artifactsPanel: ctx.artifacts.artifactsPanel ?? null,
      scrollspy: ctx.artifacts.scrollspy ?? [],
    });
  }
}
