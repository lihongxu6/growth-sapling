/**
 * 统计页逻辑
 */

const Store = require('../../store/index');
const { today, isoOf, daysInMonth, firstDayOfMonth } = require('../../utils/date');
const { BADGE_DEFS } = require('../../utils/constants');

Page({
  data: {
    streak: 0,
    stars: 0,
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

    // 构建徽章列表（含获得状态）
    const badges = BADGE_DEFS.map(def => {
      const acquired = Store.state.badges.some(b => b.type === def.type);
      return { ...def, acquired };
    });

    this.setData({ streak, stars, badges });
    this._buildCalGrid();
  },

  _buildCalGrid() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const todayIso = today();

    const grid = [];
    for (let i = 0; i < firstDay; i++) {
      grid.push({ day: '', color: '', isToday: false });
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

      grid.push({ day: d, color, isToday: iso === todayIso });
    }

    this.setData({ calDays: grid });
  },
});
