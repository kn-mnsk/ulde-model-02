// app/ulde/integration/angular/ulde-docs-renderer.service.ts

import { Injectable } from '@angular/core';
import { runUldeStringPluginPipeline } from '../../core/lifecycle/ulde-orchestrator';

@Injectable({ providedIn: 'root' })
export class UldeDocsRendererService {

  async render(docId: string): Promise<string> {
    // 1. Resolve file path
    const url = `/docs/${docId}.md`;

    // 2. Load markdown
    const markdown = await fetch(url).then(r => {
      if (!r.ok) throw new Error(`Cannot load doc: ${url}`);
      return r.text();
    });

    // 3. Run ULDE pipeline
    const ctx = await runUldeStringPluginPipeline({
      content: markdown
    });


    // 4. Return final HTML
    return ctx.artifacts.finalHtml ?? '';
  }
}
