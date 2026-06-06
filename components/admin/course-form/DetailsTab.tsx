'use client';

import { Label, Input, Textarea, inter, slugify } from './fields';
import CoursePreview from './CoursePreview';
import type { FormData } from './types';

export default function DetailsTab({
  form, setField, slugManual, setSlugManual, thumbnailPreview,
}: {
  form: FormData;
  setField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  slugManual: boolean;
  setSlugManual: (v: boolean) => void;
  thumbnailPreview: string | null;
}) {
  const onTitleChange = (val: string) => {
    setField('title', val);
    if (!slugManual) setField('slug', slugify(val));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }} className="details-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Label>Title *</Label>
          <Input value={form.title} onChange={onTitleChange} placeholder="Complete MERN Stack + React Native" invalid={!form.title.trim()} />
        </div>
        <div>
          <Label>Slug (URL) *</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={form.slug} onChange={(v) => { setField('slug', v); setSlugManual(true); }} placeholder="complete-mern-stack" invalid={!form.slug.trim()} />
            <button type="button" onClick={() => { setField('slug', slugify(form.title)); setSlugManual(false); }} className={inter.className}
              style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#71717a', fontSize: '0.8125rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Auto
            </button>
          </div>
          <p className={inter.className} style={{ color: '#3f3f46', fontSize: '0.75rem', marginTop: 4 }}>Preview: /courses/{form.slug || '…'}</p>
        </div>
        <div>
          <Label hint={`(${form.shortDescription.length}/160)`}>Short Description</Label>
          <Textarea value={form.shortDescription} onChange={(v) => setField('shortDescription', v)} maxLength={160} rows={2} placeholder="A brief one-liner about the course…" />
        </div>
        <div>
          <Label hint="(HTML)">Long Description</Label>
          <Textarea value={form.longDescription} onChange={(v) => setField('longDescription', v)} rows={7} placeholder="<p>Full course description…</p>" mono />
        </div>
      </div>

      {/* Live preview */}
      <div style={{ position: 'sticky', top: 12 }} className="details-preview">
        <CoursePreview form={form} thumbnailPreview={thumbnailPreview} />
      </div>

      <style>{`
        @media (max-width: 860px) {
          .details-grid { grid-template-columns: 1fr !important; }
          .details-preview { position: static !important; }
        }
      `}</style>
    </div>
  );
}
