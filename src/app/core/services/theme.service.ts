// app/core/services/theme.service.ts


import { Injectable } from '@angular/core';
import { isBrowser } from '../../global.utils/global.utils';

import mermaid from 'mermaid';

// export ThemeName:  'light' | 'dark';
export type ThemeName = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app-theme';
  private readonly attrName = 'data-theme';
  // private readonly mermaidName = 'data-theme';

  constructor() {
    if (!isBrowser()) return;
    const saved = (sessionStorage.getItem(this.storageKey) as ThemeName) || 'light';
    // const saved = (sessionStorage.getItem(this.storageKey) as ThemeName) || 'dark';
    this.applyTheme(saved, { animate: false });
  }

  get currentTheme(): ThemeName {
    if (!isBrowser()) {
      return 'light';// default for SSR
    };
    const attr = document.documentElement.getAttribute(this.attrName) as ThemeName | null;
    return attr ?? 'light';
  }

  toggleTheme(): void {
    const next: ThemeName = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(next, { animate: true });
    sessionStorage.setItem(this.storageKey, next);
    // sessionStorage.setItem(this.storageKey, 'dark');

    // console.log(`Log: [ThemeService] ToggleTheme new theme=`, next)
  }

  setTheme(theme: ThemeName): void {
    this.applyTheme(theme, { animate: true });
    sessionStorage.setItem(this.storageKey, theme as string);
    // console.log(`Log: [ThemeService] setTheme =`, theme);
  }

  // getTheme(): string{
  //   return sessionStorage.getItem(this.storageKey)?? 'dark';
  // }

  private applyTheme(theme: ThemeName, opts: { animate: boolean }) {

    // Apply attribute for CSS + Angular Material theming
    document.documentElement.setAttribute(this.attrName, theme);

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
    // const mermaidSvgs = document.querySelectorAll('.language-mermaid');
    const mermaidSvgs = document.querySelectorAll('code.language-mermaid svg');
    mermaidSvgs.forEach(s => {
      s.classList.add('theme-enter');

      // console.log(`Log: mermaidSvg=`, s);

      setTimeout(() => s.classList.remove('theme-enter'), 700);
    });

  }
}
