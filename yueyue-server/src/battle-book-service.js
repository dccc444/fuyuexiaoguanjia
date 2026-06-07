const { nanoid } = require('nanoid')
const { config, isOpenAIConfigured } = require('./config')
const {
  buildBattleBookPrompt,
  buildBattleBookSchema,
  normalizeBattleBookContent,
  buildFallbackBattleBookContent,
} = require('./generator')
const { getOpenAIClient } = require('./openai-client')
const { sanitizeBattleBookInput } = require('./utils')
const { findVenueRule, listVenueRules } = require('./venue-rules')
const {
  deleteStoredBattleBookById,
  getStoredBattleBookById,
  getStoredBattleBookByShareToken,
  listStoredBattleBooks,
  saveBattleBook,
} = require('./storage')

async function buildAndSaveBattleBook(input, options = {}) {
  const normalizedInput = sanitizeBattleBookInput(input)
  const venueRule = findVenueRule(normalizedInput)
  const prompt = buildBattleBookPrompt(normalizedInput, venueRule)

  const id = options.id || nanoid(10)
  const shareToken = options.shareToken || nanoid(12)

  let parsed

  if (!isOpenAIConfigured()) {
    parsed = buildFallbackBattleBookContent(normalizedInput, venueRule)
  } else {
    const client = getOpenAIClient()
    const response = await client.responses.create({
      model: config.openaiModel,
      reasoning: { effort: 'low' },
      input: prompt,
      max_output_tokens: 2200,
      text: {
        format: {
          type: 'json_schema',
          name: 'battle_book',
          strict: true,
          schema: buildBattleBookSchema(),
        },
      },
    })

    if (!response.output_text) {
      parsed = buildFallbackBattleBookContent(normalizedInput, venueRule)
    } else {
      try {
        parsed = JSON.parse(response.output_text)
      } catch (_error) {
        parsed = buildFallbackBattleBookContent(normalizedInput, venueRule)
      }
    }
  }

  const item = {
    id,
    userId: 'demo-user',
    input: normalizedInput,
    venueRules: venueRule,
    ...normalizeBattleBookContent(parsed, normalizedInput),
    shareToken,
    createdAt: options.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveBattleBook(item)
  return item
}

async function generateBattleBook(input) {
  return buildAndSaveBattleBook(input)
}

async function regenerateBattleBookById(id, overrides = {}) {
  const existing = await getStoredBattleBookById(id)

  if (!existing) {
    const error = new Error('没有找到要重新生成的赴约手册。')
    error.statusCode = 404
    throw error
  }

  return buildAndSaveBattleBook(
    {
      ...existing.input,
      ...overrides,
    },
    {
      id: existing.id,
      shareToken: existing.shareToken,
      createdAt: existing.createdAt,
    }
  )
}

async function listBattleBooks() {
  return listStoredBattleBooks()
}

async function getBattleBookById(id) {
  return getStoredBattleBookById(id)
}

async function deleteBattleBookById(id) {
  return deleteStoredBattleBookById(id)
}

async function getSharedBattleBook(token) {
  return getStoredBattleBookByShareToken(token)
}

module.exports = {
  deleteBattleBookById,
  generateBattleBook,
  getBattleBookById,
  getSharedBattleBook,
  listBattleBooks,
  listVenueRules,
  regenerateBattleBookById,
}
