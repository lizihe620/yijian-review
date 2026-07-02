import { useState } from 'react'
import type { DailyTask, Subject } from '../types'
import SubjectBadge from './SubjectBadge'

interface Props {
  task: DailyTask & { subjects?: Subject }
  onToggle: (id: string, completed: boolean) => void
  onUpdate: (id: string, field: 'actual_minutes' | 'correct_rate', value: number | null) => void
}

export default function TaskCard({ task, onToggle, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const done = task.is_completed

  return (
    <div
      className={`rounded-apple p-4 transition-all duration-200 border ${
        done
          ? 'bg-[#F2F2F7] border-transparent'
          : 'bg-white border-transparent hover:border-black/5 hover:shadow-apple-md cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id, !done) }}
          className={`mt-0.5 flex-shrink-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            done
              ? 'bg-[#34C759] border-[#34C759] scale-100'
              : 'border-[#C7C7CC] hover:border-[#34C759] hover:scale-105'
          }`}
        >
          {done && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {task.subjects && <SubjectBadge subject={task.subjects} />}
            <span className="text-[11px] text-[#8E8E93] font-medium">
              {task.estimated_minutes} min
            </span>
          </div>
          <p className={`text-[14px] leading-relaxed tracking-tight ${
            done ? 'text-[#8E8E93] line-through decoration-1 decoration-[#34C759]/40' : 'text-[#1C1C1E]'
          }`}>
            {task.task_content}
          </p>

          {/* Expanded detail inputs */}
          {expanded && (
            <div
              className="mt-3 pt-3 flex gap-4 flex-wrap animate-fade-in"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <label className="flex items-center gap-2 text-xs text-[#8E8E93]">
                <span>实际用时</span>
                <input
                  type="number"
                  className="w-16 px-2 py-1.5 bg-[#F2F2F7] border-0 rounded-lg text-sm text-[#1C1C1E] focus:ring-2 focus:ring-[#007AFF]/30"
                  placeholder="0"
                  value={task.actual_minutes ?? ''}
                  onChange={e => onUpdate(task.id, 'actual_minutes', e.target.value ? Number(e.target.value) : null)}
                />
                <span>min</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#8E8E93]">
                <span>正确率</span>
                <input
                  type="number"
                  className="w-16 px-2 py-1.5 bg-[#F2F2F7] border-0 rounded-lg text-sm text-[#1C1C1E] focus:ring-2 focus:ring-[#007AFF]/30"
                  placeholder="0"
                  min="0" max="100"
                  value={task.correct_rate ?? ''}
                  onChange={e => onUpdate(task.id, 'correct_rate', e.target.value ? Number(e.target.value) : null)}
                />
                <span>%</span>
              </label>
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 text-[#8E8E93] hover:text-[#007AFF] text-[11px] font-medium mt-0.5"
        >
          {expanded ? '收起' : '详情'}
        </button>
      </div>
    </div>
  )
}
