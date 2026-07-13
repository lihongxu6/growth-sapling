/**
 * 统计页逻辑
 */

const Store = require('../../store/index');
const { today, isoOf, daysInMonth, firstDayOfMonth, dateOfIso } = require('../../utils/date');
const { BADGE_DEFS } = require('../../utils/constants');

Page({
  data: {
    streak: 0,
    stars: 0,
    weekRate: 0,
    calYear: 0,
    calMonth: 0,
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calDays: [],
    badges: [],
  },

  onLoad() {},

  onShow() {
    this._refresh();
  },

  _refresh() {
    const streak = Store.calcStreak();
    const stars = Store.calcStars();

    // 本周完成率
    const weekRate = this._calcWeekRate();

    // 当前年月
    const now = new Date();
    const calYear = now.getFullYear();
    const calMonth = now.getMonth() + 1;

    // 构建徽章列表（对齐设计稿：动态进度文案 + grayscale 状态）
    const badges = BADGE_DEFS.map(def => {
      const acquired = Store.state.badges.some(b => b.type === def.type);
      const val = def.unit === 'stars' ? stars : streak;
      const remain = def.threshold - val;
      const prog = acquired
        ? '已获得'
        : (remain > 0 ? `还差${remain}${def.unit === 'stars' ? '颗星' : '天'}` : '即将获得');

      return { ...def, acquired, prog };
    });

    this.setData({ streak, stars, weekRate, calYear, calMonth, badges });
    this._buildCalGrid();
  },

  /**
   * 计算本周完成率
   * 每天根据当天的活跃任务计算（weekday/weekend/custom 过滤）
   */
  _calcWeekRate() {
    const now = dateOfIso(today());
    const dayOfWeek = now.getDay(); // 0=周日
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    let totalDays = 0;
    let completedDays = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = isoOf(d);

      // 用 Store.getActiveTasks 的逻辑：取当天活跃任务
      const wd = d.getDay();
      const activeTasks = Store.state.tasks.filter(t => {
        if (t.is_deleted) return false;
        switch (t.repeat_type) {
          case 'daily': return true;
          case 'weekday': return wd >= 1 && wd <= 5;
          case 'weekend': return wd === 0 || wd === 6;
          case 'custom': return (t.repeat_days || []).includes(wd === 0 ? 7 : wd);
          default: return true;
        }
      });
      const totalTasks = activeTasks.length;

      if (totalTasks > 0) {
        totalDays++;
        const ci = Store.state.checkinsByDate[iso] || {};
        const doneCount = activeTasks.filter(t => ci[t.id] && ci[t.id].done).length;
        if (doneCount >= totalTasks) completedDays++;
      }
    }

    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  },

  _buildCalGrid() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const todayIso = today();
    const todayDate = new Date();

    const grid = [];
    for (let i = 0; i < firstDay; i++) {
      grid.push({ day: '', color: '', isToday: false, iso: '', disabled: true });
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      const iso = isoOf(date);
      const ci = Store.state.checkinsByDate[iso] || {};
      const doneCount = Object.values(ci).filter(r => r.done).length;
      const totalTasks = Store.state.tasks.filter(t => !t.is_deleted).length;

      let color = '';
      if (doneCount > 0) {
        color = doneCount >= totalTasks ? 'green' : 'orange';
      }

      // 未来日期不可点击
      const isFuture = date > todayDate;
      const isToday = iso === todayIso;

      grid.push({ day: d, color, isToday, iso, disabled: isFuture && !isToday });
    }

    this.setData({ calDays: grid });
  },

  /**
   * 点击日历日期 → 跳到打卡页对应日期
   */
  onPickDate(e) {
    const { day, iso, disabled } = e.currentTarget.dataset;
    if (!day || disabled) return;

    // 设置全局 viewDate（这样回到 home 页时看到的是点击的日期）
    Store.setViewDate(iso);

    // 切到首页 tab
    wx.switchTab({ url: '/pages/home/home' });
  },
});
