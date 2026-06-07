'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { CLARITY_ID, isClarityAllowedPath } from '@/lib/clarity';

/**
 * Loads the Microsoft Clarity tag on public-facing routes only. The
 * authenticated areas (/admin, /dashboard) are never tracked. Renders nothing
 * when NEXT_PUBLIC_CLARITY_ID is unset.
 */
export default function Clarity() {
  const pathname = usePathname();

  if (!CLARITY_ID) return null;
  if (!isClarityAllowedPath(pathname)) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  );
}
