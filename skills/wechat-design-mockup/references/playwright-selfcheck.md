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
    const cap = phone.closest('.frame-col')?.querySelector('.frame-cap')?.textContent || '';
    const coach = phone.querySelector('.coach');
    if (!coach) return { skipped: true, cap: cap.slice(0,40) };
    const target = phone.querySelector(coach.getAttribute('data-target'));
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

def rect_gap(a, c):
    """最近边间隙：两矩形相交则 0，否则是矩形间最小欧氏距离（更好对应视觉诉求）"""
    ax2, ay2 = a['x']+a['w'], a['y']+a['h']
    cx2, cy2 = c['x']+c['w'], c['y']+c['h']
    dx = max(0, a['x']-cx2, c['x']-ax2)
    dy = max(0, a['y']-cy2, c['y']-ay2)
    return round((dx*dx+dy*dy)**0.5)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1400, "height": 1000}, device_scale_factor=2)
    page.goto(HTML)
    page.wait_for_timeout(500)
    page.evaluate("window.dispatchEvent(new Event('resize'))")  # 触发定位重排
    page.wait_for_timeout(300)
    data = page.evaluate(js_check)
    for i, d in enumerate(data):
        if d.get('skipped'):
            print(f"[{i+1}] skipped (no .coach, e.g. static/manual frame): {d.get('cap')}")
            continue
        b, t, s, ph = d['bubble'], d['target'], d['spot'], d['phone']
        overflow = (b['x'] < 0 or b['y'] < 0 or b['x']+b['w'] > ph['w'] or b['y']+b['h'] > ph['h'])
        scx, scy = s['x']+s['w']/2, s['y']+s['h']/2
        tcx, tcy = t['x']+t['w']/2, t['y']+t['h']/2
        ringErr = round(max(abs(scx-tcx), abs(scy-tcy)))
        gap = rect_gap(b, t)  # 边缘间隙（小尾巴桥接 ≈ 12px）
        ok = (not overflow) and (ringErr <= 4) and (gap <= 40)
        print(f"[{i+1}] ringErr={ringErr} gap={gap} overflow={overflow} -> {'OK' if ok else 'FAIL'}")
    browser.close()
```

## 断言阈值

| 指标 | 阈值 | 说明 |
|---|---|---|
| `ringErr` | ≤ 4px | 聚焦环中心 vs 目标中心，最大轴偏差 |
| `bubbleGap` | ≤ 40px | **边缘间隙**（小尾巴桥接，视觉效果直接对应）；≤ 12px 是理想 |
| `overflow` | False | 气泡不溢出 `.phone` 画布（393×852） |

> **指标戒条**：不要用"中心距"(`bubbleDist`)当主指标——对高瘦 / 扁平目标（如徽章墙 h=466）会被几何惩罚，呈现 >260px FAIL，但视觉上 bubble 已贴住目标。**指标必须直接对应视觉诉求**（贴住 + 尾巴桥接）。详见 MEMORY §3.39 / §4 #75。

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