Alright 🚀 — here’s the reactive version for Angular v17+
This approach uses RxJS so you can subscribe to an event whenever the element inside the @if block appears or disappears.

It’s cleaner for large apps because you don’t have to poll or manually check in lifecycle hooks.

my.component.ts
```ts

import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-my',
  templateUrl: './my.component.html',
})
export class MyComponent implements AfterViewChecked, OnDestroy {
  show = false;

  // Reference to the element inside @if
  @ViewChild('myDiv') myDivRef?: ElementRef<HTMLDivElement>;

  // Subjects to emit events
  private elementAppeared$ = new Subject<HTMLElement>();
  private elementRemoved$ = new Subject<void>();

  // Track last state to detect changes
  private lastElementPresent = false;

  constructor() {
    // Subscribe to element appearance
    this.elementAppeared$.subscribe((el) => {
      console.log('Element appeared:', el);
      // Example: focus the element
      el.focus();
    });

    // Subscribe to element removal
    this.elementRemoved$.subscribe(() => {
      console.log('Element removed from DOM');
    });
  }

  toggle() {
    this.show = !this.show;
  }

  ngAfterViewChecked() {
    const isPresent = !!this.myDivRef;

    if (isPresent && !this.lastElementPresent) {
      this.elementAppeared$.next(this.myDivRef!.nativeElement);
    }

    if (!isPresent && this.lastElementPresent) {
      this.elementRemoved$.next();
    }

    this.lastElementPresent = isPresent;
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.elementAppeared$.complete();
    this.elementRemoved$.complete();
  }
}
```

my.component.html
```html

<button (click)="toggle()">Toggle</button>

@if (show) {
  <div #myDiv tabindex="0">
    This is inside @if
  </div>
}
```

How This Works
@ViewChild gets the element when it exists in the DOM.
ngAfterViewChecked() detects when the element appears or disappears.
Subject emits events:
elementAppeared$ → emits the HTMLElement when it appears.
elementRemoved$ → emits when it disappears.
You can subscribe to these events anywhere in your component or even pass them to a service.
✅ Advantages of this reactive approach:

No need to manually check @ViewChild in multiple places.
Works with multiple toggles.
Easy to integrate with other RxJS streams (e.g., debounce, delay, merge).
If you want, I can also make a directive version so you can just write:

---
__Good question 👍 — I intentionally used Subject instead of BehaviorSubject here because of how and when the element exists in the DOM.__

Let’s break it down:

Key Difference
Subject:

Emits values to subscribers only after they subscribe.
Does not store the last emitted value.
Perfect for events that are transient (like “element appeared”).
BehaviorSubject:

Requires an initial value.
Always stores the last emitted value and immediately sends it to new subscribers.
Better for state that should be available instantly to late subscribers.
Why Subject is better here
In our case:

The HTMLElement does not exist until the @if condition is true.
If we used BehaviorSubject, we’d have to give it an initial value (probably null), which means:
Every subscriber would first get null (or some placeholder) before the real element.
You’d need extra null-check logic everywhere.
The “element appeared” event is momentary — we don’t need to remember it forever, just act when it happens.
So:

Subject = “Fire and forget” event → ✅ fits our use case.
BehaviorSubject = “Store the latest state” → ❌ not needed here unless you want late subscribers to know the current element.
When I would use BehaviorSubject here
If you wanted any subscriber at any time to instantly know:

Whether the element is currently in the DOM.
And, if yes, get the HTMLElement immediately.
Example:

```ts
private elementState$ = new BehaviorSubject<HTMLElement | null>(null);

ngAfterViewChecked() {
  const el = this.myDivRef?.nativeElement ?? null;
  if (el !== this.elementState$.value) {
    this.elementState$.next(el);
  }
}
```
Then:

```ts

this.elementState$.subscribe(el => {
  if (el) console.log('Element exists:', el);
  else console.log('Element not in DOM');
});
```
This way, new subscribers instantly know the current state without waiting for the next toggle.

💡 Rule of thumb:

Use Subject for events (momentary actions).
Use BehaviorSubject for state (current value that should be known immediately).
If you want, I can rewrite the element detection code using BehaviorSubject so it always gives you the current element instantly to any subscriber — that would make it more like a live DOM state stream.

Do you want me to make that version?

---
__Alright ✅ — here’s the BehaviorSubject version so you always have the current DOM element state available instantly to any subscriber, even if they subscribe later.__

This is useful if you want to know right now whether the element inside the @if block exists, without waiting for the next toggle.

my.component.ts
```ts
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnDestroy
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-my',
  templateUrl: './my.component.html',
})
export class MyComponent implements AfterViewChecked, OnDestroy {
  show = false;

  // Reference to the element inside @if
  @ViewChild('myDiv') myDivRef?: ElementRef<HTMLDivElement>;

  /**
   * BehaviorSubject holds the current element state:
   * - HTMLElement when present
   * - null when not in DOM
   */
  readonly elementState$ = new BehaviorSubject<HTMLElement | null>(null);

  toggle() {
    this.show = !this.show;
  }

  ngAfterViewChecked() {
    const currentEl = this.myDivRef?.nativeElement ?? null;

    // Only emit if the value actually changed
    if (currentEl !== this.elementState$.value) {
      this.elementState$.next(currentEl);
    }
  }

  ngOnDestroy() {
    this.elementState$.complete();
  }
}
```

my.component.html
```html

<button (click)="toggle()">Toggle</button>

@if (show) {
  <div #myDiv tabindex="0">
    This is inside @if
  </div>
}
```

How to Use It
Anywhere in your component (or even in another service if you pass the stream), you can do:

```ts

this.elementState$.subscribe(el => {
  if (el) {
    console.log('Element exists:', el);
    el.focus(); // Example action
  } else {
    console.log('Element not in DOM');
  }
});
```

Why This Is Powerful
Late subscribers still get the current state instantly.
No need for extra lifecycle hooks to “catch” the element.
Works across multiple toggles without missing events.
Can be combined with RxJS operators like filter, map, debounceTime, etc.
💡 Tip:
If you only care about when the element appears (not disappears), you can filter the stream:

```ts
import { filter } from 'rxjs/operators';

this.elementState$
  .pipe(filter((el): el is HTMLElement => !!el))
  .subscribe(el => console.log('Element appeared:', el));
```

If you want, I can now make a reusable Angular directive that wraps this BehaviorSubject logic so you can just write:

```html
<div *appWhenVisible="let el">
  Element is here: {{ el.tagName }}
</div>
```

and it will give you the element automatically without writing any lifecycle code.

Do you want me to build that directive?

---
__Gotcha ✅ — since you’re using standalone components in Angular 17+, you don’t need an NgModule at all. We can make the directive standalone too, and then just import it directly into your component.__

Here’s the updated standalone directive + usage in a standalone component.

Standalone Directive
when-visible.directive.ts
```ts
import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Directive({
  selector: '[appWhenVisible]',
  standalone: true // ✅ Standalone directive
})
export class WhenVisibleDirective implements OnInit, OnDestroy {
  /** Emits the current HTMLElement or null */
  readonly elementState$ = new BehaviorSubject<HTMLElement | null>(null);

  private sub?: Subscription;

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private host: ElementRef
  ) {}

  ngOnInit() {
    // Render the template immediately
    this.vcr.createEmbeddedView(this.tpl, {
      $implicit: this.host.nativeElement
    });

    // Emit the element as soon as it's available
    this.elementState$.next(this.host.nativeElement);

    // Watch for DOM removal
    const observer = new MutationObserver(() => {
      const inDom = document.body.contains(this.host.nativeElement);
      this.elementState$.next(inDom ? this.host.nativeElement : null);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Store observer in subscription for cleanup
    this.sub = new Subscription(() => observer.disconnect());
  }

  ngOnDestroy() {
    this.elementState$.complete();
    this.sub?.unsubscribe();
  }
}
```

Standalone Component Using It
my.component.ts

```ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhenVisibleDirective } from './when-visible.directive'; // ✅ Import directive

@Component({
  selector: 'app-my',
  standalone: true,
  imports: [CommonModule, WhenVisibleDirective], // ✅ Add directive here
  template: `
    <button (click)="toggle()">Toggle</button>

    @if (show) {
      <div *appWhenVisible="let el">
        Element is here: {{ el.tagName }}
      </div>
    }
  `
})
export class MyComponent {
  show = false;

  toggle() {
    this.show = !this.show;
  }
}
```

Why This Works
The directive is standalone, so no NgModule is needed.
You just import it into the imports array of your standalone component.
Works with @if or *ngIf blocks.
let el gives you the HTMLElement immediately when it appears.
💡 If you want, I can now upgrade this directive to use IntersectionObserver so it only emits when the element is actually visible on screen (not just in the DOM).
That’s perfect for lazy-loading images, animations, or analytics triggers.

Do you want me to make that visibility-aware version next?

---

__lright 🚀 — let’s upgrade our standalone appWhenVisible directive so it only emits when the element is actually visible on screen, not just present in the DOM.__

We’ll use IntersectionObserver for this.
That means:

If the element is in the DOM but scrolled out of view → no emit.
When it enters the viewport → emit the HTMLElement.
When it leaves the viewport → emit null.
Visibility-Aware Standalone Directive
when-visible.directive.ts
```ts
import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Directive({
  selector: '[appWhenVisible]',
  standalone: true // ✅ Standalone directive
})
export class WhenVisibleDirective implements OnInit, OnDestroy {
  /** Emits the current HTMLElement when visible, or null when hidden */
  readonly elementState$ = new BehaviorSubject<HTMLElement | null>(null);

  private observer?: IntersectionObserver;

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private host: ElementRef
  ) {}

  ngOnInit() {
    // Render the template immediately
    this.vcr.createEmbeddedView(this.tpl, {
      $implicit: this.host.nativeElement
    });

    // Create IntersectionObserver to detect visibility
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // Element is visible in viewport
          this.elementState$.next(this.host.nativeElement);
        } else {
          // Element is not visible
          this.elementState$.next(null);
        }
      },
      {
        root: null, // viewport
        threshold: 0.1 // visible if at least 10% is in view
      }
    );

    // Start observing the host element
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy() {
    this.elementState$.complete();
    this.observer?.disconnect();
  }
}
```

Standalone Component Using It
my.component.ts
```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhenVisibleDirective } from './when-visible.directive';

@Component({
  selector: 'app-my',
  standalone: true,
  imports: [CommonModule, WhenVisibleDirective],
  template: `
    <button (click)="toggle()">Toggle</button>

    <div style="height: 1000px; background: lightgray;">
      Scroll down to see the element...
    </div>

    @if (show) {
      <div *appWhenVisible="let el" style="height: 100px; background: lightgreen;">
        Element is visible: {{ el?.tagName }}
      </div>
    }

    <div style="height: 1000px; background: lightgray;"></div>
  `
})
export class MyComponent {
  show = true;

  toggle() {
    this.show = !this.show;
  }
}
```

How It Works
IntersectionObserver watches the element’s visibility in the viewport.
Emits the HTMLElement only when it’s at least 10% visible (threshold: 0.1).
Emits null when it leaves the viewport.
Works perfectly with @if or *ngIf — no lifecycle hacks needed.
Why This Is Powerful
Great for lazy-loading images:
```html
<img *appWhenVisible="let el" [src]="el ? realImageUrl : placeholderUrl">
```

Perfect for triggering animations only when the element is visible.
Can be used for analytics (track when a section is actually seen by the user).
If you want, I can extend this directive so it supports an input binding like:

```Html

<div *appWhenVisible="let el; threshold: 0.5">
```

…so you can control the visibility threshold per usage without editing the directive code.

Do you want me to make that configurable version next?

---

__Alright 🚀 — let’s upgrade our standalone appWhenVisible directive so it only emits when the element is actually visible on screen, not just present in the DOM.__

We’ll use IntersectionObserver for this.
That means:

If the element is in the DOM but scrolled out of view → no emit.
When it enters the viewport → emit the HTMLElement.
When it leaves the viewport → emit null.
Visibility-Aware Standalone Directive
when-visible.directive.ts
```ts
import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Directive({
  selector: '[appWhenVisible]',
  standalone: true // ✅ Standalone directive
})
export class WhenVisibleDirective implements OnInit, OnDestroy {
  /** Emits the current HTMLElement when visible, or null when hidden */
  readonly elementState$ = new BehaviorSubject<HTMLElement | null>(null);

  private observer?: IntersectionObserver;

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private host: ElementRef
  ) {}

  ngOnInit() {
    // Render the template immediately
    this.vcr.createEmbeddedView(this.tpl, {
      $implicit: this.host.nativeElement
    });

    // Create IntersectionObserver to detect visibility
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // Element is visible in viewport
          this.elementState$.next(this.host.nativeElement);
        } else {
          // Element is not visible
          this.elementState$.next(null);
        }
      },
      {
        root: null, // viewport
        threshold: 0.1 // visible if at least 10% is in view
      }
    );

    // Start observing the host element
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy() {
    this.elementState$.complete();
    this.observer?.disconnect();
  }
}
Standalone Component Using It
my.component.ts

```Ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhenVisibleDirective } from './when-visible.directive';

@Component({
  selector: 'app-my',
  standalone: true,
  imports: [CommonModule, WhenVisibleDirective],
  template: `
    <button (click)="toggle()">Toggle</button>

    <div style="height: 1000px; background: lightgray;">
      Scroll down to see the element...
    </div>

    @if (show) {
      <div *appWhenVisible="let el" style="height: 100px; background: lightgreen;">
        Element is visible: {{ el?.tagName }}
      </div>
    }

    <div style="height: 1000px; background: lightgray;"></div>
  `
})
export class MyComponent {
  show = true;

  toggle() {
    this.show = !this.show;
  }
}
```

How It Works
IntersectionObserver watches the element’s visibility in the viewport.
Emits the HTMLElement only when it’s at least 10% visible (threshold: 0.1).
Emits null when it leaves the viewport.
Works perfectly with @if or *ngIf — no lifecycle hacks needed.
Why This Is Powerful
Great for lazy-loading images:
```Html

<img *appWhenVisible="let el" [src]="el ? realImageUrl : placeholderUrl">
```
Perfect for triggering animations only when the element is visible.
Can be used for analytics (track when a section is actually seen by the user).
If you want, I can extend this directive so it supports an input binding like:

```Html

<div *appWhenVisible="let el; threshold: 0.5">
```

…so you can control the visibility threshold per usage without editing the directive code.

Do you want me to make that configurable version next?

---
__Gotcha — you want to pause now and resume the same conversation tomorrow in Microsoft Copilot Chat without losing context.__

Here’s the reality:

Copilot Chat sessions are not persistent — once you close the chat or refresh, the conversation history is gone.
There’s no built‑in “save and resume” feature like a project workspace (at least as of 2026).
To continue tomorrow, you need to manually save the important context and paste it back in when you return.
Best Way to Continue Tomorrow
Copy the conversation

Select all the relevant messages (directive code, explanations, etc.).
Paste them into a text file or note (e.g., Notepad, OneNote, VS Code, Obsidian).
Save it with a clear name like angular-when-visible-directive.md.
Tomorrow, paste the context back

Open Copilot Chat.
Paste the saved conversation or at least the last relevant part (directive code + your last question).
Then say something like:
"Here’s our last conversation from yesterday. Let’s continue from where we left off."

Optional — Save in GitHub Copilot Workspace (if you have access)

If you’re using GitHub Copilot in VS Code, you can paste the code into a file in your repo and commit it.
Tomorrow, open the file and ask Copilot Chat to continue working on it.
💡 Pro Tip:
If you want to make it easier for Copilot to “pick up” tomorrow, save only the essential context:

The directive code
The component code
Your last question/request
That way, you don’t have to paste the entire conversation — just the key parts.

If you want, I can package today’s progress into a single clean Markdown file with all the directive versions and explanations, so tomorrow you can just paste it into Copilot and say “continue from here.”

Do you want me to prepare that summary file for you now?

---

__Alright ✅ — here’s your clean, ready‑to‑paste Markdown summary of everything we built today, so you can drop it into MS Copilot Chat tomorrow and continue right where we left off.__

Angular appWhenVisible Directive — Progress Summary
Goal
We are building a standalone Angular directive that:

Works with @if or *ngIf
Gives you the HTMLElement when it appears
Can detect actual viewport visibility using IntersectionObserver
Emits null when the element is hidden or removed


1. Basic Standalone Directive (DOM Presence Only)
```Ts
import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Directive({
  selector: '[appWhenVisible]',
  standalone: true
})
export class WhenVisibleDirective implements OnInit, OnDestroy {
  /** Emits the current HTMLElement or null */
  readonly elementState$ = new BehaviorSubject<HTMLElement | null>(null);

  private sub?: Subscription;

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private host: ElementRef
  ) {}

  ngOnInit() {
    // Render the template immediately
    this.vcr.createEmbeddedView(this.tpl, {
      $implicit: this.host.nativeElement
    });

    // Emit the element as soon as it's available
    this.elementState$.next(this.host.nativeElement);

    // Watch for DOM removal
    const observer = new MutationObserver(() => {
      const inDom = document.body.contains(this.host.nativeElement);
      this.elementState$.next(inDom ? this.host.nativeElement : null);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    this.sub = new Subscription(() => observer.disconnect());
  }

  ngOnDestroy() {
    this.elementState$.complete();
    this.sub?.unsubscribe();
  }
}
```

2. Visibility‑Aware Version (Viewport Detection)
```Ts
import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Directive({
  selector: '[appWhenVisible]',
  standalone: true
})
export class WhenVisibleDirective implements OnInit, OnDestroy {
  /** Emits the current HTMLElement when visible, or null when hidden */
  readonly elementState$ = new BehaviorSubject<HTMLElement | null>(null);

  private observer?: IntersectionObserver;

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private host: ElementRef
  ) {}

  ngOnInit() {
    // Render the template immediately
    this.vcr.createEmbeddedView(this.tpl, {
      $implicit: this.host.nativeElement
    });

    // Create IntersectionObserver to detect visibility
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          this.elementState$.next(this.host.nativeElement);
        } else {
          this.elementState$.next(null);
        }
      },
      {
        root: null, // viewport
        threshold: 0.1 // visible if at least 10% is in view
      }
    );

    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy() {
    this.elementState$.complete();
    this.observer?.disconnect();
  }
}
```

3. Example Standalone Component Using It
```Ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhenVisibleDirective } from './when-visible.directive';

@Component({
  selector: 'app-my',
  standalone: true,
  imports: [CommonModule, WhenVisibleDirective],
  template: `
    <button (click)="toggle()">Toggle</button>

    <div style="height: 1000px; background: lightgray;">
      Scroll down to see the element...
    </div>

    @if (show) {
      <div *appWhenVisible="let el" style="height: 100px; background: lightgreen;">
        Element is visible: {{ el?.tagName }}
      </div>
    }

    <div style="height: 1000px; background: lightgray;"></div>
  `
})
export class MyComponent {
  show = true;

  toggle() {
    this.show = !this.show;
  }
}
``

Next Step for Tomorrow
We planned to extend the directive so it supports configurable visibility threshold via input binding:
```Html
<div *appWhenVisible="let el; threshold: 0.5">
```

This will allow per‑usage control of how much of the element must be visible before it’s considered “visible.”

How to Resume in MS Copilot Chat

Copy this entire Markdown file.
Tomorrow, paste it into Copilot Chat.
Say:

"Here’s our last conversation from yesterday. Let’s continue by adding a configurable threshold input to the appWhenVisible directive."


Do you want me to already prepare the configurable threshold version now so tomorrow we can jump straight into testing it? That way you won’t lose momentum.


---

Perfect ✅ — let’s finish the configurable threshold version now so tomorrow you can just paste it into MS Copilot Chat and start testing immediately.
We’ll make the appWhenVisible directive accept an input binding for the visibility threshold (default 0.1 = 10% visible).

Configurable Threshold Visibility-Aware Directive
when-visible.directive.ts
```Ts
import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  Input
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Directive({
  selector: '[appWhenVisible]',
  standalone: true
})
export class WhenVisibleDirective implements OnInit, OnDestroy {
  /**
   * Emits the current HTMLElement when visible, or null when hidden.
   * You can subscribe to this in your component if needed.
   */
  readonly elementState$ = new BehaviorSubject<HTMLElement | null>(null);

  /**
   * Visibility threshold (0.0 to 1.0)
   * - 0.0 = visible if even 1px is in view
   * - 1.0 = visible only if fully in view
   */
  @Input('appWhenVisibleThreshold') threshold: number = 0.1;

  private observer?: IntersectionObserver;

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private host: ElementRef
  ) {}

  ngOnInit() {
    // Render the template immediately
    this.vcr.createEmbeddedView(this.tpl, {
      $implicit: this.host.nativeElement
    });

    // Create IntersectionObserver with configurable threshold
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          this.elementState$.next(this.host.nativeElement);
        } else {
          this.elementState$.next(null);
        }
      },
      {
        root: null, // viewport
        threshold: this.threshold
      }
    );

    // Start observing
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy() {
    this.elementState$.complete();
    this.observer?.disconnect();
  }
}
```

Example Usage in a Standalone Component
my.component.ts
```Ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhenVisibleDirective } from './when-visible.directive';

@Component({
  selector: 'app-my',
  standalone: true,
  imports: [CommonModule, WhenVisibleDirective],
  template: `
    <button (click)="toggle()">Toggle</button>

    <div style="height: 1000px; background: lightgray;">
      Scroll down to see the element...
    </div>

    @if (show) {
      <!-- Require 50% visibility before emitting -->
      <div *appWhenVisible="let el; appWhenVisibleThreshold: 0.5"
           style="height: 100px; background: lightgreen;">
        Element is visible: {{ el?.tagName }}
      </div>
    }

    <div style="height: 1000px; background: lightgray;"></div>
  `
})
export class MyComponent {
  show = true;

  toggle() {
    this.show = !this.show;
  }
}
```

How It Works

The ```@Input('appWhenVisibleThreshold')``` threshold lets you control the visibility requirement per usage.
Default is 0.1 (10% visible).
You can set it anywhere between 0.0 and 1.0.
Works with @if or *ngIf seamlessly.


Tomorrow’s Plan
When you paste this into MS Copilot Chat tomorrow, you can:

Test different thresholds (0.0, 0.5, 1.0).
Add extra inputs like:

rootMargin for preloading before the element is visible.
once flag to emit only the first time it becomes visible.


Integrate with animations or lazy-loading images.


If you want, I can also add a once mode now so the directive stops observing after the first time the element becomes visible — perfect for one-time animations or analytics events.
Do you want me to add that too before we wrap up?
