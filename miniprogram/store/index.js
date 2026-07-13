/**
 * 全局状态 Store（内存 SSOT）
 *
 * 所有页面通过 Store 读写数据，Store 是 UI 的唯一数据源。
 * 数据流：UI → Store → storage（持久化）
 *
 * 来源：tech-spec §3
 */

const { today, isoOf, dateOfIso, isToday, daysInMonth, firstDayOfMonth } = require('../utils/date');
const { saveState } = require('../utils/storage');
const { DEFAULT_TASKS, BADGE_DEFS } = require('../utils/constants');

const state = {
  /** 任务列表 */
  tasks: [],

  /** 打卡记录：{ dateIso: { taskId: record } } */
  checkinsByDate: {},

  /** 徽章获得记录：[{ type, acquired_at }] */
  badges: [],

  /** 当前查看日期（ISO） */
  viewDate: today(),

  /** 今天 */
  currentToday: today(),

  /** 日历当前月 */
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
};

/**
 * 初始化今日：如果首次启动，加载默认任务
 */
function initToday() {
  const now = today();
  state.currentToday = now;
  state.viewDate = now;

  if (!state.tasks || state.tasks.length === 0) {
    state.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    _persist();
  }
}

/**
 * 检查是否跨天（从后台切回时）
 */
function checkDayChange() {
  const now = today();
  if (now !== state.currentToday) {
    state.currentToday = now;
    state.viewDate = now;
  }
}

/**
 * 加载持久化任务
 */
function loadTasks(tasks) {
  state.tasks = tasks;
}

/**
 * 加载打卡记录
 */
function loadCheckins(checkinsByDate) {
  state.checkinsByDate = checkinsByDate || {};
}

/**
 * 加载徽章
 */
function loadBadges(badges) {
  state.badges = badges || [];
}

/**
 * 获取当前查看日期的打卡数据
 */
function getTodayCheckins() {
  const ci = state.checkinsByDate[state.viewDate] || {};
  return ci;
}

/**
 * 获取当前查看日期的活跃任务（未删除、且匹配重复规则）
 */
function getActiveTasks() {
  const viewDate = state.viewDate;
  const date = dateOfIso(viewDate);
  const dayOfWeek = date.getDay(); // 0=周日

  return state.tasks
    .filter(t => !t.is_deleted)
    .filter(t => {
      switch (t.repeat_type) {
        case 'daily': return true;
        case 'weekday': return dayOfWeek >= 1 && dayOfWeek <= 5;
        case 'weekend': return dayOfWeek === 0 || dayOfWeek === 6;
        case 'custom': return (t.repeat_days || []).includes(dayOfWeek);
        default: return true;
      }
    })
    .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * 切换任务打卡状态
 */
function toggleTask(taskId) {
  const ci = getTodayCheckins();
  const record = ci[taskId];

  if (record && record.done) {
    // 撤销打卡
    delete ci[taskId];
  } else {
    // 打卡
    const isBackfill = !isToday(state.viewDate);
    ci[taskId] = {
      task_id: taskId,
      done: true,
      backfill: isBackfill,
      created_at: new Date().toISOString(),
    };
  }

  state.checkinsByDate[state.viewDate] = ci;
  recalcBadges();
  _persist();
}

/**
 * 添加任务
 */
function addTask(task) {
  const maxId = state.tasks.reduce((max, t) => Math.max(max, t.id), 0);
  const newTask = {
    ...task,
    id: maxId + 1,
    is_deleted: false,
    sort_order: state.tasks.length + 1,
    created_at: new Date().toISOString(),
  };
  state.tasks.push(newTask);
  _persist();
  return newTask;
}

/**
 * 编辑任务
 */
function updateTask(taskId, updates) {
  const idx = state.tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    state.tasks[idx] = { ...state.tasks[idx], ...updates };
    _persist();
  }
}

/**
 * 删除任务（软删除）
 */
function deleteTask(taskId) {
  const idx = state.tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    state.tasks[idx].is_deleted = true;
    _persist();
  }
}

/**
 * 计算星星总数
 * 基础 7 星 + 所有历史已打卡数
 */
function calcStars() {
  let total = 0; // 从 0 起步，每打卡一次 +1 星
  Object.values(state.checkinsByDate).forEach(dayCi => {
    Object.values(dayCi).forEach(record => {
      if (record.done) total += 1;
    });
  });
  return total;
}

/**
 * 计算连续打卡天数
 */
function calcStreak() {
  let streak = 0;
  const now = dateOfIso(today());
  // 从昨天开始往回数
  const cur = new Date(now);
  cur.setDate(cur.getDate() - 1);

  while (true) {
    const iso = isoOf(cur);
    const ci = state.checkinsByDate[iso] || {};
    const doneCount = Object.values(ci).filter(r => r.done).length;
    if (doneCount === 0) break;
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  // 检查今天是否也有打卡
  const todayCi = state.checkinsByDate[today()] || {};
  const todayDone = Object.values(todayCi).filter(r => r.done).length;
  if (todayDone > 0) streak++;

  return streak;
}

/**
 * 重新计算徽章获得状态
 * 每次打卡/撤销后调用，自动检测是否获得新徽章
 */
function recalcBadges() {
  const stars = calcStars();
  const streak = calcStreak();

  BADGE_DEFS.forEach(def => {
    const val = def.unit === 'stars' ? stars : streak;
    const earned = val >= def.threshold;
    const already = state.badges.some(b => b.type === def.type);

    if (earned && !already) {
      state.badges.push({ type: def.type, acquired_at: new Date().toISOString() });
    }
  });

  _persist();
}

/**
 * 持久化
 */
function _persist() {
  saveState({ state });
}

/**
 * 设置当前查看日期（用于跨页面切换日期）
 */
function setViewDate(iso) {
  state.viewDate = iso;
}

module.exports = {
  state,
  initToday,
  checkDayChange,
  loadTasks,
  loadCheckins,
  loadBadges,
  getTodayCheckins,
  getActiveTasks,
  toggleTask,
  addTask,
  updateTask,
  deleteTask,
  calcStars,
  calcStreak,
  recalcBadges,
  setViewDate,
};
