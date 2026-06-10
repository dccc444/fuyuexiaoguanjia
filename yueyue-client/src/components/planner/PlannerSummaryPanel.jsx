import { Link } from 'react-router-dom'
import { getBasicCompletion, getPlannerModuleStatuses, usePlannerDraft } from '../../store/plannerDraft'

function formatDateTime(dateText) {
  if (!dateText) return '尚未开始保存'

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'numeric',
      day: 'numeric',
    }).format(new Date(dateText))
  } catch {
    return '刚刚保存'
  }
}

export function PlannerSummaryPanel() {
  const { draft, resetDraft } = usePlannerDraft()
  const completion = getBasicCompletion(draft)
  const moduleStatuses = getPlannerModuleStatuses(draft)
  const readyCount = moduleStatuses.filter((item) => item.ready).length

  return (
    <aside className="planner-summary">
      <section className="planner-summary-card">
        <p className="planner-section-title">当前草稿</p>
        <h2>{draft.eventName || '还没有填写活动名称'}</h2>
        <dl className="planner-summary-list">
          <div>
            <dt>场景</dt>
            <dd>{draft.sceneType === 'match' ? '球赛' : draft.sceneType === 'festival' ? '音乐节' : '演唱会'}</dd>
          </div>
          <div>
            <dt>城市 / 场馆</dt>
            <dd>{draft.city || '未填写'}{draft.venue ? ` · ${draft.venue}` : ''}</dd>
          </div>
          <div>
            <dt>日期 / 时间</dt>
            <dd>{draft.eventDate || '未填写'}{draft.startTime ? ` ${draft.startTime}` : ''}</dd>
          </div>
          <div>
            <dt>最近保存</dt>
            <dd>{formatDateTime(draft.lastUpdatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="planner-summary-card">
        <p className="planner-section-title">整体进度</p>
        <div className="planner-progress-row">
          <strong>{readyCount}/{moduleStatuses.length}</strong>
          <span>{completion.isComplete ? '已经可以按模块统筹这次赴约' : '先补基础骨架，再去其他模块'}</span>
        </div>
        <div className="planner-progress-bar" aria-hidden="true">
          <div
            className="planner-progress-fill"
            style={{ width: `${(readyCount / moduleStatuses.length) * 100}%` }}
          />
        </div>
      </section>

      <section className="planner-summary-card planner-summary-actions">
        <Link className="planner-secondary-link" to="/planner">
          回到整体统筹
        </Link>
        <button className="planner-ghost-button" onClick={resetDraft} type="button">
          清空当前草稿
        </button>
      </section>
    </aside>
  )
}
