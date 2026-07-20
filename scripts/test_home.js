/**
 * 打卡页·补卡完成庆祝弹窗·沙箱逻辑测试
 *
 * 目的：验证 home.js 的「全部完成庆祝」在补卡场景（历史日最后一个活跃任务完成）也能触发，
 *       且文案动态：今天=「今天的任务全部完成！」，补卡日=「X月X日的任务全部补卡完成！」。
 *       动画/图标复用现有 celebration-overlay，本脚本只验证触发与文案逻辑（视觉待真机）。
 *
 * 方法：mock 微信全局 API + 桩掉 Store（按当天活跃任务过滤）+ 桩掉 date 工具，捕获 Page 后驱动 onTaskTap。
 */

const Module = require('module');
const path = require('path');

// ---------- mock wx ----------
global.wx = {
  showToast() {},
  showModal({ success }) { if (typeof success === 'function') success({ confirm: true }); },
  getFileSystemManager() { return { saveFile: () => {}, access: () => {} }; },
};

// ---------- date 工具 mock（与 utils/date 行为一致）----------
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function isoOf(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }
function dateOfIso(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
function today() { return '2026-07-20'; }
function isToday(iso) { return iso === today(); }
function fmtDate(iso) {
  const date = dateOfIso(iso);
  const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 周${weekMap[date.getDay()]}`;
}
function fmtDateShort(iso) { const date = dateOfIso(iso); return `${date.getMonth() + 1}月${date.getDate()}日`; }
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

// ---------- 捕获 Page + 桩依赖 ----------
let _page = null;
global.Page = (obj) => { _page = obj; };

// 共享 Store 状态（测试里按用例重置）
const _state = {
  viewDate: today(),
  calYear: 2026,
  calMonth: 6,
  tasks: [],
  checkinsByDate: {},
};

function getActiveTasks() {
  const date = dateOfIso(_state.viewDate);
  const dayOfWeek = date.getDay();
  return _state.tasks.filter(t => {
    if (t.is_deleted) return false;
    switch (t.repeat_type) {
      case 'daily': return true;
      case 'weekday': return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekend': return dayOfWeek === 0 || dayOfWeek === 6;
      case 'custom': return (t.repeat_days || []).includes(dayOfWeek);
      default: return true;
    }
  });
}
function getTodayCheckins() { return _state.checkinsByDate[_state.viewDate] || {}; }
function toggleTask(taskId) {
  const ci = getTodayCheckins();
  const record = ci[taskId];
  if (record && record.done) {
    delete ci[taskId];
  } else {
    const isBackfill = !isToday(_state.viewDate);
    ci[taskId] = { task_id: taskId, done: true, backfill: isBackfill, created_at: new Date().toISOString() };
  }
  _state.checkinsByDate[_state.viewDate] = ci;
}

let _storeMock = null;
const _origLoad = Module._load;
Module._load = function (request) {
  if (request === '../../store/index') {
    return (_storeMock = {
      state: _state,
      getActiveTasks,
      getTodayCheckins,
      toggleTask,
      calcStreak: () => 0,
      calcStars: () => 0,
      setViewDate: (iso) => { _state.viewDate = iso; },
    });
  }
  if (request === '../../utils/date') {
    return { today, fmtDate, fmtDateShort, isToday, isoOf, dateOfIso, daysInMonth, firstDayOfMonth };
  }
  return _origLoad.apply(this, arguments);
};

// 加载被测模块
require(path.join(__dirname, '..', 'miniprogram', 'pages', 'home', 'home.js'));
_page.setData = function (patch) { Object.assign(_page.data, patch); };

// ---------- 测试框架 ----------
let _pass = 0, _fail = 0, _skip = 0;
const _cases = [];
function test(id, cat, title, fn) {
  try { fn(); _pass += 1; _cases.push({ id, cat, title, result: 'PASS' }); }
  catch (e) { _fail += 1; _cases.push({ id, cat, title, result: 'FAIL', reason: e.message }); }
}
function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg} | 实际:${a} 期望:${b}`);
}

// 5 个 daily 任务
function baseTasks() {
  return [
    { id: 1, name: '每日阅读', is_deleted: false, repeat_type: 'daily' },
    { id: 2, name: '运动', is_deleted: false, repeat_type: 'daily' },
    { id: 3, name: '按时吃饭', is_deleted: false, repeat_type: 'daily' },
    { id: 4, name: '任务4', is_deleted: false, repeat_type: 'daily' },
    { id: 5, name: '任务5', is_deleted: false, repeat_type: 'daily' },
  ];
}

// 在指定日期把前 n 个任务标记为完成
function seedDone(iso, n) {
  const ci = {};
  for (let i = 1; i <= n; i++) ci[i] = { done: true, backfill: iso !== today() };
  _state.checkinsByDate[iso] = ci;
}

// 配置并刷新页面
function setupFor(iso) {
  _state.tasks = baseTasks();
  _state.viewDate = iso;
  _state.checkinsByDate = {};
  seedDone(iso, 4); // 5 个任务里先完成 4 个
  _page.data.showCelebration = false; // 复位庆祝状态，模拟全新进入
  _page.data.celebrationText = '';
  _page.onShow();  // 触发 _refresh，填充 activeTasks
}

test('T-H01', '正常', '今天最后一个任务完成 → 弹庆祝，文案=今天的任务全部完成！', () => {
  setupFor(today());
  eq(_page.data.activeTasks.filter(t => t.done).length, 4, '前置：应先有 4 个完成');
  _page.onTaskTap({ currentTarget: { dataset: { id: 5 } } });
  eq(_page.data.showCelebration, true, '今天全完成应弹庆祝');
  eq(_page.data.celebrationText, '今天的任务全部完成！', '今天文案应为固定句');
});

test('T-H02', '正常', '补卡（历史日）最后一个任务完成 → 弹庆祝，文案=X月X日的任务全部补卡完成！', () => {
  const backfillIso = '2026-07-13';
  setupFor(backfillIso);
  eq(_page.data.activeTasks.filter(t => t.done).length, 4, '前置：补卡日应先有 4 个完成');
  _page.onTaskTap({ currentTarget: { dataset: { id: 5 } } });
  eq(_page.data.showCelebration, true, '补卡全完成应弹庆祝');
  eq(_page.data.celebrationText, '7月13日的任务全部补卡完成！', '补卡文案应为「X月X日的任务全部补卡完成！」');
});

test('T-H03', '边界', '历史日还差 2 项 → 完成其中 1 项（剩余 1 项）→ 不弹庆祝', () => {
  const iso = '2026-07-13';
  _state.tasks = baseTasks();
  _state.viewDate = iso;
  _state.checkinsByDate = {};
  seedDone(iso, 3); // 5 个里完成 3 个
  _page.data.showCelebration = false; // 复位庆祝状态
  _page.data.celebrationText = '';
  _page.onShow();
  eq(_page.data.activeTasks.filter(t => t.done).length, 3, '前置：应先有 3 个完成');
  _page.onTaskTap({ currentTarget: { dataset: { id: 4 } } }); // 完成第 4 个，剩 1 个
  eq(_page.data.showCelebration, false, '未全部完成不应弹庆祝');
});

test('T-H04', '结构', '庆祝弹层文案由 celebrationText 驱动（不再写死「今天的任务全部完成！」）', () => {
  const _wxml = require('fs').readFileSync(path.join(__dirname, '..', 'miniprogram', 'pages', 'home', 'home.wxml'), 'utf-8');
  if (!_wxml.includes('{{celebrationText}}')) throw new Error('home.wxml 庆祝文案未绑定 celebrationText');
  if (_wxml.includes('>今天的任务全部完成！<')) throw new Error('home.wxml 仍写死今日文案，未动态化');
});

// ---------- 输出 ----------
console.log('\n===== 打卡页·补卡完成庆祝弹窗·沙箱逻辑自测 =====');
for (const c of _cases) {
  const tag = c.result === 'PASS' ? '✅' : '❌';
  console.log(`${tag} ${c.id} [${c.cat}] ${c.title}${c.reason ? ' -> ' + c.reason : ''}`);
}
console.log(`\n通过 ${_pass} / 失败 ${_fail} / 跳过 ${_skip}（共 ${_cases.length}）`);
process.exit(_fail > 0 ? 1 : 0);
