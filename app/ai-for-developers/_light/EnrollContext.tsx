'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type EnrollContextValue = {
  open: boolean;
  openEnroll: () => void;
  closeEnroll: () => void;
  /** Smooth-scroll to the pricing breakdown section (id="pricing"). Marketing
   *  CTAs funnel here first; only the pricing button and the sticky bar open
   *  the modal directly. */
  goToPricing: () => void;
};

const EnrollContext = createContext<EnrollContextValue | null>(null);

export function EnrollProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  // Auto-open the enroll modal after a failed payment: /payment/failed sends the
  // buyer back here as `/ai-for-developers?retry=1`, and EnrollModal refills
  // their name/phone from localStorage. Reads the URL (external system) once on
  // mount — a legitimate effect.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('retry') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, []);

  const openEnroll = useCallback(() => setOpen(true), []);
  const closeEnroll = useCallback(() => setOpen(false), []);
  const goToPricing = useCallback(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const value = useMemo(
    () => ({ open, openEnroll, closeEnroll, goToPricing }),
    [open, openEnroll, closeEnroll, goToPricing],
  );
  return <EnrollContext.Provider value={value}>{children}</EnrollContext.Provider>;
}

export function useEnroll(): EnrollContextValue {
  const ctx = useContext(EnrollContext);
  if (!ctx) throw new Error('useEnroll must be used within EnrollProvider');
  return ctx;
}
