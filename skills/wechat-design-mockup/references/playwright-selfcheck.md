# Playwright 自检模板（设计稿出稿前必跑）

## 为什么必须自检
- 设计稿是 HTML，但用户最终在浏览器/微信里看——浮层定位是否对齐、emoji 是否渲染、box-shadow 是否生效，**只有 headless Chromium 实跑才知道**
- 曾因 Chromium headless 不主动用系统 emoji 字体，导致 3 轮 PNG 全空白、误导评审（#69）

## 最小自检脚本（Python + Playwright sync_api）

```python
from playwright.sync_api import sync_playwright

HTML = "file:///workspace/<your-project>/ui-mockup-xxx.html"

js_check = """
() => {
  const phones = [...document.querySelectorAll('.phone')];
  return phones.map(phone => {
    const coach = phone.querySelector('.coach');
    const target = phone.querySelector(coach?.getAttribute('data-target'));
    const bubble = phone.querySelector('.bubble-card');
    const spot = phone.querySelector('.target-spot');
    const pr = phone.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const br = bubble.getBoundingClientRect();
    const sr = spot.getBoundingClientRect();
    const rel = r => ({x: Math.round(r.left-pr.left), y: Math.round(r.top-pr.top), w: Math.round(r.width), h: Math.round(r.height)});
    return { target: rel(tr), bubble: rel(br), spot: rel(sr), phone: {w: Math.round(pr.width), h: Math.round(pr.height)} };
  });
}
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1400, "height": 1000}, device_scale_factor=2)
    page.goto(HTML)
    page.wait_for_timeout(500)
    page.evaluate("window.dispatchEvent(new Event('resize'))")  # 触发定位重排
    page.wait_for_timeout(300)
    data = page.evaluate(js_check)
    for i, d in enumerate(data):
        b, t, s, ph = d['bubble'], d['target'], d['spot'], d['phone']
        overflow = (b['x'] < 0 or b['y'] < 0 or b['x']+b['w'] > ph['w'] or b['y']+b['h'] > ph['h'])
        scx, scy = s['x']+s['w']/2, s['y']+s['h']/2
        tcx, tcy = t['x']+t['w']/2, t['y']+t['h']/2
        ringErr = round(max(abs(scx-tcx), abs(scy-tcy)))
        bcx, bcy = b['x']+b['w']/2, b['y']+b['h']/2
        dist = round(((bcx-tcx)**2+(bcy-tcy)**2)**0.5)
        ok = (not overflow) and (ringErr <= 4) and (dist <= 260)
        print(f"[{i+1}] ringErr={ringErr} dist={dist} overflow={overflow} -> {'OK' if ok else 'FAIL'}")
    browser.close()
```

## 断言阈值

| 指标 | 阈值 | 说明 |
|---|---|---|
| `ringErr` | ≤ 4px | 聚焦环中心 vs 目标中心，最大轴偏差 |
| `bubbleDist` | ≤ 260px | 气泡中心 vs 目标中心距离；大目标（如日历）放宽到含等 260 |
| `overflow` | False | 气泡不溢出 `.phone` 画布（393×852） |

## 进阶检查（诊断用）

### 1) box-shadow 是否真渲染
```python
diag = page.evaluate("""() => [...document.querySelectorAll('.target-spot')].map(s => getComputedStyle(s).boxShadow)""")
# 期望：rgba(92,184,92,0.7) 0 0 0 4px, rgba(0,0,0,0.45) 0 0 0 9999px
# 失败：none（说明 rpx 没转，或 box-shadow 语法错）
```

### 2) emoji / 插图是否真渲染（饱和像素检测）
```python
from PIL import Image
img = Image.open("screenshot.png")
total = img.width * img.height
sat = sum(1 for px in img.getdata() if max(px[:3]) - min(px[:3]) > 50)
print(f"saturated={sat}/{total} = {sat/total:.4%}")
# 期望 > 0.05%（证明有彩色 emoji/插图）
# 失败 ≈ 0%（全是白底/灰阶 → emoji 没渲染）
```

### 3) 截图保存（自查用，不 commit）
```python
for i, ph in enumerate(page.query_selector_all('.phone')):
    ph.screenshot(path=f"_check_frame_{i+1}.png")
```

## 坑位提醒

- `device_scale_factor=2` 让截图为 2x（Retina 效果），采样坐标记得 ×2
- 加载后必须 `dispatch resize` 触发 `getBoundingClientRect` 重排
- emoji 字体声明在 `body` 的 `font-family`，不是 `html`（Chromium 字体匹配规则）
- 自检通过 ≠ 设计稿终稿——只是定位/渲染基线，**设计合理性仍需用户评审**