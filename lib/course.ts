import type { ISection } from '@/models/Course';

/**
 * Remove the per-lesson `note` field from a curriculum.
 *
 * Lesson notes are private learning material for enrolled students only. Public
 * surfaces (the course detail page, the public course API) serialize the full
 * curriculum, so they MUST run it through this helper first — otherwise notes
 * leak to anyone who can read the page source or hit the API.
 */
export function stripLessonNotes<T extends Pick<ISection, 'lessons'>>(
  curriculum: T[]
): T[] {
  return curriculum.map((section) => ({
    ...section,
    lessons: section.lessons.map((lesson) => {
      // Drop `note`, keep everything else.
      const { note: _note, ...rest } = lesson;
      void _note;
      return rest;
    }),
  })) as T[];
}
