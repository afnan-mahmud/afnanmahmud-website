import type { ComponentType } from 'react';
import type { SegmentKey } from './theme';

export type IconType = ComponentType<{ size?: number | string; className?: string }>;

export type SectionKey =
  | 'socialProof' | 'painPoints' | 'outcomes' | 'whyBest' | 'devStack'
  | 'curriculum' | 'audience' | 'instructor' | 'feedback' | 'faq'
  | 'cta1' | 'cta2';

export type HeroContent = {
  headlineLead: string;    // rendered before the gradient word
  headlineAccent: string;  // rendered inside <GradientText>
  headlineTrail?: string;  // rendered after
  subheadline: string;
  bodyCopy: string;
};

export type PainPoint = { pain: string; flip: string };
export type OutcomeItem = { icon: IconType; title: string; desc: string };
export type ValueItem = { icon: IconType; title: string; desc: string };
export type AudienceItem = { icon: IconType; title: string; desc: string };
export type Testimonial = {
  name: string; initials: string; gradient: string; text: string; role?: string;
};
export type CtaBannerContent = { headlineLead: string; headlineAccent: string; headlineTrail?: string; sub: string };
export type FaqItem = { q: string; a: string };

export type SegmentContent = {
  key: SegmentKey;
  meta: { title: string; description: string; ogTitle: string; ogDescription: string };
  sectionOrder: SectionKey[];
  hero: HeroContent;
  painPoints: { heading: string; items: PainPoint[] };
  outcomes: { heading: string; sub: string; items: OutcomeItem[] };
  whyBest: { heading: string; items: ValueItem[] };
  audience: { heading: string; items: AudienceItem[] };
  feedback: { heading: string; sub: string; items: Testimonial[] };
  cta1: CtaBannerContent;
  cta2: CtaBannerContent;
  faq: { heading: string; items: FaqItem[] };
};
