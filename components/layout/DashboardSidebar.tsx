'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { BookOpen, User, LogOut, LayoutDashboard, X } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/my-courses', label: 'My Courses', icon: BookOpen },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const name = session?.user?.name ?? 'Student';
  const role = (session?.user as { role?: string })?.role ?? 'student';
  const avatar = (session?.user as { image?: string })?.image;
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const content = (
    <div
      style={{
        width: '260px',
        height: '100vh',
        background: 'rgba(255,255,255,0.025)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Link
            href="/"
            className={sg.className}
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#f1f5f9',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            Dev<span style={{ color: '#6366f1' }}>Courses</span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="sidebar-close"
              style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: '2px' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: avatar ? `url(${avatar}) center/cover` : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem',
              fontFamily: sg.style.fontFamily,
              flexShrink: 0,
            }}
          >
            {!avatar && initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              className={sg.className}
              style={{
                color: '#f1f5f9',
                fontWeight: 600,
                fontSize: '0.875rem',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </p>
            <p
              className={inter.className}
              style={{ color: '#52525b', fontSize: '0.75rem', margin: 0 }}
            >
              {role === 'admin' ? 'Admin' : 'Student'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <p
          className={sg.className}
          style={{
            color: '#3f3f46',
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0 8px',
            marginBottom: '8px',
          }}
        >
          Menu
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '2px',
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <Icon size={16} color={isActive ? '#6366f1' : '#52525b'} />
              <span
                className={sg.className}
                style={{
                  color: isActive ? '#a5b4fc' : '#71717a',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            width: '100%',
            background: 'none',
            border: '1px solid transparent',
            cursor: 'pointer',
            transition: 'background 0.15s',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          <LogOut size={16} color="#ef4444" />
          <span className={sg.className} style={{ color: '#ef4444', fontWeight: 500, fontSize: '0.875rem' }}>
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="dash-sidebar-desktop">{content}</div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="dash-sidebar-mobile"
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}
        >
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}>{content}</div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .dash-sidebar-desktop { display: block !important; }
          .dash-sidebar-mobile { display: none !important; }
          .sidebar-close { display: none !important; }
        }
        @media (max-width: 767px) {
          .dash-sidebar-desktop { display: none !important; }
        }
      `}</style>
    </>
  );
}
