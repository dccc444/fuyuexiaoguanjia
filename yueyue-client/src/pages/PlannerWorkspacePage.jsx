import { useEffect, useState } from 'react'
import { NavLink, Outlet, useSearchParams } from 'react-router-dom'
import { getBattleBook } from '../api'
import { PlannerDraftProvider, getPlannerModuleStatuses, usePlannerDraft } from '../store/plannerDraft'

export function PlannerWorkspacePage() {
  return (
    <PlannerDraftProvider>
      <PlannerWorkspaceInner />
    </PlannerDraftProvider>
  )
}

function PlannerWorkspaceInner() {
  const [searchParams] = useSearchParams()
  const { draft, updateDraft } = usePlannerDraft()
  const [importState, setImportState] = useState({
    loading: Boolean(searchParams.get('from')),
    message: '',
  })
  const moduleStatuses = getPlannerModuleStatuses(draft)
  const readyCount = moduleStatuses.filter((item) => item.ready).length
  const primaryModule = moduleStatuses.find((item) => !item.ready) || moduleStatuses[0]
  const quickStartCards = [
    {
      key: 'basic',
      label: '基础信息',
      title: '填写活动信息',
      note: '把城市、场馆、日期和时间补齐。',
      action: '去基础信息',
      href: '/planner/basic',
    },
    {
      key: 'travel',
      label: '两段路线',
      title: '看看怎么到场',
      note: '跨城先看大交通，到城后再接市内路线。',
      action: '去路线规划',
      href: '/planner/travel',
    },
    {
      key: 'rules',
      label: '进场规则',
      title: '确认场馆提醒',
      note: '把禁带、入口和进场细节先收好。',
      action: '去看规则',
      href: '/planner/rules',
    },
  ]

  useEffect(() => {
    const scene = searchParams.get('scene')
    if (!scene || !['concert', 'festival', 'match'].includes(scene)) return
    updateDraft({ sceneType: scene })
  }, [searchParams, updateDraft])

  useEffect(() => {
    const fromId = searchParams.get('from')
    if (!fromId) {
      setImportState({ loading: false, message: '' })
      return
    }

    let active = true
    setImportState({ loading: true, message: '' })

    getBattleBook(fromId)
      .then((data) => {
        if (!active || !data?.item?.input) return
        updateDraft(data.item.input)
        setImportState({
          loading: false,
          message: '上一份安排已经带过来了。',
        })
      })
      .catch(() => {
        if (!active) return
        setImportState({
          loading: false,
          message: '没找到那份安排，就从这里重新开始。',
        })
      })

    return () => {
      active = false
    }
  }, [searchParams, updateDraft])

  return (
    <div className="planner-hub-page">
      <section className="planner-hub-header planner-hub-header-mobile">
        <div>
          <p className="planner-hero-kicker">活动规划</p>
          <h1>把这场安排收好</h1>
          <p className="planner-hero-copy">路线、票务、搭子和预算，都从这里开始。</p>
          {importState.loading || importState.message ? (
            <p className="planner-hero-copy">
              {importState.loading ? '正在带入上一份安排...' : importState.message}
            </p>
          ) : null}
        </div>

        <div className="planner-mobile-hero-foot">
          <div className="planner-mobile-progress-card">
            <span>当前进度</span>
            <strong>{readyCount}/{moduleStatuses.length}</strong>
            <p>已经收好 {readyCount} 项。</p>
          </div>

          <div className="planner-mobile-hero-actions">
            <NavLink className="hero-primary-v3" to={primaryModule.href}>
              继续{primaryModule.title}
            </NavLink>
            <NavLink className="hero-secondary-v3" to="/planner/overview">
              查看整份计划
            </NavLink>
          </div>
        </div>
      </section>

      <section className="planner-mobile-priority">
        <div className="planner-section-head-compact">
          <div>
            <p className="planner-section-title">最快开始</p>
            <h2>从最想处理的地方开始</h2>
          </div>
        </div>

        <div className="planner-mobile-priority-grid">
          {quickStartCards.map((item) => (
            <NavLink className="planner-priority-card" key={item.key} to={item.href}>
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.note}</p>
              <em>{item.action}</em>
            </NavLink>
          ))}
        </div>
      </section>

      <nav className="planner-demand-grid" aria-label="功能板块">
        {moduleStatuses.map((item) => (
          <NavLink
            className={({ isActive }) => (isActive ? 'planner-demand-card active' : 'planner-demand-card')}
            key={item.key}
            to={item.href}
          >
            <div className="planner-demand-top">
              <strong>{item.title}</strong>
              <span>{item.badge}</span>
            </div>
            <p>{item.status}</p>
            <small className="planner-demand-note">{item.note}</small>
          </NavLink>
        ))}
      </nav>

      <section className="planner-summary-card planner-summary-actions">
        <NavLink className="hero-primary-v3" to="/planner/overview">
          查看整份计划
        </NavLink>
        <NavLink className="planner-secondary-link" to="/my-trips">
          回到我的安排
        </NavLink>
      </section>

      <main className="planner-hub-content">
        <Outlet />
      </main>
    </div>
  )
}
