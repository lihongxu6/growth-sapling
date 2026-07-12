/**
 * 持久化适配层
 *
 * 封装 wx.setStorageSync / wx.getStorageSync，
 * 业务代码只调用本模块，不直接调用 wx API。
 *
 * 来源：tech-spec §3.5
 */

const STORAGE_PREFIX = 'gs_'; // growth-sapling 前缀

/**
 * 读取持久化数据
 */
function get(key) {
  try {
    const val = wx.getStorageSync(STORAGE_PREFIX + key);
    return val !== '' ? val : null;
  } catch (e) {
    console.warn('[storage] get 失败:', key, e);
    return null;
  }
}

/**
 * 写入持久化数据
 */
function set(key, value) {
  try {
    wx.setStorageSync(STORAGE_PREFIX + key, value);
    return true;
  } catch (e) {
    console.warn('[storage] set 失败:', key, e);
    return false;
  }
}

/**
 * 删除持久化数据
 */
function remove(key) {
  try {
    wx.removeStorageSync(STORAGE_PREFIX + key);
    return true;
  } catch (e) {
    console.warn('[storage] remove 失败:', key, e);
    return false;
  }
}

/**
 * 应用启动时加载所有持久化数据到 Store
 */
function loadPersistedState(Store) {
  const tasks = get('tasks');
  if (tasks) {
    Store.loadTasks(tasks);
  }

  const checkinsByDate = get('checkinsByDate');
  if (checkinsByDate) {
    Store.loadCheckins(checkinsByDate);
  }

  const badges = get('badges');
  if (badges) {
    Store.loadBadges(badges);
  }
}

/**
 * 保存 Store 状态到持久化
 */
function saveState(Store) {
  set('tasks', Store.state.tasks);
  set('checkinsByDate', Store.state.checkinsByDate);
  set('badges', Store.state.badges);
}

module.exports = {
  get,
  set,
  remove,
  loadPersistedState,
  saveState,
};
