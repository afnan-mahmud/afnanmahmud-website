'use client';

import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { Plus, BookOpen, Clock, Layers, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { sg, inter, uid } from './fields';
import { curriculumStats, formatDuration } from './duration';
import SectionCard from './SectionCard';
import type { BuilderLesson, BuilderSection } from './types';

export default function CurriculumTab({
  curriculum, setCurriculum,
}: {
  curriculum: BuilderSection[];
  setCurriculum: React.Dispatch<React.SetStateAction<BuilderSection[]>>;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const stats = curriculumStats(curriculum);

  /* Section mutations */
  const addSection = () =>
    setCurriculum((p) => [...p, { _id: uid(), sectionTitle: '', lessons: [] }]);
  const deleteSection = (si: number) =>
    setCurriculum((p) => p.filter((_, i) => i !== si));
  const updateSectionTitle = (si: number, v: string) =>
    setCurriculum((p) => p.map((s, i) => (i === si ? { ...s, sectionTitle: v } : s)));
  const handleSectionDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setCurriculum((p) => {
      const from = p.findIndex((s) => s._id === active.id);
      const to = p.findIndex((s) => s._id === over.id);
      return from < 0 || to < 0 ? p : arrayMove(p, from, to);
    });
  };

  /* Lesson mutations */
  const addLesson = (si: number) =>
    setCurriculum((p) => p.map((s, i) => (i === si
      ? { ...s, lessons: [...s.lessons, { _id: uid(), title: '', videoId: '', duration: '', isPreview: false, note: '' }] }
      : s)));
  const deleteLesson = (si: number, li: number) =>
    setCurriculum((p) => p.map((s, i) => (i === si ? { ...s, lessons: s.lessons.filter((_, j) => j !== li) } : s)));
  const updateLesson = (si: number, li: number, field: keyof BuilderLesson, value: string | boolean) =>
    setCurriculum((p) => p.map((s, i) => (i !== si ? s : { ...s, lessons: s.lessons.map((l, j) => (j === li ? { ...l, [field]: value } : l)) })));
  const reorderLessons = (si: number, lessons: BuilderLesson[]) =>
    setCurriculum((p) => p.map((s, i) => (i === si ? { ...s, lessons } : s)));

  /* Collapse helpers */
  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const collapseAll = () => setCollapsed(new Set(curriculum.map((s) => s._id)));
  const expandAll = () => setCollapsed(new Set());
  const allCollapsed = curriculum.length > 0 && collapsed.size >= curriculum.length;

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, marginBottom: 16 }}>
        {[
          { icon: Layers, label: 'Sections', value: stats.sections },
          { icon: BookOpen, label: 'Lessons', value: stats.lessons },
          { icon: Clock, label: 'Total', value: formatDuration(stats.durationSeconds) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon size={15} color="#6366f1" />
            <span className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.875rem' }}>{value}</span>
            <span className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem' }}>{label}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {curriculum.length > 0 && (
          <button type="button" onClick={allCollapsed ? expandAll : collapseAll} className={inter.className}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: '#a1a1aa', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}>
            {allCollapsed ? <ChevronsUpDown size={14} /> : <ChevronsDownUp size={14} />}
            {allCollapsed ? 'Expand all' : 'Collapse all'}
          </button>
        )}
      </div>

      {/* Sections */}
      {curriculum.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 16 }}>
          <p className={inter.className} style={{ color: '#52525b', fontSize: '0.875rem' }}>No sections yet. Add your first section to start building the curriculum.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={curriculum.map((s) => s._id)} strategy={verticalListSortingStrategy}>
            {curriculum.map((section, si) => (
              <SectionCard
                key={section._id}
                section={section}
                index={si}
                collapsed={collapsed.has(section._id)}
                onToggleCollapse={() => toggleCollapse(section._id)}
                onTitleChange={(v) => updateSectionTitle(si, v)}
                onDelete={() => deleteSection(si)}
                onAddLesson={() => addLesson(si)}
                onLessonChange={(li, field, value) => updateLesson(si, li, field, value)}
                onLessonDelete={(li) => deleteLesson(si, li)}
                onLessonsReorder={(lessons) => reorderLessons(si, lessons)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <button type="button" onClick={addSection} className={sg.className}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, color: '#a5b4fc', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
        <Plus size={14} /> Add Section
      </button>
    </div>
  );
}
