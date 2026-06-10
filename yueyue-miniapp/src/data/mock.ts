import type { BuddyPost, MineOverview, PlannerModule, SceneType, TripSummary, TrustItem } from '@/types/models'

export const trustItems: TrustItem[] = [
  { id: 'trust-1', title: '实名认证标识', note: '看人更清楚，见面更安心。' },
  { id: 'trust-2', title: '举报与反馈', note: '遇到不舒服的情况，能及时处理。' },
  { id: 'trust-3', title: '公开场所建议', note: '第一次见面，尽量约在人多的地方。' },
]

export const plannerModules: PlannerModule[] = [
  { id: 'basic', title: '基础信息', note: '活动、城市和场馆先定好。', status: 'ready' },
  { id: 'travel', title: '两段路线', note: '先跨城，再到场。', status: 'ready' },
  { id: 'ticket', title: '门票与位置', note: '分区、入口和散场都先看清。', status: 'ready' },
  { id: 'social', title: '会合物料', note: '会合点、物料和 solo 提醒。', status: 'pending' },
  { id: 'money', title: '预算记账', note: '预算和 AA 一起管。', status: 'pending' },
]

export const tripSummaries: TripSummary[] = [
  {
    id: 'trip-1',
    sceneType: 'concert',
    eventName: '周杰伦嘉年华巡回演唱会',
    targetName: '周杰伦',
    city: '上海',
    venue: '上海体育场',
    eventDate: '07-12',
    startTime: '19:00',
    ticketArea: '内场 A 区',
    progressText: '路线和票务已收好',
    budgetText: '预算 2200 元',
    routeSummary: '高铁到虹桥后转地铁，预计 18:00 到场。',
    meetupSummary: '和同区搭子在 4 号口会合，一起进场。',
  },
  {
    id: 'trip-2',
    sceneType: 'festival',
    eventName: '草莓音乐节双日通票',
    targetName: '回春丹主舞台',
    city: '广州',
    venue: '海心沙亚运公园',
    eventDate: '08-03',
    startTime: '15:30',
    ticketArea: '双日通票',
    progressText: '住宿和返程待确认',
    budgetText: '预算 1680 元',
    routeSummary: '住在珠江新城，散场后打车回酒店。',
    meetupSummary: '下午先逛市集，晚上在主舞台右侧集合。',
  },
  {
    id: 'trip-3',
    sceneType: 'match',
    eventName: '中超焦点战',
    targetName: '主队看台',
    city: '北京',
    venue: '工体',
    eventDate: '06-28',
    startTime: '19:35',
    ticketArea: '北看台',
    progressText: '当天模式已准备好',
    budgetText: '预算 680 元',
    routeSummary: '地铁直达，散场后步行到东四吃夜宵。',
    meetupSummary: '南广场碰头，赛后一起散场。',
  },
]

export const buddyPosts: BuddyPost[] = [
  {
    id: 'buddy-1',
    sceneType: 'concert',
    eventName: '周杰伦嘉年华巡回演唱会',
    city: '上海',
    venue: '上海体育场',
    eventDate: '07-12',
    intentType: '一起进场',
    content: '一个人去，想找同区女生一起进场，散场后可以一起等地铁。',
    tags: ['同区看台', '一起散场'],
    contactVisibility: 'after_join',
    nickname: '阿桃',
  },
  {
    id: 'buddy-2',
    sceneType: 'festival',
    eventName: '草莓音乐节双日通票',
    city: '广州',
    venue: '海心沙亚运公园',
    eventDate: '08-03',
    intentType: '拼房',
    content: '想找同样住珠江新城的姐妹一起拼房，顺便可以一起逛市集。',
    tags: ['拼房', '一起领物料'],
    contactVisibility: 'public',
    nickname: '小莓',
  },
  {
    id: 'buddy-3',
    sceneType: 'match',
    eventName: '中超焦点战',
    city: '北京',
    venue: '工体',
    eventDate: '06-28',
    intentType: '同区看台',
    content: '主队球迷，想找北看台一起喊歌的人，赛后可一起吃饭。',
    tags: ['同区看台', '一起散场'],
    contactVisibility: 'after_join',
    nickname: '北看台小赵',
  },
]

export const mineOverview: MineOverview = {
  tripCount: 6,
  cityCount: 4,
  shareCount: 3,
}

export const quickSceneCopy: Record<SceneType, { title: string; copy: string }> = {
  concert: {
    title: '把这次奔赴收好',
    copy: '同场搭子、路线、票务和预算，都能先看清。',
  },
  festival: {
    title: '把这场音乐节收好',
    copy: '会合、物料、住宿和返程，一路都先安排好。',
  },
  match: {
    title: '把这场球赛收好',
    copy: '同看台的人、进场节奏和散场返程，都能先收好。',
  },
  other: {
    title: '把这次见面收好',
    copy: '同行、路线和提醒，都能一起整理。',
  },
}
