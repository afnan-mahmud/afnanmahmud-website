'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Section jump-bar that sits directly under the hero and takes over the top of
 * the viewport once the hero scrolls past — at which point the Navbar hides, so
 * only one bar is ever pinned. `onStuckChange` reports that transition upward.
 *
 * The caller passes `sectionIds` already ordered to match the page, so render
 * order lives in LightSegmentLanding alone — deriving it here too would let the
 * two drift apart. Ids with no entry in CHIPS are skipped, which is how
 * non-destination sections (pain points, CTA banners, tools) stay out of the bar.
 */

/** Anchor id → chip label. An id absent here never gets a chip. */
const CHIPS: Record<string, { label: string; emoji: string }> = {
  outcomes: { label: 'যা শিখবেন', emoji: '🎯' },
  audience: { label: 'কোর্সটি যাদের জন্য', emoji: '👥' },
  includes: { label: 'কোর্সে যা পাচ্ছেন', emoji: '🎁' },
  journey: { label: 'কারিকুলাম', emoji: '📚' },
  projects: { label: 'প্রজেক্টসমূহ', emoji: '🚀' },
  instructor: { label: 'ইন্সট্রাক্টর', emoji: '🧑‍🏫' },
  feedback: { label: 'রিভিউ', emoji: '⭐' },
  pricing: { label: 'পেমেন্ট', emoji: '💳' },
  faq: { label: 'FAQ', emoji: '❓' },
};

export function TimelineNav({
  sectionIds,
  onStuckChange,
}: {
  /** Anchor ids in page order. */
  sectionIds: string[];
  onStuckChange?: (stuck: boolean) => void;
}) {
  const chips = sectionIds.flatMap((id) => {
    const chip = CHIPS[id];
    return chip ? [{ id, ...chip }] : [];
  });

  const placeholderRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Pin once the bar's natural position reaches the top of the viewport. The
  // placeholder keeps its height in flow so the page doesn't jump on pin.
  useEffect(() => {
    const el = placeholderRef.current;
    if (!el) return;
    const onScroll = () => {
      const next = el.getBoundingClientRect().top <= 0;
      setStuck((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => { onStuckChange?.(stuck); }, [stuck, onStuckChange]);

  // Active section = the one straddling a probe line just below the pinned bar.
  // (An IntersectionObserver picking the "topmost visible" section gets this
  // wrong: a tall section scrolled above the viewport still intersects and has
  // the smallest top, so it keeps winning over the section actually on screen.)
  const ids = chips.map((c) => c.id).join(',');
  useEffect(() => {
    const onScroll = () => {
      const probe = 100; // px below the viewport top, clear of the pinned bar
      let current: string | null = null;
      for (const id of ids.split(',')) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);

  // Keep the active chip in view while the user scrolls the page. Scroll the
  // strip's own scrollLeft rather than calling scrollIntoView — the latter also
  // scrolls ancestors, which fights the page-level smooth scroll from a jump.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!activeId || !scroller) return;
    const chip = scroller.querySelector<HTMLElement>(`[data-chip="${activeId}"]`);
    if (!chip) return;
    const left = chip.offsetLeft - (scroller.clientWidth - chip.offsetWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [activeId]);

  const jumpTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const bar = (
    <div
      ref={scrollerRef}
      className="no-scrollbar flex items-center gap-2 overflow-x-auto rounded-2xl border border-[rgb(var(--seg-accent)/0.25)] bg-[rgb(var(--seg-accent)/0.06)] p-2"
    >
      {chips.map((c) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            type="button"
            data-chip={c.id}
            onClick={() => jumpTo(c.id)}
            aria-current={active ? 'true' : undefined}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${
              active
                ? 'border-[rgb(var(--seg-accent-2))] bg-white text-[rgb(var(--seg-accent-2))]'
                : 'border-[rgb(var(--seg-accent)/0.35)] bg-white/70 text-[var(--ink-soft)] hover:border-[rgb(var(--seg-accent)/0.7)] hover:text-[var(--ink)]'
            }`}
          >
            <span aria-hidden="true">{c.emoji}</span>
            {c.label}
          </button>
        );
      })}
    </div>
  );

  return (
    // `sticky` rather than `fixed`: this lives inside the landing's
    // `overflow-x-clip` wrapper, and `overflow: clip` makes that wrapper a
    // containing block for fixed descendants (which would pin the bar to the
    // top of the page instead of the viewport). Sticky is unaffected, and it
    // reserves its own space in flow so nothing jumps when it pins.
    <div
      ref={placeholderRef}
      className={`sticky top-0 z-40 transition-colors ${
        stuck ? 'border-b border-[var(--line)] bg-white/90 backdrop-blur' : ''
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-2 sm:px-6">{bar}</div>
    </div>
  );
}
