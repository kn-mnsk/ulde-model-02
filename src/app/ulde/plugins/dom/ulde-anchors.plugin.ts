import type { UldePlugin } from '../../core/registry/ulde-plugin-api';
import { UldePhase } from '../../core/lifecycle/ulde-phases';
import type { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import type { AnchorEntry, TocEntry} from '../../core/artifacts/ulde-artifacts';

export function createUldeAnchorsPlugin(): UldePlugin {
  return {
    meta: {
      name: 'ulde-anchors',
      version: '1.0.0',
      description: 'Derives anchor entries from TOC.',
    },
    phase: UldePhase.CONTENT,

    run(ctx: UldePhaseContext) {
      const { artifacts } = ctx;

      if (artifacts.anchors && artifacts.anchors.length > 0) {
        return;
      }

      const toc: TocEntry[] = artifacts.toc ?? [];

      const anchors: AnchorEntry[] = toc.map(entry => ({
        slug: entry.slug,
        text: entry.text,
        level: entry.level,
      }));

      artifacts.anchors = anchors;
    },
  };
}
