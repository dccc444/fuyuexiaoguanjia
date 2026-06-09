# Complete MVP Features Spec

## Why
基于 `MVP_TODO_LIST.md`，目前项目已完成基础的“生成赴约作战书”闭环，但仍缺失核心的 P0 体验闭环（如赴约成功率评分、现场指挥中心、纠错机制、核心场馆扩充）以及 P1 级别的体验增强和简单的后台管理功能。为了让产品真正达到可用的 MVP 状态并具有更好的用户体验，需要全面落实这些待办项。

## What Changes
- **P0 核心闭环补齐**：
  - 增加赴约成功率评分与提分建议。
  - 增加现场指挥中心（倒计时、清单打卡、天气/补给提醒）。
  - 增加用户纠错与反馈收集功能（前后端）。
  - 扩充北京、上海、杭州、成都、广深的核心场馆规则数据。
- **P1 产品体验增强**：
  - 增加票务助手功能（未购票时的抢票/避坑指南）。
  - 增加多场景（演唱会/音乐节/球赛）差异化定制与样式。
  - 增加简易的后台管理系统用于查看反馈和修改规则。

## Impact
- Affected specs: 赴约计划生成逻辑、UI 渲染逻辑、用户交互反馈。
- Affected code:
  - 前端：`src/pages/BattleBookPage.jsx`, `src/components/BattleBookView.jsx`, `src/pages/CreatePlanPage.jsx` 等。
  - 后端：`src/generator.js`, `src/server.js`, `src/venue-rules.js` 等。

## ADDED Requirements
### Requirement: 赴约成功率评分机制
The system SHALL provide a success rate score between 0-100 and actionable improvement tips for the battle book.

### Requirement: 现场指挥中心
The system SHALL provide a "Today's Mode" view containing dynamic countdowns, a checklist, and weather/supply reminders.

### Requirement: 用户反馈与纠错
The system SHALL allow users to submit rule corrections, and the backend SHALL store these feedbacks.

### Requirement: 票务助手
The system SHALL ask if the user has purchased a ticket and provide specific ticketing advice if they haven't.

### Requirement: 简易后台管理
The system SHALL provide an admin endpoint/page to view user feedbacks.
