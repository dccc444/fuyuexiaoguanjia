import { NavLink, Outlet, useLocation } from 'react-router-dom'

const primaryTabs = [
  { to: '/', label: '首页', match: (pathname) => pathname === '/' },
  { to: '/planner', label: '规划', match: (pathname) => pathname.startsWith('/planner') || pathname.startsWith('/money') },
  { to: '/buddy', label: '搭子', match: (pathname) => pathname.startsWith('/buddy') || pathname.startsWith('/my-buddy-posts') },
  { to: '/my-trips', label: '我的', match: (pathname) => pathname.startsWith('/my-trips') || pathname.startsWith('/battle-books') },
]

function getPageMeta(pathname) {
  if (pathname.startsWith('/planner')) {
    return {
      title: '赴约规划',
      description: '路线、票务、搭子和预算都能慢慢收好。',
      actionLabel: '导入',
      actionTo: '/planner',
    }
  }

  if (pathname.startsWith('/buddy')) {
    return {
      title: '找搭子',
      description: '先看同城同场，再决定要不要发布。',
      actionLabel: '发布',
      actionTo: '/buddy/new',
    }
  }

  if (pathname.startsWith('/money')) {
    return {
      title: '预算记账',
      description: '默认 AA 和单笔分摊都能在手机上快速操作。',
      actionLabel: '账本',
      actionTo: '/money',
    }
  }

  if (pathname.startsWith('/my-trips') || pathname.startsWith('/battle-books')) {
    return {
      title: '我的安排',
      description: '活动、草稿和手册都收在这里。',
      actionLabel: '规划',
      actionTo: '/planner',
    }
  }

  return {
    title: '赴约小管家',
    description: '让奔赴，比想象更美好。',
    actionLabel: '开始',
    actionTo: '/planner',
  }
}

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const pageMeta = getPageMeta(location.pathname)

  return (
    <div className={isHome ? 'app-shell app-shell-home app-shell-mobile' : 'app-shell app-shell-inner app-shell-mobile'}>
      <div className="mobile-app-frame">
        <header className={isHome ? 'mobile-topbar mobile-topbar-home' : 'mobile-topbar'}>
          <NavLink className="mobile-brand" to="/">
            <span className="brand-mark">赴</span>
            <div>
              <strong>{pageMeta.title}</strong>
              <p>{pageMeta.description}</p>
            </div>
          </NavLink>

          <NavLink className="mobile-top-action" to={pageMeta.actionTo}>
            {pageMeta.actionLabel}
          </NavLink>
        </header>

        <main className="page-shell page-shell-mobile">
          <Outlet />
        </main>

        <nav className="mobile-tabbar" aria-label="主导航">
          {primaryTabs.map((item) => {
            const active = item.match(location.pathname)
            return (
              <NavLink key={item.to} to={item.to} className={active ? 'mobile-tab-link active' : 'mobile-tab-link'}>
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
