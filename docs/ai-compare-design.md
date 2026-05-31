# AI 模型对比功能设计文档

## 产品决策（已确认）

| 项 | 决策 |
|---|---|
| 对比范围 | MVP 仅纯 LLM 文本对比 |
| 默认平台 | DeepSeek + 豆包 + 通义千问 |
| 数量限制 | 2～4 个平台 |
| 模型选择 | 用户只选平台，各平台自动使用默认模型 |
| 入口 | 现有聊天页开关 |
| 历史 | 持久化保留对比历史 |
| 参数策略 | 各模型使用各自默认参数 |

## 架构

```
聊天页开关 → compareStore → 并行 ClientApi.llm.chat → 多列 ComparePanel
                ↓
         compareHistory（IndexedDB 持久化）
                ↓
         ChatSession.messages（compare 类型消息）
```

## 数据模型

- `ComparePlatform`：平台配置（provider + displayName + defaultModel）
- `selectedProviders`：用户勾选的平台列表
- `CompareColumnResult`：单列生成结果（status / content / error / latencyMs）
- `CompareHistoryItem`：历史记录（sessionId + prompt + columns + createdAt）

## 文件结构

```
app/store/compare.ts              # 状态与并行调度
app/components/compare/
  compare-panel.tsx               # 多列并排展示
  platform-selector.tsx           # 平台勾选（内联展示）
  compare-history-modal.tsx       # 历史记录浏览
```

## MVP 验收标准

- [ ] 聊天页可开关对比模式
- [ ] 默认三模型，可选 2～4 个
- [ ] 一次输入并行请求，各列独立流式
- [ ] 单列失败不影响其他列
- [ ] 支持复制、单列重试、停止
- [ ] 对比历史持久化并可浏览
- [ ] 各模型使用独立默认参数（standalone config）

## 后续迭代

- 文本 diff 高亮
- 盲测模式
- AI 裁判评分
- 文生图对比
