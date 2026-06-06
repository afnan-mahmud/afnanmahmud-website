import type { BuilderSection, FormData, TabErrors, TabKey } from './types';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validate the whole course form, grouping hard (save-blocking) errors by the
 * tab they belong to. An empty array for a tab means that tab is valid.
 */
export function validateForm(form: FormData, curriculum: BuilderSection[]): TabErrors {
  const errors: TabErrors = { details: [], media: [], curriculum: [], settings: [] };

  // Details
  if (!form.title.trim()) errors.details.push('Title is required');
  if (!form.slug.trim()) {
    errors.details.push('Slug is required');
  } else if (!SLUG_RE.test(form.slug.trim())) {
    errors.details.push('Slug may only contain lowercase letters, numbers, and hyphens');
  }

  // Settings
  if (!form.isFree && (!form.price || form.price <= 0)) {
    errors.settings.push('Price must be greater than 0 for a paid course');
  }

  // Curriculum
  curriculum.forEach((section, si) => {
    const label = section.sectionTitle.trim() || `Section ${si + 1}`;
    if (!section.sectionTitle.trim()) {
      errors.curriculum.push(`Section ${si + 1} needs a title`);
    }
    section.lessons.forEach((lesson, li) => {
      if (!lesson.title.trim()) {
        errors.curriculum.push(`${label} → lesson ${li + 1} needs a title`);
      }
      if (!lesson.videoId.trim()) {
        errors.curriculum.push(`${label} → lesson ${li + 1} needs a YouTube video ID`);
      }
    });
  });

  return errors;
}

export function countErrors(errors: TabErrors): number {
  return (Object.keys(errors) as TabKey[]).reduce((n, k) => n + errors[k].length, 0);
}

export function firstTabWithError(errors: TabErrors): TabKey | null {
  const order: TabKey[] = ['details', 'media', 'curriculum', 'settings'];
  return order.find((k) => errors[k].length > 0) ?? null;
}
