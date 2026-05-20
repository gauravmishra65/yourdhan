import { useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, sidebarOpen } = useUIStore();

  // Sync theme class on <html>
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }, [theme]);

  // Sidebar widths
  const sidebarWidth = sidebarOpen ? 240 : 64;

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f1a' }}>
      {/* Fixed top bar */}
      <TopBar />

      {/* Fixed sidebar — hidden on mobile, icon-only or full on md+ */}
      <Sidebar />

      {/* Main content — shifts right by sidebar width on md+, no shift on mobile */}
      <main
        style={{
          paddingTop: '56px',
          paddingBottom: '0',
        }}
      >
        {/* Inner wrapper with dynamic left padding based on sidebar state */}
        <div
          style={{
            paddingLeft: `var(--sidebar-offset, 0px)`,
            transition: 'padding-left 0.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Constrain content width */}
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '24px 20px',
              paddingBottom: '80px',   // space for mobile bottom nav
              minHeight: 'calc(100vh - 56px)',
            }}
          >
            {children}
          </div>
        </div>
      </main>

      {/* CSS variable for sidebar offset — controlled by media query + sidebarOpen */}
      <style>{`
        @media (min-width: 768px) {
          :root { --sidebar-offset: ${sidebarWidth}px; }
        }
        @media (max-width: 767px) {
          :root { --sidebar-offset: 0px; }
        }
        @media (min-width: 768px) {
          main > div { padding-bottom: 0 !important; }
        }
      `}</style>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
