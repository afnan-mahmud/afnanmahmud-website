'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, BookOpen, Users, UserX, ShoppingCart, Wallet, LogOut, X, ShieldCheck, RotateCcw,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { Space_Grotesk } from 'next/font/google';
import { visibleNav, type Access } from '@/lib/permissions';

const sg = Space_Grotesk({ subsets: ['latin'] });

/** Icon per nav href — the nav list itself lives in lib/permissions. */
const ICONS: Record<string, LucideIcon> = {
  '/admin': LayoutDashboard,
  '/admin/courses': BookOpen,
  '/admin/students': Users,
  '/admin/abandoned-students': UserX,
  '/admin/orders': ShoppingCart,
  '/admin/refunds': RotateCcw,
  '/admin/accounts': Wallet,
  '/admin/whatsapp': MessageCircle,
  '/admin/users': ShieldCheck,
};

interface AdminSidebarProps {
  access: Access;
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ access, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const NAV = visibleNav(access);
  const canSeeWhatsApp = NAV.some((item) => item.href === '/admin/whatsapp');

  // Poll the WhatsApp unread count for the sidebar badge (only if visible).
  const [waUnread, setWaUnread] = useState(0);
  useEffect(() => {
    if (!canSeeWhatsApp) return;
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/whatsapp/unread-count');
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setWaUnread(data.count ?? 0);
      } catch {
        /* ignore transient errors */
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [canSeeWhatsApp]);

  const content = (
    <div
      style={{
        width: 240,
        minHeight: '100vh',
        background: '#111111',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/admin" className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', letterSpacing: '-0.01em' }}>
          Dev<span style={{ color: '#6366f1' }}>Courses</span>
          <span style={{ marginLeft: 6, padding: '2px 7px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 4, color: '#a5b4fc', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', verticalAlign: 'middle' }}>
            ADMIN
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 2 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px', flex: 1 }}>
        <p className={sg.className} style={{ color: '#3f3f46', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>
          Navigation
        </p>
        {NAV.map(({ href, label, exact }) => {
          const Icon = ICONS[href] ?? LayoutDashboard;
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, marginBottom: 2,
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                textDecoration: 'none', transition: 'background 0.15s',
              }}
            >
              <Icon size={16} color={isActive ? '#6366f1' : '#52525b'} />
              <span className={sg.className} style={{ color: isActive ? '#a5b4fc' : '#71717a', fontWeight: isActive ? 600 : 500, fontSize: '0.875rem', flex: 1 }}>
                {label}
              </span>
              {href === '/admin/whatsapp' && waUnread > 0 && (
                <span className={sg.className} style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: '#22c55e', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {waUnread > 99 ? '99+' : waUnread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, width: '100%', background: 'none', border: '1px solid transparent', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          <LogOut size={16} color="#ef4444" />
          <span className={sg.className} style={{ color: '#ef4444', fontWeight: 500, fontSize: '0.875rem' }}>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="admin-sidebar-desktop">{content}</div>
      {open && (
        <div className="admin-sidebar-mobile" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}>{content}</div>
        </div>
      )}
      <style>{`
        @media (min-width: 768px) { .admin-sidebar-desktop { display: block !important; } .admin-sidebar-mobile { display: none !important; } }
        @media (max-width: 767px) { .admin-sidebar-desktop { display: none !important; } }
      `}</style>
    </>
  );
}
