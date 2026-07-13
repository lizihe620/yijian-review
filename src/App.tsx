import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useStats } from './hooks/useStats'
import Layout from './components/Layout'
import Today from './pages/Today'
import Stats from './pages/Stats'
import Plan from './pages/Plan'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import Login from './pages/Login'

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { streakDays } = useStats(user?.id)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3 animate-pulse">🏗️</div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onSignIn={signIn} onSignUp={signUp} />
  }

  return (
    <Routes>
      <Route element={<Layout onSignOut={signOut} />}>
        <Route path="/" element={<Today userId={user.id} streakDays={streakDays} />} />
        <Route path="/stats" element={<Stats userId={user.id} streakDays={streakDays} />} />
        <Route path="/plan" element={<Plan userId={user.id} />} />
        <Route path="/notes" element={<Notes userId={user.id} />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
