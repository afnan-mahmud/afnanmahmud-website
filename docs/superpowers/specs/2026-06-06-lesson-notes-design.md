# Per-Lesson Markdown Notes — Design

**Date:** 2026-06-06
**Status:** Approved

## Goal

Let an admin attach an optional **note** to every lesson in a course. The admin
authors the note in Markdown from the existing course management form. Enrolled
students read the rendered note below the video in the lesson player. Notes are
**not** exposed to non-enrolled users on any public surface.

## Requirements

- Each lesson can have an optional Markdown note (`note?: string`).
- Authored from the existing `CourseForm` (create + edit), per lesson.
- Rendered as Markdown for enrolled students in the lesson player, under the
  video controls. Hidden entirely when a lesson has no note.
- Enrolled-only: notes must never appear in the public course API or the public
  course detail page payload.

## Design

### 1. Data model — `models/Course.ts`
Add an optional field to the lesson schema and interface:
- `ILesson.note?: string`
- `LessonSchema`: `note: { type: String }` (no default; absent = no note)

Lessons are embedded subdocuments, so no migration is required — existing
lessons simply have no `note`.

### 2. Admin authoring — `components/admin/CourseForm.tsx`
- Add `note: string` to `BuilderLesson`; `addLesson` seeds `note: ''`.
- Each lesson row gets a **Note** toggle button (FileText icon). Toggling
  expands a full-width Markdown `<textarea>` (monospace, ~4 rows) beneath the
  lesson row. A small filled-dot indicator marks lessons that already have note
  text.
- `updateLesson` already accepts arbitrary fields keyed by `keyof BuilderLesson`,
  so `note` is handled with no signature change.
- The expand/collapse state is local UI state inside `SectionCard` (a `Set` of
  lesson `_id`s whose note editor is open).

### 3. Edit page mapping — `app/(admin)/admin/courses/[id]/edit/page.tsx`
Include `note: l.note ?? ''` when mapping the persisted curriculum into the
builder shape (and add `note` to the local `LeanCourse` lesson type).

### 4. Admin API
No change. The note travels inside the `curriculum` body that the existing
`POST /api/admin/courses` and `PUT /api/admin/courses/[id]` handlers persist via
`Course.create` / `findByIdAndUpdate`. Mongoose stores the new field
automatically once it is in the schema.

### 5. Student display — `components/dashboard/VideoPlayer.tsx`
Below the Mark Complete / Next Lesson controls, when `activeLesson.note` is a
non-empty string, render a **"Lesson Notes"** card containing the rendered
Markdown.

New component `components/dashboard/LessonNote.tsx`:
- Wraps `react-markdown` + `remark-gfm`.
- Dark-theme styling for headings, paragraphs, lists, links, inline code, code
  blocks, and blockquotes (matched to the player's palette).
- Links render with `target="_blank"` and `rel="noopener noreferrer"`.

### 6. Markdown library
Add dependencies `react-markdown` and `remark-gfm`. `react-markdown` does **not**
render raw HTML by default (no `rehype-raw`), so admin-authored Markdown cannot
inject scripts — XSS-safe by construction.

### 7. Security / privacy — enrolled-only enforcement
Notes leak through two public surfaces today, both of which return the full
`curriculum`:
- `app/api/courses/[slug]/route.ts` — public JSON API.
- `app/(public)/courses/[slug]/page.tsx` — passes `curriculum` to the client
  component `CourseTabs`.

Add a helper `stripLessonNotes(curriculum)` in `lib/course.ts` that returns the
curriculum with `note` removed from every lesson. Apply it at both public
boundaries before serializing/passing to the client. The lesson player
(`VideoPlayer`) is reached only through the ownership-gated watch page, so it
keeps the notes.

## Testing

- `npm run lint` — no new errors.
- `npm run build` — type-checks and compiles, including middleware and routes.
- Manual/observational verification:
  1. Admin adds a Markdown note to a lesson, saves, reopens edit → note persists.
  2. Enrolled student opens the lesson → note renders as formatted Markdown
     below the video; a note-less lesson shows no notes section.
  3. The public course page HTML and the `/api/courses/[slug]` JSON contain
     **no** note text (verified by grepping the response).

## Out of scope (YAGNI)

- Student-authored / personal notes.
- File or resource attachments on lessons.
- Section-level or course-level notes.
- Showing notes on free preview lessons / public marketing surfaces.
