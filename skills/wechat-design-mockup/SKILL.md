---
name: wechat-design-mockup
description: 创建微信小程序设计稿（HTML/CSS 原型）时强制调用的工作流。触发场景：用户要做小程序设计稿 / 引导浮层 / 弹窗 mockup / UI 原型复刻 / Coach-mark。强制「以真实源码为唯一真相源」——禁止凭印象画坐标/弹窗/数据/颜色；覆盖：读真实 WXML/WXSS 提 token + rpx→calc 转换 + 浮层 getBoundingClientRect 实测定位 + HTML 单文件交付 + Chromium Playwright 自检 + 上线真值优先 + Git 安全。本 skill 是「成长小树苗」v2.1 设计稿 v4→v5 血泪教训的方法论沉淀。
---

# WeChat 小程序设计稿工作流

## 核心原则
设计稿不是艺术品，是「**上线真值的可视化复刻**」。任何像素、文字、数据、颜色、图标必须能在真实小程序源码里找到出处。

---

## 工作流（7 步，缺一不可）

### Step 1 · 读真实源码（设计前必做）
- 读目标页面的 `.wxml` / `.wxss` 拿真实结构、class、字段、按钮、弹窗内容
- 读 `app.wxss` 拿全局 token（颜色/字号/间距的 CSS 变量定义，如 `--green` `--fs-xs` `--sp-md`）
- 读 `miniprogram/utils/constants.js`（或同类）拿静态数据：图标集 `ICON_SET`、徽章定义 `BADGE_DEFS`、任务示例等
- 读 `miniprogram-assets/` 拿真实图片资源（头像、header 图、tab 图）
- **禁止凭印象发挥**：弹窗标题/字段/按钮顺序/选项措辞/iconSet 都必须 1:1 对齐源码；徽章名称/图标/进度门槛禁止编造
- 验证手段：`grep` 源码关键 class/title/option 与设计稿比对，缺 1 处即 fail

### Step 2 · rpx → calc 转换（浏览器可读）
- **rpx 是微信专有单位，标准浏览器不识别**——在 HTML 设计稿里写 `Nrpx` 会让整条 CSS 声明被浏览器静默丢弃（box-shadow / border / 尺寸全部归零），曾致聚焦环消失
- 设计稿画布 = `393px × 852px`（iPhone 等效）
- 转换公式：`1rpx = 393 / 750 ≈ 0.524px`，在 `:root` 定义 `--u: 0.524px`
- 用正则 `\b(\d+)rpx\b` → `calc(\1 * var(--u))` 全量替换
- 自检：computed `box-shadow` 必须是真实值（如 `rgba(0,0,0,0.45) 0 0 0 9999px`），不是 `none`

### Step 3 · HTML 单文件交付
- 单一真相源 = HTML（不是 PNG）。PNG 仅作 Chromium 渲染的一次性预览/自查产物，**不 commit、不手改**（避免双文件漂移；#69 emoji bug 曾致 3 轮 PNG 误导评审）
- 所有图片 base64 内嵌（`./miniprogram-assets/avatar.png` → base64），守「无裂图」
- emoji 字体必须在 `body { font-family }` 显式声明 `"Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji"`，否则 Chromium headless 把 emoji 渲成空白方格
- 弹窗/页面状态 1:1 复刻真实 WXML（标题、字段、按钮、顺序、iconSet）

### Step 4 · 浮层/引导定位 = getBoundingClientRect 实测
- **禁止凭想象写 `top/left` 绝对像素**（v4 教训：松鼠挡按钮、气泡离操作点几十~上百 px、视线上下跳）
- 运行时用 `element.getBoundingClientRect()` 实测目标矩形
- 4 边选择气泡位（下→上→右→左）+ clamp 到画布 + 超大目标 fallback（max-space side）
- 小尾巴（`.bubble-tail`）CSS 三角指向目标
- 高风险按钮（如「添加」）严禁被任何引导浮层元素遮挡

### Step 5 · Chromium / Playwright 自检（出稿前必跑）
- 起 headless Chromium（device_scale_factor=2），加载 HTML，dispatch resize，evaluate：
  - 每个浮层 frame 断言：`ringErr ≤ 4px`（聚焦环对齐目标中心）、`bubbleDist ≤ 260px`（大目标放宽到含等 260）、`overflow = False`（气泡不溢出画布）
  - 读 computed `box-shadow` 确认遮罩渲染（不是 `none`）
  - 饱和像素检测：`max(R,G,B)-min(R,G,B)>50` 的像素占比 > 0.05% 证明 emoji/插图真渲染（防 #69 emoji 空白坑）
- 失败必须修，不接受「大概对齐」

### Step 6 · 上线真值优先（颜色/数据/文案）
- 设计稿任何颜色/图标/数据/文案 = **上线小程序现状为准**（产品 owner 唯一真相源）
- 未落地的修复方案（如「黄色=0完成/橙色=部分完成」）**不能**用作设计稿——先确认上线真值再设计
- 例：日历三色 = 🟢全完成 / 🟠还没打卡 / ⚪没任务（产品决策），设计稿必须 1:1 对齐
- 标注为「概念性看图」的帧可适度示意完整色板；标注为「真实步骤」的帧必须反映当下真实数据

### Step 7 · Git 安全
- 任何「回退重改」前先 `git stash` 或 WIP commit（`git commit --allow-empty` / 临时 commit）
- **绝不对正在产出的未提交文件用 `git checkout/restore/clean`**——这些命令丢弃未提交改动且不进回收站，曾致 v3/v4 源码不可逆丢失
- 关键交付物每完成一步即 commit，防丢失

---

## 浮层三要素同区规则（引导设计专用）

文案（气泡/松鼠说话气泡）、跳过控件、操作点锚定必须满足：
1. **同区**：文案与「跳过 ✕」在**同一 UI 单元**（如气泡卡片右上），绝不分离到页面顶部
2. **紧贴**：气泡**紧贴**当前操作点（小尾巴明确指向），不能下拉到页面底部
3. **IP 唯一**：IP 角色（松鼠）**唯一来源** = 气泡头像 `.bubble-avatar`，不再让文本里嵌第二个同款 emoji
4. **不遮挡**：高风险按钮严禁被任何引导浮层遮挡

---

## 资源

### references/
- `rpx-and-units.md` — rpx→calc 转换速查表 + `--u` 推导 + 正则替换脚本
- `playwright-selfcheck.md` — Playwright 自检模板（定位断言 + 饱和像素 + box-shadow 诊断）

### scripts/
（暂未提供脚本——本 skill 是方法论/流程，agent 直接按 SKILL.md 执行；如需自动化 rpx 替换，可参考 `references/rpx-and-units.md` 的正则片段）

### assets/
（空——设计稿是 agent 产出，不是模板文件）