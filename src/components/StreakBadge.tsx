export default function StreakBadge({ days }: { days: number }) {
  const flame = days >= 7 ? '🔥' : days >= 3 ? '✨' : '💪'
  const bg = days >= 7 ? 'bg-[#FF9500]/10 text-[#FF9500]' :
    days >= 3 ? 'bg-[#FF9500]/10 text-[#FF9500]' :
    'bg-black/5 text-[#8E8E93]'

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight ${bg}`}>
      {flame} {days} 天
    </span>
  )
}
