// app/core/services/overlay-manager.service.ts

import { Injectable, ElementRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OverlayManager {

  show(el: ElementRef<HTMLElement> | undefined) {
    if (!el) return;
    const node = el.nativeElement;

    node.classList.remove('hidden');
    node.classList.add('visible');
  }

  hide(el: ElementRef<HTMLElement> | undefined) {
    if (!el) return;
    const node = el.nativeElement;

    // Fade-out after next paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        queueMicrotask(() => {
          node.classList.remove('visible');
          node.classList.add('hidden');
        });
      });
    });
  }
}
