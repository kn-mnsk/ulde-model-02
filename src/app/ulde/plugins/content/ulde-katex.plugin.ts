// -------------------------------------------------------------
// ULDE v2 KaTeX Plugin (matches your real UldePlugin + UldePhaseContext)
// -------------------------------------------------------------
// - Content-phase plugin
// - Mutates ctx.content
// - No diagnostics, no debug API (you didn't define them)
// - No assumptions beyond what you actually showed
// -------------------------------------------------------------

import katex from 'katex';
import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';

export interface UldeKatexPluginOptions {
  enableInlineDollar?: boolean; // $...$
  enableInlineParen?: boolean;  // \( ... \)
  enableBlockDollar?: boolean;  // $$...$$
  katexOptions?: katex.KatexOptions;
}

const DEFAULT_KATEX_OPTIONS: katex.KatexOptions = {
  throwOnError: false,
  output: 'html',
};

export function createUldeKatexPlugin(
  options: UldeKatexPluginOptions = {}
): UldePlugin {
  const {
    enableInlineDollar = true,
    enableInlineParen = true,
    enableBlockDollar = true,
    katexOptions = {},
  } = options;

  const mergedOptions: katex.KatexOptions = {
    ...DEFAULT_KATEX_OPTIONS,
    ...katexOptions,
  };

  return {
    meta: {
      name: 'ulde-katex',
      version: '1.0.0',
      description: 'Renders inline and block math using KaTeX.',
    },

    phase: UldePhase.CONTENT,

    run(ctx: UldePhaseContext) {
      let content = ctx.content;

      if (enableBlockDollar) {
        content = renderBlockMathDollar(content, mergedOptions);
      }

      if (enableInlineParen) {
        content = renderInlineMathParen(content, mergedOptions);
      }

      if (enableInlineDollar) {
        content = renderInlineMathDollar(content, mergedOptions);
      }

      ctx.content = content;
    },
  };
}

// -------------------------------------------------------------
// Block Math: $$ ... $$
// -------------------------------------------------------------
function renderBlockMathDollar(
  input: string,
  opts: katex.KatexOptions
): string {
  const regex = /^\s*\$\$([\s\S]+?)\s*\$\$\s*$/gm;

  return input.replace(regex, (match, math) => {
    const html = safeRender(math.trim(), { ...opts, displayMode: true });
    return `<div class="katex-block">${html}</div>`;
  });
}

// -------------------------------------------------------------
// Inline Math: \( ... \)
// -------------------------------------------------------------
function renderInlineMathParen(
  input: string,
  opts: katex.KatexOptions
): string {
  const regex = /\\\((.+?)\\\)/g;

  return input.replace(regex, (match, math) => {
    const html = safeRender(math.trim(), { ...opts, displayMode: false });
    return `<span class="katex-inline">${html}</span>`;
  });
}

// -------------------------------------------------------------
// Inline Math: $ ... $
// -------------------------------------------------------------
function renderInlineMathDollar(
  input: string,
  opts: katex.KatexOptions
): string {
  const regex = /(?<!\$)\$(.+?)\$(?!\$)/g;

  return input.replace(regex, (match, math) => {
    const html = safeRender(math.trim(), { ...opts, displayMode: false });
    return `<span class="katex-inline">${html}</span>`;
  });
}

// -------------------------------------------------------------
// Safe KaTeX wrapper — never throws
// -------------------------------------------------------------
function safeRender(math: string, opts: katex.KatexOptions): string {
  try {
    return katex.renderToString(math, opts);
  } catch {
    return `<code class="katex-error">${escapeHtml(math)}</code>`;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
