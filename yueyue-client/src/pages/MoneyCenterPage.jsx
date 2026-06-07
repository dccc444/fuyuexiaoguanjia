import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMoneyDashboard, regenerateBattleBook } from '../api'
import { useBattleBooks } from '../hooks/useBattleBooks'
import { getTripMeta } from '../utils/tripMeta'

const sceneFilters = [
  { key: 'all', label: '全部' },
  { key: 'concert', label: '演唱会' },
  { key: 'festival', label: '音乐节' },
  { key: 'match', label: '球赛' },
]

function countByScene(items, sceneKeys) {
  return items.filter((item) => sceneKeys.includes(item.input.sceneType)).length
}

function formatCurrency(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: Number.isInteger(Number(value || 0)) ? 0 : 2,
  }).format(Number(value || 0))
}

function buildMoneySnapshot(dashboard) {
  const totalBudget = dashboard?.budgetSummary?.totalBudget || 0
  const totalSpent = dashboard?.budgetSummary?.totalSpent || 0
  const remainingBudget = dashboard?.budgetSummary?.remainingBudget ?? 0
  const expenseCount = dashboard?.items?.length || 0
  const pendingSettlement = (dashboard?.settlement?.transfers || []).reduce((sum, item) => sum + item.amount, 0)

  let budgetStatus = '还没开始设预算'
  if (totalBudget > 0 && remainingBudget >= 0) {
    budgetStatus = `预算还剩 ${formatCurrency(remainingBudget)}`
  }
  if (totalBudget > 0 && remainingBudget < 0) {
    budgetStatus = `已经超支 ${formatCurrency(Math.abs(remainingBudget))}`
  }

  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    expenseCount,
    pendingSettlement,
    hasSettlement: pendingSettlement > 0,
    budgetStatus,
  }
}

function emptySnapshot() {
  return {
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    expenseCount: 0,
    pendingSettlement: 0,
    hasSettlement: false,
    budgetStatus: '还没开始设预算',
  }
}

function SignalCard({ title, value, note, tone }) {
  return (
    <article className={`signal-card stat-card-base tone-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}

export function MoneyCenterPage() {
  const navigate = useNavigate()
  const { items, loading, error, refresh } = useBattleBooks()
  const [activeFilter, setActiveFilter] = useState('all')
  const [moneySnapshots, setMoneySnapshots] = useState({})
  const [loadingSnapshots, setLoadingSnapshots] = useState(true)
  const [repairingId, setRepairingId] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!notice) return undefined

    const timer = window.setTimeout(() => setNotice(''), 2400)
    return () => window.clearTimeout(timer)
  }, [notice])

  async function fetchSnapshots(list) {
    const dashboardEntries = await Promise.all(
      list.map(async (trip) => {
        try {
          const dashboard = await getMoneyDashboard(trip.id)
          return [trip.id, buildMoneySnapshot(dashboard)]
        } catch {
          return [trip.id, emptySnapshot()]
        }
      })
    )

    return Object.fromEntries(dashboardEntries)
  }

  useEffect(() => {
    let active = true

    async function syncSnapshots() {
      setLoadingSnapshots(true)

      try {
        const list = Array.isArray(items) ? items : []
        const nextSnapshots = await fetchSnapshots(list)
        if (!active) return
        setMoneySnapshots(nextSnapshots)
      } finally {
        if (active) {
          setLoadingSnapshots(false)
        }
      }
    }

    syncSnapshots()

    return () => {
      active = false
    }
  }, [items])

  async function reloadCenter() {
    const list = await refresh()
    setLoadingSnapshots(true)

    try {
      const nextSnapshots = await fetchSnapshots(list)
      setMoneySnapshots(nextSnapshots)
    } finally {
      setLoadingSnapshots(false)
    }
  }

  async function handleRepair(id) {
    try {
      setRepairingId(id)
      setActionError('')
      await regenerateBattleBook(id)
      await reloadCenter()
      setNotice('这场活动已经重新生成好了。')
    } catch (repairError) {
      setActionError(repairError.message || '这次重生成没有成功，请稍后再试。')
    } finally {
      setRepairingId('')
    }
  }

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items
    return items.filter((trip) => trip.input.sceneType === activeFilter)
  }, [activeFilter, items])

  const tripStats = useMemo(
    () => ({
      total: items.length,
      concertAndFestival: countByScene(items, ['concert', 'festival']),
      match: countByScene(items, ['match', 'sports']),
    }),
    [items]
  )

  const featuredTrip = filteredItems[0] || null
  const secondaryTrips = featuredTrip ? filteredItems.slice(1) : []
  const featuredMeta = featuredTrip ? getTripMeta(featuredTrip) : null
  const featuredSnapshot = featuredTrip ? moneySnapshots[featuredTrip.id] : null

  return (
    <div className="money-center-page">
      {notice || actionError || error ? (
        <div className="feedback-stack">
          {notice ? <section className="panel-v3 panel-v3-light success-banner success-banner-inner">{notice}</section> : null}
          {actionError ? <section className="panel-v3 panel-v3-light error-text">{actionError}</section> : null}
          {error ? <section className="panel-v3 panel-v3-light error-text">{error}</section> : null}
        </div>
      ) : null}

      <section className="panel-v3 panel-v3-light money-center-hero-v2">
        <div className="money-center-hero-copy">
          <p className="section-kicker-v3">Money Hub</p>
          <h1>预算管家 / 记账分账</h1>
          <p className="section-subcopy-v3">
            把每一场赴约的总预算、现场支出和 AA 清单单独收好。先挑一场活动开始，后面每一笔票务、交通、住宿、餐饮和物料花费都会跟着这场走。
          </p>
          <div className="action-cluster">
            <button className="hero-secondary-v3" onClick={() => navigate('/my-trips')} type="button">
              从我的安排里选
            </button>
            <button className="hero-primary-v3" onClick={() => navigate('/create')} type="button">
              新建赴约计划
            </button>
          </div>
        </div>

        <div className="money-center-stat-grid">
          <SignalCard note="所有已生成手册的活动都能直接记账。" title="可开始记账" tone="blue" value={tripStats.total} />
          <SignalCard note="更适合拆票务、物料和返程等明细。" title="演唱会 / 音乐节" tone="mint" value={tripStats.concertAndFestival} />
          <SignalCard note="适合把门票、周边和赛后安排单独记清楚。" title="球赛" tone="amber" value={tripStats.match} />
        </div>
      </section>

      <section className="panel-v3 panel-v3-light money-filter-panel">
        <div className="section-head-v3">
          <div>
            <p className="section-kicker-v3">活动筛选</p>
            <h2>先挑一场要开始记账的活动，预算和 AA 会跟着这场活动走</h2>
          </div>
        </div>
        <div className="choice-chip-row">
          {sceneFilters.map((filter) => (
            <button
              className={activeFilter === filter.key ? 'choice-chip active' : 'choice-chip'}
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {loading || loadingSnapshots ? <section className="panel-v3 panel-v3-light empty-state-v3">正在加载可记账的活动...</section> : null}

      {!loading && !loadingSnapshots && filteredItems.length === 0 ? (
        <section className="panel-v3 panel-v3-light empty-state-v3">
          这里还没有可用的活动。先去创建一份赴约计划，后面就能直接在这里做预算、记账和 AA 分账。
        </section>
      ) : null}

      {!loading && !loadingSnapshots && featuredTrip && featuredMeta ? (
        <>
          <section className="panel-v3 panel-v3-light money-center-featured">
            <div className="money-center-featured-layout">
              <div className="money-center-featured-copy">
                <p className="section-kicker-v3">推荐先从这场开始</p>
                <h2>{featuredMeta.eventName}</h2>
                <p className="money-featured-subcopy">
                  {featuredMeta.city} 路 {featuredMeta.venue} 路 {featuredMeta.eventDate}
                </p>
                <div className="money-entry-meta">
                  <span>{featuredMeta.sceneLabel}</span>
                  <span>去见：{featuredMeta.targetName}</span>
                  <span>票档：{featuredMeta.ticketArea}</span>
                </div>
              </div>

              <div className="money-center-featured-side">
                <div className="money-center-mini-stack">
                  <article className="money-mini-card surface-card">
                    <span>预算状态</span>
                    <strong>{featuredSnapshot?.budgetStatus || '还没开始设预算'}</strong>
                  </article>
                  <article className="money-mini-card surface-card">
                    <span>已记多少笔</span>
                    <strong>{featuredSnapshot ? `${featuredSnapshot.expenseCount} 笔支出` : '0 笔支出'}</strong>
                  </article>
                  <article className="money-mini-card surface-card">
                    <span>是否有待结算</span>
                    <strong>
                      {featuredSnapshot?.hasSettlement ? `还有 ${formatCurrency(featuredSnapshot.pendingSettlement)} 待结算` : '现在还没有待结算差额'}
                    </strong>
                  </article>
                </div>

                <div className="action-cluster money-entry-actions">
                  <button className="hero-primary-v3" onClick={() => navigate(`/money/${featuredTrip.id}`)} type="button">
                    先打开这场记账
                  </button>
                  <button className="hero-secondary-v3" onClick={() => navigate(`/battle-books/${featuredTrip.id}`)} type="button">
                    先看赴约手册
                  </button>
                  <button className="ghost-button" disabled={repairingId === featuredTrip.id} onClick={() => handleRepair(featuredTrip.id)} type="button">
                    {repairingId === featuredTrip.id ? '正在重生成...' : '修复文案并重生成'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {secondaryTrips.length > 0 ? (
            <section className="money-entry-feed">
              {secondaryTrips.map((trip, index) => {
                const meta = getTripMeta(trip)
                const snapshot = moneySnapshots[trip.id]

                return (
                  <article className={`trip-content-card money-entry-flow-card tone-${((index + 1) % 3) + 1}`} key={trip.id}>
                    <div className="money-entry-flow-top">
                      <div>
                        <div className="trip-content-top">
                          <span className="trip-tag-v3">{meta.sceneLabel}</span>
                          <span className="trip-date-v2">{meta.eventDate}</span>
                        </div>
                        <strong>{meta.eventName}</strong>
                        <p>
                          {meta.city} 路 {meta.venue}
                        </p>
                      </div>
                      <div className="money-entry-flow-status">
                        <span>{snapshot?.budgetStatus || '还没开始设预算'}</span>
                        <span>{snapshot ? `${snapshot.expenseCount} 笔已记` : '0 笔已记'}</span>
                        <span>{snapshot?.hasSettlement ? '有待结算' : '暂时平账'}</span>
                      </div>
                    </div>

                    <div className="money-entry-flow-body">
                      <div className="money-entry-meta">
                        <span>去见：{meta.targetName}</span>
                        <span>票档：{meta.ticketArea}</span>
                      </div>
                      <div className="money-entry-flow-copy">
                        <p>
                          {snapshot?.totalBudget
                            ? `总预算 ${formatCurrency(snapshot.totalBudget)}，目前已花 ${formatCurrency(snapshot.totalSpent)}。`
                            : '这场还没正式设预算，适合先把总预算和票务、交通两块定下来。'}
                        </p>
                      </div>
                    </div>

                    <div className="action-cluster money-entry-actions compact">
                      <button className="hero-primary-v3 compact" onClick={() => navigate(`/money/${trip.id}`)} type="button">
                        打开记账分账
                      </button>
                      <button className="hero-secondary-v3 compact" onClick={() => navigate(`/battle-books/${trip.id}`)} type="button">
                        看赴约手册
                      </button>
                      <button className="ghost-button" disabled={repairingId === trip.id} onClick={() => handleRepair(trip.id)} type="button">
                        {repairingId === trip.id ? '重生成中...' : '修复并重生成'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
