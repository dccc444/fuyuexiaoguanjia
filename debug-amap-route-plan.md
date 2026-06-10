# Debug Session: amap-route-plan
- **Status**: [OPEN]
- **Issue**: 高德 Key 已接入，但 geocode 与 route-plan 返回异常，输入提示可用。
- **Debug Server**: pending
- **Log File**: .dbg/trae-debug-log-amap-route-plan.ndjson

## Reproduction Steps
1. 启动后端服务并加载 `.env` 中的 `AMAP_WEB_KEY`
2. 调用 `/api/maps/place-suggestions?q=上海体育场&city=上海`
3. 调用 `/api/maps/geocode` 或 `/api/maps/route-plan`
4. 观察高德原始响应与本地接口返回

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | 高德接口参数名或编码方式不对 | High | Low | Pending |
| B | Key 仅对部分接口可用，geocode / route 受限 | Med | Low | Pending |
| C | 高德原始报文包含更具体错误，但当前映射丢失 | High | Low | Pending |
| D | geocode 失败导致 route-plan 连带失败 | High | Low | Pending |
| E | Node 侧解析高德返回结构时存在边界问题 | Med | Med | Pending |

## Log Evidence
- Pending

## Verification Conclusion
- Pending
