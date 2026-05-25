// app/ulde/plugins/browser/ulde-artifacts-panel-browser.plugin.ts (2026-05-21)

import { ɵɵresolveWindow } from '@angular/core';
import { BrowserDomPlugin } from '../../core/host/ulde-browser-host';

export const UldeArtifactsPanelBrowserPlugin: BrowserDomPlugin = {
  id: 'browser.artifacts-panel',

  init(container: HTMLElement) {
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined';

    if (!isBrowser) return;

    // -----------------------------------------------------
    // Collapsible GROUPS
    // -----------------------------------------------------
    container.querySelectorAll('.ulde-ap-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.closest('.ulde-ap-group');
        group?.classList.toggle('collapsed');
      });
    });

    // -----------------------------------------------------
    // Collapsible SECTIONS
    // -----------------------------------------------------
    container.querySelectorAll('.ulde-ap-section-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.closest('.ulde-ap-section');
        section?.classList.toggle('collapsed');
      });
    });

    // -----------------------------------------------------
    // Fuzzy Search with Highlight
    // -----------------------------------------------------
    const searchInput = container.querySelector('.ulde-ap-search') as HTMLInputElement | null;

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();

        container.querySelectorAll('.ulde-ap-item').forEach((item) => {
          const pre = item.querySelector('pre');
          if (!pre) return;

          const raw = pre.textContent ?? '';
          const lower = raw.toLowerCase();

          if (!query) {
            // Reset
            pre.innerHTML = escapeHtml(raw);
            item.classList.remove('hidden');
            return;
          }

          const result = highlightFuzzy(raw, lower, query);
          if (!result.isMatch) {
            item.classList.add('hidden');
          } else {
            item.classList.remove('hidden');
            pre.innerHTML = result.html;
          }
        });

        // Auto-collapse empty sections
        container.querySelectorAll('.ulde-ap-section').forEach((section) => {
          const visibleItems = section.querySelectorAll('.ulde-ap-item:not(.hidden)');
          section.classList.toggle('collapsed', visibleItems.length === 0);
        });

        // Auto-collapse empty groups
        container.querySelectorAll('.ulde-ap-group').forEach((group) => {
          const visibleItems = group.querySelectorAll('.ulde-ap-item:not(.hidden)');
          group.classList.toggle('collapsed', visibleItems.length === 0);
        });
      });
    }

    // Simple HTML escaper (keep in browser plugin)
    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // Fuzzy highlight: characters in order, wrapped in span
    function highlightFuzzy(raw: string, lower: string, query: string): { isMatch: boolean; html: string } {
      let qi = 0;
      const qlen = query.length;
      if (!qlen) return { isMatch: true, html: escapeHtml(raw) };

      let out = '';
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        const lch = lower[i];

        if (qi < qlen && lch === query[qi]) {
          out += `<span class="ulde-ap-highlight">${escapeHtml(ch)}</span>`;
          qi++;
        } else {
          out += escapeHtml(ch);
        }
      }

      const isMatch = qi === qlen;
      return { isMatch, html: out };
    }


    // Move ULDE-generated artifacts html into Angular host container
    const embedded = container.querySelector('.ulde-artifacts-panel-content');

    // console.log(`Log: [UldeArtifactsPanelBrowserPlugin] embedded=`, embedded);
    if (!embedded) return;

    // console.log(`Log: [UldeArtifactsPanelBrowserPlugin] document=`, document);

    // const host = document.createElement('div');

    const host = document.querySelector('.dv-artifacts-panel') as HTMLElement | null;
    // const host = container.querySelector('.dv-artifacts-panel') as HTMLElement | null;
    // console.log(`Log: [UldeArtifactsPanelBrowserPlugin] host=`, host);
    if (!host) return;

    host.appendChild(embedded);

    // console.log(`Log: [UldeArtifactsPanelBrowserPlugin] host=`, host);

    // -----------------------------------------------------
    // Draggable floating panel
    // -----------------------------------------------------
    const dragHandle = host.querySelector('.ulde-ap-header') as HTMLElement | null;
    if (!dragHandle) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      const rect = host.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      host.style.left = `${startLeft + dx}px`;
      host.style.top = `${startTop + dy}px`;
      host.style.right = 'auto';
      host.style.bottom = 'auto';
      host.style.position = 'fixed';
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    dragHandle.addEventListener('mousedown', onMouseDown);

    // -----------------------------------------------------
    // Left-side collapsible sidebar toggle
    // -----------------------------------------------------
    const sidebar = host; // dv-artifacts-panel
    if (sidebar) {
      // Create toggle button
      const toggle = document.createElement('div');
      toggle.className = 'dv-artifacts-panel-toggle';
      toggle.innerHTML = `<span class="chevron">◂</span>`;
      document.body.appendChild(toggle);

      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }



  }

};
