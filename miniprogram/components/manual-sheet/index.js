/**
 * manual-sheet 操作手册弹层组件（G7）
 *
 * 渲染 5 张脱壳干净卡片（来自 guide.MANUAL_CARDS，单一真相源）+ 再走一遍引导。
 * 事件：
 *  - close → 关闭弹层
 *  - cardtap → 点卡片（可选：跳到对应页）
 *  - restart → 再走一遍引导（guide.restart() + switchTab 任务页）
 */
const guide = require('../../utils/guide');

Component({
  properties: {
    visible: { type: Boolean, value: false },
  },

  data: {
    cards: [],
  },

  lifetimes: {
    attached() {
      this.setData({ cards: guide.MANUAL_CARDS });
    },
  },

  methods: {
    noop() {},
    onClose() { this.triggerEvent('close'); },
    onCardTap(e) {
      const page = e.currentTarget.dataset.page;
      this.triggerEvent('cardtap', { page });
    },
    onRestart() { this.triggerEvent('restart'); },
  },
});
