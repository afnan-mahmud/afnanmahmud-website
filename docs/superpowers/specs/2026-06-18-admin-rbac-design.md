# Admin Team & Role-Based Access Control (RBAC) — Design

**Date:** 2026-06-18
**Status:** Approved (pending spec review)

## Goal

Let the panel owner add other admin (team) accounts and control, per account, exactly
which admin sections each person can see and which actions they can perform. An added
admin sees and can do *only* what they were granted.

## Permission model

Two new fields on the `User` model:

- `permissions: string[]` — granular, per-action permission strings.
- `isOwner: boolean` (no schema default) — owner bypasses all checks and is the only role
  that can manage the team.

### Permission catalog (per-action)

| Section | Page(s) | Permission strings |
|---------|---------|--------------------|
| Dashboard | `/admin` | `dashboard.view` |
| Courses | `/admin/courses`, create, edit | `courses.view`, `courses.create`, `courses.edit`, `courses.delete` |
| Students | `/admin/students`, `/admin/abandoned-students` | `students.view`, `students.add` |
| Orders | `/admin/orders` | `orders.view` |
| Accounts | `/admin/accounts` | `accounts.view`, `accounts.expense` |

Notes:
- `students.view` gates both the Students and Abandoned Students pages.
- `accounts.expense` covers adding expenses and managing expense categories.
- A section's `*.view` permission gates page access + sidebar visibility. Action
  permissions (`create`/`edit`/`delete`/`add`/`expense`) gate the action buttons and the
  underlying API routes.
- **View is implied by any action:** the Add/Edit-Admin modal auto-includes a section's
  `*.view` whenever any action in that section is checked (and shows `*.view` as auto-selected),
  so an admin can never end up with `courses.create` but no `courses.view`. Action-route guards
  still check only the specific action permission.

### Owner

- `isOwner: true` ⇒ all `can(...)` checks return true, the **Users** menu is visible, and
  team-management routes are allowed.
- Only owners manage the team. Added admins are always `isOwner: false`.

## Enforcement (defense in depth)

1. **Middleware (edge), unchanged:** gate `/admin/*` to a logged-in `role === 'admin'`.
2. **Admin layout becomes a server component:** reads the viewer's `{ isOwner, permissions }`
   fresh from the DB on every request and passes it to a client `AdminShell` (mobile toggle +
   sidebar). Because it is read fresh, permission changes take effect immediately. Non-admins
   are redirected (defense in depth behind middleware).
3. **Each admin page (server component):** checks the section's `*.view` permission; if absent,
   redirect to the viewer's first allowed page (or `/admin/no-access` if none). Action controls
   render only when the viewer holds the matching action permission (access is passed into the
   page/table components).
4. **Each admin API route:** the existing `role === 'admin'` guard is replaced by a
   permission check (`requirePerm('students.add')`, etc.; owner bypasses). This is the real
   security boundary — a scoped admin calling an API directly is still blocked.

### Dashboard specifics

`dashboard.view` gates whether the `/admin` page and its menu item are available at all.
Inside the dashboard, individual stat cards remain gated by their section's view permission
(revenue/financial card requires `accounts.view`, order list requires `orders.view`, student
counts require `students.view`, course count requires `courses.view`). So granting dashboard
access never leaks another section's sensitive data.

## New utility — `lib/permissions.ts`

- `PERMISSIONS` — the catalog above (sections → actions + UI labels), the single source of
  truth used by the sidebar, the Add/Edit-Admin modal, and the guards.
- `type Access = { isOwner: boolean; permissions: string[]; userId: string }`.
- `can(access, perm): boolean` — owner ⇒ true, else `permissions.includes(perm)`.
- `getAccess(): Promise<Access | null>` — server helper: `auth()` + load the user; returns
  `null` when the viewer is not an admin. Handles the legacy-admin bootstrap (below).
- `requirePerm(perm): Promise<Access | null>` — API-route guard; route returns 403 on `null`.
- `firstAllowedPath(access): string` — first viewable section path, else `/admin/no-access`.
- `NAV_ITEMS` — sidebar items derived from the catalog (each carries its required `*.view`
  perm); the Users item is owner-only.

## Users / Team management — `/admin/users` (owner-only)

- Server page: `getAccess()`; non-owner ⇒ redirect to `firstAllowedPath`. Lists every
  `role: 'admin'` user (name, phone, Owner/Scoped badge, permission summary, joined date).
- **Add Admin** modal (client): name + phone (BD `01XXXXXXXXX`) + permission checkboxes grouped
  by section from `PERMISSIONS`. Submit creates a `User` with `role: 'admin'`,
  `isOwner: false`, `permissions: [...]`. Login uses the existing phone-OTP flow (the owner
  shares the phone; the person signs in with an OTP to that number).
- **Edit permissions** (row → modal) and **Remove admin** (delete the account). Guards:
  cannot edit or remove an owner; cannot remove yourself.
- API:
  - `GET /api/admin/team` — list admins (owner-only).
  - `POST /api/admin/team` — create admin (owner-only); validates phone, rejects duplicates,
    only persists permission strings present in the catalog.
  - `PUT /api/admin/team/[id]` — update name + permissions (owner-only; target must not be an owner).
  - `DELETE /api/admin/team/[id]` — remove admin (owner-only; target must not be an owner and
    must not be the caller).

## Sidebar

Built from `NAV_ITEMS`, filtered by `can(access, '<section>.view')`. The **Users** item is
shown only to owners. Items the viewer can't view are hidden.

## Backward compatibility (no migration script, no lockout)

Existing admins have no `isOwner` field. `getAccess()` reads the user with `.lean()` so the
field is genuinely `undefined` for legacy admins (no schema default is set). When an admin's
`isOwner` is `undefined`, `getAccess` promotes them: persists `isOwner: true` and treats them
as owner. Admins created through the Team UI always get `isOwner: false` explicitly, so they
are never auto-promoted. Result: the current admin keeps full access on first load; newly
added scoped admins are correctly limited; no migration step is required.

## Files

**New**
- `lib/permissions.ts` — catalog, `Access`, `can`, `getAccess`, `requirePerm`,
  `firstAllowedPath`, `NAV_ITEMS`.
- `app/(admin)/admin/users/page.tsx` — Team page (owner-only).
- `components/admin/TeamTable.tsx` — admin list + row actions (client).
- `components/admin/AdminPermissionModal.tsx` — add/edit admin with permission checkboxes.
- `app/api/admin/team/route.ts` — GET/POST.
- `app/api/admin/team/[id]/route.ts` — PUT/DELETE.
- `app/(admin)/admin/no-access/page.tsx` — minimal "no sections assigned" page.
- `components/layout/AdminShell.tsx` — client shell (mobile toggle + sidebar + content),
  receives `access`.

**Modified**
- `models/User.ts` — add `permissions`, `isOwner`.
- `app/(admin)/layout.tsx` — convert to server component; fetch access; render `AdminShell`.
- `components/layout/AdminSidebar.tsx` — accept `access`, filter nav, add Users item.
- `app/(admin)/admin/page.tsx` — gate by `dashboard.view`; per-card section gating.
- `app/(admin)/admin/courses/**`, `students`, `abandoned-students`, `orders`, `accounts`
  pages — section `*.view` guard + action-permission-aware buttons.
- `app/api/admin/courses/**`, `students`, `orders`, `expenses`, `expense-categories` routes —
  replace `role === 'admin'` with `requirePerm(...)`.
- `components/shared/AdminGuard.tsx` — superseded by the server layout guard (removed or
  reduced to a loading shell).

## Out of scope (YAGNI)

- No per-admin audit log.
- No temporary/expiring permissions.
- No custom roles/role templates — permissions are assigned per admin directly.
- Remove = hard delete (not soft delete / deactivate).
