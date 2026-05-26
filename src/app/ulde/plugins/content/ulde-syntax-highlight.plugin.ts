import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import type { HighlightRequest, CodeblockEntry, } from '../../core/artifacts/ulde-artifacts';

export const UldeSyntaxHighlightPlugin: UldePlugin = {
  meta: {
    name: 'ulde-syntax-highlight',
    version: '1.0.0',
    description: 'Collects highlight requests for code blocks.',
  },
  phase: UldePhase.CONTENT,

  run(ctx: UldePhaseContext) {
    const { artifacts, config } = ctx;

    const codeblocks: CodeblockEntry[] = artifacts.codeblocks ?? [];
    const allowedLanguages = config.highlightLanguages ?? [];

    const highlightRequests: HighlightRequest[] = codeblocks.map(block => ({
      index: block.index,
      language: block.language,
      highlight:
        allowedLanguages.length === 0 ||
        allowedLanguages.includes(block.language),
    }));

    artifacts.highlightRequests = highlightRequests;

    artifacts.diagnostics.add({
      plugin: 'ulde-syntax-highlight',
      message: `Syntax Hightlight Request(s) Found ${highlightRequests.length} request(s).`,
      severity: 'info',
    });

  },


};

