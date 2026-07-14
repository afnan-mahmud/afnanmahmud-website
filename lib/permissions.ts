/**
 * Admin RBAC catalog + pure helpers. Client-safe: this module must NOT import
 * the DB, auth, or any model (it is bundled into client components such as the
 * sidebar and the add-admin modal). Server-only helpers live in
 * `lib/permissions.server.ts`.
 */

export interface PermAction {
  /** Full permission string, e.g. `courses.edit`. */
  key: string;
  label: string;
}

export interface PermSection {
  id: string;
  label: string;
  /** Primary page path — used as the sidebar/first-allowed target. */
  path: string;
  /** Actions; the first entry is always the section's `.view` permission. */
  actions: PermAction[];
}

/**
 * Single source of truth for every grantable permission, grouped by section.
 * Drives the add/edit-admin modal, the sidebar filter, and the route guards.
 */
export const PERMISSIONS: PermSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    actions: [{ key: 'dashboard.view', label: 'View dashboard' }],
  },
  {
    id: 'courses',
    label: 'Courses',
    path: '/admin/courses',
    actions: [
      { key: 'courses.view', label: 'View courses' },
      { key: 'courses.create', label: 'Create course' },
      { key: 'courses.edit', label: 'Edit course' },
      { key: 'courses.delete', label: 'Delete course' },
    ],
  },
  {
    id: 'students',
    label: 'Students',
    path: '/admin/students',
    actions: [
      { key: 'students.view', label: 'View students & abandoned' },
      { key: 'students.add', label: 'Add / manually enroll student' },
      { key: 'students.refund', label: 'Request course refund' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    path: '/admin/orders',
    actions: [{ key: 'orders.view', label: 'View orders' }],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    path: '/admin/accounts',
    actions: [
      { key: 'accounts.view', label: 'View accounts & ledger' },
      { key: 'accounts.expense', label: 'Add expense / manage categories' },
    ],
  },
  {
    id: 'refunds',
    label: 'Refunds',
    path: '/admin/refunds',
    actions: [{ key: 'refunds.manage', label: 'View & confirm/reject refunds' }],
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    path: '/admin/whatsapp',
    actions: [
      { key: 'whatsapp.view', label: 'View WhatsApp inbox' },
      { key: 'whatsapp.reply', label: 'Send WhatsApp replies' },
    ],
  },
];

/** Every valid permission string (used to filter unknown input on the API). */
export const ALL_PERMISSIONS: string[] = PERMISSIONS.flatMap((s) => s.actions.map((a) => a.key));

/** The `.view` permission of the section a given action belongs to. */
export function viewPermFor(perm: string): string {
  return `${perm.split('.')[0]}.view`;
}

export interface Access {
  isOwner: boolean;
  permissions: string[];
  userId: string;
}

/** Owner bypasses everything; otherwise the permission must be explicitly granted. */
export function can(access: Access | null | undefined, perm: string): boolean {
  if (!access) return false;
  if (access.isOwner) return true;
  return access.permissions.includes(perm);
}

/**
 * Normalise a set of granted permissions: drop unknown strings and ensure that
 * whenever any action of a section is present, that section's `.view` is too
 * (an admin can never have `courses.create` without `courses.view`).
 */
export function normalizePermissions(input: unknown): string[] {
  const set = new Set<string>();
  if (Array.isArray(input)) {
    for (const p of input) {
      if (typeof p === 'string' && ALL_PERMISSIONS.includes(p)) set.add(p);
    }
  }
  for (const p of [...set]) set.add(viewPermFor(p));
  // Keep catalog order for stable storage/display.
  return ALL_PERMISSIONS.filter((p) => set.has(p));
}

export interface NavItem {
  href: string;
  label: string;
  /** Required `.view` permission; absent for owner-only items. */
  perm?: string;
  ownerOnly?: boolean;
  exact?: boolean;
}

/** Sidebar items in display order. Icons are mapped by `href` in the sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', perm: 'dashboard.view', exact: true },
  { href: '/admin/courses', label: 'Courses', perm: 'courses.view' },
  { href: '/admin/students', label: 'Students', perm: 'students.view', exact: true },
  { href: '/admin/abandoned-students', label: 'Abandoned Students', perm: 'students.view' },
  { href: '/admin/orders', label: 'Orders', perm: 'orders.view' },
  { href: '/admin/refunds', label: 'Refunds', perm: 'refunds.manage' },
  { href: '/admin/accounts', label: 'Accounts', perm: 'accounts.view' },
  { href: '/admin/whatsapp', label: 'WhatsApp', perm: 'whatsapp.view' },
  { href: '/admin/users', label: 'Users', ownerOnly: true },
];

/** Nav items the given access may see. */
export function visibleNav(access: Access | null): NavItem[] {
  if (!access) return [];
  return NAV_ITEMS.filter((item) => {
    if (item.ownerOnly) return access.isOwner;
    return item.perm ? can(access, item.perm) : true;
  });
}

/** First page the viewer is allowed to land on, or the no-access page. */
export function firstAllowedPath(access: Access | null): string {
  const nav = visibleNav(access);
  return nav[0]?.href ?? '/admin/no-access';
}
