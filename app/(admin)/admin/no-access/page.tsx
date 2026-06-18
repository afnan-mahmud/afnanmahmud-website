import { Lock } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export default function NoAccessPage() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Lock size={24} color="#6366f1" />
      </div>
      <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.4rem', margin: '0 0 8px' }}>No sections assigned</h1>
      <p className={inter.className} style={{ color: '#71717a', fontSize: '0.9rem', maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
        Apnar account-e ekhono kono section-er access deya hoyni. Owner-ke bolun apnake proyojonio permission dite.
      </p>
    </div>
  );
}
