# Skills（项目专属）

本目录存放仅适用于「成长小树苗」项目的 WorkBuddy Skill。

## 与通用 Skill 的区别

- **这里的**：与成长小树苗业务强绑定（如交互逻辑检查、部署脚本等），换一个项目用不上
- **通用 Skill**：存放在独立仓库 `lihongxu6/workbuddy-skills`，可跨项目复用（如 project-memory、prd-writer 等）

## 当前 Skill 列表

| Skill | 状态 | 说明 |
|-------|------|------|
| （暂无） | — | 项目暂无专属 Skill 需求，待后续创建 |

## 文件规范

每个 Skill 一个子目录，结构：

```
skill-name/
├── SKILL.md          # Skill 定义（必选）
└── scripts/          # 辅助脚本（可选）
```

> 通用 Skill 请提交到独立仓库 `lihongxu6/workbuddy-skills`。
