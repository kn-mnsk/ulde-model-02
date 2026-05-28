// app/core/services/theme.service.ts


import { Injectable } from '@angular/core';
import { isBrowser } from '../../global.utils/global.utils';

import mermaid from 'mermaid';

type ThemeName = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app-theme';
  private readonly attrName = 'data-theme';
  // private readonly mermaidName = 'data-theme';

  constructor() {
    if (!isBrowser()) return;
    // const saved = (sessionStorage.getItem(this.storageKey) as ThemeName) || 'light';
    const saved = (sessionStorage.getItem(this.storageKey) as ThemeName) || 'dark';
    this.applyTheme(saved, { animate: false });
  }

  get currentTheme(): ThemeName {
    const attr = document.documentElement.getAttribute(this.attrName) as ThemeName | null;
    return attr ?? 'light';
  }

  toggleTheme(): void {
    const next: ThemeName = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(next, { animate: true });
    sessionStorage.setItem(this.storageKey, next);
  }

  setTheme(theme: ThemeName): void {
    this.applyTheme(theme, { animate: true });
    sessionStorage.setItem(this.storageKey, theme);
  }

  private applyTheme(theme: ThemeName, opts: { animate: boolean }) {
    const root = document.documentElement;

    // Apply attribute for CSS + Angular Material theming
    root.setAttribute(this.attrName, theme);

    // Body fade-in (uses your @keyframes fade-in)
    if (opts.animate) {
      this.animateBodyFade();
    }

    // Artifacts panel micro animation
    if (opts.animate) {
      this.animateArtifactsPanelTheme();
    }
    // Mermaid micro animation
    if (opts.animate) {
      this.animateMermaid();
    }
  }

  private animateBodyFade() {
    const body = document.body;
    if (!body) return;

    // Restart animation
    body.style.animation = 'none';
    // Force reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    body.offsetHeight;
    body.style.animation = 'fade-in 0.7s forwards ease-in-out';
  }

  private animateArtifactsPanelTheme() {
    const panel = document.querySelector('.ulde-artifacts-panel-content') as HTMLElement | null;
    if (!panel) return;

    panel.classList.add('theme-enter');
    setTimeout(() => panel.classList.remove('theme-enter'), 180);
  }

  private animateMermaid() {
    const mermaidSvgs = document.querySelectorAll('code.language-mermaid svg');
    mermaidSvgs.forEach(s => {
      s.classList.add('theme-enter');

      // console.log(`Log: mermaidSvg=`, s);

      setTimeout(() => s.classList.remove('theme-enter'), 700);
    });
    // console.log(`Log: mermaidSvgs=`, mermaidSvgs)
    // setTimeout(() => mermaidSvgs.forEach(s => s.classList.remove('theme-enter'), 50000));

  }
}
