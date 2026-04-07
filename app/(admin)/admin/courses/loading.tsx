export default function AdminCoursesLoading() {
  return (
    <div style={{ padding: '36px 32px', maxWidth: 1100 }} className="animate-pulse">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ height: 32, width: 120, background: 'rgba(255,255,255,0.08)', borderRadius: 8 }} />
        <div style={{ height: 38, width: 170, background: 'rgba(99,102,241,0.15)', borderRadius: 9 }} />
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ height: 40, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 16px', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ width: 56, height: 40, background: 'rgba(255,255,255,0.06)', borderRadius: 6, flexShrink: 0 }} />
            <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,0.07)', borderRadius: 5 }} />
            <div style={{ width: 60, height: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 5 }} />
            <div style={{ width: 80, height: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 100 }} />
            <div style={{ width: 44, height: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 32, height: 32, background: 'rgba(99,102,241,0.1)', borderRadius: 7 }} />
              <div style={{ width: 32, height: 32, background: 'rgba(239,68,68,0.08)', borderRadius: 7 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
