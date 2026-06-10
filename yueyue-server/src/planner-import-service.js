const Tesseract = require('tesseract.js')
const { config, isOpenAIConfigured } = require('./config')
const { getOpenAIClient } = require('./openai-client')

const CITY_NAMES = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '南京',
  '苏州',
  '成都',
  '重庆',
  '武汉',
  '西安',
  '长沙',
  '郑州',
  '天津',
  '青岛',
  '厦门',
  '福州',
  '宁波',
  '合肥',
  '无锡',
  '沈阳',
  '大连',
  '长春',
  '哈尔滨',
  '济南',
  '南昌',
  '昆明',
  '贵阳',
  '南宁',
  '海口',
  '石家庄',
  '太原',
  '兰州',
  '乌鲁木齐',
]

const EVENT_HINT_REGEX =
  /(演唱会|音乐节|巡演|live|演出|专场|见面会|球赛|联赛|德比|主场|vs|v\.s\.|公开赛|总决赛|半决赛)/i

const VENUE_SUFFIX_REGEX =
  /(体育场|体育馆|中心|场馆|Arena|ARENA|arena|Stadium|stadium|Hall|hall|Livehouse|LIVEHOUSE|livehouse|剧院|馆|球场|公园|广场)$/

function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\r/g, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function stripHtml(html) {
  return normalizeWhitespace(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, '\n'),
  )
}

function splitLines(text) {
  return normalizeWhitespace(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)))
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

function normalizeDate(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

function normalizeTime(hours, minutes = '00') {
  return `${pad2(hours)}:${pad2(minutes)}`
}

function inferYear(month, day) {
  const now = new Date()
  const year = now.getFullYear()
  const candidate = new Date(`${year}-${pad2(month)}-${pad2(day)}T00:00:00`)
  if (Number.isNaN(candidate.getTime())) return year
  if (candidate.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 120) {
    return year + 1
  }
  return year
}

function parseDateTime(text) {
  const normalized = normalizeWhitespace(text)
  let eventDate = ''
  let startTime = ''

  const fullDateMatch = normalized.match(/(20\d{2})[年./-]\s?(\d{1,2})[月./-]\s?(\d{1,2})日?/)
  if (fullDateMatch) {
    eventDate = normalizeDate(fullDateMatch[1], fullDateMatch[2], fullDateMatch[3])
  } else {
    const shortDateMatch = normalized.match(/(\d{1,2})月(\d{1,2})日/)
    if (shortDateMatch) {
      const year = inferYear(shortDateMatch[1], shortDateMatch[2])
      eventDate = normalizeDate(year, shortDateMatch[1], shortDateMatch[2])
    }
  }

  const clockMatch = normalized.match(/([01]?\d|2[0-3])[:：]([0-5]\d)/)
  if (clockMatch) {
    startTime = normalizeTime(clockMatch[1], clockMatch[2])
  } else {
    const cnTimeMatch = normalized.match(/([01]?\d|2[0-3])点(?:([0-5]?\d)分?)?/)
    if (cnTimeMatch) {
      startTime = normalizeTime(cnTimeMatch[1], cnTimeMatch[2] || '00')
    }
  }

  return { eventDate, startTime }
}

function extractByLabels(text, labels) {
  for (const label of labels) {
    const regex = new RegExp(`${label}\\s*[：: ]\\s*([^\\n]{2,80})`, 'i')
    const match = normalizeWhitespace(text).match(regex)
    if (match?.[1]) {
      return match[1].trim()
    }
  }

  return ''
}

function inferSceneType(text) {
  const normalized = normalizeWhitespace(text)
  if (/(音乐节|festival|草莓|迷笛)/i.test(normalized)) return 'festival'
  if (/(球赛|联赛|德比|主场|客场|vs|v\.s\.|公开赛|总决赛|半决赛|NBA|CBA|中超|英超)/i.test(normalized)) {
    return 'match'
  }
  return 'concert'
}

function findEventName(text, lines) {
  const labeled = extractByLabels(text, ['活动名称', '演出名称', '项目名称', '赛事名称'])
  if (labeled) return labeled

  const titleLine = lines.find((line) => EVENT_HINT_REGEX.test(line) && line.length >= 4 && line.length <= 80)
  if (titleLine) return titleLine

  return lines.find((line) => line.length >= 6 && line.length <= 40) || ''
}

function findVenue(text, lines) {
  const labeled = extractByLabels(text, ['场馆', '演出场馆', '活动场馆', '地点', '会场'])
  if (labeled) return labeled

  const directMatch = lines.find((line) => VENUE_SUFFIX_REGEX.test(line))
  if (directMatch) return directMatch

  const embeddedMatch = normalizeWhitespace(text).match(/([^\n]{2,40}(?:体育场|体育馆|中心|剧院|球场|Arena|Stadium|Hall))/i)
  return embeddedMatch?.[1]?.trim() || ''
}

function inferCity(text, venue) {
  const labeled = extractByLabels(text, ['城市', '活动城市', '演出城市'])
  if (labeled) return labeled

  const source = `${text}\n${venue}`
  return CITY_NAMES.find((city) => source.includes(city)) || ''
}

function findTicketArea(text, lines) {
  const labeled = extractByLabels(text, ['票档', '票价', '看台', '区域', '座位', '座席', '票区'])
  if (labeled) return labeled

  const inlineMatch =
    normalizeWhitespace(text).match(/((?:内场|看台|东看台|西看台|南看台|北看台)[^\n，。]{0,16}|VIP|SVIP|普通票|预售票|看台\d+区)/i)
  if (inlineMatch?.[1]) return inlineMatch[1].trim()

  return lines.find((line) => /(内场|看台|VIP|SVIP|普通票|预售票)/i.test(line) && line.length <= 30) || ''
}

function inferHasTicket(text) {
  return /(订单编号|票夹|电子票|购票成功|支付成功|已支付|观演人|取票码|下单成功|订单详情)/i.test(
    normalizeWhitespace(text),
  )
}

function guessTargetName(eventName, sceneType) {
  const text = String(eventName || '').trim()
  if (!text) return ''

  if (sceneType === 'match') {
    return text
  }

  const match = text.match(/^(.+?)(?:演唱会|巡演|音乐节|LIVE|专场|见面会|音乐会)/i)
  if (match?.[1]) {
    return match[1].replace(/20\d{2}.*/, '').trim()
  }

  return text
}

function buildDraftPatch(parsed) {
  const patch = {}

  if (parsed.sceneType) patch.sceneType = parsed.sceneType
  if (parsed.eventName) patch.eventName = parsed.eventName
  if (parsed.targetName) patch.targetName = parsed.targetName
  if (parsed.city) patch.city = parsed.city
  if (parsed.venue) patch.venue = parsed.venue
  if (parsed.eventDate) patch.eventDate = parsed.eventDate
  if (parsed.startTime) patch.startTime = parsed.startTime
  if (parsed.ticketArea) patch.ticketArea = parsed.ticketArea
  if (parsed.hasTicket) patch.hasTicket = true

  const destinationInput = [parsed.city, parsed.venue].filter(Boolean).join(' ')
  if (destinationInput) {
    patch.destinationInput = destinationInput
    patch.destinationLocation = null
  }

  return patch
}

function parseStructuredActivity(rawText, sourceLabel) {
  const text = normalizeWhitespace(rawText)
  const lines = splitLines(text)
  const sceneType = inferSceneType(text)
  const eventName = findEventName(text, lines)
  const venue = findVenue(text, lines)
  const city = inferCity(text, venue)
  const { eventDate, startTime } = parseDateTime(text)
  const ticketArea = findTicketArea(text, lines)
  const hasTicket = inferHasTicket(text)
  const targetName = guessTargetName(eventName, sceneType)

  const patch = buildDraftPatch({
    sceneType,
    eventName,
    targetName,
    city,
    venue,
    eventDate,
    startTime,
    ticketArea,
    hasTicket,
  })

  if (!Object.keys(patch).length || (!patch.eventName && !patch.venue && !patch.eventDate)) {
    throw createHttpError(422, `${sourceLabel}里暂时没有识别出足够的活动信息，请补充更完整的订单内容。`)
  }

  return {
    draftPatch: patch,
    fields: {
      eventName: eventName || '',
      targetName: targetName || '',
      city: city || '',
      venue: venue || '',
      eventDate: eventDate || '',
      startTime: startTime || '',
      ticketArea: ticketArea || '',
      hasTicket,
      sceneType,
    },
    sourceSummary: sourceLabel,
    extractedTextPreview: lines.slice(0, 8).join(' / '),
  }
}

async function fetchLinkText(url) {
  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    throw createHttpError(400, '活动链接格式不正确，请粘贴完整的网页地址。')
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw createHttpError(400, '目前只支持 http 或 https 链接。')
  }

  const response = await fetch(parsedUrl.toString(), {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0 Safari/537.36',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    throw createHttpError(502, '活动链接暂时打不开，请换一个公开可访问的活动页链接。')
  }

  const html = await response.text()
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    ''
  const bodyText = stripHtml(html).slice(0, 20000)

  return normalizeWhitespace([title, description, bodyText].filter(Boolean).join('\n'))
}

function parseDataUrlImage(imageDataUrl) {
  const match = String(imageDataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) {
    throw createHttpError(400, '截图内容不合法，请重新上传图片。')
  }

  return Buffer.from(match[2], 'base64')
}

async function extractTextWithOpenAI(imageDataUrl) {
  if (!isOpenAIConfigured()) {
    throw createHttpError(503, '当前环境没有配置图像识别能力。')
  }

  const client = getOpenAIClient()
  const response = await client.responses.create({
    model: config.openaiModel,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: '请只提取这张购票订单截图里的文字内容，输出纯文本，不要解释。',
          },
          {
            type: 'input_image',
            image_url: imageDataUrl,
          },
        ],
      },
    ],
  })

  return normalizeWhitespace(response.output_text || '')
}

async function extractTextFromImage(imageDataUrl) {
  const imageBuffer = parseDataUrlImage(imageDataUrl)

  try {
    const result = await Tesseract.recognize(imageBuffer, 'chi_sim+eng', {
      logger: () => {},
    })
    const text = normalizeWhitespace(result?.data?.text || '')
    if (text.length >= 12) {
      return text
    }
  } catch {}

  return extractTextWithOpenAI(imageDataUrl)
}

async function importFromText(text) {
  if (!String(text || '').trim()) {
    throw createHttpError(400, '请先粘贴订单短信或订单文本。')
  }

  return parseStructuredActivity(text, '订单文本')
}

async function importFromLink(url) {
  if (!String(url || '').trim()) {
    throw createHttpError(400, '请先粘贴活动链接。')
  }

  const text = await fetchLinkText(url)
  const result = parseStructuredActivity(text, '活动链接')
  return {
    ...result,
    sourceUrl: url,
  }
}

async function importFromScreenshot(imageDataUrl, fileName = '') {
  if (!String(imageDataUrl || '').trim()) {
    throw createHttpError(400, '请先上传订单截图。')
  }

  const text = await extractTextFromImage(imageDataUrl)
  const result = parseStructuredActivity(text, fileName ? `订单截图 · ${fileName}` : '订单截图')
  return {
    ...result,
    extractedTextPreview: text.slice(0, 240),
  }
}

async function importPlannerActivity(payload) {
  const type = payload?.type

  if (type === 'text') {
    return importFromText(payload.text)
  }

  if (type === 'link') {
    return importFromLink(payload.url)
  }

  if (type === 'image') {
    return importFromScreenshot(payload.imageDataUrl, payload.fileName)
  }

  throw createHttpError(400, '暂不支持这种导入方式。')
}

module.exports = {
  importPlannerActivity,
}
