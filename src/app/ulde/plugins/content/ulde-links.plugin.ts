import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import { LinkEntry } from '../../core/artifacts/ulde-artifacts';


export function createUldeLinksPlugin(): UldePlugin {
  return {
    meta: {
      name: 'ulde-links',
      version: '1.0.0',
      description: 'Rewrites links and records link metadata.',
    },
    phase: UldePhase.CONTENT,

    run(ctx: UldePhaseContext) {
      const { content, config, artifacts } = ctx;

      const baseUrl: string = config['baseUrl'] ?? '';

      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const links: LinkEntry[] = [];
      const rewrittenContent = content.replace(
        linkRegex,
        (match: any, text: string, href: string) => {
          const isExternal =
            href.startsWith('http://') || href.startsWith('https://');

          const absoluteHref =
            isExternal || href.startsWith('#') ? href : baseUrl + href;

          links.push({
            text,
            href: absoluteHref,
            isExternal,
          });

          return `[${text}](${absoluteHref})`;
        }
      );

      artifacts.links = links;
      ctx.content = rewrittenContent;
    },
  };
}
