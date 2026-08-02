/**
 * The single source of truth for "domains we own".
 *
 * Used to decide whether a request's `referer` may be reported to Meta as
 * `event_source_url`. On the EPS → app redirect (`/api/payment/success`) the
 * referer is the *gateway's* domain — a host we neither own nor have verified in
 * Business Manager — so attributing the Purchase to it damages domain
 * verification / AEM signals. Anything not on this list is treated as foreign
 * and replaced with a canonical owned URL.
 *
 * Matching is host-suffix based: `afnanmahmud.com` also covers
 * `course.afnanmahmud.com`, `www.afnanmahmud.com`, etc.
 */
const DEFAULT_OWNED_HOSTS = [
  'afnanmahmud.com',
  // Dev only — never resolvable in production, so harmless to keep listed.
  'localhost',
  '127.0.0.1',
];

function hostOf(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

/**
 * Optional extra hosts, comma-separated (`OWNED_HOSTS=foo.com,bar.com`). The
 * host of NEXTAUTH_URL is always included so each deployed app trusts its own
 * origin without extra config.
 */
const OWNED_HOSTS: readonly string[] = Array.from(
  new Set(
    [
      ...DEFAULT_OWNED_HOSTS,
      ...(process.env.OWNED_HOSTS ?? '').split(',').map((h) => h.trim()),
      hostOf(process.env.NEXTAUTH_URL) ?? '',
    ]
      .map((h) => h.toLowerCase())
      .filter(Boolean)
  )
);

/** True when `host` is one of our own hosts (or a subdomain of one). */
export function isOwnedHost(host: string | undefined | null): boolean {
  if (!host) return false;
  const h = host.toLowerCase();
  return OWNED_HOSTS.some((owned) => h === owned || h.endsWith(`.${owned}`));
}

/** True when `url` is absolute and points at a host we own. */
export function isOwnedUrl(url: string | undefined | null): boolean {
  return isOwnedHost(hostOf(url));
}

/** Last-resort owned origin for this app (its own public base URL). */
export function ownedOrigin(): string {
  return process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
}
