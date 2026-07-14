'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import AddStudentModal, { type CourseOption } from './AddStudentModal';
import Pagination from './Pagination';
import { formatDhakaDate } from '@/lib/date';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface EnrolledCourse { title: string; slug: string; }
interface StudentRow {
  _id: string;
  name: string;
  phone: string;
  avatar?: string;
  enrolledCount: number;
  enrolledCourses: EnrolledCourse[];
  createdAt: string;
}

function Avatar({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatar ? `url(${avatar}) center/cover` : 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundSize: 'cover' }}>
      {!avatar && <span className={sg.className} style={{ color: 'white', fontWeight: 700, fontSize: '0.6875rem' }}>{initials}</span>}
    </div>
  );
}

interface StudentsTableProps {
  students: StudentRow[];
  /** Heading shown above the table. */
  title?: string;
  /** Message shown when the list is empty. */
  emptyMessage?: string;
  /** Show the expandable "Enrolled" courses column (off for abandoned students). */
  showEnrolled?: boolean;
  /** When provided, renders an "Add Student" button + modal next to the title. */
  addStudentCourses?: CourseOption[];
  /** Pagination state — when provided, a pager is rendered below the table. */
  page?: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
  basePath?: string;
  /** When provided, renders a search box that filters by name/phone via ?q=. */
  searchQuery?: string;
}

export default function StudentsTable({
  students,
  title = 'Students',
  emptyMessage = 'No students yet',
  showEnrolled = true,
  addStudentCourses,
  page = 1,
  totalPages = 1,
  total,
  pageSize,
  basePath = '/admin/students',
  searchQuery,
}: StudentsTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const router = useRouter();
  const searchable = searchQuery !== undefined;
  const [query, setQuery] = useState(searchQuery ?? '');

  const toggle = (id: string) =>
    setExpanded((p) => { const n = new Set(p); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });

  const runSearch = (value: string) => {
    const trimmed = value.trim();
    router.push(trimmed ? `${basePath}?q=${encodeURIComponent(trimmed)}` : basePath);
  };

  const headers = showEnrolled ? ['', 'Name', 'Phone', 'Enrolled', 'Joined'] : ['Name', 'Phone', 'Joined'];
  const colCount = headers.length;

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1100 }} className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
        {addStudentCourses && <AddStudentModal courses={addStudentCourses} />}
      </div>
      {searchable && (
        <form
          onSubmit={(e) => { e.preventDefault(); runSearch(query); }}
          style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}
        >
          <Search size={15} color="#52525b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone…"
            className={inter.className}
            style={{
              width: '100%', padding: '9px 34px 9px 34px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              color: '#e2e8f0', fontSize: '0.875rem', outline: 'none',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); runSearch(''); }}
              aria-label="Clear search"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}
            >
              <X size={15} color="#71717a" />
            </button>
          )}
        </form>
      )}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {headers.map((h, hi) => (
                  <th key={h || `col-${hi}`} className={sg.className} style={{ padding: '10px 16px', textAlign: 'left', color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={colCount} className={inter.className} style={{ padding: '48px 16px', textAlign: 'center', color: '#52525b' }}>{searchQuery ? `No students match “${searchQuery}”` : emptyMessage}</td></tr>
              ) : students.map((s, i) => {
                const canExpand = showEnrolled && s.enrolledCount > 0;
                const isExpanded = expanded.has(s._id);
                const isLast = i === students.length - 1;
                return (
                  <Fragment key={s._id}>
                    <tr
                      onClick={() => canExpand && toggle(s._id)}
                      style={{
                        borderBottom: isExpanded || !isLast ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        cursor: canExpand ? 'pointer' : 'default',
                        background: isExpanded ? 'rgba(99,102,241,0.04)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      {showEnrolled && (
                        <td style={{ padding: '12px 16px', width: 36 }}>
                          {canExpand && (
                            isExpanded ? <ChevronDown size={15} color="#6366f1" /> : <ChevronRight size={15} color="#52525b" />
                          )}
                        </td>
                      )}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={s.name} avatar={s.avatar} />
                          <span className={inter.className} style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{s.name}</span>
                        </div>
                      </td>
                      <td className={inter.className} style={{ padding: '12px 16px', color: '#71717a', fontSize: '0.8125rem' }}>{s.phone}</td>
                      {showEnrolled && (
                        <td style={{ padding: '12px 16px' }}>
                          <span className={sg.className} style={{ padding: '2px 8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '100px', color: '#a5b4fc', fontSize: '0.6875rem', fontWeight: 700 }}>
                            {s.enrolledCount} courses
                          </span>
                        </td>
                      )}
                      <td className={inter.className} style={{ padding: '12px 16px', color: '#52525b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {formatDhakaDate(s.createdAt)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${s._id}-expand`} style={{ borderBottom: !isLast ? '1px solid rgba(255,255,255,0.04)' : 'none', background: 'rgba(99,102,241,0.03)' }}>
                        <td />
                        <td colSpan={4} style={{ padding: '10px 16px 14px' }}>
                          <p className={sg.className} style={{ color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Enrolled Courses</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {s.enrolledCourses.map((c) => (
                              <span key={c.slug} className={inter.className} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#a1a1aa', fontSize: '0.8125rem' }}>{c.title}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} basePath={basePath} total={total} pageSize={pageSize} extraParams={searchQuery ? { q: searchQuery } : undefined} />
      </div>
      <style>{`@media (max-width: 640px) { .admin-content { padding: 20px 16px !important; } }`}</style>
    </div>
  );
}
