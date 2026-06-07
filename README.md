# 一站式赴约小管家

当前这套项目已经具备可用的前后端闭环，并且接入了真实 AI 生成、场馆规则匹配和线上正式部署能力。

- `yueyue-client`：React 前端
- `yueyue-server`：Node / Express 后端

## 当前能力

- 首页场景选择
- 创建赴约计划表单
- AI 生成赴约手册
- 场馆规则预览与命中
- 赴约手册详情页
- 我的安排与分享页
- Railway 正式线上地址
- Postgres 数据持久化

## 本地启动

### 1. 启动后端

```bash
cd yueyue-server
npm install
copy .env.example .env
```

在 `.env` 中至少填写：

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4-mini
```

如果你本地也想接数据库，可以再补：

```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

然后启动：

```bash
npm run dev
```

### 2. 启动前端

```bash
cd yueyue-client
npm install
npm run dev
```

### 3. 访问地址

- 前端：[http://localhost:5173](http://localhost:5173)
- 后端健康检查：[http://localhost:4000/api/health](http://localhost:4000/api/health)

## 线上地址

- 正式站点：[https://yueyue-web-production.up.railway.app](https://yueyue-web-production.up.railway.app)

## 当前存储模式

- 本地默认：内存存储
- 线上 Railway：Postgres 持久化存储

当 `DATABASE_URL` 存在时，服务会自动初始化数据库表并改用 Postgres。

## 下一步建议

1. 继续补追星助手专属模块，例如穿搭、物料、搭子、散场返程的细化页面
2. 接入你自己的品牌域名
3. 增加后台管理、反馈纠错和场馆规则维护能力
