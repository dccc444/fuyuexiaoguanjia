import { NavLink } from 'react-router-dom'
import { getPlannerModuleStatuses, usePlannerDraft } from '../../store/plannerDraft'

export function PlannerSidebar() {
  const { draft } = usePlannerDraft()
  const moduleStatuses = getPlannerModuleStatuses(draft)

  return (
    <aside className="planner-sidebar">
      <div className="planner-sidebar-card">
        <p className="planner-sidebar-title">模块入口</p>
        <h2>模块工作台</h2>
        <p className="planner-sidebar-copy">不再走大表单，直接按需求进入小模块。每个模块都会共用同一份草稿，最后再统筹成完整计划。</p>
      </div>

      <nav className="planner-nav-card" aria-label="模块导航">
        <p className="planner-section-title">先挑一个问题开始</p>
        <NavLink
          className={({ isActive }) => (isActive ? 'planner-nav-link active' : 'planner-nav-link')}
          to="/planner"
        >
          <span>整体统筹</span>
          <strong>{moduleStatuses.filter((item) => item.ready).length}/{moduleStatuses.length}</strong>
        </NavLink>
        {moduleStatuses.map((item) => (
          <NavLink
            className={({ isActive }) => (isActive ? 'planner-nav-link active' : 'planner-nav-link')}
            key={item.key}
            to={item.href}
          >
            <span>{item.title}</span>
            <strong>{item.badge}</strong>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
