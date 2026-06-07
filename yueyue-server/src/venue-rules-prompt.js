function buildVenueRulesPromptBlock(venueRule) {
  if (!venueRule) {
    return ''
  }

  const sourceList = venueRule.sources
    .map((item) => `- ${item.title}（${item.publisher}，核验日期 ${item.lastVerified}）`)
    .join('\n')
  const prohibitedList = venueRule.prohibitedItems.map((item) => `- ${item}`).join('\n')
  const conditionalList = venueRule.allowedOrConditional.map((item) => `- ${item}`).join('\n')
  const entryTips = venueRule.entryTips.map((item) => `- ${item}`).join('\n')

  return [
    '',
    '已命中的场馆官方规则：',
    `- 场馆：${venueRule.venueName}`,
    `- 城市：${venueRule.city}`,
    `- 命中方式：${venueRule.matchType === 'exact' ? '精确匹配' : '模糊匹配'}`,
    `- 规则摘要：${venueRule.summary}`,
    `- 交通与停车：${venueRule.transport.publicTransport}；${venueRule.transport.parking}`,
    '- 入场与当天提醒：',
    entryTips,
    '- 官方明确禁带物品：',
    prohibitedList,
    '- 允许或需额外留意：',
    conditionalList,
    '- 官方来源：',
    sourceList,
    '',
    '请优先遵循以上官方规则生成结果：',
    '1. 风险提醒和清单必须优先覆盖已命中的官方禁带与入场要求。',
    '2. 不要输出与官方规则冲突的建议。',
    '3. 如引用来源，请优先写场馆官方名称，不要写模糊来源。',
  ].join('\n')
}

module.exports = {
  buildVenueRulesPromptBlock,
}
