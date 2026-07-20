'use client';

import { useState } from 'react';
import ViewContentTracker from '@/components/tracking/ViewContentTracker';
import { themeStyle } from '@/app/ai-for-developers/_landing/theme';
import type { SegmentContent, SectionKey } from '@/app/ai-for-developers/_landing/content';
import { COURSE_NAME, COURSE_PRICE, COURSE_SLUG, ENROLLED_LABEL } from './constants';
import { EnrollProvider } from './EnrollContext';
import { EnrollModal } from './EnrollModal';
import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { SocialProof } from './sections/SocialProof';
import { PainPoints } from './sections/PainPoints';
import { Outcomes } from './sections/Outcomes';
import { WhyBest } from './sections/WhyBest';
import { Audience } from './sections/Audience';
import { Curriculum } from './sections/Curriculum';
import { Instructor } from './sections/Instructor';
import { Feedback } from './sections/Feedback';
import { Faq } from './sections/Faq';
import { CtaBanner } from './sections/CtaBanner';
import { PricingAnchor } from './sections/PricingAnchor';
import { Footer } from './sections/Footer';
import { TimelineNav } from './sections/TimelineNav';
import { CourseIncludes } from './sections/CourseIncludes';
import { Projects } from './sections/Projects';
import { ToolsTech } from './sections/ToolsTech';
import { Requirements } from './sections/Requirements';
import { StickyEnrollBarConnected } from './StickyEnrollBarConnected';

export function LightSegmentLanding({
  content,
  onChangeCategory,
}: {
  content: SegmentContent;
  onChangeCategory: () => void;
}) {
  // TimelineNav pins itself once the hero scrolls past; the Navbar steps aside
  // then so the two never occupy the top of the viewport at the same time.
  const [timelinePinned, setTimelinePinned] = useState(false);

  // The page is laid out as a funnel, with the segment's own sectionOrder only
  // deciding which of its sections appear and their relative order inside each
  // band — not the position of the invariant sections:
  //
  //   hook → problem/promise → what you get → proof → objections → trust → offer
  //
  // `pick` keeps a band in the segment's declared order.
  const pick = (keys: SectionKey[]) => content.sectionOrder.filter((k) => keys.includes(k));
  const promise = pick(['painPoints', 'socialProof', 'whyBest', 'outcomes']);
  const curriculum = pick(['curriculum']);
  const audience = pick(['audience']);
  const trust = pick(['instructor', 'feedback']);
  const ctas = pick(['cta1', 'cta2']);
  const faq = pick(['faq']);

  // Chip ids in render order — TimelineNav drops the ones it has no chip for.
  const sectionIds = [
    ...promise.map((k) => (k === 'outcomes' ? 'outcomes' : k)),
    'includes',
    ...curriculum.map(() => 'journey'),
    'projects',
    ...audience,
    ...trust,
    'pricing',
    ...faq,
  ];

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'socialProof': return <SocialProof key={key} enrolledLabel={ENROLLED_LABEL} />;
      case 'painPoints':  return <PainPoints key={key} heading={content.painPoints.heading} items={content.painPoints.items} />;
      case 'outcomes':    return <Outcomes key={key} heading={content.outcomes.heading} sub={content.outcomes.sub} items={content.outcomes.items} />;
      case 'whyBest':     return <WhyBest key={key} heading={content.whyBest.heading} items={content.whyBest.items} />;
      case 'audience':    return <Audience key={key} heading={content.audience.heading} items={content.audience.items} />;
      // 'devStack' is intentionally unhandled: ToolsTech covers the same ground.
      // The key still exists in the shared sectionOrder because the main app's
      // landing renders it — don't strip it from those segment files.
      case 'curriculum':  return <Curriculum key={key} />;
      case 'instructor':  return <Instructor key={key} />;
      case 'feedback':    return <Feedback key={key} heading={content.feedback.heading} sub={content.feedback.sub} items={content.feedback.items} />;
      case 'faq':         return <Faq key={key} heading={content.faq.heading} items={content.faq.items} />;
      case 'cta1':        return <CtaBanner key={key} content={content.cta1} />;
      case 'cta2':        return <CtaBanner key={key} content={content.cta2} />;
      default:            return null;
    }
  };

  return (
    <EnrollProvider>
      {/* pb-44 on mobile clears the fixed StickyEnrollBar so the footer stays reachable. */}
      <div className="min-h-screen overflow-x-clip pb-44 lg:pb-0" style={themeStyle(content.key)}>
        <ViewContentTracker contentId={COURSE_SLUG} contentName={COURSE_NAME} value={COURSE_PRICE} currency="BDT" />
        <Navbar onChangeCategory={onChangeCategory} hidden={timelinePinned} />
        <main>
          <Hero content={content.hero} enrolledLabel={ENROLLED_LABEL} />
          <TimelineNav sectionIds={sectionIds} onStuckChange={setTimelinePinned} />

          {/* problem + promise */}
          {promise.map(renderSection)}

          {/* what you get, and the proof behind it */}
          <CourseIncludes />
          {curriculum.map(renderSection)}
          <ToolsTech />
          <Projects />

          {/* "is this for me / can I do this" objections */}
          {audience.map(renderSection)}
          <Requirements />

          {/* trust, then the offer */}
          {trust.map(renderSection)}
          {ctas.map(renderSection)}
          <PricingAnchor />
          {faq.map(renderSection)}
        </main>
        <Footer />
        <EnrollModal />
      </div>
      {/* Must stay OUTSIDE the overflow-x-clip wrapper: `overflow: clip` makes an
          element a containing block for fixed-position descendants, which pins the
          bar to the bottom of that (very tall) div instead of the viewport.
          It carries its own themeStyle so the segment accent still applies. */}
      <div style={themeStyle(content.key)}>
        <StickyEnrollBarConnected />
      </div>
    </EnrollProvider>
  );
}
