// app/feature/docs-viewer/toc-resizer.directive.ts

import { Directive, ElementRef, HostListener, input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTocResizerDirective]',
})
export class TocResizerDirective {

  // The TOC container whose width we will modify
  dvTocResizer = input<HTMLElement>();
  // @Input('dvTocResizer') tocContainer!: HTMLElement;

  private isResizing = false;
  private minWidth = 150;
  private maxWidth = 500;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) { }

  // Start resizing
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (!this.dvTocResizer) return;
    // if (!this.tocContainer) return;

    this.isResizing = true;

    this.renderer.setStyle(document.body, 'cursor', 'e-resize');
    this.renderer.setStyle(this.el.nativeElement, 'background', '#4a87f8');
    this.renderer.setStyle(this.el.nativeElement, 'width', '10px');

    event.preventDefault();
  }

  // Resize as mouse moves
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing || !this.dvTocResizer) return;
    // if (!this.isResizing || !this.tocContainer) return;

    const newWidth = event.clientX;

    if (newWidth > this.minWidth && newWidth < this.maxWidth) {
      this.renderer.setStyle(this.dvTocResizer, 'width', `${newWidth}px`);
      // this.renderer.setStyle(this.tocContainer, 'width', `${newWidth}px`);
    }
  }

  // Stop resizing
  @HostListener('document:mouseup')
  onMouseUp() {
    if (!this.isResizing) return;

    this.isResizing = false;

    this.renderer.removeStyle(document.body, 'cursor');
    this.renderer.setStyle(this.el.nativeElement, 'background', 'transparent');
    this.renderer.setStyle(this.el.nativeElement, 'width', '10px');
  }
}
