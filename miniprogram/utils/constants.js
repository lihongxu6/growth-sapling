/**
 * 常量定义
 *
 * 来源：tech-spec §3.3, design-spec
 */

/** 徽章定义（与 tech-spec §3.3 对齐） */
const BADGE_DEFS = [
  { type: 'sprout',       name: '新芽初绽', icon: '🌱', threshold: 7,    unit: 'stars',      desc: '累计获得 7 颗星' },
  { type: 'growing',      name: '小有所成', icon: '🌿', threshold: 30,   unit: 'stars',      desc: '累计获得 30 颗星' },
  { type: 'thriving',     name: '枝繁叶茂', icon: '🪴', threshold: 100,  unit: 'stars',      desc: '累计获得 100 颗星' },
  { type: 'harvest',      name: '硕果累累', icon: '🍎', threshold: 365,  unit: 'stars',      desc: '累计获得 365 颗星' },
  { type: 'week_streak',  name: '连续打卡', icon: '🔥', threshold: 7,    unit: 'streak_days', desc: '连续 7 天不间断' },
  { type: 'month_streak', name: '满月打卡', icon: '🌕', threshold: 30,   unit: 'streak_days', desc: '连续 30 天不间断' },
  { type: 'star_hundred', name: '百颗星',  icon: '🏅', threshold: 100,  unit: 'stars',      desc: '累计获得 100 颗星' },
];

/** 图标选择集 */
const ICON_SET = [
  '📖', '📝', '🧮', '🎨', '🏃', '🎻', '🧹', '🌿',
  '📚', '✏️', '🔬', '🎵', '⚽', '🎸', '🛏', '🌻',
];

/** 默认任务（首次使用） */
const DEFAULT_TASKS = [
  { id: 1, icon: '📖', name: '每日阅读30分钟',  purpose: '认识更多字',     repeat_type: 'daily', repeat_days: [], sort_order: 1, is_deleted: false },
  { id: 2, icon: '✏️', name: '认真完成作业',    purpose: '巩固今天学的',   repeat_type: 'daily', repeat_days: [], sort_order: 2, is_deleted: false },
  { id: 3, icon: '🏃', name: '运动20分钟',      purpose: '身体棒棒的',     repeat_type: 'daily', repeat_days: [], sort_order: 3, is_deleted: false },
  { id: 4, icon: '🧹', name: '整理自己的房间',   purpose: '学会照顾自己',   repeat_type: 'daily', repeat_days: [], sort_order: 4, is_deleted: false },
];

/** 任务名最大长度 */
const MAX_TASK_NAME = 20;

/** 任务意义最大长度 */
const MAX_TASK_PURPOSE = 50;

/** 动画时长（ms） */
const ANIM_DURATION = {
  splash_fadeout: 300,
  celebration: 1500,
  badge_acquire: 800,
  check_bounce: 300,
};

module.exports = {
  BADGE_DEFS,
  ICON_SET,
  DEFAULT_TASKS,
  MAX_TASK_NAME,
  MAX_TASK_PURPOSE,
  ANIM_DURATION,
};
