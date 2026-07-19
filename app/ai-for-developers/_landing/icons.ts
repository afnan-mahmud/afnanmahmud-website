'use client';

// lucide-react's icon components are plain (non-'use client') forwardRef
// components. SegmentLanding.tsx is a Client Component, and segment configs
// (e.g. segments/beginner.ts) are Server-side data embedding these icon
// components as values (SegmentContent.outcomes.items[].icon etc). Passing a
// plain function/forwardRef object as a prop across the Server->Client
// boundary is rejected by React Server Components ("Functions cannot be
// passed directly to Client Components..."), which breaks the page at
// request time even though `next build` can succeed.
//
// Re-exporting the icons from this 'use client' module turns each one into a
// proper Client Reference that Next.js CAN serialize across that boundary.
// Segment config files should import icons from here instead of importing
// them from 'lucide-react' directly.
export {
  Sparkles,
  MessagesSquare,
  Brain,
  Wallet,
  Briefcase,
  Globe,
  Smartphone,
  Bug,
  ShieldCheck,
  GitBranch,
  Rocket,
  Store,
  Code,
} from 'lucide-react';
