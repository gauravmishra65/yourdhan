import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Filter } from 'lucide-react'
import { NEWS_ARTICLES } from '../data/mockMacro'
import type { NewsArticle } from '../data/mockMacro'

const CATEGORIES = ['all', 'markets', 'economy', 'corporate', 'global', 'policy'] as const
type Category = typeof CATEGORIES[number]

function SentimentBadge({ s }: { s: NewsArticle['sentiment'] }) {
  const cfg = {
    positive: { label: 'Bullish', cls: 'bg-green-900/40 text-green-400 border-green-800', Icon: TrendingUp },
    negative: { label: 'Bearish', cls: 'bg-red-900/40 text-red-400 border-red-800', Icon: TrendingDown },
    neutral:  { label: 'Neutral', cls: 'bg-slate-800/60 text-slate-400 border-slate-700', Icon: Minus },
  }
  const { label, cls, Icon } = cfg[s]
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${cls}`}>
      <Icon size={10} />{label}
    </span>
  )
}

function CategoryBadge({ c }: { c: NewsArticle['category'] }) {
  const colors: Record<string, string> = {
    markets: 'bg-blue-900/40 text-blue-400',
    economy: 'bg-purple-900/40 text-purple-400',
    corporate: 'bg-amber-900/40 text-amber-400',
    global: 'bg-teal-900/40 text-teal-400',
    policy: 'bg-pink-900/40 text-pink-400',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${colors[c] ?? 'bg-slate-800 text-slate-400'}`}>
      {c}
    </span>
  )
}

function timeSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'Just now'
}

function NewsCard({ article, featured = false }: { article: NewsArticle; featured?: boolean }) {
  return (
    <Link to={`/news/${article.id}`}
      className={`card p-4 flex flex-col gap-2 hover:border-blue-500/40 transition-colors cursor-pointer ${featured ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <CategoryBadge c={article.category} />
        <SentimentBadge s={article.sentiment} />
        {article.relatedTickers.slice(0, 3).map(t => (
          <span key={t} className="text-xs font-mono bg-[#0b0f1a] border border-[#1e2d45] text-slate-400 px-1.5 py-0.5 rounded">{t}</span>
        ))}
      </div>
      <h3 className={`font-semibold text-slate-100 leading-snug hover:text-blue-400 transition-colors ${featured ? 'text-lg' : 'text-sm'}`}>
        {article.headline}
      </h3>
      <p className={`text-slate-400 leading-relaxed line-clamp-2 ${featured ? 'text-sm' : 'text-xs'}`}>
        {article.summary}
      </p>
      <div className="flex items-center gap-3 text-xs text-slate-600 mt-auto pt-1">
        <span className="font-medium text-slate-500">{article.source}</span>
        <span className="flex items-center gap-1"><Clock size={10} />{timeSince(article.publishedAt)}</span>
        <span>{article.readMinutes} min read</span>
      </div>
    </Link>
  )
}

export default function NewsPage() {
  const [cat, setCat] = useState<Category>('all')
  const [sentiment, setSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all')
  const [search, setSearch] = useState('')

  const filtered = NEWS_ARTICLES.filter(a => {
    if (cat !== 'all' && a.category !== cat) return false
    if (sentiment !== 'all' && a.sentiment !== sentiment) return false
    if (search) {
      const q = search.toLowerCase()
      return a.headline.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.relatedTickers.some(t => t.toLowerCase().includes(q))
    }
    return true
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  const sentimentCounts = {
    positive: NEWS_ARTICLES.filter(a => a.sentiment === 'positive').length,
    negative: NEWS_ARTICLES.filter(a => a.sentiment === 'negative').length,
    neutral: NEWS_ARTICLES.filter(a => a.sentiment === 'neutral').length,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Market News</h1>
          <p className="text-slate-400 mt-1">Latest financial news, earnings, and macro updates</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-green-400"><TrendingUp size={14} />{sentimentCounts.positive} Bullish</span>
          <span className="flex items-center gap-1 text-red-400"><TrendingDown size={14} />{sentimentCounts.negative} Bearish</span>
          <span className="flex items-center gap-1 text-slate-400"><Minus size={14} />{sentimentCounts.neutral} Neutral</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news..."
            className="bg-[#131929] border border-[#1e2d45] rounded pl-8 pr-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500 w-52" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`text-xs px-3 py-1.5 rounded capitalize transition-colors ${cat === c ? 'bg-blue-600 text-white' : 'bg-[#131929] border border-[#1e2d45] text-slate-400 hover:text-slate-200'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', 'positive', 'negative', 'neutral'] as const).map(s => (
            <button key={s} onClick={() => setSentiment(s)}
              className={`text-xs px-2.5 py-1.5 rounded capitalize transition-colors ${sentiment === s ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Search size={48} className="mx-auto mb-3 opacity-20" />
          <p>No articles match your filters</p>
        </div>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NewsCard article={featured} featured />
              {rest.slice(0, 1).map(a => <NewsCard key={a.id} article={a} />)}
            </div>
          )}

          {/* Rest grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.slice(1).map(a => <NewsCard key={a.id} article={a} />)}
          </div>
        </>
      )}

      <p className="text-xs text-slate-600 text-center">
        {filtered.length} articles shown · Data is mock/illustrative only · Last updated: May 2025
      </p>
    </div>
  )
}
