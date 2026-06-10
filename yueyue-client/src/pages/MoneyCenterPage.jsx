import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMoneyDashboard } from '../api'
import { useBattleBooks } from '../hooks/useBattleBooks'
import { getTripMeta } from '../utils/tripMeta'

const sceneFilters = [
  { key: 'all', label: '全部' },
  { key: 'concert', label: '演唱会' },
  { key: 'festival', label: '音乐节' },
  { key: 'match', label: '球赛' },
]

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

function buildCompactSummary(snapshot) {
  if (!snapshot) return '还没开始记账'
  if (snapshot.totalBudget > 0) {
    return `预算 ${formatCurrency(snapshot.totalBudget)} · 已记 ${snapshot.expenseCount} 笔`
  }
  return `${snapshot.expenseCount} 笔支出 · 还没设预算`
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

export function MoneyCenterPage() {
  const navigate = useNavigate()
  const { items, loading, error, refresh } = useBattleBooks()
  const [activeFilter, setActiveFilter] = useState('all')
  const [moneySnapshots, setMoneySnapshots] = useState({})
  const [loadingSnapshots, setLoadingSnapshots] = useState(true)

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

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items
    return items.filter((trip) => trip.input.sceneType === activeFilter)
  }, [activeFilter, items])

  return (
    <div className="money-center-page">
      {error ? (
        <div className="feedback-stack">
          {error ? <section className="panel-v3 panel-v3-light error-text">{error}</section> : null}
        </div>
      ) : null}

      <section className="panel-v3 panel-v3-light money-center-simple-hero">
        <p className="section-kicker-v3">Money Hub</p>
        <h1>把账记明白</h1>
        <p className="section-subcopy-v3">选一场，马上开记。</p>
        <div className="action-cluster">
          <button className="hero-primary-v3" onClick={() => navigate('/my-trips')} type="button">
            去选活动
          </button>
          <button className="hero-secondary-v3" onClick={() => navigate('/planner')} type="button">
            新建一场
          </button>
        </div>
      </section>

      <section className="panel-v3 panel-v3-light money-filter-panel">
        <div className="section-head-v3">
          <div>
            <p className="section-kicker-v3">活动筛选</p>
            <h2>选一场就开记</h2>
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
          还没有可记账的活动，先新建一场吧。
        </section>
      ) : null}

      {!loading && !loadingSnapshots && filteredItems.length > 0 ? (
        <section className="money-center-simple-grid">
          {filteredItems.map((trip) => {
            const meta = getTripMeta(trip)
            const snapshot = moneySnapshots[trip.id]

            return (
              <article className="panel-v3 panel-v3-light money-center-simple-card" key={trip.id}>
                <div className="money-center-simple-top">
                  <div>
                    <div className="trip-content-top">
                      <span className="trip-tag-v3">{meta.sceneLabel}</span>
                      {meta.eventDate ? <span className="trip-date-v2">{meta.eventDate}</span> : null}
                    </div>
                    <strong>{meta.eventName}</strong>
                    <p>{meta.city} · {meta.venue}</p>
                  </div>
                  <span className="money-center-simple-status">{snapshot?.budgetStatus || '还没开始设预算'}</span>
                </div>

                <div className="money-entry-summary">
                  <span>{buildCompactSummary(snapshot)}</span>
                  {meta.targetName ? <span>去见 {meta.targetName}</span> : null}
                  {meta.ticketArea ? <span>{meta.ticketArea}</span> : null}
                </div>

                <div className="action-cluster money-entry-actions compact">
                  <button className="hero-primary-v3 compact" onClick={() => navigate(`/money/${trip.id}`)} type="button">
                    打开记账
                  </button>
                  <button className="hero-secondary-v3 compact" onClick={() => navigate(`/battle-books/${trip.id}`)} type="button">
                    手册
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      ) : null}
    </div>
  )
}
