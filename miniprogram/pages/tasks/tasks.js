/**
 * 任务管理页逻辑
 */

const Store = require('../../store/index');
const { ICON_SET, MAX_TASK_NAME, MAX_TASK_PURPOSE } = require('../../utils/constants');

const REPEAT_LABELS = {
  daily: '每天',
  weekday: '工作日',
  weekend: '周末',
  custom: '自定义',
};

Page({
  data: {
    tasks: [],
    atLimit: false,
    showForm: false,
    showDelete: false,
    editingId: null,
    deleteTargetId: null,
    deleteTargetName: '',
    formData: { icon: '📖', name: '', purpose: '', repeat_type: 'daily' },
    iconSet: ICON_SET,
    maxNameLen: MAX_TASK_NAME,
    maxPurposeLen: MAX_TASK_PURPOSE,
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
    this.setData({
      showForm: true,
      editingId: null,
      formData: { icon: '📖', name: '', purpose: '', repeat_type: 'daily' },
    });
  },

  /** 编辑任务 */
  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    const task = Store.state.tasks.find(t => t.id === id);
    if (!task) return;
    this.setData({
      showForm: true,
      editingId: id,
      formData: {
        icon: task.icon,
        name: task.name,
        purpose: task.purpose || '',
        repeat_type: task.repeat_type,
      },
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
    this.setData({ showForm: false });
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
    this.setData({ 'formData.repeat_type': e.currentTarget.dataset.type });
  },

  /** 提交表单 */
  submitForm() {
    const { formData, editingId } = this.data;
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入任务名称', icon: 'none' });
      return;
    }

    if (editingId) {
      Store.updateTask(editingId, formData);
    } else {
      Store.addTask(formData);
    }

    this.setData({ showForm: false });
    this._refresh();
  },
});
