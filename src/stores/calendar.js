// src/stores/calendar.js
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
  const events = ref([
    {
      id: "1",
      title: "团队会议",
      description: "每周团队例会",
      startTime: new Date(new Date().setHours(10, 0, 0, 0)),
      endTime: new Date(new Date().setHours(11, 0, 0, 0)),
      color: "#3498db",
      reminder: "15分钟前",
    },
    {
      id: "2",
      title: "设计评审",
      description: "新产品设计评审会议",
      startTime: new Date(new Date().setHours(14, 30, 0, 0)),
      endTime: new Date(new Date().setHours(15, 30, 0, 0)),
      color: "#e74c3c",
      reminder: "10分钟前",
    },
    {
      id: "3",
      title: "客户拜访",
      description: "拜访重要客户",
      startTime: new Date(new Date().setHours(16, 0, 0, 0)),
      endTime: new Date(new Date().setHours(17, 30, 0, 0)),
      color: "#2ecc71",
      reminder: "30分钟前",
    },
  ]);
  const viewMode = ref("month"); // 'month', 'week', 'day'

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
          start: startOfDay(currentDate.value), // 使用startOfDay
          end: endOfDay(currentDate.value), // 使用endOfDay
        };
      default:
        return {
          start: currentDate.value,
          end: currentDate.value,
        };
    }
  });

  // 获取当前视图的事件
  const currentViewEvents = computed(() => {
    return events.value.filter((event) => {
      const eventDate = new Date(event.startTime);
      const range = currentViewRange.value;
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
    };
    events.value.push(newEvent);
    return newEvent;
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
      };
    }
  };

  // 删除事件
  const deleteEvent = (id) => {
    const index = events.value.findIndex((event) => event.id === id);
    if (index !== -1) {
      events.value.splice(index, 1);
    }
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

  return {
    currentDate,
    events,
    viewMode,
    currentViewRange,
    currentViewEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    goToPrevious,
    goToNext,
    goToToday,
  };
});
