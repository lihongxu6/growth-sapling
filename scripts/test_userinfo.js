/**
 * 成长页用户信息区（本地版）· 沙箱可执行逻辑测试
 *
 * 目的：在交真机二维码给用户前，先以测试工程师身份排除沙箱可测的工程问题。
 * 方法：mock 微信全局 API（wx.getStorageSync/setStorageSync/getFileSystemManager）
 *       + 桩掉 stats.js 的非待测依赖（store/date/constants），捕获 Page 对象后直接驱动 handler。
 *
 * 注意：chooseAvatar / input type=nickname 是微信原生组件，DevTools/沙箱无法模拟真机行为
 *       （#22/#34/#QC7），其交互验证不在本脚本范围，留待用户真机扫码确认。
 */

const Module = require('module');
const path = require('path');

// ---------- mock wx ----------
const _store = {};               // 模拟 wx 本地存储
let _fsMode = 'success';        // 'success' | 'fail'
let _savedSeq = 0;             // saveFile 成功计数器
const _fsMissing = new Set();  // access 时视为“文件已失效”的路径集合（模拟旧会话 stale 头像）

global.wx = {
  getStorageSync(k) {
    return Object.prototype.hasOwnProperty.call(_store, k) ? _store[k] : '';
  },
  setStorageSync(k, v) { _store[k] = v; },
  removeStorageSync(k) { delete _store[k]; },
  getFileSystemManager() {
    return {
      saveFile({ tempFilePath, success, fail }) {
        if (_fsMode === 'success') {
          _savedSeq += 1;
          success({ savedFilePath: `http://store/local_${_savedSeq}.png` });
        } else {
          fail({ errMsg: 'saveFile:fail mock' });
        }
      },
      access({ path, success, fail }) {
        if (_fsMissing.has(path)) fail({ errMsg: 'access:fail no such file' });
        else success({});
      },
    };
  },
};

// ---------- 捕获 Page + 桩依赖 ----------
let _page = null;
global.Page = (obj) => { _page = obj; };

const _origLoad = Module._load;
Module._load = function (request) {
  if (request === '../../store/index') {
    return {
      state: { badges: [], tasks: [], checkinsByDate: {} },
      calcStreak: () => 0,
      calcStars: () => 0,
      setViewDate: () => {},
    };
  }
  if (request === '../../utils/date') {
    return {
      today: () => '2026-07-19',
      isoOf: () => '2026-07-19',
      daysInMonth: () => 30,
      firstDayOfMonth: () => 0,
      dateOfIso: () => ({ getDay: () => 1 }),
    };
  }
  if (request === '../../utils/constants') {
    return { BADGE_DEFS: [] };
  }
  return _origLoad.apply(this, arguments);
};

// 加载被测模块（会触发 Page 捕获 + storage 真实加载）
require(path.join(__dirname, '..', 'miniprogram', 'pages', 'stats', 'stats.js'));

// 给 page 对象挂一个会写回 this.data 的 setData
_page.setData = function (patch) { Object.assign(_page.data, patch); };

const Storage = require(path.join(__dirname, '..', 'miniprogram', 'utils', 'storage'));
const PROFILE_KEY = 'gs_userProfile';

// ---------- 极简测试框架 ----------
let _pass = 0, _fail = 0, _skip = 0;
const _cases = [];
function test(id, cat, title, fn) {
  try {
    fn();
    _pass += 1;
    _cases.push({ id, cat, title, result: 'PASS' });
  } catch (e) {
    _fail += 1;
    _cases.push({ id, cat, title, result: 'FAIL', reason: e.message });
  }
}
function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg} | 实际:${a} 期望:${b}`);
}
function resetStore() {
  for (const k of Object.keys(_store)) delete _store[k];
  _savedSeq = 0; _fsMode = 'success'; _fsMissing.clear();
  // 防止 _page.data 跨用例泄漏（setData 会原地修改 data 对象）
  if (_page) { _page.data.avatarUrl = ''; _page.data.nickname = ''; }
}

// ============ storage 单元 ============
test('T-U01', '正常', 'setProfile/getProfile 往返一致', () => {
  resetStore();
  Storage.setProfile({ avatarUrl: 'a.png', nickname: '小明' });
  eq(Storage.getProfile(), { avatarUrl: 'a.png', nickname: '小明' }, '往返不一致');
});
test('T-U02', '边界', '未知键 getProfile 返回 null', () => {
  resetStore();
  eq(Storage.getProfile(), null, '空存储应返回 null');
});
test('T-U03', '边界', '空字符串存储后读取返回 null', () => {
  resetStore();
  _store[PROFILE_KEY] = '';
  eq(Storage.getProfile(), null, '空串应视为无数据');
});

// ============ onLoad / _loadProfile ============
test('T-U04', '正常', 'onLoad 首次无 profile：默认昵称「果果的好朋友」并持久化（决策 A）', () => {
  resetStore();
  _page.onLoad();
  eq(_page.data.avatarUrl, '', '首次头像应为空');
  eq(_page.data.nickname, '果果的好朋友', '首次应预填默认昵称');
  eq(_store[PROFILE_KEY].nickname, '果果的好朋友', '默认昵称应写入存储');
});
test('T-U05', '正常', 'onLoad 已有 profile：回填头像/昵称', () => {
  resetStore();
  _store[PROFILE_KEY] = { avatarUrl: 'x.png', nickname: '果果' };
  _page.onLoad();
  eq(_page.data.avatarUrl, 'x.png', '头像未回填');
  eq(_page.data.nickname, '果果', '昵称未回填');
});
test('T-U13', '异常', 'onLoad 已存头像路径失效（旧会话 stale）：回落默认头像并清理存储', () => {
  resetStore();
  _store[PROFILE_KEY] = { avatarUrl: 'stale.png', nickname: '果果' };
  _fsMissing.add('stale.png');              // 模拟该 wxfile:// 路径在新预览会话已失效
  _page.onLoad();
  eq(_page.data.avatarUrl, '', 'stale 头像应回落为空（显示默认头像）');
  eq(_store[PROFILE_KEY].avatarUrl, '', 'stale 路径应从存储中清理');
  eq(_page.data.nickname, '果果', '昵称不应受影响');
});

// ============ onChooseAvatar ============
test('T-U06', '正常', 'onChooseAvatar 成功：saveFile 持久化路径写入 profile', () => {
  resetStore();
  _fsMode = 'success';
  _page.onChooseAvatar({ detail: { avatarUrl: 'tmp_avatar.png' } });
  eq(_store[PROFILE_KEY].avatarUrl, 'http://store/local_1.png', '持久化路径未写入');
  eq(_page.data.avatarUrl, 'http://store/local_1.png', '视图未更新');
});
test('T-U07', '异常', 'onChooseAvatar 失败：保留原头像，不写坏路径', () => {
  resetStore();
  _store[PROFILE_KEY] = { avatarUrl: 'old.png', nickname: '果果' };
  _page.onLoad();                                   // 把 old.png 载入视图
  eq(_page.data.avatarUrl, 'old.png', '载入视图失败');
  _fsMode = 'fail';
  _page.onChooseAvatar({ detail: { avatarUrl: 'tmp.png' } });
  eq(_store[PROFILE_KEY].avatarUrl, 'old.png', '失败时应保留原头像');
  eq(_page.data.avatarUrl, 'old.png', '失败视图应保持不变(不写坏路径)');
});
test('T-U12', '边界', 'onChooseAvatar 临时路径为空：直接返回不写存储', () => {
  resetStore();
  _store[PROFILE_KEY] = { avatarUrl: 'old.png', nickname: '果果' };
  _page.onChooseAvatar({ detail: { avatarUrl: '' } });
  eq(_store[PROFILE_KEY].avatarUrl, 'old.png', '空路径不应改动 profile');
});

// ============ 昵称（blur / confirm） ============
test('T-U08', '正常', 'onNicknameBlur 正常昵称：持久化并刷新视图', () => {
  resetStore();
  _page.onNicknameBlur({ detail: { value: '小明' } });
  eq(_store[PROFILE_KEY].nickname, '小明', '昵称未持久化');
  eq(_page.data.nickname, '小明', '昵称视图未更新');
});
test('T-U09', '边界', 'onNicknameBlur 空字符串：不覆盖旧昵称', () => {
  resetStore();
  _store[PROFILE_KEY] = { avatarUrl: 'a.png', nickname: '果果' };
  _page.onNicknameBlur({ detail: { value: '' } });
  eq(_store[PROFILE_KEY].nickname, '果果', '空值不应覆盖旧昵称');
});
test('T-U10', '边界', 'onNicknameBlur 含首尾空格：trim 后保存', () => {
  resetStore();
  _page.onNicknameBlur({ detail: { value: '  小明  ' } });
  eq(_store[PROFILE_KEY].nickname, '小明', '未 trim 空格');
});
test('T-U11', '正常', 'onNicknameConfirm 与 blur 同路径：正常保存', () => {
  resetStore();
  _page.onNicknameConfirm({ detail: { value: '乐乐' } });
  eq(_store[PROFILE_KEY].nickname, '乐乐', 'confirm 路径未保存');
});

// ============ 静态结构核查（防回归：头像覆盖层不得外溢盖住昵称，#52） ============
const fs = require('fs');
const _wxml = fs.readFileSync(path.join(__dirname, '..', 'miniprogram', 'pages', 'stats', 'stats.wxml'), 'utf-8');
const _wxss = fs.readFileSync(path.join(__dirname, '..', 'miniprogram', 'pages', 'stats', 'stats.wxss'), 'utf-8');

test('T-W01', '结构', 'chooseAvatar 按钮位于 avatar-wrap 内、昵称输入为其兄弟节点（不被覆盖层盖住）', () => {
  const wrapIdx = _wxml.indexOf('<view class="avatar-wrap">');
  const btnIdx = _wxml.indexOf('<button class="avatar-btn"');
  const metaIdx = _wxml.indexOf('<view class="user-meta">');
  if (wrapIdx < 0 || btnIdx < 0 || metaIdx < 0) throw new Error('WXML 结构缺失 avatar-wrap/avatar-btn/user-meta');
  if (!(wrapIdx < btnIdx && btnIdx < metaIdx)) throw new Error('chooseAvatar 按钮未正确嵌套在 avatar-wrap 内');
  if (!_wxml.includes('bindblur="onNicknameBlur"')) throw new Error('昵称 bindblur 缺失');
  if (!_wxml.includes('bindconfirm="onNicknameConfirm"')) throw new Error('昵称 bindconfirm 缺失');
});
test('T-W02', '结构', 'chooseAvatar 覆盖层必须显式 112rpx（禁止 width:100%，否则真机解析到视口盖住昵称，#52）', () => {
  const start = _wxss.indexOf('.avatar-btn');
  if (start < 0) throw new Error('WXSS 缺少 .avatar-btn');
  const end = _wxss.indexOf('}', start);
  const block = _wxss.slice(start, end + 1);
  if (!block.includes('width: 112rpx')) throw new Error('.avatar-btn 必须显式 width:112rpx');
  if (block.includes('width: 100%')) throw new Error('.avatar-btn 禁止 width:100%（会解析到视口宽度盖住昵称）');
});
test('T-W03', '结构', 'chooseAvatar 按钮不得用绝对定位覆盖层（否则真机盖住昵称，#52 去覆盖层）', () => {
  const start = _wxss.indexOf('.avatar-btn');
  if (start < 0) throw new Error('WXSS 缺少 .avatar-btn');
  const end = _wxss.indexOf('}', start);
  const block = _wxss.slice(start, end + 1);
  if (block.includes('position: absolute')) throw new Error('.avatar-btn 禁止 position:absolute（覆盖层会外溢盖住昵称，须改为头像即按钮本身）');
});
test('T-W04', '结构', '昵称右侧必须存在可点击编辑图标（产品方案兜底：引导点右侧改名字，#52）', () => {
  if (!_wxml.includes('class="name-edit"')) throw new Error('缺少 name-edit 编辑图标');
  if (!_wxml.includes('bindtap="onEditNameTap"')) throw new Error('name-edit 缺少 bindtap 编辑处理');
});

// ============ 输出 ============
console.log('\n===== 用户信息区·沙箱逻辑自测 =====');
for (const c of _cases) {
  const tag = c.result === 'PASS' ? '✅' : '❌';
  console.log(`${tag} ${c.id} [${c.cat}] ${c.title}${c.reason ? ' -> ' + c.reason : ''}`);
}
console.log(`\n通过 ${_pass} / 失败 ${_fail} / 跳过 ${_skip}（共 ${_cases.length}）`);
process.exit(_fail > 0 ? 1 : 0);
