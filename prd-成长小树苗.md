# 「成长小树苗」微信小程序 PRD

> **本文档为单一 living PRD（不按版本拆文件）。** 版本演进见下方「版本记录」；v1.0 已上线内容为基线（冻结，不改需求原文），v2.0 账户体系为规划中内容。维护策略见 MEMORY §3.7。

---

## 文档信息

| 字段 | 内容 |
|------|------|
| 产品名称 | 成长小树苗 |
| 平台 | 微信小程序 |
| 文档状态 | 持续维护（living document） |
| 维护策略 | 单文件演化，版本以「版本记录表 + 版本分区章节」区分 |

## 版本记录

| 版本 | 状态 | 技术方案 | 范围 |
|------|------|---------|------|
| **v1.0 MVP** | ✅ 已上线 | 微信小程序原生 + 本地存储（`wx.setStorageSync`，无账户、单设备单人） | 今日打卡 / 打卡统计 / 任务管理（见「版本 1.0 基线」章节） |
| **v2.0 账户体系** | 🔜 规划中 | 微信云开发（云函数 + 云数据库），`openid` 做用户标识 | 多用户跨设备云同步 + 用户信息页（见「版本 2.0」章节） |

> ⚠️ **历史一致性说明**：v1.0 规划阶段曾将「技术方案」写为微信云开发，但实际落地为本地存储、无账户体系（单设备单人）。v2.0 将**补齐最初规划**的云开发 + 账户体系，使文档与实现重新对齐。账户模型见 §账户体系，数据模型见 §9。

---

## 产品终极目标

> **帮助孩子实现自我管理，养成终身受益的好习惯。**
>
> 这款产品不是"监督工具"，而是孩子自己的**成长伙伴**。每一个功能细节都服务于一个方向：让孩子从"被督促"走向"我主动"。孩子自己设任务、自己打卡、自己回看成长轨迹。

### 产品寓意

**「成长小树苗」**——寓意坚定向上生长。人生道阻且长，可能经历风雨，但贵在不断思考与成长。就像一棵小树苗，每天浇一点水、晒一点太阳，看似不起眼的坚持，终将长成参天大树。

### 成长可视化（核心体验路径）

```
 MVP (v1.0)                  v1.1                      远期
    │                         │                         │
    ▼                         ▼                         ▼
┌──────────┐          ┌──────────────┐          ┌──────────────┐
│ 星星激励  │   ───→   │ 星星 → 水/肥料│   ───→   │ 树成长动画   │
│ ⭐🏆👑   │          │ 兑换 → 树长大  │          │ 陪伴+激励    │
│ 徽章体系  │          │ 成长可视化     │          │ 完整养成体验  │
└──────────┘          └──────────────┘          └──────────────┘
```

MVP 阶段用星星动画和徽章体系建立即时激励；v1.1 将打卡积攒的星星转化为浇水和施肥，让小朋友亲手培育一棵属于自己的小树——每一次坚持都让小树长大一点，成长变得看得见、摸得着。最终，这棵树会成为孩子习惯养成旅程中最忠实的伙伴。

### 账户体系 【v2.0 规划 · 设计基础】

> v2.0 账户模型落地基础；v1.0 为本地单用户，未实现此模型。

**一个微信账号 = 一个独立用户。** 不预设"家长账号"和"孩子账号"的角色分离，谁打开小程序就是谁的。微信云开发通过 `_openid` 天然隔离不同用户的数据，无需额外设计账户体系。如果孩子和家長共用同一个微信，他们的数据就在同一个账户下，这也是二年级小朋友最常见的真实使用场景。

---

## 版本 1.0（MVP，已上线 · 基线）

> §1–§8、§10–§16 为 v1.0 已上线功能的原始需求，冻结不再改动需求原文。

## 1. 问题陈述

小学二年级（7-8岁）的小朋友正处于习惯养成的关键期，但普遍面临三个问题：**做事容易忘记**、**缺乏持续动力**（容易三分钟热度）、**完成任务后缺乏成就感**。

家长的困境是：口头督促容易引发亲子冲突，且缺乏客观工具追踪孩子的坚持情况。但更深层的问题是——**如果习惯养成始终依赖家长催促，孩子永远无法形成内驱力**。

市面上已有习惯打卡产品（如小习惯、番茄ToDo），但普遍面向成人，界面复杂、缺乏对儿童的趣味激励，更关键的是它们大多是"成人自我管理工具"，没有针对"孩子从被管理到自我管理"这个成长路径做设计。

---

## 2. 目标

### 用户目标

| # | 目标 | 衡量标准 |
|---|------|----------|
| 1 | 孩子能**自主**完成打卡，无需家长提醒 | 打卡操作 ≤ 2 步（打开小程序 → 点击任务） |
| 2 | 孩子能**自己**添加和管理任务，建立"我的事情我做主"的意识 | 任务设置入口对儿童友好，流程简单 |
| 3 | 孩子能直观看到自己的坚持成果，产生内在成就感 | 打卡页实时显示星星积分；统计页面有连续天数、徽章墙等正向反馈 |
| 4 | 孩子忘记打卡时能补上，不因一次遗漏而放弃 | 支持任意历史日期补打卡 |
| 5 | 任务未达标时能撤销打卡，保证记录真实可信 | 支持撤销任意历史打卡记录 |

### 业务目标

| # | 目标 | 衡量标准 |
|---|------|----------|
| 1 | 验证"儿童自我管理打卡"这个小程序形态是否有真实用户需求 | DAU ≥ 50（上线 30 天内） |
| 2 | 验证趣味激励（星星动画 + 徽章）能否提升打卡坚持率 | 周留存率 ≥ 40%（上线 30 天内） |

---

## 3. 非目标（Non-Goals）

| # | 不做 | 原因 |
|---|------|------|
| 1 | 植物生长动画（星星→水/肥料→树长大） | 核心体验路径的第二步，MVP 先用徽章验证激励效果，v1.1 做完整成长可视化 |
| 2 | 微信订阅消息推送 | MVP 不做，涉及模板审核和云函数定时触发，P1 迭代再做 |
| 3 | 社交功能（班级排名、好友比拼等） | 有隐私顾虑，且与自我管理目标相悖 |
| 4 | 家长/孩子角色分离 | 一个微信一个账户，谁用就是谁的，不做角色区分 |
| 5 | 任务时间限制 | P1 再考虑 |
| 6 | 实物奖励/商品推荐 | 商业化路径，非 MVP 范围 |
| 7 | 首次使用引导 | MVP 先不做，靠空状态引导即可 |

---

## 4. 用户故事

### P0（MVP 必须）

| # | 用户故事 | 核心理念 |
|---|----------|----------|
| US-1 | 作为孩子，我希望打开小程序就能看到今天要做的事，以便我知道今天要完成什么 | 降低启动成本 |
| US-2 | 作为孩子，我希望点一下就能完成打卡，以便我能快速记录我做到了 | 操作极简 |
| US-3 | 作为孩子，我希望昨天忘记打卡的任务今天还能补上，以便我不因一次遗漏而放弃 | 容错机制 |
| US-4 | 作为孩子，我希望看到我坚持了几天，获得了什么徽章，以便我有动力继续坚持 | 自我激励 |
| US-5 | 作为孩子，我希望能自己添加、编辑和删除任务，以便我能灵活管理自己的任务 | 自主管理 |
| US-6 | 作为用户，我希望能撤销不达标的打卡，以便打卡记录是真实可信的 | 诚实记录 |
| US-7 | 作为用户，我希望数据能云端同步，以便换手机后数据不丢失 | 数据安全 |

### P1（后续迭代）

| # | 用户故事 |
|---|----------|
| US-8 | 作为用户，我希望看到小树苗随着我的打卡慢慢长大 |
| US-9 | 作为用户，我希望打开小程序就能收到打卡提醒，以便我不会忘记 |

---

## 5. 功能清单

### 整体结构

```
底部 Tab 导航
┌──────────┬──────────┬──────────┐
│  🏠 打卡  │  📊 统计  │  ⚙️ 任务  │
└──────────┴──────────┴──────────┘
```

### 5.1 Tab 1：今日打卡（首页）

| 功能点 | 优先级 | 说明 |
|--------|--------|------|
| 顶部信息栏 | P0 | 左侧：火焰图标🪵🔥 + 连续天数（最重要）；中间：⭐星星积分；右侧：日期 + 日历入口。火焰图标在当日有任务完成时点亮为彩色🔥+发光，未完成时显示黑白🪵 |
| 今日任务列表 | P0 | 展示所有已启用的任务，每行一个 |
| 任务打卡 | P0 | 点击未打卡任务 → 星星动画 → 标记完成 → 获得 ⭐1 颗星 = 1 积分 |
| 积分展示 | P0 | 打卡页进度条下方展示当前累计星星总数（格式 ⭐ 23） |
| 补打卡 | P0 | 可切换到过去任意一天（不限 7 天），为未打卡的任务补卡。补卡与按时打卡在日历上有视觉区分 |
| 撤销打卡 | P0 | 在打卡页点击已打卡任务 → 确认撤销（任意历史日期均可撤销） |
| 今日进度 | P0 | 底部显示"已完成 2/4" |
| 全部完成庆祝 | P0 | 全部任务完成时展示庆祝效果 |
| 空状态 | P0 | 无任务时引导孩子创建第一个任务 |

### 5.2 Tab 2：打卡统计

| 功能点 | 优先级 | 说明 |
|--------|--------|------|
| 连续打卡天数 | P0 | 顶部最显眼位置，火焰图标 + 数字 |
| 本周完成率 | P0 | 百分比展示。分子=本周实际完成打卡数，分母=本周所有任务按其周期应出现的总次数 |
| 月度打卡日历 | P0 | 日历热力图，颜色区分完成情况 |
| 徽章展示 | P0 | 已获得的徽章高亮，未获得的灰色显示 |

**徽章体系：**

徽章是中长期激励的核心载体，与积分（星星）体系配合使用：

- **积分（星星）**：即时反馈。每完成一项任务获得 ⭐1 颗星 = 1 积分，打卡页进度条下方展示累计星星数。
- **徽章**：中长期成就。基于积分积累和行为表现自动颁发，是孩子习惯养成旅程中的里程碑。

**设计原则：**

1. **灰 → 彩**：所有徽章初始为灰色锁定状态，获得后变为彩色并播放点亮动画
2. **可扩展**：徽章体系设计为开放式框架，后续可持续推出新徽章，保持新鲜感
3. **双重激励**：既有基于积分累积的奖励（"攒够星星就能拿"），也有基于行为改进的奖励（"连续坚持不中断"）

**MVP 徽章清单：**

| 分类 | 徽章 | 获得条件 | 图标 | 含义 |
|------|------|----------|------|------|
| 🌟 积分积累 | 新芽初绽 | 累计获得 7 颗星星 | 🌱 | "我开始坚持了！" |
| 🌟 积分积累 | 小有所成 | 累计获得 30 颗星星 | 🌿 | "我在一天天进步！" |
| 🌟 积分积累 | 枝繁叶茂 | 累计获得 100 颗星星 | 🪴 | "习惯已经生根发芽！" |
| 🌟 积分积累 | 硕果累累 | 累计获得 365 颗星星 | 🍎 | "坚持了整整一年！" |
| 🔥 行为激励 | 一周全勤 | 连续 7 天每天至少完成 1 个任务 | 🔥 | "整整一周没落下！" |
| 🔥 行为激励 | 满月之星 | 连续 30 天每天至少完成 1 个任务 | 🌕 | "一个月不间断！" |
| 🔥 行为激励 | 今日冠军 | 某一天完成了全部任务 | 🏅 | "今天全部完成！" |

**徽章展示：**

- 统计页徽章墙：网格布局，已获得的彩色 + 发光边框，未获得的灰色 + 锁定图标
- 未获得徽章下方显示进度（如"还差 5 颗星"、"还需连续 3 天"）
- 新获得徽章时：全屏点亮动画 + 小松鼠果果出来祝贺

**徽章可扩展性（为后续迭代预留）：**

| 扩展方向 | 示例 | 阶段 |
|----------|------|------|
| 节日限定徽章 | 春节、儿童节等特定日期打卡获得 | v1.2 |
| 主题挑战徽章 | "阅读周"完成全部阅读任务 | v1.2 |
| 隐藏惊喜徽章 | 特定行为触发（如连续撤销3次后重新坚持） | v2.0 |
| 亲子协作徽章 | 与家长共同完成的任务 | v2.0 |

> 注：积分（星星）不会被消耗，只增不减。撤销打卡会扣减对应积分，徽章同步重判。

### 5.3 Tab 3：任务管理

| 功能点 | 优先级 | 说明 |
|--------|--------|------|
| 添加任务 | P0 | 输入任务名称 + 任务意义（选填）+ 选择图标 + 选择重复周期，点击保存 |
| 任务图标库 | P0 | 预设 12-16 个图标（📖阅读 ✏️写字 🏃运动 🎒整理 🪥刷牙 😴早睡 🎹练琴 🧮口算 🌿浇水 🐶遛狗 🧹打扫 🥛喝水） |
| 任务列表 | P0 | 展示所有已创建的任务，含图标、名称、任务意义（如有）和周期描述 |
| 删除任务 | P0 | 点击删除按钮，二次确认后删除（软删除，历史打卡数据保留） |
| 编辑任务 | P0 | 点击任务可修改名称、任务意义、图标、重复周期，修改不影响历史打卡数据 |
| 任务上限 | P0 | 最多 6 个任务，达到上限时添加按钮置灰并提示 |
| 任务周期 | P0 | 创建任务时选择重复频率：每天 / 工作日（周一至周五）/ 周末（周六日）/ 自定义星期 |

---

## 6. 需求详述（EARS 原则）

### 6.1 今日打卡

**US-1：查看今日任务**

> **Ubiquitous**: The system shall display today's task list on the home page when the user opens the app. Only tasks whose repeat schedule matches today shall be shown.
>
> **Ubiquitous**: The system shall determine task visibility based on repeat_type:
> - `daily`: shown every day
> - `weekday`: shown Monday through Friday
> - `weekend`: shown Saturday and Sunday
> - `custom`: shown on days matching repeat_days (e.g., [1,3,5] = Mon/Wed/Fri)
>
> **Ubiquitous**: The system shall display the top info bar in the following order of importance (left to right): fire icon + consecutive streak days (most important, left), total star count ⭐ (middle), date + calendar entry (right).
>
> **State-driven**: The fire icon shall display as 🪵 (grayscale, unlit) when no tasks have been completed today, and as 🔥 (full color, glowing animation) when at least one task has been completed today.
>
> **State-driven**: While no tasks have been created, the system shall display an empty state with guidance text "来添加你的第一个任务吧！" and a shortcut button to the task management page.
>
> **State-driven**: While no tasks are scheduled for today (all tasks exist but none match today's weekday), the system shall display "今天没有安排任务，好好休息吧～".
>
> **Event-driven**: When the date changes to a new day, the system shall recalculate which tasks are visible and reset all visible task completion statuses to unchecked.
>
> **Unwanted**: If the cloud database query fails, the system shall display a friendly error message "加载失败，下拉重试一下～" and a retry button.

**US-2：完成打卡**

> **Event-driven**: When the user taps an unchecked task, the system shall play a star burst animation, mark the task as completed, increment the total star count by 1, update the progress indicator, and switch the fire icon from 🪵 (unlit) to 🔥 (lit with glow animation) if this is the first completion of the day.
>
> **Event-driven**: When all tasks for the day are completed, the system shall display a celebration screen with encouraging text "太棒了！今天的任务全部完成！🌟".
>
> **State-driven**: While a task is in completed state, it shall display a green checkmark and the card background shall change to a light green tint.
>
> **State-driven**: While at least one task has been completed today, the fire icon in the top bar shall display as 🔥 in full color with a glow animation. While no tasks have been completed today, the fire icon shall display as 🪵 in grayscale.

**US-3：补打卡**

> **Event-driven**: When the user taps the date selector at the top of the check-in page, the system shall display a date picker allowing navigation to any past date (no time limit).
>
> **State-driven**: While viewing a past date, the system shall display the task list for that date with the same check-in and completion logic as today.
>
> **Ubiquitous**: The system shall allow check-in for any past date, with no restriction on how far back.
>
> **Ubiquitous**: The system shall display a visual indicator (such as "补卡" tag) on check-in records that were created after the original date, so the user can distinguish timely check-ins from late ones.
>
> **State-driven**: While viewing the monthly calendar on the stats page, backfilled check-in days shall display a small dot marker (•) to distinguish them from same-day check-ins. The calendar color logic (green/yellow/gray/white) shall treat backfilled and timely check-ins equally — the dot is purely informational, not judgmental.

**US-4：撤销打卡**

> **Event-driven**: When the user taps an already-checked task (on any date — today or past), the system shall display a confirmation dialog "确定撤销「XXX」的打卡吗？".
>
> **Event-driven**: When the user confirms the undo, the system shall delete the check-in record, decrement the total star count by 1, revert the task to unchecked state, and update the progress indicator and statistics accordingly.
>
> **Ubiquitous**: The system shall allow undo of check-in for any historical date, not limited to today.
>
> **Unwanted**: If the check-in record does not exist (race condition or already deleted), the system shall silently refresh the task list to show the current state.

### 6.2 打卡统计

**US-5：查看连续天数**

> **Ubiquitous**: The system shall calculate and display the current consecutive check-in streak at the top of the stats page. A "check-in day" is defined as a calendar day where at least one task was completed (including backfilled check-ins).
>
> **Event-driven**: When the user completes the first task of a new day, the system shall increment the consecutive streak by 1.
>
> **Unwanted**: If the user misses a full day (no tasks completed for an entire calendar day), the system shall reset the consecutive streak to 0 but preserve the historical maximum streak.
>
> **Event-driven**: When a check-in is undone and it causes a gap in the streak, the system shall recalculate the consecutive streak from the most recent uninterrupted period.

**US-6：查看月度日历**

> **Ubiquitous**: The system shall display a monthly calendar view where each day is color-coded based on completion status.
>
> - Green (🟢): All tasks scheduled for that day completed
> - Yellow (🟡): Partial tasks completed (at least 1 but not all scheduled tasks)
> - Gray (⚪): No tasks completed (may include days where no tasks were scheduled)
> - White (⬜): No tasks scheduled for this day (e.g., a weekday-only task on Saturday)
>
> **State-driven**: While viewing a day that contains backfilled check-ins, the system shall display a small dot marker to indicate the check-in was not made on the original date.
>
> **Event-driven**: When the user swipes left/right on the calendar, the system shall navigate to the previous/next month.
>
> **Event-driven**: When the user taps a calendar day cell (except future dates, which are not tappable), the system shall switch to the check-in page and display that day's task list, so the user can review which tasks were not completed and backfill them if needed. The check-in page shall show the same backfill banner and interaction as manually selecting that date.

**US-7：徽章获得与回收**

> **Ubiquitous**: The system shall maintain two parallel tracking metrics for each user: total stars (cumulative completed tasks count) and consecutive check-in days.
>
> **Event-driven**: When the user's total stars reach a badge threshold, the system shall award the corresponding accumulation badge with a full-screen light-up animation. The gray badge icon shall transform to full color.
>
> **Event-driven**: When the user's consecutive check-in days reach a streak badge threshold, the system shall award the corresponding streak badge with animation.
>
> **Event-driven**: When a task check-in is undone and the total stars or consecutive days drop below a badge threshold, the system shall revoke the badge — the icon shall revert to gray with a gentle fade animation (not a harsh removal).
>
> **Ubiquitous**: The system shall display all badges on the stats page in a grid layout. Earned badges shall show in full color with a glow border. Unearned badges shall show in gray with a lock icon and progress text (e.g., "还差 5 颗星", "还需连续 3 天").
>
> **Ubiquitous**: The system shall display the user's total star count prominently below the progress bar on the check-in page, updated in real-time after each check-in or undo.

### 6.3 任务管理

**US-8：添加任务**

> **Event-driven**: When the user taps the "+ 添加任务" button, the system shall display a form with task name input, purpose input (optional), icon selector, and repeat schedule selector.
>
> **Ubiquitous**: The system shall limit task names to 20 characters maximum.
>
> **Ubiquitous**: The system shall limit task purpose to 50 characters maximum, with placeholder text "比如：认识更多字、身体更健康...". The purpose field is optional and can be left blank.
>
> **Ubiquitous**: The system shall offer four repeat schedule options: 每天 / 工作日（周一至周五）/ 周末（周六日）/ 自定义星期（勾选周一至周日）。
>
> **Ubiquitous**: The system shall default the repeat schedule to "每天".
>
> **Unwanted**: If the task name is empty when submitting, the system shall display validation error "给你的任务起个名字吧～".
>
> **Unwanted**: If the task count has reached the maximum of 6, the system shall disable the add button and display "你的任务已经够啦，先坚持完成它们吧！".
>
> **Event-driven**: When the user submits a valid task, the system shall save it to the cloud database and refresh the task list.

**US-9：编辑任务**

> **Event-driven**: When the user taps a task in the task list (not the delete icon), the system shall open an edit form pre-filled with the task's current name, purpose, icon, and repeat schedule.
>
> **Event-driven**: When the user modifies any field and saves, the system shall update the task in the cloud database. Historical check-in records shall remain unchanged.
>
> **Ubiquitous**: The system shall apply the same validation rules as task creation (name required, max 20 characters).
>
> **Unwanted**: If the task's repeat schedule is changed, the system shall only affect future dates — today's and past dates' task visibility shall not be retroactively changed.

**US-10：删除任务**

> **Event-driven**: When the user taps the delete icon on a task, the system shall display a confirmation dialog "确定删除「XXX」吗？之前的打卡记录会留着哦～".
>
> **Event-driven**: When the user confirms deletion, the system shall soft-delete the task (set `is_deleted = true`) and remove it from the task list.
>
> **Ubiquitous**: The system shall preserve historical check-in records of deleted tasks for statistics.

---

## 7. 核心流程

### 7.1 打卡流程

```
打开小程序
    │
    ▼
┌──────────┐    无任务    ┌─────────────────────┐
│ 今日任务  │ ──────────→  │ 空状态引导            │
│ 列表     │              │ "来添加你的第一个      │
└────┬─────┘              │  任务吧！" → 跳转设置  │
     │                    └─────────────────────┘
     │ 点击日期
     ▼
┌──────────┐
│ 日期选择  │  ← 日历月视图，可切换任意历史月份
└────┬─────┘
     │
     │ 点击任务
     ▼
┌──────────┐
│ 星星动画  │
│ 标记完成  │
│ 积分 +1  │
└────┬─────┘
     │
     ├── 非全部完成 → 更新进度条
     │
     └── 全部完成 → 庆祝动画 "太棒了！🌟"
```

### 7.2 撤销打卡流程

```
打卡页（任意日期）
    │
    │ 点击已打卡任务
    ▼
┌──────────────┐
│ 确认弹窗      │
│ "确定撤销     │
│  XXX的打卡吗？"│
└──────┬───────┘
       │
   ┌───┴───┐
   ▼       ▼
 确定     取消
   │       │
   ▼       └──→ 回到打卡页
删除打卡记录
重算统计数据
重算徽章（可能回收）
更新日历颜色
```

### 7.3 补打卡流程

```
打卡页
    │
    │ 点击顶部日期
    ▼
┌──────────────┐
│ 日历月视图    │  ← 可切换任意历史月份
│              │  ← 今天标记"今天"
│              │  ← 按时打卡=实心，补卡=空心
│              │  ← 未来日期灰色不可选
└──────┬───────┘
       │
       │ 选择某个过去日期
       ▼
┌──────────────┐
│ 该日任务列表  │  ← 展示当天任务 + 完成状态
│              │  ← 顶部显示"📅 3月14日 补卡"
└──────┬───────┘
       │
       │ 点击未打卡任务
       ▼
  播放星星动画
  标记完成（带补卡标识）
  更新统计
```

---

## 8. 交互说明

### 8.1 动画

| 触发 | 动画效果 | 时长 |
|------|----------|------|
| 完成打卡 | 任务卡片中央迸发 3-5 颗星星，向四周扩散消失；顶部星星数 +1 | ~600ms |
| 补打卡 | 同样播放星星动画，动画结束后卡片上出现「补」标签 | ~600ms |
| 全部完成 | 屏幕中央出现"🌟太棒了！🌟"文字 + 左右摇摆动画 | ~1500ms |
| 获得新徽章 | 徽章从灰色点亮为彩色，全屏光效 + 小松鼠果果弹出祝贺 | ~1500ms |
| 徽章被回收 | 徽章从彩色柔和过渡到灰色，轻微缩小（不做夸张负面效果） | ~600ms |

### 8.2 日期选择器

- 位置：打卡页顶部日期区域，点击展开
- 样式：日历月视图，可左右滑动切换月份
- 今天：高亮边框 + "今天"标签
- 过去日期：可点击跳转补卡
- 未来日期：灰色不可点击
- 补卡与按时打卡在日历上视觉区分：按时打卡 = 实心圆点，补卡 = 空心圆环（或小圆点标记）

### 8.3 补卡标识

- 打卡页：当前查看的是过去日期时，顶部显示"📅 补卡模式 · X月X日"提示条
- 统计页日历：按时打卡 = 实心圆点，补卡 = 空心圆环。日历颜色（绿/黄/灰/白）不区分补卡与按时——两者同等计入统计
- 设计意图：让孩子知道"这次是补的"，鼓励尽量当天完成。补卡不被惩罚（照样算入统计），但被温和地标记（视觉区分），培养"今日事今日毕"的意识

### 8.4 空状态

| 页面 | 空状态文案 | 说明 |
|------|-----------|------|
| 打卡页（无任务） | "来添加你的第一个任务吧！" + 快捷跳转按钮 | 鼓励孩子主动创建 |
| 统计页（无数据） | "坚持打卡，这里会显示你的成长记录哦～" | 正向引导 |
| 任务页（无任务） | "点击下方按钮，添加你的第一个任务吧！" | 主动邀请 |

### 8.5 错误状态

| 场景 | 处理方式 |
|------|----------|
| 网络异常 | 顶部 toast "网络好像不太稳定，下拉刷新试试～" |
| 云函数超时 | 操作失败提示，保留用户输入内容，可重试 |
| 数据加载中 | 骨架屏（任务卡片占位 + 闪烁效果） |

---

## 9. 数据模型 【v2.0 规划 · 设计基础】

> v1.0 实际为本地存储，未使用云数据库；以下集合为 v2.0 账户体系落地时的数据结构（随 v1.0 PRD 规划，现归位于 v2.0）。

### 9.1 云数据库集合

**tasks（任务表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 自动生成 |
| _openid | string | 用户微信 openid |
| name | string | 任务名称，最长 20 字 |
| purpose | string | 任务意义，选填，最长 50 字。引导孩子思考"为什么要做这个任务" |
| icon | string | 图标标识，如 "read" |
| repeat_type | string | 重复频率：`daily`(每天) / `weekday`(工作日) / `weekend`(周末) / `custom`(自定义) |
| repeat_days | array | 当 repeat_type=custom 时，存储生效的星期：[1,3,5] 表示周一三五 |
| sort_order | number | 排序序号 |
| is_deleted | boolean | 软删除标记，默认 false |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

**checkins（打卡记录表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 自动生成 |
| _openid | string | 用户微信 openid |
| task_id | string | 关联 tasks._id |
| date | string | 打卡日期，格式 YYYY-MM-DD（**注：这是任务所属日期，非打卡操作日期**） |
| is_backfill | boolean | 是否补打卡，默认 false。当 created_at 的日期晚于 date 时为 true |
| created_at | datetime | 打卡操作的实际时间 |

**badges（徽章表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 自动生成 |
| _openid | string | 用户微信 openid |
| badge_type | string | 徽章类型：sprout / growing / thriving / harvest / week_streak / month_streak / daily_champion |
| awarded_at | datetime | 获得时间 |
| is_active | boolean | 是否当前持有。撤销打卡导致条件不满足时置为 false |

### 9.2 索引设计

| 集合 | 索引 | 用途 |
|------|------|------|
| tasks | _openid + is_deleted | 查询用户有效任务 |
| checkins | _openid + date | 查询用户某日所有打卡记录 |
| checkins | _openid + task_id + date | 唯一约束（同一任务同一天只能有一条打卡记录） |
| badges | _openid + badge_type + is_active | 查询用户当前持有的徽章 |

### 9.3 关键数据规则

| 规则 | 说明 |
|------|------|
| 积分（星星） | 每完成 1 个任务打卡 → +1 星。撤销打卡 → -1 星。星星只增不减（除非撤销），不消耗 |
| 补卡判定 | `created_at` 的日期 > `date` 的日期 → `is_backfill = true` |
| 当天打卡 | `created_at` 的日期 = `date` 的日期 → `is_backfill = false` |
| 累计天数 | 统计 `checkins` 中 DISTINCT date 的数量（至少完成 1 个任务的日期，含补卡） |
| 连续天数 | 从今天往回数，连续有打卡记录的最长天数（含补卡） |
| 撤销打卡 | 物理删除 checkins 记录 → 积分 -1 → 重新计算累计/连续天数 → 重新判定徽章 |
| 删除任务 | 软删除（is_deleted=true），checkins 保留，统计不受影响 |

---

## 10. 设计风格指引

| 要素 | 规范 |
|------|------|
| 主色调 | 温暖绿色 #5CB85C + 暖黄色 #F0AD4E + 天空蓝 #5BC0DE |
| 背景色 | 浅奶油色 #FFF8F0 |
| 字体 | 系统默认字体，标题 36rpx，正文 28rpx，大号圆角 |
| 圆角 | 卡片 16rpx，按钮 24rpx |
| 图标风格 | 手绘感、圆润、色彩鲜明 |
| IP 形象 | 小松鼠"果果"，出现在空状态、加载页、徽章弹窗 |
| 打卡完成色 | 卡片背景变为浅绿色 #E8F5E9 |
| 打卡未完成 | 白色卡片 + 浅灰边框 |
| 补卡标识 | 卡片右上角小标签"补"，淡橙色背景 |

### 设计原则（服务于"孩子自我管理"目标）

1. **所有文案面向孩子**：不用"请家长""管理员"等表述，始终对孩子说话
2. **操作不设限**：孩子可以自由添加/编辑/删除任务、补打卡、撤销打卡——信任孩子，不做家长锁
3. **正向不惩罚**：连续天数断了归零但不指责，徽章可能回收但用温和动画
4. **透明可见**：补卡有标识、撤销有确认，让孩子对自己的行为有清晰的认知

---

## 11. 埋点需求

| 事件名 | 触发时机 | 属性 |
|--------|----------|------|
| page_view | 页面浏览 | page_name: home / stats / tasks |
| task_checkin | 完成任务打卡 | task_id, task_name, is_backfill, date, total_stars |
| task_undo | 撤销打卡 | task_id, task_name, date, total_stars |
| date_switch | 切换打卡日期 | from_date, to_date |
| task_add | 添加任务 | task_name, icon, repeat_type |
| task_edit | 编辑任务 | task_id, field_changed |
| task_delete | 删除任务 | task_id, task_name |
| badge_earned | 获得新徽章 | badge_type, trigger_type (stars/streak) |
| badge_revoked | 徽章被回收 | badge_type |
| all_complete | 当日全部完成 | task_count, date |

---

## 12. 成功指标

| 指标 | 类型 | 目标值 | 评估时间 |
|------|------|--------|----------|
| DAU（日活跃用户） | 滞后 | ≥ 50 | 上线 30 天 |
| 每日打卡完成率 | 先行 | ≥ 60%（当日至少完成 1 个任务） | 上线 7 天 |
| 人均每日打卡数 | 先行 | ≥ 2 次/天 | 上线 7 天 |
| 周留存率 | 滞后 | ≥ 40% | 上线 30 天 |
| 自主添加任务率 | 先行 | ≥ 50%（用户自行添加至少 1 个任务） | 上线 7 天 |
| 首枚徽章获得率 | 先行 | ≥ 30%（7天内获得至少1枚徽章） | 上线 7 天 |
| 补卡使用率 | 观察 | 10-30%（适度说明容错有价值，过高说明缺乏紧迫感） | 上线 30 天 |

---

## 13. 验收标准

### 13.1 今日打卡

- [ ] 打开小程序默认进入打卡页，展示今日任务列表
- [ ] 打卡页顶部按重要程度依次展示：火焰图标+连续天数（最左）、⭐星星积分（中）、日期+日历入口（右）
- [ ] 火焰图标在当日无完成任务时显示🪵（黑白），有完成任务时显示🔥（彩色+发光动画）
- [ ] 打卡页进度条下方展示当前累计星星总数（格式 ⭐ N）
- [ ] 无任务时显示空状态引导，可跳转到任务页创建
- [ ] 点击未打卡任务，播放星星动画后标记完成，星星数 +1
- [ ] 点击已打卡任务，弹出确认框，确认后撤销打卡，星星数 -1
- [ ] 撤销打卡后，任务恢复未完成状态，进度条更新
- [ ] 底部进度文案实时更新
- [ ] 全部完成时展示庆祝效果
- [ ] 跨天后所有任务自动重置为未完成
- [ ] 网络异常时显示错误提示并支持重试

### 13.2 补打卡

- [ ] 点击顶部日期可展开日历月视图
- [ ] 日历可左右滑动切换月份，不限制历史范围
- [ ] 选择过去日期后，页面切换到该日期的任务列表
- [ ] 在过去的日期上可以正常打卡，打卡后标记为补卡
- [ ] 补卡记录在日历上有视觉区分（实心=按时，空心=补卡）
- [ ] 补卡也算入累计天数和连续天数，也获得积分
- [ ] 未来日期不可点击

### 13.3 撤销打卡

- [ ] 任意日期（含今天和历史）的已打卡任务均可撤销
- [ ] 撤销需二次确认
- [ ] 撤销后打卡记录物理删除
- [ ] 撤销后统计和徽章实时重算
- [ ] 撤销导致累计天数低于徽章门槛时，徽章回收

### 13.4 打卡统计

- [ ] 连续打卡天数正确计算（含补卡记录）
- [ ] 中断一天后连续天数归零，但历史最高保留
- [ ] 撤销打卡导致连续中断时，重新计算
- [ ] 本周完成率计算正确
- [ ] 月度日历颜色正确（绿/黄/灰/白），补卡日期有视觉区分
- [ ] 徽章墙展示所有徽章，已获得彩色+发光，未获得灰色+锁定+进度文字
- [ ] 累计星星达标获得积分类徽章并有全屏点亮动画
- [ ] 连续天数达标获得行为类徽章并有动画
- [ ] 撤销导致条件不满足时徽章回收，温和灰化动画
- [ ] 新徽章获得时小松鼠果果出现祝贺

### 13.5 任务管理

- [ ] 可添加任务（名称 + 任务意义选填 + 图标 + 重复周期）
- [ ] 任务意义字段选填，最长 50 字，placeholder 为"比如：认识更多字、身体更健康..."
- [ ] 可编辑已有任务（名称、任务意义、图标、重复周期）
- [ ] 编辑任务不影响历史打卡数据
- [ ] 修改周期仅对未来日期生效
- [ ] 任务名称不能为空，最长 20 字
- [ ] 图标库至少 12 个图标可选
- [ ] 重复周期支持：每天 / 工作日 / 周末 / 自定义星期，默认每天
- [ ] 自定义星期可勾选周一至周日任意组合
- [ ] 任务上限 6 个，超出时友好提示
- [ ] 可删除任务，二次确认
- [ ] 删除后打卡列表不再显示该任务
- [ ] 删除后历史打卡数据保留，统计不受影响
- [ ] 打卡页仅展示当天应出现的任务（按周期过滤）
- [ ] 当天无安排的任务时，显示休息日提示
- [ ] 数据云端同步，换设备可恢复

---

## 14. 边界场景补充

| 场景 | 处理 |
|------|------|
| 补卡后又撤销 | 允许，物理删除补卡记录，回到未完成状态，积分 -1 |
| 同一天同一任务重复补卡 | 唯一索引阻止，不会产生重复记录 |
| 跨天后补昨天+今天都打卡 | 两天的打卡独立，连续天数正常递增，积分各自 +1 |
| 撤销了唯一一次打卡导致当天变空白 | 当天从绿色/黄色变灰色，连续天数可能中断，积分 -1 |
| 撤销导致积分降到徽章门槛以下 | 徽章回收，温和灰化动画 |
| 删除任务后该任务的历史打卡 | 保留，统计中该任务不再出现但历史数据仍在 |
| 所有任务被删除 | 打卡页变空状态，统计保留历史数据，积分保留 |
| 补卡日期很久远（如半年前） | 允许，标记为补卡，日历上空心显示 |

---

## 15. 待确认问题

| # | 问题 | 负责人 | 状态 |
|---|------|--------|------|
| 1 | 小程序名称"成长小树苗"是否最终确定？ | 产品 | 待定 |
| 2 | 是否需要设计小松鼠"果果"的完整 IP 形象？ | 设计师 | 待定 |
| 3 | 微信云开发环境是否已就绪？ | 研发 | 待定 |

---

## 16. 版本规划

| 版本 | 范围 | 预计 |
|------|------|------|
| v1.0 MVP | 今日打卡（含补卡+撤销）+ 打卡统计（含徽章）+ 任务管理 | 当前（已上线） |
| v1.1 | **成长可视化**：打卡获得星星 → 星星兑换水和肥料 → 小树苗逐渐长大（幼苗→小树→开花→结果）。每次打卡后展示小树当前状态，让坚持变得看得见。 + 微信订阅消息推送 | 后续 |
| v1.2 | 时间段设置 + 节日限定徽章 + 主题挑战徽章 + 更多图标和主题 | 后续 |
| v2.0 | **账户体系 + 跨设备云同步**：微信云开发 + `openid` 用户标识、用户信息页（昵称/头像）、本地数据迁移上云、多人数据隔离（详见文末「版本 2.0」章节）。*注：个人号无法做商业化/支付，故移除原"商业化探索"* | 近期 |

---

## 版本 2.0（账户体系，规划中）

> **目标**：让「成长小树苗」从"单设备单人"升级为"多用户跨设备云同步"——多个孩子/家庭成员各自独立使用、数据云端保存、换手机不丢。
> **已确认范围（2026-07-16）**：多用户形态 = 跨设备云同步；用户信息页字段 = openid + 头像 + 昵称。
> **重提审影响**：v2.0 上线须重新提审（正常新版本流程，类目仍为「工具」无需新资质）；隐私指引须补充 openid/头像/昵称声明。详见 `微信小程序提审攻略-2026.md`。

### 2.0.1 背景与目标
- v1.0 数据存于 `wx.setStorageSync`，仅限本机本用户。换设备/清缓存即丢失，且无法多人共用一台手机的数据隔离。
- v2.0 引入微信账户体系：以 `openid` 为用户唯一标识，数据托管至微信云开发（云数据库），实现跨设备同步与多用户隔离。

### 2.0.2 用户故事
- 作为家长，我希望两个孩子在同一台/不同台手机上各有独立打卡记录，互不干扰。
- 作为用户，我希望换手机后登录微信即可看到历史打卡与徽章，不丢失。

### 2.0.3 功能清单
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 微信登录（静默） | `wx.login` → 云函数取 `openid`，无注册/密码 | P0 |
| 我的成长页·用户信息区 | 展示/编辑昵称、头像；入口置于「我的成长」Tab 页内，就地点改，不新增独立「我的」页 | P0 |
| 云端数据读写 | 打卡/统计/任务改走云数据库（按 `_openid` 隔离） | P0 |
| 跨设备同步 | 任意设备登录同一微信即见同一份数据 | P0 |
| 本地→云迁移 | 首次云登录时把本机 `wx.setStorageSync` 旧数据搬上云（归属当前 openid） | P0 |
| 退出登录 | 个人号无需多账号切换；提供“退出登录”按钮清空本地态（入口在「我的成长」页底部） | P1 |

### 2.0.4 需求详述（EARS）
- **Ubiquitous**：系统始终以 `openid` 作为用户数据隔离维度。
- **Event-driven**：当用户首次进入且本地无 openid 时，系统 shall 调用 `wx.login` 获取并写入云数据库用户档案。
- **Event-driven**：当用户在「我的成长」页·用户信息区确认昵称/头像时，系统 shall 将字段写入该 openid 的用户档案。
- **State-driven**：当应用启动且网络可用时，系统 shall 从云数据库加载当前 openid 的打卡/任务/徽章数据。
- **Unwanted**：若云同步失败（网络/超时），系统 shall 降级为本地缓存可读、并提示"同步失败，稍后重试"，不丢本地操作。
- **Unwanted**：若本地存在 v1.0 旧数据且云端为空，系统 shall 触发迁移而非覆盖。

### 2.0.5 我的成长页·用户信息交互
- 昵称：使用 `<input type="nickname">`（官方「昵称填写」能力），避开 `wx.getUserProfile` 返回灰色匿名头像/昵称的坑。
- 头像：使用 `chooseAvatar` 按钮选择，临时文件上传至云存储得 fileID 后保存。
- 不收集真实姓名、人脸、证件号（面向 7–8 岁儿童的合规红线）。

### 2.0.6 数据迁移方案（v1.0 本地 → v2.0 云）
1. 首次云登录成功且云端该 openid 无数据 → 读取 `wx.setStorageSync` 的 tasks/checkins/badges。
2. 逐集合写入云数据库（带 `_openid`）。
3. 迁移完成后标记本地 `migrated=true`，原本地数据保留一段时间作为回滚兜底，确认稳定后清理。
4. 边界：若云端已有数据（如曾在另一设备登录），以云端为准，不覆盖。

### 2.0.7 隐私声明清单（提审前必配）
| 采集项 | 隐私指引勾选项 | 对应接口 |
|--------|--------------|---------|
| 微信 openid | 收集你的微信 OpenID | `wx.login` → 云函数 `getWXContext` |
| 昵称 | 收集你选中的昵称（如昵称、姓名等） | `<input type="nickname">` |
| 头像 | 收集你的头像 | `chooseAvatar` + 云存储上传 |

> 原则：**声明 = 调用**。未声明项若被调用将报 `errno 112` 或被回收权限。

### 2.0.8 验收标准
- [ ] 新装/清缓存后首次进入，静默登录并在云端创建用户档案，无注册流程
- [ ] 两个不同微信账号数据完全隔离（A 看不到 B 的打卡）
- [ ] 同一微信在设备 X 打卡，设备 Y 登录后可见（跨设备同步）
- [ ] v1.0 老用户首次登录，本地历史数据完整迁移至云端且可正常展示
- [ ] 我的成长页·用户信息区可改昵称/头像，重启后保持
- [ ] 弱网/同步失败时降级本地可读并提示，不崩溃不丢操作
- [ ] 隐私指引已声明 openid/昵称/头像三项，提审通过

### 2.0.9 边界场景
- **拒绝隐私授权**：官方弹窗自动弹出，拒绝则相关接口报错，需引导同意后方可使用账户功能。
- **同微信多孩子**：当前模型"一个微信 = 一个用户"，多孩子共用同一微信则数据在同一账户（符合二年级真实场景）；如需同微信内多档案，列为后续迭代。
- **个人号限制**：不可做支付/社交/UGC，故 v2.0 不含商业化与公开排行榜。
