export default function CourseDetailLoading() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '64px' }} className="animate-pulse">
      {/* Hero skeleton */}
      <div style={{ padding: '60px 24px 56px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div style={{ height: 26, width: 100, background: 'rgba(99,102,241,0.12)', borderRadius: 100 }} />
          <div style={{ height: 26, width: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 100 }} />
        </div>
        <div style={{ height: 48, background: 'rgba(255,255,255,0.08)', borderRadius: 10, maxWidth: 700, marginBottom: 16 }} />
        <div style={{ height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 7, maxWidth: 520, marginBottom: 8 }} />
        <div style={{ height: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 7, maxWidth: 380, marginBottom: 28 }} />
        <div style={{ display: 'flex', gap: 24 }}>
          {[80, 70, 80].map((w, i) => (
            <div key={i} style={{ height: 18, width: w, background: 'rgba(255,255,255,0.06)', borderRadius: 5 }} />
          ))}
        </div>
      </div>
      {/* Tabs skeleton */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          {[100, 90, 80].map((w, i) => (
            <div key={i} style={{ height: 38, width: w, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ height: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 5, marginBottom: 12, width: i % 2 === 0 ? '75%' : '90%' }} />
        ))}
        {/* Enroll section skeleton */}
        <div style={{ marginTop: 48, height: 280, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }} />
      </div>
    </div>
  );
}
