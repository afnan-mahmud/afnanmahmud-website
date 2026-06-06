'use client';

import { Label, Input, Toggle, inter } from './fields';
import type { FormData } from './types';

export default function SettingsTab({
  form, setField,
}: {
  form: FormData;
  setField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 520 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <Label>Category</Label>
          <Input value={form.category} onChange={(v) => setField('category', v)} placeholder="Web Development" />
        </div>
        <div>
          <Label>Level</Label>
          <select value={form.level} onChange={(e) => setField('level', e.target.value)} className={inter.className}
            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <Label>Price (BDT)</Label>
        <Input value={form.isFree ? 0 : form.price} onChange={(v) => setField('price', parseFloat(v) || 0)} type="number" placeholder="2499" invalid={!form.isFree && (!form.price || form.price <= 0)} />
        {form.isFree && <p className={inter.className} style={{ color: '#3f3f46', fontSize: '0.75rem', marginTop: 4 }}>Price is ignored while &ldquo;Free Course&rdquo; is on.</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
        <Toggle checked={form.isFree} onChange={(v) => setField('isFree', v)} label="Free Course" />
        <Toggle checked={form.isPublished} onChange={(v) => setField('isPublished', v)} label="Published (visible to students)" />
      </div>
    </div>
  );
}
