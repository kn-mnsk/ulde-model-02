import { signal } from '@angular/core';

// Session State
export type SessionSelector = 'app-root' | 'app-docs-viewer' | 'app-ulde-viewer';
export interface SessionState {
  selector: SessionSelector;
  docId: string | null;
  prevDocId: string | null;
  scrollTop: number;
  prevScrollTop: number;
  refreshed: boolean;
  docTheme: string;
}
const SESSION_STATE_KEY = 'sessionState';
const SESSION_STATE_DEFAULT: SessionState = {
  selector: 'app-docs-viewer',
  docId: 'docs/index',
  prevDocId: 'docs/index',
  scrollTop: 0,
  prevScrollTop: 0,
  refreshed: false,
  docTheme: 'dark',
};


const $title = signal<string>('[session-state.manage]');
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
      selector: parsed.selector ?? 'app-docs-viewer',
      docId: parsed.docId ?? null,
      prevDocId: parsed.prevDocId ?? null,
      scrollTop: parsed.scrollTop ?? 0,
      prevScrollTop: parsed.prevScrollTop ?? 0,
      refreshed: parsed.refreshed ?? false,
      docTheme: parsed.docTheme ?? 'dark',
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

  // console.log(`Log: ${$title()} writeSessionState called, \ncurrent=${JSON.stringify(current, null, 2)}, \nnext=${JSON.stringify(next, null, 2)}`)

}

export function clearSessionState(isBrowser: boolean): void {
  if (!isBrowser) return;
  localStorage.removeItem(SESSION_STATE_KEY);
  console.log(`Log: ${$title()} clearSessionState()`);
}
