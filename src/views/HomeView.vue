<!-- src/views/HomeView.vue -->
<template>
    <div class="home">
        <!-- 顶部导航 -->
        <div class="calendar-nav">
            <div class="nav-controls">
                <button class="nav-btn" @click="goToToday">今天</button>
                <button class="nav-btn" @click="goToPrevious">
                    <span>‹</span>
                </button>
                <button class="nav-btn" @click="goToNext">
                    <span>›</span>
                </button>
                <h2 class="current-period">{{ formattedDate }}</h2>
            </div>

            <div class="view-switcher">
                <button v-for="view in views" :key="view.value"
                    :class="['view-btn', { active: viewMode === view.value }]" @click="switchView(view.value)">
                    {{ view.label }}
                </button>
            </div>
        </div>

        <!-- 日历视图 -->
        <div class="calendar-container">
            <MonthView v-if="viewMode === 'month'" :current-date="currentDate" :events="currentViewEvents"
                :selected-date="selectedDate" @day-selected="onDaySelected" />

            <WeekView v-else-if="viewMode === 'week'" :current-date="currentDate" :events="currentViewEvents"
                :selected-date="selectedDate" @day-selected="onDaySelected" @event-selected="onEventSelected"
                @create-event="onCreateEvent" />
            <DayView v-else :current-date="currentDate" :events="currentViewEvents" @event-selected="onEventSelected"
                @create-event="onCreateEvent" />
        </div>

        <!-- 浮动操作按钮 -->
        <div class="fab-container">
            <button class="fab" @click="showEventForm = true">
                <span>+</span>
            </button>
        </div>

        <!-- 事件表单 -->
        <EventForm v-model:show="showEventForm" @save="handleSaveEvent" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { format } from 'date-fns'
import MonthView from '@/components/CalendarView/MonthView.vue'
import WeekView from '@/components/CalendarView/WeekView.vue'
import DayView from '@/components/CalendarView/DayView.vue'
import EventForm from '@/components/EventForm.vue'

const calendarStore = useCalendarStore()

// 响应式数据
const showEventForm = ref(false)
const selectedDate = ref(null)

// 视图配置
const views = [
    { label: '月', value: 'month' },
    { label: '周', value: 'week' },
    { label: '日', value: 'day' }
]

// 计算属性
const currentDate = computed(() => calendarStore.currentDate)
const viewMode = computed(() => calendarStore.viewMode)
const currentViewEvents = computed(() => calendarStore.currentViewEvents)

const formattedDate = computed(() => {
    const formatStr = viewMode.value === 'month' ? 'yyyy年MM月' :
        viewMode.value === 'week' ? 'yyyy年MM月 第w周' :
            'yyyy年MM月dd日'
    return format(currentDate.value, formatStr)
})

// 方法
const switchView = (view) => {
    calendarStore.viewMode = view
}

const goToPrevious = () => {
    calendarStore.goToPrevious()
}

const goToNext = () => {
    calendarStore.goToNext()
}

const goToToday = () => {
    calendarStore.goToToday()
    selectedDate.value = new Date()
}

const onDaySelected = (date) => {
    selectedDate.value = date
    // 如果点击了某一天，切换到日视图
    calendarStore.viewMode = 'day'
    calendarStore.currentDate = date
}

const handleSaveEvent = (eventData) => {
    calendarStore.addEvent(eventData)
    showEventForm.value = false
}

const formatDate = (date) => {
    return format(date, 'yyyy年MM月dd日')
}

// 添加新的事件处理方法
const onEventSelected = (event) => {
    console.log('Event selected:', event)
    // 这里后续会实现事件详情弹窗
}

const onCreateEvent = (eventData) => {
    // 预填充表单
    formData.startTime = formatDateTimeLocal(eventData.startTime)
    formData.endTime = formatDateTimeLocal(eventData.endTime)
    showEventForm.value = true
}

// 初始化
onMounted(() => {
    selectedDate.value = new Date()
})
</script>

<style scoped>
.home {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
}

.calendar-nav {
    background: white;
    border-bottom: 1px solid #eee;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.nav-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.nav-btn:hover {
    background: #f5f5f5;
}

.nav-btn span {
    font-size: 18px;
    font-weight: bold;
}

.current-period {
    margin: 0;
    font-size: 18px;
    color: #333;
}

.view-switcher {
    display: flex;
    gap: 4px;
    background: #f5f5f5;
    padding: 4px;
    border-radius: 8px;
}

.view-btn {
    padding: 8px 16px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.view-btn.active {
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-container {
    flex: 1;
    overflow: auto;
    padding: 16px;
}

.placeholder-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
}

.fab-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
}

.fab {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #2196f3;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    transition: all 0.2s;
}

.fab:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(33, 150, 243, 0.5);
}
</style>