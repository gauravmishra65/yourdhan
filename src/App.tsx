import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import { useUIStore } from './store'

// Lazy-load all pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const LazyPortfoliosPage = lazy(() => import('./pages/LazyPortfoliosPage'))
const ScreenerPage = lazy(() => import('./pages/ScreenerPage'))
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'))
const DCFPage = lazy(() => import('./pages/DCFPage'))
const GuruPage = lazy(() => import('./pages/GuruPage'))
const GuruDetailPage = lazy(() => import('./pages/GuruDetailPage'))
const InsiderPage = lazy(() => import('./pages/InsiderPage'))
const MarketPage = lazy(() => import('./pages/MarketPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const NewsPage = lazy(() => import('./pages/NewsPage'))
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const StockDetailPage = lazy(() => import('./pages/stocks/StockDetailPage'))

// Tool pages
const PortfolioPerformancePage = lazy(() => import('./pages/tools/PortfolioPerformancePage'))
const RiskAnalysisPage = lazy(() => import('./pages/tools/RiskAnalysisPage'))
const CorrelationPage = lazy(() => import('./pages/tools/CorrelationPage'))
const OptimizationPage = lazy(() => import('./pages/tools/OptimizationPage'))
const MonteCarloPage = lazy(() => import('./pages/tools/MonteCarloPage'))
const FactorAnalysisPage = lazy(() => import('./pages/tools/FactorAnalysisPage'))
const DrawdownAnalysisPage = lazy(() => import('./pages/tools/DrawdownAnalysisPage'))
const RollingReturnsPage = lazy(() => import('./pages/tools/RollingReturnsPage'))
const EfficientFrontierPage = lazy(() => import('./pages/tools/EfficientFrontierPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Loading...</span>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-6xl font-bold text-slate-700">404</div>
      <div className="text-xl text-slate-400">Page not found</div>
      <a href="/" className="text-blue-400 hover:text-blue-300 underline">← Back to Home</a>
    </div>
  )
}

function AppContent() {
  const { theme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#131929',
            color: '#f1f5f9',
            border: '1px solid #1e2d45',
            borderRadius: '8px',
          },
        }}
      />
      <Suspense fallback={<Layout><PageLoader /></Layout>}>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/lazy-portfolios" element={<Layout><LazyPortfoliosPage /></Layout>} />
          <Route path="/tools/portfolio-performance" element={<Layout><PortfolioPerformancePage /></Layout>} />
          <Route path="/tools/portfolio-analysis" element={<Layout><PortfolioPerformancePage /></Layout>} />
          <Route path="/tools/risk-analysis" element={<Layout><RiskAnalysisPage /></Layout>} />
          <Route path="/tools/correlation" element={<Layout><CorrelationPage /></Layout>} />
          <Route path="/tools/optimization" element={<Layout><OptimizationPage /></Layout>} />
          <Route path="/tools/monte-carlo" element={<Layout><MonteCarloPage /></Layout>} />
          <Route path="/tools/factor-analysis" element={<Layout><FactorAnalysisPage /></Layout>} />
          <Route path="/tools/drawdown" element={<Layout><DrawdownAnalysisPage /></Layout>} />
          <Route path="/tools/rolling-returns" element={<Layout><RollingReturnsPage /></Layout>} />
          <Route path="/tools/efficient-frontier" element={<Layout><EfficientFrontierPage /></Layout>} />
          <Route path="/screener" element={<Layout><ScreenerPage /></Layout>} />
          <Route path="/watchlist" element={<Layout><WatchlistPage /></Layout>} />
          <Route path="/dcf" element={<Layout><DCFPage /></Layout>} />
          <Route path="/guru" element={<Layout><GuruPage /></Layout>} />
          <Route path="/guru/:slug" element={<Layout><GuruDetailPage /></Layout>} />
          <Route path="/insider" element={<Layout><InsiderPage /></Layout>} />
          <Route path="/market" element={<Layout><MarketPage /></Layout>} />
          <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
          <Route path="/news" element={<Layout><NewsPage /></Layout>} />
          <Route path="/news/:slug" element={<Layout><NewsDetailPage /></Layout>} />
          <Route path="/alerts" element={<Layout><AlertsPage /></Layout>} />
          <Route path="/stocks/:ticker" element={<Layout><StockDetailPage /></Layout>} />
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
