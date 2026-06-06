# Course Builder Form Redesign — Design

**Date:** 2026-06-06
**Status:** Approved

## Goal

Improve the admin course management UX. Reorganize the single 450-line
`CourseForm` into a clear tabbed interface with a powerful curriculum builder
(drag-and-drop, collapsible sections, duration summaries), per-tab validation,
a sticky save bar, an unsaved-changes guard, and a live student-facing preview —
without changing the data contract with the API.

## Scope

This spec covers **only** the admin course builder (`CourseForm` and the
create/edit pages that mount it). Other surfaces (student player, course list,
public detail page) are out of scope for this iteration.

## Layout — tabbed

Four tabs, one visible at a time. All form state lives in the orchestrator for
the whole form, so switching tabs never loses data. A single **Save** persists
everything.

- **Details** — title, slug (auto from title + manual override), short
  description (160 max), long description (HTML).
- **Media** — thumbnail upload (click/drag-drop, uploads to `/api/upload`),
  preview video ID + live YouTube embed.
- **Curriculum** — section + lesson builder (see below).
- **Settings** — category, level, price, Free toggle, Published toggle.

## Curriculum builder

- **Drag-and-drop reordering** of both sections and lessons, via `@dnd-kit/core`
  + `@dnd-kit/sortable` + `@dnd-kit/utilities` (React 19 compatible). Sections
  reorder within the curriculum; lessons reorder within their own section.
  Each section is its own sortable context; a drag handle on each row.
- **Collapsible sections** — each section card collapses/expands. The header
  shows the section title (editable), lesson count, and summed duration.
- **Expand/collapse all** control, plus a course-level summary bar at the top of
  the tab: total sections, total lessons, total duration.
- **Cleaner lesson rows** — fields (title, YouTube ID, duration, Preview toggle,
  Note button + editor) laid out with clear labels and spacing; stacks
  gracefully on mobile.

## Save & validation

- **Validation** (`validation.ts`) returns a per-tab error map. Hard errors that
  block save:
  - Details: title required; slug required; slug matches `^[a-z0-9-]+$`.
  - Settings: if not free, price must be > 0.
  - Curriculum: every section must have a title; every lesson must have a title
    and a videoId.
- **Error badges** — each tab button shows a red badge with its error count.
  Attempting to save with errors switches to the first tab with an error and
  toasts a summary.
- **Sticky save bar** — fixed bar at the bottom across all tabs: Save + Cancel
  buttons and a Draft/Published status pill.
- **Unsaved-changes warning** — when the form is dirty, a `beforeunload` handler
  guards browser navigation and the in-app Cancel asks for confirmation. Dirty
  state is tracked by comparing current state to the initial snapshot.
- **Live preview** — a `CoursePreview` panel (shown on the Details tab and/or a
  toggle) renders a course card + hero summary reflecting the current form
  state, so the admin sees roughly what students will see.

## Architecture

```
components/admin/CourseForm.tsx           orchestrator: state, tab routing,
                                          validation wiring, save, sticky bar,
                                          dirty/unsaved guard
components/admin/course-form/
  types.ts          BuilderLesson, BuilderSection, FormData, CourseFormInitial
  fields.tsx        Label, Input, Textarea, Toggle + shared CSSProperties styles
  DetailsTab.tsx
  MediaTab.tsx
  SettingsTab.tsx
  CurriculumTab.tsx dnd context(s), summary bar, expand/collapse-all
  SectionCard.tsx   draggable + collapsible section, owns its lessons' dnd
  LessonRow.tsx     draggable lesson row, clean layout, note editor
  CoursePreview.tsx live preview card/hero
  validation.ts     validateForm(form, curriculum) -> { details, media,
                    curriculum, settings } error arrays
  duration.ts       parseDuration("mm:ss"|"hh:mm:ss") -> seconds;
                    formatDuration(seconds); sumLessonDurations(lessons)
```

Each unit has one purpose and a narrow interface. Tabs are presentational and
receive state + callbacks from the orchestrator. `validation.ts` and
`duration.ts` are pure and unit-testable.

## Data contract — unchanged

- Payload to `POST /api/admin/courses` and `PUT /api/admin/courses/[id]` keeps
  the same shape: the `FormData` fields plus `curriculum: BuilderSection[]`
  (lessons include `note`). Reordering simply changes array order.
- Thumbnail upload flow (`/api/upload`, folder `thumbnails`) unchanged.
- Edit page mapping (`app/(admin)/admin/courses/[id]/edit/page.tsx`) already maps
  `note`; it continues to feed `CourseFormInitial`.
- Lesson notes remain enrolled-only; public stripping (`stripLessonNotes`) is
  already in place and untouched.

## Duration handling

`duration` is a free-text string per lesson (e.g. `12:30`, `1:02:15`).
`parseDuration` accepts `mm:ss` and `hh:mm:ss`; unparseable values count as 0 and
are simply excluded from totals (no error). Totals render as `Hh Mm` or `Mm Ss`.

## Testing

- `npm run lint` — no new errors.
- `npm run build` — type-checks and compiles.
- Pure-logic checks for `duration.ts` (parse/sum/format) and `validation.ts`
  (per-tab error detection) via a throwaway Node script.
- Observational: create + edit round-trip persists all fields and curriculum
  order; drag reorder then save reflects new order on reload; validation badges
  appear and block save; duration totals match; preview reflects current state.

## Out of scope (YAGNI)

- Autosave / draft versioning.
- Section-level independent save.
- Rich-text editor for long description (stays raw HTML textarea).
- Reordering lessons across different sections via drag (only within a section).
- Bulk lesson import.
