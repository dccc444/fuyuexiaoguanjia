const eventCatalog = [
  {
    id: 'concert-jay-shanghai-2026-08-15',
    sceneType: 'concert',
    eventName: '周杰伦嘉年华世界巡回演唱会 上海站',
    targetName: '周杰伦',
    city: '上海',
    venue: '上海体育场',
    eventDate: '2026-08-15',
    startTime: '19:30',
  },
  {
    id: 'concert-jay-guangzhou-2026-08-22',
    sceneType: 'concert',
    eventName: '周杰伦嘉年华世界巡回演唱会 广州站',
    targetName: '周杰伦',
    city: '广州',
    venue: '广东奥林匹克体育中心体育场',
    eventDate: '2026-08-22',
    startTime: '19:30',
  },
  {
    id: 'concert-jj-beijing-2026-09-12',
    sceneType: 'concert',
    eventName: '林俊杰 JJ20 世界巡回演唱会 北京站',
    targetName: '林俊杰',
    city: '北京',
    venue: '国家体育场',
    eventDate: '2026-09-12',
    startTime: '19:00',
  },
  {
    id: 'concert-mayday-hangzhou-2026-07-18',
    sceneType: 'concert',
    eventName: '五月天 [回到那一天] 巡回演唱会 杭州站',
    targetName: '五月天',
    city: '杭州',
    venue: '杭州奥体中心体育场',
    eventDate: '2026-07-18',
    startTime: '19:00',
  },
  {
    id: 'concert-eason-shenzhen-2026-10-17',
    sceneType: 'concert',
    eventName: '陈奕迅 FEAR and DREAMS 巡回演唱会 深圳站',
    targetName: '陈奕迅',
    city: '深圳',
    venue: '深圳大运中心体育场',
    eventDate: '2026-10-17',
    startTime: '19:30',
  },
  {
    id: 'concert-jacky-chengdu-2026-11-01',
    sceneType: 'concert',
    eventName: '张学友 60+ 巡回演唱会 成都站',
    targetName: '张学友',
    city: '成都',
    venue: '东安湖体育公园主体育场',
    eventDate: '2026-11-01',
    startTime: '19:30',
  },
  {
    id: 'festival-strawberry-shanghai-2026-05-03',
    sceneType: 'festival',
    eventName: '草莓音乐节 上海站',
    targetName: '草莓音乐节主舞台',
    city: '上海',
    venue: '上海国际音乐村',
    eventDate: '2026-05-03',
    startTime: '13:30',
  },
  {
    id: 'festival-midi-suzhou-2026-06-13',
    sceneType: 'festival',
    eventName: '迷笛音乐节 苏州站',
    targetName: '迷笛主舞台',
    city: '苏州',
    venue: '苏州阳澄湖半岛音乐营地',
    eventDate: '2026-06-13',
    startTime: '14:00',
  },
  {
    id: 'festival-bubble-beijing-2026-09-20',
    sceneType: 'festival',
    eventName: '泡泡岛音乐与艺术节 北京站',
    targetName: '主舞台',
    city: '北京',
    venue: '北京世园公园',
    eventDate: '2026-09-20',
    startTime: '14:30',
  },
  {
    id: 'match-guoan-port-2026-07-26',
    sceneType: 'match',
    eventName: '中超联赛 北京国安 vs 上海海港',
    targetName: '北京国安 vs 上海海港',
    city: '北京',
    venue: '工人体育场',
    eventDate: '2026-07-26',
    startTime: '19:35',
  },
  {
    id: 'match-shenhua-taishan-2026-08-09',
    sceneType: 'match',
    eventName: '中超联赛 上海申花 vs 山东泰山',
    targetName: '上海申花 vs 山东泰山',
    city: '上海',
    venue: '上海体育场',
    eventDate: '2026-08-09',
    startTime: '19:35',
  },
  {
    id: 'match-cba-beijing-guangdong-2026-12-05',
    sceneType: 'match',
    eventName: 'CBA常规赛 北京 vs 广东',
    targetName: '北京 vs 广东',
    city: '北京',
    venue: '首都体育馆',
    eventDate: '2026-12-05',
    startTime: '19:30',
  },
]

function normalizeKeyword(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .trim()
}

export function searchEventCatalog(keyword, sceneType) {
  const normalizedKeyword = normalizeKeyword(keyword)
  if (normalizedKeyword.length < 2) return []

  return eventCatalog
    .filter((item) => item.sceneType === sceneType)
    .map((item) => {
      const haystack = normalizeKeyword(
        [item.eventName, item.targetName, item.city, item.venue, item.eventDate].filter(Boolean).join(' '),
      )
      const isPrefixMatch = haystack.startsWith(normalizedKeyword)
      const includesKeyword = haystack.includes(normalizedKeyword)
      const exactName = normalizeKeyword(item.eventName) === normalizedKeyword
      return {
        ...item,
        score: exactName ? 3 : isPrefixMatch ? 2 : includesKeyword ? 1 : 0,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.eventDate.localeCompare(b.eventDate, 'zh-CN'))
    .slice(0, 6)
}
