interface DayCell {
  date: string
  completionRate: number
  actualMinutes: number
}

export default function Heatmap({ data }: { data: DayCell[] }) {
  const getColor = (rate: number) => {
    if (rate === 0) return 'bg-black/5'
    if (rate < 30) return 'bg-[#34C759]/25'
    if (rate < 60) return 'bg-[#34C759]/45'
    if (rate < 90) return 'bg-[#34C759]/65'
    return 'bg-[#34C759]/90'
  }

  const weeks: DayCell[][] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 83)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const dataMap = new Map(data.map(d => [d.date, d]))

  for (let w = 0; w < 12; w++) {
    const week: DayCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + w * 7 + d)
      const key = date.toISOString().slice(0, 10)
      const cell = dataMap.get(key)
      week.push({
        date: key,
        completionRate: cell?.completionRate ?? 0,
        actualMinutes: cell?.actualMinutes ?? 0,
      })
    }
    weeks.push(week)
  }

  return (
    <div className="flex gap-[3px]">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((cell, di) => (
            <div
              key={di}
              className={`w-[11px] h-[11px] rounded-[3px] ${getColor(cell.completionRate)}`}
              title={`${cell.date}: ${cell.completionRate}%`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
