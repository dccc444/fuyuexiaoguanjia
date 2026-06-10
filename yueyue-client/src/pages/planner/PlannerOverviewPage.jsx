import { Link } from 'react-router-dom'
import { getBasicCompletion, getPlannerModuleStatuses, usePlannerDraft } from '../../store/plannerDraft'

function buildOverallPlan(draft, moduleStatuses) {
  const firstPending = moduleStatuses.find((item) => !item.ready)

  return [
    {
      title: '基础骨架',
      value:
        [draft.eventName, draft.city, draft.venue].filter(Boolean).join(' · ') ||
        '活动、城市和场馆还没定下来。',
      note: firstPending?.key === 'basic' ? '活动、城市和场馆一清楚，后面就顺了。' : '这部分已经够用了，想先看哪块都行。',
    },
    {
      title: '到场与规则',
      value:
        draft.city && draft.venue
          ? `${draft.city} ${draft.venue} 的入口、禁带和交通提醒都能直接看到。`
          : '场馆还没定下来，这一部分会先保持通用提醒。',
      note: draft.latestRoutePlan?.recommended
        ? `当前已有去程路线，建议 ${draft.latestRoutePlan.recommended.departureTimeRecommended || '按推荐时间'} 出发。`
        : '补上出发地后，就能看到建议出发时间。',
    },
    {
      title: '现场节奏',
      value:
        draft.ticketArea || draft.meetupPlan || draft.merchPlan
          ? [draft.ticketArea && `票区 ${draft.ticketArea}`, draft.meetupPlan && `会合 ${draft.meetupPlan}`, draft.merchPlan && `物料 ${draft.merchPlan}`]
              .filter(Boolean)
              .join(' · ')
          : '票务、会合和物料还没整理。',
      note:
        Number(draft.companions || 1) > 1 || !draft.isFirstTime
          ? '同行时把票务和会合一起看，会更省事。'
          : '一个人去的话，把入口、返程和联系点想在前面更安心。',
    },
  ]
}

export function PlannerOverviewPage() {
  const { draft } = usePlannerDraft()
  const basic = getBasicCompletion(draft)
  const moduleStatuses = getPlannerModuleStatuses(draft)
  const readyCount = moduleStatuses.filter((item) => item.ready).length
  const overallPlan = buildOverallPlan(draft, moduleStatuses)
  const nextModule = moduleStatuses.find((item) => !item.ready) || moduleStatuses[1] || moduleStatuses[0]

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">整体统筹</p>
          <h2>把整场安排收好</h2>
          <p className="planner-module-copy">
            活动、路线、票务、搭子和会合，都在这一份里。
          </p>
        </div>
        <div className="planner-module-badge">
          <strong>{readyCount}/{moduleStatuses.length}</strong>
          <span>{basic.isComplete ? '已经能继续安排' : '把活动信息补齐后会更完整'}</span>
        </div>
      </div>

      <div className="planner-overview-grid">
        {moduleStatuses.map((item) => (
          <article className="planner-overview-card" key={item.key}>
            <div className="planner-overview-card-head">
              <div>
                <p className="planner-section-title">{item.title}</p>
                <strong>{item.badge}</strong>
              </div>
              <span className={item.ready ? 'planner-pill' : 'planner-pill planner-pill-muted'}>
                {item.ready ? '已就绪' : '待补充'}
              </span>
            </div>
            <p>{item.status}</p>
            <p className="planner-overview-note">{item.note}</p>
            <Link className="planner-secondary-link" to={item.href}>
              进入{item.title}
            </Link>
          </article>
        ))}
      </div>

      <section className="planner-tip-card">
        <p className="planner-section-title">整体安排</p>
        <div className="planner-overall-plan">
          {overallPlan.map((item) => (
            <article className="planner-overall-step" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.value}</p>
              <span>{item.note}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="planner-summary-card planner-summary-actions">
        <Link className="hero-primary-v3" to={nextModule.href}>
          {basic.isComplete ? `前往${nextModule.title}` : '前往基础信息'}
        </Link>
        <Link className="planner-secondary-link" to="/buddy">
          去看看找搭子广场
        </Link>
      </section>
    </section>
  )
}
