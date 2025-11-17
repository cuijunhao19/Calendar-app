// src/utils/storage.js
export const storage = {
  // 保存事件到本地存储
  saveEvents(events) {
    try {
      const eventsData = events.map((event) => ({
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        createdAt: event.createdAt ? event.createdAt.toISOString() : null,
        updatedAt: event.updatedAt ? event.updatedAt.toISOString() : null,
      }));

      localStorage.setItem("calendar_events", JSON.stringify(eventsData));
      console.log("事件已保存到本地存储:", eventsData.length, "个事件");
    } catch (error) {
      console.error("保存事件到本地存储失败:", error);
    }
  },

  // 从本地存储加载事件
  loadEvents() {
    try {
      const data = localStorage.getItem("calendar_events");
      if (!data) {
        console.log("本地存储中没有事件数据");
        return [];
      }

      const events = JSON.parse(data);
      const parsedEvents = events.map((event) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : null,
      }));

      console.log("从本地存储加载事件:", parsedEvents.length, "个事件");
      return parsedEvents;
    } catch (error) {
      console.error("从本地存储加载事件失败:", error);
      return [];
    }
  },

  // 清除所有事件数据
  clearEvents() {
    try {
      localStorage.removeItem("calendar_events");
      console.log("已清除所有事件数据");
    } catch (error) {
      console.error("清除事件数据失败:", error);
    }
  },

  // 导出事件数据
  exportEvents() {
    const events = this.loadEvents();
    return JSON.stringify(events, null, 2);
  },

  // 导入事件数据
  importEvents(jsonData) {
    try {
      const events = JSON.parse(jsonData);
      this.saveEvents(events);
      console.log("成功导入事件数据:", events.length, "个事件");
      return true;
    } catch (error) {
      console.error("导入事件数据失败:", error);
      return false;
    }
  },
};
