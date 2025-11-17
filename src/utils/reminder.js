// src/utils/reminder.js
class ReminderService {
  constructor() {
    this.timers = new Map();
    this.initialized = false;
    this.init();
  }

  // 修复初始化方法
  async init() {
    if (!("Notification" in window)) {
      console.warn("此浏览器不支持通知功能");
      return;
    }

    // 如果权限已经是granted，直接标记为初始化完成
    if (Notification.permission === "granted") {
      this.initialized = true;
      console.log("通知权限已授予");
      return;
    }

    // 如果权限是default，我们不自动请求，等用户交互
    if (Notification.permission === "default") {
      console.log("通知权限待决定，等待用户交互");
      return;
    }

    // 如果权限是denied，记录日志
    if (Notification.permission === "denied") {
      console.warn("通知权限被拒绝");
      return;
    }
  }

  // 添加主动请求权限的方法
  async requestPermission() {
    if (!("Notification" in window)) {
      return "unsupported";
    }

    try {
      const permission = await Notification.requestPermission();
      console.log("通知权限请求结果:", permission);

      if (permission === "granted") {
        this.initialized = true;
      }

      return permission;
    } catch (error) {
      console.error("请求通知权限失败:", error);
      return "error";
    }
  }

  // 获取当前权限状态
  getPermissionStatus() {
    if (!("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  }

  // 检查是否已授权
  isPermissionGranted() {
    return this.getPermissionStatus() === "granted";
  }

  // 计算提醒时间
  calculateReminderTime(event) {
    if (!event.reminder || event.reminder === "无") {
      return null;
    }

    const eventTime = new Date(event.startTime);
    const now = new Date();

    let reminderTime;

    switch (event.reminder) {
      case "事件发生时":
        reminderTime = eventTime;
        break;
      case "5分钟前":
        reminderTime = new Date(eventTime.getTime() - 5 * 60 * 1000);
        break;
      case "15分钟前":
        reminderTime = new Date(eventTime.getTime() - 15 * 60 * 1000);
        break;
      case "30分钟前":
        reminderTime = new Date(eventTime.getTime() - 30 * 60 * 1000);
        break;
      case "1小时前":
        reminderTime = new Date(eventTime.getTime() - 60 * 60 * 1000);
        break;
      case "1天前":
        reminderTime = new Date(eventTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      default:
        return null;
    }

    // 如果提醒时间已过，不设置定时器
    if (reminderTime <= now) {
      console.log(`事件 "${event.title}" 的提醒时间已过`);
      return null;
    }

    return reminderTime;
  }

  // 设置事件提醒
  scheduleReminder(event) {
    // 清除已有的定时器
    this.cancelReminder(event.id);

    const reminderTime = this.calculateReminderTime(event);
    if (!reminderTime) return;

    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    console.log(
      `设置提醒: "${event.title}", 将在 ${Math.round(
        delay / 1000 / 60
      )} 分钟后提醒`
    );

    const timerId = setTimeout(() => {
      this.showNotification(event);
      this.timers.delete(event.id);
    }, delay);

    this.timers.set(event.id, timerId);
  }

  // 显示通知
  showNotification(event) {
    if (!this.initialized) {
      console.warn("提醒服务未初始化");
      return;
    }

    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("📅 日历提醒", {
        body: `${event.title}\n开始时间: ${this.formatEventTime(event)}\n${
          event.description ? `描述: ${event.description}` : ""
        }`,
        icon: "/favicon.ico",
        tag: event.id, // 相同ID的通知会被替换
        requireInteraction: true, // 需要用户交互才关闭
        silent: false, // 播放声音
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        // 这里可以添加点击通知后的行为，比如打开事件详情
        this.onNotificationClick && this.onNotificationClick(event);
      };

      // 10秒后自动关闭（如果用户没有交互）
      setTimeout(() => notification.close(), 10000);

      // 同时播放提示音（如果有）
      this.playNotificationSound();
    } else {
      // 降级方案：使用alert
      this.showFallbackAlert(event);
    }
  }

  // 播放通知声音
  playNotificationSound() {
    try {
      // 使用Web Audio API播放简单的提示音
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("无法播放提示音:", error);
    }
  }

  // 降级提醒方案
  showFallbackAlert(event) {
    const message = `📅 日历提醒\n\n事件: ${
      event.title
    }\n开始时间: ${this.formatEventTime(event)}\n${
      event.description ? `描述: ${event.description}` : ""
    }`;

    // 使用confirm让用户确认
    if (confirm(message + '\n\n点击"确定"关闭提醒')) {
      console.log("用户确认了提醒");
    }
  }

  // 格式化事件时间显示
  formatEventTime(event) {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    if (start.toDateString() === end.toDateString()) {
      // 同一天
      return `${start.toLocaleDateString(
        "zh-CN",
        options
      )} - ${end.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      // 跨天
      return `${start.toLocaleDateString(
        "zh-CN",
        options
      )} - ${end.toLocaleDateString("zh-CN", options)}`;
    }
  }

  // 取消提醒
  cancelReminder(eventId) {
    if (this.timers.has(eventId)) {
      clearTimeout(this.timers.get(eventId));
      this.timers.delete(eventId);
      console.log(`取消事件 ${eventId} 的提醒`);
    }
  }

  // 更新事件提醒（当事件被编辑时调用）
  updateReminder(oldEvent, newEvent) {
    this.cancelReminder(oldEvent.id);
    this.scheduleReminder(newEvent);
  }

  // 清除所有提醒
  clearAllReminders() {
    this.timers.forEach((timerId, eventId) => {
      clearTimeout(timerId);
      console.log(`清除事件 ${eventId} 的提醒`);
    });
    this.timers.clear();
  }

  // 获取所有活跃的提醒
  getActiveReminders() {
    return Array.from(this.timers.keys());
  }

  // 设置通知点击回调
  setOnNotificationClick(callback) {
    this.onNotificationClick = callback;
  }
}

// 创建单例实例
export const reminderService = new ReminderService();
