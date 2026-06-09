// components/home/useTilt.ts
'use client';

import { useCallback } from 'react';

/**
 * Returns pointer handlers that apply a subtle 3D tilt toward the cursor.
 * Operates on the event's currentTarget (no ref needed) and respects
 * prefers-reduced-motion (no-op when reduced).
 */
export function useTilt(maxDeg = 8) {
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * maxDeg}deg) rotateX(${-py * maxDeg}deg)`;
    },
    [maxDeg]
  );

  const onMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
  }, []);

  return { onMouseMove, onMouseLeave };
}
