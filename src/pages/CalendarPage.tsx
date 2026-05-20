import { useState } from 'react'
import { Calendar, Clock, TrendingUp, Bell, DollarSign, AlertTriangle, ChevronRight } from 'lucide-react'
import { CALENDAR_EVENTS } from '../data/mockMacro'
import type { CalendarEvent } from '../data/mockMacro'

type FilterCategory = 'all' | CalendarEvent['category']

const CAT_CFG: Record<CalendarEvent['category'], { label: string; color: string; bg: string; Icon: React.FC<any> }> = {
  earnings: { label: 'Earnings', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/50', Icon: TrendingUp },
  economic: { label: 'Economic', color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-800/50', Icon: ChevronRight },
  policy:   { label: 'Policy', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-800/50', Icon: Bell },
  dividend: { label: 'Dividend', color: 'text-green-400', bg: 'bg-green-900/30 border-green-800/50', Icon: DollarSign },
  expiry:   { label: 'Expiry', color: 'text-red-400', bg: 'bg-red-900/30 border-red-800/50', Icon: AlertTriangle },
}

const IMP_CFG = {
  high:   { label: 'High', dot: 'bg-red-500' },
  medium: { label: 'Medium', dot: 'bg-amber-500' },
  low:    { label: 'Low', dot: 'bg-green-500' },
}

function EventCard({ event }: { event: CalendarEvent }) {
  const cat = CAT_CFG[event.category]
  const imp = IMP_CFG[event.importance]
  const Cat = cat.Icon
  return (
    <div className={`p-3 rounded-lg border ${cat.bg} space-y-1.5`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Cat size={14} className={cat.color} />
          <span className="text-slate-200 text-sm font-medium leading-snug">{event.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${imp.dot}`} />
          <span className="text-xs text-slate-500">{imp.label}</span>
        </div>
      </div>
      {event.time && (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={10} /> {event.time} IST
        </div>
      )}
      {(event.expected || event.previous) && (
        <div className="flex gap-3 text-xs">
          {event.expected && <span className="text-slate-400"><span className="text-slate-600">Est: </span>{event.expected}</span>}
          {event.previous && <span className="text-slate-500"><span className="text-slate-600">Prev: </span>{event.previous}</span>}
        </div>
      )}
      {event.ticker && (
        <span className="inline-block text-xs font-mono bg-[#0b0f1a] border border-[#1e2d45] text-slate-400 px-1.5 py-0.5 rounded">{event.ticker}</span>
      )}
    </div>
  )
}

function groupByDate(events: CalendarEvent[]) {
  const groups: Record<string, CalendarEvent[]> = {}
  events.forEach(e => {
    if (!groups[e.date]) groups[e.date] = []
    groups[e.date].push(e)
  })
  return groups
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return {
    full: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    day: d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
    isToday: dateStr === new Date().toISOString().slice(0, 10),
  }
}

export default function CalendarPage() {
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [impFilter, setImpFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const filtered = CALENDAR_EVENTS.filter(e => {
    if (filter !== 'all' && e.category !== filter) return false
    if (impFilter !== 'all' && e.importance !== impFilter) return false
    return true
  })

  const grouped = groupByDate(filtered)
  const dates = Object.keys(grouped).sort()

  const upcomingHigh = CALENDAR_EVENTS.filter(e => e.importance === 'high').slice(0, 5)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="text-blue-400" size={28} /> Financial Calendar
        </h1>
        <p className="text-slate-400 mt-1">Upcoming earnings results, economic data releases, RBI policy and market events</p>
      </div>

      {/* High importance strip */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" /> High Impact Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingHigh.map(e => {
            const d = formatDate(e.date)
            const cat = CAT_CFG[e.category]
            return (
              <div key={e.id} className="flex items-start gap-3 p-2 bg-[#0b0f1a] rounded-lg">
                <div className="text-center w-10 shrink-0">
                  <div className="text-xl font-bold font-mono text-slate-100">{d.day}</div>
                  <div className="text-xs text-slate-500">{d.month}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${cat.color} mb-0.5 capitalize`}>{e.category}</div>
                  <div className="text-sm text-slate-300 leading-snug truncate">{e.title}</div>
                  {e.ticker && <span className="text-xs font-mono text-slate-500">{e.ticker}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-slate-500 self-center mr-1">Category:</span>
          {(['all', ...Object.keys(CAT_CFG)] as FilterCategory[]).map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`text-xs px-3 py-1.5 rounded capitalize transition-colors ${filter === c ? 'bg-blue-600 text-white' : 'bg-[#131929] border border-[#1e2d45] text-slate-400 hover:text-slate-200'}`}>
              {c === 'all' ? 'All' : CAT_CFG[c as CalendarEvent['category']].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-slate-500 self-center mr-1">Impact:</span>
          {(['all', 'high', 'medium', 'low'] as const).map(i => (
            <button key={i} onClick={() => setImpFilter(i)}
              className={`text-xs px-3 py-1.5 rounded capitalize transition-colors ${impFilter === i ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {dates.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Calendar size={48} className="mx-auto mb-3 opacity-20" />
          <p>No events match your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map(date => {
            const d = formatDate(date)
            const events = grouped[date]
            return (
              <div key={date} className="flex gap-4">
                {/* Date column */}
                <div className="shrink-0 w-20 text-right">
                  <div className={`inline-block rounded-lg p-2 text-center ${d.isToday ? 'bg-blue-600' : 'bg-[#131929] border border-[#1e2d45]'}`}>
                    <div className="text-xs text-slate-400">{d.weekday}</div>
                    <div className="text-xl font-bold font-mono text-slate-100 leading-none">{d.day}</div>
                    <div className="text-xs text-slate-500">{d.month}</div>
                  </div>
                </div>
                {/* Events */}
                <div className="flex-1 space-y-2">
                  {d.isToday && (
                    <div className="text-xs font-semibold text-blue-400 mb-1">TODAY</div>
                  )}
                  {events.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(CAT_CFG).map(([k, v]) => {
            const Icon = v.Icon
            return (
              <div key={k} className="flex items-center gap-2">
                <Icon size={14} className={v.color} />
                <span className="text-xs text-slate-400">{v.label}</span>
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-slate-800">
          {Object.entries(IMP_CFG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${v.dot}`} />
              <span className="text-xs text-slate-400">{v.label} Impact</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
