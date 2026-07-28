/**
 * 打卡页逻辑
 */

const Store = require('../../store/index');
const { today, fmtDate, fmtDateShort, isToday, isoOf, dateOfIso, daysInMonth, firstDayOfMonth } = require('../../utils/date');
const guide = require('../../utils/guide');

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
    celebrationText: '',
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(),
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calDays: [],
    fmtDate,
    fmtDateShort,
    // v2.1 用户引导教练层数据
    coach: { visible: false, step: 0, target: '', text: '', real: false, showClose: false },
  },

  onLoad() {},

  onShow() {
    this._refresh();
    this._syncCoach();
  },

  /**
   * 同步引导教练层（onShow + 推进后调用）
   */
  _syncCoach() {
    const step = guide.getStep();
    if (step === null || !guide.isStepOnPage('home', step)) {
      if (this.data.coach.visible) this.setData({ 'coach.visible': false });
      return;
    }
    const c = guide.getContent(step);
    this.setData({
      coach: { visible: true, step, target: c.target, text: c.text, real: c.real, showClose: c.showClose },
    });
  },

  /**
   * G2 强制步：真实点击首个任务卡 → 真实打卡（Store.toggleTask）+ 推进到 G3(统计页)
   * 注意：教练层 target-spot(real) 拦截了点击，原 .task-card 的 onTaskTap 不会触发，
   * 故此处手动完成真实打卡动作，再推进引导。
   */
  onCoachTargetTap() {
    const step = guide.getStep();
    if (step !== 1) return;
    const t = this.data.activeTasks[0];
    if (t) {
      Store.toggleTask(t.id);
      this._refresh();
    }
    this._advanceGuide('home');
  },

  /** 概念步下一步（本页无概念步，备位） */
  onCoachNext() {
    this._advanceGuide('home');
  },

  /** G3–G5 小 ×：关闭整个引导（本页无，备位） */
  onCoachClose() {
    guide.close();
    this._syncCoach();
  },

  /** G6 完成（本页无末步，备位） */
  onCoachComplete() {},

  /**
   * 推进引导：若进入下一步且跨页则 switchTab。
   */
  _advanceGuide(page) {
    const stepBefore = guide.getStep();
    if (stepBefore === null) return;
    guide.advance(page);
    const stepAfter = guide.getStep();
    if (stepAfter === null) { this._syncCoach(); return; }
    const nextPage = guide.getContent(stepAfter).page;
    if (nextPage !== page) {
      wx.switchTab({ url: guide.PAGE_URL[nextPage] });
    } else {
      this._syncCoach();
    }
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

    const isBackfill = !isToday(viewDate) && viewDate < today();
    const isFuture = viewDate > today();
    const streak = Store.calcStreak();
    const stars = Store.calcStars();

    this.setData({
      viewDate,
      viewDateFmt: fmtDate(viewDate),
      viewDateShort: fmtDateShort(viewDate),
      activeTasks: tasksWithStatus,
      doneCount,
      progressPct,
      streak,
      stars,
      isBackfill,
      isFuture,
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

    // 未来日期不可打卡
    if (!isToday(this.data.viewDate) && this.data.viewDate > today()) {
      wx.showToast({ title: '不要着急，到这天了才可以打卡哦', icon: 'none' });
      return;
    }

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

      // 检查是否全部完成（用 toggle 后的实时数据）：今天或补卡，最后一个活跃任务完成时弹一次
      if (doneAfter >= totalActive) {
        const isTodayView = isToday(this.data.viewDate);
        const text = isTodayView
          ? '今天的任务全部完成！'
          : fmtDateShort(this.data.viewDate) + '的任务全部补卡完成！';
        this.setData({ showCelebration: true, celebrationText: text });
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
