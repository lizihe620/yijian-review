import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { DailyTask, Subject } from '../types'

export function useDailyTasks(userId: string | undefined, date: string) {
  const [tasks, setTasks] = useState<(DailyTask & { subjects?: Subject })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('daily_tasks')
      .select('*, subjects(*)')
      .eq('user_id', userId)
      .eq('date', date)
      .order('sort_order')

    if (data) setTasks(data)
    setLoading(false)
  }, [userId, date])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('daily_tasks')
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (!error) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null } : t
      ))
    }
  }

  const updateTaskDetail = async (taskId: string, field: 'actual_minutes' | 'correct_rate', value: number | null) => {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (!error) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: value } : t))
    }
  }

  return { tasks, loading, toggleTask, updateTaskDetail, refetch: fetchTasks }
}
