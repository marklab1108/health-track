import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'

const GoalSetupPage = lazy(() => import('../features/goals/GoalSetupPage').then((module) => ({ default: module.GoalSetupPage })))
const MealLogPage = lazy(() => import('../features/meals/MealLogPage').then((module) => ({ default: module.MealLogPage })))
const TodayDashboardPage = lazy(() =>
  import('../features/dashboard/TodayDashboardPage').then((module) => ({ default: module.TodayDashboardPage }))
)
const WeeklyReviewPage = lazy(() =>
  import('../features/weekly-review/WeeklyReviewPage').then((module) => ({ default: module.WeeklyReviewPage }))
)
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })))

const navItems = [
  { to: '/today', label: '今日' },
  { to: '/log', label: '記錄' },
  { to: '/weekly', label: '週回顧' },
  { to: '/settings', label: '設定' }
]

export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

function AppShell() {
  const location = useLocation()
  const hideNav = location.pathname === '/setup'

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="app-shell">
      <main className={hideNav ? 'app-main app-main--full' : 'app-main'}>
        <Suspense fallback={<div className="empty-state">載入畫面中。</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/setup" element={<GoalSetupPage />} />
            <Route path="/today" element={<TodayDashboardPage />} />
            <Route path="/log" element={<MealLogPage />} />
            <Route path="/weekly" element={<WeeklyReviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!hideNav ? (
        <nav className="bottom-nav" aria-label="主要導覽">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
