import re

path = "/workspace/growth-sapling/ui-mockup-v2.1-guide.html"
html = open(path, encoding="utf-8").read()

def find_balanced_block(s, open_tag_substr, from_idx):
    """从 from_idx 之后找到 open_tag_substr 所在 <div ...> 的配平闭合区间 [a, b)。"""
    a = s.index(open_tag_substr, from_idx)
    # 前进到该 <div 的 '>' 之后，再开始计数
    gt = s.index(">", a) + 1
    depth = 1
    i = gt
    while i < len(s):
        if s.startswith("<div", i):
            depth += 1
            i += 4
        elif s.startswith("</div>", i):
            depth -= 1
            i += 6
            if depth == 0:
                return a, i
        else:
            i += 1
    raise ValueError("unbalanced")

# 1) G6 frame-col
marker = "<!-- ===== G6 · 成长页 · 操作手册入口 ===== -->"
mi = html.index(marker)
fc_open = html.index('<div class="frame-col">', mi)
g6_a, g6_b = find_balanced_block(html, '<div class="frame-col">', fc_open)
g6 = html[g6_a:g6_b]
assert g6.strip().startswith('<div class="frame-col">')

# 2) 去掉 coach 块（配平移除）
coach_a, coach_b = find_balanced_block(g6, '<div class="coach"', 0)
g6_no_coach = g6[:coach_a] + g6[coach_b:]

# 3) 在 .phone 闭合 </div> 之前插入 遮罩 + 弹层
#    .phone 闭合是 g6_no_coach 中倒数第二个 </div>（最后一个是 frame-col 闭合）
last = g6_no_coach.rfind("</div>")
phone_close = g6_no_coach.rfind("</div>", 0, last)
sheet = '''
        <div class="sheet-mask"></div>
        <div class="manual-sheet">
          <div class="sheet-head">
            <div class="sheet-title">📖 操作手册</div>
            <div class="sheet-close">✕</div>
          </div>
          <div class="sheet-cards">
            <div class="manual-card"><span class="mc-ico">📋</span><div class="mc-info"><div class="mc-title">添加任务</div><div class="mc-text">写下想养成的小习惯，从一个小目标开始</div></div></div>
            <div class="manual-card"><span class="mc-ico">✅</span><div class="mc-info"><div class="mc-title">今日打卡</div><div class="mc-text">每天完成小习惯，点圆圈打勾攒星星</div></div></div>
            <div class="manual-card"><span class="mc-ico">📅</span><div class="mc-info"><div class="mc-title">看日历</div><div class="mc-text">点月历看进度：🟢全完成 🟠还没打卡 ⚪没任务</div></div></div>
            <div class="manual-card"><span class="mc-ico">🏅</span><div class="mc-info"><div class="mc-title">看徽章</div><div class="mc-text">收集星星，解锁你的成长徽章墙</div></div></div>
            <div class="manual-card"><span class="mc-ico">🖼️</span><div class="mc-info"><div class="mc-title">改头像</div><div class="mc-text">换个喜欢的果果头像，装扮小树苗</div></div></div>
          </div>
          <button class="manual-restart">再走一遍引导 ›</button>
        </div>
'''
g7 = g6_no_coach[:phone_close] + sheet + "\n      " + g6_no_coach[phone_close:]

# 4) 改 frame-cap
g7 = g7.replace(
    '<div class="frame-cap">G6 · 我的成长页｜高亮「操作手册」入口（概念性看图）</div>',
    '<div class="frame-cap">G7 · 我的成长页｜操作手册弹层（脱壳干净卡片，复用 6 步内容）</div>',
)

# 5) 插入到 .frames 闭合前
frames_close = html.rindex("</div>\n\n  <div class=\"notes\">")
new_html = html[:frames_close] + "\n" + g7 + "\n" + html[frames_close:]

open(path, "w", encoding="utf-8").write(new_html)
print("OK: G7 inserted. total len", len(new_html), "| coach removed:", coach_b - coach_a, "bytes")
