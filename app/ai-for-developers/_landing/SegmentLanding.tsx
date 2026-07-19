'use client';

import { EnrollProvider } from '../EnrollContext';
import { Navbar, CtaBanner, PricingNeon, GradientText } from '../LandingClient';
import ViewContentTracker from '@/components/tracking/ViewContentTracker';
import WhatsAppFab from '@/components/whatsapp/WhatsAppFab';
import { themeStyle } from './theme';
import type { SegmentContent, SectionKey } from './content';
import { Hero } from './sections/Hero';
import { PainPoints } from './sections/PainPoints';
import { Outcomes } from './sections/Outcomes';
import { WhyBest } from './sections/WhyBest';
import { DevStack } from './sections/DevStack';
import { Curriculum } from './sections/Curriculum';
import { Audience } from './sections/Audience';
import { Instructor } from './sections/Instructor';
import { Feedback } from './sections/Feedback';
import { Faq } from './sections/Faq';
import { SocialProof } from './sections/SocialProof';
import { Footer } from './sections/Footer';

const COURSE_SLUG = 'ai-for-developers';
const COURSE_PRICE = 990;

export default function SegmentLanding({
  content,
  enrolledLabel,
}: {
  content: SegmentContent;
  enrolledLabel: string;
}) {
  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'socialProof': return <SocialProof key={key} enrolledLabel={enrolledLabel} />;
      case 'painPoints':  return <PainPoints key={key} heading={content.painPoints.heading} items={content.painPoints.items} />;
      case 'outcomes':    return <Outcomes key={key} heading={content.outcomes.heading} sub={content.outcomes.sub} items={content.outcomes.items} />;
      case 'whyBest':     return <WhyBest key={key} heading={content.whyBest.heading} items={content.whyBest.items} />;
      case 'devStack':    return <DevStack key={key} />;
      case 'curriculum':  return <Curriculum key={key} />;
      case 'audience':    return <Audience key={key} heading={content.audience.heading} items={content.audience.items} />;
      case 'instructor':  return <Instructor key={key} />;
      case 'feedback':    return <Feedback key={key} heading={content.feedback.heading} sub={content.feedback.sub} items={content.feedback.items} />;
      case 'faq':         return <Faq key={key} heading={content.faq.heading} items={content.faq.items} />;
      case 'cta1':        return <CtaBanner key={key} headline={<>{content.cta1.headlineLead} <GradientText>{content.cta1.headlineAccent}</GradientText>{content.cta1.headlineTrail ? ` ${content.cta1.headlineTrail}` : ''}</>} sub={content.cta1.sub} />;
      case 'cta2':        return <CtaBanner key={key} headline={<>{content.cta2.headlineLead} <GradientText>{content.cta2.headlineAccent}</GradientText>{content.cta2.headlineTrail ? ` ${content.cta2.headlineTrail}` : ''}</>} sub={content.cta2.sub} />;
      default: return null;
    }
  };

  return (
    <EnrollProvider>
      <div
        className="min-h-screen font-sans bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200"
        style={themeStyle(content.key)}
      >
        <ViewContentTracker contentId={COURSE_SLUG} contentName="AI for Developers" value={COURSE_PRICE} currency="BDT" />

        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]"></div>
        </div>

        <Navbar />

        <main className="relative z-10">
          <Hero content={content.hero} />
          {content.sectionOrder.map(renderSection)}
          <PricingNeon />
        </main>

        <Footer />
        <WhatsAppFab />
      </div>
    </EnrollProvider>
  );
}
