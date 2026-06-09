# Tasks
- [x] Task 1: 赴约成功率评分机制 (P0)
  - [x] SubTask 1.1: 修改 `yueyue-server/src/generator.js` 的 prompt，要求 AI 输出 `successScore` (0-100) 和 `improvementTips` (数组，1-2条)。
  - [x] SubTask 1.2: 修改 `yueyue-client/src/components/BattleBookView.jsx`，在顶部增加环形进度条或显著的评分展示，并展示提分建议。
- [x] Task 2: 现场指挥中心（活动当天行动面板） (P0)
  - [x] SubTask 2.1: 修改后端 AI prompt，使其返回现场检查清单 `checklist` 数据结构（如证件、门票、充电宝等）。
  - [x] SubTask 2.2: 在 `yueyue-client/src/pages/BattleBookPage.jsx` 和 `yueyue-client/src/pages/SharedBattleBookPage.jsx` 中增加“切换到当天模式/现场指挥中心”的按钮。
  - [x] SubTask 2.3: 开发 `CommandCenterView.jsx` 组件，展示动态倒计时、可勾选的 Checklist、天气与补给提醒。
- [x] Task 3: 用户反馈与纠错机制 (P0)
  - [x] SubTask 3.1: 在后端 `yueyue-server/src/server.js` 中新增 `/api/feedbacks` 的 POST 接口，并将数据存入 `database.js` 或 `data.js`。
  - [x] SubTask 3.2: 在前端手册详情页或场馆规则模块下方增加“我要纠错”按钮，并实现轻量级反馈弹窗，提交至后端接口。
- [x] Task 4: 核心场馆规则库扩充 (P0)
  - [x] SubTask 4.1: 在 `yueyue-server/src/venue-rules.js` 中补充北京、上海、杭州、成都、广深等核心场馆的数据。
- [x] Task 5: 票务助手模块 (P1)
  - [x] SubTask 5.1: 前端 `CreatePlanPage.jsx` 增加“是否已购票”选项，传递给后端。
  - [x] SubTask 5.2: 后端 AI prompt 根据“是否已购票”输出相应的票务建议，前端予以展示。
- [x] Task 6: 多场景深度定制 (P1)
  - [x] SubTask 6.1: 后端细化 AI prompt，针对不同场景（演唱会、球赛）增加针对性提醒（应援物/防冲突）。
  - [x] SubTask 6.2: 前端根据场景类型，切换不同的主题色或背景图，强化场景差异。
- [x] Task 7: 简易后台管理系统 (P1)
  - [x] SubTask 7.1: 后端增加 `/api/admin/feedbacks` 接口以获取反馈列表。
  - [x] SubTask 7.2: 前端开发一个 `/admin` 页面，展示反馈列表。

# Task Dependencies
- Task 2 depends on Task 1 (Both modify generator.js and BattleBookView structure)
- Task 5 depends on Task 2 (Modifies generator.js & CreatePlanPage)
- Task 6 depends on Task 5 (Modifies generator.js)
- Task 7 depends on Task 3 (Admin needs feedbacks API)
