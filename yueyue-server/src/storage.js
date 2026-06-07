const { battleBooks, budgetPlans, expenseBooks, expenseItems, expenseMembers, shareLinks } = require('./data')
const { getPool, hasDatabaseConfig, initializeDatabase } = require('./database')

async function initializeStorage() {
  if (hasDatabaseConfig()) {
    await initializeDatabase()
  }
}

function sortByCreatedAtDesc(items) {
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

async function saveBattleBook(item) {
  if (!hasDatabaseConfig()) {
    battleBooks.set(item.id, item)
    shareLinks.set(item.shareToken, item.id)
    return item
  }

  const db = getPool()
  await db.query(
    `
      INSERT INTO battle_books (id, share_token, user_id, payload, created_at, updated_at)
      VALUES ($1, $2, $3, $4::jsonb, $5::timestamptz, $6::timestamptz)
      ON CONFLICT (id)
      DO UPDATE SET
        share_token = EXCLUDED.share_token,
        user_id = EXCLUDED.user_id,
        payload = EXCLUDED.payload,
        updated_at = EXCLUDED.updated_at
    `,
    [item.id, item.shareToken, item.userId, JSON.stringify(item), item.createdAt, item.updatedAt]
  )

  return item
}

async function listStoredBattleBooks() {
  if (!hasDatabaseConfig()) {
    return sortByCreatedAtDesc(Array.from(battleBooks.values()))
  }

  const db = getPool()
  const result = await db.query(`
    SELECT payload
    FROM battle_books
    ORDER BY created_at DESC
  `)

  return result.rows.map((row) => row.payload)
}

async function getStoredBattleBookById(id) {
  if (!hasDatabaseConfig()) {
    return battleBooks.get(id) || null
  }

  const db = getPool()
  const result = await db.query(
    `
      SELECT payload
      FROM battle_books
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  )

  return result.rows[0]?.payload || null
}

async function deleteStoredBattleBookById(id) {
  if (!hasDatabaseConfig()) {
    const existing = battleBooks.get(id)

    if (!existing) {
      return null
    }

    battleBooks.delete(id)
    shareLinks.delete(existing.shareToken)
    return existing
  }

  const db = getPool()
  const result = await db.query(
    `
      DELETE FROM battle_books
      WHERE id = $1
      RETURNING payload
    `,
    [id]
  )

  return result.rows[0]?.payload || null
}

async function getStoredBattleBookByShareToken(token) {
  if (!hasDatabaseConfig()) {
    const id = shareLinks.get(token)
    return id ? battleBooks.get(id) || null : null
  }

  const db = getPool()
  const result = await db.query(
    `
      SELECT payload
      FROM battle_books
      WHERE share_token = $1
      LIMIT 1
    `,
    [token]
  )

  return result.rows[0]?.payload || null
}

async function saveBudgetPlan(item) {
  if (!hasDatabaseConfig()) {
    budgetPlans.set(item.battleBookId, item)
    return item
  }

  const db = getPool()
  await db.query(
    `
      INSERT INTO budget_plans (
        id, battle_book_id, user_id, currency, total_budget, scene_type, status, payload, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::timestamptz, $10::timestamptz)
      ON CONFLICT (battle_book_id)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        currency = EXCLUDED.currency,
        total_budget = EXCLUDED.total_budget,
        scene_type = EXCLUDED.scene_type,
        status = EXCLUDED.status,
        payload = EXCLUDED.payload,
        updated_at = EXCLUDED.updated_at
    `,
    [
      item.id,
      item.battleBookId,
      item.userId,
      item.currency,
      item.totalBudget,
      item.sceneType,
      item.status,
      JSON.stringify(item.payload),
      item.createdAt,
      item.updatedAt,
    ]
  )

  return item
}

async function getStoredBudgetPlanByBattleBookId(battleBookId) {
  if (!hasDatabaseConfig()) {
    return budgetPlans.get(battleBookId) || null
  }

  const db = getPool()
  const result = await db.query(
    `
      SELECT
        id,
        battle_book_id,
        user_id,
        currency,
        total_budget,
        scene_type,
        status,
        payload,
        created_at,
        updated_at
      FROM budget_plans
      WHERE battle_book_id = $1
      LIMIT 1
    `,
    [battleBookId]
  )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return {
    id: row.id,
    battleBookId: row.battle_book_id,
    userId: row.user_id,
    currency: row.currency,
    totalBudget: Number(row.total_budget),
    sceneType: row.scene_type,
    status: row.status,
    payload: row.payload,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function saveExpenseBook(item) {
  if (!hasDatabaseConfig()) {
    expenseBooks.set(item.battleBookId, item)
    return item
  }

  const db = getPool()
  await db.query(
    `
      INSERT INTO expense_books (id, battle_book_id, user_id, title, currency, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz)
      ON CONFLICT (battle_book_id)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        title = EXCLUDED.title,
        currency = EXCLUDED.currency,
        updated_at = EXCLUDED.updated_at
    `,
    [item.id, item.battleBookId, item.userId, item.title, item.currency, item.createdAt, item.updatedAt]
  )

  return item
}

async function getStoredExpenseBookByBattleBookId(battleBookId) {
  if (!hasDatabaseConfig()) {
    return expenseBooks.get(battleBookId) || null
  }

  const db = getPool()
  const result = await db.query(
    `
      SELECT id, battle_book_id, user_id, title, currency, created_at, updated_at
      FROM expense_books
      WHERE battle_book_id = $1
      LIMIT 1
    `,
    [battleBookId]
  )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return {
    id: row.id,
    battleBookId: row.battle_book_id,
    userId: row.user_id,
    title: row.title,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function listStoredExpenseMembers(expenseBookId) {
  if (!hasDatabaseConfig()) {
    return Array.from(expenseMembers.values())
      .filter((item) => item.expenseBookId === expenseBookId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  const db = getPool()
  const result = await db.query(
    `
      SELECT id, expense_book_id, name, role, pay_channel, is_owner, created_at
      FROM expense_members
      WHERE expense_book_id = $1
      ORDER BY created_at ASC
    `,
    [expenseBookId]
  )

  return result.rows.map((row) => ({
    id: row.id,
    expenseBookId: row.expense_book_id,
    name: row.name,
    role: row.role,
    payChannel: row.pay_channel,
    isOwner: row.is_owner,
    createdAt: row.created_at,
  }))
}

async function saveExpenseMember(item) {
  if (!hasDatabaseConfig()) {
    expenseMembers.set(item.id, item)
    return item
  }

  const db = getPool()
  await db.query(
    `
      INSERT INTO expense_members (id, expense_book_id, name, role, pay_channel, is_owner, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)
    `,
    [item.id, item.expenseBookId, item.name, item.role, item.payChannel, item.isOwner, item.createdAt]
  )

  return item
}

async function getStoredExpenseMemberById(id) {
  if (!hasDatabaseConfig()) {
    return expenseMembers.get(id) || null
  }

  const db = getPool()
  const result = await db.query(
    `
      SELECT id, expense_book_id, name, role, pay_channel, is_owner, created_at
      FROM expense_members
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return {
    id: row.id,
    expenseBookId: row.expense_book_id,
    name: row.name,
    role: row.role,
    payChannel: row.pay_channel,
    isOwner: row.is_owner,
    createdAt: row.created_at,
  }
}

async function deleteStoredExpenseMemberById(id) {
  if (!hasDatabaseConfig()) {
    const existing = expenseMembers.get(id)

    if (!existing) {
      return null
    }

    expenseMembers.delete(id)
    return existing
  }

  const db = getPool()
  const result = await db.query(
    `
      DELETE FROM expense_members
      WHERE id = $1
      RETURNING id, expense_book_id, name, role, pay_channel, is_owner, created_at
    `,
    [id]
  )

  const row = result.rows[0]
  if (!row) {
    return null
  }

  return {
    id: row.id,
    expenseBookId: row.expense_book_id,
    name: row.name,
    role: row.role,
    payChannel: row.pay_channel,
    isOwner: row.is_owner,
    createdAt: row.created_at,
  }
}

async function listStoredExpenseItems(expenseBookId) {
  if (!hasDatabaseConfig()) {
    return Array.from(expenseItems.values())
      .filter((item) => item.expenseBookId === expenseBookId)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  }

  const db = getPool()
  const result = await db.query(
    `
      SELECT
        id,
        expense_book_id,
        title,
        category,
        amount,
        paid_by_member_id,
        split_mode,
        participant_member_ids,
        occurred_at,
        note,
        created_at
      FROM expense_items
      WHERE expense_book_id = $1
      ORDER BY occurred_at DESC, created_at DESC
    `,
    [expenseBookId]
  )

  return result.rows.map((row) => ({
    id: row.id,
    expenseBookId: row.expense_book_id,
    title: row.title,
    category: row.category,
    amount: Number(row.amount),
    paidByMemberId: row.paid_by_member_id,
    splitMode: row.split_mode,
    participantMemberIds: row.participant_member_ids,
    occurredAt: row.occurred_at,
    note: row.note,
    createdAt: row.created_at,
  }))
}

async function saveExpenseItem(item) {
  if (!hasDatabaseConfig()) {
    expenseItems.set(item.id, item)
    return item
  }

  const db = getPool()
  await db.query(
    `
      INSERT INTO expense_items (
        id,
        expense_book_id,
        title,
        category,
        amount,
        paid_by_member_id,
        split_mode,
        participant_member_ids,
        occurred_at,
        note,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::timestamptz, $10, $11::timestamptz)
    `,
    [
      item.id,
      item.expenseBookId,
      item.title,
      item.category,
      item.amount,
      item.paidByMemberId,
      item.splitMode,
      JSON.stringify(item.participantMemberIds),
      item.occurredAt,
      item.note,
      item.createdAt,
    ]
  )

  return item
}

async function getStoredExpenseItemById(id) {
  if (!hasDatabaseConfig()) {
    return expenseItems.get(id) || null
  }

  const db = getPool()
  const result = await db.query(
    `
      SELECT
        id,
        expense_book_id,
        title,
        category,
        amount,
        paid_by_member_id,
        split_mode,
        participant_member_ids,
        occurred_at,
        note,
        created_at
      FROM expense_items
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  )

  const row = result.rows[0]
  if (!row) {
    return null
  }

  return {
    id: row.id,
    expenseBookId: row.expense_book_id,
    title: row.title,
    category: row.category,
    amount: Number(row.amount),
    paidByMemberId: row.paid_by_member_id,
    splitMode: row.split_mode,
    participantMemberIds: row.participant_member_ids,
    occurredAt: row.occurred_at,
    note: row.note,
    createdAt: row.created_at,
  }
}

async function deleteStoredExpenseItemById(id) {
  if (!hasDatabaseConfig()) {
    const existing = expenseItems.get(id)

    if (!existing) {
      return null
    }

    expenseItems.delete(id)
    return existing
  }

  const db = getPool()
  const result = await db.query(
    `
      DELETE FROM expense_items
      WHERE id = $1
      RETURNING
        id,
        expense_book_id,
        title,
        category,
        amount,
        paid_by_member_id,
        split_mode,
        participant_member_ids,
        occurred_at,
        note,
        created_at
    `,
    [id]
  )

  const row = result.rows[0]
  if (!row) {
    return null
  }

  return {
    id: row.id,
    expenseBookId: row.expense_book_id,
    title: row.title,
    category: row.category,
    amount: Number(row.amount),
    paidByMemberId: row.paid_by_member_id,
    splitMode: row.split_mode,
    participantMemberIds: row.participant_member_ids,
    occurredAt: row.occurred_at,
    note: row.note,
    createdAt: row.created_at,
  }
}

module.exports = {
  deleteStoredBattleBookById,
  deleteStoredExpenseItemById,
  deleteStoredExpenseMemberById,
  getStoredBattleBookById,
  getStoredBattleBookByShareToken,
  getStoredBudgetPlanByBattleBookId,
  getStoredExpenseBookByBattleBookId,
  getStoredExpenseItemById,
  getStoredExpenseMemberById,
  initializeStorage,
  listStoredBattleBooks,
  listStoredExpenseItems,
  listStoredExpenseMembers,
  saveBattleBook,
  saveBudgetPlan,
  saveExpenseBook,
  saveExpenseItem,
  saveExpenseMember,
}
