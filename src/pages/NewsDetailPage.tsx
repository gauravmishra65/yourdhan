import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, TrendingUp, TrendingDown, Minus, ExternalLink, Bookmark } from 'lucide-react'
import { NEWS_ARTICLES } from '../data/mockMacro'
import { MOCK_STOCKS } from '../data/mockStocks'

function timeSince(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const article = NEWS_ARTICLES.find(a => a.id === id)

  if (!article) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg font-medium text-slate-400">Article not found</p>
          <Link to="/news" className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
            <ArrowLeft size={16} /> Back to News
          </Link>
        </div>
      </div>
    )
  }

  const relatedStocks = article.relatedTickers
    .map(t => MOCK_STOCKS.find(s => s.ticker === t))
    .filter(Boolean)

  const relatedArticles = NEWS_ARTICLES
    .filter(a => a.id !== article.id && (a.category === article.category || a.relatedTickers.some(t => article.relatedTickers.includes(t))))
    .slice(0, 4)

  const sentimentCfg = {
    positive: { label: 'Bullish Signal', cls: 'text-green-400 bg-green-900/20 border-green-800', Icon: TrendingUp },
    negative: { label: 'Bearish Signal', cls: 'text-red-400 bg-red-900/20 border-red-800', Icon: TrendingDown },
    neutral:  { label: 'Neutral', cls: 'text-slate-400 bg-slate-800/30 border-slate-700', Icon: Minus },
  }
  const { label: sLabel, cls: sCls, Icon: SIcon } = sentimentCfg[article.sentiment]

  const catColors: Record<string, string> = {
    markets: 'text-blue-400 bg-blue-900/20',
    economy: 'text-purple-400 bg-purple-900/20',
    corporate: 'text-amber-400 bg-amber-900/20',
    global: 'text-teal-400 bg-teal-900/20',
    policy: 'text-pink-400 bg-pink-900/20',
  }

  // Generate a longer body from the summary (simulated full article)
  const bodyParagraphs = [
    article.summary,
    `Market participants are closely watching developments in the ${article.category} space. Analysts note that this news could have significant implications for portfolio allocation and sector rotation strategies in the near term.`,
    `The broader context suggests that ${article.category === 'economy' ? 'macroeconomic fundamentals remain supportive of India\'s growth trajectory, even as global headwinds persist.' : article.category === 'corporate' ? 'corporate earnings quality continues to improve across sectors, with management guidance remaining constructive for FY2026.' : article.category === 'policy' ? 'regulatory developments are gradually shaping a more transparent and investor-friendly market environment.' : article.category === 'global' ? 'global capital flows into emerging markets, including India, remain influenced by US Federal Reserve policy expectations.' : 'market sentiment is being influenced by a combination of domestic and international factors.'}`,
    `Investors should note that while short-term volatility is expected, fundamental-driven investors with a 3–5 year horizon may find opportunities at current levels. Proper due diligence and risk management remain paramount.`,
    `YourDhan note: All data presented is for illustrative and educational purposes only. This is not investment advice. Please consult a SEBI-registered investment advisor before making any investment decisions.`,
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back nav */}
      <Link to="/news" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">
        <ArrowLeft size={16} /> Back to News
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main article */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded font-medium capitalize ${catColors[article.category]}`}>{article.category}</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border font-medium ${sCls}`}>
              <SIcon size={10} /> {sLabel}
            </span>
            {article.relatedTickers.map(t => (
              <Link key={t} to={`/stocks/${t}`}
                className="text-xs font-mono bg-[#0b0f1a] border border-[#1e2d45] text-slate-400 px-1.5 py-0.5 rounded hover:border-blue-500 hover:text-blue-400 transition-colors">
                {t}
              </Link>
            ))}
          </div>

          {/* Headline */}
          <h1 className="text-2xl font-bold text-slate-100 leading-tight">{article.headline}</h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-slate-500 pb-4 border-b border-slate-800">
            <span className="font-medium text-slate-400">{article.source}</span>
            <span className="flex items-center gap-1"><Clock size={12} />{timeSince(article.publishedAt)}</span>
            <span>{article.readMinutes} min read</span>
            <button className="ml-auto flex items-center gap-1 text-slate-500 hover:text-blue-400 transition-colors">
              <Bookmark size={14} /> Save
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">
            {bodyParagraphs.map((para, i) => (
              <p key={i} className={`leading-relaxed ${i === 0 ? 'text-slate-200 text-base font-medium' : 'text-slate-400 text-sm'} ${i === bodyParagraphs.length - 1 ? 'text-xs text-slate-600 italic border-t border-slate-800 pt-3' : ''}`}>
                {para}
              </p>
            ))}
          </div>

          {/* Related stocks */}
          {relatedStocks.length > 0 && (
            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Related Stocks</h3>
              <div className="flex flex-wrap gap-3">
                {relatedStocks.map(s => s && (
                  <Link key={s.ticker} to={`/stocks/${s.ticker}`}
                    className="card p-3 flex items-center gap-3 hover:border-blue-500/40 transition-colors min-w-[160px]">
                    <div>
                      <div className="font-mono font-semibold text-slate-100 text-sm">{s.ticker}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[100px]">{s.name}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-mono text-slate-200 text-sm">₹{s.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* More from category */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Related Stories</h3>
            <div className="space-y-3">
              {relatedArticles.map(a => (
                <Link key={a.id} to={`/news/${a.id}`}
                  className="block group">
                  <p className="text-xs text-slate-300 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-1">{a.headline}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>{a.source}</span>
                    <span>·</span>
                    <span>{a.readMinutes}m</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-900/10 border border-amber-800/30 rounded-lg p-3">
            <p className="text-xs text-amber-200/60">
              <strong className="text-amber-400">Disclaimer:</strong> News articles are mock/illustrative data for demonstration purposes only. Not investment advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
