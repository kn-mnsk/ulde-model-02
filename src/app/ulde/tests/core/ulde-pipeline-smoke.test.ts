// ulde/tests/core/ulde-pipeline-smoke.test.ts

import { DefaultUldeHostApi } from '../../../ulde/core/host/ulde-host-api';

async function runSmokeTest() {
  const host = new DefaultUldeHostApi();

  const markdown = `
# Hello ULDE

This is a test.

\`\`\`mermaid
graph TD;
  A-->B;
\`\`\`
`;

  const ctx = await host.render(markdown);

  console.log('--- ULDE Smoke Test ---');
  console.log('Phase:', ctx.phase);
  console.log('Diagnostics:', ctx.artifacts.diagnostics.all());
  console.log('Timings:', ctx.artifacts.timings.all());
  console.log('Final HTML length:', ctx.artifacts.finalHtml?.length ?? 0);

  if (!ctx.artifacts.finalHtml) {
    throw new Error('finalHtml is missing — render phase failed.');
  }

  console.log('ULDE pipeline executed successfully.');
}

runSmokeTest().catch(err => {
  console.error('ULDE pipeline test failed:', err);
});
