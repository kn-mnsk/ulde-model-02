This shows exactly how browsers decide “which element is on top”, and how to debug it like a pro in Chrome DevTools.
===

## 1. Stacking Order Illustrated (Live Diagrams)
Below are visual diagrams showing how the browser layers elements.
These diagrams are conceptual — they help you see what the browser sees.

🧱 A simple stacking order (no z-index)
```Code
[ Layer 3 ]   Element C (appears on top)
[ Layer 2 ]   Element B
[ Layer 1 ]   Element A (appears at the bottom)
```
This is the default:
Later elements in the DOM appear above earlier ones.

🎯 Stacking Context Created by position + z-index
```Code
Parent (z-index: 0)
│
├── Child A (z-index: 10)   ← on top
├── Child B (z-index: 5)
└── Child C (z-index: auto)
```
A stacking context is like a mini Photoshop group.
Everything inside it is layered relative to each other.

🧩 Nested stacking contexts
```Code
Root stacking context
│
├── Element A (z-index: 10)
│
└── Element B (z-index: 5)
     │
     ├── B1 (z-index: 9999)  ← cannot escape above A
     └── B2 (z-index: 1)
```
Even though B1 has z-index 9999,
it cannot appear above Element A (z-index 10)
because it is trapped inside B’s stacking context.

This is the #1 cause of overlay/resizer bugs.

📚 Your TOC Stacking Order (Final Architecture)
```Code
dv-toc (stacking context)
│
├── dv-toc-resizer   (z-index: 20)  ← always on top
├── toc-overlay      (z-index: 10)
└── toc-wrapper      (z-index: 1)
     └── toc-root
```

📄 Your Host Viewer Stacking Order
```Code
host-wrapper (stacking context)
│
├── host-overlay     (z-index: 10)
└── dv-host          (content)
```
This is why the host overlay must stay inside the wrapper.

## 2. How to Debug Stacking Contexts in Chrome DevTools

Chrome DevTools has powerful tools for this.
Here’s how to inspect stacking order like a professional UI engineer.

🥇 __Step 1 — Open Chrome DevTools__

Press:

F12

or Ctrl + Shift + I

or Right‑click → Inspect

🥈 __Step 2 — Select the element__

Use the element picker:

Click the element you want to inspect (overlay, wrapper, resizer, etc.).

🥉 __Step 3 — Look at the “Styles” panel__

Scroll until you see:

position: relative

position: absolute

z-index: 10

opacity: 0.9

transform: translateZ(0)

Any of these creates a stacking context.

Chrome will show a small badge:

<div class="info-box">
  <img src="assets/images/chair1.png" width="180", height='180'>
  <img src="assets/images/chair2.png" width="180", height='180'>
</div>


If you click the badge, DevTools highlights the stacking context boundaries.

🏅 __Step 4 — Use the “Layers” panel (the secret weapon)__

Open:

DevTools → More Tools → Layers

This shows a 3D visualization of stacking contexts.


<div class="info-box">
  <img src="assets/images/stacking-01.png" width="180", height='180'>
  <img src="assets/images/stacking-02.png" width="180", height='180'>
  <img src="assets/images/stacking-03.png" width="180", height='180'>
</div>

You can rotate, zoom, and see exactly which element sits above which.

This is the best way to debug overlays, modals, tooltips, and resizers.

🧪 __Step 5 — Use “Computed → z-index” to see the final stacking order__

Select an element → go to Computed tab → search for z-index.

Chrome will show:

the computed z-index

the stacking context it belongs to

the ancestor that created the stacking context

This tells you why something is above or below something else.

## 🧠 Summary (the essence)
✔ Stacking order = which element is on top

✔ Controlled by stacking contexts

✔ Stacking contexts are created by position, z-index, opacity, etc.

✔ Elements cannot escape their stacking context

✔ Chrome DevTools can visualize stacking contexts

✔ Your TOC and Host Viewer now follow perfect stacking architecture


## 3. Fixing stacking‑order bugs

Stacking‑order bugs happen when an element that should be on top is instead hidden underneath something else.

This is almost always caused by:

A stacking context trap

A missing z-index

A z-index that doesn’t apply because the element isn’t positioned

A parent stacking context overriding children

Let’s break it down.

### A. The 3 causes of stacking bugs (with diagrams)

1. Wrong stacking context
    ```Code
    Root
    ├── A (z-index: 10)
    └── B (z-index: 5)
          └── B1 (z-index: 9999)  ← still below A
    ```
    Even though B1 has z-index: 9999,
    it cannot escape B’s stacking context.

    This is the most common bug.

2. Element has z-index but no positioning

    ```Code
    .element {
      z-index: 9999;   ← does nothing
    }
    ```
    If it’s not position: relative|absolute|fixed|sticky,
    z-index is ignored.

3. Parent has opacity/transform

    These create stacking contexts:

    ```Code
    opacity: 0.99
    transform: translateZ(0)
    filter: blur(0)
    ```
    If a parent has any of these, children cannot escape.

### B. How to fix stacking‑order bugs

__✔ Fix 1: Move the element to a higher stacking context__

If an overlay is trapped inside a scroll-wrapper, move it up:

```Code
layout
├── overlay   ← move here
└── wrapper
```

This is what you did for the TOC overlay.

__✔ Fix 2: Give the element a positioning context__

```Code
.element {
position: relative;
z-index: 10;
}
```

__✔ Fix 3: Remove accidental stacking contexts__

If a parent has:

```Code
opacity: 0.99;
transform: translateZ(0);
```

Remove them unless needed.

__✔ Fix 4: Use z-index layers__

Define a system:

```Code
z-index: 1   content
z-index: 10  overlay
z-index: 20  resizer
z-index: 100 modal
```
This prevents random conflicts.

## 4. Debugging stacking contexts in Chrome DevTools

  Here’s the exact workflow used by UI engineers at Microsoft, Google, and GitHub.

  🥇 __Step 1 — Inspect the element__

  Right-click → Inspect.

  🥈 __Step 2 — Look for the stacking context badge__

  Chrome shows a badge when an element creates a stacking context.

  Click it to highlight the context.


## 5. Designing perfect overlays, modals, and tooltips

  All three use the same architecture:

  ```Code
  layout
    ├── overlay / modal / tooltip
    └── scroll-wrapper
          └── content
  ```

  But each has different UX rules.

  ⭐ __A. Perfect Overlays__

  Overlays should:

  Sit above the scroll-wrapper

  Not scroll

  Not block resizers

  Fade in/out smoothly

  Use pointer-events: none unless interactive

  Recommended CSS

  ```scss
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    opacity: 0;
    pointer-events: none;
    transition: opacity 180ms ease-out;
  }
  .overlay.visible {
    opacity: 1;
  }
  ```

  ⭐ __B. Perfect Modals__

  Modals should:

  Sit at the topmost z-index

  Block background interaction

  Center themselves

  Use a backdrop

  Structure
  ```Code
  layout
    ├── modal-backdrop
    ├── modal
    └── scroll-wrapper
  ```

  CSS
  ```scss
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 100;
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 110;
  }
  ```

  ⭐ __C. Perfect Tooltips__

  Tooltips should:

  Not affect layout

  Sit above everything except modals

  Use position: fixed or absolute

  Auto-position near the cursor or element

  CSS
  ```scss
  .tooltip {
    position: absolute;
    z-index: 50;
    background: #222;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    pointer-events: none;
  }
  ```

  🧠 __Final Takeaways__

  You now understand:

  How stacking contexts work

  Why overlays sometimes fail

  How to debug stacking order

  How to design overlays, modals, and tooltips correctly

  Why your TOC and Host Viewer overlays differ

  This is the foundation of all modern UI architecture.
