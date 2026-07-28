/**
 * coach-mark 引导教练层组件
 *
 * 定位核心：用 wx.createSelectorQuery()（全局，查当前页节点）实测目标 rect，
 * 自适应聚光灯 + 气泡位置。注意：不能用 this.createSelectorQuery()/.in(this)，
 * 那只会查组件内节点，找不到页面里的 .cal-grid 等目标。
 *
 * 行为（对齐 tech-spec §6.2 / §11.4）：
 *  - real=true（G1/G2）：target-spot 置于遮罩之上且可点 → 触发真实动作（targettap）
 *  - real=false（G3–G6）：target-spot pointer-events:none，仅作高亮；背景被遮罩挡住
 *  - 小 ×（showClose，仅 G3–G5）→ close；下一步 → next；完成（G6）→ complete
 */
Component({
  properties: {
    visible: { type: Boolean, value: false },
    step: { type: Number, value: 0 },
    target: { type: String, value: '' },
    text: { type: String, value: '' },
    real: { type: Boolean, value: false },
    showClose: { type: Boolean, value: false },
  },

  data: {
    spotStyle: '',
    bubbleStyle: '',
    bubbleSide: 'below',
    sysW: 375,
    sysH: 667,
  },

  lifetimes: {
    attached() {
      try {
        const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
        this.setData({ sysW: sys.windowWidth || 375, sysH: sys.windowHeight || 667 });
      } catch (e) { /* 兜底默认尺寸 */ }
    },
    ready() {
      if (this.data.visible) setTimeout(() => this.position(), 40);
    },
  },

  observers: {
    // 任一变化都重定位（目标渲染后）
    'visible, target, step': function (visible) {
      if (visible) setTimeout(() => this.position(), 40);
    },
  },

  methods: {
    noop() {},

    /** 进入定位：先测距，若目标在折叠外先滚入视区 */
    position() {
      const target = this.data.target;
      if (!target) return;
      const q = wx.createSelectorQuery();
      q.select(target).boundingClientRect((rect) => {
        if (!rect) return; // 目标尚未渲染：静默等待下次
        const sysH = this.data.sysH;
        const offscreen = rect.top < 0 || rect.bottom > sysH - 10;
        if (offscreen) {
          wx.pageScrollTo({
            selector: target,
            offsetTop: 24,
            duration: 200,
            complete: () => setTimeout(() => this._place(target), 260),
          });
          return;
        }
        this._place(target, rect);
      }).exec();
    },

    /** 根据目标 rect 计算聚光灯 + 气泡位置（px 内联，避免 rpx/px 混乱） */
    _place(target, rect) {
      const q = wx.createSelectorQuery();
      q.select(target).boundingClientRect((r) => {
        if (!r) return;
        const sysW = this.data.sysW;
        const sysH = this.data.sysH;
        const pad = 6;
        const spotStyle =
          `left:${r.left - pad}px;top:${r.top - pad}px;` +
          `width:${r.width + pad * 2}px;height:${r.height + pad * 2}px;`;

        const bubbleW = Math.min(sysW - 24, 260);
        const bubbleEstH = 168; // 预估高度用于上下选择
        const gap = 12;

        let side = 'below';
        let bx = Math.max(12, Math.min(sysW - bubbleW - 12, r.left + r.width / 2 - bubbleW / 2));
        let by;
        if (r.bottom + gap + bubbleEstH <= sysH) {
          by = r.bottom + gap; side = 'below';
        } else if (r.top - gap - bubbleEstH >= 0) {
          by = r.top - gap - bubbleEstH; side = 'above';
        } else {
          by = Math.max(12, sysH - bubbleEstH - 12);
        }

        this.setData({
          spotStyle,
          bubbleStyle: `left:${bx}px;top:${by}px;width:${bubbleW}px;`,
          bubbleSide: side,
        });
      }).exec();
    },

    onTargetTap() {
      if (!this.data.real) return; // 概念步不响应
      this.triggerEvent('targettap', { step: this.data.step });
    },
    // G1/G2 强制步：下一步先锁定，必须先真点目标（真实动作由页面完成并推进）
    onLockedNext() {
      wx.showToast({ title: '先点高亮的地方试试吧～', icon: 'none' });
    },
    onNext() { this.triggerEvent('next', { step: this.data.step }); },
    onClose() { this.triggerEvent('close', { step: this.data.step }); },
    onComplete() { this.triggerEvent('complete', { step: this.data.step }); },
  },
});
