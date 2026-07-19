'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type EnrollContextValue = {
  open: boolean;
  openEnroll: () => void;
  closeEnroll: () => void;
};

const EnrollContext = createContext<EnrollContextValue | null>(null);

export function EnrollProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openEnroll = useCallback(() => setOpen(true), []);
  const closeEnroll = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openEnroll, closeEnroll }), [open, openEnroll, closeEnroll]);
  return <EnrollContext.Provider value={value}>{children}</EnrollContext.Provider>;
}

export function useEnroll(): EnrollContextValue {
  const ctx = useContext(EnrollContext);
  if (!ctx) throw new Error('useEnroll must be used within EnrollProvider');
  return ctx;
}
