'use client';

/**
 * Mobile-only sticky bottom enroll bar (10 Minute School style).
 *
 * Always pinned to the viewport bottom on <lg screens; hidden on desktop where
 * the navbar CTA already covers it. Shared by both landing apps — course-landing
 * resolves `@/*` to the repo root, so it imports this same file.
 *
 * Enroll modal state lives in a different EnrollContext per app, so the bar
 * takes `onEnroll` as a prop instead of calling a hook itself.
 *
 * Colors come from the per-segment `--seg-accent` / `--seg-accent-2` CSS vars
 * set by themeStyle() on the page wrapper, so the bar matches whichever segment
 * is rendered.
 */

const WHATSAPP_PATH =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

export default function StickyEnrollBar({
  onEnroll,
  price = '৯৯০৳',
  originalPrice = '~৩০,০০০৳',
  promoText = 'সীমিত সময়ের অফার — ৩০,০০০৳ এর কোর্স ৯৯০৳',
  ctaLabel = 'এনরোল করুন',
}: {
  onEnroll: () => void;
  price?: string;
  originalPrice?: string;
  promoText?: string;
  ctaLabel?: string;
}) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div className="relative">
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp এ কথা বলুন"
            className="absolute -top-7 right-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#25D366] shadow-[0_6px_20px_rgba(37,211,102,0.45)]"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
              <path d={WHATSAPP_PATH} />
            </svg>
          </a>
        )}

        <div
          /* pr-20 keeps the text clear of the WhatsApp button overlapping this strip. */
          className={`py-2 pl-4 text-center text-[13px] font-bold text-white ${whatsappNumber ? 'pr-20' : 'pr-4'}`}
          style={{ background: 'linear-gradient(90deg, rgb(var(--seg-accent)), rgb(var(--seg-accent-2)))' }}
        >
          {promoText}
        </div>

        <div
          className="bg-white px-4 pt-3 shadow-[0_-8px_30px_-12px_rgb(15_23_42/0.25)]"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-500 line-through">{originalPrice}</span>
              <span className="text-2xl font-black text-slate-900">{price}</span>
            </div>
            <span
              className="shrink-0 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: 'rgb(var(--seg-accent) / 0.12)',
                color: 'rgb(var(--seg-accent-2))',
              }}
            >
              লাইফটাইম অ্যাক্সেস
            </span>
          </div>

          <button
            type="button"
            onClick={onEnroll}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-extrabold text-white"
            style={{
              background: 'linear-gradient(90deg, rgb(var(--seg-accent)), rgb(var(--seg-accent-2)))',
              boxShadow: '0 10px 24px -8px rgb(var(--seg-accent-2) / 0.55)',
            }}
          >
            {ctaLabel}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
