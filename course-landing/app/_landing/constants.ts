// Single flagship course this subdomain sells. Must match a Course.slug in the
// shared DB (same slug the main app's ai-for-developers landing enrolls into).
export const COURSE_SLUG = 'ai-for-developers';
export const COURSE_NAME = 'AI for Developers: Web & Mobile App Development';
export const COURSE_PRICE = 990;

// Display-only social-proof count for the landing hero / social-proof strip.
export const ENROLLED_LABEL = '১,২০০+';

// Login lives on the main domain, not this subdomain — this app has no auth
// routes of its own, and a purchase here unlocks on afnanmahmud.com login.
export const OTP_URL = 'https://afnanmahmud.com/auth/otp';
