import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBuddyPosts, toggleBuddyFavorite } from '../api'

const defaultFilters = {
  city: '',
  eventDate: '',
  sceneType: '',
  intentType: '',
  venue: '',
  intentTag: '',
}

const intentOptions = [
  { value: '', label: '全部搭子类型' },
  { value: '一起进场', label: '一起进场' },
  { value: '一起散场', label: '一起散场' },
  { value: '场外会合', label: '场外会合' },
  { value: '同区看台', label: '同区看台' },
  { value: '一起领物料', label: '一起领物料' },
  { value: '拼车', label: '拼车' },
  { value: '拼房', label: '拼房' },
  { value: '一个人也想找伴', label: '一个人也想找伴' },
]

const tagOptions = [
  { value: '', label: '全部标签' },
  { value: '一起进场', label: '一起进场' },
  { value: '一起散场', label: '一起散场' },
  { value: '场外会合', label: '场外会合' },
  { value: '同区看台', label: '同区看台' },
  { value: '一起领物料', label: '一起领物料' },
  { value: '拼车', label: '拼车' },
  { value: '拼房', label: '拼房' },
  { value: '都可以聊', label: '都可以聊' },
]

const sceneTypeChips = [
  { value: '', label: '全部' },
  { value: 'concert', label: '演唱会' },
  { value: 'festival', label: '音乐节' },
  { value: 'match', label: '球赛' },
]

const quickIntentChips = ['一起进场', '一起散场', '场外会合', '拼车']

function formatTimeLabel(value) {
  if (!value) {
    return '刚刚更新'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '刚刚更新'
  }

  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatContactVisibility(value) {
  if (value === 'public') {
    return '联系方式公开'
  }

  if (value === 'after_join') {
    return '想一起后可见'
  }

  return '联系方式可控'
}

function formatSceneLabel(value) {
  if (value === 'festival') return '音乐节'
  if (value === 'match') return '球赛'
  if (value === 'concert') return '演唱会'
  return '活动'
}

function getContactActionLabel(item) {
  if (item.contactVisibility === 'public') return '立即联系'
  if (item.hasJoined) return '继续联系'
  return '我也想一起'
}

export function BuddySquarePage() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const data = await listBuddyPosts(filters)
        if (active) {
          setItems(data.items || [])
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || '读取找搭子广场失败。')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
  }, [filters])

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => String(value || '').trim()).length,
    [filters]
  )
  const selectedScene = filters.sceneType || '全部活动'

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function resetFilters() {
    setFilters(defaultFilters)
  }

  async function handleFavorite(id) {
    setActingId(id)

    try {
      const data = await toggleBuddyFavorite(id)
      setItems((current) => current.map((item) => (item.id === id ? data.item : item)))
    } catch (submitError) {
      setError(submitError.message || '收藏失败，请稍后再试。')
    } finally {
      setActingId('')
    }
  }

  return (
    <section className="planner-module-card">
      <div className="planner-module-header buddy-square-hero">
        <div className="buddy-square-hero-copy">
          <p className="planner-section-title">找搭子广场</p>
          <h2>找同场的人</h2>
          <p className="planner-module-copy">先筛一遍，再看同频的人。</p>
        </div>
        <div className="buddy-square-hero-actions">
          <Link className="hero-primary-v3" to="/buddy/new">
            发布我的搭子邀约
          </Link>
          <Link className="hero-secondary-v3" to="/my-buddy-posts">
            我的发布
          </Link>
        </div>
      </div>

      <section className="buddy-square-type-row" aria-label="活动类型">
        {sceneTypeChips.map((item) => (
          <button
            key={item.label}
            className={filters.sceneType === item.value ? 'buddy-filter-chip active' : 'buddy-filter-chip'}
            onClick={() => updateFilter('sceneType', item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </section>

      <section className="buddy-square-summary-strip">
        <article className="buddy-summary-card">
          <span>当前场景</span>
          <strong>{selectedScene}</strong>
          <p>这一类活动的人，会先显示在这里。</p>
        </article>
        <article className="buddy-summary-card">
          <span>筛选状态</span>
          <strong>{activeFilterCount} 个条件</strong>
          <p>{activeFilterCount > 0 ? '列表已经按你的偏好刷新。' : '先逛逛广场，看到合适的人再细筛。'}</p>
        </article>
      </section>

      <section className="planner-module-form">
        <div className="buddy-quick-chip-row" aria-label="快速筛选">
          {quickIntentChips.map((chip) => (
            <button
              key={chip}
              className={filters.intentType === chip ? 'buddy-filter-chip soft active' : 'buddy-filter-chip soft'}
              onClick={() => updateFilter('intentType', filters.intentType === chip ? '' : chip)}
              type="button"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="planner-form-grid">
          <label className="planner-field">
            <span>城市</span>
            <input
              onChange={(event) => updateFilter('city', event.target.value)}
              placeholder="例如：上海 / 广州"
              type="text"
              value={filters.city}
            />
          </label>
          <label className="planner-field">
            <span>日期</span>
            <input
              onChange={(event) => updateFilter('eventDate', event.target.value)}
              type="date"
              value={filters.eventDate}
            />
          </label>
          <label className="planner-field">
            <span>场馆</span>
            <input
              onChange={(event) => updateFilter('venue', event.target.value)}
              placeholder="例如：梅奔 / 体育场"
              type="text"
              value={filters.venue}
            />
          </label>
          <label className="planner-field">
            <span>搭子类型</span>
            <select onChange={(event) => updateFilter('intentType', event.target.value)} value={filters.intentType}>
              {intentOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="planner-field">
            <span>同行标签</span>
            <select onChange={(event) => updateFilter('intentTag', event.target.value)} value={filters.intentTag}>
              {tagOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="planner-submit-row">
          <span className="planner-submit-hint">
            已按 {activeFilterCount} 个条件筛选，列表会自动刷新。
          </span>
          <button className="ghost-button" onClick={resetFilters} type="button">
            清空筛选
          </button>
        </div>
      </section>

      {loading ? <section className="planner-rule-empty"><p>正在加载广场内容...</p></section> : null}
      {error ? <section className="planner-rule-empty"><strong>读取失败</strong><p>{error}</p></section> : null}

      {!loading && !error ? (
        items.length > 0 ? (
          <div className="planner-rules-layout">
            {items.map((item) => (
              <section className="planner-rule-overview buddy-post-card" key={item.id}>
                <div className="planner-rule-overview-head">
                  <div>
                    <p className="planner-section-title">{item.intentType}</p>
                    <h3>{item.eventName}</h3>
                    <p className="planner-rule-summary">
                      {item.targetName || '主目标待补充'} · 更新于 {formatTimeLabel(item.updatedAt || item.createdAt)}
                    </p>
                  </div>
                  <div className="planner-rule-meta">
                    <span>{formatSceneLabel(item.sceneType)}</span>
                    <span>{item.city}</span>
                    <span>{item.eventDate}</span>
                  </div>
                </div>
                <p className="planner-rule-summary">
                  {item.venue}
                  {item.ticketArea ? ` · ${item.ticketArea}` : ''}
                </p>
                {item.intentTags?.length ? (
                  <div className="tag-chip-row">
                    {item.intentTags.map((tag) => (
                      <span className="tag-chip active" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="planner-module-copy buddy-card-copy">{item.content}</p>
                <div className="buddy-card-meta-row">
                  <span>{item.isFirstTime ? '第一次去' : '去过现场'}</span>
                  <span>想找 {item.companionsExpected} 人</span>
                  <span>已有 {item.joinIntentCount || 0} 人想一起</span>
                  <span>{formatContactVisibility(item.contactVisibility)}</span>
                </div>
                <div className="planner-summary-card planner-summary-actions buddy-card-actions">
                  <Link className="hero-primary-v3 compact" to={`/buddy/${item.id}`}>
                    {getContactActionLabel(item)}
                  </Link>
                  <button
                    className="ghost-button"
                    disabled={actingId === item.id}
                    onClick={() => handleFavorite(item.id)}
                    type="button"
                  >
                    {actingId === item.id ? '处理中...' : item.isFavorited ? `已收藏 ${item.favoriteCount || 0}` : `收藏 ${item.favoriteCount || 0}`}
                  </button>
                  <Link className="planner-secondary-link" to={`/buddy/${item.id}`}>
                    查看详情
                  </Link>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="planner-rule-empty">
            <strong>{activeFilterCount > 0 ? '当前筛选条件下还没有匹配帖子' : '广场里还没有帖子'}</strong>
            <p>{activeFilterCount > 0 ? '换个城市、日期或搭子类型再看看。' : '还没人发帖，来发第一条吧。'}</p>
          </section>
        )
      ) : null}

      <div className="buddy-square-floating-cta">
        <Link className="hero-primary-v3" to="/buddy/new">
          发布我的搭子邀约
        </Link>
      </div>
    </section>
  )
}
