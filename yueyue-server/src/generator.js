const { buildVenueRulesPromptBlock } = require('./venue-rules-prompt')
const { sceneLabel } = require('./utils')

const phaseLabels = {
  before_departure: '出发前',
  before_arrival: '到场前',
  before_entry: '入场前',
  on_site: '现场中',
  after_event: '散场后',
}

function buildBattleBookPrompt(input, venueRule) {
  const scene = sceneLabel(input.sceneType)
  const preferenceLabel =
    input.travelPreference === 'cheap' ? '省钱' : input.travelPreference === 'fast' ? '快一点' : '省心'

  const budgetLabel =
    input.budgetRange === 'low' ? '省一点' : input.budgetRange === 'high' ? '舒服一点' : '平衡一点'

  return [
    '你是一站式赴约小管家的资深赴约规划顾问，也是懂演唱会、音乐节和球赛现场节奏的追现场助手。',
    '你的任务不是写泛泛攻略，而是围绕某一场具体活动，生成一份真正可执行、很贴现场的中文赴约手册。',
    '语气要像可靠、贴心、很懂现场的朋友，既考虑场馆规则和返程风险，也照顾应援、出片、物料、搭子和现场氛围。',
    '如果输入信息不足，可以做保守假设，但不要编造具体车次、票价或场馆未提供的硬事实。',
    '建议必须具体、能执行，像真的在替用户操心这次赴约。',
    '',
    '用户活动信息：',
    `- 活动类型：${scene}`,
    `- 活动名称：${input.eventName}`,
    `- 这次去见谁 / 看谁：${input.targetName || '未提供'}`,
    `- 活动城市：${input.city}`,
    `- 活动场馆：${input.venue}`,
    `- 活动日期：${input.eventDate}`,
    `- 开始时间：${input.startTime || '未提供'}`,
    `- 出发地：${input.departureCity || '未提供'}`,
    `- 同行人数：${input.companions || 1}`,
    `- 预算倾向：${budgetLabel}`,
    `- 票档 / 座位区：${input.ticketArea || '未提供'}`,
    `- 出行偏好：${preferenceLabel}`,
    `- 这次最想完成什么：${input.supportGoal || '未提供'}`,
    `- 穿搭 / 妆造关注点：${input.outfitFocus || '未提供'}`,
    `- 吃喝 / 补给计划：${input.foodPlan || '未提供'}`,
    `- 住宿 / 落脚计划：${input.stayPlan || '未提供'}`,
    `- 物料 / 周边计划：${input.merchPlan || '未提供'}`,
    `- 搭子 / 会合计划：${input.meetupPlan || '未提供'}`,
    `- 是否已购票：${input.hasTicket ? '是' : '否'}`,
    `- 是否跨城：${input.isCrossCity ? '是' : '否'}`,
    `- 是否第一次参加：${input.isFirstTime ? '是' : '否'}`,
    `- 特殊备注：${input.notes || '无'}`,
    '',
    '输出要求：',
    '1. 评分（successScore）要体现整体赴约把控度（0-100），不要虚高。请提供1-2条提分建议（improvementTips）。',
    '2. 风险提醒按重要性排序，优先覆盖入场、返程、票务、补给、天气、座位、应援物和会合等问题。',
    '3. 时间线必须覆盖出发前、到场前、入场前、现场中、散场后五个阶段。',
    '4. 清单必须分为必带、建议带、不建议带，每项内容需具体简短（如：身份证、纸质门票、充电宝、纸巾等），适合作为打卡勾选的 Checklist。',
    '5. 到场建议、散场建议、新手提醒都要简明但具体，尽量贴合现场。',
    '6. “穿搭和妆造提醒”模块要考虑天气、出片、行动便利性和排队 / 返程场景。',
    '7. “吃喝和补给”模块要考虑进场前补给、现场补水、散场后吃东西和会合用餐场景。',
    '8. “住哪里更顺手”模块要考虑场馆距离、地铁、散场后的到达压力和拼房 / 当天往返的取舍。',
    '9. “物料和会合提醒”模块要考虑领物料、朋友会合、一个人去、搭子安排等真实问题。',
    '10. “票档和看台提醒”模块要根据票档 / 看台 / 内场差异给出更具体的入场和散场提示。',
    '11. “散场返程提醒”模块要给出返程风险等级、普通返程建议和赶车时的优先行动。',
    '12. 如果用户提供了出片、应援、物料、搭子、跨城赶车等偏好，请把这些偏好体现在风险、时间线和建议里。',
    '13. 【场景深度定制】如果活动是“演唱会/音乐节”：请在风险和建议中特别强调“应援物合规性（如灯牌、荧光棒是否允许带入）”、“防盗防丢（人多拥挤）”以及“出片与物料领取”；如果活动是“球赛”：请在风险和建议中特别强调“主客队球迷分区防冲突”、“不要穿错主客队球衣”、“赛后退场动线”等针对性提醒。',
    '14. “票务建议”（ticketAdvice）模块要根据是否已购票输出相应的购票提示（如防黄牛、开票抢票建议等）或验票进场提示。',
    '15. 所有输出保持中文，语气像可靠的现场搭子，不要写空话。',
    buildVenueRulesPromptBlock(venueRule),
  ].join('\n')
}

function buildBattleBookSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      successScore: {
        type: 'object',
        additionalProperties: false,
        properties: {
          value: { type: 'integer', minimum: 0, maximum: 100 },
          level: { type: 'string', enum: ['low', 'medium', 'high'] },
          summary: { type: 'string' },
          improvementTips: {
            type: 'array',
            minItems: 1,
            maxItems: 2,
            items: { type: 'string' },
          },
        },
        required: ['value', 'level', 'summary', 'improvementTips'],
      },
      risks: {
        type: 'array',
        minItems: 3,
        maxItems: 5,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string' },
            level: { type: 'string', enum: ['high', 'medium', 'low'] },
            reason: { type: 'string' },
            advice: { type: 'string' },
            source: { type: 'string' },
          },
          required: ['title', 'level', 'reason', 'advice', 'source'],
        },
      },
      timeline: {
        type: 'array',
        minItems: 5,
        maxItems: 5,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            phase: {
              type: 'string',
              enum: ['before_departure', 'before_arrival', 'before_entry', 'on_site', 'after_event'],
            },
            timeLabel: { type: 'string' },
            action: { type: 'string' },
            note: { type: 'string' },
          },
          required: ['phase', 'timeLabel', 'action', 'note'],
        },
      },
      checklist: {
        type: 'object',
        additionalProperties: false,
        properties: {
          mustBring: {
            type: 'array',
            minItems: 3,
            maxItems: 8,
            items: { type: 'string' },
          },
          recommended: {
            type: 'array',
            minItems: 2,
            maxItems: 8,
            items: { type: 'string' },
          },
          avoidBring: {
            type: 'array',
            minItems: 1,
            maxItems: 6,
            items: { type: 'string' },
          },
        },
        required: ['mustBring', 'recommended', 'avoidBring'],
      },
      styleAdvice: {
        type: 'object',
        additionalProperties: false,
        properties: {
          outfit: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          beauty: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          weather: {
            type: 'array',
            minItems: 1,
            maxItems: 3,
            items: { type: 'string' },
          },
        },
        required: ['outfit', 'beauty', 'weather'],
      },
      foodAdvice: {
        type: 'object',
        additionalProperties: false,
        properties: {
          beforeEntry: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          onSite: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          afterShow: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
        required: ['beforeEntry', 'onSite', 'afterShow'],
      },
      stayAdvice: {
        type: 'object',
        additionalProperties: false,
        properties: {
          stayDecision: { type: 'string' },
          locationTips: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          fallbackTips: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
        required: ['stayDecision', 'locationTips', 'fallbackTips'],
      },
      socialAdvice: {
        type: 'object',
        additionalProperties: false,
        properties: {
          meetup: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          merch: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          solo: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
        required: ['meetup', 'merch', 'solo'],
      },
      ticketAdvice: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string' },
          tips: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
        required: ['status', 'tips'],
      },
      seatAdvice: {
        type: 'object',
        additionalProperties: false,
        properties: {
          zoneSummary: { type: 'string' },
          entryTips: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          exitTips: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
        required: ['zoneSummary', 'entryTips', 'exitTips'],
      },
      returnAdvice: {
        type: 'object',
        additionalProperties: false,
        properties: {
          riskLevel: { type: 'string', enum: ['high', 'medium', 'low'] },
          tips: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          urgentPlan: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
        required: ['riskLevel', 'tips', 'urgentPlan'],
      },
      suggestions: {
        type: 'object',
        additionalProperties: false,
        properties: {
          arrival: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          departure: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          newbie: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
        required: ['arrival', 'departure', 'newbie'],
      },
    },
    required: [
      'successScore',
      'risks',
      'timeline',
      'checklist',
      'styleAdvice',
      'foodAdvice',
      'stayAdvice',
      'socialAdvice',
      'ticketAdvice',
      'seatAdvice',
      'returnAdvice',
      'suggestions',
    ],
  }
}

function fallbackStyleAdvice(input) {
  const isMatch = input.sceneType === 'match'
  const target = input.targetName || (isMatch ? '这场球赛' : '这场现场')

  return {
    outfit: [
      input.outfitFocus || '优先穿方便久站、走路和排队的衣服，别让好看变成负担。',
      isMatch
        ? '看台场景更适合轻便、方便上下台阶和拿东西的穿搭，鞋子一定以稳和耐走为先。'
        : `如果想为 ${target} 好好出片，重点放在上半身层次、发型和配饰，别把全部压力放在难走的鞋上。`,
    ],
    beauty: [
      '补妆和整理发型尽量安排在入场前，不要把节奏压到最后十分钟。',
      input.supportGoal
        ? `你这次最在意的是“${input.supportGoal}”，妆造最好围绕这个目标服务，不必为了拍照感牺牲舒服度。`
        : '妆造尽量别影响戴口罩、喝水、补防晒和散场返程，能稳住一整晚比开场最惊艳更重要。',
    ],
    weather: [
      input.isCrossCity
        ? '跨城赴约建议多带一层轻便外搭，车站、商场、场馆和夜间返程温差经常会让人后悔穿少了。'
        : '根据当天温度和场馆排队情况，提前准备好外套、降温用品或防雨装备，别到现场才临时补救。',
    ],
  }
}

function fallbackFoodAdvice(input) {
  const sceneFood = input.foodPlan || (input.sceneType === 'festival' ? '想补水补给' : '散场想吃点东西')

  return {
    beforeEntry: [
      sceneFood,
      input.sceneType === 'festival'
        ? '音乐节更怕体力和补水断掉，进场前先把水、轻食和防晒节奏想好。'
        : '演唱会进场前别吃得太赶太重，选方便补能量、又不会拖慢进场的东西更稳。',
    ],
    onSite: [
      '现场补给优先考虑水、纸巾、糖和轻便能量来源，别把吃东西安排成额外负担。',
      input.sceneType === 'festival'
        ? '如果要跑多个舞台，吃喝最好拆成小段补给，不要等到明显没力气了才去找吃的。'
        : '如果场馆里买吃喝要排队，宁可少买一点，也别压到开场前最后几分钟再冲。',
    ],
    afterShow: [
      input.isCrossCity
        ? '跨城返程优先看赶车时间，夜宵要服从返程，不要为了吃东西把节奏拖乱。'
        : '散场后如果想吃点东西，优先选离返程路线顺手、能快速坐下休息的地方。',
      input.meetupPlan
        ? '如果散场后还要和朋友会合，吃饭地点尽量定在大家都好找、也方便撤退的地方。'
        : '散场后别临时边走边找店，提前想一个顺路备选点会省很多心力。',
    ],
  }
}

function fallbackStayAdvice(input) {
  const stayDecision =
    input.stayPlan ||
    (input.isCrossCity ? '这次更适合提前想清楚是住一晚，还是当天直接返程。' : '这次大概率可以当天往返，重点是把返程路线走顺。')

  return {
    stayDecision,
    locationTips: [
      input.isCrossCity
        ? '如果要住，优先考虑地铁方便、散场后不需要二次折腾的区域，不一定非要贴着场馆。'
        : '如果只是当天往返，也先看好散场后最顺的地铁口、打车点和接人位置。',
      input.sceneType === 'festival'
        ? '音乐节更需要考虑洗漱、休息和第二天体力恢复，住得能快速回去比拍照好看更重要。'
        : '演唱会更要考虑散场后的人流高峰，住得离地铁和主干道顺手会明显省心。',
    ],
    fallbackTips: [
      '如果还没定住哪里，先把“场馆周边”“地铁直达”“返程站点附近”这三类分开看，会比直搜快很多。',
      input.meetupPlan
        ? '如果要和朋友拼房或会合，先定好谁跟谁走、散场后在哪碰，再定住哪，不然最容易临时乱。'
        : '当天如果发现返程压力比预期大，优先保交通顺畅，别临时为了省一点住宿钱把自己拖得太累。',
    ],
  }
}

function fallbackSocialAdvice(input) {
  return {
    meetup: [
      input.meetupPlan || '如果要和朋友会合，尽量把会合点定在地铁口、场馆雕塑或固定服务台这种明显地标，不要临时来回找。',
      '如果场馆入口多，先确认各自走哪个入口，再约会合，比大家到了现场再边打电话边找人省心得多。',
    ],
    merch: [
      input.merchPlan || '如果要领物料、换小卡或买周边，记得给排队和回到入口预留缓冲时间，别跟入场挤在一起。',
      '大件物料、应援物和周边袋不要压到临进场前最后十分钟再处理，不然最容易乱。',
    ],
    solo: [
      input.companions > 1
        ? '就算和朋友一起去，也尽量提前约好走散之后在哪集合、谁负责看票和导航，别默认现场一定能同步。'
        : '一个人去也不用慌，先把入口、洗手间、补给点和返程路线想好，现场会轻松很多。',
      input.isFirstTime
        ? '第一次去这种现场，宁可早一点到，也别把时间压得太紧，心态会完全不一样。'
        : '就算不是第一次去，热门场馆和热门场次也值得给自己多留一点缓冲。',
    ],
  }
}

function fallbackSeatAdvice(input) {
  const zone = input.ticketArea || (input.sceneType === 'match' ? '看台区' : '普通观演区')
  const isMatch = input.sceneType === 'match'

  return {
    zoneSummary: `你这次重点关注的区域是“${zone}”，进场和散场节奏最好都按这个区域的人流强度来安排。`,
    entryTips: [
      '先确认自己的入口、分区和楼层，不要排错队再折返，这种小失误最消耗入场前的好心情。',
      input.ticketArea
        ? `票档 / 区域写的是“${input.ticketArea}”，到场后先对照场馆分区图再走，会比跟着人流直走更稳。`
        : '如果票档信息还不明确，至少在开场前把电子票、分区图和入口截图先保存好。',
    ],
    exitTips: [
      input.notes
        ? `你备注里提到“${input.notes}”，所以散场后不要恋战，优先执行返程计划。`
        : '散场高峰的人流通常比进场更集中，别在出场口临时决定往哪走。',
      isMatch
        ? '球赛散场时看台区退场节奏常常很密集，先想好是快走出场还是错峰停留几分钟。'
        : '内场或热门区域散场更容易拥挤，拍照和返程最好提前分清主次。',
    ],
  }
}

function fallbackTicketAdvice(input) {
  return {
    status: input.hasTicket ? '已购票' : '未购票',
    tips: input.hasTicket
      ? [
          '请提前截图保存好电子票二维码或准备好纸质票。',
          '带好身份证，现场多数情况需要刷身份证入场。',
          '入场前不要在社交媒体上发布未打码的票务信息，防止被盗用。'
        ]
      : [
          '请关注官方售票平台的开票时间，提前设置闹钟。',
          '不要轻信非官方渠道的“内部票”、“黄牛票”，警惕诈骗。',
          '抢票时提前填好观演人信息和收货地址，保持网络畅通。'
        ],
  }
}

function fallbackReturnAdvice(input) {
  const urgent = /高铁|火车|飞机|返程|赶车/.test(input.notes || '')

  return {
    riskLevel: urgent || input.isCrossCity ? 'high' : 'medium',
    tips: [
      '散场前就把返程路线、上车点和备用方案再看一遍，不要等出场后再临时查。',
      input.isCrossCity
        ? '跨城返程优先保时间，不要把拍照、吃夜宵和赶车挤在同一段时间里。'
        : '同城返程也建议提前想好地铁、打车和步行哪一个更稳，不要完全看现场运气。',
    ],
    urgentPlan: [
      urgent
        ? `你这次备注里已经提到“${input.notes}”，散场后第一优先级就是尽快离开场馆核心人流区。`
        : '如果临时发现返程变紧张，优先放弃不必要停留，先把自己送上返程路线。',
      '提前保存车次、站点、检票口或接驳信息，别把关键步骤留到最后。',
    ],
  }
}

function buildFallbackBattleBookContent(input, venueRule) {
  const scene = sceneLabel(input.sceneType)
  const hasUrgentReturn = /高铁|火车|飞机|返程|赶车/.test(input.notes || '')
  const riskScore = (input.isCrossCity ? 10 : 0) + (input.isFirstTime ? 8 : 0) + (hasUrgentReturn ? 12 : 0) + (!venueRule ? 6 : 0)
  const scoreValue = Math.max(66, 92 - riskScore)
  const scoreLevel = scoreValue >= 85 ? 'low' : scoreValue >= 74 ? 'medium' : 'high'
  const sourceNote = venueRule ? venueRule.sourceNote : '赴约小管家经验规则'

  const risks = [
    {
      title: '入场节奏别压到最后',
      level: input.isFirstTime ? 'high' : 'medium',
      reason: input.isFirstTime
        ? '第一次参加这类活动时，安检、找入口和找分区都容易比预想更花时间。'
        : '热门场次的人流和安检节奏，经常会比平时更慢一些。',
      advice: '尽量把到场时间放在开场前 60 到 90 分钟，先把进场这一步走稳。',
      source: sourceNote,
    },
    {
      title: '票档和分区先看清',
      level: input.ticketArea ? 'medium' : 'high',
      reason: input.ticketArea
        ? `你这次已经有“${input.ticketArea}”的信息，但现场如果走错入口，还是会很耽误时间。`
        : '票档、看台或内场区域如果不提前确认，现场很容易排错队再折返。',
      advice: '出发前把票务、分区图和入口截图保存好，到场先对照再走。',
      source: sourceNote,
    },
    {
      title: '散场返程要提前想',
      level: hasUrgentReturn || input.isCrossCity ? 'high' : 'medium',
      reason: hasUrgentReturn
        ? '你这次备注里已经提到赶车，散场后只要在核心人流里卡住，就会很被动。'
        : input.isCrossCity
          ? '跨城返程比同城更怕临时决策，尤其是热门演出或球赛散场时。'
          : '散场后的网约车和地铁口，经常比想象中更挤。',
      advice: '把返程路线、上车点和备用方案提前保存，散场先执行返程计划再考虑别的事。',
      source: sourceNote,
    },
  ]

  if (input.merchPlan || input.meetupPlan) {
    risks.push({
      title: '物料和会合别和入场撞车',
      level: 'medium',
      reason: '领物料、买周边和朋友会合，都容易占掉入场前最宝贵的缓冲时间。',
      advice: '先决定主次，如果要领物料或会合，就把到场时间再提前一些。',
      source: '赴约小管家经验规则',
    })
  }

  if (input.sceneType === 'match') {
    risks.push({
      title: '看台退场别只跟着人流走',
      level: 'medium',
      reason: '球赛散场时，不同看台的退场节奏差异很大，盲目跟着人流容易绕远或被卡住。',
      advice: '提前确认自己看台对应的退场方向，如果赶车就优先走最稳的路线。',
      source: sourceNote,
    })
  }

  const checklist = {
    mustBring: [
      '身份证或入场所需证件',
      '手机和充电设备',
      input.ticketArea ? `${input.ticketArea} 相关票务信息截图` : '票务信息截图',
    ],
    recommended: [
      input.outfitFocus || '一件方便走路和排队的外搭',
      input.merchPlan ? '装物料或周边的轻便袋子' : '少量补给和纸巾',
      hasUrgentReturn ? '返程车次和站点截图' : '返程路线截图',
    ],
    avoidBring: venueRule?.prohibitedItems?.slice(0, 3) || ['大件不便携带物品', '可能过不了安检的物品'],
  }

  const suggestions = {
    arrival: [
      '先看清场馆入口和分区，再决定是先会合、先领物料还是先进场。',
      input.isCrossCity ? '跨城赴约更适合早点到，别把全部节奏压到最后一小时。' : '尽量别卡点到场，给自己留一点缓冲，心态会稳很多。',
    ],
    departure: [
      hasUrgentReturn ? '散场后别恋战，先快速离开核心人流区。' : '散场后先按预设返程路线走，不要临时跟着人流乱改方向。',
      input.isCrossCity ? '跨城返程优先保时间，拍照和闲逛尽量放到返程安全之后。' : '同城返程也先想好地铁、打车和步行哪一个更稳。',
    ],
    newbie: [
      input.isFirstTime ? `第一次去看 ${scene}，早一点到场就是最划算的安心感。` : `就算不是第一次去，看热门 ${scene} 也别把时间压太紧。`,
      '把票务信息、场馆入口和返程路线提前截图保存，现场会轻松很多。',
    ],
  }

  return {
    successScore: {
      value: scoreValue,
      level: scoreLevel,
      summary: `这次 ${scene} 赴约整体可控，但入场节奏、票档分区和散场返程这几件事一定要提前想好。`,
      improvementTips: [
        '先把场馆入口和票档分区截图保存好。',
        hasUrgentReturn ? '把散场返程当成第一优先级来安排。' : '给进场和散场各留一点缓冲时间。',
      ],
    },
    risks,
    timeline: [
      {
        phase: 'before_departure',
        timeLabel: '出发前',
        action: '把票务、证件和路线先收好',
        note: '别到场后才找截图或确认入口，提前整理好会省很多心力。',
      },
      {
        phase: 'before_arrival',
        timeLabel: '到场前 60-90 分钟',
        action: '尽量把自己提前送到场馆周边',
        note: input.isCrossCity ? '跨城赴约更适合早一点到，给会合、领物料和找入口都留缓冲。' : '早点到场，比卡点冲刺更稳。',
      },
      {
        phase: 'before_entry',
        timeLabel: '入场前',
        action: '先确认入口和票档分区',
        note: input.ticketArea ? `你这次是“${input.ticketArea}”，到场后先按分区找对入口。` : '没把分区看清前，先别急着跟人流排队。',
      },
      {
        phase: 'on_site',
        timeLabel: '现场中',
        action: '把应援、拍照和补给节奏分开',
        note: input.supportGoal ? `你这次最在意的是“${input.supportGoal}”，现场别让所有事同时挤在一起。` : '先照顾好自己的节奏，别让补给和返程被忽略。',
      },
      {
        phase: 'after_event',
        timeLabel: '散场后',
        action: '先执行返程路线',
        note: hasUrgentReturn ? '你这次有赶车压力，散场后第一优先级就是尽快离开核心人流区。' : '散场后先按预设路线走，不要临时改主意。',
      },
    ],
    checklist,
    styleAdvice: fallbackStyleAdvice(input),
    foodAdvice: fallbackFoodAdvice(input),
    stayAdvice: fallbackStayAdvice(input),
    socialAdvice: fallbackSocialAdvice(input),
    ticketAdvice: fallbackTicketAdvice(input),
    seatAdvice: fallbackSeatAdvice(input),
    returnAdvice: fallbackReturnAdvice(input),
    suggestions,
  }
}

function normalizeBattleBookContent(content, input) {
  return {
    ...content,
    timeline: content.timeline.map((item) => ({
      ...item,
      phaseLabel: phaseLabels[item.phase],
    })),
    styleAdvice: content.styleAdvice || fallbackStyleAdvice(input),
    foodAdvice: content.foodAdvice || fallbackFoodAdvice(input),
    stayAdvice: content.stayAdvice || fallbackStayAdvice(input),
    socialAdvice: content.socialAdvice || fallbackSocialAdvice(input),
    ticketAdvice: content.ticketAdvice || fallbackTicketAdvice(input),
    seatAdvice: content.seatAdvice || fallbackSeatAdvice(input),
    returnAdvice: content.returnAdvice || fallbackReturnAdvice(input),
  }
}

module.exports = {
  buildFallbackBattleBookContent,
  buildBattleBookPrompt,
  buildBattleBookSchema,
  normalizeBattleBookContent,
  phaseLabels,
}
