import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listVenueRules } from '../../api'
import { searchEventCatalog } from '../../data/eventCatalog'
import { getBasicCompletion, usePlannerDraft } from '../../store/plannerDraft'

const sceneOptions = [
  { value: 'concert', label: '演唱会', note: '同场搭子、路线和票务一起收好' },
  { value: 'festival', label: '音乐节', note: '多日行程、会合和返程更好安排' },
  { value: 'match', label: '球赛', note: '主队、看台和散场节奏先看清' },
]

const sceneContent = {
  concert: {
    targetLabel: '艺人 / 主演',
    targetPlaceholder: '例如：周杰伦、时代少年团',
    tips: ['艺人、日期和场馆越清楚，后面越省心', '活动信息越完整，后面的提醒会越贴近这场演出'],
  },
  festival: {
    targetLabel: '最想看的乐队 / 舞台',
    targetPlaceholder: '例如：草莓音乐节主舞台、回春丹',
    tips: ['主目标舞台和城市越清楚，现场节奏越好安排', '活动信息清楚后，会合和返程会更好安排'],
  },
  match: {
    targetLabel: '球队 / 比赛',
    targetPlaceholder: '例如：国安、海港、欧冠决赛',
    tips: ['比赛、日期和场馆越清楚，提醒就越实用', '比赛信息越清楚，进场和散场提醒越实用'],
  },
}

export function BasicModulePage() {
  const [searchParams] = useSearchParams()
  const { draft, updateDraft } = usePlannerDraft()
  const [catalog, setCatalog] = useState([])
  const [showManualFields, setShowManualFields] = useState(false)
  const [showExtraSheet, setShowExtraSheet] = useState(false)
  const content = sceneContent[draft.sceneType] || sceneContent.concert
  const completion = getBasicCompletion(draft)

  const filteredCatalog = useMemo(
    () => catalog.filter((item) => item.scenes?.includes(draft.sceneType)),
    [catalog, draft.sceneType],
  )
  const cityOptions = useMemo(
    () =>
      [...new Set([...filteredCatalog.map((item) => item.city), draft.city].filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'zh-CN'),
      ),
    [draft.city, filteredCatalog],
  )
  const venueOptions = useMemo(
    () =>
      [
        ...new Set(
          filteredCatalog
            .filter((item) => {
              if (!draft.city) return true
              return item.city === draft.city
            })
            .map((item) => item.venueName || item.venue)
            .concat(draft.venue)
            .filter(Boolean),
        ),
      ],
    [draft.city, draft.venue, filteredCatalog],
  )
  const eventSuggestions = useMemo(
    () => searchEventCatalog(draft.eventName, draft.sceneType),
    [draft.eventName, draft.sceneType],
  )
  const hasSearchKeyword = String(draft.eventName || '').trim().length >= 2

  useEffect(() => {
    const scene = searchParams.get('scene')
    if (scene && ['concert', 'festival', 'match'].includes(scene) && scene !== draft.sceneType) {
      updateDraft({ sceneType: scene })
    }
  }, [draft.sceneType, searchParams, updateDraft])

  useEffect(() => {
    let ignore = false

    async function loadCatalog() {
      try {
        const data = await listVenueRules()
        if (!ignore) {
          setCatalog(data.items || [])
        }
      } catch {
        if (!ignore) {
          setCatalog([])
        }
      }
    }

    loadCatalog()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (draft.city && !cityOptions.includes(draft.city)) {
      updateDraft({ city: '', venue: '' })
      return
    }

    if (draft.venue && !venueOptions.includes(draft.venue)) {
      updateDraft({ venue: '' })
    }
  }, [cityOptions, draft.city, draft.venue, updateDraft, venueOptions])

  function handleFieldChange(field, value) {
    updateDraft({ [field]: value })
  }

  function handleSceneSelect(sceneType) {
    if (sceneType === draft.sceneType) return
    updateDraft({ sceneType })
  }

  function handleCitySelect(city) {
    if (city === draft.city) return
    updateDraft({ city, venue: '' })
  }

  function handleSelectSuggestion(item) {
    updateDraft({
      sceneType: item.sceneType,
      eventName: item.eventName,
      targetName: item.targetName,
      city: item.city,
      venue: item.venue,
      eventDate: item.eventDate,
      startTime: item.startTime,
    })
  }

  const activitySnapshot = [
    draft.eventName || '这场活动',
    draft.city || '待定城市',
    draft.venue || '待定场馆',
    draft.eventDate || '待定日期',
  ].filter(Boolean)

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">基础信息</p>
          <h2>把活动信息收好</h2>
          <p className="planner-module-copy">活动、城市、场馆和时间，先定在这里。</p>
        </div>
        <div className="planner-module-badge">
          <strong>{completion.completedCount}/{completion.totalCount}</strong>
          <span>{completion.isComplete ? '信息已齐' : '还差几项'}</span>
        </div>
      </div>

      <section className="planner-summary-card">
        <div className="planner-rule-overview-head">
          <div>
            <p className="planner-section-title">当前活动</p>
            <h3>{draft.eventName || '先把这场活动收好'}</h3>
          </div>
        </div>
        <div className="planner-inline-meta-grid">
          <article className="planner-meta-card">
            <span>场景</span>
            <strong>{sceneOptions.find((item) => item.value === draft.sceneType)?.label || '演唱会'}</strong>
          </article>
          <article className="planner-meta-card">
            <span>城市 / 场馆</span>
            <strong>{[draft.city, draft.venue].filter(Boolean).join(' · ') || '待补充'}</strong>
          </article>
          <article className="planner-meta-card">
            <span>时间</span>
            <strong>{[draft.eventDate, draft.startTime].filter(Boolean).join(' · ') || '待补充'}</strong>
          </article>
        </div>
      </section>

      <div className="planner-module-form">
        <label className="planner-field">
          <span>活动名称</span>
          <input
            onChange={(event) => handleFieldChange('eventName', event.target.value)}
            placeholder="例如：周杰伦嘉年华世界巡回演唱会"
            type="text"
            value={draft.eventName}
          />
          <p className="planner-field-hint">输入演唱会名称后，可以直接带入城市、场馆和时间。</p>
          {eventSuggestions.length ? (
            <div className="planner-suggestion-list">
              <div className="planner-suggestion-head">
                <span>推荐场次</span>
                <strong>选一条，下面信息会自动补齐</strong>
              </div>
              {eventSuggestions.map((item) => (
                <button
                  className="planner-suggestion-item"
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  type="button"
                >
                  <span className="planner-suggestion-tag">{sceneOptions.find((option) => option.value === item.sceneType)?.label}</span>
                  <strong>{item.eventName}</strong>
                  <span>{[item.city, item.venue].filter(Boolean).join(' · ')}</span>
                  <span className="planner-suggestion-meta">{[item.eventDate, item.startTime].filter(Boolean).join(' · ')}</span>
                </button>
              ))}
            </div>
          ) : hasSearchKeyword ? (
            <div className="planner-suggestion-empty">
              <strong>还没有找到对应场次</strong>
              <p>可以先手动填写城市、场馆和时间，后面我再继续补更全的活动库。</p>
            </div>
          ) : null}
        </label>

        <div className="planner-compact-actions">
          {sceneOptions.map((option) => (
            <button
              className={draft.sceneType === option.value ? 'planner-mini-chip active' : 'planner-mini-chip'}
              key={option.value}
              onClick={() => handleSceneSelect(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
          <button
            className={showManualFields ? 'planner-mini-chip active' : 'planner-mini-chip'}
            onClick={() => setShowManualFields((current) => !current)}
            type="button"
          >
            {showManualFields ? '收起手动补充' : '手动补充信息'}
          </button>
        </div>
        <p className="planner-field-hint">
          先搜活动名称最省事；如果没命中，再点小按钮补城市、场馆和时间。
        </p>

        {showManualFields ? (
          <section className="planner-compact-panel">
            <div className="planner-form-grid planner-form-grid-compact">
              <label className="planner-field">
                <span>城市</span>
                <div className="planner-choice-group">
                  <div className="planner-choice-grid">
                    {cityOptions.length ? (
                      cityOptions.map((city) => (
                        <button
                          className={draft.city === city ? 'planner-choice-card active' : 'planner-choice-card'}
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          type="button"
                        >
                          <strong>{city}</strong>
                          <span>{draft.city === city ? '已选择' : '点击选择'}</span>
                        </button>
                      ))
                    ) : (
                      <div className="planner-choice-empty">
                        <strong>先输入活动名称</strong>
                        <p>输入后会更容易带出相关城市，也能减少手动选择。</p>
                      </div>
                    )}
                  </div>
                </div>
              </label>

              <label className="planner-field planner-field-wide">
                <span>场馆</span>
                {draft.city ? (
                  <div className="planner-choice-group">
                    {venueOptions.length ? (
                      <div className="planner-choice-grid planner-choice-grid-wide">
                        {venueOptions.map((venue) => (
                          <button
                            className={draft.venue === venue ? 'planner-choice-card active' : 'planner-choice-card'}
                            key={venue}
                            onClick={() => handleFieldChange('venue', venue)}
                            type="button"
                          >
                            <strong>{venue}</strong>
                            <span>{draft.venue === venue ? '已选择' : draft.city}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="planner-choice-empty">
                        <strong>这座城市暂时还没有预置场馆</strong>
                        <p>可以先通过活动联想带入，或者后面我再继续补场馆库。</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="planner-choice-empty">
                    <strong>先选城市，再选场馆</strong>
                    <p>这样场馆会更少、更好选，也更像移动端一步一步完成。</p>
                  </div>
                )}
              </label>
            </div>
          </section>
        ) : null}
      </div>

      <button
        className="planner-bottom-sheet-trigger"
        onClick={() => setShowExtraSheet(true)}
        type="button"
      >
        <span>补充信息</span>
        <strong>{activitySnapshot.join(' · ')}</strong>
        <em>{draft.targetName || draft.eventDate || draft.startTime ? '继续完善这场活动' : '补上艺人、日期和时间'}</em>
      </button>

      {showExtraSheet ? (
        <div className="dialog-backdrop planner-bottom-sheet-backdrop" onClick={() => setShowExtraSheet(false)} role="presentation">
          <section
            aria-labelledby="planner-extra-sheet-title"
            aria-modal="true"
            className="planner-bottom-sheet-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="planner-bottom-sheet-handle" />
            <div className="dialog-header planner-bottom-sheet-header">
              <div>
                <p className="planner-section-title">补充信息</p>
                <h3 id="planner-extra-sheet-title">把这场活动再补完整一点</h3>
              </div>
              <button className="planner-ghost-button" onClick={() => setShowExtraSheet(false)} type="button">
                关闭
              </button>
            </div>

            <div className="planner-form-grid planner-form-grid-compact">
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

            <section className="planner-stage-note">
              <p className="planner-section-title">填写提醒</p>
              <ul>
                {content.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
                <li>先选城市再选场馆，更容易找到常用场地。</li>
              </ul>
              <p className="planner-tip-note">这里填好后，路线、规则和票务都会直接带入。</p>
            </section>
          </section>
        </div>
      ) : null}
    </section>
  )
}
