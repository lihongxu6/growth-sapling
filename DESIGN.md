# DESIGN.md — 成长小树苗 设计规范（AI 工具友好版）

> **本文件用途**：供 ardor / Midjourney / 即梦 / Sora / ImageGen 等 AI 工具读取的精简设计规范。
> **完整版本**：`design-spec-成长小树苗.md`（285 行 SSOT，含全部 Token 与组件规格）
> **生成原则**：
> ① 通用图形优先（不玩隐喻） ② 高对比度 + 厚重色块（避免细线稿，方便后续抠图） ③ 风格统一（一次只出一组，不要混搭） ④ 同一资产需 3 套提案让用户选

---

## 1. 品牌

- **项目**：成长小树苗
- **目标用户**：7-8 岁小朋友（二年级）
- **核心理念**：帮助孩子自我管理，而非家长监督
- **IP 形象**：小松鼠"果果"（待重新生成）
- **关键词**：温暖 / 童趣 / 鼓励 / 自然 / 成长 / 可爱不幼稚

---

## 2. 视觉风格

| 维度 | 规范 |
|------|------|
| 整体风格 | 圆润、柔软、儿童绘本风；避免锋利边角、机械线条、阴影厚重 |
| 线条 | 粗细统一 2-3px 描边，圆润收尾；不要细发丝线 |
| 色块 | **厚重 + 高饱和度**，每个角色/图标有明确色块边界（方便后续 rembg 抠图） |
| 阴影 | 轻量（透明度 10-20%），不要拟物化厚阴影 |
| 表情 | 萌、圆眼、微笑；避免写实/恐怖/惊吓 |
| 比例 | 头大身小（Q 版 1:1.5~1:2），符合儿童审美 |

---

## 3. 配色（仅主色）

| Token | 色值 | 用途 |
|-------|------|------|
| 主绿 | `#5CB85C` | 品牌色、已完成、强调 |
| 浅绿 | `#E8F5E9` | 已完成背景 |
| 暖黄 | `#F0AD4E` | 火焰、进度高亮 |
| 浅橙 | `#FFF3E0` | 补卡背景、提示条 |
| 暖米 | `#FFF8F0` | 页面背景 |
| 天空蓝 | `#5BC0DE` | 任务意义文字、辅助 |
| 暖红 | `#E57373` | 危险操作、删除 |
| 文字 | `#333333` | 主文字 |
| 浅灰 | `#C9C9C9` | 未获得徽章、占位元素 |

---

## 4. 资产清单（需要重新生成）

| # | 资产 | 规格 | 数量 | 状态 |
|---|------|------|------|------|
| 1 | **小松鼠"果果"主形象** | 1024×1024 PNG，**RGBA 透明背景**，**高对比度厚重色块风格**（重要：原图过浅会 rembg 失败） | 4 表情：日常/祝贺/鼓励/招手 | 🔴 重新生成 |
| 2 | **TabBar 图标 × 3** | 81×81 PNG，各出 normal + active 双态 | 3 组：打卡/成长/任务 | ✅ 已完成 |
| 3 | **任务图标** | 96×96 PNG，RGBA 透明，圆润线稿 | 12-16 个：阅读/写字/运动/收拾/刷牙/睡觉/音乐/学习/植物/宠物/打扫/喝水 | 🟡 占位 emoji 中 |
| 4 | **徽章** | 128×128 PNG，RGBA 透明 | 6 枚：🌱新芽初绽 / 🌿茁壮成长 / 🪴枝繁叶茂 / 🏆百日丰收 / 🔥连续7天 / 🌕连续30天 | 🟡 占位 emoji 中 |
| 5 | **庆祝特效** | 装饰性 | 星星飘落、彩带、烟花 | 🟡 待定 |

---

## 5. 各类资产 Prompt 模板

### 5.1 小松鼠"果果"（关键资产，重要程度 ⭐⭐⭐⭐⭐）

**核心要求（必读）**：
- **绝对不能是细线稿**（我们踩过坑：线稿 + rembg = 空透明图）
- 必须有 **3-5 个明确色块**（身体/头/肚子/耳朵内部/手）
- 主色用品牌绿 `#5CB85C` + 暖橙 `#F0AD4E` + 白肚皮
- 背景纯白（用于 rembg）

**Prompt**：
```
A cute cartoon squirrel mascot for a children's habit-tracking app,
named "Guoguo". Round head, big eyes, fluffy tail, white belly,
warm orange body, holding a small acorn. Chibi style, head 1.2x
body size. Soft rounded features, friendly smile. **Solid color
blocks with thick outlines** (3px black outline, no thin lines),
suitable for image background removal. Pure white background,
1024x1024, high detail, no text.
```

**参数建议**：aspect_ratio=1:1, 风格写实度低（写实=不卡通）

### 5.2 TabBar 图标

**Prompt**：
```
A [name] icon in [state] state, for a children's app tab bar.
Style: thick rounded outline (3px), single color [#999 for
normal / #5CB85C for active], simple geometric shape, highly
recognizable. 81x81 PNG, flat design, no gradient, no shadow,
centered composition.
```

- 打卡图标：圆形+对勾 / 选中态 = 实心圆+白对勾
- 成长图标：柱状图三根 / 选中态 = 三根绿柱
- 任务图标：三横线 / 选中态 = 三条绿线

### 5.3 任务图标（12 个）

**Prompt**：
```
A [object] icon for a children's habit app. Style: flat design,
thick rounded outline (3px), single brand green color #5CB85C,
white inside, no fill. 96x96 PNG, centered, simple and clear,
suitable for 7-8 year old kids.
```

12 个对象：book 📖、pencil ✏️、running 🏃、backpack 🎒、toothbrush 🪥、bed 😴、piano 🎹、abacus 🧮、plant 🌿、dog 🐶、broom 🧹、milk 🥛

### 5.4 徽章（6 枚）

**Prompt**：
```
A [badge] badge icon for a children's achievement system.
Style: circular medal shape, thick golden border #F4B400,
colorful inner design, soft 3D effect, 128x128 PNG, centered,
suitable for 7-8 year old kids.
```

6 个徽章主题：
- 🌱 Sprout（新芽）：刚发芽的小苗
- 🌿 Growing（茁壮）：带叶的小树
- 🪴 Thriving（繁茂）：小树成树
- 🏆 Harvest（丰收）：果实累累
- 🔥 7-day Streak（连续 7 天）：火焰
- 🌕 30-day Streak（连续 30 天）：满月

---

## 6. 生成流程

1. **学习规范**：用本文件 + WebSearch 查询"儿童 App 图标设计原则"
2. **出 3 套提案**：同一资产生成 3 个版本（不同构图/配色/表情）
3. **用户选**：展示给用户选 1 个
4. **生成定稿**：按选定风格批量生成全套
5. **背景处理**：如需透明 → rembg（仅对**厚色块**原图有效）
6. **验收**：
   - PIL 读图 mode == 'RGBA'
   - 角点 alpha == 0
   - **目视检查深色背景下渲染图**（无空透明、无灰雾）

---

## 7. 踩坑速查（重要！）

| # | 踩坑 | 规避 |
|---|------|------|
| 1 | 细线稿图 rembg 后变空透明 | 必须用**厚色块**风格 |
| 2 | ImageGen `background: "transparent"` 不真透明 | 必须二次 rembg |
| 3 | rembg 默认参数会留灰雾 | 用 `alpha_matting=True, alpha_matting_foreground_threshold=240` |
| 4 | 图标撑满 81×81 画布被裁 | 实际渲染只看中心 27×27 |
| 5 | 创意隐喻（小树苗+星星+清单）用户认不出 | 用通用图形（圆+对勾、柱状图、横线） |
| 6 | 双态图标只做一态 | normal 和 active 必须**同图形不同填充** |
| 7 | 三页图标风格不统一 | 同一资产组**笔触粗细/圆角/视觉重量**完全一致 |

---

## 8. 参考资源

- 完整规范：`design-spec-成长小树苗.md`
- 设计原则 PRD：`prd-成长小树苗-mvp.md`
- 评审材料：`design-review-成长小树苗.md`
- 资产生成 Skill：`skills/asset-generation/SKILL.md`
