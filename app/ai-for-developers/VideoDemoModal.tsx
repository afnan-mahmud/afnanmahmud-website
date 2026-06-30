'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const DEMO_VIDEO_SRC = '/course-demo.mp4';

// Desktop demo: video plays inside a modal opened by the "Watch Demo" button.
// Because it's opened by a click (a user gesture), it plays with sound.
export default function VideoDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (open) {
      video.currentTime = 0;
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm"
      style={{ animation: 'modalFade 0.2s ease' }}
    >
      <div
        className="relative w-full max-w-4xl"
        style={{ animation: 'modalSlideIn 0.22s ease' }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
        <video
          ref={videoRef}
          src={DEMO_VIDEO_SRC}
          className="w-full h-auto rounded-2xl border border-slate-700 neon-border bg-black"
          controls
          playsInline
          preload="auto"
        />
      </div>
    </div>
  );
}
