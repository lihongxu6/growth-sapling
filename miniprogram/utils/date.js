/**
 * 日期工具函数
 *
 * 所有日期操作统一入口，避免业务代码直接操作 Date 对象。
 * 内部使用 ISO 日期字符串 'YYYY-MM-DD' 作为标准格式。
 */

/**
 * 将 Date 对象转为 ISO 日期字符串 'YYYY-MM-DD'
 */
function isoOf(date) {
  if (typeof date === 'string') return date;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 将 ISO 日期字符串转为 Date 对象
 */
function dateOfIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 获取今天的 ISO 字符串
 */
function today() {
  return isoOf(new Date());
}

/**
 * 格式化日期为「M月D日 周X」
 */
function fmtDate(iso) {
  const date = dateOfIso(iso);
  const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = weekMap[date.getDay()];
  return `${m}月${d}日 周${w}`;
}

/**
 * 格式化日期为「M月D日」（简洁版）
 */
function fmtDateShort(iso) {
  const date = dateOfIso(iso);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 获取指定月的天数
 */
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 获取指定月第一天是周几（0=周日）
 */
function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * 判断两个日期是否同一天
 */
function isSameDay(iso1, iso2) {
  return iso1 === iso2;
}

/**
 * 判断是否为今天
 */
function isToday(iso) {
  return iso === today();
}

/**
 * 计算从 startIso 到 endIso 之间的所有日期（含两端）
 */
function dateRange(startIso, endIso) {
  const dates = [];
  const start = dateOfIso(startIso);
  const end = dateOfIso(endIso);
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(isoOf(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/**
 * 获取本周起始日期（周一）
 */
function mondayOfWeek(dateIso) {
  const date = dateOfIso(dateIso || today());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return isoOf(date);
}

module.exports = {
  isoOf,
  dateOfIso,
  today,
  fmtDate,
  fmtDateShort,
  daysInMonth,
  firstDayOfMonth,
  isSameDay,
  isToday,
  dateRange,
  mondayOfWeek,
};
