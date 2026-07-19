import type { CSSProperties } from 'react';

export type SegmentKey =
  | 'beginner' | 'freelancer' | 'student' | 'entrepreneur' | 'developer';

// Two accent colors per segment, as raw RGB triples so we can build rgba()
// glows in CSS vars. `accent` = primary, `accent2` = secondary/gradient end.
type ThemeVars = { accent: string; accent2: string };

export const SEGMENT_THEMES: Record<SegmentKey, ThemeVars> = {
  beginner:     { accent: '16 185 129', accent2: '20 184 166' },   // emerald / teal
  freelancer:   { accent: '245 158 11', accent2: '234 88 12' },    // amber / orange
  student:      { accent: '34 211 238', accent2: '99 102 241' },   // cyan / indigo
  entrepreneur: { accent: '139 92 246', accent2: '217 70 239' },   // violet / fuchsia
  developer:    { accent: '56 189 248', accent2: '99 102 241' },   // sky / indigo
};

// Inline style object exposing the accent as CSS vars on the page wrapper.
// Sections reference these via arbitrary Tailwind values, e.g.
// text-[rgb(var(--seg-accent))] or shadow-[0_0_20px_rgba(var(--seg-accent)/0.3)].
export function themeStyle(key: SegmentKey): CSSProperties {
  const t = SEGMENT_THEMES[key];
  return {
    ['--seg-accent' as string]: t.accent,
    ['--seg-accent-2' as string]: t.accent2,
  };
}
