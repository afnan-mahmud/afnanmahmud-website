'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SegmentKey } from '@/app/ai-for-developers/_landing/theme';
import { isSegmentKey } from './segments';

const STORAGE_KEY = 'courseSegment';

/**
 * Resolves the visitor's chosen audience segment.
 *
 * Priority on load: `?seg=` in the URL (shareable links win) → localStorage
 * (returning visitor) → null (show the gate). `choose()` persists to both the
 * URL (via replaceState, no navigation) and localStorage; `reset()` clears them.
 *
 * `ready` guards SSR/hydration: it is false until the client has read the URL /
 * storage, so the gate never flashes for a visitor who already has a segment.
 */
export function useSegment() {
  const [segment, setSegment] = useState<SegmentKey | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The segment can only be resolved from the URL and localStorage, which exist
    // solely on the client. Setting state here rather than during render is
    // deliberate: it keeps the server render and the first client render
    // identical (no hydration mismatch), and `ready` gates the UI until it runs.
    /* eslint-disable react-hooks/set-state-in-effect */
    const fromUrl = new URLSearchParams(window.location.search).get('seg');
    let resolved: SegmentKey | null = null;

    if (isSegmentKey(fromUrl)) {
      resolved = fromUrl;
      // Keep storage in sync so a later visit without the param still resolves.
      try { window.localStorage.setItem(STORAGE_KEY, fromUrl); } catch {}
    } else {
      let stored: string | null = null;
      try { stored = window.localStorage.getItem(STORAGE_KEY); } catch {}
      if (isSegmentKey(stored)) resolved = stored;
    }

    if (resolved) setSegment(resolved);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const choose = useCallback((key: SegmentKey) => {
    setSegment(key);
    try { window.localStorage.setItem(STORAGE_KEY, key); } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set('seg', key);
    window.history.replaceState(null, '', url.toString());
    window.scrollTo({ top: 0 });
  }, []);

  const reset = useCallback(() => {
    setSegment(null);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    const url = new URL(window.location.href);
    url.searchParams.delete('seg');
    window.history.replaceState(null, '', url.toString());
    window.scrollTo({ top: 0 });
  }, []);

  return { segment, ready, choose, reset };
}
