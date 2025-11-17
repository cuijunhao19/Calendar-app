// src/stores/calendar.js - 完整更新版本
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { reminderService } from "@/utils/reminder";
import { storage } from "@/utils/storage";

export const useCalendarStore = defineStore("calendar", () => {
  const currentDate = ref(new Date());
  const events = ref([]);
  const viewMode = ref("month");
  const selectedEvent = ref(null);

  // 从本地存储初始化事件
  const initializeEvents = () => {
    const savedEvents = storage.loadEvents();
    if (savedEvents.length > 0) {
      events.value = savedEvents;
    } else {
      // 如果没有保存的事件，初始化测试数据
      initializeTestData();
    }

    // 初始化所有事件的提醒
    initializeReminders();
  };

  // 初始化测试数据
  const initializeTestData = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    events.value = [
      {
        id: "0",
        title: "晨练",
        description: "每天早上30个俯卧撑",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          10,
          0,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          11,
          0,
          0
        ),
        color: "#abdb1aff",
        reminder: "15分钟前",
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: "1",
        title: "团队会议",
        description: "每周团队例会，讨论项目进展",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          10,
          0,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          11,
          0,
          0
        ),
        color: "#3498db",
        reminder: "15分钟前",
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: "2",
        title: "设计评审",
        description: "新产品设计评审会议",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          14,
          30,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          15,
          30,
          0
        ),
        color: "#e74c3c",
        reminder: "30分钟前",
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: "3",
        title: "客户拜访",
        description: "拜访重要客户，讨论合作事宜",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          16,
          0,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          17,
          30,
          0
        ),
        color: "#2ecc71",
        reminder: "1小时前",
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: "4",
        title: "项目截止",
        description: "提交最终项目报告",
        startTime: new Date(
          tomorrow.getFullYear(),
          tomorrow.getMonth(),
          tomorrow.getDate(),
          9,
          0,
          0
        ),
        endTime: new Date(
          tomorrow.getFullYear(),
          tomorrow.getMonth(),
          tomorrow.getDate(),
          10,
          0,
          0
        ),
        color: "#f39c12",
        reminder: "1天前",
        createdAt: new Date(),
        updatedAt: null,
      },
    ];

    // 保存测试数据到本地存储
    storage.saveEvents(events.value);
  };

  // 获取当前视图的日期范围
  const currentViewRange = computed(() => {
    switch (viewMode.value) {
      case "month":
        return {
          start: startOfMonth(currentDate.value),
          end: endOfMonth(currentDate.value),
        };
      case "week":
        return {
          start: startOfWeek(currentDate.value, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate.value, { weekStartsOn: 0 }),
        };
      case "day":
        return {
          start: startOfDay(currentDate.value),
          end: endOfDay(currentDate.value),
        };
      default:
        return {
          start: startOfDay(currentDate.value),
          end: endOfDay(currentDate.value),
        };
    }
  });

  // 获取当前视图的事件
  const currentViewEvents = computed(() => {
    const range = currentViewRange.value;

    return events.value.filter((event) => {
      const eventDate = new Date(event.startTime);
      return eventDate >= range.start && eventDate <= range.end;
    });
  });

  // 添加事件
  const addEvent = (event) => {
    const newEvent = {
      id: Date.now().toString(),
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      createdAt: new Date(),
      updatedAt: null,
    };

    events.value.push(newEvent);
    storage.saveEvents(events.value);

    // 设置提醒
    if (event.reminder && event.reminder !== "无") {
      reminderService.scheduleReminder(newEvent);
    }

    console.log("添加事件:", newEvent);
    return newEvent;
  };

  // 根据ID获取事件
  const getEventById = (id) => {
    return events.value.find((event) => event.id === id);
  };

  // 更新事件
  const updateEvent = (id, updatedEvent) => {
    const index = events.value.findIndex((event) => event.id === id);
    if (index !== -1) {
      const oldEvent = events.value[index];

      events.value[index] = {
        ...events.value[index],
        ...updatedEvent,
        startTime: new Date(updatedEvent.startTime),
        endTime: new Date(updatedEvent.endTime),
        updatedAt: new Date(),
      };

      storage.saveEvents(events.value);

      // 更新提醒
      if (updatedEvent.reminder && updatedEvent.reminder !== "无") {
        reminderService.updateReminder(oldEvent, events.value[index]);
      } else {
        reminderService.cancelReminder(id);
      }

      console.log("更新事件:", events.value[index]);
      return events.value[index];
    }
    return null;
  };

  // 删除事件
  const deleteEvent = (id) => {
    const index = events.value.findIndex((event) => event.id === id);
    if (index !== -1) {
      reminderService.cancelReminder(id);
      const deletedEvent = events.value.splice(index, 1)[0];
      storage.saveEvents(events.value);
      console.log("删除事件:", deletedEvent);
      return deletedEvent;
    }
    return null;
  };

  // 设置选中事件
  const setSelectedEvent = (event) => {
    selectedEvent.value = event;
  };

  // 清除选中事件
  const clearSelectedEvent = () => {
    selectedEvent.value = null;
  };

  // 初始化所有事件的提醒
  const initializeReminders = () => {
    console.log("初始化事件提醒...");
    events.value.forEach((event) => {
      if (event.reminder && event.reminder !== "无") {
        reminderService.scheduleReminder(event);
      }
    });

    const activeReminders = reminderService.getActiveReminders();
    console.log("活跃的提醒数量:", activeReminders.length);
  };

  // 清除所有提醒
  const clearAllReminders = () => {
    reminderService.clearAllReminders();
  };

  // 导出事件数据
  const exportEvents = () => {
    return storage.exportEvents();
  };

  // 导入事件数据
  const importEvents = (jsonData) => {
    const success = storage.importEvents(jsonData);
    if (success) {
      // 重新加载事件
      const savedEvents = storage.loadEvents();
      events.value = savedEvents;
      initializeReminders();
    }
    return success;
  };

  // 清除所有数据
  const clearAllData = () => {
    if (confirm("确定要清除所有日历数据吗？此操作不可撤销！")) {
      events.value = [];
      storage.clearEvents();
      reminderService.clearAllReminders();
      console.log("所有数据已清除");
      return true;
    }
    return false;
  };

  // 导航功能
  const goToPrevious = () => {
    switch (viewMode.value) {
      case "month":
        currentDate.value = subMonths(currentDate.value, 1);
        break;
      case "week":
        currentDate.value = subWeeks(currentDate.value, 1);
        break;
      case "day":
        currentDate.value = subDays(currentDate.value, 1);
        break;
    }
  };

  const goToNext = () => {
    switch (viewMode.value) {
      case "month":
        currentDate.value = addMonths(currentDate.value, 1);
        break;
      case "week":
        currentDate.value = addWeeks(currentDate.value, 1);
        break;
      case "day":
        currentDate.value = addDays(currentDate.value, 1);
        break;
    }
  };

  const goToToday = () => {
    currentDate.value = new Date();
  };

  // 初始化
  initializeEvents();

  return {
    currentDate,
    events,
    viewMode,
    selectedEvent: computed(() => selectedEvent.value),
    currentViewRange,
    currentViewEvents,
    addEvent,
    getEventById,
    updateEvent,
    deleteEvent,
    setSelectedEvent,
    clearSelectedEvent,
    initializeReminders,
    clearAllReminders,
    exportEvents,
    importEvents,
    clearAllData,
    goToPrevious,
    goToNext,
    goToToday,
  };
});
