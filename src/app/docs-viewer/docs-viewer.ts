// app/docs-viewer/docs-viewer.ts

import { Component, input, signal, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JsonPipe } from '@angular/common';
import { UldeAngularService, UldeRunResult } from '../ulde/ulde-angular.service';
import { ArtifactsPanelModel, DebugOverlayModel, ScrollSpyEntry } from '../ulde/core/artifacts/ulde-artifacts';

@Component({
  selector: 'app-docs-viewer',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './docs-viewer.html',
  styleUrls: ['./docs-viewer.css'],
})
export class DocsViewer {
  // ---------------------------------------------------------
  // Signal input instead of @Input()
  // ---------------------------------------------------------
  markdown = input<string>('');

  // ---------------------------------------------------------
  // Internal reactive state (signals)
  // ---------------------------------------------------------
  html = signal<SafeHtml | null>(null);
  debugOverlay = signal<DebugOverlayModel | null>(null);
  artifactsPanel = signal<ArtifactsPanelModel | null>(null);
  scrollspy = signal<ScrollSpyEntry[]>([]);

  constructor(
    private readonly ulde: UldeAngularService,
    private readonly sanitizer: DomSanitizer,
  ) {
    // -------------------------------------------------------
    // React to markdown input changes
    // -------------------------------------------------------
    effect(() => {
      const md = this.markdown();
      if (md === '') return;
      this.ulde.renderMarkdown(md);
    });

    // -------------------------------------------------------
    // React to ULDE pipeline results
    // -------------------------------------------------------
    this.ulde.result$.subscribe(result => {
      if (!result) return;
      this.applyResult(result);
    });
  }

  // ---------------------------------------------------------
  // Apply ULDE results into signals
  // ---------------------------------------------------------
  private applyResult(result: UldeRunResult) {
    this.html.set(this.sanitizer.bypassSecurityTrustHtml(result.finalHtml));
    this.debugOverlay.set(result.debugOverlay);
    this.artifactsPanel.set(result.artifactsPanel);
    this.scrollspy.set(result.scrollspy);
  }

  // ScrollSpy, Anchors, TOC
  trackBySlug = (_: number, item: { slug: string }) => item.slug;

  // Codeblocks, Containers
  trackByIndex = (_: number, item: { index: number }) => item.index;

  // Artifact sections
  trackByTitle = (_: number, item: { title: string }) => item.title;

  // Fallback for unknown items
  trackByObjectIdentity = (_: number, item: any) => item;

}
