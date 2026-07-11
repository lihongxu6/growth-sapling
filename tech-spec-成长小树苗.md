# 「成长小树苗」技术方案（MVP 前端）

> **文档性质**：前端技术实现说明书，供研发同学直接照搬实现。
> **关联文档**：`prd-成长小树苗-mvp.md`（需求真源）→ `design-spec-成长小树苗.md`（视觉 SSOT）→ `ui-mockup-成长小树苗.html`（高保真视觉稿）→ **本文档**（技术方案）
> **目标平台**：微信小程序原生（WXML + WXSS + JS/TS）
> **本轮范围**：仅前端。数据持久化方案为 localStorage（H5 演示期），转小程序时切换为 wx.setStorageSync。

---

## 1. 架构概览

```
┌─────────────────────────────────────────────┐
│                   App 入口                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐  │
│  │ Splash  │  │  Pages  │  │   Overlays   │  │
│  │ 开屏页   │  │ 三 Tab  │  │ 日历/表单/确认│  │
│  └─────────┘  └─────────┘  └─────────────┘  │
│                    │                         │
│  ┌─────────────────▼───────────────────────┐ │
│  │           数据层（Data Layer）            │ │
│  │  Store（内存 SSOT） + Storage（持久化）   │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**技术选型理由**：
- 微信小程序原生：零额外依赖，与视觉稿 Token 1:1 映射（WXSS ≈ CSS），组件结构直接对应。
- 数据层自建轻量 Store：MVP 数据量小（< 50 条 checkins/月），无需引入 MobX/Redux。
- localStorage → wx.setStorageSync 迁移路径：API 签名一致，切换仅改 `storage.get/set` 两处调用。

---

## 2. 目录结构

```
growth-sapling/
├── app.js                          # 入口：全局数据初始化、splash 控制
├── app.wxss                        # 全局样式：Design Token（§2.1）
├── app.json                        # 路由 + TabBar 配置
├── pages/
│   ├── home/                       # 打卡页（默认 Tab）
│   │   ├── home.wxml
│   │   ├── home.wxss
│   │   └── home.js
│   ├── stats/                      # 统计页
│   │   ├── stats.wxml
│   │   ├── stats.wxss
│   │   └── stats.js
│   └── tasks/                      # 任务管理页
│       ├── tasks.wxml
│       ├── tasks.wxss
│       └── tasks.js
├── components/
│   ├── task-card/                  # 任务卡片（打卡页用）
│   ├── task-mgmt-card/             # 任务管理卡片（编辑/删除）
│   ├── progress-bar/               # 进度条
│   ├── cal-grid/                   # 日历热力图
│   ├── badge-wall/                 # 徽章墙
│   ├── week-ring/                  # 本周完成率环形图
│   ├── confirm-modal/              # 确认弹窗（撤销/删除）
│   ├── task-form-modal/            # 添加/编辑任务表单
│   ├── cal-overlay/                # 日历选择弹层
│   ├── toast/                      # Toast 提示
│   ├── celebration-overlay/        # 全部完成庆祝
│   ├── badge-animation/            # 徽章获得动画
│   └── empty-state/                # 空状态（含果果占位）
├── store/
│   ├── index.js                    # Store 入口：初始化 + 全局状态
│   ├── tasks.js                    # 任务 CRUD
│   ├── checkins.js                 # 打卡记录读写
│   ├── badges.js                   # 徽章判定
│   └── stats.js                    # 统计计算（连续天数、星星、完成率）
├── utils/
│   ├── storage.js                  # 持久化适配层（localStorage / wx.setStorageSync）
│   ├── date.js                     # 日期工具（isoOf、dateOfIso、fmtDate、星期计算）
│   └── constants.js                # 常量（徽章定义、图标集、默认任务等）
└── assets/
    └── icons/                      # 手绘图标（后续替换 emoji）
```

---

## 3. 数据模型（前端 Store）

> 前端 Store 是 UI 的唯一数据源（SSOT）。与 PRD §9 云数据库模型对齐，但增加前端特有字段。

### 3.1 tasks（任务列表）

```js
// store/tasks.js
let tasks = [
  {
    id: 1,                           // 自增 ID（localStorage 场景；云开发用 _id string）
    icon: '📖',                      // 图标标识
    name: '每日阅读30分钟',           // 任务名称，最长 20 字
    purpose: '认识更多字',            // 任务意义，选填，最长 50 字
    repeat_type: 'daily',            // 'daily' | 'weekday' | 'weekend' | 'custom'
    repeat_days: [],                 // custom 时：[1,3,5] 表示周一三五
    sort_order: 1,                   // 排序
    is_deleted: false,               // 软删除
    created_at: '2026-07-01T00:00:00.000Z'
  }
  // ...
];
```

### 3.2 checkins（打卡记录）

```js
// store/checkins.js
// 结构：{ [dateIso]: { [taskId]: checkinRecord } }
let checkinsByDate = {
  '2026-07-01': {
    1: { task_id: 1, done: true, backfill: false, created_at: '...' },
    2: { task_id: 2, done: true, backfill: false, created_at: '...' },
    // ...
  }
};
```

**设计理由**：`{ date → { taskId → record } }` 两层索引比扁平数组更适合前端场景：
- O(1) 查某天某任务状态
- O(1) 查某天全部打卡数
- 直接映射到日历热力图渲染

### 3.3 badges（徽章状态）

```js
// store/badges.js
const BADGE_DEFS = [
  { type: 'sprout',       name: '新芽初绽', icon: '🌱', threshold: 7,    unit: 'stars' },
  { type: 'growing',      name: '小有所成', icon: '🌿', threshold: 30,   unit: 'stars' },
  { type: 'thriving',     name: '枝繁叶茂', icon: '🪴', threshold: 100,  unit: 'stars' },
  { type: 'harvest',      name: '硕果累累', icon: '🍎', threshold: 365,  unit: 'stars' },
  { type: 'week_streak',  name: '连续打卡', icon: '🔥', threshold: 7,    unit: 'streak_days' },
  { type: 'month_streak', name: '满月打卡', icon: '🌕', threshold: 30,   unit: 'streak_days' },
  { type: 'star_hundred', name: '百颗星',  icon: '🏅', threshold: 100,  unit: 'stars' },
];
```

### 3.4 全局状态（app 级）

```js
// store/index.js
let state = {
  viewDate: '2026-07-11',            // 当前查看的日期（ISO），默认今天
  today:    '2026-07-11',            // 今天（不变）
  splashDone: false,                 // 开屏动画是否完成
  activeTab: 'home',                 // 当前 Tab
  calMonth: 6,                       // 日历当前月（0-based）
  calYear:  2026,
};
```

### 3.5 持久化策略

| 数据 | 持久化 | 理由 |
|------|--------|------|
| tasks | ✅ localStorage | 用户核心数据，必须持久化 |
| checkinsByDate | ✅ localStorage | 打卡记录，必须持久化 |
| badges 获得记录 | ✅ localStorage | 徽章不因刷新丢失 |
| viewDate / calMonth / calYear | ❌ 不持久化 | 每次打开默认今天 + 当前月 |
| splashDone | ❌ 不持久化 | 每次打开都播 splash |

**迁移路径**：
```
H5 Demo (localStorage)          微信小程序 (wx.setStorageSync)
─────────────────────    →     ─────────────────────────────
storage.get(key)                wx.getStorageSync(key)
storage.set(key, val)           wx.setStorageSync(key, val)
storage.remove(key)             wx.removeStorageSync(key)
```

> `utils/storage.js` 封装适配层，业务代码不直接调用底层 API。

---

## 4. 组件树与状态矩阵

### 4.1 完整组件树

```
App
├── Splash（开屏页，z-index: 70）
│   └── 条件渲染：splashDone === false
│
├── Pages（主内容区，三 Tab 切换）
│   ├── home（打卡页）
│   │   ├── StatusBar（44px 安全区）
│   │   ├── HomeHeader（🔥 连续天数 | ⭐ 星星数 | 📅 日期）
│   │   │   └── calOverlay（日历弹层，z-index: 50）
│   │   ├── BackfillBanner（补卡模式提示条，条件渲染）
│   │   ├── ProgressBar（已完成 X/N）
│   │   ├── TaskCard × N（任务卡片列表）
│   │   │   └── 状态：待打卡 / 已完成 / 补卡
│   │   └── EmptyState（空状态，条件渲染）
│   │
│   ├── stats（统计页）
│   │   ├── StatusBar
│   │   ├── StreakDisplay（🔥 连续 X 天 + 最长 X 天）
│   │   ├── WeekRing（本周完成率环形图）
│   │   ├── CalGrid（月历热力图）
│   │   ├── BadgeWall（徽章墙 2×4）
│   │   └── EmptyState
│   │
│   └── tasks（任务管理页）
│       ├── StatusBar
│       ├── TaskMgmtCard × N（编辑/删除）
│       ├── AddButton（➕ 添加任务）
│       ├── TaskFormModal（添加/编辑表单弹层）
│       └── EmptyState
│
├── ConfirmModal（全局确认弹窗，z-index: 50）
├── Toast（全局提示，z-index: 40）
├── CelebrationOverlay（全部完成庆祝，z-index: 60）
├── BadgeAnimation（徽章获得动画，z-index: 60）
└── TabBar（底部导航，常驻贴底）
```

### 4.2 状态矩阵

| 页面 | 状态 | 触发条件 | 视觉表现 |
|------|------|----------|----------|
| **打卡页** | 正常态 | 有任务 + 部分完成 | 任务卡片白底/绿底混排 |
| | 全部完成 | `done === total` 且 `viewDate === today` | 触发庆祝动画 + 🔥 发光 |
| | 补卡模式 | `viewDate < today` | 淡黄 banner + 补卡标签 |
| | 空状态 | `tasks.length === 0` | 果果招手 + 引导文案 |
| | 休息日 | 有任务但今日无安排 | "今天没有安排任务，好好休息吧～" |
| **统计页** | 正常态 | 有打卡记录 | 日历热力 + 徽章墙 |
| | 空状态 | 无任何打卡记录 | 果果鼓励 + "坚持打卡..." |
| | 徽章全灰 | 无徽章获得 | 所有徽章灰态 + 锁 |
| **任务页** | 正常态 | 1-5 个任务 | 任务管理卡片列表 |
| | 空状态 | 0 个任务 | 果果引导 |
| | 达上限 | 6 个任务 | 添加按钮置灰 + "最多添加6个任务" |
| **徽章** | 未获得 | 条件不满足 | 灰色 + 锁图标 |
| | 已持有 | 条件满足 | 彩色 + 发光边框 |
| | 获得动画 | 刚满足条件 | 灰→彩 1500ms 动画 |

---

## 5. 核心事件流

### 5.1 打卡流程

```
用户点击任务卡片
    │
    ├── task.done === false（未完成 → 打卡）
    │   ├── task.done = true
    │   ├── viewDate < today → task.backfill = true
    │   ├── checkinsByDate[viewDate][taskId] = { done: true, backfill, created_at }
    │   ├── persist() 写 localStorage
    │   ├── 星星数 +1 → renderHome()
    │   ├── 全部完成 && viewDate === today → 触发庆祝动画
    │   └── showToast('打卡成功！⭐+1')
    │
    └── task.done === true（已完成 → 撤销）
        ├── 弹出 ConfirmModal（区分"打卡"或"补卡"动词）
        ├── 用户确认 → task.done = false, task.backfill = false
        ├── delete checkinsByDate[viewDate][taskId]
        ├── persist()
        ├── 星星数 -1 → 重新判定徽章 → renderHome()
        └── 用户取消 → 无操作
```

### 5.2 日期切换流程（pickDate）

```
用户点击日历某天（d）
    │
    ├── viewDate !== today → saveSnapshot(viewDate)  // 保存当前日任务快照
    ├── viewDate = isoOf(new Date(calYear, calMonth, d))
    │
    ├── viewDate !== today && homeTasksByDate[viewDate] 存在
    │   └── loadSnapshot(viewDate)  // 恢复历史快照
    │
    ├── viewDate !== today && homeTasksByDate[viewDate] 不存在
    │   ├── 从 checkinsByDate[viewDate] 重建任务状态
    │   ├── 按 done 数量取前 N 个任务标记完成
    │   └── saveSnapshot(viewDate)
    │
    └── viewDate === today
        └── loadSnapshot(today)  // 恢复今日快照
    │
    └── switchTab('home') + renderHome()
```

### 5.3 徽章判定流程

```
每次打卡/撤销后触发 checkBadges()
    │
    ├── 计算当前 stars = calcStars()
    ├── 计算当前 streak = calcStreak()
    ├── 遍历 BADGE_DEFS
    │   ├── 阈值已满足 && 未获得 → awardBadge(type)
    │   │   └── 弹出 BadgeAnimation（1500ms 全屏动画）
    │   └── 阈值不再满足 && 已持有 → revokeBadge(type)
    │       └── badges[type].is_active = false（彩→灰 600ms）
    └── persist()
```

---

## 6. 关键计算函数

### 6.1 星星总数

```js
// store/stats.js
function calcStars() {
  const base = 7;
  let total = 0;
  // 历史日打卡数
  Object.values(checkinsByDate).forEach(dayCheckins => {
    total += Object.values(dayCheckins).filter(c => c.done).length;
  });
  return base + total;
}
```

### 6.2 连续天数

```js
function calcStreak() {
  let streak = 0;
  const d = new Date(today);
  while (true) {
    const iso = isoOf(d);
    const dayCheckins = checkinsByDate[iso];
    // 今天用 homeTasks 实时计算
    const doneCount = (iso === today)
      ? homeTasks.filter(t => t.done).length
      : (dayCheckins ? Object.values(dayCheckins).filter(c => c.done).length : 0);
    if (doneCount === 0) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
```

### 6.3 本周完成率

```js
function calcWeekRate() {
  const todayDow = new Date(today).getDay(); // 0=周日
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - (todayDow === 0 ? 6 : todayDow - 1)); // 本周一
  let doneTotal = 0, taskTotal = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const iso = isoOf(d);
    if (iso === today) {
      doneTotal += homeTasks.filter(t => t.done).length;
      taskTotal += homeTasks.length;
    } else if (checkinsByDate[iso]) {
      const records = Object.values(checkinsByDate[iso]);
      doneTotal += records.filter(c => c.done).length;
      taskTotal += records.length;
    }
  }
  return taskTotal === 0 ? 0 : Math.round(doneTotal / taskTotal * 100);
}
```

---

## 7. 动效实现清单

| 动画 | 实现方式 | 参数 | 降级方案 |
|------|----------|------|----------|
| 打卡星星迸发 | CSS `@keyframes` + 3-5 个绝对定位 ⭐ | 600ms ease-out，透明度 1→0，向外扩散 | 低端机跳过，仅更新数字 |
| 星星数 +1 弹跳 | CSS `transform: scale(1→1.3→1)` | 200ms ease-out | 无动画，直接更新 |
| 全部完成庆祝 | WXML 条件渲染 + CSS scale+swing | 1500ms ease-in-out | 低端机缩短至 800ms |
| 徽章点亮 | CSS filter grayscale→none + 光效扩散 | 1500ms ease-out | 直接切换彩色态 |
| 徽章回收 | CSS filter none→grayscale + scale(1→0.9) | 600ms ease-in-out | 直接切换灰色态 |
| 卡片状态切换 | CSS `transition: background-color` | 300ms ease-out | 无动画（WXSS transition 天然支持） |
| 日历月切换 | WXSS transition + translateX | 300ms ease-in-out | 无动画 |
| Splash 淡出 | CSS `opacity 1→0` | 600ms ease | 无动画 |
| Toast 上浮 | CSS `translateY(20→0) + opacity 0→1` | 300ms ease-out，2s 后自动消失 | 无动画 |

**通用约束**：所有动画 ≤ 1500ms，不阻塞操作。低端机通过 `wx.getSystemInfoSync().benchmarkLevel < 20` 判定，自动降级为无动画直接切换。

---

## 8. 微信小程序适配要点

### 8.1 Design Token → WXSS

```css
/* app.wxss */
page {
  --green: #5CB85C;
  --green-light: #E8F5E9;
  --yellow: #F0AD4E;
  --blue: #5BC0DE;
  --bg: #FFF8F0;
  --card-bg: #FFFFFF;
  --text: #333333;
  --text-secondary: #888888;
  --border: #E8E0D8;
  --orange-tag: #FFF3E0;
  --danger: #E57373;
  --gold: #F4B400;
  --radius-sm: 12rpx;   /* px → rpx：×2 */
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-pill: 999rpx;
  --sp-1: 8rpx;         /* px → rpx：×2 */
  --sp-2: 16rpx;
  --sp-3: 24rpx;
  --sp-4: 32rpx;
  --sp-5: 40rpx;
  --sp-6: 48rpx;
  --sp-8: 64rpx;
  --fs-display: 112rpx; /* px → rpx：×2 */
  --fs-title: 40rpx;
  --fs-card-title: 30rpx;
  --fs-body: 30rpx;
  --fs-caption: 26rpx;
  --fs-aux: 24rpx;
}
```

> 小程序 WXSS 支持 CSS 变量，但注意：**不支持 `100dvh`**，需改为 `100vh` + `env(safe-area-inset-bottom)` 适配。

### 8.2 安全区适配

```css
/* 状态栏 */
.status-bar {
  height: calc(44px + env(safe-area-inset-top));
  /* 或使用小程序 statusBarHeight API 动态设置 */
}

/* 底部导航 */
.tab-bar {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 8.3 与 H5 的关键差异

| 项目 | H5 Demo | 微信小程序 |
|------|---------|-----------|
| 布局单位 | px（375 基准） | rpx（750 基准，1rpx=0.5px） |
| 页面结构 | 单 HTML 内多 page div | 多页面 WXML 文件（app.json 注册） |
| 全局状态 | window 全局变量 | `getApp().globalData` 或 Store 模块 |
| 数据绑定 | 手动 DOM 操作 | `{{ }}` 数据绑定 + `setData()` |
| 持久化 | localStorage | `wx.setStorageSync()` |
| 动画 | CSS @keyframes | WXSS animation（子集，部分属性不支持） |
| 组件 | 无（纯函数渲染） | Component 构造器 |
| 设备信息 | `navigator` | `wx.getSystemInfoSync()` |
| 100dvh | 支持 | 不支持，用 100vh + safe-area |

---

## 9. 交互逻辑回归清单

> 以下清单来自 design-spec §8.1，技术实现时逐项校验。每项给出实现位置。

| # | 逻辑 | 实现位置 | 关键代码 |
|---|------|----------|----------|
| L1 | 今天不显示「补」标签 | `pages/home/home.js` renderHome | `if (viewDate === today) tasks.forEach(t => t.backfill = false)` |
| L1.1 | 补卡打勾标 backfill | `pages/home/home.js` onTaskClick | `if (viewDate < today) task.backfill = true` |
| L1.2 | 按期打卡不标 backfill | 同上 | `viewDate < today` 才设 backfill |
| L1.3 | 撤销补卡清除 backfill | `components/confirm-modal` onConfirm | `task.backfill = false` |
| L1.4 | 今日永不显示补卡 | `pages/home/home.js` renderHome 入口 | 同 L1 |
| L1.5 | 今日 SSOT=homeTasks | `store/checkins.js` getCheckin | `today` 时从 homeTasks 实时计算 |
| L1.6 | 星星联动 | `store/stats.js` calcStars | 每次打卡/撤销后调用 |
| L1.7 | pickDate 重建 done 数匹配 | `pages/home/home.js` pickDate | 按 checkinsByDate.done 动态取前 N 个 |
| L2 | 补卡 banner | `pages/home/home.wxml` | `wx:if="{{viewDate < today}}"` |
| L3 | 撤销二次确认 | `pages/home/home.js` onTaskClick | `task.done` → 弹 ConfirmModal |
| L4 | 未完成直接打卡 | 同上 | `!task.done` → 立即完成 |
| L5 | 未来日期不可点 | `pages/home/home.js` onTaskClick 入口 | `if (viewDate > today) return` |
| L6 | 日历点击切换 | `components/cal-grid` | 格子 onclick → pickDate(d) |
| L7 | 未来日期置灰 | `components/cal-grid` 渲染 | `d > today` → 无 onclick + 置灰 |
| L8.4 | 日历绿/橙/灰语义 | `components/cal-grid` cellClass | 绿=c-done, 橙=c-part, 灰=c-none |
| L8.5 | 今日补卡联动日历 | `store/checkins.js` getCheckin(today) | `hasBackfill = homeTasks.some(t => t.backfill)` |
| L10 | 庆祝仅今日 | `pages/home/home.js` onTaskClick | `viewDate === today && allDone` |

---

## 10. 待确认技术决策

| # | 决策项 | 当前方案 | 建议确认人 |
|---|--------|----------|-----------|
| 1 | 任务 ID 生成策略 | localStorage 阶段用自增数字；云开发阶段用 `_id` string | 研发 |
| 2 | 连续天数"今天"的截止时间 | 按自然日 00:00 重置（非按 24h 滚动窗口） | 产品 |
| 3 | 低端机降级阈值 | `benchmarkLevel < 20` 跳过动画 | 研发 |
| 4 | 图标从 emoji 切手绘的时机 | 待外部插画师交付，当前 emoji 占位 | 产品+设计 |
| 5 | 小程序分包策略 | MVP 不拆包（总代码量 < 2MB），后续按需 | 研发 |

---

## 11. 版本记录

| 版本 | 日期 | 作者 | 变更 |
|------|------|------|------|
| v1.0 | 2026-07-11 | Sophia (AI) + 用户确认 | 初始版本，覆盖组件树/数据模型/状态矩阵/事件流/动效清单 |
