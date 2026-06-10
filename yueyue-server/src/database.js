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
      default_participant_member_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.query(`
    ALTER TABLE expense_books
    ADD COLUMN IF NOT EXISTS default_participant_member_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
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

  await db.query(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      contact TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at
    ON feedbacks (created_at DESC);
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS buddy_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      scene_type TEXT NOT NULL,
      event_name TEXT NOT NULL,
      target_name TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL,
      venue TEXT NOT NULL,
      event_date TEXT NOT NULL,
      start_time TEXT NOT NULL DEFAULT '',
      ticket_area TEXT NOT NULL DEFAULT '',
      intent_type TEXT NOT NULL,
      intent_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      content TEXT NOT NULL,
      companions_expected INTEGER NOT NULL DEFAULT 1,
      is_first_time BOOLEAN NOT NULL DEFAULT FALSE,
      contact_type TEXT NOT NULL,
      contact_value TEXT NOT NULL,
      contact_visibility TEXT NOT NULL DEFAULT 'after_join',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.query(`
    ALTER TABLE buddy_posts
    ADD COLUMN IF NOT EXISTS contact_visibility TEXT NOT NULL DEFAULT 'after_join';
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_buddy_posts_created_at
    ON buddy_posts (created_at DESC);
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_buddy_posts_status
    ON buddy_posts (status);
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_buddy_posts_city_event_date
    ON buddy_posts (city, event_date);
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS buddy_reports (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      reporter_contact TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_buddy_reports_post_id
    ON buddy_reports (post_id);
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS buddy_favorites (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (post_id, user_id)
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_buddy_favorites_post_id
    ON buddy_favorites (post_id);
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS buddy_join_intents (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (post_id, user_id)
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_buddy_join_intents_post_id
    ON buddy_join_intents (post_id);
  `)

  initialized = true
}

module.exports = {
  getPool,
  hasDatabaseConfig,
  initializeDatabase,
}
