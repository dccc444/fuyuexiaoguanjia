import { Link } from 'react-router-dom'
import { getBasicCompletion, getPlannerModuleStatuses, usePlannerDraft } from '../../store/plannerDraft'

function buildOverallPlan(draft, moduleStatuses) {
  const firstPending = moduleStatuses.find((item) => !item.ready)

  return [
    {
      title: '基础骨架',
      value:
        [draft.eventName, draft.city, draft.venue].filter(Boolean).join(' · ') ||
        '先定活动、城市和场馆，后面模块才能共用这份草稿。',
      note: firstPending?.key === 'basic' ? '建议优先补基础信息模块。' : '基础信息已经可以支撑后续模块继续展开。',
    },
    {
      title: '到场与规则',
      value:
        draft.city && draft.venue
          ? `${draft.city} ${draft.venue} 的规则模块可以直接查禁带、入口和交通提醒。`
          : '还没定场馆时，先别急着看规则，避免信息太泛。',
      note: draft.latestRoutePlan?.recommended
        ? `当前已有去程路线，建议 ${draft.latestRoutePlan.recommended.departureTimeRecommended || '按推荐时间'} 出发。`
        : '补好出发地后，可以继续去路线模块确认出发时间。',
    },
    {
      title: '现场节奏',
      value:
        draft.ticketArea || draft.meetupPlan || draft.merchPlan
          ? [draft.ticketArea && `票区 ${draft.ticketArea}`, draft.meetupPlan && `会合 ${draft.meetupPlan}`, draft.merchPlan && `物料 ${draft.merchPlan}`]
              .filter(Boolean)
              .join(' · ')
          : '票务、会合、物料还没整理时，先挑你最在意的一块单独解决。',
      note:
        Number(draft.companions || 1) > 1 || !draft.isFirstTime
          ? '你已经有同行或经验基础，建议把搭子 / 会合模块和票务模块一起用。'
          : '如果一个人去，优先把会合、入口和返程节奏拆开看。',
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
          <h2>不用先填大表单，直接按你的问题进入对应模块</h2>
          <p className="planner-module-copy">
            现在的入口不再要求一次性把所有信息填满。你可以先解决最在意的问题，比如规则、路线、票务、搭子，再让这些模块共用同一份草稿，慢慢拼成完整赴约计划。
          </p>
        </div>
        <div className="planner-module-badge">
          <strong>{readyCount}/{moduleStatuses.length}</strong>
          <span>{basic.isComplete ? '已经具备整体统筹基础' : '建议先补基础信息骨架'}</span>
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
                {item.ready ? '可直接用' : '建议先补'}
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
        <p className="planner-section-title">这次赴约的整体计划</p>
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
          {basic.isComplete ? `先去${nextModule.title}` : '先补基础信息'}
        </Link>
        <Link className="planner-secondary-link" to="/buddy">
          先看找搭子广场
        </Link>
      </section>
    </section>
  )
}
