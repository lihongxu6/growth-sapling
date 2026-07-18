#!/usr/bin/env python3.11
"""
渲染 v2.0 设计稿预览：用 headless chromium 截全页，再 PIL 合成「主视图 + 浮层视图」。
用法: python3.11 scripts/preview-render.py
"""
import subprocess, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "ui-mockup-v2-userinfo.html")
OUT = os.path.join(ROOT, "v2-userinfo-design-preview.png")
CHROME = "/usr/bin/chromium"
BG = (237, 231, 223)  # #EDE7DF 页面灰底

W = 600  # 画布宽，留灰边居中
H = 1600  # 窗口高，足够容纳手机整页（1x，避免手机超出画布）

def shot(query, tmp):
    url = "file://" + HTML + (query and ("?" + query) or "")
    subprocess.run([
        CHROME, "--headless=new", "--no-sandbox", "--hide-scrollbars",
        "--disable-gpu",
        f"--window-size={W},{H}", f"--screenshot={tmp}", url
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

def trim_gray(img):
    """裁掉底部大块灰底，保留内容 + 少量边距。"""
    px = img.load()
    w, h = img.size
    last = 0
    for y in range(h - 1, -1, -1):
        diff = 0
        for x in range(0, w, 8):
            r, g, b = px[x, y][:3]
            if abs(r - BG[0]) + abs(g - BG[1]) + abs(b - BG[2]) > 24:
                diff += 1
        if diff > w // 16:  # 该行有足够多非灰像素
            last = y
            break
    # 向上多留 24px 边距
    top = 0
    for y in range(0, min(last, 60)):
        diff = 0
        for x in range(0, w, 8):
            r, g, b = px[x, y][:3]
            if abs(r - BG[0]) + abs(g - BG[1]) + abs(b - BG[2]) > 24:
                diff += 1
        if diff > w // 16:
            top = max(0, y - 24)
            break
    return img.crop((0, top, w, min(h, last + 24)))

def main():
    a = os.path.join(ROOT, ".preview_a.png")
    b = os.path.join(ROOT, ".preview_b.png")
    shot("", a)
    shot("sheet", b)
    img_a = trim_gray(Image.open(a).convert("RGB"))
    img_b = trim_gray(Image.open(b).convert("RGB"))

    # 合成：垂直堆叠，灰底
    gap = 40
    total_h = img_a.height + gap + img_b.height
    canvas = Image.new("RGB", (W * 2, total_h), BG)
    # 两图并排（每张居中于 600 宽列），更省纵向空间、便于对比
    canvas = Image.new("RGB", (W, total_h), BG)
    canvas.paste(img_a, (0, 0))
    canvas.paste(img_b, (0, img_a.height + gap))
    canvas.save(OUT)
    for t in (a, b):
        os.remove(t)
    print(f"OK -> {OUT}  ({canvas.width}x{canvas.height})")

if __name__ == "__main__":
    main()
