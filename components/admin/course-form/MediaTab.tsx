'use client';

import { useRef } from 'react';
import { Upload, Play, Plus, Trash2, MonitorPlay } from 'lucide-react';
import { Label, Input, Textarea, inter, uid, card, cardTitle, iconBtn } from './fields';
import type { FormData, BuilderDemoClass } from './types';

export default function MediaTab({
  form, setField, thumbnailPreview, onPickFile, onRemoveThumbnail, dragging, setDragging,
  demoClasses, setDemoClasses,
}: {
  form: FormData;
  setField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  thumbnailPreview: string | null;
  onPickFile: (file: File) => void;
  onRemoveThumbnail: () => void;
  dragging: boolean;
  setDragging: (v: boolean) => void;
  demoClasses: BuilderDemoClass[];
  setDemoClasses: React.Dispatch<React.SetStateAction<BuilderDemoClass[]>>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const addDemo = () =>
    setDemoClasses((d) => [...d, { _id: uid(), title: '', description: '', videoId: '', durationLabel: '' }]);
  const updateDemo = (id: string, patch: Partial<BuilderDemoClass>) =>
    setDemoClasses((d) => d.map((x) => (x._id === id ? { ...x, ...patch } : x)));
  const removeDemo = (id: string) => setDemoClasses((d) => d.filter((x) => x._id !== id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
        <Label>Preview Video ID (VdoCipher)</Label>
        <Input value={form.previewVideoId} onChange={(v) => setField('previewVideoId', v)} placeholder="VdoCipher Video ID" />
        <div style={{ marginTop: 10, minHeight: 120, padding: '14px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}>
          <Play size={18} color="#3f3f46" />
          {form.previewVideoId ? (
            <span className={inter.className} style={{ color: '#71717a', fontSize: '0.8125rem' }}>
              Plays securely on the course page once the course is saved &amp; published.
            </span>
          ) : (
            <span className={inter.className} style={{ color: '#3f3f46', fontSize: '0.8125rem' }}>
              Paste a VdoCipher Video ID (upload in the VdoCipher dashboard first).
            </span>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .media-grid { grid-template-columns: 1fr !important; } }
        .thumb-overlay:hover { opacity: 1 !important; }
      `}</style>
    </div>

      {/* Demo Classes — shown publicly on /ai-for-developers/demo */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <MonitorPlay size={17} color="#22d3ee" />
            <span style={cardTitle as React.CSSProperties}>Demo Classes</span>
          </div>
          <button type="button" onClick={addDemo} className={inter.className}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: '#a5b4fc', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>
            <Plus size={14} /> Add demo class
          </button>
        </div>
        <p className={inter.className} style={{ color: '#71717a', fontSize: '0.8125rem', marginTop: 0, marginBottom: 18, lineHeight: 1.6 }}>
          These play publicly (no login) on the demo page so prospective students can preview the teaching. Paste a VdoCipher Video ID for each.
        </p>

        {demoClasses.length === 0 && (
          <div className={inter.className} style={{ padding: '22px 16px', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.12)', color: '#52525b', fontSize: '0.8125rem', textAlign: 'center' }}>
            No demo classes yet. Click “Add demo class” to create one.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {demoClasses.map((d, i) => (
            <div key={d._id} style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className={inter.className} style={{ color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>DEMO {i + 1}</span>
                <button type="button" onClick={() => removeDemo(d._id)} style={iconBtn as React.CSSProperties} aria-label="Remove demo class">
                  <Trash2 size={14} color="#f87171" />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="media-grid">
                <div>
                  <Label>Title</Label>
                  <Input value={d.title} onChange={(v) => updateDemo(d._id, { title: v })} placeholder="e.g. Class 1: Setup & First App" />
                </div>
                <div>
                  <Label>VdoCipher Video ID</Label>
                  <Input value={d.videoId} onChange={(v) => updateDemo(d._id, { videoId: v })} placeholder="VdoCipher Video ID" />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Label hint="(optional)">Duration label</Label>
                <Input value={d.durationLabel} onChange={(v) => updateDemo(d._id, { durationLabel: v })} placeholder="e.g. 12 min" />
              </div>
              <div style={{ marginTop: 12 }}>
                <Label hint="(optional)">Description</Label>
                <Textarea value={d.description} onChange={(v) => updateDemo(d._id, { description: v })} rows={2} placeholder="Short line shown under the demo video." />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
