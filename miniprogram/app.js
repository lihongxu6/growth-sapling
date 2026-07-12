/**
 * 「成长小树苗」全局入口
 *
 * 职责：
 * 1. 初始化全局 Store（内存 SSOT）
 * 2. 加载持久化数据（wx.getStorageSync）
 * 3. 控制开屏动画（splashDone）
 * 4. 暴露全局方法给所有页面调用
 *
 * 来源：tech-spec-成长小树苗.md §3
 */

const Store = require('./store/index');
const { loadPersistedState } = require('./utils/storage');

App({
  /**
   * 小程序启动
   */
  onLaunch() {
    // 1. 加载持久化数据到 Store
    loadPersistedState(Store);

    // 2. 初始化今日数据（如果今天还没初始化）
    Store.initToday();

    // 3. 获取系统信息（安全区等）
    const sysInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = sysInfo;
    this.globalData.statusBarHeight = sysInfo.statusBarHeight;
    this.globalData.safeTop = sysInfo.statusBarHeight + 44; // px
  },

  /**
   * 小程序显示（从后台切回）
   */
  onShow() {
    // 如果日期变了，刷新今日状态
    Store.checkDayChange();
  },

  /**
   * 全局数据（页面间共享）
   */
  globalData: {
    splashDone: false,
    systemInfo: null,
    statusBarHeight: 0,
    safeTop: 88, // 默认 px
  },
});
