// Client-side Google Tag Manager dataLayer helpers. Every call is a safe no-op
// when NEXT_PUBLIC_GTM_ID is unset or when run during SSR. GTM itself is the
// event hub: this file only loads events into window.dataLayer; Google Ads / GA4
// tags are wired in the GTM dashboard.

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

type DataLayerObject = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerObject[];
  }
}

/** Canonical dataLayer event names (GA4-friendly). Use these, never raw strings. */
export const GTM_EVENT = {
  pageView: 'page_view',
  viewItem: 'view_item',
  viewDemoClass: 'view_demo_class',
  beginCheckout: 'begin_checkout',
  purchase: 'purchase',
  signUp: 'sign_up',
  enrollClick: 'enroll_click',
  formStart: 'form_start',
  demoPlay: 'demo_play',
} as const;

/** Push an event + params into window.dataLayer. No-op on SSR or when GTM is unset. */
export function pushToDataLayer(event: string, params: DataLayerObject = {}): void {
  if (typeof window === 'undefined') return;
  if (!GTM_ID) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
