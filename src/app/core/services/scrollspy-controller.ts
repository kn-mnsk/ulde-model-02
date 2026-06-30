// app/core/services/scrollspy-controller.ts

export class ScrollSpyController {
  private readonly title = '[ScrollSpyController]';

  private suppressed = false;
  lastScrollTop = -1;


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
    this.lastScrollTop = -1;

    const check = () => {
      const now = wrapper.scrollTop;

      if (now === this.lastScrollTop) {
        // this.allow();
        callback();
        // console.log(`Log: ${this.title} detectScrollEnd final end=`, Number(this.lastScrollTop.toFixed(2)));
        return;
      }

      this.lastScrollTop = now;
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  }
}
