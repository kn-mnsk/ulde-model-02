// app/features/docs-viewer/theme-toggle/theme-toggle.ts

import { Component, Output, EventEmitter, signal, output } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {

  toggleTheme = output();
  // @Output() toggleTheme = new EventEmitter<void>();

  // Local UI state (optional)
  isDark = signal(false);

  toggle() {
    this.isDark.update(v => !v);
    this.toggleTheme.emit();
  }
}
