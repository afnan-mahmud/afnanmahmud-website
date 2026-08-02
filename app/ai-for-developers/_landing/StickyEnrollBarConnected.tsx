'use client';

import type { ComponentProps } from 'react';
import StickyEnrollBar from '@/components/landing/StickyEnrollBar';
import { useEnroll } from '../EnrollContext';

type BarProps = Omit<ComponentProps<typeof StickyEnrollBar>, 'onEnroll'>;

/**
 * Wires the shared sticky bar to this app's EnrollContext.
 *
 * Price copy is forwarded so each landing can match the anchor its own pricing
 * section uses — the segment pages take the bar's ৳30,000 defaults, the main LP
 * passes ৳10,000 to match PricingNeon.
 */
export function StickyEnrollBarConnected(props: BarProps) {
  const { openEnroll } = useEnroll();
  return <StickyEnrollBar onEnroll={openEnroll} {...props} />;
}
