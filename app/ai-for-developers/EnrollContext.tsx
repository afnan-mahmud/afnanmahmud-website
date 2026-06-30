'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import EnrollModal from './EnrollModal';
import VideoDemoModal from './VideoDemoModal';

type EnrollContextValue = {
  openEnroll: () => void;
  openDemo: () => void;
};

const EnrollContext = createContext<EnrollContextValue | null>(null);

/** Access the enroll/demo modal controls. Must be used inside <EnrollProvider>. */
export function useEnroll(): EnrollContextValue {
  const ctx = useContext(EnrollContext);
  if (!ctx) throw new Error('useEnroll must be used within <EnrollProvider>');
  return ctx;
}

/**
 * Owns the enroll + demo modal state for the AI-for-developers landing page and
 * renders both modals. Lets the page tree open them via useEnroll() instead of
 * prop-threading callbacks, so static sections don't need to be client
 * components just to forward a click handler.
 */
export function EnrollProvider({ children }: { children: ReactNode }) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  // Auto-open the enroll modal after a failed payment retry (?retry=1).
  // Reads the URL (external system) once on mount — a legitimate effect.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('retry') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnrollOpen(true);
    }
  }, []);

  const openEnroll = useCallback(() => setEnrollOpen(true), []);
  const openDemo = useCallback(() => setDemoOpen(true), []);
  const closeEnroll = useCallback(() => setEnrollOpen(false), []);
  const closeDemo = useCallback(() => setDemoOpen(false), []);

  // Stable value identity so opening/closing a modal re-renders only the
  // modals — not every useEnroll() consumer (Navbar, Hero, CTAs). Keeps the
  // enroll-click interaction cheap (better INP).
  const value = useMemo(() => ({ openEnroll, openDemo }), [openEnroll, openDemo]);

  return (
    <EnrollContext.Provider value={value}>
      {children}
      <EnrollModal open={enrollOpen} onClose={closeEnroll} />
      <VideoDemoModal open={demoOpen} onClose={closeDemo} />
    </EnrollContext.Provider>
  );
}
