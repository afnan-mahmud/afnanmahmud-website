'use client';

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
import { DevStack } from './sections/DevStack';
import { Curriculum } from './sections/Curriculum';
import { Instructor } from './sections/Instructor';
import { Feedback } from './sections/Feedback';
import { Faq } from './sections/Faq';
import { CtaBanner } from './sections/CtaBanner';
import { PricingAnchor } from './sections/PricingAnchor';
import { Footer } from './sections/Footer';

export function LightSegmentLanding({
  content,
  onChangeCategory,
}: {
  content: SegmentContent;
  onChangeCategory: () => void;
}) {
  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'socialProof': return <SocialProof key={key} enrolledLabel={ENROLLED_LABEL} />;
      case 'painPoints':  return <PainPoints key={key} heading={content.painPoints.heading} items={content.painPoints.items} />;
      case 'outcomes':    return <Outcomes key={key} heading={content.outcomes.heading} sub={content.outcomes.sub} items={content.outcomes.items} />;
      case 'whyBest':     return <WhyBest key={key} heading={content.whyBest.heading} items={content.whyBest.items} />;
      case 'audience':    return <Audience key={key} heading={content.audience.heading} items={content.audience.items} />;
      case 'devStack':    return <DevStack key={key} />;
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
      <div className="min-h-screen overflow-x-clip" style={themeStyle(content.key)}>
        <ViewContentTracker contentId={COURSE_SLUG} contentName={COURSE_NAME} value={COURSE_PRICE} currency="BDT" />
        <Navbar onChangeCategory={onChangeCategory} />
        <main>
          <Hero content={content.hero} enrolledLabel={ENROLLED_LABEL} />
          {content.sectionOrder.map(renderSection)}
          <PricingAnchor />
        </main>
        <Footer />
        <EnrollModal />
      </div>
    </EnrollProvider>
  );
}
