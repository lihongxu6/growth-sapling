/**
 * 任务管理页逻辑
 */

const Store = require('../../store/index');
const { ICON_SET, MAX_TASK_NAME, MAX_TASK_PURPOSE } = require('../../utils/constants');

const REPEAT_LABELS = {
  daily: '每天',
  weekday: '工作日（周一至周五）',
  weekend: '周末',
  custom: '自定义',
};

// 1=周一, 2=周二, ..., 7=周日
const WEEK_DAY_LABELS = [
  { day: 1, label: '周一', selected: false },
  { day: 2, label: '周二', selected: false },
  { day: 3, label: '周三', selected: false },
  { day: 4, label: '周四', selected: false },
  { day: 5, label: '周五', selected: false },
  { day: 6, label: '周六', selected: false },
  { day: 7, label: '周日', selected: false },
];

Page({
  data: {
    tasks: [],
    atLimit: false,
    showForm: false,
    showDelete: false,
    editingId: null,
    deleteTargetId: null,
    deleteTargetName: '',
    formData: { icon: '📖', name: '', purpose: '', repeat_type: 'daily', repeat_days: [] },
    iconSet: ICON_SET,
    weekDays: WEEK_DAY_LABELS.map(d => ({ ...d })),
    maxNameLen: MAX_TASK_NAME,
    maxPurposeLen: MAX_TASK_PURPOSE,
    keyboardHeight: 0,
    scrollTop: 0,
    scrollVersion: 0,        // 每次打开递增，强制 scroll-view 重置位置
  },

  onShow() {
    this._refresh();
  },

  _refresh() {
    const activeTasks = Store.state.tasks.filter(t => !t.is_deleted);
    const tasks = activeTasks
      .map(t => ({ ...t, repeatLabel: REPEAT_LABELS[t.repeat_type] || '每天' }))
      .sort((a, b) => a.sort_order - b.sort_order);
    this.setData({ tasks, atLimit: activeTasks.length >= 6 });
  },

  /** 添加任务 */
  onAdd() {
    if (this.data.atLimit) {
      wx.showToast({ title: '最多添加 6 个任务', icon: 'none' });
      return;
    }
    this._resetForm();
    this.setData({
      showForm: true,
      scrollTop: 0,
      scrollVersion: this.data.scrollVersion + 1,
    });
  },

  /**
   * 监听键盘高度变化，动态调整弹层位置
   */
  onKeyboardHeightChange(e) {
    const { height } = e.detail;
    this.setData({ keyboardHeight: height });
  },

  /** 编辑任务 */
  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    const task = Store.state.tasks.find(t => t.id === id);
    if (!task) return;
    this._resetForm();
    // 同步星期选择
    const weekDays = this.data.weekDays.map(d => ({
      ...d,
      selected: (task.repeat_days || []).includes(d.day),
    }));
    this.setData({
      showForm: true,
      editingId: id,
      formData: {
        icon: task.icon,
        name: task.name,
        purpose: task.purpose || '',
        repeat_type: task.repeat_type,
        repeat_days: task.repeat_days || [],
      },
      weekDays,
      scrollTop: 0,
      scrollVersion: this.data.scrollVersion + 1,
    });
  },

  /** 重置表单到初始状态 */
  _resetForm() {
    this.setData({
      editingId: null,
      formData: { icon: '📖', name: '', purpose: '', repeat_type: 'daily', repeat_days: [] },
      weekDays: WEEK_DAY_LABELS.map(d => ({ ...d, selected: false })),
    });
  },

  /** 删除任务 */
  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    const task = Store.state.tasks.find(t => t.id === id);
    this.setData({
      showDelete: true,
      deleteTargetId: id,
      deleteTargetName: task ? task.name : '',
    });
  },

  cancelDelete() {
    this.setData({ showDelete: false });
  },

  confirmDelete() {
    Store.deleteTask(this.data.deleteTargetId);
    this.setData({ showDelete: false });
    this._refresh();
  },

  /** 关闭表单 */
  closeForm() {
    // 关闭前先重置滚动位置
    this.setData({ showForm: false, scrollTop: 1 });
    setTimeout(() => {
      this.setData({ scrollTop: 0 });
    }, 50);
  },

  /** 图标选择 */
  pickIcon(e) {
    const icon = e.currentTarget.dataset.icon;
    this.setData({ 'formData.icon': icon });
  },

  /** 名称输入 */
  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value });
  },

  /** 意义输入 */
  onPurposeInput(e) {
    this.setData({ 'formData.purpose': e.detail.value });
  },

  /** 设置重复周期 */
  setRepeat(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 'formData.repeat_type': type });
  },

  /** 切换星期选中（仅 custom 模式生效） */
  toggleWeekDay(e) {
    const day = e.currentTarget.dataset.day;
    const weekDays = this.data.weekDays.map(d => ({
      ...d,
      selected: d.day === day ? !d.selected : d.selected,
    }));
    const repeat_days = weekDays.filter(d => d.selected).map(d => d.day);
    this.setData({ weekDays, 'formData.repeat_days': repeat_days });
  },

  /** 提交表单 */
  submitForm() {
    const { formData, editingId } = this.data;
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入任务名称', icon: 'none' });
      return;
    }

    // custom 必须至少选一天
    if (formData.repeat_type === 'custom' && formData.repeat_days.length === 0) {
      wx.showToast({ title: '请至少选择一天', icon: 'none' });
      return;
    }

    // 清理非 custom 的 repeat_days
    const payload = {
      ...formData,
      repeat_days: formData.repeat_type === 'custom' ? formData.repeat_days : [],
    };

    if (editingId) {
      Store.updateTask(editingId, payload);
    } else {
      Store.addTask(payload);
    }

    this.setData({ showForm: false });
    this._refresh();
  },
});
