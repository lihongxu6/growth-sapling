# 成长小树苗 · v2.1 用户引导功能 · 技术方案

> 阶段：阶段三（设计与研发评审）｜角色：架构师｜作者：Sophia（AI 产品助理）
> 上游：设计稿 `ui-mockup-v2.1-guide.html`（已交付、用户确认整体 OK，含累计星星=1 等数据自洽修正）
> 下游：研发实现 → 测试验收 → 上线
> 对齐：MEMORY §3.20 / §3.28–§3.30（6 步流程锁定）、§3.36（读真实源码 + 实测定位，血泪教训）、§3.38（操作手册设计落地）
> 基础架构：复用 `tech-spec-成长小树苗.md` 既定 Store SSOT / storage 适配层 / 四页 tabBar 结构

---

## 1. 背景与目标

**业务背景**：v2.1 面向 7–8 岁孩子，首次启动需要把"添加任务 → 打卡 → 看日历/徽章/头像 → 操作手册"讲清楚。孩子注意力短、不打字、只点图，引导必须是**角色化（松鼠果果说话）+ 真实可点**的。

**EARS 目标描述**：

- **Ubiquitous**：系统始终在首次启动后提供 6 步引导，且引导进度持久化，重进不重来。
- **Event-driven**：
  - When 用户首次进入（本地无 `guideState` 且为第一启动），the system shall 在「任务」页弹出第 1 步引导。
  - When 用户点击 G1 添加按钮（或 G2 任务卡打勾）完成真实操作，the system shall 自动推进到下一步并跨页跳转。
  - When 用户点击「操作手册」底部小链接，the system shall 弹出操作手册底部弹层。
  - When 用户点「再走一遍引导」，the system shall 重置进度并从 G1 重播。
- **Unwanted**：
  - If 用户点「跳过」，then the system shall 标记引导完成（不再出现），但保留「操作手册」入口可随时回看。
  - If 目标元素在折叠区外（成长页较长），then the system shall 先滚动目标入视区再测距定位，避免气泡指向屏外。
- **State-driven**：While 引导进行中，the system shall 禁止页面滚动与误触（遮罩 `catchtouchmove`），仅允许目标操作 / 跳过 / 下一步。
- **Optional**：Where 用户已完成过引导，the system shall 不再自动弹出，仅保留手册入口。

---

## 2. 功能范围（锁定，不在此范围外扩）

| 步 | 页面 | 真实功能 | 引导方式 | 目标选择器（真实 class） |
|---|---|---|---|---|
| G1 | 任务页 | 添加任务（带预填示例） | 真实逐步 | `.add-btn`（tasks.wxml:37） |
| G2 | 打卡页 | 今日打卡（点任务卡打勾） | 真实逐步 | `.task-card`（home.wxml:42，首个） |
| G3 | 成长页 | 看日历（月历三色） | 概念看图 | `.cal-grid`（stats.wxml:50） |
| G4 | 成长页 | 看徽章墙 | 概念看图 | `.badge-grid`（stats.wxml:73） |
| G5 | 成长页 | 改头像 | 概念看图 | `.avatar-wrap`（stats.wxml:6） |
| G6 | 成长页 | 操作手册入口 | 概念看图 | `.manual-entry`（**新增**，stats 页底部） |

**操作手册弹层（G7，v2.1 新增）**：点 G6 小链接后底部滑出，含 5 张脱壳干净卡片（添加任务/打卡/看日历/看徽章/改头像）+「再走一遍引导」按钮（详见 §3.38 / 设计稿 G7 帧）。**不做成新 TabBar 项**（守 MEMORY §3.9）。

---

## 3. 现有架构分析（来自真实源码，非想象）

- **Store SSOT**（`store/index.js`）：全局内存态 `state`，`calcStars()`/`calcStreak()`/`recalcBadges()` 已就绪；持久化经 `utils/storage.js` 的 `set/get`（前缀 `gs_`）。
- **页面独立**：`pages/{splash,home,stats,tasks}`，tabBar 为原生（`app.json` `custom:false`，3 tab：打卡/任务/我的成长）。**原生 TabBar 无法被页面内 fixed 遮罩覆盖**，遮罩底部止于 TabBar 上沿（高度 ≈ 64px，同设计稿 `.coach` 的 `bottom:64px`）。
- **真实测距 API**：`wx.createSelectorQuery().in(this).select(sel).boundingClientRect(cb).exec()` —— 返回元素在页面可视区的 `left/top/width/height`（px）。**这正是设计稿 `getBoundingClientRect()` 实测定位方法在小程序里的原生等价物**，验证了我们 §3.36 的方法论（读真实源码 + 实测，不手画坐标）。
- **rpx 原生**：真实小程序直接用 `rpx`，**不需要**设计稿里的 `calc(N*var(--u))` 转换（那仅为 HTML 演示）；组件样式用 `rpx` 正常写即可。
- **emoji 真机原生渲染**：真机/开发者工具原生渲染 emoji，无 Chromium headless 字体 bug（设计自检才需要声明字体）。
- **IP 资产**：松鼠果果头像 `assets/avatar-144.png`（透明背景，按 MEMORY §2 已校正路径）。

---

## 4. 技术方案概览

> **核心原则：引导内容与展示分离，单一真相源。**

```
┌────────────────────────────────────────────────────────┐
│  utils/guide.js  （引导控制器 / 步骤机 / 进度持久化）        │
│   · GUIDE_CONTENT[]  ← 6 步文案 + 操作手册卡片（单一来源）  │
│   · getStep() / advance() / skip() / restart()            │
│   · isStepOnPage(page) / onFirstLaunch()                  │
└───────────────┬──────────────────────┬───────────────────┘
                │ 读/写                  │ 读 GUIDE_CONTENT
                ▼                        ▼
      storage 'gs_guideState'    components/coach-mark（聚光灯+气泡+跳过/下一步）
                                     components/manual-sheet（脱壳卡片 + 再走一遍）
                │                        │
   tasks/home/stats 三页 wxml 各自包含    │
   <coach-mark wx:if="{{coach.visible}}">│
   + stats 额外含 .manual-entry + <manual-sheet>
```

**组件化而非页面内联**：新建 2 个自定义组件（`coach-mark`、`manual-sheet`），在 3 个相关页 include；引导控制器 `utils/guide.js` 统一管理 6 步状态机与跨页 `wx.switchTab` 跳转。G1/G2/G3 目标跨 3 个页（任务→打卡→成长），步骤推进由控制器在 `next` 时判断是否需要 switchTab。

---

## 5. 数据模型与状态

### 5.1 新增持久化键（storage.js）

```js
// utils/storage.js 新增
const GUIDE_KEY = 'guideState';
// 结构：{ status:'pending'|'active'|'done', step:0..5, updatedAt:ISO }
function getGuideState()    { return get(GUIDE_KEY); }
function setGuideState(s)   { return set(GUIDE_KEY, s); }
```
在 `loadPersistedState()` 与 `saveState()` 中纳入 `guideState`（其余 tasks/checkinsByDate/badges 不变）。

### 5.2 状态机

```
        onFirstLaunch (无 gs_guideState)
                 │
                 ▼
        status='active', step=0  ──► 任务页 G1
   advance ──────────────────────────────┐
   (G1真实点添加)                          │
        switchTab→打卡页 G2                │
   advance ──────────────────────────────┤
   (G2真实打勾)                            │
        switchTab→成长页 G3 →G4→G5→G6      │
   advance/finish ────────────────────────┘
                 │
                 ▼
        status='done'  （引导结束，G6 文案"随时回看"）
   skip 任意步 ──► status='done'
   restart（手册内"再走一遍"）──► status='active', step=0, switchTab→任务页
```

`guideState` 由 `utils/guide.js` 直接经 storage 读写（不进主 Store，保持引导状态轻量、独立）。

---

## 6. 模块设计

### 6.1 `utils/guide.js` — 引导控制器 + 内容常量（单一真相源）

```js
// 6 步 + 手册卡片共用一份内容，避免 coach-mark 与 manual-sheet 文案漂移
const GUIDE_CONTENT = [
  { page:'tasks', target:'.add-btn',
    text:'点这里「添加新任务」，写下你想养成的小习惯吧～先从一个小目标开始最容易坚持！' },
  { page:'home', target:'.task-card',
    text:'今天的小任务就在这里～点一下圆圈打勾，就算完成打卡啦！' },
  { page:'stats', target:'.cal-grid',
    text:'这是你的打卡日历～🟢全完成 🟠还没打卡 ⚪没任务，点一点看看你有多棒📅' },
  { page:'stats', target:'.badge-grid',
    text:'收集星星就能解锁成长徽章，继续加油哦🏅' },
  { page:'stats', target:'.avatar-wrap',
    text:'点这里可以换上你喜欢的果果头像，装扮小树苗🐿️' },
  { page:'stats', target:'.manual-entry',
    text:'以后不会用的时候，点这里看操作手册，果果带你一步步来📖 随时都能回看哦！' },
];
const MANUAL_CARDS = [
  { icon:'📋', title:'添加任务', text:'写下想养成的小习惯，从一个小目标开始' },
  { icon:'✅', title:'今日打卡', text:'每天完成小习惯，点圆圈打勾攒星星' },
  { icon:'📅', title:'看日历',   text:'点月历看进度：🟢全完成 🟠还没打卡 ⚪没任务' },
  { icon:'🏅', title:'看徽章',   text:'收集星星，解锁你的成长徽章墙' },
  { icon:'🖼️', title:'改头像',   text:'换个喜欢的果果头像，装扮小树苗' },
];
// 导出：getStep()/advance(page)/skip()/restart()/isStepOnPage(page)/onFirstLaunch()
```

### 6.2 `components/coach-mark` — 聚光灯 + 气泡 + 跳过/下一步

- **结构**：`<view class="coach-mask">`（fixed 全屏，`catchtouchmove` 禁滚）+ `.target-spot`（聚光灯：`.target-spot{ box-shadow:0 0 0 4rpx green, 0 0 0 9999rpx rgba(0,0,0,.45) }`，与设计稿同源）+ `.bubble`（松鼠头像 `assets/avatar-144.png` + 文案 + 跳过 + 下一步，三要素同区，单一松鼠）。
- **定位（核心）**：`onReady` / 收到 `step` 变更后：
  ```js
  wx.createSelectorQuery().in(this).select(target).boundingClientRect(rect => {
    if (!rect) return;
    // 1) 若目标在折叠外，先 wx.pageScrollTo({selector:target}) 入视区
    // 2) 用 rect 计算 spotlight 位置（left=rect.left-6, top=rect.top-6, w/h+12）
    // 3) 气泡 side 自动选（下/上/左/右），clamp 进屏幕；尾巴指向目标
  }).exec();
  ```
  与 `ui-mockup-v2.1-guide.html` 的 `positionCoach()` 逻辑一致（4 向选择 + clamp + fallback），Playwright 自检已验证 7 帧 `bubbleGap 0–12px` / `ringErr 0`。
- **事件**：`bindtap` 跳过 → `triggerEvent('skip')`；下一步 → `triggerEvent('next')`。
- **灰阶**：遮罩透明度 = `rgba(0,0,0,.45)`（用户 2026-07-23 拍板，否定 .30 过淡）。

### 6.3 `components/manual-sheet` — 操作手册弹层（脱壳）

- **触发**：stats 页 `.manual-entry` 点击 → `showManual=true`。
- **结构**：`sheet-mask`（暗化）+ `manual-sheet`（底部圆顶卡，从底部上滑）+ `sheet-cards`（遍历 `MANUAL_CARDS` 渲染 5 张干净卡，**无遮罩/无跳过/无下一步**）+ `manual-restart` 按钮「再走一遍引导 ›」。
- **事件**：卡片点击（可选：跳到对应页并触发该步引导）；按钮 → `guide.restart()` + `wx.switchTab` 到任务页。

### 6.4 页面接驳（最小改动）

| 文件 | 改动 |
|---|---|
| `pages/tasks/tasks.wxml` | 底部加 `<coach-mark wx:if="{{coach.visible}}" step="{{coach.step}}" .../>`；`onAdd` 内 G1 推进 |
| `pages/home/home.wxml` | 加 `<coach-mark .../>`；`onTaskTap` 内 G2 推进（打卡后） |
| `pages/stats/stats.wxml` | 徽章墙段后加 `.manual-entry` 小链接 + `<coach-mark .../>` + `<manual-sheet wx:if="{{showManual}}"/>` |
| `pages/{tasks,home,stats}.js` | `onShow` 读 `guide.getStep()` 决定 `coach.visible`；绑定 next/skip；`onShow` 时若非本页步骤则隐藏 |
| `utils/storage.js` | 增 `guideState` 键 + load/save |
| `utils/guide.js` | 新建（控制器 + GUIDE_CONTENT/MANUAL_CARDS） |
| `components/coach-mark/*`、`components/manual-sheet/*` | 新建 |

---

## 7. 关键流程

1. **首次启动**：`app.onLaunch` → `guide.onFirstLaunch()`（无 `gs_guideState`）→ 置 `active,step=0` → 任务页 `onShow` 检测 step 属于本页 → 显示 G1。
2. **真实步推进**：G1 用户点 `.add-btn` → 真打开添加弹窗（保持产品原行为）→ 引导在"添加"动作确认后 `advance()` → `switchTab` 到打卡页 → 打卡页 `onShow` 显示 G2。G2 用户点 `.task-card` 打勾 → `toggleTask` 后 `advance()` → `switchTab` 到成长页 → 显示 G3。
3. **概念步推进**：G3–G6 均在成长页，果果讲解 + 聚光灯高亮该功能，孩子**看一眼点「下一步」即可**（`advance()` 仅改 `step` + 重渲染），不强求操作目标；但每步是**独立讲解**（逐屏阅读），不是"一路狂点下一步跳过"。
4. **完成 / 跳过**：G6 点「完成 🎉」或任意步「跳过 ✕」→ `status='done'`。
5. **回看 / 重播**：成长页 `.manual-entry` → `manual-sheet`；「再走一遍引导」→ `restart()`（`active,step=0`）+ `switchTab` 任务页。

---

## 8. 兼容性 / 风险 / 边界

| 项 | 说明 / 对策 |
|---|---|
| 测距时机 | `boundingClientRect` 必须在页面渲染后调用：放 `onReady` 或 `setData` 回调里；数据/滚动变化后 `selectorQuery` 重测（同 mockup `place()` 在 scroll/resize 重排）。 |
| 长页滚动 | 成长页较长，G5/G6 目标在折叠区下 → 先 `wx.pageScrollTo({selector})` 入视区再测距，避免气泡指向屏外（mockup 已用 `reveal()` 验证）。 |
| 原生 TabBar | fixed 遮罩底部止于 TabBar 上沿，遮罩不盖 TabBar（与设计稿 `.coach` `bottom:64px` 一致）；G6 小链接在 TabBar 之上，可见。 |
| rpx vs calc | 真实代码用 `rpx` 原生，**删掉** mockup 的 `calc(N*var(--u))`；组件样式直接用 rpx。 |
| emoji 渲染 | 真机原生，无需声明字体（字体声明仅 HTML 演示用）。 |
| 默认 4 任务 vs G2「1 任务」叙事 | **见 §10-a，待产品决策**。 |
| 双松鼠 | 全稿仅气泡内 1 只松鼠 IP；手册卡片用 🖼️ 不另画松鼠（守"1 只松鼠"铁律）。 |
| 不打字 | G1 添加弹窗保留线上真实结构 + 预填示例（§3.33）；引导只点不输。 |

---

## 9. 埋点方案（验收数据来源）

| 事件 | 触发 | 字段 |
|---|---|---|
| `guide_exposure` | 每步气泡展示 | `step`, `page` |
| `guide_step_next` | 点下一步/完成 | `step`, `page`, `is_real`(G1/G2=true) |
| `guide_skip` | 点跳过 | `step` |
| `guide_complete` | 引导结束 | `total_duration_ms` |
| `manual_open` | 点操作手册入口 | — |
| `manual_card_tap` | 点手册卡片 | `card`(添加任务/…) |
| `manual_restart` | 点再走一遍引导 | — |

埋点走现有 `utils/storage` 或上报通道（与 v2.0 一致，不新增云依赖，守 MEMORY §3.14）。

---

## 10. 验收标准

**设计对齐（对 `ui-mockup-v2.1-guide.html`）**
- G1–G6 气泡贴附：聚光灯中心↔目标中心偏差 ≤ 4px；气泡↔目标边缘间隙 ≤ 40px（同自检 `bubbleGap` 阈值）。
- 6 帧结构、文案、日历三色（🟢🟠⚪）、G7 脱壳卡片内容一致。
- 全程仅 1 只松鼠（气泡内），手册卡片不另画松鼠。

**功能**
- 首次启动自动从 G1 开始；G1/G2 真实操作后才推进并跨页；跳过/完成后不再自动弹。
- 成长页底部 `.manual-entry` 小链接可见、低调（无角标/无背景）；点开弹层含 5 卡 + 再走一遍。
- 重进小程序（已 done）不重复引导；「再走一遍」可重播。
- 「刚完成首次打卡」演示态：累计星星=1、新芽初绽（7★）未 earned（与设计稿数据自洽 §3.40 一致）。

**边界**
- 目标在折叠外 → 滚动入视区再定位，气泡不溢出屏。
- 引导中 `catchtouchmove` 禁滚，误触不穿透到页面。
- 横竖屏/不同机型：定位用实测 rect，自适应。

---

## 11. 已确认决策（原待确认，2026-07-23 用户拍板）

> 以下 3 项原列于"待确认"，已于 2026-07-23 经用户逐一确认，均采纳"建议项"。

1. **【默认 4 任务 + 星星 +1 规则，已确认】** → **保留 `constants.DEFAULT_TASKS` 真实预置的 4 个每日任务**，不动产品播种行为（风险最低）。
   - 4 个真实默认任务：① 📖每日阅读30分钟（认识更多字）② ✏️认真完成作业（巩固今天学的）③ 🏃运动20分钟（身体棒棒的）④ 🧹整理自己的房间（学会照顾自己）。
   - **星星规则**：`calcStars()` 统计"已打卡记录数"，**每完成一次打卡 +1 颗★**；引导叙事"刚完成首次打卡"对应**累计星星 = 1**（非 8、非 0）。
   - **G2 演示态**：列出 4 个默认任务、全部 `○` 未打卡，进度 `0/4`；高亮首个 `.task-card` 引导"点这里打卡"。
   - **连锁修正（本周完成率）**：`stats._calcWeekRate` 分母为"7 天 × 4 任务 = 28"，首次打卡后完成率 = **4%**（非 100% / 25%）。设计稿本周环: `conic-gradient(绿 0% 4%, #EFE7DC 4% 100%)`、环心 `4%`、文案"今天完成 1 个小习惯，明天继续呀！"。

2. **【遮罩透明度，已确认】** → **`.45`**（用户原话："要不 45 吧？30 的话是不是有点太淡？"）。否定 MEMORY §2 的 `.30` 降透明度提案——`.30` 过淡、非高亮区对比不足，不利 7–8 岁孩子聚焦。设计稿 + 真机均取 `rgba(0,0,0,.45)`。

3. **【概念步（G3–G6）推进条件，已确认】** → **混合推进，按 §3.28–§3.30 原方案执行**（用户明确纠正了"可一路狂点下一步跳过"的误解）：
   - **G1 / G2 = 强制真实操作步**：必须真点（G1 真加任务、G2 真打卡）才能解锁"下一步"，不可跳过（呼应"前两步必须点"）。
   - **G3–G6 = 概念步**：每屏**看图 + 一句讲解**，孩子"看一眼点下一步"即可；不强求点击目标元素、但**每屏都有独立讲解、须逐屏过**，不是"一路狂点下一步直接跳过"。
   - 与 §3.30"概念性看图不强求操作"一致，但保留逐屏认知节奏。

---

## 12. 流转建议（阶段三 → 研发 / 测试）

- ✅ 本技术方案 + 设计稿 `ui-mockup-v2.1-guide.html` 已就绪，可作为**研发实现依据**与**设计验收基准**。
- 建议：将 v2.1 引导拆成研发子任务（G1–G6 教练层 / 操作手册弹层 / 引导控制器+持久化 / 埋点），在 TAPD/事项 创建并指派开发，附本文件 + 设计稿 + PRD 段落；邀请设计（验收视觉）、测试（§10 验收）为关注人。
- 重要文档建议上传**项目资料库**，形成统一上下文（设计稿 + 本 tech-spec + PRD §用户引导）。
- 排期 / 资源 / 上线范围类决策，请找对应**负责人/技术 owner** 确认（本方案只给技术实现路径，不含排期承诺）。
- 上线前：按 §3.36 教训，研发自测必须用**真机/开发者工具实测 `boundingClientRect` 定位**，而不是凭 class 名臆测坐标。
