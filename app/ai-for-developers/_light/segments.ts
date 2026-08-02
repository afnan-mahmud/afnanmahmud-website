import type { SegmentContent } from '@/app/ai-for-developers/_landing/content';
import type { SegmentKey } from '@/app/ai-for-developers/_landing/theme';
import { beginner } from '@/app/ai-for-developers/segments/beginner';
import { developer } from '@/app/ai-for-developers/segments/developer';
import { entrepreneur } from '@/app/ai-for-developers/segments/entrepreneur';
import { freelancer } from '@/app/ai-for-developers/segments/freelancer';
import { student } from '@/app/ai-for-developers/segments/student';

// Reuse the exact same segment content the main app uses — one source of truth.
export const SEGMENTS: Record<SegmentKey, SegmentContent> = {
  beginner,
  developer,
  entrepreneur,
  freelancer,
  student,
};
