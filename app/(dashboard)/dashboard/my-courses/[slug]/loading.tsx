export default function VideoPlayerLoading() {
  return (
    <div className="animate-pulse" style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Curriculum sidebar skeleton */}
      <div style={{ width: '30%', minWidth: 240, maxWidth: 320, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 16px', flexShrink: 0 }}>
        <div style={{ height: 18, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 16 }} />
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ marginBottom: 20 }}>
            <div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 5, marginBottom: 10, width: '80%' }} />
            {[1, 2, 3].map((l) => (
              <div key={l} style={{ height: 40, background: 'rgba(255,255,255,0.04)', borderRadius: 8, marginBottom: 6 }} />
            ))}
          </div>
        ))}
      </div>
      {/* Player area skeleton */}
      <div style={{ flex: 1, padding: '24px', minWidth: 0 }}>
        <div style={{ width: '100%', paddingBottom: '56.25%', background: 'rgba(255,255,255,0.04)', borderRadius: 12, position: 'relative', marginBottom: 24 }} />
        <div style={{ height: 26, background: 'rgba(255,255,255,0.07)', borderRadius: 7, width: '55%', marginBottom: 12 }} />
        <div style={{ height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 5, width: '80%', marginBottom: 8 }} />
        <div style={{ height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 5, width: '60%', marginBottom: 28 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ height: 40, width: 160, background: 'rgba(99,102,241,0.12)', borderRadius: 9 }} />
          <div style={{ height: 40, width: 120, background: 'rgba(255,255,255,0.04)', borderRadius: 9 }} />
        </div>
      </div>
    </div>
  );
}
