// app/core/services/scrollspy-controller.ts

export class ScrollSpyController {
  private readonly title = '[ScrollSpyController]';

  private suppressed = false;
  private lastScrollTop = -1;

  suppress() {
    this.suppressed = true;
  }

  allow() {
    this.suppressed = false;
  }

  isSuppressed() {
    return this.suppressed;
  }

  detectScrollEnd(wrapper: HTMLElement, callback: () => void) {
    let last = -1;

    const check = () => {
      const now = wrapper.scrollTop;

      if (now === last) {
        // this.allow();
        callback();
        console.log(`Log: ${this.title} detectScrollEnd final end=`, Number(last.toFixed(2)));
        return;
      }

      last = now;
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  }
}
