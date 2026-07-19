'use client';

import { CategoryGate } from './_gate/CategoryGate';
import { useSegment } from './_gate/useSegment';
import { SEGMENTS } from './_landing/segments';
import { LightSegmentLanding } from './_landing/LightSegmentLanding';

export default function Page() {
  const { segment, ready, choose, reset } = useSegment();

  // Avoid flashing the gate before the client has read URL/localStorage.
  if (!ready) return <div className="min-h-screen bg-[var(--bg)]" />;

  if (!segment) return <CategoryGate onChoose={choose} />;

  return <LightSegmentLanding content={SEGMENTS[segment]} onChangeCategory={reset} />;
}
