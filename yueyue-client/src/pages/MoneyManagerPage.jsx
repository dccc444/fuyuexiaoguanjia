import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addExpenseItem,
  addExpenseMember,
  getMoneyDashboard,
  removeExpenseItem,
  removeExpenseMember,
  saveBudgetPlan,
  suggestBudgetPlan,
} from '../api'
import { getTripMeta } from '../utils/tripMeta'

const emptyBudgetCategories = {
  ticket: '',
  transport: '',
  stay: '',
  food: '',
  merch: '',
  buffer: '',
}

const initialExpenseForm = {
  title: '',
  category: 'ticket',
  amount: '',
  paidByMemberId: '',
  participantMemberIds: [],
  occurredAt: '',
  note: '',
}

function hydrateDashboardState(data, setDashboard, setBudgetForm, setExpenseForm) {
  setDashboard(data)
  setBudgetForm({
    totalBudget: data.budgetPlan?.totalBudget || '',
    strategy: data.budgetPlan?.payload?.strategy || 'balanced',
    categories: {
      ...emptyBudgetCategories,
      ...(data.budgetPlan?.payload?.categories || {}),
    },
  })
  setExpenseForm((current) => ({
    ...current,
    paidByMemberId: current.paidByMemberId || data.members[0]?.id || '',
    participantMemberIds: current.participantMemberIds.length ? current.participantMemberIds : data.members.map((member) => member.id),
  }))
}

function formatCurrency(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: Number.isInteger(Number(value || 0)) ? 0 : 2,
  }).format(Number(value || 0))
}

function MetricCard({ title, value, note, tone }) {
  return (
    <article className={`money-metric-card stat-card-base tone-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}

function buildBudgetAdvice({ hasBudget, remainingBudget, overBudgetCategories, sortedBudgetCategories }) {
  if (!hasBudget) {
    return {
      title: '先把总预算定住',
      text: '先填一个总预算，再让系统帮你按票务、交通、住宿、餐饮、物料和备用金拆开，后面每一笔支出才更容易盯。',
      tone: 'blue',
    }
  }

  if (remainingBudget < 0) {
    return {
      title: '这次预算已经超了',
      text: `当前总预算已经超出 ${formatCurrency(Math.abs(remainingBudget))}，建议先收一收 ${overBudgetCategories
        .map((item) => item.label)
        .join('、')} 这几项，别把备用金也一起吃掉。`,
      tone: 'red',
    }
  }

  if (overBudgetCategories.length > 0) {
    return {
      title: '有分类开始冒头了',
      text: `${overBudgetCategories.map((item) => item.label).join('、')} 已经超出原计划，后面如果还有新增支出，最好优先从备用金或者餐饮、物料里腾空间。`,
      tone: 'amber',
    }
  }

  const topCategory = sortedBudgetCategories.find((item) => item.key !== 'buffer' && item.spent > 0)
  if (topCategory) {
    return {
      title: '整体预算还算稳',
      text: `目前花得最多的是 ${topCategory.label}，但总预算还在可控范围内。继续按这个节奏走，后面更适合盯紧散场返程和临时加购。`,
      tone: 'mint',
    }
  }

  return {
    title: '预算已经准备好了',
    text: '现在还没开始记支出，这个阶段最适合先把同行人和预计大头费用定下来，后面现场记账会更顺。',
    tone: 'blue',
  }
}

export function MoneyManagerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [savingBudget, setSavingBudget] = useState(false)
  const [submittingMember, setSubmittingMember] = useState(false)
  const [submittingItem, setSubmittingItem] = useState(false)
  const [activeExpenseFilter, setActiveExpenseFilter] = useState('all')
  const [budgetForm, setBudgetForm] = useState({
    totalBudget: '',
    strategy: 'balanced',
    categories: emptyBudgetCategories,
  })
  const [memberForm, setMemberForm] = useState({
    name: '',
    payChannel: '微信',
  })
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm)
  const [toastTimerId, setToastTimerId] = useState(null)

  async function loadDashboard({ silent = false } = {}) {
    if (!id) return

    if (!silent) {
      setLoading(true)
    }

    try {
      const data = await getMoneyDashboard(id)
      hydrateDashboardState(data, setDashboard, setBudgetForm, setExpenseForm)
      setError('')
      return data
    } catch (loadError) {
      setError(loadError.message)
      return null
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    let active = true

    async function initialize() {
      if (!id) return

      setLoading(true)
      try {
        const data = await getMoneyDashboard(id)
        if (!active) return
        hydrateDashboardState(data, setDashboard, setBudgetForm, setExpenseForm)
        setError('')
      } catch (loadError) {
        if (active) {
          setError(loadError.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    initialize()

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    return () => {
      if (toastTimerId) {
        window.clearTimeout(toastTimerId)
      }
    }
  }, [toastTimerId])

  function showToast(message) {
    setToast(message)
    if (toastTimerId) {
      window.clearTimeout(toastTimerId)
    }

    const nextTimerId = window.setTimeout(() => {
      setToast('')
      setToastTimerId(null)
    }, 2200)

    setToastTimerId(nextTimerId)
  }

  async function handleSuggestBudget() {
    try {
      setSavingBudget(true)
      const data = await suggestBudgetPlan(id, budgetForm.totalBudget)
      setBudgetForm((current) => ({
        ...current,
        strategy: data.item.strategy,
        categories: data.item.categories,
      }))
      showToast('预算建议已经帮你拆好了。')
    } catch (suggestError) {
      setError(suggestError.message)
    } finally {
      setSavingBudget(false)
    }
  }

  async function handleSaveBudget() {
    try {
      setSavingBudget(true)
      const payload = {
        totalBudget: budgetForm.totalBudget,
        strategy: budgetForm.strategy,
        categories: Object.fromEntries(Object.entries(budgetForm.categories).map(([key, value]) => [key, Number(value || 0)])),
      }
      const data = await saveBudgetPlan(id, payload)
      hydrateDashboardState(data, setDashboard, setBudgetForm, setExpenseForm)
      showToast('预算已经保存好了。')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSavingBudget(false)
    }
  }

  async function handleAddMember(event) {
    event.preventDefault()
    if (!dashboard?.expenseBook) return

    try {
      setSubmittingMember(true)
      await addExpenseMember(dashboard.expenseBook.id, memberForm)
      setMemberForm({ name: '', payChannel: '微信' })
      await loadDashboard({ silent: true })
      showToast('同行人已经加进来了。')
    } catch (memberError) {
      setError(memberError.message)
    } finally {
      setSubmittingMember(false)
    }
  }

  async function handleDeleteMember(memberId) {
    try {
      await removeExpenseMember(memberId)
      await loadDashboard({ silent: true })
      showToast('同行人已经移除了。')
    } catch (memberError) {
      setError(memberError.message)
    }
  }

  async function handleAddExpense(event) {
    event.preventDefault()
    if (!dashboard?.expenseBook) return

    try {
      setSubmittingItem(true)
      await addExpenseItem(dashboard.expenseBook.id, {
        ...expenseForm,
        amount: Number(expenseForm.amount),
      })
      setExpenseForm({
        ...initialExpenseForm,
        category: expenseForm.category,
        paidByMemberId: dashboard.members[0]?.id || '',
        participantMemberIds: dashboard.members.map((member) => member.id),
      })
      await loadDashboard({ silent: true })
      showToast('这笔支出已经记好了。')
    } catch (itemError) {
      setError(itemError.message)
    } finally {
      setSubmittingItem(false)
    }
  }

  async function handleDeleteExpense(itemId) {
    try {
      await removeExpenseItem(itemId)
      await loadDashboard({ silent: true })
      showToast('这笔支出已经删除。')
    } catch (itemError) {
      setError(itemError.message)
    }
  }

  function toggleParticipant(memberId) {
    setExpenseForm((current) => {
      const exists = current.participantMemberIds.includes(memberId)
      return {
        ...current,
        participantMemberIds: exists
          ? current.participantMemberIds.filter((item) => item !== memberId)
          : [...current.participantMemberIds, memberId],
      }
    })
  }

  async function handleCopySettlementText() {
    if (!dashboard?.settlement) return

    const tripMeta = getTripMeta(dashboard.battleBook)
    const header = `这次 ${tripMeta.eventName} 的 AA 结算：`
    const body =
      dashboard.settlement.transfers.length === 0
        ? '目前大家基本平了，暂时没有需要转账的差额。'
        : dashboard.settlement.transfers
            .map((transfer) => `${transfer.fromName} 转给 ${transfer.toName} ${formatCurrency(transfer.amount)}`)
            .join('\n')

    try {
      await navigator.clipboard.writeText(`${header}\n${body}`)
      showToast('结算文案已经复制好了。')
    } catch {
      setError('复制失败了，请稍后再试。')
    }
  }

  if (loading) {
    return <section className="panel-v3 panel-v3-light loading-state">正在打开这场赴约的预算与记账...</section>
  }

  if (error && !dashboard) {
    return <section className="panel-v3 panel-v3-light error-text">{error}</section>
  }

  if (!dashboard) {
    return <section className="panel-v3 panel-v3-light error-text">没有找到这场活动的预算信息。</section>
  }

  const { battleBook, budgetSummary, members, items, settlement, budgetCategories, expenseCategories } = dashboard
  const tripMeta = getTripMeta(battleBook)
  const hasBudget = Boolean(dashboard.budgetPlan)
  const totalSpent = budgetSummary?.totalSpent || 0
  const totalBudget = budgetSummary?.totalBudget || 0
  const remainingBudget = budgetSummary?.remainingBudget ?? 0
  const pendingSettlement = settlement.transfers.reduce((sum, item) => sum + item.amount, 0)
  const overBudgetCategories = budgetSummary?.categories?.filter((item) => item.overBudget) || []
  const sceneType = battleBook.input.sceneType
  const sceneSummary =
    sceneType === 'match' || sceneType === 'sports'
      ? '门票、交通、夜宵和赛后返程都能跟着这场比赛走。'
      : '票务、交通、住宿、餐饮和物料花费都会跟着这场赴约走。'

  const sortedBudgetCategories = [...(budgetSummary?.categories || [])].sort((a, b) => {
    if (a.overBudget !== b.overBudget) {
      return a.overBudget ? -1 : 1
    }

    if (a.key === 'buffer') return 1
    if (b.key === 'buffer') return -1

    const aRatio = a.budgeted > 0 ? a.spent / a.budgeted : 0
    const bRatio = b.budgeted > 0 ? b.spent / b.budgeted : 0
    return bRatio - aRatio
  })

  const expenseFilterOptions = [{ key: 'all', label: '全部' }, ...expenseCategories.map((category) => ({ key: category.key, label: category.label }))]
  const filteredItems = activeExpenseFilter === 'all' ? items : items.filter((item) => item.category === activeExpenseFilter)
  const budgetAdvice = buildBudgetAdvice({
    hasBudget,
    remainingBudget,
    overBudgetCategories,
    sortedBudgetCategories,
  })

  return (
    <div className="money-page-v1">
      {toast || error ? (
        <div className="feedback-stack">
          {toast ? <section className="panel-v3 panel-v3-light success-banner success-banner-inner">{toast}</section> : null}
          {error ? <section className="panel-v3 panel-v3-light error-text">{error}</section> : null}
        </div>
      ) : null}

      <section className="panel-v3 panel-v3-light money-hero money-hero-v2">
        <div>
          <p className="section-kicker-v3">Money Planner</p>
          <h1>预算管家 + 记账分账</h1>
          <p className="section-subcopy-v3">
            {tripMeta.eventName} 路 {tripMeta.city} 路 {tripMeta.venue}
          </p>
          <p className="money-hero-note">{sceneSummary}</p>
        </div>
        <div className="action-cluster">
          <button className="hero-secondary-v3 compact" onClick={() => navigate(`/battle-books/${battleBook.id}`)} type="button">
            回到赴约手册
          </button>
          <button className="hero-primary-v3 compact" onClick={() => navigate('/money')} type="button">
            回到记账分账中心
          </button>
        </div>
      </section>

      <section className="money-metrics-grid">
        <MetricCard note="整场赴约可以花到哪里，一眼先定住。" title="总预算" tone="blue" value={hasBudget ? formatCurrency(totalBudget) : '待设置'} />
        <MetricCard note="已经记进来的所有票务、交通、住宿和吃喝支出。" title="已花金额" tone="orange" value={formatCurrency(totalSpent)} />
        <MetricCard note="预算里还剩多少，最适合盯着这个数控制节奏。" title="剩余金额" tone={remainingBudget < 0 ? 'coral' : 'mint'} value={formatCurrency(remainingBudget)} />
        <MetricCard note="当前 AA 清单里还没有结完的差额。" title="待结算" tone="pink" value={formatCurrency(pendingSettlement)} />
      </section>

      <section className={`panel-v3 panel-v3-light budget-advice-panel tone-${budgetAdvice.tone}`}>
        <p className="section-kicker-v3">预算建议</p>
        <h2>{budgetAdvice.title}</h2>
        <p>{budgetAdvice.text}</p>
      </section>

      {hasBudget && (remainingBudget < 0 || overBudgetCategories.length > 0) ? (
        <section className="panel-v3 panel-v3-light budget-alert">
          <strong>超支提醒</strong>
          <p>
            {remainingBudget < 0 ? `总预算已经超出 ${formatCurrency(Math.abs(remainingBudget))}。` : '总预算还在范围内。'}
            {overBudgetCategories.length > 0 ? ` 当前超支分类：${overBudgetCategories.map((item) => item.label).join('、')}。` : ' 目前还没有分类超支。'}
          </p>
        </section>
      ) : null}

      <section className="money-board-grid">
        <section className="panel-v3 panel-v3-light money-budget-panel">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">预算管家</p>
              <h2>先把这次赴约的钱分好，再决定哪里该省哪里该冲</h2>
            </div>
          </div>

          <div className="money-form-grid">
            <label className="field-shell">
              <span>总预算</span>
              <input
                type="number"
                value={budgetForm.totalBudget}
                onChange={(event) => setBudgetForm((current) => ({ ...current, totalBudget: event.target.value }))}
                placeholder="例如 3500"
              />
            </label>
          </div>

          <div className="action-cluster">
            <button className="hero-secondary-v3 compact" disabled={savingBudget} onClick={handleSuggestBudget} type="button">
              {savingBudget ? '正在拆预算...' : 'AI 自动分配'}
            </button>
            <button className="hero-primary-v3 compact" disabled={savingBudget} onClick={handleSaveBudget} type="button">
              保存预算
            </button>
          </div>

          <div className="budget-category-grid">
            {budgetCategories.map((category) => {
              const summaryCategory = budgetSummary?.categories?.find((item) => item.key === category.key)
              const spent = summaryCategory?.spent || 0
              const budgeted = Number(budgetForm.categories[category.key] || summaryCategory?.budgeted || 0)
              const percent = budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0
              const overrun = budgeted > 0 && spent > budgeted

              return (
                <label className={overrun ? 'budget-category-card is-over surface-card' : 'budget-category-card surface-card'} key={category.key}>
                  <span>{category.label}</span>
                  <input
                    type="number"
                    value={budgetForm.categories[category.key] ?? ''}
                    onChange={(event) =>
                      setBudgetForm((current) => ({
                        ...current,
                        categories: {
                          ...current.categories,
                          [category.key]: event.target.value,
                        },
                      }))
                    }
                  />
                  {summaryCategory ? (
                    <>
                      <small>
                        已花 {formatCurrency(spent)} / 预算 {formatCurrency(summaryCategory.budgeted)}
                      </small>
                      {category.key !== 'buffer' ? (
                        <div className="budget-progress-row">
                          <div className="budget-progress-track">
                            <div
                              className={overrun ? 'budget-progress-fill is-over' : 'budget-progress-fill'}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className={overrun ? 'is-over' : ''}>{overrun ? '已超支' : `${Math.round(percent)}%`}</span>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <small>先保存预算，后面这里会开始监控超支。</small>
                  )}
                </label>
              )
            })}
          </div>
        </section>

        <section className="panel-v3 panel-v3-light money-members-panel">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">同行人</p>
              <h2>先把一起花钱的人加进来，后面的 AA 才会准</h2>
            </div>
          </div>

          <form className="money-inline-form" onSubmit={handleAddMember}>
            <input value={memberForm.name} onChange={(event) => setMemberForm((current) => ({ ...current, name: event.target.value }))} placeholder="例如 小雨 / 小林" />
            <select value={memberForm.payChannel} onChange={(event) => setMemberForm((current) => ({ ...current, payChannel: event.target.value }))}>
              <option value="微信">微信</option>
              <option value="支付宝">支付宝</option>
              <option value="现金">现金</option>
            </select>
            <button className="hero-primary-v3 compact" disabled={submittingMember} type="submit">
              {submittingMember ? '添加中...' : '添加同行人'}
            </button>
          </form>

          <div className="member-chip-grid">
            {members.map((member) => (
              <article className="member-chip-card surface-card" key={member.id}>
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.payChannel || '未设置付款方式'}</span>
                </div>
                {!member.isOwner ? (
                  <button className="ghost-button compact" onClick={() => handleDeleteMember(member.id)} type="button">
                    移除
                  </button>
                ) : (
                  <span className="trip-tag-v3">我自己</span>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="panel-v3 panel-v3-light money-expense-panel">
        <div className="section-head-v3">
          <div>
            <p className="section-kicker-v3">AI 记账</p>
            <h2>把每一笔票务、交通、住宿、餐饮和物料都记进去</h2>
          </div>
        </div>

        <form className="money-expense-form" onSubmit={handleAddExpense}>
          <input value={expenseForm.title} onChange={(event) => setExpenseForm((current) => ({ ...current, title: event.target.value }))} placeholder="这笔花费是什么，例如 高铁票 / 酒店 / 周边" />
          <select value={expenseForm.category} onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value }))}>
            {expenseCategories.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
          <input type="number" value={expenseForm.amount} onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))} placeholder="金额" />
          <select value={expenseForm.paidByMemberId} onChange={(event) => setExpenseForm((current) => ({ ...current, paidByMemberId: event.target.value }))}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} 付款
              </option>
            ))}
          </select>
          <input type="datetime-local" value={expenseForm.occurredAt} onChange={(event) => setExpenseForm((current) => ({ ...current, occurredAt: event.target.value }))} />
          <input value={expenseForm.note} onChange={(event) => setExpenseForm((current) => ({ ...current, note: event.target.value }))} placeholder="备注，可不填" />

          <div className="participant-selector">
            <span>这笔钱算到谁头上</span>
            <div className="choice-chip-row">
              {members.map((member) => {
                const active = expenseForm.participantMemberIds.includes(member.id)
                return (
                  <button className={active ? 'choice-chip active' : 'choice-chip'} key={member.id} onClick={() => toggleParticipant(member.id)} type="button">
                    {member.name}
                  </button>
                )
              })}
            </div>
          </div>

          <button className="hero-primary-v3" disabled={submittingItem} type="submit">
            {submittingItem ? '正在记账...' : '记下这笔支出'}
          </button>
        </form>
      </section>

      <section className="money-board-grid">
        <section className="panel-v3 panel-v3-light money-list-panel">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">支出列表</p>
              <h2>按分类筛一遍，最容易看出哪一块正在往上冒</h2>
            </div>
          </div>

          <div className="compact-choice-row money-filter-bar">
            <div className="choice-chip-row">
              {expenseFilterOptions.map((option) => (
                <button className={activeExpenseFilter === option.key ? 'choice-chip active' : 'choice-chip'} key={option.key} onClick={() => setActiveExpenseFilter(option.key)} type="button">
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="money-list-stack">
            {filteredItems.length === 0 ? (
              <p className="section-subcopy-v3">{activeExpenseFilter === 'all' ? '还没有支出，先记第一笔票务或交通。' : '这个分类下面暂时还没有支出。'}</p>
            ) : null}

            {filteredItems.map((item) => {
              const payer = members.find((member) => member.id === item.paidByMemberId)
              const categoryLabel = expenseCategories.find((category) => category.key === item.category)?.label || item.category

              return (
                <article className="expense-item-card surface-card" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>
                      {categoryLabel} 路 {payer?.name || '未知付款人'}
                    </p>
                    {item.note ? <div className="expense-item-note">{item.note}</div> : null}
                  </div>
                  <div className="expense-item-side">
                    <strong>{formatCurrency(item.amount)}</strong>
                    <button className="ghost-button compact" onClick={() => handleDeleteExpense(item.id)} type="button">
                      删除
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="panel-v3 panel-v3-light money-settlement-panel">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">AA 分账</p>
              <h2>系统已经帮你把谁该转给谁算好了</h2>
            </div>
            <button className="hero-secondary-v3 compact" onClick={handleCopySettlementText} type="button">
              一键复制结算文案
            </button>
          </div>

          <div className="settlement-balance-grid">
            {settlement.balances.map((item) => (
              <article className="settlement-balance-card surface-card" key={item.memberId}>
                <strong>{item.name}</strong>
                <p>已付 {formatCurrency(item.paid)}</p>
                <p>应承担 {formatCurrency(item.owed)}</p>
                <span className={item.net >= 0 ? 'positive' : 'negative'}>
                  {item.net >= 0 ? `应收 ${formatCurrency(item.net)}` : `应补 ${formatCurrency(Math.abs(item.net))}`}
                </span>
              </article>
            ))}
          </div>

          <div className="settlement-copy-tip">复制后可以直接发给搭子，少解释一轮谁该转给谁。</div>

          <div className="settlement-transfer-list">
            {settlement.transfers.length === 0 ? (
              <p className="section-subcopy-v3">现在还没有需要结算的差额，大家基本已经平了。</p>
            ) : (
              settlement.transfers.map((transfer) => (
                <article className="settlement-transfer-card surface-card" key={`${transfer.fromMemberId}-${transfer.toMemberId}`}>
                  <strong>
                    {transfer.fromName}
                    {' -> '}
                    {transfer.toName}
                  </strong>
                  <span>{formatCurrency(transfer.amount)}</span>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  )
}
