/**
 * 统计页逻辑
 */
const Store = require('../../store/index');
const Storage = require('../../utils/storage');
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
    // v2.0 本地版用户信息区（§2.0.6 T4）
    avatarUrl: '',
    nickname: '',
    defaultAvatar: '/assets/avatar-144.png',
  },

  onLoad() {
    this._loadProfile();
  },

  onShow() {
    this._refresh();
  },

  /**
   * T4：读取用户信息；首次无昵称时按原型预填默认昵称「果果的好朋友」并持久化（决策 A：默认身份即真实昵称）
   */
  _loadProfile() {
    const profile = Storage.getProfile() || {};
    let nickname = profile.nickname;
    if (!nickname) {
      nickname = '果果的好朋友';
      profile.nickname = nickname;
      Storage.setProfile(profile);
    }
    const storedAvatar = profile.avatarUrl || '';
    // 先按默认头像渲染，避免 stale 路径占位导致圆圈空白；
    // 再异步校验已保存头像（wxfile://）是否仍有效，失效则回落默认并清理存储。
    this.setData({ avatarUrl: '', nickname });
    if (storedAvatar) {
      const fs = wx.getFileSystemManager();
      if (typeof fs.access !== 'function') return; // 低版本基础库兜底
      fs.access({
        path: storedAvatar,
        success: () => this.setData({ avatarUrl: storedAvatar }),
        fail: () => {
          profile.avatarUrl = '';
          Storage.setProfile(profile);
        },
      });
    }
  },

  /**
   * T5：头像选择（chooseAvatar 回调 → saveFile 持久化）
   * 临时路径须 saveFile 持久化到本地用户目录，否则缓存回收后失效（§2.0.6 官方约束）。
   * T7：saveFile 失败 → 保留上次有效头像，不写入损坏路径。
   */
  onChooseAvatar(e) {
    const tempPath = e.detail.avatarUrl;
    if (!tempPath) return;
    const fs = wx.getFileSystemManager();
    fs.saveFile({
      tempFilePath: tempPath,
      success: (res) => {
        const savedPath = res.savedFilePath;
        const profile = Storage.getProfile() || {};
        profile.avatarUrl = savedPath;
        Storage.setProfile(profile);
        this.setData({ avatarUrl: savedPath });
      },
      fail: (err) => {
        console.warn('[stats] saveFile 失败，保留原头像', err);
      },
    });
  },

  /**
   * T6：昵称失焦 / 确认即存（input type=nickname）
   */
  onNicknameBlur(e) {
    this._saveNickname(e.detail.value);
  },
  onNicknameConfirm(e) {
    this._saveNickname(e.detail.value);
  },
  _saveNickname(val) {
    const nickname = (val || '').trim();
    if (!nickname) return; // 空值不覆盖
    const profile = Storage.getProfile() || {};
    profile.nickname = nickname;
    Storage.setProfile(profile);
    this.setData({ nickname });
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
   * 计算本周完成率（与 H5 一致：doneTotal / taskTotal 累加形式）
   * 每天按活跃任务数 + 实际完成数累加，今天用 Store.activeTasks
   */
  _calcWeekRate() {
    const todayDate = dateOfIso(today());
    const dayOfWeek = todayDate.getDay(); // 0=周日
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    let doneTotal = 0;
    let taskTotal = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = isoOf(d);
      const wd = d.getDay();

      // 当天活跃任务（按 repeat_type 过滤）
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
      const dayTaskCount = activeTasks.length;
      if (dayTaskCount === 0) continue;

      // 当天完成数
      const ci = Store.state.checkinsByDate[iso] || {};
      let dayDone = 0;
      activeTasks.forEach(t => {
        if (ci[t.id] && ci[t.id].done) dayDone++;
      });

      doneTotal += dayDone;
      taskTotal += dayTaskCount;
    }

    return taskTotal > 0 ? Math.round((doneTotal / taskTotal) * 100) : 0;
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
