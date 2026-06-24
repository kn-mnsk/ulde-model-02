import { signal } from '@angular/core';

// Session State
export type SessionComponent = 'App' | 'DocsViewer' | 'UldeViewer';
export interface SessionState {
  component: SessionComponent;
  docId: string | null;
  prevDocId: string | null;
  scrollPos: number;
  prevScrollPos: number;
  refreshed: boolean;
  docTheme: string;
}
const SESSION_STATE_KEY = 'sessionState';
const SESSION_STATE_DEFAULT: SessionState = {
  component: 'DocsViewer',
  docId: null,
  prevDocId: null,
  scrollPos: 0,
  prevScrollPos: 0,
  refreshed: false,
  docTheme: 'dark',
};


const $title = signal<string>('session-state.manage');
// -------------------------
// Session state helpers
// -------------------------

export function readSessionState(isBrowser: boolean): SessionState {

  if (!isBrowser) {
    return SESSION_STATE_DEFAULT;
  }

  const raw = localStorage.getItem(SESSION_STATE_KEY);
  if (!raw) {
    return SESSION_STATE_DEFAULT;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return {
      component: parsed.component ?? 'App',
      docId: parsed.docId ?? null,
      prevDocId: parsed.prevDocId ?? null,
      scrollPos: parsed.scrollPos ?? 0,
      prevScrollPos: parsed.prevScrollPos ?? 0,
      refreshed: parsed.refreshed ?? false,
      docTheme: parsed.docTheme ?? '',
    };
  } catch {
    return SESSION_STATE_DEFAULT;
  }
}

export function writeSessionState(partial: Partial<SessionState>, isBrowser: boolean): void {
  if (!isBrowser) return;

  const current = readSessionState(isBrowser);
  const next: SessionState = {
    ...current,
    ...partial,
  };
  localStorage.setItem(SESSION_STATE_KEY, JSON.stringify(next));

  // console.log(`Log: ${$title()} writeSessionState(): ${JSON.stringify(next, null, 2)}`);
}

export function clearSessionState(isBrowser: boolean): void {
  if (!isBrowser) return;
  localStorage.removeItem(SESSION_STATE_KEY);
  console.log(`Log: ${$title()} clearSessionState()`);
}
