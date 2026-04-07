'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Upload, Play,
  ToggleLeft, ToggleRight, Save,
} from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

/* ─── Types ─── */
interface BuilderLesson {
  _id: string;
  title: string;
  videoId: string;
  duration: string;
  isPreview: boolean;
}
interface BuilderSection {
  sectionTitle: string;
  lessons: BuilderLesson[];
}
interface FormData {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  level: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  previewVideoId: string;
}

export interface CourseFormInitial {
  _id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  category?: string;
  level?: string;
  price?: number;
  isFree?: boolean;
  isPublished?: boolean;
  previewVideoId?: string;
  thumbnail?: string;
  curriculum?: BuilderSection[];
}

/* ─── Helpers ─── */
function slugify(t: string) {
  return t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ─── Sub-components ─── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className={inter.className} style={{ display: 'block', color: '#71717a', fontSize: '0.8125rem', marginBottom: 6, fontWeight: 500 }}>{children}</label>;
}

function Input({ value, onChange, placeholder, type = 'text', maxLength }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string; maxLength?: number }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={inter.className}
      style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      {checked ? <ToggleRight size={24} color="#6366f1" /> : <ToggleLeft size={24} color="#52525b" />}
      <span className={inter.className} style={{ color: checked ? '#a5b4fc' : '#71717a', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
    </button>
  );
}

function SectionCard({
  section, si, total,
  onMove, onDelete, onTitleChange, onAddLesson,
  onLessonChange, onLessonDelete, onLessonMove,
}: {
  section: BuilderSection; si: number; total: number;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onTitleChange: (v: string) => void;
  onAddLesson: () => void;
  onLessonChange: (li: number, field: keyof BuilderLesson, value: string | boolean) => void;
  onLessonDelete: (li: number) => void;
  onLessonMove: (li: number, dir: -1 | 1) => void;
}) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={section.sectionTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Section title…"
            className={sg.className}
            style={{ width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button type="button" onClick={() => onMove(-1)} disabled={si === 0} style={{ ...iconBtn, opacity: si === 0 ? 0.3 : 1 }}><ChevronUp size={14} color="#a1a1aa" /></button>
          <button type="button" onClick={() => onMove(1)} disabled={si === total - 1} style={{ ...iconBtn, opacity: si === total - 1 ? 0.3 : 1 }}><ChevronDown size={14} color="#a1a1aa" /></button>
          <button type="button" onClick={onDelete} style={{ ...iconBtn, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}><Trash2 size={13} color="#f87171" /></button>
        </div>
      </div>

      {/* Lessons */}
      <div style={{ padding: '8px 16px 12px' }}>
        {section.lessons.map((lesson, li) => (
          <div key={lesson._id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 0', borderBottom: li < section.lessons.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 160px', minWidth: 0 }}>
              <input value={lesson.title} onChange={(e) => onLessonChange(li, 'title', e.target.value)} placeholder="Lesson title" className={inter.className} style={{ ...lessonInput }} />
            </div>
            <div style={{ flex: '1 1 100px', minWidth: 0 }}>
              <input value={lesson.videoId} onChange={(e) => onLessonChange(li, 'videoId', e.target.value)} placeholder="YouTube ID" className={inter.className} style={{ ...lessonInput }} />
            </div>
            <div style={{ flex: '0 1 80px', minWidth: 0 }}>
              <input value={lesson.duration} onChange={(e) => onLessonChange(li, 'duration', e.target.value)} placeholder="12:30" className={inter.className} style={{ ...lessonInput }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, paddingTop: 4 }}>
              <button type="button" onClick={() => onLessonChange(li, 'isPreview', !lesson.isPreview)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {lesson.isPreview ? <ToggleRight size={20} color="#22d3ee" /> : <ToggleLeft size={20} color="#52525b" />}
              </button>
              <span className={inter.className} style={{ color: lesson.isPreview ? '#22d3ee' : '#52525b', fontSize: '0.6875rem', fontWeight: 500 }}>Preview</span>
              <button type="button" onClick={() => onLessonMove(li, -1)} disabled={li === 0} style={{ ...iconBtn, opacity: li === 0 ? 0.3 : 1 }}><ChevronUp size={12} color="#a1a1aa" /></button>
              <button type="button" onClick={() => onLessonMove(li, 1)} disabled={li === section.lessons.length - 1} style={{ ...iconBtn, opacity: li === section.lessons.length - 1 ? 0.3 : 1 }}><ChevronDown size={12} color="#a1a1aa" /></button>
              <button type="button" onClick={() => onLessonDelete(li)} style={{ ...iconBtn, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}><Trash2 size={12} color="#f87171" /></button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddLesson}
          className={sg.className}
          style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 7, color: '#71717a', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={13} /> Add Lesson
        </button>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' };
const lessonInput: React.CSSProperties = { width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box' };
const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px', marginBottom: 20 };
const sectionTitle: React.CSSProperties = { color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', marginBottom: 20 };

/* ─── Main Component ─── */
export default function CourseForm({ initial, mode }: { initial?: CourseFormInitial; mode: 'create' | 'edit' }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [slugManual, setSlugManual] = useState(!!initial?.slug);

  const [form, setForm] = useState<FormData>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    shortDescription: initial?.shortDescription ?? '',
    longDescription: initial?.longDescription ?? '',
    category: initial?.category ?? '',
    level: initial?.level ?? 'beginner',
    price: initial?.price ?? 0,
    isFree: initial?.isFree ?? false,
    isPublished: initial?.isPublished ?? false,
    previewVideoId: initial?.previewVideoId ?? '',
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initial?.thumbnail ?? null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [curriculum, setCurriculum] = useState<BuilderSection[]>(initial?.curriculum ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const setField = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitleChange = (val: string) => {
    setField('title', val);
    if (!slugManual) setField('slug', slugify(val));
  };

  const handleFile = (file: File) => {
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  /* Curriculum mutations */
  const addSection = () => setCurriculum((p) => [...p, { sectionTitle: '', lessons: [] }]);
  const deleteSection = (si: number) => setCurriculum((p) => p.filter((_, i) => i !== si));
  const moveSection = (si: number, dir: -1 | 1) => {
    setCurriculum((p) => {
      const a = [...p];
      const tmp = a[si]; a[si] = a[si + dir]; a[si + dir] = tmp;
      return a;
    });
  };
  const updateSectionTitle = (si: number, v: string) => setCurriculum((p) => p.map((s, i) => i === si ? { ...s, sectionTitle: v } : s));
  const addLesson = (si: number) => setCurriculum((p) => p.map((s, i) => i === si ? { ...s, lessons: [...s.lessons, { _id: uid(), title: '', videoId: '', duration: '', isPreview: false }] } : s));
  const deleteLesson = (si: number, li: number) => setCurriculum((p) => p.map((s, i) => i === si ? { ...s, lessons: s.lessons.filter((_, j) => j !== li) } : s));
  const moveLesson = (si: number, li: number, dir: -1 | 1) => setCurriculum((p) => p.map((s, i) => {
    if (i !== si) return s;
    const a = [...s.lessons]; const tmp = a[li]; a[li] = a[li + dir]; a[li + dir] = tmp;
    return { ...s, lessons: a };
  }));
  const updateLesson = (si: number, li: number, field: keyof BuilderLesson, value: string | boolean) => setCurriculum((p) => p.map((s, i) => i !== si ? s : { ...s, lessons: s.lessons.map((l, j) => j === li ? { ...l, [field]: value } : l) }));

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required'); return; }

    setSubmitting(true);
    try {
      let thumbnailUrl = thumbnailPreview?.startsWith('blob:') ? '' : (thumbnailPreview ?? '');

      // Upload thumbnail if new file selected
      if (thumbnailFile) {
        const fd = new FormData();
        fd.append('file', thumbnailFile);
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error ?? 'Thumbnail upload failed');
        thumbnailUrl = upData.url;
      }

      const payload = {
        ...form,
        price: form.isFree ? 0 : Number(form.price),
        thumbnail: thumbnailUrl || undefined,
        curriculum,
      };

      const url = mode === 'create' ? '/api/admin/courses' : `/api/admin/courses/${initial!._id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save course');

      toast.success(mode === 'create' ? 'Course created!' : 'Course updated!');
      router.push('/admin/courses');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }, [form, thumbnailFile, thumbnailPreview, curriculum, mode, initial, router]);

  return (
    <div style={{ padding: '36px 32px', maxWidth: 860 }} className="admin-content">
      <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', marginBottom: 32 }}>
        {mode === 'create' ? 'Create Course' : 'Edit Course'}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* ── Section A: Basic Info ── */}
        <div style={card}>
          <p className={sg.className} style={sectionTitle}>Basic Information</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={handleTitleChange} placeholder="Complete MERN Stack + React Native" />
            </div>
            <div>
              <Label>Slug (URL) *</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input value={form.slug} onChange={(v) => { setField('slug', v); setSlugManual(true); }} placeholder="complete-mern-stack" />
                <button type="button" onClick={() => { setField('slug', slugify(form.title)); setSlugManual(false); }} className={inter.className} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#71717a', fontSize: '0.8125rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>Auto</button>
              </div>
              <p className={inter.className} style={{ color: '#3f3f46', fontSize: '0.75rem', marginTop: 4 }}>Preview: /courses/{form.slug || '…'}</p>
            </div>
            <div>
              <Label>Short Description <span style={{ color: '#3f3f46' }}>({form.shortDescription.length}/160)</span></Label>
              <textarea value={form.shortDescription} onChange={(e) => setField('shortDescription', e.target.value)} maxLength={160} rows={2} placeholder="A brief one-liner about the course…" className={inter.className}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: '0.9375rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div>
              <Label>Long Description (HTML)</Label>
              <textarea value={form.longDescription} onChange={(e) => setField('longDescription', e.target.value)} rows={6} placeholder="<p>Full course description...</p>" className={inter.className}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(v) => setField('category', v)} placeholder="Web Development" />
              </div>
              <div>
                <Label>Level</Label>
                <select value={form.level} onChange={(e) => setField('level', e.target.value)} className={inter.className}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
              <div>
                <Label>Price (BDT)</Label>
                <Input value={form.isFree ? 0 : form.price} onChange={(v) => setField('price', parseFloat(v) || 0)} type="number" placeholder="2499" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Toggle checked={form.isFree} onChange={(v) => setField('isFree', v)} label="Free Course" />
                <Toggle checked={form.isPublished} onChange={(v) => setField('isPublished', v)} label="Published" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section B: Media ── */}
        <div style={card}>
          <p className={sg.className} style={sectionTitle}>Media</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="media-grid">
            {/* Thumbnail */}
            <div>
              <Label>Thumbnail</Label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                style={{
                  height: 160, borderRadius: 10, border: `2px dashed ${dragging ? '#6366f1' : 'rgba(255,255,255,0.12)'}`,
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
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {thumbnailPreview && (
                <button type="button" onClick={() => { setThumbnailPreview(null); setThumbnailFile(null); }} className={inter.className} style={{ marginTop: 6, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
              )}
            </div>

            {/* Preview Video */}
            <div>
              <Label>Preview Video ID (YouTube)</Label>
              <Input value={form.previewVideoId} onChange={(v) => setField('previewVideoId', v)} placeholder="dQw4w9WgXcQ" />
              {form.previewVideoId && (
                <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                  <iframe src={`https://www.youtube.com/embed/${form.previewVideoId}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} frameBorder="0" allowFullScreen title="Preview" />
                </div>
              )}
              {!form.previewVideoId && (
                <div style={{ marginTop: 10, height: 90, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Play size={18} color="#3f3f46" />
                  <span className={inter.className} style={{ color: '#3f3f46', fontSize: '0.8125rem' }}>Enter Video ID to preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section C: Curriculum ── */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p className={sg.className} style={{ ...sectionTitle, margin: 0 }}>Curriculum</p>
            <button type="button" onClick={addSection} className={sg.className}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, color: '#a5b4fc', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>
              <Plus size={13} /> Add Section
            </button>
          </div>

          {curriculum.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 10 }}>
              <p className={inter.className} style={{ color: '#52525b', fontSize: '0.875rem' }}>No sections yet. Click &ldquo;Add Section&rdquo; to start building your curriculum.</p>
            </div>
          )}

          {curriculum.map((section, si) => (
            <SectionCard
              key={si}
              section={section}
              si={si}
              total={curriculum.length}
              onMove={(dir) => moveSection(si, dir)}
              onDelete={() => deleteSection(si)}
              onTitleChange={(v) => updateSectionTitle(si, v)}
              onAddLesson={() => addLesson(si)}
              onLessonChange={(li, field, value) => updateLesson(si, li, field, value)}
              onLessonDelete={(li) => deleteLesson(si, li)}
              onLessonMove={(li, dir) => moveLesson(si, li, dir)}
            />
          ))}
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.push('/admin/courses')} className={inter.className}
            style={{ padding: '11px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: '#71717a', fontWeight: 500, cursor: 'pointer', fontSize: '0.9375rem' }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={sg.className}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: submitting ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 9, color: 'white', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.9375rem', fontFamily: 'inherit' }}>
            <Save size={16} />
            {submitting ? 'Saving…' : 'Save Course'}
          </button>
        </div>
      </form>

      <style>{`
        @media (max-width: 640px) {
          .admin-content { padding: 20px 16px !important; }
          .media-grid { grid-template-columns: 1fr !important; }
        }
        .thumb-overlay:hover { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
