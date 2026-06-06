'use client';

import { useRef } from 'react';
import { Upload, Play } from 'lucide-react';
import { Label, Input, inter } from './fields';
import type { FormData } from './types';

export default function MediaTab({
  form, setField, thumbnailPreview, onPickFile, onRemoveThumbnail, dragging, setDragging,
}: {
  form: FormData;
  setField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  thumbnailPreview: string | null;
  onPickFile: (file: File) => void;
  onRemoveThumbnail: () => void;
  dragging: boolean;
  setDragging: (v: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="media-grid">
      {/* Thumbnail */}
      <div>
        <Label>Thumbnail</Label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onPickFile(f); }}
          onClick={() => fileRef.current?.click()}
          style={{
            height: 180, borderRadius: 10, border: `2px dashed ${dragging ? '#6366f1' : 'rgba(255,255,255,0.12)'}`,
            background: thumbnailPreview ? `url(${thumbnailPreview}) center/cover` : 'rgba(255,255,255,0.02)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden',
          }}
        >
          {!thumbnailPreview && (
            <>
              <Upload size={24} color="#52525b" />
              <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', marginTop: 8, textAlign: 'center' }}>Click or drag &amp; drop image</p>
            </>
          )}
          {thumbnailPreview && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="thumb-overlay">
              <Upload size={22} color="white" />
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickFile(f); }} />
        {thumbnailPreview && (
          <button type="button" onClick={onRemoveThumbnail} className={inter.className} style={{ marginTop: 6, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
        )}
      </div>

      {/* Preview video */}
      <div>
        <Label>Preview Video ID (YouTube)</Label>
        <Input value={form.previewVideoId} onChange={(v) => setField('previewVideoId', v)} placeholder="dQw4w9WgXcQ" />
        {form.previewVideoId ? (
          <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
            <iframe src={`https://www.youtube.com/embed/${form.previewVideoId}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} frameBorder="0" allowFullScreen title="Preview" />
          </div>
        ) : (
          <div style={{ marginTop: 10, height: 120, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Play size={18} color="#3f3f46" />
            <span className={inter.className} style={{ color: '#3f3f46', fontSize: '0.8125rem' }}>Enter Video ID to preview</span>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) { .media-grid { grid-template-columns: 1fr !important; } }
        .thumb-overlay:hover { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
