'use client';

import StickyEnrollBar from '@/components/landing/StickyEnrollBar';
import { useEnroll } from './EnrollContext';

/** Wires the shared sticky bar to this app's EnrollContext. */
export function StickyEnrollBarConnected() {
  const { openEnroll } = useEnroll();
  return <StickyEnrollBar onEnroll={openEnroll} />;
}
