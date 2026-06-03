import { Component, signal, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { DocsViewer } from './features/docs-viewer/docs-viewer';
// import { CURRENT_THEME } from './core/tokens/theme.token';

@Component({
  selector: 'app-root',
  imports: [
    DocsViewer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ulde-model-01');

  // docId = 'docs/APPREADME';
  // docId = 'docs/index';
  docId = 'docs/test/test.katex';

  // private $isBrowser = signal<boolean>(false);

  // private theme = inject(CURRENT_THEME);
  // constructor(
  //   @Inject(PLATFORM_ID) private platformId: Object,
  // ) {
  //   this.$isBrowser.set(isPlatformBrowser(this.platformId));
  //   if (this.$isBrowser()) {
  //     // Expose theme globally for ULDE plugins
  //     (window as any).__APP_THEME__ = this.theme;
  //   }
  // }

}
