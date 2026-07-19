/**
 * 开屏页 v2.0
 *
 * 规范：design-spec §3.1.1 / §4.1 / §L11；ui-mockup-v2-splash.html（已锁版）
 * 行为：全屏居中 🌱 + 品牌名 + slogan；600ms 入场 → 约 1.5s 停留 → 600ms 淡出跳首页；
 *       点击屏幕任意区域可提前跳过；不显示任何底部跳过提示语（MEMORY §3.11）。
 * 跳转：打卡页是 TabBar 页，必须用 wx.switchTab（QC7 微信官方文档优先）。
 */

Page({
  data: {
    fading: false,
  },

  onLoad() {
    // 入场动画（0.6s）并行播放，约 1.5s 停留后自动淡出
    this._hideTimer = setTimeout(() => this.hideSplash(), 1500);
  },

  onUnload() {
    if (this._hideTimer) clearTimeout(this._hideTimer);
    if (this._switchTimer) clearTimeout(this._switchTimer);
  },

  // 点击屏幕任意区域 → 提前跳过（淡出中禁止重复触发）
  onSkip() {
    if (this.data.fading) return;
    this.hideSplash();
  },

  // 淡出并跳转首页
  hideSplash() {
    if (this.data.fading) return;
    this.setData({ fading: true });

    const app = getApp();
    if (app && app.globalData) app.globalData.splashDone = true;

    // 等待淡出动画（600ms）完成后再跳转，避免画面突兀
    this._switchTimer = setTimeout(() => {
      wx.switchTab({ url: '/pages/home/home' });
    }, 600);
  },
});
