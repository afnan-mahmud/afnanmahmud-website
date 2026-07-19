import type { SegmentKey } from '@/app/ai-for-developers/_landing/theme';

export type GateSegment = {
  key: SegmentKey;
  emoji: string;
  label: string;      // short chip label
  title: string;      // card heading
  blurb: string;      // one-line description of who this is for
};

// The 5 audience categories. Order controls how the gate cards are laid out.
export const GATE_SEGMENTS: GateSegment[] = [
  {
    key: 'student',
    emoji: '🎓',
    label: 'স্টুডেন্ট',
    title: 'আমি স্টুডেন্ট',
    blurb: 'পড়ালেখার পাশাপাশি রিয়েল স্কিল শিখে ক্যারিয়ার শুরু করতে চাই।',
  },
  {
    key: 'beginner',
    emoji: '🌱',
    label: 'একদম নতুন',
    title: 'আমি একদম নতুন',
    blurb: 'কোডিং জানি না, শূন্য থেকে শুরু করে অ্যাপ বানাতে শিখতে চাই।',
  },
  {
    key: 'developer',
    emoji: '💻',
    label: 'ডেভেলপার',
    title: 'আমি ডেভেলপার',
    blurb: 'কোড জানি — এবার AI-First হয়ে ১০x দ্রুত শিপ করতে চাই।',
  },
  {
    key: 'freelancer',
    emoji: '💼',
    label: 'ফ্রিল্যান্সার',
    title: 'আমি ফ্রিল্যান্সার',
    blurb: 'AI দিয়ে দ্রুত ক্লায়েন্ট প্রজেক্ট ডেলিভার করে ইনকাম বাড়াতে চাই।',
  },
  {
    key: 'entrepreneur',
    emoji: '🚀',
    label: 'উদ্যোক্তা',
    title: 'আমি উদ্যোক্তা',
    blurb: 'নিজের আইডিয়াকে ডেভেলপার ছাড়াই প্রোডাক্টে রূপ দিতে চাই।',
  },
];

const VALID_KEYS = new Set<string>(GATE_SEGMENTS.map((s) => s.key));

export function isSegmentKey(value: string | null | undefined): value is SegmentKey {
  return !!value && VALID_KEYS.has(value);
}
