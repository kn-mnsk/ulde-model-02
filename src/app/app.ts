import { Component, signal } from '@angular/core';
import { DocsViewer } from './docs-viewer/docs-viewer';

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

  docId = 'docs/index';

}
