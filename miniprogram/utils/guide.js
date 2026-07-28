/**
 * 用户引导控制器（v2.1）
 *
 * 职责：
 * 1. 引导内容与展示分离，单一真相源（GUIDE_CONTENT / MANUAL_CARDS）
 * 2. 6 步状态机（G1 添加任务 → G2 打卡 → G3 日历 → G4 徽章 → G5 头像 → G6 手册入口）
 * 3. 进度持久化（storage 键 guideState，无 gs_ 前缀由 storage 适配层统一加）
 *
 * 设计对齐：ui-mockup-v2.1-guide.html（已确认）+ tech-spec-v2.1-guide.md §11 已确认决策。
 *  - G1/G2 = 强制真实操作步（必须真点目标，不可跳）
 *  - G3–G5 = 概念步（看一眼点下一步即可）+ 右上角小 × = 关闭整个引导（非下一步）
 *  - G6 末步 = 只有「完成」，无跳过
 */

const Storage = require('./storage');
const GUIDE_KEY = 'guideState';

/** 引导涉及的页面 → switchTab 路径（单一真相源） */
const PAGE_URL = {
  tasks: '/pages/tasks/tasks',
  home: '/pages/home/home',
  stats: '/pages/stats/stats',
};

/**
 * 6 步内容（单一真相源）。text 与设计稿核对一致；
 * G2 文案修正「给『读书』打卡」→「给今天的小习惯打卡」（已确认 4 默认任务，旧单任务措辞已失效）。
 * real=true 表示必须真点目标（G1/G2）；real=false 概念步（G3–G6）。
 * showClose=true 表示渲染右上角小 ×（仅 G3–G5）。
 */
const GUIDE_CONTENT = [
  {
    page: 'tasks', target: '.add-btn', real: true, showClose: false,
    text: '点这里「添加新任务」，写下你想养成的小习惯吧～先从一个小目标开始最容易坚持！',
  },
  {
    page: 'home', target: '.task-card', real: true, showClose: false,
    text: '点这个小圆圈，就给今天的小习惯打卡啦！完成后它会变绿，火焰也会亮起来🔥',
  },
  {
    page: 'stats', target: '.cal-grid', real: false, showClose: true,
    text: '这是你的打卡日历～🟢全完成 🟠还没打卡 ⚪没任务，点一点看看你有多棒📅',
  },
  {
    page: 'stats', target: '.badge-grid', real: false, showClose: true,
    text: '坚持会解锁小徽章🌟，收集起来超有成就感！每解锁一个，小树苗就长大一点。',
  },
  {
    page: 'stats', target: '.avatar-wrap', real: false, showClose: true,
    text: '点这里可以换头像和昵称，只存在你的手机里，很安全哦～换成你喜欢的样子吧！',
  },
  {
    page: 'stats', target: '.manual-entry', real: false, showClose: false,
    text: '以后不会用的时候，点这里看操作手册，果果带你一步步来📖 随时都能回看哦！',
  },
];

/** 操作手册 5 张脱壳卡片（与设计稿 G7 一致，无遮罩/跳过/下一步） */
const MANUAL_CARDS = [
  { icon: '📋', title: '添加任务', page: 'tasks', text: '写下想养成的小习惯，从一个小目标开始' },
  { icon: '✅', title: '今日打卡', page: 'home', text: '每天完成小习惯，点圆圈打勾攒星星' },
  { icon: '📅', title: '看日历', page: 'stats', text: '点月历看进度：🟢全完成 🟠还没打卡 ⚪没任务' },
  { icon: '🏅', title: '看徽章', page: 'stats', text: '收集星星，解锁你的成长徽章墙' },
  { icon: '🖼️', title: '改头像', page: 'stats', text: '换个喜欢的果果头像，装扮小树苗' },
];

function load() { return Storage.get(GUIDE_KEY) || null; }
function save(s) { Storage.set(GUIDE_KEY, s); }

const guide = {
  STEPS: GUIDE_CONTENT,
  MANUAL_CARDS,
  PAGE_URL,

  /** 首次启动：无 guideState 则置为 active,step=0（由 app.onLaunch 调用） */
  onFirstLaunch() {
    if (!load()) {
      save({ status: 'active', step: 0, updatedAt: Date.now() });
    }
  },

  getState() { return load() || { status: 'done', step: 0 }; },

  isActive() {
    const s = load();
    return !!s && s.status === 'active';
  },

  /** 当前步索引 0..5；非 active 返回 null（页面据此隐藏 coach） */
  getStep() {
    const s = load();
    return (s && s.status === 'active') ? s.step : null;
  },

  getContent(step) { return GUIDE_CONTENT[step] || null; },

  /** 该步是否属于某页（用于页面 onShow 判断是否该本页展示） */
  isStepOnPage(page, step) {
    const c = GUIDE_CONTENT[step];
    return !!c && c.page === page;
  },

  /**
   * 推进：仅在「当前步属于本页」时生效（防跨页乱推进）。
   * 真实步(G1/G2)由真实动作触发；概念步(G3–G6)由气泡「下一步」触发。
   * @returns 新的 guideState
   */
  advance(page) {
    const s = load();
    if (!s || s.status !== 'active') return s;
    const c = GUIDE_CONTENT[s.step];
    if (!c || c.page !== page) return s;
    s.step += 1;
    if (s.step >= GUIDE_CONTENT.length) s.status = 'done';
    s.updatedAt = Date.now();
    save(s);
    return s;
  },

  /** 关闭引导（G3–G5 小 ×，语义 = 终止整个引导） */
  close() {
    const s = load();
    if (!s) return;
    s.status = 'done';
    s.updatedAt = Date.now();
    save(s);
  },

  /** 完成（G6 完成按钮，等价于关闭） */
  complete() { this.close(); },

  /** 再走一遍（手册内「再走一遍引导」） */
  restart() {
    const s = { status: 'active', step: 0, updatedAt: Date.now() };
    save(s);
    return s;
  },
};

module.exports = guide;
