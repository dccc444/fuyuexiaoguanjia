const OpenAI = require('openai')
const { config, isOpenAIConfigured } = require('./config')

let client = null

function getOpenAIClient() {
  if (!isOpenAIConfigured()) {
    const error = new Error('未配置 OPENAI_API_KEY，暂时无法使用真实 AI 生成。')
    error.statusCode = 503
    throw error
  }

  if (!client) {
    client = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiBaseUrl || undefined,
    })
  }

  return client
}

module.exports = {
  getOpenAIClient,
}
