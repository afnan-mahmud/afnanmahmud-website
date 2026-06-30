'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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

  return (
    <EnrollContext.Provider
      value={{ openEnroll: () => setEnrollOpen(true), openDemo: () => setDemoOpen(true) }}
    >
      {children}
      <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} />
      <VideoDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </EnrollContext.Provider>
  );
}
