const dotenv = require('dotenv')

dotenv.config()

const config = {
  port: Number(process.env.PORT || 4000),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
  databaseUrl: process.env.DATABASE_URL || '',
}

function isOpenAIConfigured() {
  return Boolean(config.openaiApiKey)
}

module.exports = {
  config,
  isOpenAIConfigured,
}
