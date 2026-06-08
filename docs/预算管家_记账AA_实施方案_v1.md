# 预算管家 + AI 记账 & AA 分账实施方案 v1

## 1. 目标

先把公共模块里最刚需的 2 个能力做成一个可用闭环：

1. `预算管家`
   用户输入总预算后，系统按票务、交通、住宿、餐饮、物料购物、备用金 6 类自动分配，也支持手动改。

2. `AI 记账 & AA 分账`
   用户可以给一场赴约添加同行人、记录每一笔支出、选择谁付款/谁参与，系统自动给出结算结果。

这版先不追求“接微信/支付宝真分账”，先把：

- 预算创建
- 预算分配
- 实时支出统计
- 超支提示
- AA 结算清单

做完整。

---

## 2. 页面规划

### 2.1 新增页面

`/money/:battleBookId`

页面名称：
`预算与记账`

页面结构：

1. 顶部概览
   - 活动名称
   - 城市 / 场馆 / 日期
   - 总预算
   - 已花金额
   - 剩余金额
   - AA 待结算人数

2. 预算管家区
   - 总预算输入
   - 自动分配按钮
   - 六大分类预算卡
   - 超支提醒

3. 同行人区
   - 当前同行人列表
   - 添加同行人
   - 标记“我自己”

4. 记账区
   - 新增支出表单
   - 支出分类
   - 金额
   - 谁付款
   - 谁参与分摊
   - 备注

5. 支出列表区
   - 按时间倒序
   - 可删除
   - 可看分类和付款人

6. AA 结算区
   - 每个人应付 / 已付 / 还差
   - 推荐结算关系
   - 复制结算文案

---

## 3. 与现有页面的接入

### 3.1 手册页

在手册页新增按钮：

- `打开预算与记账`

目标：
让用户从当前赴约手册直接进入这场活动的花费管理。

### 3.2 我的安排页

在每张卡片新增按钮：

- `预算记账`

目标：
从历史安排直接进入对应活动的预算与记账页。

---

## 4. 数据表规划

## 4.1 `budget_plans`

用途：
一场赴约对应一份预算方案。

字段：

- `id`
- `battle_book_id`
- `user_id`
- `currency`
- `total_budget`
- `scene_type`
- `status`
- `payload`
- `created_at`
- `updated_at`

`payload` 内建议结构：

```json
{
  "categories": {
    "ticket": 1200,
    "transport": 500,
    "stay": 700,
    "food": 300,
    "merch": 400,
    "buffer": 300
  },
  "strategy": "balanced",
  "notes": ""
}
```

---

## 4.2 `expense_books`

用途：
一场赴约对应一本账。

字段：

- `id`
- `battle_book_id`
- `user_id`
- `title`
- `currency`
- `created_at`
- `updated_at`

---

## 4.3 `expense_members`

用途：
账本里的参与人。

字段：

- `id`
- `expense_book_id`
- `name`
- `role`
- `pay_channel`
- `is_owner`
- `created_at`

---

## 4.4 `expense_items`

用途：
每一笔支出。

字段：

- `id`
- `expense_book_id`
- `title`
- `category`
- `amount`
- `paid_by_member_id`
- `split_mode`
- `participant_member_ids`
- `occurred_at`
- `note`
- `created_at`

分类固定值：

- `ticket`
- `transport`
- `stay`
- `food`
- `merch`
- `other`

---

## 5. 接口规划

## 5.1 预算相关

### `GET /api/battle-books/:id/budget`

返回当前活动预算。

### `POST /api/battle-books/:id/budget`

创建或更新预算。

请求体：

```json
{
  "totalBudget": 3400,
  "strategy": "balanced",
  "categories": {
    "ticket": 1200,
    "transport": 500,
    "stay": 700,
    "food": 300,
    "merch": 400,
    "buffer": 300
  }
}
```

### `POST /api/battle-books/:id/budget/suggest`

按活动类型给出建议预算分配。

---

## 5.2 记账相关

### `GET /api/battle-books/:id/expense-book`

返回当前活动账本、成员、支出、统计、AA 结算。

### `POST /api/battle-books/:id/expense-book`

创建账本。

### `POST /api/expense-books/:id/members`

新增成员。

### `DELETE /api/expense-members/:id`

删除成员。

### `POST /api/expense-books/:id/items`

新增支出。

### `DELETE /api/expense-items/:id`

删除支出。

### `GET /api/expense-books/:id/settlement`

返回 AA 结算结果。

---

## 6. 前端状态流

进入 `/money/:battleBookId` 后：

1. 拉取手册基础信息
2. 拉取预算
3. 拉取账本
4. 若没有预算，则展示空状态并引导“先定总预算”
5. 若没有账本，则自动创建默认账本

核心交互顺序：

1. 先定预算
2. 再加同行人
3. 再记第一笔支出
4. 最后看 AA 结果

---

## 7. 自动分配规则 v1

### 演唱会 / 音乐节

- `ticket` 35%
- `transport` 18%
- `stay` 20%
- `food` 10%
- `merch` 12%
- `buffer` 5%

### 球赛

- `ticket` 28%
- `transport` 20%
- `stay` 18%
- `food` 12%
- `merch` 10%
- `buffer` 12%

用户后续仍可手动改。

---

## 8. AA 结算规则 v1

每笔支出记录：

- 谁付款
- 哪些人参与平摊

计算逻辑：

1. 统计每个人实际支付金额
2. 统计每个人应承担金额
3. `实际支付 - 应承担` 得出净额
4. 正数表示应收，负数表示应补
5. 自动生成最少转账路径

示例：

- A 多付 200
- B 少付 120
- C 少付 80

则输出：

- B 转 A 120
- C 转 A 80

---

## 9. 开发顺序

## 第一步

后端打底：

1. 建表
2. 存储层
3. 预算接口
4. 记账接口
5. 结算计算函数

## 第二步

前端第一版：

1. 新增 `/money/:battleBookId`
2. 预算区
3. 成员区
4. 记账区
5. AA 结算区

## 第三步

接入现有页面：

1. 手册页入口
2. 我的安排页入口

---

## 10. 第一版验收标准

做到以下 8 条就算第一版完成：

1. 能从手册页进入预算与记账页
2. 能从我的安排进入预算与记账页
3. 能创建预算
4. 能自动分配预算
5. 能添加同行人
6. 能添加支出
7. 能实时看已花 / 剩余 / 超支
8. 能生成 AA 结算清单
