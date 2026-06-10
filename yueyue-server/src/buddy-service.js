const { randomUUID } = require('crypto')
const {
  deleteStoredBuddyFavorite,
  deleteStoredBuddyJoinIntent,
  deleteStoredBuddyPostById,
  getStoredBuddyFavorite,
  getStoredBuddyJoinIntent,
  getStoredBuddyPostById,
  listStoredBuddyFavorites,
  listStoredBuddyJoinIntents,
  listStoredBuddyPosts,
  listStoredBuddyPostsByUserId,
  saveBuddyFavorite,
  saveBuddyJoinIntent,
  saveBuddyPost,
  saveBuddyReport,
} = require('./storage')

const DEMO_USER_ID = 'demo-user'
const ALLOWED_BUDDY_STATUSES = ['active', 'hidden', 'closed']
const ALLOWED_CONTACT_VISIBILITY = ['public', 'after_join']
const BLOCKED_TERMS = [
  '票务',
  '出票',
  '代拍',
  '兼职',
  '借贷',
  '广告',
  '加群',
  '二维码',
  '约炮',
  'advertising',
  'part-time',
  'loan',
  'qr code',
]
const FIELD_LENGTH_LIMITS = {
  eventName: 80,
  targetName: 60,
  city: 30,
  venue: 80,
  ticketArea: 40,
  contactValue: 40,
  content: 300,
}

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => normalizeText(item)).filter(Boolean)
}

function normalizeContactVisibility(value) {
  const normalized = normalizeText(value)
  return normalized || 'after_join'
}

function normalizeBuddyFilters(input = {}) {
  return {
    city: normalizeText(input.city).toLowerCase(),
    eventDate: normalizeText(input.eventDate),
    sceneType: normalizeText(input.sceneType),
    intentType: normalizeText(input.intentType),
    venue: normalizeText(input.venue).toLowerCase(),
    intentTag: normalizeText(input.intentTag),
  }
}

function createValidationError(message) {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

function containsBlockedTerm(value) {
  const text = normalizeText(value).toLowerCase()
  return BLOCKED_TERMS.find((term) => text.includes(String(term).toLowerCase())) || ''
}

function validateTextLength(value, label, limit) {
  if (normalizeText(value).length > limit) {
    throw createValidationError(`${label}不能超过 ${limit} 个字符。`)
  }
}

function validateContactValue(input) {
  const contactValue = normalizeText(input.contactValue)

  if (contactValue.length < 2) {
    throw createValidationError('联系方式至少需要 2 个字符。')
  }

  if (/1\d{10}/.test(contactValue)) {
    throw createValidationError('当前版本不支持公开展示手机号，请改用微信、小红书或联系口令。')
  }

  if (/https?:\/\//i.test(contactValue) || /www\./i.test(contactValue)) {
    throw createValidationError('联系方式里请不要直接放外链。')
  }

  if (/二维码/.test(contactValue)) {
    throw createValidationError('当前版本不支持二维码相关联系方式。')
  }
}

function validateBuddyPostInput(input) {
  const requiredFields = [
    ['sceneType', '活动类型'],
    ['eventName', '活动名称'],
    ['city', '城市'],
    ['venue', '场馆'],
    ['eventDate', '活动日期'],
    ['intentType', '搭子类型'],
    ['content', '需求描述'],
    ['contactType', '联系方式类型'],
    ['contactValue', '联系方式'],
  ]

  const missing = requiredFields.find(([key]) => !normalizeText(input[key]))
  if (missing) {
    throw createValidationError(`${missing[1]}不能为空。`)
  }

  Object.entries(FIELD_LENGTH_LIMITS).forEach(([field, limit]) => {
    const labels = {
      eventName: '活动名称',
      targetName: '主目标',
      city: '城市',
      venue: '场馆',
      ticketArea: '票区/看台',
      contactValue: '联系方式',
      content: '需求描述',
    }
    validateTextLength(input[field], labels[field], limit)
  })

  ;[
    ['eventName', '活动名称'],
    ['targetName', '主目标'],
    ['content', '需求描述'],
    ['contactValue', '联系方式'],
  ].forEach(([field, label]) => {
    const blockedTerm = containsBlockedTerm(input[field])
    if (blockedTerm) {
      throw createValidationError(`${label}包含不支持发布的内容：${blockedTerm}。`)
    }
  })

  if (!ALLOWED_CONTACT_VISIBILITY.includes(normalizeContactVisibility(input.contactVisibility))) {
    throw createValidationError('联系方式展示方式不合法。')
  }

  validateContactValue(input)
}

function validateJoinIntentInput(input) {
  const message = normalizeText(input.message)

  if (message.length > 80) {
    throw createValidationError('想一起留言不能超过 80 个字符。')
  }

  const blockedTerm = containsBlockedTerm(message)
  if (blockedTerm) {
    throw createValidationError(`想一起留言包含不支持发布的内容：${blockedTerm}。`)
  }
}

function buildBuddyPostPayload(input, existing = {}) {
  return {
    sceneType: normalizeText(input.sceneType ?? existing.sceneType),
    eventName: normalizeText(input.eventName ?? existing.eventName),
    targetName: normalizeText(input.targetName ?? existing.targetName),
    city: normalizeText(input.city ?? existing.city),
    venue: normalizeText(input.venue ?? existing.venue),
    eventDate: normalizeText(input.eventDate ?? existing.eventDate),
    startTime: normalizeText(input.startTime ?? existing.startTime),
    ticketArea: normalizeText(input.ticketArea ?? existing.ticketArea),
    intentType: normalizeText(input.intentType ?? existing.intentType),
    intentTags: normalizeStringArray(input.intentTags ?? existing.intentTags),
    content: normalizeText(input.content ?? existing.content),
    companionsExpected: Math.max(1, Number(input.companionsExpected ?? existing.companionsExpected) || 1),
    isFirstTime: Boolean(input.isFirstTime ?? existing.isFirstTime),
    contactType: normalizeText(input.contactType ?? existing.contactType),
    contactValue: normalizeText(input.contactValue ?? existing.contactValue),
    contactVisibility: normalizeContactVisibility(input.contactVisibility ?? existing.contactVisibility),
  }
}

function maskContactValue(value) {
  const contactValue = normalizeText(value)

  if (!contactValue) {
    return '暂未填写'
  }

  if (contactValue.length <= 2) {
    return `${contactValue[0] || '*'}***`
  }

  if (contactValue.length <= 4) {
    return `${contactValue[0]}***`
  }

  return `${contactValue.slice(0, 2)}***${contactValue.slice(-2)}`
}

async function requireOwnedBuddyPost(id) {
  const existing = await getStoredBuddyPostById(id)

  if (!existing) {
    const error = new Error('没有找到这条找搭子需求。')
    error.statusCode = 404
    throw error
  }

  if (existing.userId !== DEMO_USER_ID) {
    const error = new Error('你无权操作这条找搭子需求。')
    error.statusCode = 403
    throw error
  }

  return existing
}

async function createBuddyPost(input) {
  const payload = buildBuddyPostPayload(input)
  validateBuddyPostInput(payload)

  const now = new Date().toISOString()
  const item = {
    id: randomUUID(),
    userId: DEMO_USER_ID,
    ...payload,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }

  return saveBuddyPost(item)
}

function enrichBuddyPost(item, favorites, joinIntents) {
  const postFavorites = favorites.filter((favorite) => favorite.postId === item.id)
  const postJoinIntents = joinIntents.filter((joinItem) => joinItem.postId === item.id)
  const isOwner = item.userId === DEMO_USER_ID
  const hasJoined = postJoinIntents.some((joinItem) => joinItem.userId === DEMO_USER_ID)
  const contactVisibility = normalizeContactVisibility(item.contactVisibility)
  const canViewContact = contactVisibility === 'public' || hasJoined || isOwner

  return {
    ...item,
    contactVisibility,
    favoriteCount: postFavorites.length,
    joinIntentCount: postJoinIntents.length,
    isFavorited: postFavorites.some((favorite) => favorite.userId === DEMO_USER_ID),
    hasJoined,
    isOwner,
    canViewContact,
    maskedContactValue: maskContactValue(item.contactValue),
    latestJoinMessage: postJoinIntents[0]?.message || '',
  }
}

async function enrichBuddyPosts(items) {
  const [favorites, joinIntents] = await Promise.all([listStoredBuddyFavorites(), listStoredBuddyJoinIntents()])
  return items.map((item) => enrichBuddyPost(item, favorites, joinIntents))
}

async function updateBuddyPost(id, input) {
  const existing = await requireOwnedBuddyPost(id)
  const payload = buildBuddyPostPayload(input, existing)
  validateBuddyPostInput(payload)

  return saveBuddyPost({
    ...existing,
    ...payload,
    updatedAt: new Date().toISOString(),
  })
}

async function listBuddyPosts(filters = {}) {
  const items = await listStoredBuddyPosts()
  const normalizedFilters = normalizeBuddyFilters(filters)

  const filteredItems = items.filter((item) => {
    if (item.status !== 'active') return false
    if (normalizedFilters.city && !normalizeText(item.city).toLowerCase().includes(normalizedFilters.city)) return false
    if (normalizedFilters.eventDate && item.eventDate !== normalizedFilters.eventDate) return false
    if (normalizedFilters.sceneType && item.sceneType !== normalizedFilters.sceneType) return false
    if (normalizedFilters.intentType && item.intentType !== normalizedFilters.intentType) return false
    if (normalizedFilters.venue && !normalizeText(item.venue).toLowerCase().includes(normalizedFilters.venue)) return false
    if (normalizedFilters.intentTag && !normalizeStringArray(item.intentTags).includes(normalizedFilters.intentTag)) return false
    return true
  })

  return enrichBuddyPosts(filteredItems)
}

async function listMyBuddyPosts() {
  const items = await listStoredBuddyPostsByUserId(DEMO_USER_ID)
  return enrichBuddyPosts(items)
}

async function getBuddyPostById(id) {
  const item = await getStoredBuddyPostById(id)
  if (!item) {
    return null
  }

  const [favorites, joinIntents] = await Promise.all([listStoredBuddyFavorites(), listStoredBuddyJoinIntents()])
  return enrichBuddyPost(item, favorites, joinIntents)
}

async function deleteBuddyPost(id) {
  await requireOwnedBuddyPost(id)
  return deleteStoredBuddyPostById(id)
}

async function updateBuddyPostStatus(id, input) {
  const existing = await requireOwnedBuddyPost(id)
  const status = normalizeText(input.status)

  if (!ALLOWED_BUDDY_STATUSES.includes(status)) {
    const error = new Error('帖子状态不合法。')
    error.statusCode = 400
    throw error
  }

  return saveBuddyPost({
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  })
}

async function reportBuddyPost(id, input) {
  const existing = await getStoredBuddyPostById(id)
  if (!existing) {
    const error = new Error('没有找到要举报的帖子。')
    error.statusCode = 404
    throw error
  }

  const reason = normalizeText(input.reason)
  if (!reason) {
    throw createValidationError('举报原因不能为空。')
  }

  if (reason.length > 80) {
    throw createValidationError('举报原因不能超过 80 个字符。')
  }

  if (normalizeText(input.description).length > 200) {
    throw createValidationError('举报说明不能超过 200 个字符。')
  }

  return saveBuddyReport({
    id: randomUUID(),
    postId: id,
    reason,
    description: normalizeText(input.description),
    reporterContact: normalizeText(input.reporterContact),
    createdAt: new Date().toISOString(),
  })
}

async function toggleBuddyFavorite(id) {
  const existingPost = await getStoredBuddyPostById(id)
  if (!existingPost) {
    const error = new Error('没有找到这条找搭子需求。')
    error.statusCode = 404
    throw error
  }

  const existingFavorite = await getStoredBuddyFavorite(id, DEMO_USER_ID)
  if (existingFavorite) {
    await deleteStoredBuddyFavorite(id, DEMO_USER_ID)
  } else {
    await saveBuddyFavorite({
      id: randomUUID(),
      postId: id,
      userId: DEMO_USER_ID,
      createdAt: new Date().toISOString(),
    })
  }

  return getBuddyPostById(id)
}

async function toggleBuddyJoinIntent(id, input) {
  const existingPost = await getStoredBuddyPostById(id)
  if (!existingPost) {
    const error = new Error('没有找到这条找搭子需求。')
    error.statusCode = 404
    throw error
  }

  validateJoinIntentInput(input || {})

  const existingJoinIntent = await getStoredBuddyJoinIntent(id, DEMO_USER_ID)
  if (existingJoinIntent) {
    await deleteStoredBuddyJoinIntent(id, DEMO_USER_ID)
  } else {
    await saveBuddyJoinIntent({
      id: randomUUID(),
      postId: id,
      userId: DEMO_USER_ID,
      message: normalizeText(input.message),
      createdAt: new Date().toISOString(),
    })
  }

  return getBuddyPostById(id)
}

module.exports = {
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
}
