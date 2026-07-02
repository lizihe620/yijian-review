import { useState } from 'react'

interface Props {
  value: string
  onChange: (val: string) => void
  onSave: () => void
  saving: boolean
}

export default function MarkdownEditor({ value, onChange, onSave, saving }: Props) {
  const [preview, setPreview] = useState(false)

  return (
    <div className="bg-white rounded-apple-lg overflow-hidden shadow-apple border border-transparent">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9F9F9]/80" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex bg-black/5 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setPreview(false)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              !preview ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93]'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              preview ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93]'
            }`}
          >
            预览
          </button>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-1.5 bg-[#007AFF] text-white text-[11px] font-semibold rounded-lg hover:bg-[#007AFF]/90 disabled:opacity-40 transition-all active:scale-[0.97]"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
      {preview ? (
        <div className="p-4 min-h-[100px] text-[14px] text-[#1C1C1E] leading-relaxed whitespace-pre-wrap tracking-tight">
          {value || (
            <span className="text-[#8E8E93]">暂无内容</span>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full p-4 min-h-[100px] text-[14px] text-[#1C1C1E] resize-y bg-transparent placeholder:text-[#C7C7CC] tracking-tight leading-relaxed"
          placeholder="记录今日学习重点、难点、心得…"
        />
      )}
    </div>
  )
}
