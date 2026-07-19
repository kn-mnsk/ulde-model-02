// ulde-viewer/ulde-viewer.ts

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import type { AfterViewInit, OnDestroy, } from '@angular/core';
import {
  UldeRendererService
} from './ulde-renderer.service';
import type { UldeRendererState } from './ulde-renderer-api';

@Component({
  selector: 'ulde-viewer',
  template: `<div #canvasHost class="ulde-viewer-host"></div>`,
  styles: [`
    .ulde-viewer-host {
      width: 100%;
      height: 100%;
      display: block;
    }
  `]
})
export class UldeViewer implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true })
  hostRef!: ElementRef<HTMLElement>;

  @Input() modelId!: string;
  @Input() variantId?: string;
  @Input() zoom = 1;
  @Input() rotation: UldeRendererState['rotation'] = { x: 0, y: 0, z: 0 };

  @Output() ready = new EventEmitter<void>();
  @Output() error = new EventEmitter<Error>();
  @Output() stateChange = new EventEmitter<UldeRendererState>();

  constructor(private rendererService: UldeRendererService) { }

  ngAfterViewInit(): void {
    this.rendererService.init(
      this.hostRef,
      {
        width: this.hostRef.nativeElement.clientWidth,
        height: this.hostRef.nativeElement.clientHeight
      },
      {
        onReady: () => this.ready.emit(),
        onError: (e) => this.error.emit(e),
        onStateChange: (s) => this.stateChange.emit(s)
      }
    );

    this.syncInputs();
  }

  ngOnDestroy(): void {
    this.rendererService.dispose();
  }

  ngOnChanges(): void {
    this.syncInputs();
  }

  private syncInputs() {
    this.rendererService.setState({
      modelId: this.modelId,
      variantId: this.variantId,
      zoom: this.zoom,
      rotation: this.rotation
    });
  }
}
