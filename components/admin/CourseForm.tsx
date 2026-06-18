'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, AlertCircle, FileText, Image as ImageIcon, ListTree, Settings as SettingsIcon } from 'lucide-react';
import { sg, inter, uid } from './course-form/fields';
import DetailsTab from './course-form/DetailsTab';
import MediaTab from './course-form/MediaTab';
import CurriculumTab from './course-form/CurriculumTab';
import SettingsTab from './course-form/SettingsTab';
import { validateForm, countErrors, firstTabWithError } from './course-form/validation';
import type { BuilderSection, BuilderDemoClass, FormData, CourseFormInitial, TabKey } from './course-form/types';

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: 'details', label: 'Details', icon: FileText },
  { key: 'media', label: 'Media', icon: ImageIcon },
  { key: 'curriculum', label: 'Curriculum', icon: ListTree },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

function buildInitialCurriculum(initial?: CourseFormInitial): BuilderSection[] {
  return (initial?.curriculum ?? []).map((s) => ({
    _id: s._id ?? uid(),
    sectionTitle: s.sectionTitle,
    lessons: (s.lessons ?? []).map((l) => ({
      _id: l._id ?? uid(),
      title: l.title,
      videoId: l.videoId ?? '',
      duration: l.duration ?? '',
      isPreview: l.isPreview ?? false,
      note: l.note ?? '',
    })),
  }));
}

function buildInitialDemoClasses(initial?: CourseFormInitial): BuilderDemoClass[] {
  return (initial?.demoClasses ?? []).map((d) => ({
    _id: d._id ?? uid(),
    title: d.title,
    description: d.description ?? '',
    videoId: d.videoId ?? '',
    durationLabel: d.durationLabel ?? '',
  }));
}

export type { CourseFormInitial };

export default function CourseForm({ initial, mode }: { initial?: CourseFormInitial; mode: 'create' | 'edit' }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('details');
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
  const [dragging, setDragging] = useState(false);
  const [curriculum, setCurriculum] = useState<BuilderSection[]>(() => buildInitialCurriculum(initial));
  const [demoClasses, setDemoClasses] = useState<BuilderDemoClass[]>(() => buildInitialDemoClasses(initial));
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) => setForm((f) => ({ ...f, [k]: v })), []);

  /* ── Dirty tracking ── */
  const initialSnapshot = useRef<string>('');
  const savedRef = useRef(false);
  useEffect(() => {
    initialSnapshot.current = JSON.stringify({ form, curriculum, demoClasses, thumbnail: thumbnailPreview });
    // Snapshot the mount-time state only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dirty = useMemo(
    () => !savedRef.current && initialSnapshot.current !== '' &&
      JSON.stringify({ form, curriculum, demoClasses, thumbnail: thumbnailPreview }) !== initialSnapshot.current,
    [form, curriculum, demoClasses, thumbnailPreview]
  );
  const dirtyOrFile = dirty || !!thumbnailFile;

  useEffect(() => {
    if (!dirtyOrFile) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtyOrFile]);

  /* ── Validation ── */
  const errors = useMemo(() => validateForm(form, curriculum), [form, curriculum]);
  const totalErrors = countErrors(errors);

  const handlePickFile = useCallback((file: File) => {
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }, []);

  const handleCancel = () => {
    if (dirtyOrFile && !window.confirm('Discard unsaved changes?')) return;
    router.push('/admin/courses');
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const errs = validateForm(form, curriculum);
    if (countErrors(errs) > 0) {
      const tab = firstTabWithError(errs);
      if (tab) setActiveTab(tab);
      toast.error(`Please fix ${countErrors(errs)} issue${countErrors(errs) > 1 ? 's' : ''} before saving`);
      return;
    }

    setSubmitting(true);
    try {
      let thumbnailUrl = thumbnailPreview?.startsWith('blob:') ? '' : (thumbnailPreview ?? '');
      if (thumbnailFile) {
        const fd = new FormData();
        fd.append('file', thumbnailFile);
        fd.append('folder', 'thumbnails');
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error ?? 'Thumbnail upload failed');
        thumbnailUrl = upData.url;
      }

      const payload = {
        ...form,
        price: form.isFree ? 0 : Number(form.price),
        thumbnail: thumbnailUrl || undefined,
        // Drop client-only section ids; lessons keep their _id.
        curriculum: curriculum.map((s) => ({
          sectionTitle: s.sectionTitle,
          lessons: s.lessons,
        })),
        // Demo classes keep their _id (used as the React + Mongoose subdoc key).
        demoClasses: demoClasses
          .filter((d) => d.title.trim() && d.videoId.trim())
          .map((d) => ({
            _id: d._id,
            title: d.title.trim(),
            description: d.description.trim() || undefined,
            videoId: d.videoId.trim(),
            durationLabel: d.durationLabel.trim() || undefined,
          })),
      };

      const url = mode === 'create' ? '/api/admin/courses' : `/api/admin/courses/${initial!._id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save course');

      savedRef.current = true;
      toast.success(mode === 'create' ? 'Course created!' : 'Course updated!');
      router.push('/admin/courses');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }, [form, thumbnailFile, thumbnailPreview, curriculum, demoClasses, mode, initial, router]);

  return (
    <div style={{ padding: '36px 32px 100px', maxWidth: 1000 }} className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', margin: 0 }}>
          {mode === 'create' ? 'Create Course' : 'Edit Course'}
        </h1>
        <span className={inter.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, color: form.isPublished ? '#4ade80' : '#f59e0b', background: form.isPublished ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${form.isPublished ? 'rgba(74,222,128,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
          {form.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(({ key, label, icon: Icon }) => {
          const errCount = errors[key].length;
          const isActive = activeTab === key;
          return (
            <button key={key} type="button" onClick={() => setActiveTab(key)} className={sg.className}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 18px', background: 'none', border: 'none', borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent', color: isActive ? '#6366f1' : '#71717a', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1 }}>
              <Icon size={15} />
              {label}
              {errCount > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 17, height: 17, padding: '0 5px', borderRadius: 100, background: '#ef4444', color: 'white', fontSize: '0.625rem', fontWeight: 700 }}>
                  {errCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active-tab error banner */}
      {errors[activeTab].length > 0 && (
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 20 }}>
          <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
          <ul className={inter.className} style={{ margin: 0, paddingLeft: 16, color: '#fca5a5', fontSize: '0.8125rem', lineHeight: 1.6 }}>
            {errors[activeTab].map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: activeTab === 'details' ? 'block' : 'none' }}>
          <DetailsTab form={form} setField={setField} slugManual={slugManual} setSlugManual={setSlugManual} thumbnailPreview={thumbnailPreview} />
        </div>
        <div style={{ display: activeTab === 'media' ? 'block' : 'none' }}>
          <MediaTab form={form} setField={setField} thumbnailPreview={thumbnailPreview} onPickFile={handlePickFile} onRemoveThumbnail={() => { setThumbnailPreview(null); setThumbnailFile(null); }} dragging={dragging} setDragging={setDragging} demoClasses={demoClasses} setDemoClasses={setDemoClasses} />
        </div>
        <div style={{ display: activeTab === 'curriculum' ? 'block' : 'none' }}>
          <CurriculumTab curriculum={curriculum} setCurriculum={setCurriculum} />
        </div>
        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          <SettingsTab form={form} setField={setField} />
        </div>
      </form>

      {/* Sticky save bar */}
      <div style={{ position: 'sticky', bottom: 0, marginTop: 32, marginLeft: -32, marginRight: -32, padding: '14px 32px', background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }} className="save-bar">
        <span className={inter.className} style={{ fontSize: '0.8125rem', color: totalErrors > 0 ? '#f87171' : dirtyOrFile ? '#a1a1aa' : '#52525b' }}>
          {totalErrors > 0 ? `${totalErrors} issue${totalErrors > 1 ? 's' : ''} to fix` : dirtyOrFile ? 'Unsaved changes' : 'All changes saved'}
        </span>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={handleCancel} className={inter.className}
          style={{ padding: '10px 22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: '#a1a1aa', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}>
          Cancel
        </button>
        <button type="button" onClick={() => handleSubmit()} disabled={submitting} className={sg.className}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 26px', background: submitting ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 9, color: 'white', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
          <Save size={16} />
          {submitting ? 'Saving…' : 'Save Course'}
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-content { padding: 20px 16px 100px !important; }
          .save-bar { margin-left: -16px !important; margin-right: -16px !important; padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
    </div>
  );
}
