import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsViewer } from './docs-viewer/docs-viewer';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ulde-model');

  markdown =
`
---
title: ULDE Demo
---
# Hello ULDE

This is a **test**.

\`\`\`ts
console.log("Hello ULDE");
\`\`\`

:::info
This is a container block.
:::

# 1️⃣ **Markdown enters the pipeline**

\`\`\`mermaid
sequenceDiagram
    autonumber
    participant App as App / Angular / React
    participant Pipeline as ULDE Pipeline
    App->>Pipeline: runUldePipeline({ content })
\`\`\`

`;


}
