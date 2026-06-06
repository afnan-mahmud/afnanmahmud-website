'use client';

import { BookOpen } from 'lucide-react';
import { sg, inter } from './fields';
import type { FormData } from './types';

const LEVEL_COLOR: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#f59e0b',
  advanced: '#f87171',
};

/** A lightweight student-facing course card preview, fed by live form state. */
export default function CoursePreview({ form, thumbnailPreview }: { form: FormData; thumbnailPreview: string | null }) {
  const levelColor = LEVEL_COLOR[form.level] ?? '#6366f1';

  return (
    <div>
      <p className={sg.className} style={{ color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        Live Preview
      </p>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
        {/* Thumbnail */}
        <div style={{ height: 150, background: thumbnailPreview ? `url(${thumbnailPreview}) center/cover` : 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(34,211,238,0.12))', position: 'relative' }}>
          {!thumbnailPreview && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>⚡</div>
          )}
          <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', background: `${levelColor}22`, border: `1px solid ${levelColor}55`, borderRadius: 100, color: levelColor, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'capitalize', fontFamily: sg.style.fontFamily }}>
            {form.level}
          </span>
        </div>

        <div style={{ padding: 16 }}>
          {form.category && (
            <p className={inter.className} style={{ color: '#6366f1', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 6px' }}>
              {form.category}
            </p>
          )}
          <h3 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.4, margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {form.title || 'Course title…'}
          </h3>
          {form.shortDescription && (
            <p className={inter.className} style={{ color: '#71717a', fontSize: '0.8125rem', lineHeight: 1.5, margin: '0 0 12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {form.shortDescription}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
            <span className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.05rem' }}>
              {form.isFree ? 'Free' : `৳${(form.price || 0).toLocaleString()}`}
            </span>
            <span className={inter.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: form.isPublished ? '#4ade80' : '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>
              <BookOpen size={12} />
              {form.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
