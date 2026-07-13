import { useState } from 'react'

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>
  onSignUp: (email: string, password: string) => Promise<{ error: any }>
}

export default function Login({ onSignIn, onSignUp }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fn = isRegister ? onSignUp : onSignIn
    const { error: err } = await fn(email, password)
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7] p-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-apple-xl bg-white shadow-apple-md mb-6 text-4xl">
            🏗️
          </div>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-[-0.02em] leading-tight">
            一建复习平台
          </h1>
          <p className="text-[15px] text-[#8E8E93] mt-1.5">
            2026 一建建筑 · 73 天通关
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-apple-xl shadow-apple p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#1C1C1E] tracking-tight">邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F2F2F7] border-0 rounded-apple text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:ring-2 focus:ring-[#007AFF]/30 tracking-tight"
                placeholder="name@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#1C1C1E] tracking-tight">密码</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F2F2F7] border-0 rounded-apple text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:ring-2 focus:ring-[#007AFF]/30 tracking-tight"
                placeholder="······"
              />
            </div>

            {error && (
              <div className="p-3 rounded-apple bg-[#FF3B30]/8 text-[13px] text-[#FF3B30] font-medium tracking-tight">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#007AFF] text-white text-[15px] font-semibold rounded-apple hover:bg-[#007AFF]/90 disabled:opacity-40 transition-all active:scale-[0.98] tracking-tight mt-1"
            >
              {loading ? '处理中…' : isRegister ? '创建账号' : '登录'}
            </button>
          </form>

          <div className="text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '14px' }}>
            <p className="text-[13px] text-[#8E8E93] tracking-tight">
              {isRegister ? '已有账号？' : '没有账号？'}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#007AFF] font-medium hover:opacity-80 ml-1"
              >
                {isRegister ? '去登录' : '注册'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
