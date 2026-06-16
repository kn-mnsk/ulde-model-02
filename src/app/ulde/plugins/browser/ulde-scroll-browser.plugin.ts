// ulde/plugins/browser/ulde-scroll-browser.plugin.ts

import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';

export const UldeScrollBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.scrollspy',

  init(container: HTMLElement) {
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

    console.log(`Log: [UldeScrollBrowserPlugin] headings=`, headings);
    if (headings.length > 0) {

      // IntersectionObserver to detect which heading is currently visible
      const observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              // Remove previous active states
              container
                .querySelectorAll('.active-heading')
                .forEach(el => el.classList.remove('active-heading'));

              // Mark the current heading as active
              entry.target.classList.add('active-heading');
            }
              // Dispatch ScrollSpy event with the heading ID
              const id = (entry.target as HTMLElement).id;

              console.log(`Log: [UldeScrollBrowserPlugin] entry=`, entry);
              if (id) {
                container.dispatchEvent(
                  new CustomEvent('ulde:scrollspy', {
                    detail: { id },
                    bubbles: true
                  })
                );
              }
            // }
          }
        },
        {
          root: null,
          rootMargin: '0px 0px -60% 0px', // triggers earlier for better UX
          threshold: 0.1
        }
      );

      // Observe each heading
      headings.forEach(h => {
        // console.log(`Log: [UldeScrollBrowserPlugin] observed heading=`, h);
        observer.observe(h)
      });

    }

    // ---------------------------------------------
    // 2. Scroll Position Spy (NEW) - scroll position tracking
    // ---------------------------------------------
    let lastSent = 0;

    const onScroll = () => {
      const now = performance.now();

      // throttle to ~30fps
      if (now - lastSent < 33) return;
      lastSent = now;

      container.dispatchEvent(
        new CustomEvent('ulde:scrollpos', {
          detail: { scrollTop: container.scrollTop },
          bubbles: true
        })
      );
    };

    container.addEventListener('scroll', onScroll);

  }
};
