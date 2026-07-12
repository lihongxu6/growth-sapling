# 项目记忆（每次会话第一步必读）

> 本文件是 Sophia（AI 产品助理）的长期记忆载体。

**读取规则（强制）**：
- 每次新会话启动时，系统提示词会强制 Sophia **第一步**先读本文件，再回复用户。
- 同一次会话内上下文持续存在，无需反复读取。

**写入规则（强制）**：
- 每次 Sophia 产出**任何需要被记住的新知识**（用户反馈、决策、踩坑、规则变更、流程推进），必须在**回复结尾前**检查并更新本文件。更新后必须 commit + push。
- 检查清单：是否有新规则要加？是否有踩坑要记？流程位置是否变了？用户偏好是否有新增？
- **如果忘记了更新 MEMORY.md，下次会话将丢失本次所有新知识。**

---

## 1. 项目身份

- **项目名**：成长小树苗
- **产品**：面向小学二年级（7-8 岁）小朋友的习惯养成打卡微信小程序
- **核心理念**：**帮助孩子自我管理**，而非家长监督工具
- **IP 形象**：小松鼠"果果"（**正式插画已生成**：2026-07-12，AI 生成卡通松鼠在 `/workspace/miniprogram-assets/avatar.png`，与开屏/空状态/庆祝场景 IP 形象保持一致）
- **GitHub**：`lihongxu6/growth-sapling`（公开）
- **线上 Demo**：https://lihongxu6.github.io/growth-sapling/
- **Git author**：`lihongxu6 <lihongxu6@users.noreply.github.com>`

---

## 2. 当前流程位置

```
PRD ✅ → 设计评审 ✅ → 原型(已冻结) ✅ → UI设计稿(Route A) ✅ → 技术方案.md ✅ → 代码 ✅ → 测试验证 ✅
```

**v1.0 状态**：产品代码完成，自动化 25/25 ✅ + 手动 14/14 ✅ 全部通过，已上线 GitHub Pages（https://lihongxu6.github.io/growth-sapling/）。

**新工作流（v1.1 方向）**：微信小程序适配 — 让产品跑通在微信小程序环境。方案待用户确认（WebView 包装 vs 原生重写）。

**已交付文件**：
- `prd-成长小树苗-mvp.md` — 需求真源
- `design-review-成长小树苗.md` — 设计评审材料
- `design-spec-成长小树苗.md` — 视觉规范文档（视觉 SSOT，含 §8.1 交互逻辑清单）
- `tech-spec-成长小树苗.md` — 技术方案（微信小程序原生，精简版，仅前端）
- `index.html` — **唯一产品代码文件**（GitHub Pages 入口，修改即上线）
- `MEMORY.md` — 本文件

> 已清理文件：prototype-成长小树苗.html（已冻结旧原型）、ui-mockup-成长小树苗.html（与 index 重复）。Git 历史完整保留，可随时回溯。

---

## 3. 用户偏好与决策（最重要）

### 3.1 流程纪律
- **严格按产研流程走**：原型 → UI 设计稿 → 技术方案.md → 代码 → 测试验证，每环评审通过才进下一环。
- **不许跳过任何一环**。用户明确反感"直接在原型上改样式"的做法——那导致质量差。
- **Harness Engineering**：每个交付物是下一阶段的精确输入锚点。
- **Route A**：无 Figma，沙箱内出高保真 HTML/CSS 视觉稿 + 视觉规范文档。不引入外部账号。
- **整体路线一次规划、分步执行**：本轮只做当前环，下一环需用户确认再启动。

### 3.2 沟通偏好
- 每次询问用户的问题 ≤ 3 个。
- **业务决策必须先给方案 → 用户确认 → 再执行，绝不可跳过确认直接改代码。**
- **代码修改两步走**：① 本地修改（不改 index.html），用户确认效果；② 用户点头后才 commit + push 上线。
- 改代码/文档后必须提供 `git diff` 给用户核对。
- 每次提交附 commit message + push，线上 Demo 同步更新。
- **每个阶段完成后，主动提醒用户将成果流转给下一环节。**
- **环境调试适可而止**：技能行为已通过 MEMORY.md 在本项目生效，不纠结沙箱/客户端加载细节；遇到环境类问题先判断是否阻塞主线，不阻塞则跳过（详见会话记录：新会话 git 连接失败，但当前会话正常、文件已 push 到 GitHub，无需纠缠）。

### 3.3 设计偏好（已确认）
- **状态栏**：极简安全区，无品牌名、无假时间(9:41)、无信号/电量图标。
- **品牌名**：放在开屏页（1.5s 淡出），日常流程不重复。
- **火焰图标**：今日无完成 = 🪵；今日有完成 = 🔥 发光。
- **星星数**：顶部信息栏居中，进度条下方不重复；随打卡/撤销实时联动（calcStars）。
- **补卡不限 7 天**，任意历史日期可补卡。
- **底部导航**始终贴底，含安全区适配。
- **数据源必须打通**：打卡页与统计页不能有数据脱节。

### 3.4 技术决策（2026-07-11 技术方案评审确认）
- **连续天数截止**：按自然日 00:00 重置，非 24h 滚动窗口
- **emoji 切手绘**：不紧急，待插画师交付后替换文件即可
- **技术细节**（ID 生成策略 / 低端机阈值 / 分包策略）：AI 在实现时自行决策，无需用户纠结
- **数据持久化**：H5 演示期用 localStorage，转小程序时切 wx.setStorageSync
- **小程序路线**：个人号 + 原生重写（Route B）+ 工具类目，0 成本。WebView 不可用（个人号限制，已验证官方文档）。
- **自动同步**：使用微信官方 miniprogram-ci（CLI 工具），沙箱内编译 + 生成预览二维码，无需用户安装 DevTools。

### 3.5 研发阶段质量约束（2026-07-12 新增）

> 以下规则适用于小程序原生代码开发阶段。每次编写/修改代码文件时，AI 必须逐条自查。

- **QC1 多文件一致性**：修改数据模型（如 `mgmtTasks` 结构）时，必须同步更新所有引用该数据的页面 JS 文件。
- **QC2 WXML/WXSS/JS 三件套**：每个页面必须包含同名三件套，且 `app.json` 中 `pages` 数组已注册。漏注册 = 页面不存在。
- **QC3 编译自查**：每完成一个 Phase，必须运行 `miniprogram-ci` 编译检查，编译未通过前不允许进入下一 Phase。
- **QC4 数据绑定完整性**：WXML 中 `{{ }}` 引用的变量必须在对应 JS 的 `data` 中声明。setData 的 key 必须与 WXML 绑定名一致。
- **QC5 交互逻辑回归**：移植 H5 代码时，必须对照 MEMORY §5 交互逻辑清单逐条验证，确保无回归。
- **QC6 交付前检查清单**：每次交付给用户验证前，AI 必须跑完编译检查 + 交互逻辑清单回归，并在回复中报告结果。
- **QC7 微信官方文档优先**：涉及小程序 API/组件/限制的判断，必须基于官方文档，不凭训练记忆。

---

## 4. 踩过的坑（规则变更日志）

> 以下每一条都来自用户反馈的 bug，修复后沉淀为规则。

| # | 日期 | 问题 | 根因 | 规则 | 对应清单 |
|---|------|------|------|------|----------|
| 1 | 2026-07 | 状态栏出现 "9:41" 假时间 | 原型硬编码模拟 iPhone 时间 | 状态栏不显示假时间、信号/电量图标 | design-spec §3.1 |
| 2 | 2026-07 | 打卡/任务页顶部标题未吸顶 | 页面标题在滚动容器内但无 sticky | 三页标题统一 `position:sticky` | CSS .home-header |
| 3 | 2026-07 | 从原型重写设计稿时逻辑回归 | 重写只关注视觉，未继承交互逻辑 | 建立 §8.1 交互逻辑清单作为跨稿回归基线 | MEMORY §4 |
| 4 | 2026-07 | 今天出现「补」标签 | 补卡模式设置的 backfill=true 回今日未清除 | renderHome 入口：isToday 时强制清除所有 backfill | L1.4 |
| 5 | 2026-07 | 统计页日历与打卡页数据不一致 | 两个独立数据源（homeTasks vs checkinsByDate） | 今日 SSOT = homeTasks；统计页 derive 而非独立 mock | L1.5 |
| 6 | 2026-07 | 星星数不随打卡联动 | STARS=23 是写死常量 | 改为 calcStars() = 7 + 全部历史已打卡数 | L1.6 |
| 7 | 2026-07 | 补卡后没显示「补」标签 | onTaskClick 补卡时未设 backfill=true | 补卡模式 (viewDate<TODAY) 打勾时 t.backfill=true | L1.1 |
| 8 | 2026-07 | 撤销打卡没二次确认 | toggleTask 直接翻转状态 | 已完成点任务 → 弹确认弹窗，区分「打卡/补卡」动词 | L3 |
| 9 | 2026-07 | 统计页日历点击不跳转 | 格子无 onclick | 过去日期格 onclick="pickDate(d)" | L6 |
| 10 | 2026-07 | 日历语义错误（橙色=部分完成） | 语义定义不清晰 | 🟢 绿=全完成无补卡；🟠 橙=全完成含补卡+「补」标记；⚪ 灰=部分/未完成 | L8.4 |
| 11 | 2026-07 | 无记忆机制，每次会话从头来 | AI 无跨会话记忆 | 建立 MEMORY.md + 写入项目提示词 | 本文件 |
| 12 | 2026-07-11 | pickDate 跳转历史日时打卡页 done 数不对（日历绿但打卡页只有 2/4） | ① pickDate 重建任务快照时硬编码 defDone=[1,4]，未读取 checkinsByDate.done；② 初始化未存今日快照，切回今日时 loadSnapshot fallback 到污染数据 | pickDate 重建时按 ci.done 动态取前 N 个任务标记完成；初始化时 saveSnapshot(isoOf(TODAY)) | L1.7 |
| 13 | 2026-07-11 | 线上 Demo 加载的是 index.html（GitHub Pages 入口），与 ui-mockup 同步错位 | 早期手动同步过 index.html 但后来更新 ui-mockup 时忘了同步 | 建立 pre-commit hook：ui-mockup 修改时自动 cp 到 index.html | — |
| 14 | 2026-07-11 | calcStars 打卡 +2 星 / 撤销 -2 星 | 把今日 done 在 checkinsByDate 和 homeTasks 各算一遍 | 今日从 homeTasks 实时计算（去重），历史日累加 checkinsByDate | — |
| 15 | 2026-07-11 | 火焰图标：历史日 0 完成仍显示 🔥 | fireLit=isPast\|\|...，历史日强制点亮 | fireLit=homeTasks.some(t=>t.done)，纯按当日完成状态 | — |
| 16 | 2026-07-11 | Skill 自动安装到沙箱无法被 WorkBuddy 识别 | ① 沙箱 Skill 扫描仅启动时执行；② 扫描路径要求 SKILL.md 在第一层子目录；③ 客户端上传接受 .zip 非 .skill | Skill 安装包用 .zip 格式，通过客户端「技能管理」上传；独立仓库管理，不放产品代码仓库 | — |
| 17 | 2026-07-12 | 技术方案 §8 小程序适配基于训练知识未验证官方文档 | 写方案时未实时核对微信官方文档 | **关键技术方案必须对照官方文档验证后再落地**。已验证：① web-view **个人类型小程序不支持**（路线 A 硬阻塞）；② WXSS 支持 CSS 变量但 app.wxss 不自动跨文件继承，需每页 `@import`；③ rpx×2 换算正确；④ 100dvh 不支持改 100vh+safe-area；⑤ wx.setStorageSync 为同步 API | — |
| 16 | 2026-07-11 | Skill 自动安装到沙箱无法被 WorkBuddy 识别 | ① 沙箱 Skill 扫描仅启动时执行；② 扫描路径要求 SKILL.md 在第一层子目录；③ 客户端上传接受 .zip 非 .skill | Skill 安装包用 .zip 格式，通过客户端「技能管理」上传；独立仓库管理，不放产品代码仓库 | — |

---

## 5. 关键规则速查（design-spec §8.1 同步镜像）

> 每次改代码/设计稿前，先对照此清单做回归检查。

- **L1**：今天不显示「补」标签
- **L1.1**：补卡模式打勾自动标 backfill
- **L1.2**：按期打卡不标 backfill（仅 viewDate<today 时）
- **L1.3**：撤销补卡清除 backfill
- **L1.4**：今日永不显示补卡（renderHome 入口清 backfill）
- **L1.5**：今日打卡数据与统计页数据源打通（今日 SSOT=homeTasks）
- **L1.6**：星星数随打卡操作联动（calcStars）
- **L3**：撤销打卡二次确认（区分打卡/补卡动词）
- **L6**：日历点击切换日期并跳回打卡页
- **L8.1**：统计页日历显示日期数字
- **L8.2**：补卡卡片视觉区分（淡橙底 + 右上角「补」标签）
- **L8.3**：补卡模式 banner
- **L8.4**：统计页日历数据源 = checkinsByDate（绿/橙/灰语义）
- **L8.5**：今日补卡状态联动日历（绿↔橙 +「补」标记）
- **L1.7**：pickDate 重建历史日快照时，done 数必须匹配 checkinsByDate.done，不可硬编码 defDone
- **L12**：状态栏极简（无品牌名/假时间/信号/电量）

---
## 7. Skill 体系

### 7.1 分流策略

| 类型 | 存放位置 | 例子 |
|------|---------|------|
| **通用 Skill**（跨项目复用） | 独立仓库 [`lihongxu6/workbuddy-skills`](https://github.com/lihongxu6/workbuddy-skills) | project-memory |
| **项目专属 Skill**（仅本项目的业务能力） | `/workspace/skills/` 随项目仓库 | 暂无（待创建） |

### 7.2 通用 Skill 清单

| Skill | 仓库 | 状态 |
|-------|------|------|
| project-memory | https://github.com/lihongxu6/workbuddy-skills | ✅ v1.0 已发布 |
| code-change-workflow | https://github.com/lihongxu6/workbuddy-skills | ✅ v1.0 已发布 |
| dev-pipeline-orchestrator | https://github.com/lihongxu6/workbuddy-skills | ✅ v1.0 已发布 |
| test-automation | https://github.com/lihongxu6/workbuddy-skills | ✅ v1.0 已发布 |

**Skill 说明**：
- **project-memory**：跨会话项目记忆系统（三条铁律：读/写/查 MEMORY.md）
- **code-change-workflow**：代码修改强制两步确认流程（方案→确认→改→确认→上线），直接防止再犯规
- **dev-pipeline-orchestrator**：产研全流程编排器，自动告诉你当前阶段和下一步
- **test-automation**：测试一体化，从 PRD 自动生成测试用例矩阵和可执行脚本

**如何生效**：从 https://github.com/lihongxu6/workbuddy-skills 下载对应 Skill 目录下的 `.zip` 文件，在 WorkBuddy 客户端「技能管理」上传。上传成功后**下次新会话**生效。

### 7.3 项目专属 Skill 清单

| Skill | 文件位置 | 状态 |
|-------|---------|------|
| （暂无） | `/workspace/skills/` | 待后续有需要时创建 |

## 6. 下一步

1. ✅ 测试验证完成（自动化 25/25 ✅，手动验收 14/14 ✅）
2. ✅ Skill 体系建立（4 个通用 Skill 已发布到 workbuddy-skills 独立仓库）
3. 🔜 微信小程序适配（**方案已定**）：个人号 + 原生重写（Route B）+ 工具类目，0 成本上线看反馈
   - 官方验证（#17）：web-view 个人不支持 → Route A 出局，走 Route B 原生
   - 类目：成长小树苗属习惯养成/健康管理，挂「工具/实用工具」个人可申、无资质
   - 成本：个人号 0 注册费 + localStorage 无服务器 = 真 0 成本
   - 待确认：① MP 代码放 `/workspace/miniprogram/` 子目录？② 先交付 Phase1(脚手架)+Phase2(打卡页) MVP？
4. 可选：上线复盘报告、v1.1 功能规划
