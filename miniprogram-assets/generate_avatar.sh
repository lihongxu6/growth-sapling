#!/bin/bash
# 使用 svg 生成小树苗头像（无需调用图像 API，完全本地可控）
# 设计：圆形淡黄底 + 简化树苗 + 小松鼠 IP 占位
cat > avatar.svg << 'SVGEOF'
<svg width="144" height="144" viewBox="0 0 144 144" xmlns="http://www.wwang.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E8F5E9"/>
      <stop offset="100%" stop-color="#FFF8E1"/>
    </linearGradient>
  </defs>
  <!-- 圆形背景 -->
  <circle cx="72" cy="72" r="72" fill="url(#bg)"/>
  <!-- 树苗主体 -->
  <!-- 树干 -->
  <rect x="68" y="85" width="8" height="22" rx="2" fill="#8B5A2B"/>
  <!-- 树冠三层 -->
  <ellipse cx="72" cy="80" rx="28" ry="22" fill="#5CB85C"/>
  <ellipse cx="58" cy="72" rx="14" ry="14" fill="#66BB6A"/>
  <ellipse cx="86" cy="70" rx="14" ry="14" fill="#66BB6A"/>
  <ellipse cx="72" cy="60" rx="12" ry="12" fill="#81C784"/>
  <!-- 小松鼠耳朵 -->
  <ellipse cx="58" cy="56" rx="4" ry="5" fill="#D2691E"/>
  <ellipse cx="86" cy="56" rx="4" ry="5" fill="#D2691E"/>
  <!-- 小松鼠头 -->
  <circle cx="72" cy="62" r="8" fill="#E68A2E"/>
  <!-- 小松鼠眼睛 -->
  <circle cx="69" cy="61" r="1.2" fill="#333"/>
  <circle cx="75" cy="61" r="1.2" fill="#333"/>
  <!-- 鼻子 -->
  <circle cx="72" cy="64" r="0.8" fill="#333"/>
  <!-- 红色苹果/果实 -->
  <circle cx="58" cy="78" r="4" fill="#E57373"/>
  <path d="M 57 75 L 58 73 L 59 75" stroke="#5D4037" stroke-width="1" fill="none"/>
  <circle cx="86" cy="82" r="3.5" fill="#E57373"/>
  <path d="M 85 79 L 86 77 L 87 79" stroke="#5D4037" stroke-width="1" fill="none"/>
  <!-- 地面 -->
  <ellipse cx="72" cy="108" rx="35" ry="4" fill="#8B5A2B" opacity="0.3"/>
  <!-- 闪光点 -->
  <circle cx="100" cy="40" r="2" fill="#F4B400" opacity="0.8"/>
  <circle cx="42" cy="50" r="1.5" fill="#F4B400" opacity="0.8"/>
  <circle cx="98" cy="95" r="1.5" fill="#F4B400" opacity="0.8"/>
</svg>
SVGEOF

# 转换 svg 为 144x144 png
if command -v rsvg-convert &> /dev/null; then
  rsvg-convert -w 144 -h 144 avatar.svg -o avatar.png
elif command -v convert &> /dev/null; then
  convert -background none -resize 144x144 avatar.svg avatar.png
else
  # 用 python + cairosvg
  python3 -c "
import cairosvg
cairosvg.svg2png(url='avatar.svg', write_to='avatar.png', output_width=144, output_height=144)
" 2>/dev/null || pip3 install cairosvg && python3 -c "
import cairosvg
cairosvg.svg2png(url='avatar.svg', write_to='avatar.png', output_width=144, output_height=144)
"
fi
ls -lh avatar.png 2>/dev/null && echo "✅ 头像生成成功"
