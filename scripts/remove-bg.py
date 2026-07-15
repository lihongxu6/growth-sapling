#!/usr/bin/env python3
"""松鼠透明背景处理 - 用上次踩坑学到的安全参数"""
from rembg import remove
from PIL import Image
import sys

input_path = "/workspace/miniprogram-assets/squirrel-proposals/A_cute_cartoon_squirrel_mascot_2026-07-15T13-50-12.png"
output_path = "/workspace/miniprogram-assets/squirrel-transparent.png"
preview_path = "/workspace/miniprogram-assets/squirrel-preview.png"

# 读取
img = Image.open(input_path)
print(f"原图: mode={img.mode}, size={img.size}")

# 抠图 - 这次用更保守的参数，避免过剔除
# alpha_matting_foreground_threshold=200（上次 240 太严，全剔除浅色）
# alpha_matting_erode_size=3（保留主体边缘）
result = remove(
    img,
    alpha_matting=True,
    alpha_matting_foreground_threshold=200,
    alpha_matting_background_threshold=10,
    alpha_matting_erode_size=3,
)

# 保存透明 PNG
result.save(output_path)
print(f"透明图: mode={result.mode}, size={result.size}")

# 验收 - 在深色背景上预览，看是否有灰雾
dark_bg = Image.new('RGBA', result.size, (40, 44, 52, 255))
preview = Image.alpha_composite(dark_bg, result)
preview.convert('RGB').save(preview_path)
print(f"深色背景预览: {preview_path}")

# 验收 - 角点 alpha 必须是 0
corners = [
    result.getpixel((0, 0)),
    result.getpixel((result.size[0]-1, 0)),
    result.getpixel((0, result.size[1]-1)),
    result.getpixel((result.size[0]-1, result.size[1]-1)),
]
print(f"四角 alpha: {corners}")
print(f"角点是否全透明: {all(c[3] == 0 for c in corners)}")
