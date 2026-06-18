import Link from 'next/link';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

/**
 * Server-friendly pagination control for admin tables. Renders prev/next plus a
 * windowed set of numbered page links. `extraParams` (e.g. an active status
 * filter) are preserved across page navigation.
 *
 * No-op (renders nothing) when there is a single page or fewer.
 */
export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  total,
  pageSize,
  extraParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  total?: number;
  pageSize?: number;
  extraParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(extraParams ?? {})) {
      if (v) params.set(k, v);
    }
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Windowed page numbers: first, last, and a ±1 window around the current page,
  // with ellipses for the gaps.
  const pages: (number | 'gap')[] = [];
  const push = (p: number) => { if (!pages.includes(p)) pages.push(p); };
  push(1);
  if (currentPage - 1 > 2) pages.push('gap');
  for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) push(p);
  if (currentPage + 1 < totalPages - 1) pages.push('gap');
  if (totalPages > 1) push(totalPages);

  const baseBtn: React.CSSProperties = {
    minWidth: 34, height: 34, padding: '0 10px', borderRadius: 8,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa',
  };
  const activeBtn: React.CSSProperties = {
    ...baseBtn, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc',
  };
  const disabledBtn: React.CSSProperties = {
    ...baseBtn, opacity: 0.4, pointerEvents: 'none',
  };

  const from = total !== undefined && pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const to = total !== undefined && pageSize ? Math.min(currentPage * pageSize, total) : undefined;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {total !== undefined && (
        <span className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem' }}>
          {from}–{to} of {total}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }} className={sg.className}>
        <Link href={href(currentPage - 1)} aria-label="Previous page" style={currentPage <= 1 ? disabledBtn : baseBtn}>‹</Link>
        {pages.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} style={{ color: '#3f3f46', padding: '0 4px' }}>…</span>
          ) : (
            <Link key={p} href={href(p)} style={p === currentPage ? activeBtn : baseBtn}>{p}</Link>
          )
        )}
        <Link href={href(currentPage + 1)} aria-label="Next page" style={currentPage >= totalPages ? disabledBtn : baseBtn}>›</Link>
      </div>
    </div>
  );
}
