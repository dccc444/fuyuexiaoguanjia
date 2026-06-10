import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getVenueRulePreview, listVenueRules } from '../../api'
import { usePlannerDraft } from '../../store/plannerDraft'

const sceneOptions = [
  { value: 'concert', label: '演唱会' },
  { value: 'festival', label: '音乐节' },
  { value: 'match', label: '球赛' },
]

function formatDate(dateText) {
  if (!dateText) return '待补充'

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(new Date(dateText))
  } catch {
    return dateText
  }
}

function RuleList({ title, items, tone }) {
  if (!items || items.length === 0) return null

  return (
    <section className={`planner-rule-section planner-rule-section-${tone}`}>
      <div className="planner-rule-section-head">
        <h3>{title}</h3>
        <span>{items.length} 条</span>
      </div>
      <ul className="planner-rule-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function RulesModulePage() {
  const { draft, updateDraft } = usePlannerDraft()
  const [catalog, setCatalog] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingRule, setLoadingRule] = useState(false)
  const [rule, setRule] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    listVenueRules()
      .then((data) => {
        if (!active) return
        setCatalog(Array.isArray(data.items) ? data.items : [])
      })
      .catch(() => {
        if (active) setCatalog([])
      })
      .finally(() => {
        if (active) setLoadingCatalog(false)
      })

    return () => {
      active = false
    }
  }, [])

  const cityOptions = useMemo(
    () =>
      [...new Set(catalog.filter((item) => item.scenes.includes(draft.sceneType)).map((item) => item.city))].sort(
        (a, b) => a.localeCompare(b, 'zh-CN'),
      ),
    [catalog, draft.sceneType],
  )

  const venueOptions = useMemo(
    () =>
      catalog.filter((item) => {
        if (!item.scenes.includes(draft.sceneType)) return false
        if (!draft.city) return true
        return item.city === draft.city
      }),
    [catalog, draft.city, draft.sceneType],
  )

  const venueNames = useMemo(
    () => [...new Set(venueOptions.map((item) => item.venueName))],
    [venueOptions],
  )

  useEffect(() => {
    if (!draft.city || !draft.venue) {
      setRule(null)
      setError('')
      return
    }

    let active = true
    setLoadingRule(true)
    setError('')

    getVenueRulePreview({
      city: draft.city,
      venue: draft.venue,
      sceneType: draft.sceneType,
    })
      .then((data) => {
        if (!active) return
        setRule(data.item || null)
        if (!data.item) {
          setError('目前还没有命中这座场馆的规则，可以先换成系统内场馆，或继续走旧创建页生成完整手册。')
        }
      })
      .catch((requestError) => {
        if (!active) return
        setRule(null)
        setError(requestError.message || '读取场馆规则失败，请稍后再试。')
      })
      .finally(() => {
        if (active) setLoadingRule(false)
      })

    return () => {
      active = false
    }
  }, [draft.city, draft.venue, draft.sceneType])

  function updateField(name, value) {
    if (name === 'sceneType') {
      const venueStillValid = catalog.some(
        (item) => item.scenes.includes(value) && item.city === draft.city && item.venueName === draft.venue,
      )

      updateDraft({
        sceneType: value,
        venue: venueStillValid ? draft.venue : '',
      })
      return
    }

    if (name === 'city') {
      updateDraft({
        city: value,
        venue: '',
      })
      return
    }

    updateDraft({ [name]: value })
  }

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">场馆规则模块</p>
          <h2>先把这座场馆的入场规矩看清楚</h2>
          <p className="planner-module-copy">
            这个模块现在支持直接手填城市和场馆，不再强依赖其他模块。规则会优先展示禁带、入口、交通和来源更新时间，方便你单独快速确认风险。
          </p>
        </div>
        <div className="planner-module-badge">
          <strong>{rule?.matched ? '已命中' : loadingRule ? '查询中' : '待查询'}</strong>
          <span>{draft.city && draft.venue ? '已补城市和场馆' : '先补城市和场馆'}</span>
        </div>
      </div>

      <div className="planner-form-grid">
        <label className="planner-field">
          <span>场景类型</span>
          <select value={draft.sceneType} onChange={(event) => updateField('sceneType', event.target.value)}>
            {sceneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="planner-field">
          <span>城市</span>
          <input
            list="planner-rule-cities"
            onChange={(event) => updateField('city', event.target.value)}
            placeholder={loadingCatalog ? '正在加载城市...' : cityOptions.length ? '可直接输入或选择城市' : '例如：上海、广州、北京'}
            type="text"
            value={draft.city}
          />
          <datalist id="planner-rule-cities">
            {cityOptions.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </label>

        <label className="planner-field planner-field-wide">
          <span>场馆</span>
          <input
            list="planner-rule-venues"
            onChange={(event) => updateField('venue', event.target.value)}
            placeholder={
              draft.city
                ? venueNames.length
                  ? '可直接输入或选择场馆'
                  : '当前城市暂无预置场馆，可手动输入'
                : '请先填写城市'
            }
            type="text"
            value={draft.venue}
          />
          <datalist id="planner-rule-venues">
            {venueNames.map((venueName) => (
              <option key={venueName} value={venueName} />
            ))}
          </datalist>
        </label>
      </div>

      {!draft.city || !draft.venue ? (
        <section className="planner-tip-card">
          <p className="planner-section-title">使用提示</p>
          <ul>
            <li>你可以先在这里直接选择城市和系统场馆，不必回到完整创建页。</li>
            <li>如果想让后续返程、票务模块都直接复用，建议先把基础信息模块也补完整。</li>
            <li>
              现在只要补好城市和场馆，就能单独查规则。需要的话可前往
              {' '}
              <Link className="planner-inline-link" to="/planner/basic">
                基础信息模块
              </Link>
              继续完善草稿。
            </li>
          </ul>
        </section>
      ) : null}

      {loadingRule ? (
        <section className="planner-rule-loading">
          <strong>正在查询场馆规则...</strong>
          <p>会优先返回入口提醒、禁带物、可带条件和交通建议。</p>
        </section>
      ) : null}

      {!loadingRule && error ? (
        <section className="planner-rule-empty">
          <strong>暂时还没有命中规则</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {!loadingRule && rule ? (
        <div className="planner-rules-layout">
          <section className="planner-rule-overview">
            <div className="planner-rule-overview-head">
              <div>
                <p className="planner-section-title">规则概览</p>
                <h3>
                  {rule.city} · {rule.venueName}
                </h3>
              </div>
              <div className="planner-rule-meta">
                <span>{rule.sceneLabel || '赴约场景'}</span>
                <span>更新于 {formatDate(rule.lastVerified)}</span>
              </div>
            </div>

            <p className="planner-rule-summary">{rule.summary}</p>

            <div className="planner-transport-grid">
              <article className="planner-transport-card">
                <p className="planner-section-title">到场交通</p>
                <strong>公共交通优先</strong>
                <p>{rule.transport?.publicTransport || '以主办方公告为准。'}</p>
              </article>
              <article className="planner-transport-card">
                <p className="planner-section-title">停车提示</p>
                <strong>自驾风险提醒</strong>
                <p>{rule.transport?.parking || '建议优先公共交通。'}</p>
              </article>
            </div>
          </section>

          <RuleList items={rule.entryTips} title="入口提醒" tone="soft" />
          <RuleList items={rule.prohibitedItems} title="禁带物" tone="danger" />
          <RuleList items={rule.allowedOrConditional} title="条件可带 / 补充说明" tone="safe" />

          <section className="planner-rule-section planner-rule-section-source">
            <div className="planner-rule-section-head">
              <h3>来源与校验</h3>
              <span>{rule.sources?.length || 0} 条来源</span>
            </div>
            <p className="planner-rule-source-note">{rule.sourceNote || '来源待补充'}</p>
            {rule.sources?.length ? (
              <div className="planner-source-list">
                {rule.sources.map((source) => (
                  <a
                    className="planner-source-item"
                    href={source.url}
                    key={`${source.title}-${source.url}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <strong>{source.title}</strong>
                    <span>
                      {source.publisher}
                      {source.lastVerified ? ` · ${source.lastVerified}` : ''}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="planner-rule-empty-note">这条规则还没有补充公开来源链接。</p>
            )}
          </section>
        </div>
      ) : null}
    </section>
  )
}
