import type { BuilderLesson, BuilderSection } from './types';

/**
 * Parse a free-text lesson duration into seconds.
 * Accepts "mm:ss" and "hh:mm:ss". Anything unparseable returns 0 so it is
 * simply excluded from totals (never an error).
 */
export function parseDuration(value: string | undefined): number {
  if (!value) return 0;
  const parts = value.trim().split(':');
  if (parts.length < 2 || parts.length > 3) return 0;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => Number.isNaN(n) || n < 0)) return 0;
  if (parts.length === 2) {
    const [m, s] = nums;
    return m * 60 + s;
  }
  const [h, m, s] = nums;
  return h * 3600 + m * 60 + s;
}

/** Format a duration in seconds as "Hh Mm" or "Mm Ss" (or "0m" when empty). */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  return `${s}s`;
}

export function sumLessonDurations(lessons: BuilderLesson[]): number {
  return lessons.reduce((sum, l) => sum + parseDuration(l.duration), 0);
}

export interface CurriculumStats {
  sections: number;
  lessons: number;
  durationSeconds: number;
}

export function curriculumStats(curriculum: BuilderSection[]): CurriculumStats {
  return curriculum.reduce<CurriculumStats>(
    (acc, section) => ({
      sections: acc.sections + 1,
      lessons: acc.lessons + section.lessons.length,
      durationSeconds: acc.durationSeconds + sumLessonDurations(section.lessons),
    }),
    { sections: 0, lessons: 0, durationSeconds: 0 }
  );
}
