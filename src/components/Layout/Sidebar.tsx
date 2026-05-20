import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Wrench, Briefcase, Filter, Star, Crown, Info,
  TrendingUp, BarChart2, Shield, GitBranch, Target, Activity,
  BarChart, LineChart, Shuffle, Calculator, Users, UserCheck,
  Globe, Calendar, Newspaper, Bell, ChevronDown, ChevronRight,
  TrendingDown, PieChart, IndianRupee, FolderPlus,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useUIStore } from '../../store/uiStore';
import { usePortfolioStore } from '../../store/portfolioStore';
import CreatePortfolioModal from '../ui/CreatePortfolioModal';
import type { Asset } from '../../types';

interface NavItem {
  path?: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: NavItem[];
}

const NAV: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  {
    label: 'Tools', icon: Wrench,
    children: [
      { path: '/tools/portfolio-performance', label: 'Portfolio Performance', icon: TrendingUp },
      { path: '/tools/portfolio-analysis', label: 'Portfolio Analysis', icon: BarChart },
      { path: '/tools/optimization', label: 'Optimization', icon: Target },
      { path: '/tools/drawdown', label: 'Drawdown Analysis', icon: TrendingDown },
      { path: '/tools/risk-analysis', label: 'Risk Analysis', icon: Shield },
      { path: '/tools/correlation', label: 'Correlation Matrix', icon: GitBranch },
      { path: '/tools/factor-analysis', label: 'Factor Analysis', icon: Activity },
      { path: '/tools/rolling-returns', label: 'Rolling Returns', icon: LineChart },
      { path: '/tools/monte-carlo', label: 'Monte Carlo', icon: Shuffle },
      { path: '/tools/efficient-frontier', label: 'Efficient Frontier', icon: PieChart },
    ],
  },
  { path: '/lazy-portfolios', label: 'Lazy Portfolios', icon: Briefcase },
  { path: '/screener', label: 'Asset Screener', icon: Filter },
  { path: '/watchlist', label: 'Watchlist', icon: Star },
  { path: '/dcf', label: 'DCF Calculator', icon: Calculator },
  { path: '/guru', label: 'Gurus', icon: Users },
  { path: '/insider', label: 'Insiders', icon: UserCheck },
  { path: '/market', label: 'Market Data', icon: Globe },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/pricing', label: 'Pricing', icon: Crown },
  { path: '/about', label: 'About', icon: Info },
];

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

function SidebarTooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="absolute left-16 z-50 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium pointer-events-none"
          style={{
            background: '#1a2235',
            border: '1px solid #1e2d45',
            color: '#f1f5f9',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

interface NavLinkProps {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
  onClick?: () => void;
}

function NavLink({ item, collapsed, depth = 0, onClick }: NavLinkProps) {
  const location = useLocation();
  const isActive = item.path ? location.pathname === item.path : false;
  const Icon = item.icon;

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? 0 : '10px',
    padding: collapsed ? '10px 0' : depth > 0 ? '6px 12px 6px 16px' : '9px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    textDecoration: 'none',
    color: isActive ? '#3b82f6' : '#94a3b8',
    background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
    fontSize: depth > 0 ? '12px' : '13px',
    fontWeight: depth > 0 ? 400 : 500,
    justifyContent: collapsed ? 'center' : 'flex-start',
    width: '100%',
    marginLeft: !collapsed && depth > 0 ? '8px' : 0,
    position: 'relative',
  };

  const content = (
    <>
      <Icon size={depth > 0 ? 14 : 16} className={isActive ? 'text-blue-400' : ''} />
      {!collapsed && (
        <span
          style={{
            color: isActive ? '#3b82f6' : '#94a3b8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.label}
        </span>
      )}
      {isActive && !collapsed && (
        <span
          style={{
            position: 'absolute',
            left: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '60%',
            borderRadius: '0 2px 2px 0',
            background: '#3b82f6',
          }}
        />
      )}
    </>
  );

  if (!item.path) return null;

  if (collapsed) {
    return (
      <SidebarTooltip label={item.label}>
        <Link to={item.path} style={baseStyle} onClick={onClick}>
          {content}
        </Link>
      </SidebarTooltip>
    );
  }

  return (
    <Link to={item.path} style={baseStyle} onClick={onClick}>
      {content}
    </Link>
  );
}

interface ExpandableNavProps {
  item: NavItem;
  collapsed: boolean;
}

function ExpandableNav({ item, collapsed }: ExpandableNavProps) {
  const location = useLocation();
  const hasActiveChild = item.children?.some((c) => c.path && location.pathname.startsWith(c.path)) ?? false;
  const [open, setOpen] = useState(hasActiveChild);
  const Icon = item.icon;

  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? 0 : '10px',
    padding: collapsed ? '10px 0' : '9px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    color: hasActiveChild ? '#3b82f6' : '#94a3b8',
    background: hasActiveChild && !open ? 'rgba(59,130,246,0.08)' : 'transparent',
    fontSize: '13px',
    fontWeight: 500,
    userSelect: 'none',
    justifyContent: collapsed ? 'center' : 'flex-start',
  };

  if (collapsed) {
    return (
      <SidebarTooltip label={item.label}>
        <div style={triggerStyle} onClick={() => setOpen((v) => !v)}>
          <Icon size={16} />
        </div>
      </SidebarTooltip>
    );
  }

  return (
    <div>
      <div
        style={triggerStyle}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = '#1a2235';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background =
            hasActiveChild && !open ? 'rgba(59,130,246,0.08)' : 'transparent';
        }}
      >
        <Icon size={16} />
        <span style={{ flex: 1, color: hasActiveChild ? '#3b82f6' : '#94a3b8' }}>{item.label}</span>
        {open ? (
          <ChevronDown size={14} style={{ color: '#64748b' }} />
        ) : (
          <ChevronRight size={14} style={{ color: '#64748b' }} />
        )}
      </div>
      {open && (
        <div
          style={{
            overflow: 'hidden',
            borderLeft: '1px solid #1e2d45',
            marginLeft: '20px',
            paddingLeft: '4px',
            marginBottom: '2px',
          }}
        >
          {item.children?.map((child) => (
            <NavLink key={child.path} item={child} collapsed={false} depth={1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const portfolioStore = usePortfolioStore();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Desktop ≥1280: full (240px), tablet 768-1279: icon-only (64px)
  // Mobile <768: hidden
  const collapsed = !sidebarOpen;

  const handleCreatePortfolio = async (name: string, assets: Asset[]) => {
    portfolioStore.setAssets(assets);
    setShowCreateModal(false);
    const id = await portfolioStore.saveToCloud(name);
    if (id) {
      toast.success(`Portfolio "${name}" saved!`);
    } else {
      toast.success(`Portfolio "${name}" loaded`);
    }
    navigate('/tools/portfolio-performance');
  };

  return (
    <>
      {/* Desktop / Tablet sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: collapsed ? '64px' : '240px',
          background: '#0b0f1a',
          borderRight: '1px solid #1e2d45',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 16px',
            borderBottom: '1px solid #1e2d45',
            flexShrink: 0,
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IndianRupee size={16} color="white" />
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.3px',
              }}
            >
              YourDhan
            </span>
          )}
        </div>

        {/* Create Portfolio CTA */}
        {!collapsed && (
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #1e2d45', flexShrink: 0 }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#60a5fa',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.25))' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))' }}
            >
              <FolderPlus size={14} /> New Portfolio
            </button>
          </div>
        )}
        {collapsed && (
          <div style={{ padding: '6px 4px', borderBottom: '1px solid #1e2d45', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <SidebarTooltip label="New Portfolio">
              <button
                onClick={() => setShowCreateModal(true)}
                style={{ width: '40px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa', cursor: 'pointer' }}
              >
                <FolderPlus size={15} />
              </button>
            </SidebarTooltip>
          </div>
        )}

        {/* Nav items */}
        <nav
          style={{
            flex: 1,
            padding: collapsed ? '8px 4px' : '8px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
          }}
        >
          {NAV.map((item) => {
            if (item.children) {
              return <ExpandableNav key={item.label} item={item} collapsed={collapsed} />;
            }
            if (item.path) {
              return <NavLink key={item.path} item={item} collapsed={collapsed} />;
            }
            return null;
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #1e2d45',
              fontSize: '11px',
              color: '#64748b',
              flexShrink: 0,
            }}
          >
            YourDhan © 2025
          </div>
        )}
      </aside>

      {/* Create Portfolio Modal */}
      {showCreateModal && (
        <CreatePortfolioModal
          onClose={() => setShowCreateModal(false)}
          onApply={handleCreatePortfolio}
        />
      )}
    </>
  );
}
