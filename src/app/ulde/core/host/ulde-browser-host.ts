// ulde/core/host/ulde-browser-host.ts

// import { runUldePipeline } from '../lifecycle/ulde-orchestrator';

/**
 * Browser DOM Plugin Interface
 *
 * These plugins operate on the REAL DOM.
 * They run AFTER ULDE has produced finalHtml.
 *
 * Examples:
 *   - Mermaid rendering
 *   - KaTeX auto-render
 *   - Anchors injection
 *   - ScrollSpy observers
 */
export interface BrowserDomPlugin {
  id: string;
  init(container: HTMLElement): Promise<void> | void;
  update?(container: HTMLElement): Promise<void> | void;
  destroy?(container: HTMLElement): Promise<void> | void;
}

/**
 * ULDE Browser Host (v3)
 *
 * Responsibilities:
 *   1. Run ULDE string-based pipeline (CONTENT → TRANSFORM → DIAGNOSTICS → ASSEMBLE)
 *   2. Inject finalHtml into the DOM
 *   3. Run browser-only DOM plugins on the real DOM
 */
export class UldeBrowserHost {
  private browserDomPlugins: BrowserDomPlugin[] = [];

  /**
   * Register a browser-only DOM plugin
   */
  registerBrowserDomPlugin(plugin: BrowserDomPlugin) {
    this.browserDomPlugins.push(plugin);
  }

  /**
   * Run ULDE end-to-end in the browser.
   */
  async run(container: HTMLElement, content: string) {
    // // 1. Run ULDE pipeline (string world)
    // const ctx = await runUldePipeline({ content });

    // // 2. Insert final HTML into the DOM
    // const html =
    //   ctx.artifacts.finalHtml ??
    //   ctx.artifacts.html ??
    //   ctx.artifacts.content ??
    //   '';

    // container.innerHTML = "";

    container.innerHTML = content;


    // 3. Run browser DOM plugins (real DOM world)
    for (const plugin of this.browserDomPlugins) {
      try {
        await plugin.init(container);
      } catch (err) {
        console.error(`[ULDE Browser Plugin Error] ${plugin.id}`, err);
      }
    }
  }


  async update(container: HTMLElement, content: string) {

    container.innerHTML = content;


    // 3. Run browser DOM plugins (real DOM world)
    for (const plugin of this.browserDomPlugins) {
      // if (plugin === undefined) return;
      try {
        plugin.update?.(container);
      } catch (err) {
        console.error(`[ULDE Browser Plugin Error] ${plugin.id}`, err);
      }
    }
  }

}
