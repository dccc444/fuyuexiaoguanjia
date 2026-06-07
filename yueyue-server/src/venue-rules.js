const { normalizeVenueName, sceneLabel } = require('./utils')

const RULES_LAST_VERIFIED = '2026-06-04'

const venueRules = [
  {
    venueId: 'mercedes-benz-arena-shanghai',
    venueName: '梅赛德斯-奔驰文化中心',
    city: '上海',
    aliases: ['梅赛德斯-奔驰文化中心', '梅赛德斯奔驰文化中心', '梅奔', 'Mercedes-Benz Arena'],
    scenes: ['concert', 'festival', 'match'],
    summary:
      '官方服务指南和 FAQ 明确了进场禁带、停车和交通规则，适合优先提醒食物饮料、大件行李、应援物和自驾停车饱和问题。',
    entryTips: [
      '地铁 8 号线中华艺术宫站 4 号口、7/8 号线耀华路站 1 号口、13 号线世博大道站 4 号口都可抵达场馆。',
      '演出日停车位饱和后，场馆可能临时关闭车辆入口，官方建议优先地铁出行。',
      '馆内有演出期间餐饮档口，商业区域也有餐饮可选。',
    ],
    prohibitedItems: [
      '标语、旗帜、旗杆、手幅横幅等应援展示物',
      '灯牌、灯幅、激光笔、投影设备',
      '打火机、冷焰火、易燃易爆物、玻璃制品',
      '食物、饮料、酒精、充气物',
      '专业摄影摄像机、无人机、扩音器',
      '长柄雨伞、折叠椅、大件行李、宠物',
    ],
    allowedOrConditional: [
      '如携带长柄伞、专业摄影摄像机、大件行李等贵重物品，安检后会由主办方工作人员处理。',
      '官方未写明常规寄存点，建议尽量轻装到场。',
    ],
    transport: {
      publicTransport: '优先地铁到场，避免演出日停车入口临时关闭造成延误。',
      parking: '地下二层约 430 个停车位；演出日饱和后可能封闭车辆入口。',
    },
    sourceNote: '梅赛德斯-奔驰文化中心官方',
    sources: [
      {
        title: '梅赛德斯-奔驰文化中心 FAQ - 演出观演注意事项',
        url: 'https://www.mercedes-benzarena.com/faq.html',
        publisher: '梅赛德斯-奔驰文化中心',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '梅赛德斯-奔驰文化中心 服务指南',
        url: 'https://www.mercedes-benzarena.com/TrafficGuide/',
        publisher: '梅赛德斯-奔驰文化中心',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'wukesong-beijing',
    venueName: '华熙生物·润百颜中心（华熙LIVE·五棵松）',
    city: '北京',
    aliases: ['华熙生物·润百颜中心', '华熙live五棵松', '华熙LIVE·五棵松', '五棵松', '五棵松体育馆'],
    scenes: ['concert', 'festival', 'match'],
    summary:
      '官方观众服务页给出了较完整的入场、寄存、未成年人、摄影器材、开门时间和二次进出规则，适合直接写进当天安排。',
    entryTips: [
      '地铁 1 号线五棵松站 B1 口可步行到场，体育馆观众通常从东、西、北三个入口入场。',
      '常规大型活动通常在开演前 2 小时开门，具体以主办方通知为准。',
      '南门和西门观众入口通常设有大型箱包寄存处。',
    ],
    prohibitedItems: [
      '酒精、易燃易爆物、打火机火柴等点火器具',
      '食品饮料（母婴或老人所需食品除外）、玻璃制品、大型箱包',
      '专业照相机、可换镜头设备、录制设备、单脚架和三脚架、闪光灯设备',
      '激光笔、扩音器、50 厘米以上长度的闪光棒',
      '任何形式的政治、宗教及违法宣传品、各类管制器具',
      '宠物（公安防爆犬及经过专业训练的导盲犬除外）',
    ],
    allowedOrConditional: [
      '允许携带非专业相机，但不得使用闪光灯拍照。',
      '1.2 米以下未成年人不得入内；1.2 米以上未成年人需监护人或成年人陪同并持票。',
      '入场后不可重复进出，馆内为无烟场馆。',
    ],
    transport: {
      publicTransport: '优先地铁 1 号线五棵松站到场，减少停车和落客拥堵影响。',
      parking: '观演可停地面或地下停车场，但活动期间出租车不得进入场馆范围内。',
    },
    sourceNote: '华熙LIVE·五棵松官方',
    sources: [
      {
        title: '华熙LIVE·五棵松 观众服务',
        url: 'https://wks.bloomagelive.com/live/normal.html?id=27',
        publisher: '华熙LIVE·五棵松',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '华熙LIVE·五棵松 场馆交通与入口信息',
        url: 'https://wks.bloomagelive.com/live/',
        publisher: '华熙LIVE·五棵松',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'shanghai-stadium',
    venueName: '徐家汇体育公园·上海体育场',
    city: '上海',
    aliases: ['上海体育场', '徐家汇体育公园上海体育场', '八万人体育场', '八万人'],
    scenes: ['concert', 'match'],
    summary:
      '徐汇区政府公开的观演指南强调了强实名入场、分证件预检、P+R 停车换乘和文明观演要求，适合优先提醒证件、预检和散场秩序。',
    entryTips: [
      '演出通常采用严格实名身份证件入场，需提前打开票夹，电子票截屏无效。',
      '不同证件类型观众预检口不同，到场后要先看清预检口和对应入口。',
      '官方建议优先使用 P+R 停车换乘或轨交，减少场馆周边拥堵。',
    ],
    prohibitedItems: [
      '电子票截屏或与购票人证件信息不一致的票务信息',
      '场馆周边搭帐篷过夜、长时间聚集等不理智应援行为',
      '不配合安检、预检和分流管理的入场方式',
    ],
    allowedOrConditional: [
      '需持购票人身份证件（含港澳通行证、台胞证、护照）配合预检和入场。',
      '散场后按轨交警方和现场引导有序离场，家长接人可关注官方临时等候区安排。',
    ],
    transport: {
      publicTransport: '优先轨交 1、3、4、11 号线周边站点到场，减轻场馆周边拥堵。',
      parking: '官方推荐 P+R 停车换乘，距离场馆 1 站左右的商业停车场可分流停车压力。',
    },
    sourceNote: '上海市政府转载徐汇区政府公开指南',
    sources: [
      {
        title: '观演指南请收藏！演唱会如何入场、散场？这些细节需注意',
        url: 'https://www.shanghai.gov.cn/nw17239/20251107/cf20bae9dda642b28dc801cfa8b7a220.html',
        publisher: '徐汇区人民政府 / 上海市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '时代少年团上海开唱 一张票一场旅行',
        url: 'https://www.shanghai.gov.cn/nw4411/20250821/7e9a2250b924437e98352f567211410e.html',
        publisher: '上海市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'hangzhou-olympic-stadium',
    venueName: '杭州奥体中心体育场（大莲花）',
    city: '杭州',
    aliases: ['杭州奥体中心体育场', '杭州奥体中心体育场大莲花', '大莲花', '杭州奥体'],
    scenes: ['concert', 'match'],
    summary:
      '杭州官方公开信息重点强调了实名人证票核验、不要走错场馆、文明观演和反黄牛提醒，适合优先提醒跨城用户提前到场并确认证件信息。',
    entryTips: [
      '入场时会对观演人的人脸、证件、座位及购票订单信息进行比对，信息一致后方可入场。',
      '奥体片区常有体育场和体育馆同步办活动，需提前确认自己去的是“大莲花”还是其他场馆。',
      '建议提前进场、文明观演，散场后随身物品随手带走。',
    ],
    prohibitedItems: [
      '非本人实名票、与证件信息不一致的订单信息',
      '通过非官方渠道转售的票务和所谓“内部票”',
      '临近开场才赶到、未提前确认场馆导致走错入口的行为风险',
    ],
    allowedOrConditional: [
      '跨城用户更适合把到场时间预留到开场前 90 分钟左右，避免核验和找入口过于仓促。',
      '如果同日周边还有其他活动，先看清场馆名称和入口分区再排队。',
    ],
    transport: {
      publicTransport: '官方提醒大型活动日提早出发，优先公共交通，避免临近开场集中到达。',
      parking: '奥体片区大型活动日停车与落客压力都较高，建议尽量减少自驾依赖。',
    },
    sourceNote: '杭州官方公开提醒',
    sources: [
      {
        title: '明晚，杭州奥体中心体育场举办演唱会 警方提醒来了',
        url: 'https://hznews.hangzhou.com.cn/chengshi/content/2025-07/24/content_9046210.htm',
        publisher: '杭州网',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '薛之谦杭州演唱会门票售罄！杭州公安又来操心提醒：这些，别信',
        url: 'https://hznews.hangzhou.com.cn/chengshi/content/2024-04/05/content_8711344.htm',
        publisher: '杭州网',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '来杭州看国足比赛，观赛指南公布！',
        url: 'https://hznews.hangzhou.com.cn/chengshi/content/2025-03/24/content_8958103.htm',
        publisher: '杭州网',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'shanghai-international-circuit',
    venueName: '上海国际赛车场',
    city: '上海',
    aliases: ['上海国际赛车场', '上赛场', 'Shanghai International Circuit'],
    scenes: ['match', 'festival'],
    summary:
      '上海官方 F1 观赛指南给出了地铁与临时接驳、二次验票、可重复进出和禁带物品规则，适合赛事型场景优先提醒观赛入口和雨天准备。',
    entryTips: [
      '可乘地铁 11 号线到白银路站或上海赛车场站，赛事期间通常还有虹桥站往返临时接驳线。',
      '请尽量提早到场，为安检和验票预留时间；看台入口通常还会进行第二次验票。',
      '同日可按指定入口重复进出，但每次都需重新完成入场流程。',
    ],
    prohibitedItems: [
      '长柄雨伞',
      '旗杆',
      '无人机',
      '公共广播扩音设备',
      '未经授权的专业摄影器材',
      '三脚架等支撑设备',
    ],
    allowedOrConditional: [
      '建议雨天带折叠伞或雨衣，不要携带长柄伞。',
      '外籍观众需携带护照并前往人工服务区完成核验。',
    ],
    transport: {
      publicTransport: '优先地铁 11 号线和赛事临时接驳线，避免赛事高峰期自驾拥堵。',
      parking: '大型赛事日更适合公共交通或官方临时接驳，停车与道路管制信息需提前确认。',
    },
    sourceNote: '上海市官方 F1 观赛指南',
    sources: [
      {
        title: "F1 Chinese Grand Prix spectator's guide",
        url: 'https://english.shanghai.gov.cn/en-SportsEvents/20240417/d2e84d3e710b47219dd6d0db7d1629f6.html',
        publisher: 'International Services Shanghai',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: 'Your complete guide to the 2026 F1 Chinese Grand Prix',
        url: 'https://english.shanghai.gov.cn/en-SportsEvents/20260311/933bcc13c7c44363a04a036b4888a7de.html',
        publisher: 'International Services Shanghai',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'shenzhen-bay-gymnasium',
    venueName: '深圳湾体育中心体育馆',
    city: '深圳',
    aliases: ['深圳湾体育中心体育馆', '深圳湾体育中心', '春茧体育馆', '春茧'],
    scenes: ['concert', 'match'],
    summary:
      '深圳演出资讯与场馆公开运营信息显示，这里是高频赛演场馆，活动日更适合优先地铁出行，并提前准备实名入场所需证件。',
    entryTips: [
      '大型演出和赛事日建议提早到场，给安检和实名核验留足时间。',
      '深圳湾片区活动日停车资源紧张，更适合地铁和网约车接驳。',
      '观演前请提前确认主办方发布的实名核验要求和具体入口。',
    ],
    prohibitedItems: ['未按实名要求准备证件与票务信息', '长时间依赖现场找停车位', '未经确认的二手票或转票'],
    allowedOrConditional: ['以主办方实名票务规则为准，建议携带购票证件原件。', '活动日优先选择公共交通，减少入场前的不确定性。'],
    transport: {
      publicTransport: '优先公共交通到场，深圳湾片区地铁和周边接驳更稳定。',
      parking: '大型活动日停车位有限，建议尽量避免临近开场再自驾到场。',
    },
    sourceNote: '深圳新闻网及场馆公开运营信息',
    sources: [
      {
        title: '深圳体育场馆“赛演商”三合一',
        url: 'https://www.sznews.com/news/content/2025-11/30/content_31791237.htm',
        publisher: '深圳新闻网',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '2026演出市场持续升温！多场演唱会接连登陆深圳',
        url: 'https://www.sznews.com/news/content/2026-01/14/content_31903355.htm',
        publisher: '深圳新闻网',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'shenzhen-universiade-stadium',
    venueName: '深圳大运中心体育场',
    city: '深圳',
    aliases: ['深圳大运中心体育场', '深圳大运中心', '大运中心体育场'],
    scenes: ['concert', 'match'],
    summary:
      '深圳公开观演资讯明确了强实名入场和交通分流逻辑，适合优先提醒证件原件、电子票和地铁到场方案。',
    entryTips: [
      '3万人以上演出执行人、票、证合一强实名入场，需持购票时填写的本人身份证原件。',
      '地铁 3 号线、14 号线大运站以及 16 号线大运中心站都可覆盖场馆周边。',
      '活动日交警通常对周边实施分区疏导，尽量不要压着开场时间抵达。',
    ],
    prohibitedItems: ['电子票信息与身份证件不一致', '未携带购票证件原件', '临近开场才自驾驶入核心管控区'],
    allowedOrConditional: ['请提前打开票夹，按现场指引走实名核验通道。', '如需自驾，建议先确认外围停车区和步行接驳路线。'],
    transport: {
      publicTransport: '优先地铁 3/14/16 号线相关站点，活动日更稳妥。',
      parking: '活动日周边常实施交通疏导，自驾更适合停外围停车区后步行或接驳。',
    },
    sourceNote: '深圳新闻网公开观演与交通攻略',
    sources: [
      {
        title: '记得带身份证！李荣浩大运中心演唱会实行“人、票、证合一”强实名入场',
        url: 'https://www.sznews.com/news/content/2023-10/20/content_30542786.htm',
        publisher: '深圳新闻网',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '深圳大运中心演唱会出行攻略来了',
        url: 'https://www.sznews.com/news/content/2023-07/28/content_30367600_0.htm',
        publisher: '深圳新闻网',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '能不能给我一首歌的时间，把出行攻略看到最后再去现场！',
        url: 'https://www.sznews.com/news/content/2019-12/30/content_22741854.htm',
        publisher: '深圳新闻网',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'shenzhen-universiade-arena',
    venueName: '深圳大运中心体育馆',
    city: '深圳',
    aliases: ['深圳大运中心体育馆', '大运中心体育馆'],
    scenes: ['concert', 'match'],
    summary:
      '公开观演服务信息给出了更细的地铁出口和停车分流方案，适合直接提醒接驳和早点到场。',
    entryTips: [
      '地铁 16 号线大运中心站 C、D 口可直达，3 号线和 14 号线大运站步行约 10 分钟可达。',
      '周边公交与大站快车活动日会加密，公共交通覆盖面较好。',
      '演唱会高峰期建议提早抵达，避免在外围安检和检票处聚集。',
    ],
    prohibitedItems: ['未准备实名票务信息', '临近开场再找停车位', '依赖现场临时购票或无来源转票'],
    allowedOrConditional: ['可结合活动日开放的外围停车区使用停车后步行方案。', '出发前先核对官方票务平台中的观演人信息。'],
    transport: {
      publicTransport: '优先 16 号线大运中心站或 3/14 号线大运站。',
      parking: '活动日会开放多片外围停车区，但更推荐地铁到场。',
    },
    sourceNote: '深圳新闻网公开观演服务信息',
    sources: [
      {
        title: '一场演唱会折射出城市精细化服务水平 龙岗多维服务网络彰显深圳温度',
        url: 'https://www.sznews.com/news/content/2025-04/28/content_31552387.htm',
        publisher: '深圳新闻网',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '深圳大运中心演唱会出行攻略来了',
        url: 'https://www.sznews.com/news/content/2023-07/28/content_30367600_0.htm',
        publisher: '深圳新闻网',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'shenzhen-sports-center-gymnasium',
    venueName: '深圳市体育中心体育馆',
    city: '深圳',
    aliases: ['深圳市体育中心体育馆', '深圳体育中心体育馆', '深圳体育中心'],
    scenes: ['concert', 'match'],
    summary:
      '改造后的深圳体育中心体育馆已成为高频演唱会场馆，适合在首版规则里优先提醒实名证件、提早到场和周边接驳。',
    entryTips: [
      '场馆翻新后承接大型演唱会频率较高，活动日建议提早到场并留出安检时间。',
      '演出前先查看主办方公布的实名和票务规则，避免因信息不一致耽误入场。',
      '市中心场馆周边人流密集，更适合地铁或短距离接驳。',
    ],
    prohibitedItems: ['票务信息与本人证件不一致', '压着开场时间到场', '依赖周边临停快速入场'],
    allowedOrConditional: ['请以具体演出主办方公布的强实名规则为准。', '尽量轻装到场，减少安检耗时。'],
    transport: {
      publicTransport: '优先市区轨交和步行接驳方式。',
      parking: '中心城区活动日停车压力较大，不建议把入场节奏压在自驾上。',
    },
    sourceNote: '深圳新闻网公开演出信息',
    sources: [
      {
        title: '郁可唯演唱会8月17日在深圳体育中心体育馆开唱',
        url: 'https://www.sznews.com/news/content/mb/2025-08/15/content_31664579.htm',
        publisher: '深圳新闻网',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '深圳体育场馆“赛演商”三合一',
        url: 'https://www.sznews.com/news/content/2025-11/30/content_31791237.htm',
        publisher: '深圳新闻网',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'guangzhou-tianhe-stadium',
    venueName: '广州天河体育中心体育场',
    city: '广州',
    aliases: ['广州天河体育中心体育场', '天河体育中心体育场', '天河体育中心', '天体'],
    scenes: ['concert', 'match'],
    summary:
      '广州官方场馆信息显示天河体育中心是演唱会和大型赛事高频承办地，首版规则适合优先提醒市中心拥堵与早点到场。',
    entryTips: [
      '市中心大型场馆活动日人流集中，建议提早到场完成安检和找入口。',
      '优先使用地铁等公共交通方式，减少核心商圈拥堵带来的不确定性。',
      '观演前请先确认主办方公布的实名和票务核验要求。',
    ],
    prohibitedItems: ['未准备好证件和票务信息', '开场前才临时寻找停车位', '来源不明的转票'],
    allowedOrConditional: ['实名与票务规则以具体活动主办方通知为准。', '建议轻装到场，减少入场排队时间。'],
    transport: {
      publicTransport: '优先广州地铁和商圈步行接驳。',
      parking: '商圈活动日停车与落客压力较大，公共交通更稳妥。',
    },
    sourceNote: '广州市政府及市体育局公开信息',
    sources: [
      {
        title: '广州天河体育中心',
        url: 'https://www.gz.gov.cn/zlgz/gzly/wzgz/wtcg/content/post_9513141.html',
        publisher: '广州市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '广州天河体育中心获评“2023年全国体育事业突出贡献奖”',
        url: 'https://tyj.gz.gov.cn/bmzc/tpxw/content/post_9450444.html',
        publisher: '广州市体育局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'guangdong-olympic-stadium',
    venueName: '广东奥林匹克体育中心体育场',
    city: '广州',
    aliases: ['广东奥林匹克体育中心体育场', '广东奥林匹克体育中心', '广东奥体', '广州奥体中心'],
    scenes: ['concert', 'match'],
    summary:
      '广州文旅公开信息显示这里是万人级演出高频场馆，适合优先提醒轨交出行和提前查看具体票务规则。',
    entryTips: [
      '大型活动日建议尽量早到，先完成安检和实名核验再安排补给。',
      '奥体片区场馆活动多，需提前确认具体场馆名称和入口分区。',
      '尽量使用公共交通，减少外围道路拥堵影响。',
    ],
    prohibitedItems: ['非官方渠道转票', '未核对清楚场馆名称就到场', '把到场时间压得过晚'],
    allowedOrConditional: ['实名与安检规则请以主办方通知为准。', '跨城用户建议比日常再多预留一段缓冲时间。'],
    transport: {
      publicTransport: '优先公共交通和地铁换乘到场。',
      parking: '大型活动日车流压力较大，自驾更适合预留外围换乘方案。',
    },
    sourceNote: '广州市文旅局公开演艺场馆信息',
    sources: [
      {
        title: '“文旅最广州系列名录”之十大演艺场所发布',
        url: 'https://wglj.gz.gov.cn/gkmlpt/content/9/9504/post_9504026.html',
        publisher: '广州市文化广电旅游局',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '演出超2.5万场，票房收入8.8亿元！一季度广州演艺经济表现亮眼',
        url: 'https://wglj.gz.gov.cn/gzdt/zwxx/content/post_10783292.html',
        publisher: '广州市文化广电旅游局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'baoneng-guangzhou-arena',
    venueName: '宝能广州国际体育演艺中心',
    city: '广州',
    aliases: ['宝能广州国际体育演艺中心', '广州国际体育演艺中心', '宝能演艺中心'],
    scenes: ['concert', 'match'],
    summary:
      '广州文旅公开信息和演出许可显示这里是黄埔区高频演唱会场馆，首版规则适合优先提醒实名票务和早点出发。',
    entryTips: [
      '演唱会场次密集时，建议提早到场并提前查好返程交通。',
      '请在出发前确认官方票务平台中的观演人信息和主办方实名规则。',
      '黄埔片区跨区通勤时间波动较大，更适合提前规划路线。',
    ],
    prohibitedItems: ['来源不明的转票', '未准备实名所需证件', '临近开场才从远距离区域出发'],
    allowedOrConditional: ['活动具体安检规则以主办方公告为准。', '跨城或跨区赴约建议把返程方案也提前定好。'],
    transport: {
      publicTransport: '优先地铁与网约车接驳，减少开场前道路不确定性。',
      parking: '活动日周边停车和落客都更紧张，建议降低自驾依赖。',
    },
    sourceNote: '广州市文旅局公开演出许可与场馆信息',
    sources: [
      {
        title: '广州市营业性演出准予许可决定-潘玮柏“狂爱2.0”巡回演唱会-广州站',
        url: 'https://wglj.gz.gov.cn/gkmlpt/content/10/10191/post_10191360.html',
        publisher: '广州市文化广电旅游局',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '“文旅最广州系列名录”之十大演艺场所发布',
        url: 'https://wglj.gz.gov.cn/gkmlpt/content/9/9504/post_9504026.html',
        publisher: '广州市文化广电旅游局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'guangzhou-university-town-stadium',
    venueName: '广州大学城体育中心体育场',
    city: '广州',
    aliases: ['广州大学城体育中心体育场', '大学城体育中心体育场', '广州大学城体育中心'],
    scenes: ['concert', 'match'],
    summary:
      '广州演艺经济公开信息表明大学城体育中心体育场已成为高频万人级场馆，适合优先提醒跨区通勤与提前到场。',
    entryTips: [
      '大学城片区大型活动日建议提早出发，避免岛内外通勤耗时波动。',
      '先核对自己去的是体育场还是周边其他场馆，再排队入场。',
      '实名与票务规则请提前查看主办方公告。',
    ],
    prohibitedItems: ['未核对场馆和入口', '依赖临时现场找票', '压缩到场缓冲时间'],
    allowedOrConditional: ['适合把返程地铁和接驳路线提前截图保存。', '尽量轻装到场，减少安检排队时间。'],
    transport: {
      publicTransport: '优先大学城片区轨交和公交接驳。',
      parking: '活动日跨区车流更重，自驾不如公共交通稳定。',
    },
    sourceNote: '广州市文旅局公开演艺经济信息',
    sources: [
      {
        title: '演出超2.5万场，票房收入8.8亿元！一季度广州演艺经济表现亮眼',
        url: 'https://wglj.gz.gov.cn/gzdt/zwxx/content/post_10783292.html',
        publisher: '广州市文化广电旅游局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'guangzhou-gymnasium',
    venueName: '广州体育馆',
    city: '广州',
    aliases: ['广州体育馆', '白云广州体育馆'],
    scenes: ['concert', 'match'],
    summary:
      '广州演艺经济公开信息显示广州体育馆仍是稳定的高频室内演出场馆，首版规则以实名、提前到场和返程接驳为主。',
    entryTips: [
      '室内万人场馆高峰时段安检和排队较集中，建议提早到场。',
      '请提前核对主办方公布的实名规则、检票时间和具体入口。',
      '散场后优先按官方指引前往轨交或接驳点，减少门口聚集。',
    ],
    prohibitedItems: ['未带购票证件', '来源不明的转票', '散场后临时决定返程路线'],
    allowedOrConditional: ['可提前保存电子票和返程路线截图。', '轻装到场更有利于快速入场。'],
    transport: {
      publicTransport: '优先轨交和接驳到场。',
      parking: '大型室内演出日停车与离场车流都更集中，公共交通更稳定。',
    },
    sourceNote: '广州市文旅局公开演艺经济信息',
    sources: [
      {
        title: '演出超2.5万场，票房收入8.8亿元！一季度广州演艺经济表现亮眼',
        url: 'https://wglj.gz.gov.cn/gzdt/zwxx/content/post_10783292.html',
        publisher: '广州市文化广电旅游局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'nanjing-olympic-stadium',
    venueName: '南京奥体中心体育场',
    city: '南京',
    aliases: ['南京奥体中心体育场', '南京奥体中心', '南京奥体'],
    scenes: ['concert', 'match'],
    summary:
      '南京官方信息显示奥体中心是大型文体活动的重要平台，近期还针对赛事释放周边停车与环境保障信息，适合优先提醒证件、停车和早点到场。',
    entryTips: [
      '大型比赛和演出日建议提早出发，先完成安检与验票。',
      '官方曾针对热门赛事释放周边超万个车位，但更稳妥的仍是公共交通配合步行接驳。',
      '入场前请提前确认主办方实名规则和具体入口信息。',
    ],
    prohibitedItems: ['未准备好实名证件', '把停车和入场时间压得太紧', '未核对清楚主办方公告'],
    allowedOrConditional: ['可结合官方发布的周边停车区和导引方案使用。', '如果是热门赛事，建议预留更长散场缓冲。'],
    transport: {
      publicTransport: '优先地铁和步行接驳方式到场。',
      parking: '热门活动日会开放更多周边车位，但仍建议降低对自驾的依赖。',
    },
    sourceNote: '南京市政府与城市管理局公开信息',
    sources: [
      {
        title: '奥体中心——南京市河西新城区开发建设管委会',
        url: 'https://newtown.nanjing.gov.cn/xcyx/pzxc/wtpt/201703/t20170317_2110458.html',
        publisher: '南京市河西新城区开发建设管委会',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '奥体中心周边将释放超1万个车位',
        url: 'https://cgj.nanjing.gov.cn/bmdt/202508/t20250815_5628614.html',
        publisher: '南京市城市管理局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'nanjing-olympic-gymnasium',
    venueName: '南京奥体中心体育馆',
    city: '南京',
    aliases: ['南京奥体中心体育馆', '南京奥体体育馆'],
    scenes: ['concert', 'match'],
    summary:
      '南京官方场馆信息显示奥体中心体育馆是成熟的综合性场馆，首版规则以实名核验、早点到场和周边接驳为主。',
    entryTips: [
      '室内大型活动入场通常更集中，建议比开演时间更早到场。',
      '先看清自己对应的检票口与入口，再决定是否临时补给。',
      '活动具体实名规则请以主办方公告为准。',
    ],
    prohibitedItems: ['未带购票证件', '临近开场再寻找入口', '来源不明的转票'],
    allowedOrConditional: ['轻装到场更利于快速安检。', '返程建议提前确认地铁末班或接驳路线。'],
    transport: {
      publicTransport: '优先南京市区轨交和步行接驳。',
      parking: '热门活动日停车时间和离场时间都更难预估。',
    },
    sourceNote: '南京市体育局与奥体公开信息',
    sources: [
      {
        title: '奥体中心篮球俱乐部_健身场馆',
        url: 'https://sports.nanjing.gov.cn/ztzl/njtyxfxcj/jscg/202307/t20230724_3969299.html',
        publisher: '南京市体育局',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '奥体中心——南京市河西新城区开发建设管委会',
        url: 'https://newtown.nanjing.gov.cn/xcyx/pzxc/wtpt/201703/t20170317_2110458.html',
        publisher: '南京市河西新城区开发建设管委会',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'nanjing-youth-olympic-stadium',
    venueName: '南京青奥体育公园体育场',
    city: '南京',
    aliases: ['南京青奥体育公园体育场', '青奥体育公园体育场', '南京青奥体育公园'],
    scenes: ['concert', 'match'],
    summary:
      '南京官方公开信息显示青奥体育公园是南京高频赛演和重点改造场馆，适合优先提醒场馆确认、交通和提前到场。',
    entryTips: [
      '青奥体育公园承接赛事和演艺活动频繁，到场前先确认自己去的是体育场还是体育馆。',
      '大型活动建议提早到场，给安检、找入口和现场分流留足时间。',
      '活动规则和实名要求仍以主办方当次通知为准。',
    ],
    prohibitedItems: ['未确认具体场馆类型就排队', '压缩实名核验缓冲时间', '来源不明的转票'],
    allowedOrConditional: ['周边改造和活动较多时，更适合提前查好入口和返程路线。', '跨城用户建议把返程方案与场馆名称截图保存。'],
    transport: {
      publicTransport: '优先公共交通与步行接驳方案。',
      parking: '热门活动日停车与疏导信息需提前确认，公共交通更稳。',
    },
    sourceNote: '南京市政府与体育局公开信息',
    sources: [
      {
        title: '青奥体育公园_健身场馆',
        url: 'https://sports.nanjing.gov.cn/ztzl/njtyxfxcj/jscg/202307/t20230724_3969398.html',
        publisher: '南京市体育局',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '南京市三举措加快打造现代体育文化新地标',
        url: 'https://www.nanjing.gov.cn/bmdt/202404/t20240417_4210918.html',
        publisher: '南京市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'nanjing-youth-olympic-arena',
    venueName: '南京青奥体育公园体育馆',
    city: '南京',
    aliases: ['南京青奥体育公园体育馆', '青奥体育公园体育馆', '青奥体育馆'],
    scenes: ['concert', 'match'],
    summary:
      '南京官方场馆信息显示这里是可容纳 2 万人的大型体育馆，适合优先提醒早点到场和看清具体入口。',
    entryTips: [
      '大型室内活动建议提早到场，避免入场高峰和找入口耗时。',
      '到园区后先看清体育馆与其他场馆的分布，不要跟着人流盲走。',
      '实名与票务规则请以主办方通知为准。',
    ],
    prohibitedItems: ['票务与证件信息不一致', '未确认清楚检票口就排队', '依赖现场临时转票'],
    allowedOrConditional: ['可提前保存主办方票务页面和场馆示意图截图。', '轻装入场更顺手。'],
    transport: {
      publicTransport: '优先公共交通和步行接驳到园区。',
      parking: '活动日车流会集中到园区外围，建议少依赖临停。',
    },
    sourceNote: '南京市体育局公开场馆信息',
    sources: [
      {
        title: '青奥体育公园_健身场馆',
        url: 'https://sports.nanjing.gov.cn/ztzl/njtyxfxcj/jscg/202307/t20230724_3969398.html',
        publisher: '南京市体育局',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '南京市三举措加快打造现代体育文化新地标',
        url: 'https://www.nanjing.gov.cn/bmdt/202404/t20240417_4210918.html',
        publisher: '南京市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'chengdu-phoenix-stadium',
    venueName: '成都凤凰山体育公园专业足球场',
    city: '成都',
    aliases: ['成都凤凰山体育公园专业足球场', '凤凰山体育公园专业足球场', '凤凰山体育公园足球场', '凤凰山足球场'],
    scenes: ['match', 'concert'],
    summary:
      '公开出行指南明确了凤凰山活动日周边停车紧张、优先公共交通的原则，适合优先提醒早到和接驳。',
    entryTips: [
      '前往凤凰山观赛或观演更适合优先公共交通，自驾容易造成周边拥堵。',
      '大型活动请提早到场，为安检、验票和入座留足时间。',
      '到达园区后先确认自己对应的是专业足球场还是综合体育馆。',
    ],
    prohibitedItems: ['临近开场再自驾扎堆到场', '未确认具体场馆和入口', '来源不明的二手票'],
    allowedOrConditional: ['主办方实名和安检规则请以当次活动公告为准。', '返程建议提前规划地铁或网约车上车点。'],
    transport: {
      publicTransport: '优先地铁与公交接驳，减少凤凰山周边道路拥堵。',
      parking: '活动日周边停车条件有限，不建议把节奏压在自驾上。',
    },
    sourceNote: '成都公开出行指南与场馆公开信息',
    sources: [
      {
        title: '凤凰山体育公园场馆观赛出行指南来啦',
        url: 'https://finance.sina.com.cn/jjxw/2023-05-22/doc-imyuskpw7947041.shtml',
        publisher: '成都日报转载 / 新浪财经',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '凤凰山体育公园',
        url: 'https://www.cdctzd.com/project-details.aspx?ContentId=61&t=19',
        publisher: '成都城投集团',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'chengdu-phoenix-arena',
    venueName: '成都凤凰山体育公园综合体育馆',
    city: '成都',
    aliases: ['成都凤凰山体育公园综合体育馆', '凤凰山体育公园综合体育馆', '凤凰山体育馆'],
    scenes: ['concert', 'match'],
    summary:
      '凤凰山园区公开观演和观赛出行信息强调了公共交通优先与提早到场，适合作为室内大型活动的首版规则。',
    entryTips: [
      '室内大型演出和比赛时，建议提早完成安检和找座位流程。',
      '同一园区内场馆较多，到达后先看清自己对应的是综合体育馆还是足球场。',
      '活动日尽量不要依赖现场找停车位。',
    ],
    prohibitedItems: ['未确认具体场馆入口', '依赖临停或临时找票', '开场前才到外围排队'],
    allowedOrConditional: ['实名与票务要求以主办方当次通知为准。', '跨城用户建议提前截图保存返程路线。'],
    transport: {
      publicTransport: '优先公共交通和园区接驳。',
      parking: '活动日车位紧张，自驾不如地铁稳定。',
    },
    sourceNote: '成都公开出行指南与场馆公开信息',
    sources: [
      {
        title: '凤凰山体育公园场馆观赛出行指南来啦',
        url: 'https://finance.sina.com.cn/jjxw/2023-05-22/doc-imyuskpw7947041.shtml',
        publisher: '成都日报转载 / 新浪财经',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '凤凰山体育公园',
        url: 'https://www.cdctzd.com/project-details.aspx?ContentId=61&t=19',
        publisher: '成都城投集团',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'chengdu-dongan-main-stadium',
    venueName: '成都东安湖体育公园主体育场',
    city: '成都',
    aliases: ['成都东安湖体育公园主体育场', '东安湖体育公园主体育场', '东安湖主体育场', '东安湖体育场'],
    scenes: ['concert', 'match'],
    summary:
      '东安湖是成都大型演艺和赛事核心场馆之一，公开资讯强调了场馆辨识、提前到场和大型活动承载能力，适合优先提醒场馆确认和交通缓冲。',
    entryTips: [
      '东安湖公园内有多场馆组合，到场后先确认自己去的是主体育场还是多功能体育馆。',
      '大型活动建议提早到场，给安检和找入口预留缓冲。',
      '跨城观众更适合提前规划返程和停车换乘方案。',
    ],
    prohibitedItems: ['未确认具体场馆位置', '临近开场才赶到', '来源不明的转票'],
    allowedOrConditional: ['实名与安检规则请以主办方公告为准。', '适合把场馆定位和返程路线提前保存。'],
    transport: {
      publicTransport: '优先公共交通和接驳方式前往东安湖片区。',
      parking: '大型活动日周边车流大，建议减少自驾依赖。',
    },
    sourceNote: '成都公开场馆信息',
    sources: [
      {
        title: '成都大运会开幕式场馆——东安湖体育公园主体育场',
        url: 'https://topics.gmw.cn/2023-05/31/content_36600235.htm',
        publisher: '光明网',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'chengdu-dongan-arena',
    venueName: '成都东安湖体育公园多功能体育馆',
    city: '成都',
    aliases: ['成都东安湖体育公园多功能体育馆', '东安湖体育公园多功能体育馆', '东安湖体育馆'],
    scenes: ['concert', 'match'],
    summary:
      '东安湖片区演出和赛事密集，首版规则以场馆确认、早点到场和返程缓冲为主。',
    entryTips: [
      '同片区存在主体育场与多功能体育馆，排队前先确认场馆和入口。',
      '大型活动建议预留足够安检和验票时间。',
      '返程高峰更适合提前规划接驳路线。',
    ],
    prohibitedItems: ['未确认场馆名称就跟随人流排队', '返程完全临时决定', '来源不明的转票'],
    allowedOrConditional: ['实名与票务规则以主办方当次公告为准。', '如果遇到雨天或多人同行，尽量更早到场。'],
    transport: {
      publicTransport: '优先公共交通与片区接驳。',
      parking: '大型活动日停车不稳定，建议优先绿色出行。',
    },
    sourceNote: '成都公开场馆信息与本地观演资讯',
    sources: [
      {
        title: '成都大运会开幕式场馆——东安湖体育公园主体育场',
        url: 'https://topics.gmw.cn/2023-05/31/content_36600235.htm',
        publisher: '光明网',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '2025陈小春生·旦·净·末·丑巡回演唱会-成都站观演指南',
        url: 'https://m.cd.bendibao.com/xiuxian/199485.shtm',
        publisher: '成都本地宝',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'chengdu-financial-city',
    venueName: '成都金融城演艺中心',
    city: '成都',
    aliases: ['成都金融城演艺中心', '五粮液成都金融城演艺中心', '金融城演艺中心'],
    scenes: ['concert'],
    summary:
      '公开场馆信息显示这里是西部高频室内演艺场馆，适合优先提醒实名信息、早点到场和返程接驳。',
    entryTips: [
      '万人级室内演艺场馆开演前建议尽早到场，减少安检和检票压力。',
      '请提前确认主办方公布的实名、退改和观演人信息规则。',
      '高新区夜间散场更适合提前想好返程方式。',
    ],
    prohibitedItems: ['观演人信息重复或与购票平台规则冲突', '依赖现场临时改票', '压着开场时间到场'],
    allowedOrConditional: ['退改和实名规则以当次演出主办方公告为准。', '建议出发前把电子票、证件和返程路线都准备好。'],
    transport: {
      publicTransport: '优先公共交通和高新区接驳方式。',
      parking: '活动日晚高峰车流较多，自驾返程不确定性更大。',
    },
    sourceNote: '场馆公开信息与本地观演资讯',
    sources: [
      {
        title: '集团重大项目 - 成都传媒集团',
        url: 'https://www.cmgchengdu.com/industry/staff4.html',
        publisher: '成都传媒集团',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '2026王安宇成都见面会观演指南',
        url: 'https://ent.sina.cn/2026-05-31/detail-inhztchk5471622.d.html',
        publisher: '新浪',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'wuhan-sports-center-stadium',
    venueName: '武汉体育中心主体育场',
    city: '武汉',
    aliases: ['武汉体育中心主体育场', '武汉体育中心体育场', '沌口体育中心'],
    scenes: ['concert', 'match'],
    summary:
      '武汉体育中心是华中高频赛演场馆，首版规则以提前到场、实名核验和轨交接驳为主。',
    entryTips: ['大型活动日建议提早到场并提前确认实名与入口规则。', '先看清主体育场与周边场馆名称再排队。', '优先公共交通和接驳方式更稳妥。'],
    prohibitedItems: ['未准备证件', '场馆名称确认错误', '临近开场才到场'],
    allowedOrConditional: ['具体安检和禁带规则请以主办方公告为准。'],
    transport: { publicTransport: '优先公共交通与园区接驳。', parking: '活动日车流集中，尽量少依赖临停。'},
    sourceNote: '武汉市政府与武汉经开区公开出行提醒',
    sources: [
      {
        title: '警方提示：演唱会出行指南来了！',
        url: 'https://www.wuhan.gov.cn/zwgk/tzgg/202509/t20250926_2653005.shtml',
        publisher: '武汉市人民政府 / 武汉市公安局',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '现在可查！刀郎武汉演唱会有公交专线了',
        url: 'https://jtj.wuhan.gov.cn/jtzx/zwdt/202503/t20250326_2558057.shtml',
        publisher: '武汉市交通运输局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'wuhan-five-rings-stadium',
    venueName: '武汉五环体育中心体育场',
    city: '武汉',
    aliases: ['武汉五环体育中心体育场', '武汉五环体育中心', '五环体育中心'],
    scenes: ['concert', 'match'],
    summary: '武汉高频赛演场馆，首版规则以提前到场和轨交接驳为主。',
    entryTips: ['大型活动日提早到场。', '先核对实名票务信息。', '优先公共交通。'],
    prohibitedItems: ['证件与票务信息不一致', '来源不明的转票'],
    allowedOrConditional: ['以当次主办方公告为准。'],
    transport: { publicTransport: '优先公共交通到场。', parking: '活动日停车压力较大。'},
    sourceNote: '武汉市政府与武汉交警公开出行提醒',
    sources: [
      {
        title: '今天2.8万人涌入武汉这里！交警提醒：出行避开这些路段',
        url: 'https://www.wuhan.gov.cn/zwgk/tzgg/202605/t20260504_2760234.shtml',
        publisher: '武汉市人民政府 / 武汉交警',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'changsha-helong-stadium',
    venueName: '长沙贺龙体育中心体育场',
    city: '长沙',
    aliases: ['长沙贺龙体育中心体育场', '贺龙体育中心体育场', '贺龙体育场'],
    scenes: ['concert', 'match'],
    summary: '长沙主流大型赛演场馆，首版规则以提前到场、实名核验和市中心接驳为主。',
    entryTips: ['热门演出日提早到场。', '优先地铁或步行接驳。', '提前确认实名规则。'],
    prohibitedItems: ['未带证件', '临近开场才找停车位'],
    allowedOrConditional: ['以主办方公告为准。'],
    transport: { publicTransport: '优先地铁和公交。', parking: '市中心大型活动日停车更紧张。'},
    sourceNote: '湖南省交通运输厅公开交通保障信息',
    sources: [
      {
        title: '长沙多举措保障“湘超”赛事期间公共交通出行',
        url: 'https://jtt.hunan.gov.cn/jtt/xxgk/gzdt/szdt1/202509/t20250909_33799853.html',
        publisher: '湖南省交通运输厅',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'xian-olympic-stadium',
    venueName: '西安奥体中心体育场',
    city: '西安',
    aliases: ['西安奥体中心体育场', '西安奥体中心', '西安奥体'],
    scenes: ['concert', 'match'],
    summary: '西北主流大型赛演场馆，首版规则以场馆确认、实名核验和轨交接驳为主。',
    entryTips: ['大型活动日先确认具体场馆和入口。', '优先公共交通。', '提早完成安检和验票。'],
    prohibitedItems: ['未确认具体场馆名称', '来源不明的转票'],
    allowedOrConditional: ['以主办方当次公告为准。'],
    transport: { publicTransport: '优先轨交和接驳。', parking: '活动日停车与离场压力较大。'},
    sourceNote: '陕西省政府与国家体育总局公开场馆信息',
    sources: [
      {
        title: '西安奥体中心：盛世“石榴花” 全民运动馆',
        url: 'https://www.shaanxi.gov.cn/xw/sxyw/202504/t20250428_3508537.html',
        publisher: '陕西省人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '智慧十四运：西安奥体中心',
        url: 'https://www.sport.gov.cn/xxzx/n5594/c24486050/part/24501099.pdf',
        publisher: '国家体育总局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'suzhou-olympic-stadium',
    venueName: '苏州奥林匹克体育中心体育场',
    city: '苏州',
    aliases: ['苏州奥林匹克体育中心体育场', '苏州奥体中心体育场', '苏州奥体'],
    scenes: ['concert', 'match'],
    summary: '长三角高频赛演场馆，首版规则以提前到场、实名核验和轨交接驳为主。',
    entryTips: ['开场前预留安检和找入口缓冲。', '提前核对实名票务信息。', '优先公共交通到场。'],
    prohibitedItems: ['证件与票务信息不一致', '压缩到场时间'],
    allowedOrConditional: ['以主办方公告为准。'],
    transport: { publicTransport: '优先轨交与接驳。', parking: '活动日停车压力较大。'},
    sourceNote: '苏州市政府与园区交警公开交通提醒',
    sources: [
      {
        title: '苏州奥体中心周边周末临时交通管理 建议观众绿色出行',
        url: 'https://www.suzhou.gov.cn/szsrmzf/dstx/202503/d3f8211b2a8c401cbf3fe919b2b847fd.shtml',
        publisher: '苏州市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '园区交警奥体中心演唱会交通安保纪实——十二万观众观演背后的倾力保障',
        url: 'https://gonganju.suzhou.gov.cn/gaj/jwdt/202511/550c7b526b014415aa33f812991784bf.shtml',
        publisher: '苏州市公安局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'tianjin-olympic-stadium',
    venueName: '天津奥林匹克中心体育场',
    city: '天津',
    aliases: ['天津奥林匹克中心体育场', '天津奥体中心体育场', '水滴'],
    scenes: ['concert', 'match'],
    summary: '京津冀高频大型赛演场馆，首版规则以实名核验和提早到场为主。',
    entryTips: ['优先公共交通和提早到场。', '提前确认检票口。', '看清具体场馆信息。'],
    prohibitedItems: ['未带证件', '未核对场馆与入口'],
    allowedOrConditional: ['以主办方当次公告为准。'],
    transport: { publicTransport: '优先公共交通。', parking: '热门活动日车流集中。'},
    sourceNote: '天津市公安局交通管理局与市体育局公开信息',
    sources: [
      {
        title: '天津市公安局交通管理局关于张韶涵觅光巡回演唱会-天津站期间对相关道路采取交通管控措施的公告',
        url: 'https://ga.tj.gov.cn/xxfb/tztg/jg1/202509/t20250929_7146021.html',
        publisher: '天津市公安局交通管理局',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '市属公共体育场馆',
        url: 'https://ty.tj.gov.cn/jmty/ggzq/tzgg2/202302/W020230204354017652379.pdf',
        publisher: '天津市体育局',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'zhengzhou-olympic-stadium',
    venueName: '郑州奥林匹克体育中心体育场',
    city: '郑州',
    aliases: ['郑州奥林匹克体育中心体育场', '郑州奥体中心体育场', '郑州奥体'],
    scenes: ['concert', 'match'],
    summary: '中原主流大型赛演场馆，首版规则以提前到场、实名核验和公共交通接驳为主。',
    entryTips: ['大型活动提前出发。', '票证信息提前准备好。', '返程路线提前规划。'],
    prohibitedItems: ['票证信息不一致', '临近开场才到场'],
    allowedOrConditional: ['以主办方公告为准。'],
    transport: { publicTransport: '优先公共交通到场。', parking: '活动日停车和离场耗时更高。'},
    sourceNote: '郑州市政府公开演唱会保障信息',
    sources: [
      {
        title: '票根经济激活城市消费新活力',
        url: 'https://www.zhengzhou.gov.cn/news7/10060015.jhtml',
        publisher: '郑州市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'beijing-national-stadium',
    venueName: '国家体育场（鸟巢）',
    city: '北京',
    aliases: ['国家体育场', '鸟巢', '北京鸟巢'],
    scenes: ['concert', 'match'],
    summary: '全国顶级大型赛演场馆，首版规则以实名核验、提早到场和周边接驳为主。',
    entryTips: ['大型活动务必提前到场。', '先确认检票口和安检区域。', '优先地铁和步行接驳。'],
    prohibitedItems: ['未带证件', '来源不明的转票', '压着开场时间到场'],
    allowedOrConditional: ['以主办方当次公告为准。'],
    transport: { publicTransport: '优先地铁和步行接驳。', parking: '核心活动日停车和安保都更严格。'},
    sourceNote: '北京市政府公开大型活动保障信息',
    sources: [
      {
        title: '“四馆两场”今年拟办300场大型活动 警方优化入场模式提升观演体验',
        url: 'https://www.beijing.gov.cn/fuwu/bmfw/sy/jrts/202604/t20260406_4574871.html',
        publisher: '北京市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '2025年上半年北京举办大型活动1158场次 累计接待观众986.9万人次 演唱会数万名观众如何“丝滑”离场',
        url: 'https://www.beijing.gov.cn/ywdt/yaowen/202507/t20250722_4154369.html',
        publisher: '北京市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'beijing-workers-stadium',
    venueName: '北京工人体育场',
    city: '北京',
    aliases: ['北京工人体育场', '工体'],
    scenes: ['concert', 'match'],
    summary: '北京核心赛演场馆，首版规则以市中心拥堵、实名核验和地铁接驳为主。',
    entryTips: ['市中心活动日提早出发。', '优先地铁接驳。', '实名规则和入口提前确认。'],
    prohibitedItems: ['未带证件', '依赖现场找停车位'],
    allowedOrConditional: ['以主办方公告为准。'],
    transport: { publicTransport: '优先地铁与步行接驳。', parking: '中心城区活动日停车极不稳定。'},
    sourceNote: '北京市政府公开大型活动保障信息',
    sources: [
      {
        title: '北京“一馆一策”安全管理模式升级 大型活动首创“分色入场”',
        url: 'https://www.beijing.gov.cn/ywdt/gzdt/202505/t20250514_4088541.html',
        publisher: '北京市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '“传统外观、现代场馆”工体保护性改造复建进入地上施工阶段 “新工体”与地铁无缝衔接',
        url: 'https://www.beijing.gov.cn/ywdt/gzdt/202108/t20210828_2479048.html',
        publisher: '北京市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
  {
    venueId: 'hangzhou-olympic-gymnasium',
    venueName: '杭州奥体中心体育馆',
    city: '杭州',
    aliases: ['杭州奥体中心体育馆', '杭州奥体体育馆', '小莲花'],
    scenes: ['concert', 'match'],
    summary: '杭州高频室内大型赛演场馆，首版规则以场馆确认、实名核验和提早到场为主。',
    entryTips: ['先确认去的是体育场还是体育馆。', '提早到场更稳妥。', '实名票务信息提前准备。'],
    prohibitedItems: ['票证信息不一致', '走错场馆'],
    allowedOrConditional: ['以主办方公告为准。'],
    transport: { publicTransport: '优先公共交通。', parking: '奥体片区活动日停车压力较大。'},
    sourceNote: '杭州市政府与文广旅局公开场馆信息',
    sources: [
      {
        title: '杭州奥体中心',
        url: 'https://wgly.hangzhou.gov.cn/art/2022/12/14/art_1229707572_58943449.html',
        publisher: '杭州市文化广电旅游局',
        lastVerified: RULES_LAST_VERIFIED,
      },
      {
        title: '杭州奥体中心场馆群打通了',
        url: 'https://www.hangzhou.gov.cn/art/2024/5/11/art_812269_59096831.html',
        publisher: '杭州市人民政府',
        lastVerified: RULES_LAST_VERIFIED,
      },
    ],
  },
]

function listVenueRules() {
  return venueRules.map((rule) => ({
    venueId: rule.venueId,
    venueName: rule.venueName,
    city: rule.city,
    scenes: rule.scenes,
    summary: rule.summary,
    lastVerified: RULES_LAST_VERIFIED,
    sources: rule.sources,
  }))
}

function findVenueRule(input) {
  const normalizedInputVenue = normalizeVenueName(input.venue)
  if (!normalizedInputVenue) {
    return null
  }

  const rawInputVenue = String(input.venue || '').trim()
  const normalizedCity = normalizeVenueName(input.city)

  for (const rule of venueRules) {
    const normalizedAliases = rule.aliases.map((alias) => normalizeVenueName(alias))
    const exactMatch =
      normalizedAliases.includes(normalizedInputVenue) ||
      rule.aliases.includes(rawInputVenue) ||
      normalizeVenueName(rule.venueName) === normalizedInputVenue

    const fuzzyMatch =
      !exactMatch &&
      normalizedAliases.some((alias) => normalizedInputVenue.includes(alias) || alias.includes(normalizedInputVenue))

    if (!exactMatch && !fuzzyMatch) {
      continue
    }

    if (normalizedCity && normalizeVenueName(rule.city) !== normalizedCity) {
      continue
    }

    if (rule.scenes.length > 0 && input.sceneType && !rule.scenes.includes(input.sceneType)) {
      continue
    }

    return {
      matched: true,
      matchType: exactMatch ? 'exact' : 'fuzzy',
      venueId: rule.venueId,
      venueName: rule.venueName,
      city: rule.city,
      sceneLabel: sceneLabel(input.sceneType),
      summary: rule.summary,
      entryTips: rule.entryTips,
      prohibitedItems: rule.prohibitedItems,
      allowedOrConditional: rule.allowedOrConditional,
      transport: rule.transport,
      sourceNote: rule.sourceNote,
      sources: rule.sources,
      lastVerified: RULES_LAST_VERIFIED,
    }
  }

  return null
}

module.exports = {
  findVenueRule,
  listVenueRules,
  RULES_LAST_VERIFIED,
}
