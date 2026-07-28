# rpx → calc 转换速查

## 为什么必须转
- **rpx 是微信专有单位**（responsive pixel，750rpx = 屏幕宽），用于 WXSS 自适应布局
- 标准浏览器（Chromium/Firefox/Safari）**不识别 rpx**——在 HTML 设计稿里写 `Nrpx` 会让**整条 CSS 声明被浏览器静默丢弃**
- 后果：`box-shadow` → `none`（聚焦环消失）、`border-width` → 0、`width/height` → 0，曾致引导浮层「环不见了」「边框没了」

## 转换公式

```
画布宽 = 393px（iPhone 等效）
rpx 基准 = 750rpx
1rpx = 393 / 750 ≈ 0.524px
```

在 HTML `:root` 定义：
```css
:root { --u: 0.524px; }
```

## 正则替换（Python）

```python
import re, io
t = io.open("mockup.html", encoding="utf-8").read()
t = re.sub(r"\b(\d+)rpx\b", r"calc(\1 * var(--u))", t)
io.open("mockup.html", "w", encoding="utf-8").write(t)
```

## 自检清单

| 检查 | 命令/方法 | 期望 |
|---|---|---|
| 计算样式 box-shadow | `getComputedStyle(el).boxShadow` | 真实值（如 `rgba(0,0,0,0.45) 0px 0px 0px 9999px`），**不是 `none`** |
| 边框宽度 | `getComputedStyle(el).borderTopWidth` | `> 0px`（不是 `0px`） |
| 尺寸 | `getBoundingClientRect().width/height` | 符合设计预期 |

## 常见 token 映射表（来自 app.wxss 示例）

| WXSS token | rpx 值 | calc 写法 |
|---|---|---|
| `--fs-xs` | 24rpx | `calc(24 * var(--u))` |
| `--fs-sm` | 28rpx | `calc(28 * var(--u))` |
| `--fs-md` | 32rpx | `calc(32 * var(--u))` |
| `--fs-lg` | 36rpx | `calc(36 * var(--u))` |
| `--fs-xl` | 40rpx | `calc(40 * var(--u))` |
| `--sp-xs` | 8rpx | `calc(8 * var(--u))` |
| `--sp-sm` | 16rpx | `calc(16 * var(--u))` |
| `--sp-md` | 24rpx | `calc(24 * var(--u))` |
| `--sp-lg` | 32rpx | `calc(32 * var(--u))` |
| `--safe-top` | 88rpx | `calc(88 * var(--u))` |
| 字号/图标 80rpx | 80rpx | `calc(80 * var(--u))` ≈ 42px |

## 坑位提醒

- `--u` 必须用 px 单位，不能用 rem/em（基准不稳）
- 如果画布尺寸变化（如改做 375px 宽度），重新计算 `--u = 375/750`
- 正则 `\b(\d+)rpx\b` 用 word boundary，避免误匹配（如颜色 `#5CB85C` 不应被改）
- 替换后务必跑 Playwright 自检，确认 box-shadow / border / 尺寸全部为真实值