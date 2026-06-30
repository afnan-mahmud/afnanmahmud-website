'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { GTM_ID, GTM_EVENT, pushToDataLayer } from '@/lib/gtm';

function GtmPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Mirror MetaPixel: push page_view on every client-side route change. The
    // base snippet fires gtm.js once on load; GTM's own Page View trigger can
    // also key off this custom event for SPA navigations.
    pushToDataLayer(GTM_EVENT.pageView, { page_path: pathname });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Loads the Google Tag Manager container and tracks page_view across
 * navigations. Renders nothing when NEXT_PUBLIC_GTM_ID is unset.
 */
export default function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <>
      <Script id="gtm-base" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      <Suspense fallback={null}>
        <GtmPageView />
      </Suspense>
    </>
  );
}
