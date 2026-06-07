const path = require('path')
const express = require('express')
const cors = require('cors')
const { config, isOpenAIConfigured } = require('./config')
const { hasDatabaseConfig } = require('./database')
const { initializeStorage } = require('./storage')
const {
  deleteBattleBookById,
  generateBattleBook,
  getBattleBookById,
  getSharedBattleBook,
  listBattleBooks,
  listVenueRules,
  regenerateBattleBookById,
} = require('./battle-book-service')
const {
  addExpenseItem,
  addExpenseMember,
  deleteExpenseItem,
  deleteExpenseMember,
  getMoneyDashboardByBattleBookId,
  getSettlementByExpenseBookId,
  suggestBudgetPlan,
  upsertBudgetPlan,
} = require('./money-service')
const { findVenueRule } = require('./venue-rules')

const app = express()
const clientDistPath = path.resolve(__dirname, '../../yueyue-client/dist')

app.set('trust proxy', true)
app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    aiConfigured: isOpenAIConfigured(),
    model: config.openaiModel,
    storage: hasDatabaseConfig() ? 'postgres' : 'memory',
  })
})

app.get('/api/battle-books', async (_request, response) => {
  response.json({ items: await listBattleBooks() })
})

app.get('/api/venue-rules', (request, response) => {
  const { city = '', venue = '', sceneType = '' } = request.query

  if (venue) {
    const item = findVenueRule({ city, venue, sceneType })
    return response.json({ item })
  }

  return response.json({ items: listVenueRules() })
})

app.get('/api/battle-books/:id/money', async (request, response) => {
  try {
    const item = await getMoneyDashboardByBattleBookId(request.params.id)
    return response.json(item)
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '读取预算与记账数据失败，请稍后再试。',
    })
  }
})

app.post('/api/battle-books/:id/budget/suggest', async (request, response) => {
  try {
    const item = await suggestBudgetPlan(request.params.id, request.body.totalBudget)
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '预算分配建议生成失败，请稍后再试。',
    })
  }
})

app.post('/api/battle-books/:id/budget', async (request, response) => {
  try {
    const item = await upsertBudgetPlan(request.params.id, request.body)
    return response.json(item)
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '保存预算失败，请稍后再试。',
    })
  }
})

app.post('/api/expense-books/:id/members', async (request, response) => {
  try {
    const item = await addExpenseMember(request.params.id, request.body)
    return response.status(201).json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '添加同行人失败，请稍后再试。',
    })
  }
})

app.delete('/api/expense-members/:id', async (request, response) => {
  try {
    const item = await deleteExpenseMember(request.params.id)

    if (!item) {
      return response.status(404).json({ message: '没有找到这个同行人。' })
    }

    return response.json({ success: true })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '删除同行人失败，请稍后再试。',
    })
  }
})

app.post('/api/expense-books/:id/items', async (request, response) => {
  try {
    const item = await addExpenseItem(request.params.id, request.body)
    return response.status(201).json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '记账失败，请稍后再试。',
    })
  }
})

app.delete('/api/expense-items/:id', async (request, response) => {
  try {
    const item = await deleteExpenseItem(request.params.id)

    if (!item) {
      return response.status(404).json({ message: '没有找到这笔支出。' })
    }

    return response.json({ success: true })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '删除支出失败，请稍后再试。',
    })
  }
})

app.get('/api/expense-books/:id/settlement', async (request, response) => {
  try {
    const item = await getSettlementByExpenseBookId(request.params.id)
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '读取分账结果失败，请稍后再试。',
    })
  }
})

app.post('/api/battle-books/generate', async (request, response) => {
  try {
    const requiredFields = ['sceneType', 'eventName', 'city', 'venue', 'eventDate', 'budgetRange']
    const missingField = requiredFields.find((field) => !request.body[field])

    if (missingField) {
      return response.status(400).json({ message: `缺少必要字段：${missingField}` })
    }

    const item = await generateBattleBook(request.body)
    return response.status(201).json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '生成赴约手册失败，请稍后再试。',
    })
  }
})

app.post('/api/battle-books/:id/regenerate', async (request, response) => {
  try {
    const item = await regenerateBattleBookById(request.params.id, request.body || {})
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '重新生成赴约手册失败，请稍后再试。',
    })
  }
})

app.get('/api/battle-books/:id', async (request, response) => {
  const item = await getBattleBookById(request.params.id)

  if (!item) {
    return response.status(404).json({ message: '没有找到这份赴约手册。' })
  }

  return response.json({ item })
})

app.delete('/api/battle-books/:id', async (request, response) => {
  const existing = await deleteBattleBookById(request.params.id)

  if (!existing) {
    return response.status(404).json({ message: '要删除的赴约手册不存在。' })
  }

  return response.json({ success: true })
})

app.post('/api/battle-books/:id/share', async (request, response) => {
  const item = await getBattleBookById(request.params.id)

  if (!item) {
    return response.status(404).json({ message: '没有找到要分享的赴约手册。' })
  }

  return response.json({
    token: item.shareToken,
    shareUrl: `${request.protocol}://${request.get('host')}/shared/${item.shareToken}`,
  })
})

app.get('/api/shared/:token', async (request, response) => {
  const item = await getSharedBattleBook(request.params.token)

  if (!item) {
    return response.status(404).json({ message: '分享链接已失效或不存在。' })
  }

  return response.json({ item })
})

app.use(express.static(clientDistPath))

app.use((request, response, next) => {
  if (request.path.startsWith('/api/')) {
    return next()
  }

  return response.sendFile(path.join(clientDistPath, 'index.html'))
})

async function start() {
  await initializeStorage()

  app.listen(config.port, () => {
    console.log(`Yueyue server running on http://localhost:${config.port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start Yueyue server', error)
  process.exit(1)
})
