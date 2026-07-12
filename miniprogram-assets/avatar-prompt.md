# 成长小树苗 - 头像生成提示词

## 迭代记录

| 版本 | 问题 | 改进 |
|------|------|------|
| v1 | 太可爱卖萌，缺少"认真照顾"感 | 加 watering can + 专注表情 |
| v2 | 嘴角红色瑕疵；体型过瘦 | 去掉 red marks；加强 sturdy |
| v3 | stocky→像熊，不像松鼠 | 精确定义 squirrel proportions，用 kawaii 风格 |

## 当前提示词（v4）

```
A cute kawaii-style squirrel mascot with natural squirrel body proportions 
(compact round body, slim agile limbs, NOT bulky or bear-like). 
The squirrel has warm orange-brown fur, a round gentle face with big 
soft eyes, a tiny closed smile showing quiet concentration. 
Small round ears. Both front paws holding a tiny blue watering can, 
leaning forward slightly to water a small green sapling with water droplets. 
The sapling has bright green layered leaves. 
Soft pastel gradient background (light green to warm cream). 
Flat children's book illustration style, clean shapes, soft edges, 
no harsh outlines, no red marks, no glitch artifacts, no text. 
144x144px, app icon format.
```

## 关键约束翻译

| 英文 | 中文含义 | 为什么重要 |
|------|---------|-----------|
| `natural squirrel body proportions` | 松鼠的自然身体比例 | 防止变成熊 |
| `compact round body, slim agile limbs` | 圆身体+细灵巧四肢 | 壮而不胖，灵巧感 |
| `tiny closed smile showing quiet concentration` | 小闭嘴微笑，安静专注 | 不要惊讶嘴/张嘴 |
| `kawaii-style` | 日式可爱风 | 儿童产品调性 |
| `leaning forward slightly` | 微微前倾 | 认真照顾的姿态 |
| `no harsh outlines` | 无硬轮廓线 | 扁平矢量风格 |
| `no red marks, no glitch artifacts` | 无红色标记/噪声 | 避免嘴角瑕疵 |
| `144x144px` | 精确尺寸 | 微信规范 |

## 品牌形象关键词

- 憨厚（honest, earnest）
- 认真（focused, diligent）
- 灵巧（agile, nimble）
- 温暖（warm, gentle）
- 童趣（childlike wonder）
