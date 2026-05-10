// ulde/integration/static/ulde-static-runner.ts
/**
 * Run ULDE in Node to generate static HTML.
 */
import { DefaultUldeHostApi } from '../../core/host/ulde-host-api';
import { promises as fs } from 'fs';
import * as path from 'path';

export async function runStaticUlde(inputFile: string, outputFile: string) {
  const host = new DefaultUldeHostApi();

  const content = await fs.readFile(inputFile, 'utf8');
  const ctx = await host.render(content);

  await fs.writeFile(outputFile, ctx.artifacts.finalHtml ?? '', 'utf8');

  console.log(`ULDE static build complete: ${outputFile}`);
}
