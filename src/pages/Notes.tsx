import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { DailyNote } from '../types'

export default function Notes({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<DailyNote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!userId) return
    supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) setNotes(data)
        setLoading(false)
      })
  }, [userId])

  const filtered = search
    ? notes.filter(n => n.content.toLowerCase().includes(search.toLowerCase()))
    : notes

  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-0 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#1C1C1E] tracking-[-0.02em]">📝 重点标记</h2>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索…"
            className="pl-8 pr-3 py-2 bg-white border-0 rounded-apple text-[13px] shadow-apple placeholder:text-[#C7C7CC] focus:ring-2 focus:ring-[#007AFF]/30 w-32 tracking-tight"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#C7C7CC] text-sm">🔍</span>
        </div>
      </div>

      {loading ? (
        <p className="text-[14px] text-[#8E8E93]">加载中…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-apple-xl shadow-apple p-12 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-[15px] text-[#8E8E93] font-medium tracking-tight">{search ? '没有匹配的标记' : '暂无重点标记'}</p>
          <p className="text-[12px] text-[#C7C7CC] mt-1 tracking-tight">在今日页面记录每日重点</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const d = new Date(n.date)
            const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日`
            const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
            return (
              <div key={n.id} className="bg-white rounded-apple-xl shadow-apple p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[12px] font-semibold text-[#007AFF] bg-[#007AFF]/8 px-2 py-0.5 rounded-lg tracking-tight">
                    {dateLabel}
                  </span>
                  <span className="text-[11px] text-[#8E8E93] font-medium">{dayOfWeek}</span>
                </div>
                <p className="text-[14px] text-[#1C1C1E] whitespace-pre-wrap leading-relaxed tracking-tight">{n.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
