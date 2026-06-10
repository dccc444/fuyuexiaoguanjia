import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createShareLink, deleteBattleBook, regenerateBattleBook } from '../api'
import { useBattleBooks } from '../hooks/useBattleBooks'
import { getTripMeta, hasBrokenText, sceneLabelFromType } from '../utils/tripMeta'

const sceneFilters = ['全部', '演唱会', '音乐节', '球赛']

function StatsCard({ title, value, note, tone }) {
  return (
    <article className={`trip-stat-card stat-card-base tone-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}

export function MyTripsPage() {
  const navigate = useNavigate()
  const { items, loading, error, refresh } = useBattleBooks()
  const [activeFilter, setActiveFilter] = useState('全部')
  const [sharingId, setSharingId] = useState('')
  const [repairingId, setRepairingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!notice) return undefined

    const timer = window.setTimeout(() => setNotice(''), 2400)
    return () => window.clearTimeout(timer)
  }, [notice])

  async function handleDelete(id) {
    try {
      setDeletingId(id)
      setActionError('')
      await deleteBattleBook(id)
      await refresh()
      setNotice('这份安排已经删除。')
    } catch (deleteError) {
      setActionError(deleteError.message || '删除失败，请稍后再试。')
    } finally {
      setDeletingId('')
    }
  }

  async function handleShare(id) {
    try {
      setSharingId(id)
      setActionError('')
      const data = await createShareLink(id)
      await navigator.clipboard.writeText(data.shareUrl)
      setNotice('分享链接已经复制好了。')
    } catch (shareError) {
      setActionError(shareError.message || '复制分享链接失败，请稍后再试。')
    } finally {
      setSharingId('')
    }
  }

  async function handleRepair(id) {
    try {
      setRepairingId(id)
      setActionError('')
      await regenerateBattleBook(id)
      await refresh()
      setNotice('这份手册已经重新生成好了。')
    } catch (repairError) {
      setActionError(repairError.message || '重新生成失败，请稍后再试。')
    } finally {
      setRepairingId('')
    }
  }

  const filteredItems = useMemo(() => {
    if (activeFilter === '全部') return items
    return items.filter((trip) => sceneLabelFromType(trip.input.sceneType) === activeFilter)
  }, [activeFilter, items])

  const featuredTrip = filteredItems[0]
  const contentTrips = filteredItems.slice(1)
  const upcomingCount = filteredItems.length
  const cityCount = new Set(filteredItems.map((trip) => getTripMeta(trip).city).filter(Boolean)).size
  const shareReadyCount = filteredItems.filter((trip) => !hasBrokenText(trip.input.eventName)).length

  return (
    <div className="trips-dashboard-v2">
      {notice || actionError || error ? (
        <div className="feedback-stack">
          {notice ? <section className="panel-v3 panel-v3-light success-banner success-banner-inner">{notice}</section> : null}
          {actionError ? <section className="panel-v3 panel-v3-light error-text">{actionError}</section> : null}
          {error ? <section className="panel-v3 panel-v3-light error-text">{error}</section> : null}
        </div>
      ) : null}

      <section className="panel-v3 panel-v3-light trips-shell-hero">
        <div>
          <p className="section-kicker-v3">Trip Manager</p>
          <h1>我的安排</h1>
          <p className="section-subcopy-v3">
            把演唱会、音乐节和球赛的安排都收在这里。你可以继续打开手册、去做预算记账，也可以把旧数据重新生成一遍。
          </p>
        </div>
        <div className="action-cluster">
          <button className="hero-secondary-v3" onClick={() => setActiveFilter('全部')} type="button">
            查看全部安排
          </button>
          <button className="hero-primary-v3" onClick={() => navigate('/planner')} type="button">
            从模块开始
          </button>
        </div>
      </section>

      <section className="panel-v3 panel-v3-light trips-toolbar-v2">
        <div className="section-head-v3">
          <div>
            <p className="section-kicker-v3">场景筛选</p>
            <h2>先按场景切换，再继续看你最近的安排</h2>
          </div>
        </div>
        <div className="choice-chip-row">
          {sceneFilters.map((filter) => (
            <button
              className={activeFilter === filter ? 'choice-chip active' : 'choice-chip'}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="trip-stat-grid">
        <StatsCard note="你最近收进来的赴约安排数量。" title="当前安排" tone="blue" value={`${upcomingCount} 场`} />
        <StatsCard note="已经覆盖到的城市数，后面可以继续扩场馆。" title="城市跨度" tone="mint" value={`${cityCount || 0} 座`} />
        <StatsCard note="活动名和关键信息完整，可以直接拿去分享的安排。" title="可直接分享" tone="orange" value={`${shareReadyCount} 份`} />
      </section>

      {loading ? <section className="panel-v3 panel-v3-light empty-state-v3">正在加载你的安排...</section> : null}

      {!loading && filteredItems.length === 0 ? (
        <section className="panel-v3 panel-v3-light empty-state-v3">这里还没有符合当前筛选条件的安排，先去模块工作台补一场吧。</section>
      ) : null}

      {!loading && featuredTrip ? (
        <section className="panel-v3 panel-v3-light trip-featured-card">
          <div className="trip-featured-copy">
            <p className="section-kicker-v3">最近安排</p>
            <h2>{getTripMeta(featuredTrip).eventName}</h2>
            <p className="section-subcopy-v3">
              {getTripMeta(featuredTrip).sceneLabel} 路 {getTripMeta(featuredTrip).city} 路 {getTripMeta(featuredTrip).venue}
            </p>
            <div className="trip-meta-row">
              <span>{getTripMeta(featuredTrip).targetName}</span>
              <span>{getTripMeta(featuredTrip).ticketArea}</span>
              <span>{getTripMeta(featuredTrip).eventDate}</span>
            </div>
          </div>
          <div className="trip-featured-actions">
            <button className="hero-primary-v3 compact" onClick={() => navigate(`/battle-books/${featuredTrip.id}`)} type="button">
              打开手册
            </button>
            <button className="hero-secondary-v3 compact" onClick={() => navigate(`/money/${featuredTrip.id}`)} type="button">
              预算记账
            </button>
            <button className="hero-secondary-v3 compact" onClick={() => navigate(`/planner?from=${featuredTrip.id}`)} type="button">
              按模块复制
            </button>
            <button className="ghost-button" disabled={repairingId === featuredTrip.id} onClick={() => handleRepair(featuredTrip.id)} type="button">
              {repairingId === featuredTrip.id ? '正在重生成...' : '修复文案并重生成'}
            </button>
            <button className="ghost-button" disabled={sharingId === featuredTrip.id} onClick={() => handleShare(featuredTrip.id)} type="button">
              {sharingId === featuredTrip.id ? '正在复制...' : '分享链接'}
            </button>
          </div>
        </section>
      ) : null}

      <section className="panel-v3 panel-v3-light trips-content-section">
        <div className="section-head-v3">
          <div>
            <p className="section-kicker-v3">内容流</p>
            <h2>每一场赴约都可以继续编辑、继续记账，也可以直接重新生成一次</h2>
          </div>
        </div>

        <div className="trips-content-grid">
          {(contentTrips.length > 0 ? contentTrips : featuredTrip ? [featuredTrip] : []).map((trip, index) => {
            const meta = getTripMeta(trip)

            return (
              <article className={`trip-content-card tone-${(index % 3) + 1}`} key={trip.id}>
                <div className="trip-content-top">
                  <span className="trip-tag-v3">{meta.sceneLabel}</span>
                  <span className="trip-date-v2">{meta.eventDate}</span>
                </div>
                <strong>{meta.eventName}</strong>
                <p>
                  {meta.city} 路 {meta.venue}
                </p>
                <div className="trip-meta-row">
                  <span>{meta.targetName}</span>
                  <span>{meta.ticketArea}</span>
                </div>
                <div className="action-cluster">
                  <button className="hero-secondary-v3 compact" onClick={() => navigate(`/battle-books/${trip.id}`)} type="button">
                    查看手册
                  </button>
                  <button className="hero-secondary-v3 compact" onClick={() => navigate(`/money/${trip.id}`)} type="button">
                    预算记账
                  </button>
                  <button className="hero-secondary-v3 compact" onClick={() => navigate(`/planner?from=${trip.id}`)} type="button">
                    按模块再来一份
                  </button>
                  <button className="ghost-button" disabled={repairingId === trip.id} onClick={() => handleRepair(trip.id)} type="button">
                    {repairingId === trip.id ? '重生成中...' : '修复并重生成'}
                  </button>
                  <button className="ghost-button" disabled={sharingId === trip.id} onClick={() => handleShare(trip.id)} type="button">
                    {sharingId === trip.id ? '复制中...' : '分享'}
                  </button>
                  <button className="ghost-button" disabled={deletingId === trip.id} onClick={() => handleDelete(trip.id)} type="button">
                    {deletingId === trip.id ? '删除中...' : '删除'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
