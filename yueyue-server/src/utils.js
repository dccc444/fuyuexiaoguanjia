function sceneLabel(sceneType) {
  if (sceneType === 'festival') return '音乐节'
  if (sceneType === 'match') return '球赛'
  return '演唱会'
}

function normalizeVenueName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[路号號\-\s,，（）()_.·/]/g, '')
}

function isBrokenText(value) {
  if (value === null || value === undefined) {
    return false
  }

  const text = String(value).trim()
  if (!text) {
    return false
  }

  return /[?？]{2,}/.test(text) || text.includes('�')
}

function readableValue(value, fallback) {
  const text = String(value || '').trim()
  return !text || isBrokenText(text) ? fallback : text
}

function sceneDefaults(sceneType) {
  if (sceneType === 'festival') {
    return {
      eventName: '这次音乐节赴约',
      targetName: '这次最想看的舞台',
      supportGoal: '先把最想看的舞台和返程顺好',
      outfitFocus: '轻便、耐走、好拍照',
      foodPlan: '进场前补给和现场补水',
      stayPlan: '看是否需要住一晚，优先地铁方便',
      merchPlan: '先想清楚物料和周边优先级',
      meetupPlan: '先约好会合点和散场碰头点',
    }
  }

  if (sceneType === 'match') {
    return {
      eventName: '这次球赛赴约',
      targetName: '这场最想看的主队 / 球员',
      supportGoal: '先把看台、进场和散场路线顺好',
      outfitFocus: '轻便、方便上下看台、适合久坐久站',
      foodPlan: '赛前补给和赛后返程前垫一口',
      stayPlan: '看是否需要住一晚，优先返程顺手',
      merchPlan: '把应援物和周边安排在不赶时间的时候',
      meetupPlan: '先约好看台前后的会合点',
    }
  }

  return {
    eventName: '这次演唱会赴约',
    targetName: '这次最想见的人',
    supportGoal: '先把应援、进场和返程顺好',
    outfitFocus: '好看、舒服、方便排队和返程',
    foodPlan: '进场前吃好一点，现场注意补水',
    stayPlan: '看是否需要住一晚，优先地铁和散场顺手',
    merchPlan: '先分清物料、周边和进场优先级',
    meetupPlan: '先约好会合点和散场后的碰头点',
  }
}

function sanitizeBattleBookInput(input) {
  const defaults = sceneDefaults(input.sceneType)

  return {
    ...input,
    eventName: readableValue(input.eventName, defaults.eventName),
    targetName: readableValue(input.targetName, defaults.targetName),
    city: readableValue(input.city, '待定城市'),
    venue: readableValue(input.venue, '待定场馆'),
    eventDate: readableValue(input.eventDate, new Date().toISOString().slice(0, 10)),
    startTime: readableValue(input.startTime, '19:30'),
    departureCity: readableValue(input.departureCity, ''),
    ticketArea: readableValue(input.ticketArea, ''),
    supportGoal: readableValue(input.supportGoal, defaults.supportGoal),
    outfitFocus: readableValue(input.outfitFocus, defaults.outfitFocus),
    foodPlan: readableValue(input.foodPlan, defaults.foodPlan),
    stayPlan: readableValue(input.stayPlan, defaults.stayPlan),
    merchPlan: readableValue(input.merchPlan, defaults.merchPlan),
    meetupPlan: readableValue(input.meetupPlan, defaults.meetupPlan),
    notes: isBrokenText(input.notes) ? '' : String(input.notes || '').trim(),
    sceneLabel: sceneLabel(input.sceneType),
  }
}

module.exports = {
  isBrokenText,
  normalizeVenueName,
  readableValue,
  sanitizeBattleBookInput,
  sceneDefaults,
  sceneLabel,
}
