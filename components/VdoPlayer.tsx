'use client';

import { useEffect, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

/**
 * Renders a DRM-protected VdoCipher video. Fetches a short-lived OTP from
 * `/api/video/otp` (which enforces ownership and burns the buyer's phone number
 * into a moving watermark), then loads the VdoCipher iframe player.
 *
 * Fills its nearest positioned ancestor (position: absolute; inset: 0), so the
 * parent owns the 16:9 sizing — same container the YouTube iframe used before.
 */
export default function VdoPlayer({ videoId, title }: { videoId: string; title?: string }) {
  // Keyed by videoId so a stale result for a previous video is ignored and the
  // component shows "loading" again when videoId changes — without resetting
  // state synchronously inside the effect body.
  const [result, setResult] = useState<
    | { id: string; otp: string; playbackInfo: string }
    | { id: string; error: true }
    | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/video/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data: { otp: string; playbackInfo: string }) => {
        if (!cancelled) setResult({ id: videoId, otp: data.otp, playbackInfo: data.playbackInfo });
      })
      .catch(() => {
        if (!cancelled) setResult({ id: videoId, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const current = result?.id === videoId ? result : null;
  const state = !current
    ? ({ status: 'loading' } as const)
    : 'otp' in current
      ? ({ status: 'ready', otp: current.otp, playbackInfo: current.playbackInfo } as const)
      : ({ status: 'error' } as const);

  const fill: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    color: '#3f3f46',
    background: 'rgba(255,255,255,0.02)',
  };

  if (state.status === 'loading') {
    return (
      <div style={fill}>
        <Loader2 size={28} color="#6366f1" style={{ animation: 'vdo-spin 1s linear infinite' }} />
        <style>{`@keyframes vdo-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div style={fill}>
        <Play size={40} />
        <p style={{ fontSize: '0.875rem', margin: 0 }}>Video could not be loaded</p>
      </div>
    );
  }

  return (
    <iframe
      src={`https://player.vdocipher.com/v2/?otp=${encodeURIComponent(
        state.otp
      )}&playbackInfo=${encodeURIComponent(state.playbackInfo)}`}
      title={title ?? 'Lesson video'}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      allow="encrypted-media; fullscreen"
      allowFullScreen
    />
  );
}
