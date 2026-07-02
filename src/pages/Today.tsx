import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useDailyTasks } from '../hooks/useDailyTasks'
import TaskCard from '../components/TaskCard'
import StreakBadge from '../components/StreakBadge'
import MarkdownEditor from '../components/MarkdownEditor'
import type { DailyNote } from '../types'

export default function Today({ userId, streakDays }: { userId: string; streakDays: number }) {
  const today = new Date().toISOString().slice(0, 10)
  const { tasks, loading, toggleTask, updateTaskDetail } = useDailyTasks(userId, today)

  const [note, setNote] = useState<DailyNote | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    if (!userId) return
    supabase.from('daily_notes').select('*').eq('user_id', userId).eq('date', today).maybeSingle()
      .then(({ data }) => {
        if (data) { setNote(data); setNoteContent(data.content) }
      })
  }, [userId, today])

  const saveNote = async () => {
    if (!userId) return
    setSavingNote(true)
    if (note?.id) {
      await supabase.from('daily_notes').update({ content: noteContent, updated_at: new Date().toISOString() }).eq('id', note.id)
    } else {
      const { data } = await supabase.from('daily_notes').insert({ user_id: userId, date: today, content: noteContent }).select().single()
      if (data) setNote(data)
    }
    setSavingNote(false)
  }

  const completed = tasks.filter(t => t.is_completed).length
  const total = tasks.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  // Group tasks by subject
  const grouped = tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    const key = t.subjects?.id || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8E8E93] text-[15px] tracking-tight">加载中…</div>
  )

  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date().getDay()]
  const monthDay = `${today.slice(5, 7)}月${today.slice(8, 10)}日`

  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-0 space-y-4 animate-fade-in">
      {/* Header card */}
      <div className="bg-white rounded-apple-xl shadow-apple p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-[22px] font-bold text-[#1C1C1E] tracking-[-0.02em] leading-tight">
              {monthDay} {dayOfWeek}
            </h2>
            <p className="text-[13px] text-[#8E8E93] mt-0.5 tracking-tight">阶段一 · 基础追赶期</p>
          </div>
          <StreakBadge days={streakDays} />
        </div>
        {total > 0 && (
          <>
            <div className="mt-4 w-full bg-[#F2F2F7] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct === 100 ? 'bg-[#34C759]' : 'bg-[#007AFF]'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8E8E93] mt-1.5 font-medium tracking-tight">
              {pct === 100 ? '🎉 全部完成！' : `${completed}/${total} 已完成`}
            </p>
          </>
        )}
      </div>

      {/* Tasks */}
      {total === 0 && (
        <div className="bg-white rounded-apple-xl shadow-apple p-10 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-[15px] text-[#8E8E93] font-medium tracking-tight">今日暂无任务</p>
          <p className="text-[12px] text-[#C7C7CC] mt-1 tracking-tight">去计划页面添加任务</p>
        </div>
      )}

      {Object.entries(grouped).map(([key, taskList]) => {
        const subj = taskList[0]?.subjects
        const done = taskList.filter(t => t.is_completed).length
        return (
          <div key={key} className="space-y-1.5">
            {subj && (
              <div className="flex items-center gap-2 px-1 py-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: subj.color || '#007AFF' }} />
                <h3 className="text-[14px] font-semibold text-[#1C1C1E] tracking-tight">{subj.name}</h3>
                <span className="text-[12px] text-[#8E8E93] font-medium">{done}/{taskList.length}</span>
              </div>
            )}
            {taskList.map(t => (
              <TaskCard key={t.id} task={t} onToggle={toggleTask} onUpdate={updateTaskDetail} />
            ))}
          </div>
        )
      })}

      {/* Notes */}
      <div className="space-y-2 pt-2">
        <h3 className="text-[14px] font-semibold text-[#1C1C1E] px-1 tracking-tight">📝 今日重点标记</h3>
        <MarkdownEditor
          value={noteContent}
          onChange={setNoteContent}
          onSave={saveNote}
          saving={savingNote}
        />
      </div>
    </div>
  )
}
