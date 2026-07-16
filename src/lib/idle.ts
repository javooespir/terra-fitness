// requestIdleCallback isn't available on Safari — falls back to a short
// setTimeout so the deferred work still lands after the current commit
// instead of blocking it.
export function onIdle(cb: () => void): () => void {
  const w = window as typeof window & {
    requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout: 300 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 1);
  return () => window.clearTimeout(id);
}
