const path = require('path')
const express = require('express')
const cors = require('cors')
const { config, isAmapConfigured, isOpenAIConfigured } = require('./config')
const { hasDatabaseConfig } = require('./database')
const { initializeStorage, saveFeedback, listStoredFeedbacks } = require('./storage')
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
  createBuddyPost,
  deleteBuddyPost,
  getBuddyPostById,
  listBuddyPosts,
  listMyBuddyPosts,
  reportBuddyPost,
  toggleBuddyFavorite,
  toggleBuddyJoinIntent,
  updateBuddyPost,
  updateBuddyPostStatus,
} = require('./buddy-service')
const {
  addExpenseItem,
  addExpenseMember,
  deleteExpenseItem,
  deleteExpenseMember,
  getMoneyDashboardByBattleBookId,
  getSettlementByExpenseBookId,
  suggestBudgetPlan,
  updateExpenseBookDefaults,
  upsertBudgetPlan,
} = require('./money-service')
const { geocodePlace, getPlaceSuggestions, getRoutePlan } = require('./map-service')
const { importPlannerActivity } = require('./planner-import-service')
const { findVenueRule } = require('./venue-rules')

const app = express()
const clientDistPath = path.resolve(__dirname, '../../yueyue-client/dist')

app.set('trust proxy', true)
app.use(cors())
app.use(express.json({ limit: '12mb' }))

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    aiConfigured: isOpenAIConfigured(),
    amapConfigured: isAmapConfigured(),
    model: config.openaiModel,
    storage: hasDatabaseConfig() ? 'postgres' : 'memory',
  })
})

app.post('/api/planner/import', async (request, response) => {
  try {
    const item = await importPlannerActivity(request.body || {})
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '导入活动信息失败，请稍后再试。',
    })
  }
})

app.get('/api/maps/place-suggestions', async (request, response) => {
  try {
    const { q = '', city = '' } = request.query
    const items = await getPlaceSuggestions({ keyword: q, city })
    return response.json({ items })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '获取地点联想失败，请稍后再试。',
    })
  }
})

app.post('/api/maps/geocode', async (request, response) => {
  try {
    const item = await geocodePlace(request.body || {})
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '解析地点失败，请稍后再试。',
    })
  }
})

app.post('/api/maps/route-plan', async (request, response) => {
  try {
    const { origin, destination, departureCity, isCrossCity } = request.body || {}

    if (!destination) {
      return response.status(400).json({ message: '目的地不能为空。' })
    }

    if (!origin && !(isCrossCity && String(departureCity || '').trim())) {
      return response.status(400).json({ message: '请先填写出发地，或在跨城模式下填写出发城市。' })
    }

    const item = await getRoutePlan(request.body || {})
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '路线规划失败，请稍后再试。',
    })
  }
})

app.post('/api/feedbacks', async (request, response) => {
  try {
    const { type, content, contact } = request.body
    if (!type || !content) {
      return response.status(400).json({ message: '类型和内容不能为空。' })
    }

    const { randomUUID } = require('crypto')
    const item = {
      id: randomUUID(),
      type,
      content,
      contact: contact || '',
      createdAt: new Date().toISOString(),
    }

    await saveFeedback(item)
    return response.status(201).json({ item })
  } catch (error) {
    return response.status(500).json({
      message: error.message || '提交反馈失败，请稍后再试。',
    })
  }
})

app.get('/api/admin/feedbacks', async (request, response) => {
  try {
    const items = await listStoredFeedbacks()
    return response.json({ items })
  } catch (error) {
    return response.status(500).json({
      message: error.message || '获取反馈列表失败。',
    })
  }
})

app.get('/api/buddy-posts', async (request, response) => {
  try {
    const items = await listBuddyPosts({
      city: request.query.city,
      eventDate: request.query.eventDate,
      sceneType: request.query.sceneType,
      intentType: request.query.intentType,
      venue: request.query.venue,
      intentTag: request.query.intentTag,
    })
    return response.json({ items })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '获取找搭子列表失败，请稍后再试。',
    })
  }
})

app.post('/api/buddy-posts', async (request, response) => {
  try {
    const item = await createBuddyPost(request.body || {})
    return response.status(201).json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '发布找搭子需求失败，请稍后再试。',
    })
  }
})

app.put('/api/buddy-posts/:id', async (request, response) => {
  try {
    const item = await updateBuddyPost(request.params.id, request.body || {})
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '更新找搭子需求失败，请稍后再试。',
    })
  }
})

app.get('/api/buddy-posts/:id', async (request, response) => {
  try {
    const item = await getBuddyPostById(request.params.id)
    if (!item) {
      return response.status(404).json({ message: '没有找到这条找搭子需求。' })
    }

    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '获取找搭子详情失败，请稍后再试。',
    })
  }
})

app.post('/api/buddy-posts/:id/status', async (request, response) => {
  try {
    const item = await updateBuddyPostStatus(request.params.id, request.body || {})
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '更新帖子状态失败，请稍后再试。',
    })
  }
})

app.delete('/api/buddy-posts/:id', async (request, response) => {
  try {
    const item = await deleteBuddyPost(request.params.id)

    if (!item) {
      return response.status(404).json({ message: '没有找到要删除的找搭子需求。' })
    }

    return response.json({ success: true })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '删除找搭子需求失败，请稍后再试。',
    })
  }
})

app.post('/api/buddy-posts/:id/report', async (request, response) => {
  try {
    const item = await reportBuddyPost(request.params.id, request.body || {})
    return response.status(201).json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '举报失败，请稍后再试。',
    })
  }
})

app.post('/api/buddy-posts/:id/favorite', async (request, response) => {
  try {
    const item = await toggleBuddyFavorite(request.params.id)
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '收藏操作失败，请稍后再试。',
    })
  }
})

app.post('/api/buddy-posts/:id/join-intent', async (request, response) => {
  try {
    const item = await toggleBuddyJoinIntent(request.params.id, request.body || {})
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '提交一起同行意向失败，请稍后再试。',
    })
  }
})

app.get('/api/my/buddy-posts', async (_request, response) => {
  try {
    const items = await listMyBuddyPosts()
    return response.json({ items })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '获取我的找搭子发布失败，请稍后再试。',
    })
  }
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

app.post('/api/expense-books/:id/defaults', async (request, response) => {
  try {
    const item = await updateExpenseBookDefaults(request.params.id, request.body || {})
    return response.json({ item })
  } catch (error) {
    return response.status(error.statusCode || 500).json({
      message: error.message || '保存默认 AA 失败，请稍后再试。',
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

app.use((error, _request, response, next) => {
  if (!error) {
    return next()
  }

  if (error.type === 'entity.too.large') {
    return response.status(413).json({
      message: '上传的截图太大，请压缩后重试，建议控制在 8MB 以内。',
    })
  }

  return response.status(error.statusCode || 500).json({
    message: error.message || '服务开小差了，请稍后再试。',
  })
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
