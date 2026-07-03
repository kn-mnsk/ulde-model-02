// app/core/services/scrollspy-controller.ts

export class ScrollSpyController {
  private readonly title = '[ScrollSpyController]';

  private suppressed = false; // default
  // private suppressed = true; // default
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
    let counter = 1;

    const check = () => {
      const now = wrapper.scrollTop;

      if (now === this.lastScrollTop) {

        callback();
        const lastScrollTop = Number(this.lastScrollTop.toFixed(2));

        // console.log(`Log: ${this.title} detectScrollEnd final \nend=`, lastScrollTop, `\counter=`, counter);

        return;
      }

      this.lastScrollTop = now;
      counter++;
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  }
}
