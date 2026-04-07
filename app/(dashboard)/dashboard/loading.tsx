export default function DashboardLoading() {
  return (
    <div style={{ padding: '36px 32px', maxWidth: 1100 }}>
      {/* Welcome skeleton */}
      <div className="animate-pulse" style={{ marginBottom: 32 }}>
        <div style={{ height: 32, width: 280, background: 'rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 8 }} />
        <div style={{ height: 16, width: 200, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
      </div>
      {/* Stat cards skeleton */}
      <div className="animate-pulse" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }} />
        ))}
      </div>
      {/* Courses grid skeleton */}
      <div style={{ height: 22, width: 160, background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 20 }} className="animate-pulse" />
      <div className="animate-pulse" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 150, background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ padding: '16px' }}>
              <div style={{ height: 18, background: 'rgba(255,255,255,0.07)', borderRadius: 6, marginBottom: 10 }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 6, width: '60%', marginBottom: 14 }} />
              <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 100, marginBottom: 8 }} />
              <div style={{ height: 36, background: 'rgba(99,102,241,0.1)', borderRadius: 8, marginTop: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
