// ulde/plugins/browser/ulde-scroll-browser.plugin.ts
import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';

export const UldeScrollBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.scrollspy',

  init(container: HTMLElement) { // container is now 'host-wrapper'
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    if (!isBrowser) return;

    //---------------------------------------------
    // 1. ScrollSpy (existing)- spy which heading is active, i.e. heading visivility tracking
    // ---------------------------------------------
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    // console.log(`Log: [UldeScrollBrowserPlugin] headings=`, headings, container);

    const scrollspy = (entries: any) => {
      // console.log(`Log: [UldeScrollBrowserPlugin] IntersectionObserver \nentries length=`, entries.length);

      entries.forEach((entry: any) => {

        if (entry.isIntersecting) {

          const id = (entry.target as HTMLElement).id;
          if (!id) return;
          // const index = headings.findIndex(t => t.id === id);

          // console.log(`Log: [UldeScrollBrowserPlugin] scroll down id=`, currId, currIndex, entry.intersectionRect.y);

          container.dispatchEvent(
            new CustomEvent('ulde:scrollspy', {
              detail: {
                id: id,
                // index: index,
              },
              bubbles: true
            })
          );
        }
      });
    };

    // Register IntersectionObserver
    const headingsObserver = new IntersectionObserver(
      scrollspy, {
      root: container,
      // root: null,
      // rootMargin: '+20% 0px -20% 0px',
      rootMargin: '0px 0px 0px 0px',
      threshold: 1
    });

    // Declares what to observe, and observes its properties.
    headings.forEach((el) => {
      headingsObserver.observe(el);
    });

    // ---------------------------------------------
    // 2. Scroll Position Spy (NEW) - scroll position tracking
    // ---------------------------------------------
    let lastSent = 0;
    // console.log(`Log: [UldeScrollBrowserPlugin] ulde:scrollpos `, container);
    const onScroll = (e: any) => {
      const now = performance.now();
      // console.log(`Log: [UldeScrollBrowserPlugin] ulde:scrollpos `);
      // throttle to ~30fps
      if (now - lastSent < 33) return;
      lastSent = now;

      const pos = container.scrollTop;
      const height = container.scrollHeight - container.clientHeight;

      // console.log(`Log: [UldeScrollBrowserPlugin] ulde:scrollpos \npos=`, pos, `\nheight=`, height);

      container.dispatchEvent(
        new CustomEvent('ulde:scrollpos', {
          detail: {
            event: e,
            scrollTop: pos,
            scrollHeight: height
          },
          bubbles: true
        })
      );
    };

    // console.log(`Log: [UldeScrollBrowserPlugin] ulde:scrollpos `, document);
    container.addEventListener('scroll', onScroll);

  }
};
