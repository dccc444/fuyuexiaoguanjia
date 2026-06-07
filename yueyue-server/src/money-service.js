const { nanoid } = require('nanoid')
const { getStoredBattleBookById } = require('./storage')
const {
  deleteStoredExpenseItemById,
  deleteStoredExpenseMemberById,
  getStoredBudgetPlanByBattleBookId,
  getStoredExpenseBookByBattleBookId,
  getStoredExpenseItemById,
  getStoredExpenseMemberById,
  listStoredBattleBooks,
  listStoredExpenseItems,
  listStoredExpenseMembers,
  saveBudgetPlan,
  saveExpenseBook,
  saveExpenseItem,
  saveExpenseMember,
} = require('./storage')

const EXPENSE_CATEGORIES = [
  { key: 'ticket', label: '票务' },
  { key: 'transport', label: '交通' },
  { key: 'stay', label: '住宿' },
  { key: 'food', label: '餐饮' },
  { key: 'merch', label: '物料购物' },
  { key: 'other', label: '其他' },
]

const BUDGET_CATEGORIES = [
  { key: 'ticket', label: '票务' },
  { key: 'transport', label: '交通' },
  { key: 'stay', label: '住宿' },
  { key: 'food', label: '餐饮' },
  { key: 'merch', label: '物料购物' },
  { key: 'buffer', label: '备用金' },
]

const SCENE_BUDGET_RATIOS = {
  concert: { ticket: 0.35, transport: 0.18, stay: 0.2, food: 0.1, merch: 0.12, buffer: 0.05 },
  festival: { ticket: 0.35, transport: 0.18, stay: 0.2, food: 0.1, merch: 0.12, buffer: 0.05 },
  sports: { ticket: 0.28, transport: 0.2, stay: 0.18, food: 0.12, merch: 0.1, buffer: 0.12 },
  default: { ticket: 0.3, transport: 0.18, stay: 0.2, food: 0.12, merch: 0.1, buffer: 0.1 },
}

function roundMoney(value) {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) {
    return 0
  }

  return Math.round(numberValue * 100) / 100
}

function normalizeMoneyAmount(value) {
  const amount = roundMoney(value)
  return amount < 0 ? 0 : amount
}

function ensureBattleBookExists(battleBook) {
  if (!battleBook) {
    const error = new Error('没有找到对应的赴约手册，先创建赴约计划再来记账。')
    error.statusCode = 404
    throw error
  }
}

function buildSuggestedCategories(sceneType, totalBudget) {
  const ratios = SCENE_BUDGET_RATIOS[sceneType] || SCENE_BUDGET_RATIOS.default
  const entries = BUDGET_CATEGORIES.map(({ key }, index) => {
    if (index === BUDGET_CATEGORIES.length - 1) {
      return [key, 0]
    }

    return [key, normalizeMoneyAmount(totalBudget * ratios[key])]
  })

  const categories = Object.fromEntries(entries)
  const allocated = Object.values(categories).reduce((sum, value) => sum + value, 0)
  categories.buffer = normalizeMoneyAmount(totalBudget - allocated)
  return categories
}

function normalizeBudgetPayload(totalBudget, sceneType, payload = {}) {
  const suggested = buildSuggestedCategories(sceneType, totalBudget)
  const incoming = payload.categories || {}

  const categories = Object.fromEntries(
    BUDGET_CATEGORIES.map(({ key }) => [key, normalizeMoneyAmount(incoming[key] ?? suggested[key] ?? 0)])
  )

  return {
    categories,
    strategy: payload.strategy || 'balanced',
    notes: payload.notes || '',
  }
}

function buildBudgetSummary(budgetPlan, expenseItems) {
  if (!budgetPlan) {
    return null
  }

  const spentByCategory = {
    ticket: 0,
    transport: 0,
    stay: 0,
    food: 0,
    merch: 0,
    other: 0,
  }

  for (const item of expenseItems) {
    if (spentByCategory[item.category] !== undefined) {
      spentByCategory[item.category] += item.amount
    } else {
      spentByCategory.other += item.amount
    }
  }

  const totalSpent = Object.values(spentByCategory).reduce((sum, value) => sum + value, 0)
  const categories = BUDGET_CATEGORIES.map(({ key, label }) => {
    const budgeted = budgetPlan.payload.categories[key] || 0
    const spent = key === 'buffer' ? 0 : roundMoney(spentByCategory[key] || 0)
    const remaining = roundMoney(budgeted - spent)

    return {
      key,
      label,
      budgeted,
      spent,
      remaining,
      overBudget: key !== 'buffer' && spent > budgeted,
    }
  })

  return {
    totalBudget: budgetPlan.totalBudget,
    totalSpent: roundMoney(totalSpent),
    remainingBudget: roundMoney(budgetPlan.totalBudget - totalSpent),
    categories,
  }
}

function buildSettlement(members, items) {
  if (members.length === 0) {
    return { balances: [], transfers: [] }
  }

  const paidMap = new Map()
  const owedMap = new Map()

  for (const member of members) {
    paidMap.set(member.id, 0)
    owedMap.set(member.id, 0)
  }

  for (const item of items) {
    paidMap.set(item.paidByMemberId, roundMoney((paidMap.get(item.paidByMemberId) || 0) + item.amount))

    const participants = item.participantMemberIds || []
    if (!participants.length) {
      continue
    }

    const share = roundMoney(item.amount / participants.length)
    for (const memberId of participants) {
      owedMap.set(memberId, roundMoney((owedMap.get(memberId) || 0) + share))
    }
  }

  const balances = members.map((member) => {
    const paid = roundMoney(paidMap.get(member.id) || 0)
    const owed = roundMoney(owedMap.get(member.id) || 0)
    return {
      memberId: member.id,
      name: member.name,
      paid,
      owed,
      net: roundMoney(paid - owed),
    }
  })

  const creditors = balances
    .filter((item) => item.net > 0.009)
    .map((item) => ({ ...item }))
    .sort((a, b) => b.net - a.net)

  const debtors = balances
    .filter((item) => item.net < -0.009)
    .map((item) => ({ ...item, net: Math.abs(item.net) }))
    .sort((a, b) => b.net - a.net)

  const transfers = []
  let creditorIndex = 0
  let debtorIndex = 0

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex]
    const debtor = debtors[debtorIndex]
    const amount = roundMoney(Math.min(creditor.net, debtor.net))

    if (amount > 0) {
      transfers.push({
        fromMemberId: debtor.memberId,
        fromName: debtor.name,
        toMemberId: creditor.memberId,
        toName: creditor.name,
        amount,
      })
    }

    creditor.net = roundMoney(creditor.net - amount)
    debtor.net = roundMoney(debtor.net - amount)

    if (creditor.net <= 0.009) {
      creditorIndex += 1
    }

    if (debtor.net <= 0.009) {
      debtorIndex += 1
    }
  }

  return { balances, transfers }
}

async function ensureExpenseBook(battleBook) {
  let book = await getStoredExpenseBookByBattleBookId(battleBook.id)

  if (book) {
    return book
  }

  const now = new Date().toISOString()
  book = {
    id: nanoid(10),
    battleBookId: battleBook.id,
    userId: battleBook.userId,
    title: `${battleBook.input.eventName}预算与记账`,
    currency: 'CNY',
    createdAt: now,
    updatedAt: now,
  }

  await saveExpenseBook(book)

  const owner = {
    id: nanoid(10),
    expenseBookId: book.id,
    name: '我',
    role: 'owner',
    payChannel: '微信',
    isOwner: true,
    createdAt: now,
  }

  await saveExpenseMember(owner)
  return book
}

async function getMoneyDashboardByBattleBookId(battleBookId) {
  const battleBook = await getStoredBattleBookById(battleBookId)
  ensureBattleBookExists(battleBook)

  const budgetPlan = await getStoredBudgetPlanByBattleBookId(battleBookId)
  const expenseBook = await ensureExpenseBook(battleBook)
  const members = await listStoredExpenseMembers(expenseBook.id)
  const items = await listStoredExpenseItems(expenseBook.id)
  const settlement = buildSettlement(members, items)
  const budgetSummary = buildBudgetSummary(budgetPlan, items)

  return {
    battleBook,
    budgetPlan,
    budgetSummary,
    expenseBook,
    members,
    items,
    settlement,
    expenseCategories: EXPENSE_CATEGORIES,
    budgetCategories: BUDGET_CATEGORIES,
  }
}

async function suggestBudgetPlan(battleBookId, totalBudget) {
  const battleBook = await getStoredBattleBookById(battleBookId)
  ensureBattleBookExists(battleBook)
  const normalizedBudget = normalizeMoneyAmount(totalBudget)

  if (!normalizedBudget) {
    const error = new Error('先填一个有效的总预算。')
    error.statusCode = 400
    throw error
  }

  return {
    totalBudget: normalizedBudget,
    categories: buildSuggestedCategories(battleBook.input.sceneType, normalizedBudget),
    strategy: 'balanced',
  }
}

async function upsertBudgetPlan(battleBookId, payload) {
  const battleBook = await getStoredBattleBookById(battleBookId)
  ensureBattleBookExists(battleBook)

  const totalBudget = normalizeMoneyAmount(payload.totalBudget)
  if (!totalBudget) {
    const error = new Error('总预算必须大于 0。')
    error.statusCode = 400
    throw error
  }

  const existing = await getStoredBudgetPlanByBattleBookId(battleBookId)
  const now = new Date().toISOString()
  const normalizedPayload = normalizeBudgetPayload(totalBudget, battleBook.input.sceneType, payload)

  const item = {
    id: existing?.id || nanoid(10),
    battleBookId,
    userId: battleBook.userId,
    currency: payload.currency || 'CNY',
    totalBudget,
    sceneType: battleBook.input.sceneType,
    status: 'active',
    payload: normalizedPayload,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }

  await saveBudgetPlan(item)
  return getMoneyDashboardByBattleBookId(battleBookId)
}

async function addExpenseMember(expenseBookId, payload) {
  const book = await resolveExpenseBookById(expenseBookId)
  if (!book) {
    const error = new Error('没有找到这本账。')
    error.statusCode = 404
    throw error
  }

  if (!payload.name?.trim()) {
    const error = new Error('先填同行人的名字。')
    error.statusCode = 400
    throw error
  }

  const item = {
    id: nanoid(10),
    expenseBookId,
    name: payload.name.trim(),
    role: payload.role || 'member',
    payChannel: payload.payChannel || '',
    isOwner: Boolean(payload.isOwner),
    createdAt: new Date().toISOString(),
  }

  await saveExpenseMember(item)
  return item
}

async function resolveExpenseBookById(expenseBookId) {
  const battleBooks = await listStoredBattleBooks()

  for (const battleBook of battleBooks) {
    const book = await getStoredExpenseBookByBattleBookId(battleBook.id)
    if (book?.id === expenseBookId) {
      return book
    }
  }

  return null
}

async function addExpenseItem(expenseBookId, payload) {
  const book = await resolveExpenseBookById(expenseBookId)
  if (!book) {
    const error = new Error('没有找到这本账。')
    error.statusCode = 404
    throw error
  }

  if (!payload.title?.trim()) {
    const error = new Error('先写一下这笔支出的名称。')
    error.statusCode = 400
    throw error
  }

  const amount = normalizeMoneyAmount(payload.amount)
  if (!amount) {
    const error = new Error('金额必须大于 0。')
    error.statusCode = 400
    throw error
  }

  const members = await listStoredExpenseMembers(expenseBookId)
  const memberIds = new Set(members.map((member) => member.id))
  const participants = Array.isArray(payload.participantMemberIds) ? payload.participantMemberIds.filter((id) => memberIds.has(id)) : []

  if (!memberIds.has(payload.paidByMemberId)) {
    const error = new Error('付款人不在当前账本里。')
    error.statusCode = 400
    throw error
  }

  if (!participants.length) {
    const error = new Error('至少选一个分摊人。')
    error.statusCode = 400
    throw error
  }

  const item = {
    id: nanoid(10),
    expenseBookId,
    title: payload.title.trim(),
    category: payload.category || 'other',
    amount,
    paidByMemberId: payload.paidByMemberId,
    splitMode: 'equal',
    participantMemberIds: participants,
    occurredAt: payload.occurredAt || new Date().toISOString(),
    note: payload.note || '',
    createdAt: new Date().toISOString(),
  }

  await saveExpenseItem(item)
  return item
}

async function deleteExpenseMember(memberId) {
  const member = await getStoredExpenseMemberById(memberId)
  if (!member) {
    return null
  }

  const items = await listStoredExpenseItems(member.expenseBookId)
  const isInUse = items.some(
    (item) => item.paidByMemberId === memberId || (item.participantMemberIds || []).includes(memberId)
  )

  if (isInUse) {
    const error = new Error('这个同行人已经参与过支出，先删掉相关账目再移除。')
    error.statusCode = 400
    throw error
  }

  return deleteStoredExpenseMemberById(memberId)
}

async function deleteExpenseItem(itemId) {
  return deleteStoredExpenseItemById(itemId)
}

async function getSettlementByExpenseBookId(expenseBookId) {
  const book = await resolveExpenseBookById(expenseBookId)
  if (!book) {
    const error = new Error('没有找到这本账。')
    error.statusCode = 404
    throw error
  }

  const members = await listStoredExpenseMembers(expenseBookId)
  const items = await listStoredExpenseItems(expenseBookId)
  return buildSettlement(members, items)
}

module.exports = {
  addExpenseItem,
  addExpenseMember,
  deleteExpenseItem,
  deleteExpenseMember,
  getMoneyDashboardByBattleBookId,
  getSettlementByExpenseBookId,
  suggestBudgetPlan,
  upsertBudgetPlan,
}
