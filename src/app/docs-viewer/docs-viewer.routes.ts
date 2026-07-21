// app/docs-viewer/docs-viewer.routes.ts

import type { Routes } from '@angular/router';
import { DocsViewer } from './docs-viewer';

export const DOCS_VIEWER_ROUTES: Routes = [
  {
    path: '',
    component: DocsViewer
  }
];
