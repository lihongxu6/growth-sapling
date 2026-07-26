import sys
from playwright.sync_api import sync_playwright

HTML = "file:///workspace/growth-sapling/ui-mockup-v2.1-guide.html"

js_check = """
() => {
  const phones = [...document.querySelectorAll('.phone')];
  const out = [];
  for (const phone of phones) {
    const cap = phone.closest('.frame-col').querySelector('.frame-cap')?.textContent || '';
    const coach = phone.querySelector('.coach');
    const targetSel = coach?.getAttribute('data-target');
    const target = phone.querySelector(targetSel);
    const bubble = phone.querySelector('.bubble-card');
    const spot = phone.querySelector('.target-spot');
    const pr = phone.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const br = bubble.getBoundingClientRect();
    const sr = spot.getBoundingClientRect();
    // 相对 phone 的坐标
    const rel = (r) => ({x: Math.round(r.left-pr.left), y: Math.round(r.top-pr.top), w: Math.round(r.width), h: Math.round(r.height)});
    out.push({
      cap: cap.slice(0, 40),
      target: rel(tr),
      bubble: rel(br),
      spot: rel(sr),
      phone: {w: Math.round(pr.width), h: Math.round(pr.height)}
    });
  }
  return out;
}
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1400, "height": 1000}, device_scale_factor=2)
    page.goto(HTML)
    page.wait_for_timeout(500)
    # 触发一次 resize 以重排定位
    page.evaluate("window.dispatchEvent(new Event('resize'))")
    page.wait_for_timeout(300)
    data = page.evaluate(js_check)
    print("=== 逐帧定位校验 ===")
    allok = True
    for i, d in enumerate(data):
        b = d['bubble']; t = d['target']; s = d['spot']; ph = d['phone']
        # 气泡是否溢出 phone
        overflow = (b['x'] < 0 or b['y'] < 0 or b['x']+b['w'] > ph['w'] or b['y']+b['h'] > ph['h'])
        # 聚焦环是否对齐目标（中心距）
        scx = s['x']+s['w']/2; scy = s['y']+s['h']/2
        tcx = t['x']+t['w']/2; tcy = t['y']+t['h']/2
        ringErr = round(max(abs(scx-tcx), abs(scy-tcy)))
        # 气泡与目标中心距（应较近）
        bcx = b['x']+b['w']/2; bcy = b['y']+b['h']/2
        dist = round(((bcx-tcx)**2+(bcy-tcy)**2)**0.5)
        ok = (not overflow) and (ringErr <= 4) and (dist < 260)
        allok = allok and ok
        print(f"[{i+1}] {d['cap']}")
        print(f"    target={t}  spot={s}  bubble={b}")
        print(f"    ringErr={ringErr}px  bubbleDist={dist}px  overflow={overflow}  -> {'OK' if ok else 'FAIL'}")
    # 诊断 dim
    print("\n=== 遮罩诊断（读 computed box-shadow & 取像素）===")
    diag = page.evaluate("""() => {
      const out=[];
      for(const phone of document.querySelectorAll('.phone')){
        const spot = phone.querySelector('.target-spot');
        const cs = getComputedStyle(spot);
        const pr = phone.getBoundingClientRect();
        // 取 phone 中心偏上一点(应在 dim 范围内,目标外)的屏幕像素色
        const pt = phone.querySelector('.screen');
        const sr = pt.getBoundingClientRect();
        const px = sr.left + 20, py = sr.top + 20;
        out.push({cap: phone.closest('.frame-col').querySelector('.frame-cap').textContent.slice(0,30),
                  boxShadow: cs.boxShadow.slice(0,90), border: cs.border, bg: cs.backgroundColor,
                  sampleXY:[Math.round(px),Math.round(py)]});
      }
      return out;
    }""")
    for x in diag: print(x)
    # 像素采样（用 pillow）
    try:
        from PIL import Image
        img = Image.open("_guide_frame_1.png")
        print(f"\nframe1 size: {img.size}")
        # phone screenshot is 393x852 @ 2x = 786x1704. 采样屏幕区左上 (对应 sr.left+20, sr.top+20 @1x) → x=40,y=40 @2x
        for (lbl, x, y) in [("top-left of screen area", 40, 40), ("middle of screen", 393, 852), ("over target add-btn", 393, 780)]:
            print(f"  pixel @{lbl} ({x},{y}) = {img.getpixel((x,y))}")
    except Exception as e:
        print("pillow err", e)
    # 截图 每个 phone
    phones = page.query_selector_all('.phone')
    for i, ph in enumerate(phones):
        ph.screenshot(path=f"/workspace/growth-sapling/_guide_frame_{i+1}.png")
    print("screenshots saved: _guide_frame_1..%d.png" % len(phones))
    browser.close()
