import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { CURRENT_THEME } from './core/tokens/theme.token';
import { ThemeService, ThemeName } from './core/services/theme.service';
// import { Ulde } from './ulde/core/ulde/ulde';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // {provide: Ulde, useClass: Ulde},
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    // Call our currentTheme function at startup
    // {
    //   provide: CURRENT_THEME,
    //   useFactory: () => {
    //     const themeService = inject(ThemeService);

    //     // SSR-safe: do NOT access document here
    //     if (typeof document === 'undefined') {
    //       return 'light' as ThemeName; // or your default??
    //     }
    //     return themeService.currentTheme;
    //   }
    // }
  ]
};
