// app/feature/docs-viewer/toc-resizer.directive.ts

import { Directive, ElementRef, HostListener, input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTocResizerDirective]',
})
export class TocResizerDirective {

  // The TOC container whose width we will modify
  dvTocResizer = input<HTMLElement>();
  // @Input('dvTocResizer') tocContainer!: HTMLElement;
  private resizer!: HTMLElement;
  private toc!: ParentNode | null;
  private isResizing = false;
  private minWidth = 150;
  private maxWidth = 500;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) { }

  // -------------------------------
  // Start resizing
  // -------------------------------
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.resizer = this.el.nativeElement;
    this.toc = this.resizer.parentElement as HTMLElement;

    this.isResizing = true;

    this.renderer.setStyle(this.toc, 'cursor', 'e-resize');
    this.renderer.setStyle(this.resizer, 'background', '#4a87f8');
    this.renderer.setStyle(this.resizer, 'width', '6px');

    event.preventDefault();
  }

   // -------------------------------
  // Resize as mouse moves
  // (document-level listener)
  // -------------------------------
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {

    if (!this.isResizing) return;

    const newWidth = event.clientX;
    if (newWidth > this.minWidth && newWidth < this.maxWidth) {

      this.renderer.setStyle(this.toc, 'width', `${newWidth}px`);

    }
  }

  // -------------------------------
  // Stop resizing
  // (document-level listener)
  // -------------------------------
  @HostListener('document:mouseup')
  onMouseUp() {

    if (!this.isResizing) return;

    this.isResizing = false;

    this.renderer.removeStyle(this.toc, 'cursor');
    this.renderer.setStyle(this.resizer, 'background', 'transparent');
    this.renderer.setStyle(this.resizer, 'width', '6px');

  }
}
