import type { Subject } from '../types'

const SUBJECT_STYLES: Record<string, string> = {
  '建设工程经济': 'bg-[#34C759]/10 text-[#34C759]',
  '建设工程法规及相关知识': 'bg-[#007AFF]/10 text-[#007AFF]',
  '建设工程项目管理': 'bg-[#FF9500]/10 text-[#FF9500]',
  '建筑工程管理与实务': 'bg-[#FF3B30]/10 text-[#FF3B30]',
}

export default function SubjectBadge({ subject }: { subject: Subject }) {
  const cls = SUBJECT_STYLES[subject.name] || 'bg-black/5 text-[#8E8E93]'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-tight ${cls}`}>
      {subject.short_name}
    </span>
  )
}
