import { Menu, Search, Moon, Sun, IndianRupee } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useEffect, useRef, useState } from 'react';

export default function TopBar() {
  const { toggleSidebar, toggleTheme, theme } = useUIStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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

      {/* Right: Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{
            background: 'transparent',
            border: '1px solid #1e2d45',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '7px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = '#1a2235';
            btn.style.color = '#f1f5f9';
            btn.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.borderColor = '#1e2d45';
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
