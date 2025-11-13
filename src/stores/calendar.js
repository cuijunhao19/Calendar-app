// src/stores/calendar.js - 完整版本
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

export const useCalendarStore = defineStore("calendar", () => {
  const currentDate = ref(new Date());
  const events = ref([]);
  const viewMode = ref("month"); // 'month', 'week', 'day'
  const selectedEvent = ref(null);

  // 初始化测试数据
  const initializeTestData = () => {
    const today = new Date();
    events.value = [
      {
        id: "1",
        title: "团队会议",
        description: "每周团队例会",
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
        reminder: "10分钟前",
      },
      {
        id: "3",
        title: "客户拜访",
        description: "拜访重要客户",
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
        reminder: "30分钟前",
      },
      {
        id: "4",
        title: "会议",
        description: "每周团队例会",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          20,
          0,
          0
        ),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          21,
          0,
          0
        ),
        color: "#3498db",
        reminder: "15分钟前",
      },
    ];
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
    console.log("视图范围:", range.start, "到", range.end);

    return events.value.filter((event) => {
      const eventDate = new Date(event.startTime);
      const isInRange = eventDate >= range.start && eventDate <= range.end;
      console.log(`事件 "${event.title}":`, eventDate, "在范围内:", isInRange);
      return isInRange;
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
    };
    events.value.push(newEvent);
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
      events.value[index] = {
        ...events.value[index],
        ...updatedEvent,
        startTime: new Date(updatedEvent.startTime),
        endTime: new Date(updatedEvent.endTime),
        updatedAt: new Date(),
      };
      console.log("更新事件:", events.value[index]);
      return events.value[index];
    }
    return null;
  };

  // 删除事件
  const deleteEvent = (id) => {
    const index = events.value.findIndex((event) => event.id === id);
    if (index !== -1) {
      const deletedEvent = events.value.splice(index, 1)[0];
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

  // 初始化测试数据
  initializeTestData();

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
    goToPrevious,
    goToNext,
    goToToday,
  };
});
