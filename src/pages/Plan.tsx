import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TaskCard from '../components/TaskCard'
import type { DailyTask, Subject } from '../types'

const PHASES = [
  { name: '基础追赶期', start: '2026-07-01', end: '2026-07-20' },
  { name: '强化提升期', start: '2026-07-21', end: '2026-08-17' },
  { name: '冲刺模拟期', start: '2026-08-18', end: '2026-09-11' },
]

export default function Plan({ userId }: { userId: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [tasks, setTasks] = useState<(DailyTask & { subjects?: Subject })[]>([])
  const [loading, setLoading] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const idx = PHASES.findIndex(p => today >= p.start && today <= p.end)
    if (idx >= 0) setPhaseIdx(idx)
  }, [])

  const phase = PHASES[phaseIdx]

  // Generate calendar days
  const startDate = new Date(phase.start)
  const endDate = new Date(phase.end)
  const days: string[] = []
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d).toISOString().slice(0, 10))
  }

  const weeks: string[][] = []
  let currentWeek: string[] = []
  for (const d of days) {
    currentWeek.push(d)
    if (new Date(d).getDay() === 6 || d === days[days.length - 1]) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('daily_tasks')
      .select('*, subjects(*)')
      .eq('user_id', userId)
      .eq('date', selectedDate)
      .order('sort_order')
      .then(({ data }) => {
        if (data) setTasks(data)
        setLoading(false)
      })
  }, [userId, selectedDate])

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    await supabase.from('daily_tasks').update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null } : t))
  }

  const updateTaskDetail = async (taskId: string, field: 'actual_minutes' | 'correct_rate', value: number | null) => {
    await supabase.from('daily_tasks').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: value } : t))
  }

  const isToday = (d: string) => d === new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-0 space-y-4 animate-fade-in">
      <h2 className="text-[22px] font-bold text-[#1C1C1E] tracking-[-0.02em] px-1">📅 计划总览</h2>

      {/* Phase tabs */}
      <div className="flex bg-[#E5E5EA]/40 rounded-apple p-1 gap-0.5">
        {PHASES.map((p, i) => (
          <button
            key={i}
            onClick={() => setPhaseIdx(i)}
            className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-medium transition-all tracking-tight ${
              phaseIdx === i
                ? 'bg-white text-[#1C1C1E] shadow-sm'
                : 'text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
          >
            {p.name}
            <span className="block text-[10px] opacity-60">{p.start.slice(5)}~{p.end.slice(5)}</span>
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-apple-xl shadow-apple overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <h3 className="text-[14px] font-semibold text-[#1C1C1E] tracking-tight">
            {phase.name}
            <span className="text-[12px] text-[#8E8E93] ml-2 font-normal">{phase.start} ~ {phase.end}</span>
          </h3>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-7 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(w => (
              <div key={w} className="text-center text-[10px] text-[#8E8E93] font-medium py-1">{w}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7" style={{ gap: '2px' }}>
              {Array.from({ length: new Date(week[0]).getDay() }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {week.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`aspect-square flex items-center justify-center text-[13px] font-medium rounded-xl transition-all ${
                    d === selectedDate
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : isToday(d)
                      ? 'bg-[#007AFF]/8 text-[#007AFF] font-semibold'
                      : 'text-[#1C1C1E] hover:bg-black/[0.04]'
                  }`}
                >
                  {d.slice(8).replace(/^0/, '')}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Day detail */}
      <div className="space-y-1.5">
        <h3 className="text-[14px] font-semibold text-[#1C1C1E] px-1 tracking-tight">
          {selectedDate}
          {isToday(selectedDate) && <span className="text-[#007AFF] ml-1.5 text-[12px]">今天</span>}
        </h3>
        {loading ? (
          <p className="text-[13px] text-[#8E8E93] px-1">加载中…</p>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-apple-xl shadow-apple p-8 text-center text-[#8E8E93] text-[14px]">
            该日暂无任务
          </div>
        ) : (
          tasks.map(t => (
            <TaskCard key={t.id} task={t} onToggle={toggleTask} onUpdate={updateTaskDetail} />
          ))
        )}
      </div>
    </div>
  )
}
