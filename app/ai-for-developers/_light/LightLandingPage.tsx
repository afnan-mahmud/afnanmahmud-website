'use client';

import ViewContentTracker from '@/components/tracking/ViewContentTracker';
import { COURSE_NAME, COURSE_PRICE, COURSE_SLUG } from './constants';
import { CategoryGate } from './gate/CategoryGate';
import { useSegment } from './gate/useSegment';
import { SEGMENTS } from './segments';
import { LightSegmentLanding } from './LightSegmentLanding';

/**
 * Client entry for the light landing: pick an audience segment, then render the
 * funnel for it. Ported as-is from the course.afnanmahmud.com root page.
 */
export function LightLandingPage() {
  const { segment, ready, choose, reset } = useSegment();

  return (
    <>
      {/* Deliberately outside the gate branch: ad traffic that bounces off the
          category picker still counts as a ViewContent, the way it did before
          this landing had a gate. Fires once — the tracker self-guards. */}
      <ViewContentTracker
        contentId={COURSE_SLUG}
        contentName={COURSE_NAME}
        value={COURSE_PRICE}
        currency="BDT"
      />

      {/* Avoid flashing the gate before the client has read URL/localStorage. */}
      {!ready ? (
        <div className="min-h-screen bg-[var(--bg)]" />
      ) : !segment ? (
        <CategoryGate onChoose={choose} />
      ) : (
        <LightSegmentLanding content={SEGMENTS[segment]} onChangeCategory={reset} />
      )}
    </>
  );
}
