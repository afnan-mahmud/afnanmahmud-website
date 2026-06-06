'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ToggleLeft, ToggleRight, FileText } from 'lucide-react';
import { inter } from './fields';
import type { BuilderLesson } from './types';

const lessonInput: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0',
  fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box',
};
const fieldLabel: React.CSSProperties = {
  display: 'block', color: '#52525b', fontSize: '0.625rem', fontWeight: 600,
  letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4,
};
const miniBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
  borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
};

export default function LessonRow({
  lesson, index, onChange, onDelete, noteOpen, onToggleNote,
}: {
  lesson: BuilderLesson;
  index: number;
  onChange: (field: keyof BuilderLesson, value: string | boolean) => void;
  onDelete: () => void;
  noteOpen: boolean;
  onToggleNote: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson._id });
  const hasNote = !!lesson.note?.trim();

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
        padding: '10px 10px 10px 6px',
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {/* Drag handle */}
        <button type="button" {...attributes} {...listeners} aria-label="Drag lesson"
          style={{ ...miniBtn, cursor: 'grab', alignSelf: 'center', touchAction: 'none', background: 'none', border: 'none' }}>
          <GripVertical size={15} color="#52525b" />
        </button>

        <div style={{ flex: '2 1 150px', minWidth: 0 }}>
          <label style={fieldLabel}>Lesson {index + 1} title</label>
          <input value={lesson.title} onChange={(e) => onChange('title', e.target.value)} placeholder="Lesson title" className={inter.className} style={lessonInput} />
        </div>
        <div style={{ flex: '1 1 110px', minWidth: 0 }}>
          <label style={fieldLabel}>YouTube ID</label>
          <input value={lesson.videoId} onChange={(e) => onChange('videoId', e.target.value)} placeholder="dQw4w9WgXcQ" className={inter.className} style={lessonInput} />
        </div>
        <div style={{ flex: '0 1 80px', minWidth: 0 }}>
          <label style={fieldLabel}>Duration</label>
          <input value={lesson.duration} onChange={(e) => onChange('duration', e.target.value)} placeholder="12:30" className={inter.className} style={lessonInput} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button type="button" onClick={() => onChange('isPreview', !lesson.isPreview)} title="Free preview"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {lesson.isPreview ? <ToggleRight size={20} color="#22d3ee" /> : <ToggleLeft size={20} color="#52525b" />}
            <span className={inter.className} style={{ color: lesson.isPreview ? '#22d3ee' : '#52525b', fontSize: '0.5625rem', fontWeight: 600 }}>PREVIEW</span>
          </button>
          <button type="button" onClick={onToggleNote} title="Lesson note (Markdown)"
            style={{ ...miniBtn, position: 'relative', background: (hasNote || noteOpen) ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.05)', border: (hasNote || noteOpen) ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
            <FileText size={13} color={(hasNote || noteOpen) ? '#a5b4fc' : '#a1a1aa'} />
            {hasNote && <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: '#6366f1', border: '1px solid #0a0a0a' }} />}
          </button>
          <button type="button" onClick={onDelete} title="Delete lesson"
            style={{ ...miniBtn, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <Trash2 size={13} color="#f87171" />
          </button>
        </div>
      </div>

      {noteOpen && (
        <div style={{ marginTop: 10, paddingLeft: 36 }}>
          <textarea
            value={lesson.note ?? ''}
            onChange={(e) => onChange('note', e.target.value)}
            rows={4}
            placeholder="Lesson note — Markdown supported (**bold**, lists, [links](url), `code`)…"
            className={inter.className}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#e2e8f0', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: 1.5 }}
          />
          <p className={inter.className} style={{ color: '#3f3f46', fontSize: '0.6875rem', marginTop: 4 }}>
            Markdown supported. Shown to enrolled students below the video.
          </p>
        </div>
      )}
    </div>
  );
}
