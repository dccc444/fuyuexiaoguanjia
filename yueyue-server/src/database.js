const { Pool } = require('pg')
const { config } = require('./config')

let pool
let initialized = false

function hasDatabaseConfig() {
  return Boolean(config.databaseUrl)
}

function getPool() {
  if (!hasDatabaseConfig()) {
    return null
  }

  if (!pool) {
    const shouldUseSsl = !/localhost|127\.0\.0\.1/i.test(config.databaseUrl)

    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    })
  }

  return pool
}

async function initializeDatabase() {
  if (!hasDatabaseConfig() || initialized) {
    return
  }

  const db = getPool()

  await db.query(`
    CREATE TABLE IF NOT EXISTS battle_books (
      id TEXT PRIMARY KEY,
      share_token TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_battle_books_created_at
    ON battle_books (created_at DESC);
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_battle_books_share_token
    ON battle_books (share_token);
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS budget_plans (
      id TEXT PRIMARY KEY,
      battle_book_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CNY',
      total_budget NUMERIC(12, 2) NOT NULL,
      scene_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_budget_plans_battle_book_id
    ON budget_plans (battle_book_id);
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS expense_books (
      id TEXT PRIMARY KEY,
      battle_book_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CNY',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_expense_books_battle_book_id
    ON expense_books (battle_book_id);
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS expense_members (
      id TEXT PRIMARY KEY,
      expense_book_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      pay_channel TEXT NOT NULL DEFAULT '',
      is_owner BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_expense_members_book_id
    ON expense_members (expense_book_id);
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS expense_items (
      id TEXT PRIMARY KEY,
      expense_book_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      paid_by_member_id TEXT NOT NULL,
      split_mode TEXT NOT NULL DEFAULT 'equal',
      participant_member_ids JSONB NOT NULL,
      occurred_at TIMESTAMPTZ NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_expense_items_book_id
    ON expense_items (expense_book_id);
  `)

  initialized = true
}

module.exports = {
  getPool,
  hasDatabaseConfig,
  initializeDatabase,
}
