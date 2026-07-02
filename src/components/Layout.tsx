import { NavLink, Outlet, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/', label: '今日', icon: '☀️', end: true },
  { to: '/stats', label: '统计', icon: '📊' },
  { to: '/plan', label: '计划', icon: '📅' },
  { to: '/notes', label: '标记', icon: '📝' },
]

export default function Layout({ onSignOut }: { onSignOut: () => void }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Desktop sidebar — glass */}
      <aside className="hidden md:flex flex-col fixed left-4 top-4 bottom-4 w-56 glass rounded-apple-xl shadow-apple-lg z-20 border border-white/50">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-lg font-bold text-[#1C1C1E] tracking-tight">一建冲刺</h1>
          <p className="text-xs text-apple-gray mt-0.5">73天通关计划</p>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(n => {
            const active = n.end ? location.pathname === '/' : location.pathname.startsWith(n.to)
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-[#1C1C1E] hover:bg-black/[0.04]'
                }`}
              >
                <span className="text-base">{n.icon}</span>
                <span>{n.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="px-3 pb-4">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-apple-gray hover:bg-black/[0.04] transition-all"
          >
            <span>🚪</span> 退出登录
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav — glass */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 glass border-t border-black/5 rounded-t-apple-xl">
        <div className="flex justify-around py-1.5 px-2">
          {NAV.map(n => {
            const active = n.end ? location.pathname === '/' : location.pathname.startsWith(n.to)
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
                  active ? 'text-[#007AFF]' : 'text-apple-gray'
                }`}
              >
                <span className="text-lg">{n.icon}</span>
                <span>{n.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="md:ml-60 pt-4 pb-24 md:pb-6 md:pr-4 md:pt-4">
        <div className="md:pt-2">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
