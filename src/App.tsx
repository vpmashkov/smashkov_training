import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { OnboardingModal } from './components/OnboardingModal'
import { AppStateProvider, useAppState } from './state/AppState'
import { TodayPage } from './pages/TodayPage'
import { ProgramPage } from './pages/ProgramPage'
import { ProgressPage } from './pages/ProgressPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </AppStateProvider>
  )
}

function AppShell() {
  const { ready, profile } = useAppState()

  if (!ready) {
    return (
      <div className="page">
        <p className="lede">Loading your training data…</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      {!profile ? <OnboardingModal /> : null}
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/program" element={<ProgramPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
