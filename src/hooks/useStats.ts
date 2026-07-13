import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { DailyStats, SubjectStats } from '../types'

export function useStats(userId: string | undefined) {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([])
  const [streakDays, setStreakDays] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    // Fetch all tasks for stats computation
    const { data: tasks } = await supabase
      .from('daily_tasks')
      .select('*, subjects(*)')
      .eq('user_id', userId)
      .order('date')

    if (!tasks) { setLoading(false); return }

    // Compute daily stats
    const dayMap = new Map<string, {
      estimated: number; actual: number; completed: number; total: number;
      correctRates: number[];
    }>()

    for (const t of tasks) {
      const d = t.date
      if (!dayMap.has(d)) dayMap.set(d, { estimated: 0, actual: 0, completed: 0, total: 0, correctRates: [] })
      const entry = dayMap.get(d)!
      entry.estimated += t.estimated_minutes || 0
      entry.actual += t.actual_minutes || 0
      entry.total += 1
      if (t.is_completed) entry.completed += 1
      if (t.correct_rate != null) entry.correctRates.push(t.correct_rate)
    }

    const ds: DailyStats[] = []
    for (const [date, v] of dayMap) {
      ds.push({
        date,
        total_estimated_minutes: v.estimated,
        total_actual_minutes: v.actual,
        tasks_completed: v.completed,
        tasks_total: v.total,
        completion_rate: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
        avg_correct_rate: v.correctRates.length > 0
          ? Math.round(v.correctRates.reduce((a, b) => a + b, 0) / v.correctRates.length)
          : null,
      })
    }
    ds.sort((a, b) => b.date.localeCompare(a.date))
    setDailyStats(ds)

    // Streak: count consecutive days (from today backwards) with all tasks complete
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dsKey = d.toISOString().slice(0, 10)
      const dayData = dayMap.get(dsKey)
      if (dayData && dayData.completed > 0 && dayData.completed === dayData.total) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    setStreakDays(streak)

    // Compute subject stats
    const subjMap = new Map<string, {
      name: string; color: string; completed: number; total: number;
      correctRates: number[]; actualMin: number;
    }>()
    for (const t of tasks) {
      const s = t.subjects as any
      if (!s) continue
      const sid = s.id
      if (!subjMap.has(sid)) subjMap.set(sid, { name: s.name, color: s.color, completed: 0, total: 0, correctRates: [], actualMin: 0 })
      const e = subjMap.get(sid)!
      e.total += 1
      if (t.is_completed) e.completed += 1
      if (t.correct_rate != null) e.correctRates.push(t.correct_rate)
      e.actualMin += t.actual_minutes || 0
    }
    const ss: SubjectStats[] = []
    for (const [sid, v] of subjMap) {
      ss.push({
        subject_id: sid,
        subject_name: v.name,
        subject_color: v.color,
        tasks_completed: v.completed,
        tasks_total: v.total,
        completion_rate: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
        avg_correct_rate: v.correctRates.length > 0
          ? Math.round(v.correctRates.reduce((a, b) => a + b, 0) / v.correctRates.length)
          : null,
        total_actual_minutes: v.actualMin,
      })
    }
    setSubjectStats(ss)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchStats() }, [fetchStats])

  return { dailyStats, subjectStats, streakDays, loading, refetch: fetchStats }
}
