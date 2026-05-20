import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Briefcase, Filter, Star } from 'lucide-react';

const TABS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/tools/portfolio-performance', label: 'Tools', icon: Wrench },
  { path: '/lazy-portfolios', label: 'Portfolios', icon: Briefcase },
  { path: '/screener', label: 'Screener', icon: Filter },
  { path: '/watchlist', label: 'Watchlist', icon: Star },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#131929',
        borderTop: '1px solid #1e2d45',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      className="flex md:hidden"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        // Tools: match any /tools/* route
        const isActive =
          tab.path === '/'
            ? location.pathname === '/'
            : tab.path.startsWith('/tools')
            ? location.pathname.startsWith('/tools')
            : location.pathname === tab.path;

        return (
          <Link
            key={tab.path}
            to={tab.path}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: isActive ? '#3b82f6' : '#64748b',
              transition: 'color 0.15s',
              position: 'relative',
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '2px',
                  borderRadius: '0 0 2px 2px',
                  background: '#3b82f6',
                }}
              />
            )}
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
