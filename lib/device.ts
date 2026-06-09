/**
 * Device-class detection from a User-Agent string.
 *
 * Tablets are treated as `mobile` (touch class), matching the product rule of
 * "one mobile + one desktop" per account. Anything that isn't clearly a phone
 * or tablet falls back to `desktop`.
 */

export type DeviceClass = 'mobile' | 'desktop';

// Phones and tablets. iPadOS 13+ reports a desktop-style UA ("Macintosh"), so we
// also catch the touch hint VdoCipher-irrelevant but common: "Mobile".
const MOBILE_RE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk|Kindle|PlayBook/i;

export function deviceClass(userAgent: string | null | undefined): DeviceClass {
  if (!userAgent) return 'desktop';
  return MOBILE_RE.test(userAgent) ? 'mobile' : 'desktop';
}
