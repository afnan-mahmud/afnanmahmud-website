'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Menu } from 'lucide-react';
import { Space_Grotesk } from 'next/font/google';
import type { Access } from '@/lib/permissions';

const sg = Space_Grotesk({ subsets: ['latin'] });

/**
 * Client shell for the admin portal: holds the mobile-sidebar toggle and renders
 * the (permission-filtered) sidebar around the page content. Access is resolved
 * server-side in the layout and passed down — never trusted from the client.
 */
export default function AdminShell({ access, children }: { access: Access; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <AdminSidebar access={access} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          className="admin-mobile-header"
          style={{
            display: 'none', alignItems: 'center', gap: 12, padding: '14px 20px',
            background: 'rgba(17,17,17,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 40,
          }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 2 }}>
            <Menu size={22} />
          </button>
          <span className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem' }}>
            Dev<span style={{ color: '#6366f1' }}>Courses</span> Admin
          </span>
        </header>
        <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
      </div>
      <style>{`@media (max-width: 767px) { .admin-mobile-header { display: flex !important; } }`}</style>
    </div>
  );
}
