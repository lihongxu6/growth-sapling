/**
 * 打卡页逻辑
 */

const Store = require('../../store/index');
const { today, fmtDate, fmtDateShort, isToday, isoOf, dateOfIso, daysInMonth, firstDayOfMonth } = require('../../utils/date');

Page({
  data: {
    viewDate: today(),
    activeTasks: [],
    doneCount: 0,
    progressPct: 0,
    streak: 0,
    stars: 0,
    isBackfill: false,
    showCal: false,
    showCelebration: false,
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(),
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calDays: [],
    fmtDate,
    fmtDateShort,
  },

  onLoad() {},

  onShow() {
    this._refresh();
  },

  /** 刷新页面数据 */
  _refresh() {
    const viewDate = Store.state.viewDate;
    const activeTasks = Store.getActiveTasks();
    const checkins = Store.getTodayCheckins();

    const tasksWithStatus = activeTasks.map(t => {
      const record = checkins[t.id];
      return {
        ...t,
        done: !!(record && record.done),
        isBackfill: !!(record && record.backfill),
      };
    });

    const doneCount = tasksWithStatus.filter(t => t.done).length;
    const progressPct = activeTasks.length > 0
      ? Math.round((doneCount / activeTasks.length) * 100)
      : 0;

    const isBackfill = !isToday(viewDate);
    const streak = Store.calcStreak();
    const stars = Store.calcStars();

    this.setData({
      viewDate,
      activeTasks: tasksWithStatus,
      doneCount,
      progressPct,
      streak,
      stars,
      isBackfill,
      calYear: Store.state.calYear,
      calMonth: Store.state.calMonth,
    });

    this._buildCalGrid();
  },

  /** 任务卡片点击 */
  onTaskTap(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.activeTasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.done) {
      // 撤销打卡 → 二次确认
      wx.showModal({
        title: '撤销打卡',
        content: task.isBackfill
          ? `确定撤销 ${fmtDateShort(this.data.viewDate)} 对「${task.name}」的补卡吗？`
          : `确定撤销今天「${task.name}」的打卡吗？`,
        success: (res) => {
          if (res.confirm) {
            Store.toggleTask(taskId);
            this._refresh();
          }
        },
      });
    } else {
      // 打卡
      const totalActive = Store.getActiveTasks().length;
      const currentCi = Store.getTodayCheckins();
      const doneBefore = Object.values(currentCi).filter(r => r.done).length;
      const doneAfter = doneBefore + 1; // 这次打卡后

      Store.toggleTask(taskId);
      this._refresh();

      // 检查是否全部完成（用 toggle 后的实时数据）
      if (doneAfter >= totalActive && isToday(this.data.viewDate)) {
        this.setData({ showCelebration: true });
      }
    }
  },

  /** 打开日历 */
  openCalendar() {
    this.setData({ showCal: true });
    this._buildCalGrid();
  },

  /** 关闭日历 */
  closeCalendar() {
    this.setData({ showCal: false });
  },

  /** 切换月份 */
  prevMonth() {
    const { calYear, calMonth } = this.data;
    const newMonth = calMonth === 0 ? 11 : calMonth - 1;
    const newYear = calMonth === 0 ? calYear - 1 : calYear;
    Store.state.calYear = newYear;
    Store.state.calMonth = newMonth;
    this.setData({ calYear: newYear, calMonth: newMonth });
    this._buildCalGrid();
  },

  nextMonth() {
    const { calYear, calMonth } = this.data;
    const newMonth = calMonth === 11 ? 0 : calMonth + 1;
    const newYear = calMonth === 11 ? calYear + 1 : calYear;
    Store.state.calYear = newYear;
    Store.state.calMonth = newMonth;
    this.setData({ calYear: newYear, calMonth: newMonth });
    this._buildCalGrid();
  },

  /** 选择日期 */
  pickDate(e) {
    const iso = e.currentTarget.dataset.iso;
    if (!iso) return;
    Store.state.viewDate = iso;
    this.setData({ showCal: false });
    this._refresh();
  },

  /** 回到今天 */
  goBackToday() {
    Store.state.viewDate = today();
    this._refresh();
  },

  /** 关闭庆祝弹层 */
  dismissCelebration() {
    this.setData({ showCelebration: false });
  },

  /** 构建日历格子 */
  _buildCalGrid() {
    const { calYear, calMonth } = this.data;
    const days = daysInMonth(calYear, calMonth);
    const firstDay = firstDayOfMonth(calYear, calMonth);
    const now = today();

    // 填充前面的空白
    const grid = [];
    for (let i = 0; i < firstDay; i++) {
      grid.push({ day: '', iso: '', color: '', isToday: false, hasData: false });
    }

    // 日期格子
    for (let d = 1; d <= days; d++) {
      const date = new Date(calYear, calMonth, d);
      const iso = isoOf(date);
      const ci = Store.state.checkinsByDate[iso] || {};
      const totalTasks = Store.getActiveTasks().length || Store.state.tasks.filter(t => !t.is_deleted).length;
      const doneCount = Object.values(ci).filter(r => r.done).length;
      const hasBackfill = Object.values(ci).some(r => r.backfill);

      let color = '';
      if (doneCount > 0) {
        if (doneCount >= totalTasks && totalTasks > 0) {
          color = hasBackfill ? 'orange' : 'green';
        } else {
          color = 'gray';
        }
      }

      grid.push({
        day: d,
        iso,
        color,
        isToday: iso === now,
        hasData: doneCount > 0,
      });
    }

    this.setData({ calDays: grid });
  },
});
