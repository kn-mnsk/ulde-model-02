// ulde/plugins/browser/ulde-scroll-browser.plugin.ts

import { Observable } from 'rxjs';
import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';

export const UldeScrollBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.scrollspy',

  init(container: HTMLElement) { // container is now 'host-wrapper'
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    if (!isBrowser) return;


    // ---------------------------------------------
    // 1. ScrollSpy (existing)- spy which heading is active, i.e. heading visivility tracking
    // ---------------------------------------------
    const headings = Array.from(
      container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    );

    // console.log(`Log: [UldeScrollBrowserPlugin] headings=`, headings);

    // Based on MDN sample
    // https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/observe

    // Register IntersectionObserver
    const headingObserver = new IntersectionObserver(
      (entries) => {
        // console.log(`Log: [UldeScrollBrowserPlugin] IntersectionObserver \nentries=`, entries);
        // Remove previous active states
        entries.forEach(entry => {
          entry.target.classList.remove('active-heading')
        });

        entries.forEach((entry) => {
          if (entry.intersectionRect && entry.isIntersecting) {
            // Add 'active' class if observation target is inside viewport
            entry.target.classList.add("active-heading");

            const id = (entry.target as HTMLElement).id;
            if (id) {
              container.dispatchEvent(
                new CustomEvent('ulde:scrollspy', {
                  detail: { id },
                  bubbles: true
                })
              );
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60% 0px', // triggers earlier for better UX
        threshold: 0.1
      }
    );

    // Declares what to observe, and observes its properties.
    headings.forEach((el) => {
      headingObserver.observe(el);
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
    // container.onclick = onScroll;

  }
};
