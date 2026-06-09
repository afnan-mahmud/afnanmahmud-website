'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface Category {
  _id: string;
  name: string;
  subcategories: string[];
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

export default function ExpenseButton({ categories: initialCategories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [showNewSub, setShowNewSub] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const selectedCategory = categories.find((c) => c._id === categoryId);

  function reset() {
    setCategoryId(''); setSubcategory(''); setAmount(''); setNote('');
    setNewCatName(''); setShowNewCat(false); setNewSubName(''); setShowNewSub(false);
    setError('');
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function createCategory() {
    const name = newCatName.trim();
    if (!name) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/admin/expense-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');
      setCategories((prev) => (prev.some((c) => c._id === data._id) ? prev : [...prev, data].sort((a, b) => a.name.localeCompare(b.name))));
      setCategoryId(data._id);
      setSubcategory('');
      setNewCatName(''); setShowNewCat(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create category');
    } finally {
      setBusy(false);
    }
  }

  async function createSubcategory() {
    const name = newSubName.trim();
    if (!name || !categoryId) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/admin/expense-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subcategory', categoryId, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create sub-category');
      setCategories((prev) => prev.map((c) => (c._id === data._id ? data : c)));
      setSubcategory(name);
      setNewSubName(''); setShowNewSub(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create sub-category');
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setError('');
    if (!selectedCategory) { setError('Please select a category'); return; }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { setError('Enter a valid amount greater than 0'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.name,
          subcategory: subcategory || undefined,
          amount: amt,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add expense');
      close();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add expense');
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
        <Plus size={16} /> Expense
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
              <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.0625rem', margin: 0 }}>Add Expense</h2>
              <button onClick={close} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 2 }}><X size={18} /></button>
            </div>

            <div style={{ padding: 20 }}>
              {/* Category */}
              <div style={{ marginBottom: 18 }}>
                <label className={inter.className} style={labelStyle}>Category</label>
                {!showNewCat ? (
                  <>
                    <select
                      value={categoryId}
                      onChange={(e) => { setCategoryId(e.target.value); setSubcategory(''); setShowNewSub(false); }}
                      className={inter.className}
                      style={fieldStyle}
                    >
                      <option value="">Select a category…</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    <button onClick={() => setShowNewCat(true)} className={inter.className} style={{ marginTop: 8, background: 'none', border: 'none', color: '#818cf8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>+ Create new category</button>
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New category name" className={inter.className} style={fieldStyle} autoFocus />
                    <button onClick={createCategory} disabled={busy} className={sg.className} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '0 14px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Add</button>
                    <button onClick={() => { setShowNewCat(false); setNewCatName(''); }} className={inter.className} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#a1a1aa', padding: '0 12px', fontSize: '0.8125rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                )}
              </div>

              {/* Sub-category (optional) */}
              {selectedCategory && (
                <div style={{ marginBottom: 18 }}>
                  <label className={inter.className} style={labelStyle}>Sub-category <span style={{ textTransform: 'none', color: '#52525b', fontWeight: 400 }}>(optional)</span></label>
                  {!showNewSub ? (
                    <>
                      <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className={inter.className} style={fieldStyle}>
                        <option value="">None</option>
                        {selectedCategory.subcategories.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button onClick={() => setShowNewSub(true)} className={inter.className} style={{ marginTop: 8, background: 'none', border: 'none', color: '#818cf8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>+ Create new sub-category</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="New sub-category name" className={inter.className} style={fieldStyle} autoFocus />
                      <button onClick={createSubcategory} disabled={busy} className={sg.className} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '0 14px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Add</button>
                      <button onClick={() => { setShowNewSub(false); setNewSubName(''); }} className={inter.className} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#a1a1aa', padding: '0 12px', fontSize: '0.8125rem', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  )}
                </div>
              )}

              {/* Amount */}
              {selectedCategory && (
                <div style={{ marginBottom: 18 }}>
                  <label className={inter.className} style={labelStyle}>Amount (৳)</label>
                  <input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inter.className} style={fieldStyle} />
                </div>
              )}

              {/* Note */}
              {selectedCategory && (
                <div style={{ marginBottom: 18 }}>
                  <label className={inter.className} style={labelStyle}>Note <span style={{ textTransform: 'none', color: '#52525b', fontWeight: 400 }}>(optional)</span></label>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was this for?" className={inter.className} style={fieldStyle} />
                </div>
              )}

              {error && <p className={inter.className} style={{ color: '#f87171', fontSize: '0.8125rem', margin: '0 0 14px' }}>{error}</p>}

              <button
                onClick={submit}
                disabled={busy || !selectedCategory}
                className={sg.className}
                style={{
                  width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: !selectedCategory ? 'rgba(99,102,241,0.4)' : '#6366f1', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '11px', fontSize: '0.9375rem', fontWeight: 700,
                  cursor: busy || !selectedCategory ? 'not-allowed' : 'pointer',
                }}
              >
                {busy && <Loader2 size={16} className="spin" />} Save Expense
              </button>
            </div>
          </div>
          <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </>
  );
}
