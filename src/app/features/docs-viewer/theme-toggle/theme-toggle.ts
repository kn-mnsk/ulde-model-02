// app/features/docs-viewer/theme-toggle/theme-toggle.ts

import { Component, signal, output } from '@angular/core';
import { defaultThemeName } from '../../../core/services/theme.service';
import type { ThemeName } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {

  $toggleTheme = output<ThemeName>();
  // @Output() toggleTheme = new EventEmitter<void>();

  // Local UI state (optional)
  $themeName = signal<ThemeName>(defaultThemeName);

  toggle() {
    this.$themeName.update((v: ThemeName) => (v === 'dark') ? 'light': 'dark');
    this.$toggleTheme.emit(this.$themeName());
    // console.log(`Log: [ThemeToggle] isDark=`, this.isDark());
  }
}
