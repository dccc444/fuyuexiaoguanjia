const SCENE_LABELS = {
  concert: '演唱会',
  festival: '音乐节',
  match: '球赛',
  sports: '球赛',
}

export function sceneLabelFromType(sceneType) {
  return SCENE_LABELS[sceneType] || '赴约'
}

export function hasBrokenText(value) {
  if (!value) return true
  return /[?？]{2,}|�/.test(String(value))
}

export function displayText(value, fallback) {
  return hasBrokenText(value) ? fallback : value
}

export function getTripMeta(trip) {
  const input = trip?.input || {}

  return {
    sceneLabel: sceneLabelFromType(input.sceneType),
    eventName: displayText(input.eventName, '这次赴约'),
    targetName: displayText(input.targetName, '这次最想见的人'),
    city: displayText(input.city, '待定城市'),
    venue: displayText(input.venue, '待定场馆'),
    ticketArea: displayText(input.ticketArea, '待补票档'),
    eventDate: displayText(input.eventDate, '待补日期'),
  }
}
