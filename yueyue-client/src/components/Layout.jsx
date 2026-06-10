import { NavLink, Outlet, useLocation } from 'react-router-dom'

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={isHome ? 'app-shell app-shell-home' : 'app-shell app-shell-inner'}>
      <header className={isHome ? 'topbar topbar-home' : 'topbar topbar-inner'}>
        <NavLink className="brand brand-inner" to="/">
          <span className="brand-mark">赴</span>
          <div>
            <strong>一站式赴约小管家</strong>
            <p>{isHome ? '让赴约这件事，先浪漫起来。' : '把每一场期待，提前安排成更安心也更浪漫的赴约。'}</p>
          </div>
        </NavLink>

        {isHome ? (
          <nav className="topnav topnav-home-minimal">
            <NavLink className="topnav-link topnav-link-home-minimal" to="/buddy">
              找搭子
            </NavLink>
            <NavLink className="topnav-link topnav-link-home-cta" to="/planner">
              进入模块
            </NavLink>
          </nav>
        ) : (
          <nav className="topnav">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'topnav-link active' : 'topnav-link')}>
              首页
            </NavLink>
            <NavLink to="/buddy" className={({ isActive }) => (isActive ? 'topnav-link active' : 'topnav-link')}>
              找搭子
            </NavLink>
            <NavLink to="/planner" className={({ isActive }) => (isActive ? 'topnav-link active' : 'topnav-link')}>
              模块入口
            </NavLink>
            <NavLink to="/money" className={({ isActive }) => (isActive ? 'topnav-link active' : 'topnav-link')}>
              记账分账
            </NavLink>
            <NavLink to="/my-trips" className={({ isActive }) => (isActive ? 'topnav-link active' : 'topnav-link')}>
              我的安排
            </NavLink>
          </nav>
        )}
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}
