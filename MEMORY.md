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
- **IP 形象**：小松鼠"果果"（**生成状态**：2026-07-13 已用 ImageGen + rembg 生成多版透明背景图，但**实际渲染均不可用**——`avatar-transparent.png` 是空透明 PNG（仅剩稀疏橙线），线稿不适合 rembg 处理。二期需要重新设计生成方案：用"高对比度+厚重色块"风格重新生成，或委托插画师手绘。**当前所有视觉/庆祝场景继续用 🐿️ emoji 占位**）
- **GitHub**：`lihongxu6/growth-sapling`（公开）
- **线上 Demo**：https://lihongxu6.github.io/growth-sapling/
- **Git author**：`lihongxu6 <lihongxu6@users.noreply.github.com>`

---

## 2. 当前流程位置

```
PRD ✅ → 设计评审 ✅ → 原型(已冻结) ✅ → UI设计稿(Route A) ✅ → 技术方案.md ✅ → H5代码 ✅ → H5测试验证 ✅ → 小程序MVP ✅ → MVP复盘 ✅
```

**v1.0 状态**：产品代码完成，自动化 25/25 ✅ + 手动 14/14 ✅ 全部通过，已上线 GitHub Pages（https://lihongxu6.github.io/growth-sapling/）。

**v1.1 小程序 MVP 状态**：**MVP 已完成** ✅，3 个页面（打卡/统计/任务）基本功能可用，CI 编译链已打通，30 条踩坑已沉淀。**MVP 复盘文档已交付**（`mvp-review-成长小树苗.md`）。
- **已交付**：小程序代码（15 文件/54.3KB）、CI 编译脚本、asset-generation Skill、MVP 复盘
- **待处理**：统计页/任务页视频分析修复（用户已录制待发送）
- **下一步**：用户确认复盘内容 → 启动二期 P0 项（审核材料准备 + 松鼠 IP 集成 + 庆祝动画增强）

**已交付文件**：
- `prd-成长小树苗-mvp.md` — 需求真源
- `design-review-成长小树苗.md` — 设计评审材料
- `design-spec-成长小树苗.md` — 视觉规范文档（视觉 SSOT，含 §8.1 交互逻辑清单）
- `tech-spec-成长小树苗.md` — 技术方案（微信小程序原生，精简版，仅前端）
- `index.html` — H5 产品代码（GitHub Pages 入口）
- `mvp-review-成长小树苗.md` — MVP 复盘 & 二期规划（本次新增）
- `MEMORY.md` — 本文件

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
- **创意产物也需两步确认**（2026-07-12 新增）：生成图像、文案、命名、配色等"看起来是改进"的产物，属于业务决策。流程：① 生成多版本给你看 → ② 你选/给反馈 → ③ 仅在你点头后才 commit + push。**绝不"觉得是改进就直接提交"**。

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

### 3.6 文案决策（2026-07-16 确认）
- **未来日期 banner 文案**：选未来日期时，打卡页顶部 banner 显示「⏰ 不要着急，到这天了才可以打卡哦」（⏰ 图标）；历史补卡保持「📅 正在为 X月X日 补卡」。点击未来日期任务卡片的 toast 文案同步一致。
- 根因：`isBackfill` 原逻辑 `!isToday(viewDate)` 把未来日期也判为补卡模式，导致 banner 误显示。
- 修改文件：`miniprogram/pages/home/home.js`（isBackfill 逻辑 + toast 文案）、`miniprogram/pages/home/home.wxml`（banner 加 `wx:if="{{isFuture}}"` + `wx:elif="{{isBackfill}}"` 分支）。

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
| 18 | 2026-07-12 | 头像生成后未等用户确认直接 commit + push | 觉得"优化版"是改进就直接提交 | **创意产物（图像、文案、命名）属于业务决策，必须先出方案→用户确认→再 commit**。生成后只给用户看，不动 Git；用户点头后才 commit + push | — |
| 19 | 2026-07-12 | ImageGen 的 `background: "transparent"` 实际未生效；rembg 默认模式在深色背景会暴露"灰雾" | 模型把"透明"位置填成浅灰色（RGB 无 alpha 通道）；rembg 默认会把原图浅色阴影当成半透明前景保留 | 想要真正的透明 PNG：**ImageGen 出图 → rembg `alpha_matting=True, alpha_matting_foreground_threshold=240`** 二次处理。验收：PIL 读图 mode 必须是 RGBA 且角点 alpha=0，在深色背景预览无灰雾 | — |
| 20 | 2026-07-12 | miniprogram-ci preview 报 `invalid ip`，无法生成预览 | 微信后台默认开启 IP 白名单，沙箱 IP `106.55.101.218` 不在白名单 | 预览/上传前必须把沙箱 IP 加入白名单（个人开发可关闭白名单）。预览时还会要求传 `project` 对象，参数名是 `qrcodeOutputDest`（不是 `qrcodeOutputPath`）| — |
| 21 | 2026-07-12 | 首次扫码预览发现大量样式和逻辑问题 | Phase 1 代码为快速搭建骨架，CSS 变量/字号/圆角/背景色未严格对齐 design-spec；庆祝弹层触发条件有 bug（3/4 完成即弹出） | 每次 Phase 完成后必须跑一遍「对版检查清单」对照 design-spec 和 H5 index.html 逐项验证。celebrate 条件需用 toggle 前的实时数据判断（`Store.getActiveTasks().length`），而非依赖 setData 后的 this.data | — |
| 22 | 2026-07-12 | 修复声称生效但用户截图显示未生效 | 1) WXML 不可调用 data 里的函数（`{{fmtDate(viewDate)}}` 传函数引用会失败）→ JS 计算后存为 `viewDateFmt` 字符串传给 WXML；2) TabBar iconPath 实际渲染仅中心 27x27 区域，81x81 满铺圆点会被裁掉 → 改画中心 27x27 圆 | **改完代码必须对照实际渲染验证**（ffmpeg 切帧或用户截图），不能只 grep "已改" 就说修好 | — |
| 23 | 2026-07-13 | 沙箱 IP 变更导致 miniprogram-ci preview 再次报 invalid ip | 沙箱 IP 从 106.55.101.218 变为 159.75.181.44 | 微信后台关闭 IP 白名单（开发阶段），避免沙箱 IP 漂移反复加白 | — |
| 24 | 2026-07-13 | TabBar 图标太小（用户反馈"红框处小了"） | 图标内容 28×28 在 81×81 画布中心，占比太小 | 图标内容应填满 54×54 内容区（画布的 60-70%），不是撑满 81×81 但也不能太小 | — |
| 25 | 2026-07-13 | AI 自己拍脑袋画图标（小树苗/树+草地/星星+清单），用户指出"为什么不直接用设计稿中的图标" | ① 未先学习图标设计规范；② 未出提案直接画了提交；③ 追求创意隐喻而非通用可识别图形 | **生成图片类资产前必须：① 先学规范（WebSearch + WebFetch）；② 出 3 套提案让用户选；③ 用通用图形不玩创意隐喻**。已沉淀为 Skill：asset-generation | — |
| 26 | 2026-07-13 | 图标风格混搭 + 双态不一致 + 撑满画布 | 对 TabBar 图标设计原则（双态、一致性、安全区）零了解 | 见 asset-generation Skill 的 6 条原则（§0 先学规范、§1 提案制、§2 画布≠内容区、§3 双态设计、§4 视觉一致性、§5 可识别性优先） | — |
| 27 | 2026-07-13 | 用户发现"一半问题是没按设计稿来自己发挥了"——徽章加了锁而非 grayscale、进度文案用固定 desc 而非动态计算、统计页缺标题/环图等 12 项不一致 | Phase 1 代码搭建时只粗略移植了视觉骨架，细节（灰度、动态文案、环图、斜体等）全部被省略或自己发挥 | **每次编写小程序代码前必须先逐项对照 H5 index.html 设计稿**，不得凭印象发挥。任何"觉得这样做更好"的改动必须先出方案让用户确认（对齐 MEMORY §3.2 两步确认流程）。本次建立 audit-vs-design.md 对版审计机制 | — |
| 28 | 2026-07-13 | 用户反馈"我得了 12 颗星但新芽初绽还没获得" | H5 设计稿的 `recalcBadges()` 函数在打卡后检查 stars/streak 是否达标并写入 `state.badges`，但**小程序 Store 完全没有这个函数**，导致 `state.badges` 永远是空数组。状态页的"已获得"判断读不到任何记录 | **移植 H5 → 小程序时，UI/视觉/交互容易看到，核心数据流（recalc/save/load）容易漏**。每个 Store 函数都必须显式列出并写注释来源（"移植自 index.html §X"）。本次在 `toggleTask` 末尾 + `app.js onLaunch` 都加了 `recalcBadges()` 调用 | — |
| 29 | 2026-07-13 | 用户反馈"周一到周日的这个选择设计太丑了"，7 个圆形小球 + "周"+"一"换行 + 纯绿大色块 | 没有先查"周选择器"的设计规范就自作主张画了一组小圆球。设计原则：① 7 个选项用 Segmented Control 扩展形态（等宽等高）；② 选中态用绿底白字，未选中白底细边；③ 避免密集小圆球（视觉太碎） | **任何 UI 组件都要先查设计规范**（设计原则/竞品/平台规范），再出 3 套方案让用户选，最后实现。已在 #25/#26/#28 基础上形成完整 UI 流程：查规范 → 出 3 套提案 → 用户选 → 实现 → 编译验证 | — |
| 30 | 2026-07-13 | 弹窗标题被遮挡 + 删除任务拉起添加弹窗 | ① form-panel 内嵌 scroll-view，flex 布局下 scroll-view 撑大后 form-title-row 被挤出可视区；② task-mgmt-card 上 `bindtap="onEdit"`，子按钮删除事件冒泡触发 onEdit | **小程序弹窗稳定方案**：form-panel(view, max-height+overflow:hidden) + form-title-row(view, flex-shrink:0 固定) + form-scroll(view, flex:1 + overflow-y:auto)。**view 销毁重建时滚动位置自动归零**——无需 scrollTop 编程式重置。**子按钮必须用 catchtap 阻止冒泡**到父级卡片 | — |
| 31 | 2026-07-15 | **修正**：之前误把 `avatar-transparent.png` 标为"不可用空透明 PNG" | 实际是 RGBA 1024×1024 的完整橙色松鼠插画（拿洒水壶抱绿叶），alpha=0 是文件本身属性，非"空"；用户在浅灰预览背景看 RGBA 图像时，色彩"溢出"看起来像未渲染 | **RGBA 透明图验收必须看真机渲染/小程序渲染，不能凭 alpha 数值判断**。`avatar-transparent.png` 是定稿，原 144 缩略图也可保留 | — |
| 32 | 2026-07-13 | 仓库 1.9MB 过程文件堆积（视频/帧/原图/旧版本 Skill） | 早期未对仓库做定期清理，调试/分析用的中间产物一直累积 | **每完成一个大阶段，必须清理过程文件**。清理清单：① 视频/帧分析完后立即删；② 原图被定稿替代时删；③ 旧版本 Skill/MEMORY 被新版本替代时删；④ .gitignore 注释需同步更新引用过的文件名 | — |
| 33 | 2026-07-15 | 松鼠 IP 跨平台/跨尺寸一致性 | 用户最终选定从 workbuddy 分享链接 `GUs-oFXSEf8wW-...` 的橙色松鼠作定稿 | **跨工具/跨会话资产交付**：AI 出图 → 用户在客户端确认 → 客户端生成 share 链接 → AI 通过 share 内容理解（而非下载链接）→ 使用同一定稿。**同主题不同版本会破坏形象一致性**（用户原话"保持松鼠形象的一致性"）。已撤掉 5 个 AI 自动生成 squirrel 文件，保留原 avatar 系列 | — |
| 34 | 2026-07-15 | 客户端缓存导致"修了但没修好"——白底图标/导航栏标题都出现 | miniprogram-ci 推送后微信客户端会缓存旧资源；用户扫码看到的是旧版本 | **图片/全局配置改动必须告知用户清缓存**：① 重新扫码不一定清缓存（同一二维码 URL）；② 微信开发者工具需要「清缓存→全部清除」；③ 真机体验需要「删除小程序→重新扫码」；④ 长期方案：用 `wx.getUpdateManager()` 强制更新检查 | — |
| 35 | 2026-07-15 | ImageGen 原图的"透明底"其实是浅灰/米色（**踩坑**） | `alpha_composite(white_bg, img)` 只能让 alpha=0 的真透明区域变白；对已经画了浅色像素的区域无效 | **校验图标"真白底"的方法**：用 PIL 读取后查四角像素 RGB，必须都是 (255,255,255)。如果有 (210,210,210) 这种就是浅灰不是白。**用 numpy 把"亮灰近白"像素 (RGB>215 且差<15) 直接刷成 255,255,255**——比 alpha_composite 更可靠 | — |
| 36 | 2026-07-15 | **违反纪律**：错误诊断+擅自提交创意产物（**严重违规**） | 用户反馈打卡/任务页图标"没有白底"，我误判为"手绘图标不渲染"，直接换成纯色块风格并 commit + push——这是**视觉产物变更=业务决策**，必须先出方案给用户选 | **诊断错误时的硬性纪律**：① 不准凭"想当然"擅自改变视觉风格；② 不准在没有用户确认的情况下 commit + push 创意产物；③ 哪怕看起来"更好"，也要先 3 提案让用户选；④ 验收必须用用户截图而非自己判断；⑤ git reset --hard + git push --force 回退时不许用 `--force-with-lease` 之外的方式，必须先告知用户 | — |
| 37 | 2026-07-16 | 新会话 GitHub 连接器：/user 与 /user/repos 返回 Bad credentials，gh CLI 未登录 | ① 界面 GitHub MCP toggle 显示已开启但无独立 MCP 工具；② get_token.sh 拿到的 token 仅 search API 可用，user/repos 报 401；③ 仓库实际在 GitHub 而非 CNB/工蜂 | 找仓库用 `GET /search/repositories?q=仓库名`；clone 用 `git clone https://oauth2:${GITHUB_TOKEN}@github.com/owner/repo.git`；本仓库 = lihongxu6/growth-sapling | — |

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
| asset-generation | `/workspace/skills/asset-generation/SKILL.md` | ✅ v1.0（2026-07-13 沉淀自 2 天图标踩坑经验） |

**asset-generation**：数字资产生成专家（图标/头像/图片）。6 条核心原则（先学规范→提案制→画布≠内容区→双态设计→视觉一致性→可识别性优先）+ 3 个专项工作流（通用/TabBar图标/头像生成）+ 9 条踩坑记录 + 交付检查清单。

## 6. 下一步

1. ✅ 测试验证完成（自动化 25/25 ✅，手动验收 14/14 ✅）
2. ✅ Skill 体系建立（4 个通用 Skill 已发布到 workbuddy-skills 独立仓库）
3. ✅ 项目专属 Skill：asset-generation v1.0（图标/头像生成经验沉淀）
4. ✅ 小程序 MVP 完成（3 页面基本功能 + CI 编译链 + 30 条踩坑沉淀）
5. ✅ MVP 复盘文档交付（`mvp-review-成长小树苗.md`）
6. ✅ 仓库清理（删除 1.9MB 过程文件：视频/帧/原图/旧版本 Skill/空组件目录）
7. ✅ Git 速查卡交付（`git-cheatsheet-成长小树苗.md`），用户本地 clone 准备就绪
8. ✅ DESIGN.md 交付（AI 工具友好版设计规范，供 ardor 等工具读取）
9. ✅ 松鼠 IP 集成：庆祝弹窗用 avatar-144-transparent.png 替换 🐿️ emoji
10. ✅ 体验版预览二维码已生成（包大小 46.2KB）
11. ✅ 体验版预览二维码已生成（包大小 252KB）
12. ✅ 三页标题统一样式：左对齐 + 手绘图标 + 副标题（"今天也要加油哦"/"小树苗在长大"/"我想养成这些好习惯"）
13. ✅ TabBar 图标改为手绘水彩风格（与页面标题图标一致）
14. 🔜 用户扫码体验并反馈问题
15. 🔜 上线流程启动（2026-07-16）：① 文案修复确认 commit + push；② `node scripts/build.js compile` 编译验证；③ `node scripts/build.js upload` 上传（需 private.key + 关闭 IP 白名单）；④ 微信公众平台提交审核（个人号·工具类目）；⑤ 审核通过发布；⑥ 上线后数据观察
