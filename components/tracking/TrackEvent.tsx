'use client';

import { useEffect } from 'react';
import { trackPixel } from '@/lib/meta-pixel';

interface TrackEventProps {
  event: string;
  params?: Record<string, unknown>;
  eventId?: string;
}

/**
 * Fires a single Meta Pixel standard event once on mount. Useful for tracking
 * ViewContent on server-rendered pages by dropping this client component in.
 */
export default function TrackEvent({ event, params, eventId }: TrackEventProps) {
  useEffect(() => {
    trackPixel(event, params, eventId);
    // Fire once per mount for the given event/params.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
