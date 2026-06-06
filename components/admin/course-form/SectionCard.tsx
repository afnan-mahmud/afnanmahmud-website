'use client';

import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { sg, inter } from './fields';
import { sumLessonDurations, formatDuration } from './duration';
import LessonRow from './LessonRow';
import type { BuilderLesson, BuilderSection } from './types';

export default function SectionCard({
  section, index, collapsed, onToggleCollapse,
  onTitleChange, onDelete, onAddLesson, onLessonChange, onLessonDelete, onLessonsReorder,
}: {
  section: BuilderSection;
  index: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onTitleChange: (v: string) => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onLessonChange: (li: number, field: keyof BuilderLesson, value: string | boolean) => void;
  onLessonDelete: (li: number) => void;
  onLessonsReorder: (lessons: BuilderLesson[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section._id });
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const toggleNote = (id: string) =>
    setOpenNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const handleLessonDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = section.lessons.findIndex((l) => l._id === active.id);
    const to = section.lessons.findIndex((l) => l._id === over.id);
    if (from < 0 || to < 0) return;
    onLessonsReorder(arrayMove(section.lessons, from, to));
  };

  const duration = formatDuration(sumLessonDurations(section.lessons));

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(99,102,241,0.06)', borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
        <button type="button" {...attributes} {...listeners} aria-label="Drag section"
          style={{ display: 'flex', cursor: 'grab', background: 'none', border: 'none', padding: 2, touchAction: 'none', flexShrink: 0 }}>
          <GripVertical size={16} color="#71717a" />
        </button>
        <button type="button" onClick={onToggleCollapse} aria-label="Collapse section"
          style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
          {collapsed ? <ChevronRight size={16} color="#a1a1aa" /> : <ChevronDown size={16} color="#a1a1aa" />}
        </button>
        <input
          value={section.sectionTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={`Section ${index + 1} title…`}
          className={sg.className}
          style={{ flex: 1, minWidth: 0, padding: '6px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
        />
        <span className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {section.lessons.length} {section.lessons.length === 1 ? 'lesson' : 'lessons'} · {duration}
        </span>
        <button type="button" onClick={onDelete} title="Delete section"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', flexShrink: 0 }}>
          <Trash2 size={13} color="#f87171" />
        </button>
      </div>

      {/* Lessons */}
      {!collapsed && (
        <div style={{ padding: '12px 16px' }}>
          {section.lessons.length === 0 ? (
            <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', padding: '6px 0 12px' }}>No lessons yet.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
              <SortableContext items={section.lessons.map((l) => l._id)} strategy={verticalListSortingStrategy}>
                {section.lessons.map((lesson, li) => (
                  <LessonRow
                    key={lesson._id}
                    lesson={lesson}
                    index={li}
                    onChange={(field, value) => onLessonChange(li, field, value)}
                    onDelete={() => onLessonDelete(li)}
                    noteOpen={openNotes.has(lesson._id)}
                    onToggleNote={() => toggleNote(lesson._id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
          <button type="button" onClick={onAddLesson} className={sg.className}
            style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 7, color: '#71717a', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={13} /> Add Lesson
          </button>
        </div>
      )}
    </div>
  );
}
