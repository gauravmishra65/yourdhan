import { Menu, Search, Moon, Sun, IndianRupee, LogIn, LogOut, User, ChevronDown } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useRef, useState } from 'react';
import AuthModal from '../ui/AuthModal';

export default function TopBar() {
  const { toggleSidebar, toggleTheme, theme } = useUIStore();
  const { user, signOut } = useAuthStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu,  setShowUserMenu]  = useState(false);
  const searchRef   = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: '#131929',
        borderBottom: '1px solid #1e2d45',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 16px',
        zIndex: 50,
      }}
    >
      {/* Left: Hamburger + Logo (mobile only shows logo) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#1a2235';
            (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
          }}
        >
          <Menu size={20} />
        </button>

        {/* YourDhan logo — shown on mobile only */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          className="flex md:hidden"
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IndianRupee size={14} color="white" />
          </div>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            YourDhan
          </span>
        </div>
      </div>

      {/* Center: Search */}
      <div style={{ flex: 1, maxWidth: '520px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1a2235',
            border: `1px solid ${searchFocused ? '#3b82f6' : '#1e2d45'}`,
            borderRadius: '10px',
            padding: '0 12px',
            height: '36px',
            transition: 'border-color 0.15s',
            boxShadow: searchFocused ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
          }}
        >
          <Search size={14} color={searchFocused ? '#3b82f6' : '#64748b'} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search symbols, portfolios..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f1f5f9',
              fontSize: '13px',
              caretColor: '#3b82f6',
            }}
          />
          <kbd
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: '#131929',
              border: '1px solid #1e2d45',
              borderRadius: '5px',
              padding: '1px 5px',
              fontSize: '10px',
              color: '#64748b',
              fontFamily: 'monospace',
              flexShrink: 0,
              opacity: searchFocused ? 0 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right: Theme Toggle + Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{
            background: 'transparent', border: '1px solid #1e2d45', color: '#94a3b8',
            cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background='#1a2235'; b.style.color='#f1f5f9'; b.style.borderColor='#3b82f6'; }}
          onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background='transparent'; b.style.color='#94a3b8'; b.style.borderColor='#1e2d45'; }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Auth: Sign In button OR User avatar */}
        {!user ? (
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(99,102,241,0.15))',
              border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa',
              fontSize: '12px', fontWeight: 600, padding: '6px 12px',
              borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,rgba(59,130,246,0.25),rgba(99,102,241,0.25))'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,rgba(59,130,246,0.15),rgba(99,102,241,0.15))'}
          >
            <LogIn size={13} /> Sign In
          </button>
        ) : (
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: '#1a2235', border: '1px solid #1e2d45',
                borderRadius: '8px', padding: '5px 10px', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='#3b82f6'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='#1e2d45'}
            >
              {/* Avatar */}
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="avatar"
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '11px',
                  fontWeight: 700, color: 'white',
                  background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                }}>
                  {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: '12px', color: '#cbd5e1', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <ChevronDown size={12} style={{ color: '#64748b', flexShrink: 0 }} />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: '#131929', border: '1px solid #1e2d45', borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: '200px', zIndex: 1000,
                overflow: 'hidden',
              }}>
                {/* User info header */}
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #1e2d45' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                    {user.user_metadata?.full_name || 'Account'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{user.email}</p>
                </div>
                {/* Menu items */}
                <div style={{ padding: '4px' }}>
                  <button
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', borderRadius: '6px', background: 'transparent',
                      border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer',
                      transition: 'background 0.12s, color 0.12s', textAlign: 'left',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#1a2235'; (e.currentTarget as HTMLElement).style.color='#e2e8f0'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='#94a3b8'; }}
                  >
                    <User size={13} /> Profile
                  </button>
                  <button
                    onClick={async () => { setShowUserMenu(false); await signOut(); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', borderRadius: '6px', background: 'transparent',
                      border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer',
                      transition: 'background 0.12s', textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </header>
  );
}
