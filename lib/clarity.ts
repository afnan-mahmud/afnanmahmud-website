// Microsoft Clarity config. The project id is managed via env and the tag is a
// no-op when it's unset, so Clarity never breaks existing flows.

export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

// Route prefixes Clarity must never track — the authenticated areas. Everything
// else (the (public) group, the ai-for-developers landing, and auth/otp) counts
// as public and is tracked.
export const CLARITY_EXCLUDED_PREFIXES = ['/admin', '/dashboard'];

/** True when the given path is a public route Clarity is allowed to track. */
export function isClarityAllowedPath(pathname: string): boolean {
  return !CLARITY_EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
