# Git 常用命令速查 · 成长小树苗

> 覆盖你日常与 Sophia 协作时 90% 会遇到的场景。

---

## 零、一次性初始化（只做一次）

```bash
# 1. 克隆项目到本地
git clone https://github.com/lihongxu6/growth-sapling.git ~/Documents/成长小树苗

# 2. 进入项目目录
cd ~/Documents/成长小树苗

# 3. 配置身份（只做一次，全局生效）
git config --global user.name "lihongxu6"
git config --global user.email "lihongxu6@users.noreply.github.com"
```

---

## 一、日常操作（每次用这 4 个）

### 场景 1：你改了一些文件，想同步到 GitHub 让 Sophia 看到

```bash
# ① 查看改了哪些文件（红色=未暂存，绿色=已暂存）
git status

# ② 添加所有改动
git add .

# ③ 提交（写清楚改了什么）
git commit -m "本地修改：修复了打卡页日期栏宽度"

# ④ 推送到 GitHub
git push
```

> **一句话版**：`git add . && git commit -m "说明" && git push`

### 场景 2：Sophia 改了代码，你想拉到本地看

```bash
git pull
```

### 场景 3：你改了一半想放弃，恢复成远程最新版

```bash
# 放弃本地所有未提交的改动
git checkout .

# 再拉取远程最新
git pull
```

### 场景 4：你 push 时报错"远程有更新，先拉取"

```bash
# 先拉取合并
git pull

# 如果有冲突（极少见），以远程为准
# git checkout --theirs . && git add . && git commit -m "merge"

# 再推送
git push
```

---

## 二、查看与回溯

```bash
# 看最近的提交记录
git log --oneline -10

# 看某次提交具体改了啥
git show 提交ID的前6位

# 看当前和上一次提交的差异
git diff HEAD~1

# 看某个文件的修改历史
git log --oneline -- 文件路径
```

---

## 三、危险操作（慎用）

```bash
# 回退最近一次 commit（保留文件改动）
git reset --soft HEAD~1

# 回退最近一次 commit（丢弃文件改动）
git reset --hard HEAD~1

# 强制推送（覆盖远程，极少用）
git push --force
```

> ⚠️ `--force` 会覆盖远程历史，非必要不用。

---

## 四、你的日常节奏

```
打开电脑 → 打开终端 → cd ~/Documents/成长小树苗

改文件前：
  git pull                    # 拉 Sophia 最新代码

改文件：
  用任意编辑器修改文件

改完后：
  git status                  # 看看改了什么
  git add .                   # 添加所有改动
  git commit -m "说明"        # 提交
  git push                    # 推送

然后在 WorkBuddy 里告诉 Sophia：
  "文件已更新，请 git pull"
```

---

## 五、别名（可选，更省事）

在终端执行以下命令，以后输入更短：

```bash
git config --global alias.st status
git config --global alias.ci "commit -m"
git config --global alias.pu push
git config --global alias.pl pull
```

之后：
- `git st` = `git status`
- `git ci "说明"` = `git commit -m "说明"`
- `git pu` = `git push`
- `git pl` = `git pull`

日常节奏变成：
```bash
git pl && git st && git add . && git ci "改了xxx" && git pu
```

---

## 六、快速参考卡片

| 你想做什么 | 命令 |
|-----------|------|
| 下载项目到本地 | `git clone 地址` |
| 拉取最新代码 | `git pull` |
| 看改了哪些文件 | `git status` |
| 添加所有改动 | `git add .` |
| 提交 | `git commit -m "说明"` |
| 推送 | `git push` |
| 放弃本地改动 | `git checkout .` |
| 看提交历史 | `git log --oneline` |
