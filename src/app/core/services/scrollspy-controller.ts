// app/core/services/scrollspy-controller.ts

export class ScrollSpyController {
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
        this.allow();
        callback();
        return;
      }

      last = now;
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  }
}
