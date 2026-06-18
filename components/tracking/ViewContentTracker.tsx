'use client';

import { useEffect, useRef } from 'react';
import { trackPixel } from '@/lib/meta-pixel';

interface ViewContentTrackerProps {
  contentId: string;
  contentName: string;
  value: number;
  currency?: string;
}

/**
 * Fires a deduplicated Meta ViewContent on both the browser pixel and the
 * server CAPI (`/api/track/view-content`) using ONE shared event_id, so the two
 * layers don't double-count. Drop this into any course/landing page that wants
 * ViewContent tracked on both sides.
 */
export default function ViewContentTracker({
  contentId,
  contentName,
  value,
  currency = 'BDT',
}: ViewContentTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const eventId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(36).slice(2);

    const customData = {
      value,
      currency,
      content_ids: [contentId],
      content_name: contentName,
      content_type: 'product',
    };

    trackPixel('ViewContent', customData, eventId);

    fetch('/api/track/view-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, contentId, contentName, value, currency }),
      keepalive: true,
    }).catch(() => {});
  }, [contentId, contentName, value, currency]);

  return null;
}
