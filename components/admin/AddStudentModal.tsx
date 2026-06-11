'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, X, Loader2 } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export interface CourseOption {
  _id: string;
  title: string;
  price: number;
}

const labelStyle: React.CSSProperties = {
  color: '#a1a1aa', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em',
  textTransform: 'uppercase', marginBottom: 8, display: 'block',
};
const fieldStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: '#e2e8f0', padding: '10px 12px', fontSize: '0.875rem', colorScheme: 'dark',
  boxSizing: 'border-box',
};

export default function AddStudentModal({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [courseId, setCourseId] = useState('');
  const [amount, setAmount] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setName(''); setPhone(''); setCourseId(''); setAmount(''); setError('');
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function submit() {
    setError('');
    if (!name.trim()) { setError('Name din'); return; }
    const normalised = phone.replace(/[\s\-]/g, '').replace(/^\+?880/, '0');
    if (!/^01[3-9]\d{8}$/.test(normalised)) { setError('Sothik phone number din (01XXXXXXXXX)'); return; }
    if (!courseId) { setError('Course select korun'); return; }
    const amt = Number(amount === '' ? 0 : amount);
    if (!Number.isFinite(amt) || amt < 0) { setError('Sothik amount din (0 ba beshi)'); return; }

    setBusy(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: normalised, courseId, amount: amt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add student');
      close();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add student');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={sg.className}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, background: '#6366f1', color: '#fff',
          border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
        }}
      >
        <UserPlus size={16} /> Add Student
      </button>

      {open && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 460, background: '#121214', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.0625rem', margin: 0 }}>Add Student</h2>
              <button onClick={close} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 2 }}><X size={18} /></button>
            </div>

            <div style={{ padding: 20 }}>
              {/* Name */}
              <div style={{ marginBottom: 18 }}>
                <label className={inter.className} style={labelStyle}>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student er nam" className={inter.className} style={fieldStyle} autoFocus />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 18 }}>
                <label className={inter.className} style={labelStyle}>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric" className={inter.className} style={fieldStyle} />
              </div>

              {/* Course */}
              <div style={{ marginBottom: 18 }}>
                <label className={inter.className} style={labelStyle}>Course</label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inter.className} style={fieldStyle}>
                  <option value="">Select a course…</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 18 }}>
                <label className={inter.className} style={labelStyle}>Amount (৳) <span style={{ textTransform: 'none', color: '#52525b', fontWeight: 400 }}>(0 = free)</span></label>
                <input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inter.className} style={fieldStyle} />
                <p className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem', margin: '8px 0 0' }}>Amount &gt; 0 hole accounts ledger e credit hisebe jabe. Free hole 0 din.</p>
              </div>

              {error && <p className={inter.className} style={{ color: '#f87171', fontSize: '0.8125rem', margin: '0 0 14px' }}>{error}</p>}

              <button
                onClick={submit}
                disabled={busy}
                className={sg.className}
                style={{
                  width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#6366f1', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '11px', fontSize: '0.9375rem', fontWeight: 700,
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                {busy && <Loader2 size={16} className="spin" />} Enroll Student
              </button>
            </div>
          </div>
          <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </>
  );
}
