import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getBasicCompletion, usePlannerDraft } from '../../store/plannerDraft'

const sceneOptions = [
  { value: 'concert', label: '演唱会' },
  { value: 'festival', label: '音乐节' },
  { value: 'match', label: '球赛' },
]

const sceneContent = {
  concert: {
    targetLabel: '艺人 / 主演',
    targetPlaceholder: '例如：周杰伦、时代少年团',
    tips: ['适合先确定艺人、日期、场馆', '后续会补场馆规则、搭子和返程模块'],
  },
  festival: {
    targetLabel: '最想看的乐队 / 舞台',
    targetPlaceholder: '例如：草莓音乐节主舞台、回春丹',
    tips: ['适合先定主目标舞台和城市', '后续会补补给、住宿和返程模块'],
  },
  match: {
    targetLabel: '球队 / 比赛',
    targetPlaceholder: '例如：国安、海港、欧冠决赛',
    tips: ['适合先定比赛、日期和场馆', '后续会补看台提醒和入场动线模块'],
  },
}

export function BasicModulePage() {
  const [searchParams] = useSearchParams()
  const { draft, updateDraft } = usePlannerDraft()
  const content = sceneContent[draft.sceneType] || sceneContent.concert
  const completion = getBasicCompletion(draft)

  useEffect(() => {
    const scene = searchParams.get('scene')
    if (scene && ['concert', 'festival', 'match'].includes(scene) && scene !== draft.sceneType) {
      updateDraft({ sceneType: scene })
    }
  }, [draft.sceneType, searchParams, updateDraft])

  function handleFieldChange(field, value) {
    updateDraft({ [field]: value })
  }

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">基础信息模块</p>
          <h2>先把这次赴约定清楚</h2>
          <p className="planner-module-copy">这一步只保留最小必要字段，填完后后续模块就可以复用这份草稿，不用每次重复输入。</p>
        </div>
        <div className="planner-module-badge">
          <strong>{completion.completedCount}/{completion.totalCount}</strong>
          <span>{completion.isComplete ? '可进入下一模块' : '继续补充中'}</span>
        </div>
      </div>

      <div className="planner-form-grid">
        <label className="planner-field">
          <span>场景类型</span>
          <select value={draft.sceneType} onChange={(event) => handleFieldChange('sceneType', event.target.value)}>
            {sceneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="planner-field">
          <span>活动名称</span>
          <input
            onChange={(event) => handleFieldChange('eventName', event.target.value)}
            placeholder="例如：周杰伦嘉年华世界巡回演唱会"
            type="text"
            value={draft.eventName}
          />
        </label>

        <label className="planner-field">
          <span>{content.targetLabel}</span>
          <input
            onChange={(event) => handleFieldChange('targetName', event.target.value)}
            placeholder={content.targetPlaceholder}
            type="text"
            value={draft.targetName}
          />
        </label>

        <label className="planner-field">
          <span>城市</span>
          <input
            onChange={(event) => handleFieldChange('city', event.target.value)}
            placeholder="例如：上海"
            type="text"
            value={draft.city}
          />
        </label>

        <label className="planner-field">
          <span>场馆</span>
          <input
            onChange={(event) => handleFieldChange('venue', event.target.value)}
            placeholder="例如：上海体育场"
            type="text"
            value={draft.venue}
          />
        </label>

        <label className="planner-field">
          <span>活动日期</span>
          <input
            onChange={(event) => handleFieldChange('eventDate', event.target.value)}
            type="date"
            value={draft.eventDate}
          />
        </label>

        <label className="planner-field">
          <span>开始时间</span>
          <input
            onChange={(event) => handleFieldChange('startTime', event.target.value)}
            type="time"
            value={draft.startTime}
          />
        </label>
      </div>

      <section className="planner-tip-card">
        <p className="planner-section-title">当前场景提示</p>
        <ul>
          {content.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="planner-tip-note">表单会自动保存到本地。后续你刷新页面或再次进入模块工作台，草稿仍会保留。</p>
      </section>
    </section>
  )
}
