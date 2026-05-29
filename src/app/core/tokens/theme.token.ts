// src/app/core/tokens/theme.token.ts
import { InjectionToken } from '@angular/core';
import { ThemeName } from '../services/theme.service';

export const CURRENT_THEME = new InjectionToken<ThemeName>('CURRENT_THEME');
