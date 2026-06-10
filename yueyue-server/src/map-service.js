const { config, isAmapConfigured } = require('./config')

const AMAP_BASE_URL = 'https://restapi.amap.com'

// #region debug-point A:debug-reporter
function reportDebugEvent(hypothesisId, location, msg, data) {
  const fs = require('fs')
  let url = 'http://127.0.0.1:7777/event'
  let sessionId = 'amap-route-plan'

  try {
    const envContent = fs.readFileSync('.dbg/amap-route-plan.env', 'utf8')
    url = envContent.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || url
    sessionId = envContent.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || sessionId
  } catch {}

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      runId: process.env.DEBUG_RUN_ID || 'pre-fix',
      hypothesisId,
      location,
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {})
}
// #endregion

function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function mapAmapErrorMessage(info) {
  if (!info) {
    return '地图服务返回异常，请稍后再试。'
  }

  if (info === 'ENGINE_RESPONSE_DATA_ERROR') {
    return '高德 Key 当前未开通地理编码或路径规划能力，请在控制台勾选“地理编码 API”和“路径规划 API”后再试。'
  }

  return info
}

function ensureAmapConfigured() {
  if (!isAmapConfigured()) {
    throw createHttpError(503, '尚未配置高德地图服务，请先在 yueyue-server/.env 中设置 AMAP_WEB_KEY。')
  }
}

async function requestAmap(pathname, params) {
  ensureAmapConfigured()
  const searchParams = new URLSearchParams({
    key: config.amapWebKey,
    ...params,
  })
  // #region debug-point A:request-start
  reportDebugEvent('A', 'map-service.js:58', '即将请求高德接口', {
    pathname,
    params,
  })
  // #endregion

  const response = await fetch(`${AMAP_BASE_URL}${pathname}?${searchParams.toString()}`)
  // #region debug-point B:response-status
  reportDebugEvent('B', 'map-service.js:66', '高德接口返回状态', {
    pathname,
    status: response.status,
    ok: response.ok,
  })
  // #endregion

  if (!response.ok) {
    throw createHttpError(502, '地图服务暂时不可用，请稍后再试。')
  }

  const data = await response.json()
  // #region debug-point C:response-body
  reportDebugEvent('C', 'map-service.js:75', '高德接口响应摘要', {
    pathname,
    status: data.status,
    info: data.info,
    infocode: data.infocode,
    count: data.count,
    tipsCount: Array.isArray(data.tips) ? data.tips.length : undefined,
    geocodesCount: Array.isArray(data.geocodes) ? data.geocodes.length : undefined,
    hasRoute: Boolean(data.route),
  })
  // #endregion

  if (data.status !== '1') {
    // #region debug-point D:response-error
    reportDebugEvent('D', 'map-service.js:87', '高德接口返回业务错误', {
      pathname,
      info: data.info,
      infocode: data.infocode,
      params,
    })
    // #endregion
    throw createHttpError(502, mapAmapErrorMessage(data.info))
  }

  return data
}

function parseLocation(location) {
  if (!location || typeof location !== 'string' || !location.includes(',')) return null
  const [lng, lat] = location.split(',').map(Number)

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null
  }

  return { lng, lat }
}

function formatLocation(location) {
  return `${location.lng},${location.lat}`
}

function minutesFromSeconds(seconds) {
  const value = Number(seconds || 0)
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.max(1, Math.round(value / 60))
}

function kilometersFromMeters(meters) {
  const value = Number(meters || 0)
  if (!Number.isFinite(value) || value <= 0) return '约 0 公里'
  if (value < 1000) return `约 ${Math.round(value)} 米`
  return `约 ${(value / 1000).toFixed(value > 10000 ? 0 : 1)} 公里`
}

function toDateTime(eventDate, time) {
  if (!eventDate || !time) return null
  const dateTime = new Date(`${eventDate}T${time}:00`)
  if (Number.isNaN(dateTime.getTime())) return null
  return dateTime
}

function formatClock(date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function buildRiskFlags({ arrivalTargetTime, departureTime, durationMinutes, mode, now }) {
  const flags = []

  if (departureTime && now && departureTime < now) {
    flags.push('按这个节奏建议立刻出发，否则会压缩安检和找入口的缓冲时间。')
  }

  if (durationMinutes >= 120) {
    flags.push('通勤时间较长，建议多预留一段机动缓冲。')
  }

  if (mode === 'transit') {
    flags.push('高峰时段地铁和换乘节点可能拥挤，入场前别卡点。')
  }

  if (mode === 'drive') {
    flags.push('临近场馆时可能遇到堵车和停车排队，建议提前观察最后一段动线。')
  }

  if (mode === 'walk' && durationMinutes >= 20) {
    flags.push('步行时间较长，注意天气、体力和现场排队节奏。')
  }

  return flags
}

function getTimingInfo(context, durationMinutes) {
  if (!context.arrivalTargetTime) {
    return {
      departureTimeRecommended: '',
      arrivalTimeEstimated: '',
      departureTime: null,
    }
  }

  const departureTime = new Date(context.arrivalTargetTime.getTime() - durationMinutes * 60000)

  return {
    departureTimeRecommended: formatClock(departureTime),
    arrivalTimeEstimated: formatClock(context.arrivalTargetTime),
    departureTime,
  }
}

function createNavigationUrl({ origin, destination }) {
  const from = `${origin.location.lng},${origin.location.lat},${origin.name || '出发地'}`
  const to = `${destination.location.lng},${destination.location.lat},${destination.name || '目的地'}`
  return `https://uri.amap.com/navigation?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&src=yueyuexiaoguanjia&coordinate=gaode&callnative=1`
}

function uniqueList(items) {
  return Array.from(new Set(items.filter(Boolean)))
}

function createFallbackPoint(point, fallbackName) {
  const name = point?.name || point?.address || fallbackName || '未命名地点'
  return {
    name,
    formattedAddress: name,
    location: { lng: 0, lat: 0 },
  }
}

function buildOfflineRoute({ mode, sameCity, context }) {
  const presets = {
    transit: {
      label: '公共交通',
      title: '地铁 / 公交优先',
      durationMinutes: sameCity ? 55 : 95,
      distanceText: sameCity ? '约 14 公里' : '约 36 公里',
      stepsSummary: [
        '优先从地铁或公交进场，尽量避开场馆最后一公里的拥堵段。',
        '提前留出安检、找入口和现场人流缓冲时间。',
        '返程高峰可能需要排队换乘，建议提前看好末班车或替代线路。',
      ],
    },
    drive: {
      label: '打车 / 驾车',
      title: '打车或自驾',
      durationMinutes: sameCity ? 40 : 78,
      distanceText: sameCity ? '约 18 公里' : '约 42 公里',
      stepsSummary: [
        '最后一段接近场馆时可能明显变慢，别把到场时间卡得太紧。',
        '优先在离场馆步行 5 到 10 分钟的落客点下车，进退场更稳。',
        '散场打车通常更难，建议提前想好返程集合点。',
      ],
    },
    walk: {
      label: '步行',
      title: '步行到场',
      durationMinutes: sameCity ? 105 : 180,
      distanceText: sameCity ? '约 7 公里' : '约 12 公里',
      stepsSummary: [
        '步行方案更适合近距离接驳，注意天气、体力和现场排队节奏。',
        '如果中途还要领物料或会合，尽量把这些动作前置完成。',
      ],
    },
  }

  const preset = presets[mode]
  if (!preset) return null

  const timing = getTimingInfo(context, preset.durationMinutes)

  return {
    id: mode,
    mode,
    label: preset.label,
    title: preset.title,
    durationMinutes: preset.durationMinutes,
    distanceText: preset.distanceText,
    departureTimeRecommended: timing.departureTimeRecommended,
    arrivalTimeEstimated: timing.arrivalTimeEstimated,
    stepsSummary: preset.stepsSummary,
    riskFlags: uniqueList([
      '当前为离线估算路线，可先用来判断出发节奏；如接入地图服务后会给出更精确方案。',
      ...buildRiskFlags({
        arrivalTargetTime: context.arrivalTargetTime,
        departureTime: timing.departureTime,
        durationMinutes: preset.durationMinutes,
        mode,
        now: context.now,
      }),
    ]),
    navigationUrl: '',
  }
}

function buildOfflineRoutePlan({
  origin,
  destination,
  eventDate,
  startTime,
  arrivalBufferMinutes = 90,
  travelPreference = 'easy',
  transportModes = ['transit', 'drive'],
}) {
  const bufferMinutes = Number(arrivalBufferMinutes || 90)
  const eventDateTime = toDateTime(eventDate, startTime)
  const arrivalTargetTime = eventDateTime ? new Date(eventDateTime.getTime() - bufferMinutes * 60000) : null
  const context = {
    now: new Date(),
    arrivalTargetTime,
    navigationUrl: '',
  }
  const resolvedOrigin = createFallbackPoint(origin, '出发地')
  const resolvedDestination = createFallbackPoint(destination, '目的地')
  const sameCity =
    Boolean(origin?.city && destination?.city) && String(origin.city).trim() === String(destination.city).trim()
  const selectedModes = uniqueList(Array.isArray(transportModes) ? transportModes : ['transit', 'drive'])
  const routes = tagRoutes(
    selectedModes
      .map((mode) => buildOfflineRoute({ mode, sameCity, context }))
      .filter(Boolean),
  )
  const recommended = pickRecommendedRoute(routes, travelPreference)

  return {
    origin: resolvedOrigin,
    destination: resolvedDestination,
    recommended,
    alternatives: routes.filter((route) => route.id !== recommended?.id),
    meta: {
      destinationArrivalTarget: arrivalTargetTime ? formatClock(arrivalTargetTime) : '',
      eventDate,
      startTime,
      arrivalBufferMinutes: bufferMinutes,
      amapConfigured: false,
      source: 'offline-estimate',
    },
  }
}

function normalizeTransitRoute(response, context) {
  const transit = response?.route?.transits?.[0]
  if (!transit) return null

  const steps = []
  const lineNames = []

  for (const segment of transit.segments || []) {
    const walking = Number(segment.walking?.distance || 0)
    if (walking > 0) {
      steps.push(`步行 ${Math.max(1, Math.round(walking / 100)) / 10} 公里`)
    }

    for (const busline of segment.bus?.buslines || []) {
      const name = String(busline.name || '').split('(')[0].trim()
      if (name) {
        lineNames.push(name)
      }
    }

    const railwayName = segment.railway?.trip || segment.railway?.name
    if (railwayName) {
      lineNames.push(railwayName)
    }
  }

  if (lineNames.length) {
    steps.unshift(`优先乘坐 ${uniqueList(lineNames).slice(0, 3).join('、')}`)
  }

  const durationMinutes = minutesFromSeconds(transit.duration)
  const timing = getTimingInfo(context, durationMinutes)

  return {
    id: 'transit',
    mode: 'transit',
    label: '公共交通',
    title: '地铁 / 公交优先',
    durationMinutes,
    distanceText: kilometersFromMeters(transit.distance || response?.route?.distance),
    departureTimeRecommended: timing.departureTimeRecommended,
    arrivalTimeEstimated: timing.arrivalTimeEstimated,
    stepsSummary: uniqueList(steps).slice(0, 4),
    riskFlags: buildRiskFlags({
      arrivalTargetTime: context.arrivalTargetTime,
      departureTime: timing.departureTime,
      durationMinutes,
      mode: 'transit',
      now: context.now,
    }),
    navigationUrl: context.navigationUrl,
  }
}

function normalizeDrivingRoute(response, context) {
  const path = response?.route?.paths?.[0]
  if (!path) return null

  const durationMinutes = minutesFromSeconds(path.duration)
  const timing = getTimingInfo(context, durationMinutes)
  const steps = (path.steps || [])
    .map((step) => step.instruction)
    .filter(Boolean)
    .slice(0, 4)

  return {
    id: 'drive',
    mode: 'drive',
    label: '打车 / 驾车',
    title: '打车或自驾',
    durationMinutes,
    distanceText: kilometersFromMeters(path.distance || response?.route?.distance),
    departureTimeRecommended: timing.departureTimeRecommended,
    arrivalTimeEstimated: timing.arrivalTimeEstimated,
    stepsSummary: steps,
    riskFlags: buildRiskFlags({
      arrivalTargetTime: context.arrivalTargetTime,
      departureTime: timing.departureTime,
      durationMinutes,
      mode: 'drive',
      now: context.now,
    }),
    navigationUrl: context.navigationUrl,
  }
}

function normalizeWalkingRoute(response, context) {
  const path = response?.route?.paths?.[0]
  if (!path) return null

  const durationMinutes = minutesFromSeconds(path.duration)
  const timing = getTimingInfo(context, durationMinutes)
  const steps = (path.steps || [])
    .map((step) => step.instruction)
    .filter(Boolean)
    .slice(0, 4)

  return {
    id: 'walk',
    mode: 'walk',
    label: '步行',
    title: '步行到场',
    durationMinutes,
    distanceText: kilometersFromMeters(path.distance || response?.route?.distance),
    departureTimeRecommended: timing.departureTimeRecommended,
    arrivalTimeEstimated: timing.arrivalTimeEstimated,
    stepsSummary: steps,
    riskFlags: buildRiskFlags({
      arrivalTargetTime: context.arrivalTargetTime,
      departureTime: timing.departureTime,
      durationMinutes,
      mode: 'walk',
      now: context.now,
    }),
    navigationUrl: context.navigationUrl,
  }
}

function pickRecommendedRoute(routes, travelPreference) {
  if (!routes.length) return null

  if (travelPreference === 'fast') {
    return [...routes].sort((a, b) => a.durationMinutes - b.durationMinutes)[0]
  }

  if (travelPreference === 'cheap') {
    return routes.find((item) => item.mode === 'transit') || routes.find((item) => item.mode === 'walk') || routes[0]
  }

  return routes.find((item) => item.mode === 'transit') || routes[0]
}

function tagRoutes(routes) {
  if (!routes.length) return routes

  const fastestId = [...routes].sort((a, b) => a.durationMinutes - b.durationMinutes)[0]?.id
  const cheapestId = routes.find((item) => item.mode === 'transit')?.id || routes.find((item) => item.mode === 'walk')?.id
  const steadierId = routes.find((item) => item.mode === 'transit')?.id || routes[0]?.id

  return routes.map((route) => ({
    ...route,
    tags: uniqueList([
      route.id === steadierId ? '最稳' : '',
      route.id === fastestId ? '最快' : '',
      route.id === cheapestId ? '最省钱' : '',
    ]),
  }))
}

async function getPlaceSuggestions({ keyword, city }) {
  if (!keyword || !keyword.trim()) {
    return []
  }

  if (!isAmapConfigured()) {
    return []
  }

  const data = await requestAmap('/v3/assistant/inputtips', {
    keywords: keyword.trim(),
    city: city || '',
    datatype: 'all',
  })

  return (data.tips || [])
    .filter((item) => item.location)
    .slice(0, 8)
    .map((item) => ({
      name: item.name || '',
      address: item.address || '',
      district: item.district || '',
      location: parseLocation(item.location),
    }))
    .filter((item) => item.location)
}

async function geocodePlace({ keyword, city }) {
  if (!keyword || !keyword.trim()) {
    throw createHttpError(400, '地点关键词不能为空。')
  }

  if (!isAmapConfigured()) {
    return createFallbackPoint({ name: keyword.trim(), city }, keyword.trim())
  }

  let data = null

  try {
    data = await requestAmap('/v3/geocode/geo', {
      address: keyword.trim(),
      city: city || '',
    })
  } catch (error) {
    const fallbackItems = await getPlaceSuggestions({ keyword, city })
    const fallbackItem = fallbackItems[0]

    if (fallbackItem?.location) {
      // #region debug-point E:geocode-fallback
      reportDebugEvent('E', 'map-service.js:280', 'geocode 失败，回退到输入提示首条结果', {
        keyword,
        city,
        fallbackName: fallbackItem.name,
        fallbackDistrict: fallbackItem.district,
      })
      // #endregion
      return {
        name: fallbackItem.name || keyword.trim(),
        formattedAddress: [fallbackItem.district, fallbackItem.address].filter(Boolean).join(' ') || fallbackItem.name || keyword.trim(),
        location: fallbackItem.location,
      }
    }

    throw error
  }

  const geocode = data.geocodes?.[0]
  const location = parseLocation(geocode?.location)

  if (!geocode || !location) {
    const fallbackItems = await getPlaceSuggestions({ keyword, city })
    const fallbackItem = fallbackItems[0]

    if (fallbackItem?.location) {
      // #region debug-point E:geocode-empty-fallback
      reportDebugEvent('E', 'map-service.js:299', 'geocode 无结果，回退到输入提示首条结果', {
        keyword,
        city,
        fallbackName: fallbackItem.name,
        fallbackDistrict: fallbackItem.district,
      })
      // #endregion
      return {
        name: fallbackItem.name || keyword.trim(),
        formattedAddress: [fallbackItem.district, fallbackItem.address].filter(Boolean).join(' ') || fallbackItem.name || keyword.trim(),
        location: fallbackItem.location,
      }
    }

    throw createHttpError(404, '没有找到这个地点，请换个更具体的名称试试。')
  }

  return {
    name: geocode.formatted_address || keyword.trim(),
    formattedAddress: geocode.formatted_address || keyword.trim(),
    location,
  }
}

async function resolvePoint(point, fallbackCity) {
  if (point?.location?.lng && point?.location?.lat) {
    return {
      name: point.name || point.address || '未命名地点',
      formattedAddress: point.address || point.name || '未命名地点',
      location: point.location,
    }
  }

  return geocodePlace({
    keyword: point?.name || point?.address || '',
    city: point?.city || fallbackCity || '',
  })
}

async function getTransitRoute({ origin, destination, city, cityd }) {
  return requestAmap('/v3/direction/transit/integrated', {
    origin,
    destination,
    city: city || '',
    cityd: cityd || '',
    strategy: '0',
    nightflag: '1',
  })
}

async function getDrivingRoute({ origin, destination }) {
  return requestAmap('/v3/direction/driving', {
    origin,
    destination,
    strategy: '0',
    extensions: 'base',
  })
}

async function getWalkingRoute({ origin, destination }) {
  return requestAmap('/v3/direction/walking', {
    origin,
    destination,
  })
}

async function getRoutePlan({
  origin,
  destination,
  eventDate,
  startTime,
  arrivalBufferMinutes = 90,
  travelPreference = 'easy',
  transportModes = ['transit', 'drive'],
}) {
  const fallbackPayload = {
    origin,
    destination,
    eventDate,
    startTime,
    arrivalBufferMinutes,
    travelPreference,
    transportModes,
  }

  if (!isAmapConfigured()) {
    return buildOfflineRoutePlan(fallbackPayload)
  }

  try {
    const resolvedOrigin = await resolvePoint(origin, origin?.city)
    const resolvedDestination = await resolvePoint(destination, destination?.city)
    const eventDateTime = toDateTime(eventDate, startTime)
    const bufferMinutes = Number(arrivalBufferMinutes || 90)
    const arrivalTargetTime = eventDateTime ? new Date(eventDateTime.getTime() - bufferMinutes * 60000) : null
    const now = new Date()
    const navigationUrl = createNavigationUrl({ origin: resolvedOrigin, destination: resolvedDestination })
    const context = {
      now,
      arrivalTargetTime,
      navigationUrl,
    }

    const selectedModes = uniqueList(Array.isArray(transportModes) ? transportModes : ['transit', 'drive'])
    const originLocation = formatLocation(resolvedOrigin.location)
    const destinationLocation = formatLocation(resolvedDestination.location)

    const routePromises = []

    if (selectedModes.includes('transit')) {
      routePromises.push(
        getTransitRoute({
          origin: originLocation,
          destination: destinationLocation,
          city: origin?.city || destination?.city || '',
          cityd: destination?.city || origin?.city || '',
        }).then((data) => normalizeTransitRoute(data, context)),
      )
    }

    if (selectedModes.includes('drive')) {
      routePromises.push(
        getDrivingRoute({ origin: originLocation, destination: destinationLocation }).then((data) =>
          normalizeDrivingRoute(data, context),
        ),
      )
    }

    if (selectedModes.includes('walk')) {
      routePromises.push(
        getWalkingRoute({ origin: originLocation, destination: destinationLocation }).then((data) =>
          normalizeWalkingRoute(data, context),
        ),
      )
    }

    const resolvedRoutes = (await Promise.allSettled(routePromises))
      .filter((item) => item.status === 'fulfilled' && item.value)
      .map((item) => item.value)

    if (!resolvedRoutes.length) {
      return buildOfflineRoutePlan(fallbackPayload)
    }

    const routes = tagRoutes(resolvedRoutes)
    const recommended = pickRecommendedRoute(routes, travelPreference)
    const alternatives = routes.filter((route) => route.id !== recommended.id)

    return {
      origin: resolvedOrigin,
      destination: resolvedDestination,
      recommended,
      alternatives,
      meta: {
        destinationArrivalTarget: arrivalTargetTime ? formatClock(arrivalTargetTime) : '',
        eventDate,
        startTime,
        arrivalBufferMinutes: bufferMinutes,
        amapConfigured: isAmapConfigured(),
      },
    }
  } catch {
    return buildOfflineRoutePlan(fallbackPayload)
  }
}

module.exports = {
  getPlaceSuggestions,
  geocodePlace,
  getRoutePlan,
  isAmapConfigured,
}
