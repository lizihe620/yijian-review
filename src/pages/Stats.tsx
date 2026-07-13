import { useStats } from '../hooks/useStats'
import Heatmap from '../components/Heatmap'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Stats({ userId, streakDays }: { userId: string; streakDays: number }) {
  const { dailyStats, subjectStats, loading } = useStats(userId)

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8E8E93] text-[15px] tracking-tight">加载中…</div>
  )

  const heatmapData = dailyStats.map(d => ({
    date: d.date,
    completionRate: d.completion_rate,
    actualMinutes: d.total_actual_minutes,
  }))

  const studyTimeData = [...dailyStats]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map(d => ({
      date: d.date.slice(5),
      学习时长: Math.round(d.total_actual_minutes / 6) / 10,
    }))

  const subjectData = subjectStats.map(s => ({
    name: s.subject_name.slice(0, 4),
    完成率: s.completion_rate,
    正确率: s.avg_correct_rate || 0,
  }))

  const totalTasks = dailyStats.reduce((s, d) => s + d.tasks_total, 0)
  const totalCompleted = dailyStats.reduce((s, d) => s + d.tasks_completed, 0)
  const totalMinutes = dailyStats.reduce((s, d) => s + d.total_actual_minutes, 0)
  const totalHours = Math.round(totalMinutes / 6) / 10

  const stats = [
    { label: '连续打卡', value: `${streakDays} 天`, icon: '🔥', color: '#FF9500' },
    { label: '总学习时长', value: `${totalHours}h`, icon: '⏰', color: '#007AFF' },
    { label: '已完成', value: `${totalCompleted}/${totalTasks}`, icon: '✅', color: '#34C759' },
    { label: '剩余天数', value: `${Math.max(0, 73 - dailyStats.filter(d => d.tasks_total > 0).length)} 天`, icon: '📅', color: '#AF52DE' },
  ]

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-0 space-y-4 animate-fade-in">
      <h2 className="text-[22px] font-bold text-[#1C1C1E] tracking-[-0.02em] px-1">📊 学习统计</h2>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-apple-xl shadow-apple p-4 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-xl font-bold text-[#1C1C1E] tracking-[-0.01em]">{s.value}</p>
            <p className="text-[11px] text-[#8E8E93] mt-0.5 font-medium tracking-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-apple-xl shadow-apple p-5">
        <h3 className="text-[14px] font-semibold text-[#1C1C1E] mb-4 tracking-tight">学习热力图</h3>
        <div className="overflow-x-auto pb-2">
          <Heatmap data={heatmapData} />
        </div>
        <div className="flex items-center gap-[3px] mt-3 text-[10px] text-[#8E8E93] justify-end font-medium">
          <span>少</span>
          {['bg-black/5', 'bg-[#34C759]/25', 'bg-[#34C759]/45', 'bg-[#34C759]/65', 'bg-[#34C759]/90'].map((c, i) => (
            <div key={i} className={`w-[11px] h-[11px] rounded-[3px] ${c}`} />
          ))}
          <span>多</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-apple-xl shadow-apple p-5">
          <h3 className="text-[14px] font-semibold text-[#1C1C1E] mb-4 tracking-tight">学习时长趋势</h3>
          {studyTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={studyTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8E8E93' }} axisLine={false} tickLine={false} unit="h" />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="学习时长" stroke="#007AFF" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-[#C7C7CC] py-10 text-[13px]">暂无数据</p>}
        </div>

        <div className="bg-white rounded-apple-xl shadow-apple p-5">
          <h3 className="text-[14px] font-semibold text-[#1C1C1E] mb-4 tracking-tight">四科对比</h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8E8E93' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="完成率" fill="#007AFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="正确率" fill="#FF9500" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-[#C7C7CC] py-10 text-[13px]">暂无数据</p>}
        </div>
      </div>

      {/* Per-subject detail */}
      <div className="space-y-2">
        <h3 className="text-[14px] font-semibold text-[#1C1C1E] px-1 tracking-tight">各科详情</h3>
        {subjectStats.map(s => (
          <div key={s.subject_id} className="bg-white rounded-apple-xl shadow-apple p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.subject_color }} />
                <span className="text-[14px] font-semibold text-[#1C1C1E] tracking-tight">{s.subject_name}</span>
              </div>
              <span className="text-[12px] text-[#8E8E93] font-medium">{s.tasks_completed}/{s.tasks_total} 任务</span>
            </div>
            <div className="w-full bg-[#F2F2F7] rounded-full h-1.5 overflow-hidden mb-2.5">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.completion_rate}%`, background: s.subject_color }} />
            </div>
            <div className="flex gap-5 text-[11px] text-[#8E8E93] font-medium">
              <span>完成率 {s.completion_rate}%</span>
              {s.avg_correct_rate != null && <span>正确率 {s.avg_correct_rate}%</span>}
              <span>{Math.round(s.total_actual_minutes / 6) / 10}h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
