'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Space_Grotesk } from 'next/font/google';
import {
  Menu, X, BookOpen, LayoutDashboard, LogOut, LogIn,
  User, GraduationCap, ChevronDown,
} from 'lucide-react';

const sg = Space_Grotesk({ subsets: ['latin'] });

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function Avatar({ name, image }: { name?: string | null; image?: string | null }) {
  if (image) {
    return (
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: `url(${image}) center/cover`, border: '2px solid rgba(99,102,241,0.5)', flexShrink: 0 }} />
    );
  }
  const initials = (name ?? 'U').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(99,102,241,0.5)', flexShrink: 0 }}>
      <span className={sg.className} style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>{initials}</span>
    </div>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const DROPDOWN_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/dashboard/my-courses', label: 'My Courses', icon: GraduationCap },
  ];

  return (
    <nav
      className={sg.className}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'background 0.3s, box-shadow 0.3s',
        background: scrolled ? 'rgba(10,10,10,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={16} color="white" />
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Afnan<span style={{ color: '#6366f1' }}> Mahmud</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: 'rgba(161,161,170,0.9)', fontSize: '0.9375rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s', letterSpacing: '0.01em' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(161,161,170,0.9)')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden-mobile">
          {status === 'loading' ? (
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          ) : session ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '3px 10px 3px 3px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <Avatar name={session.user?.name} image={session.user?.image} />
                <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.user?.name?.split(' ')[0] ?? 'Account'}
                </span>
                <ChevronDown size={14} color="#71717a" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {dropdownOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 200, background: 'rgba(17,17,17,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, backdropFilter: 'blur(20px)', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{session.user?.name}</p>
                    <p style={{ color: '#52525b', fontSize: '0.75rem', margin: 0 }}>{session.user?.role ?? 'Student'}</p>
                  </div>
                  {DROPDOWN_ITEMS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#a1a1aa', textDecoration: 'none', transition: 'background 0.15s', fontSize: '0.875rem' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#f1f5f9'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/' }); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', width: '100%', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.875rem', transition: 'background 0.15s', fontFamily: 'inherit' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/otp"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '8px', color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s, border-color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
            >
              <LogIn size={15} />
              Login
            </Link>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="show-mobile"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '4px' }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* User info if logged in */}
          {session && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 }}>
              <Avatar name={session.user?.name} image={session.user?.image} />
              <div>
                <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9375rem', margin: 0 }}>{session.user?.name}</p>
                <p style={{ color: '#52525b', fontSize: '0.75rem', margin: 0, textTransform: 'capitalize' }}>{session.user?.role ?? 'student'}</p>
              </div>
            </div>
          )}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ color: 'rgba(161,161,170,0.9)', fontSize: '1rem', fontWeight: 500, textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'block' }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '8px', color: 'white', fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#a1a1aa', fontWeight: 500, textDecoration: 'none', fontSize: '0.9375rem' }}
                >
                  <User size={16} /> Profile
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', color: '#f87171', fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem', fontFamily: 'inherit' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/otp"
                onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '12px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '8px', color: '#a5b4fc', fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}
              >
                <LogIn size={16} /> Login
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>
    </nav>
  );
}
