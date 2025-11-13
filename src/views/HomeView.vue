<!-- src/views/HomeView.vue - 完整集成版本 -->
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
                :selected-date="selectedDate" @day-selected="onDaySelected" @event-selected="onEventSelected" />

            <WeekView v-else-if="viewMode === 'week'" :current-date="currentDate" :events="currentViewEvents"
                :selected-date="selectedDate" @day-selected="onDaySelected" @event-selected="onEventSelected"
                @create-event="onCreateEvent" />

            <DayView v-else :current-date="currentDate" :events="currentViewEvents" @event-selected="onEventSelected"
                @create-event="onCreateEvent" />
        </div>

        <!-- 浮动操作按钮 -->
        <div class="fab-container">
            <button class="fab" @click="handleAddEvent">
                <span>+</span>
            </button>
        </div>

        <!-- 事件表单 -->
        <EventForm v-model:show="showEventForm" :event="editingEvent" @save="handleSaveEvent" />

        <!-- 事件详情 -->
        <EventDetail v-model:show="showEventDetail" @edit="handleEditEvent" @delete="handleDeleteEvent" />

        <!-- 操作反馈 -->
        <div v-if="showFeedback" class="feedback-message" :class="feedbackType">
            {{ feedbackMessage }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { format } from 'date-fns'
import MonthView from '@/components/CalendarView/MonthView.vue'
import WeekView from '@/components/CalendarView/WeekView.vue'
import DayView from '@/components/CalendarView/DayView.vue'
import EventForm from '@/components/EventForm.vue'
import EventDetail from '@/components/EventDetail.vue'

const calendarStore = useCalendarStore()

// 响应式数据
const showEventForm = ref(false)
const showEventDetail = ref(false)
const selectedDate = ref(null)
const editingEvent = ref(null)
const showFeedback = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')

// 视图配置
const views = [
    { label: '月', value: 'month' },
    { label: '周', value: 'week' },
    { label: '日', value: 'day' }
]

// 计算属性
const currentDate = computed(() => calendarStore.currentDate)
const viewMode = computed(() => calendarStore.viewMode)
const currentViewEvents = computed(() => {
    console.log('当前视图事件:', calendarStore.currentViewEvents)
    return calendarStore.currentViewEvents
})

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
    calendarStore.viewMode = 'day'
    calendarStore.currentDate = date
    showFeedbackMessage('切换到日视图', 'info')
}

// 选择事件 - 显示详情
const onEventSelected = (event) => {
    console.log('选择事件:', event)
    calendarStore.setSelectedEvent(event)
    showEventDetail.value = true
}

// 添加新事件
const handleAddEvent = () => {
    editingEvent.value = null
    showEventForm.value = true
}

// 创建事件（从周视图或日视图点击时间槽）
const onCreateEvent = (eventData) => {
    editingEvent.value = null
    showEventForm.value = true
    // 这里可以预填充开始和结束时间
}

// 保存事件（新增和编辑）
const handleSaveEvent = (eventData) => {
    try {
        if (eventData.id) {
            // 编辑模式
            const updated = calendarStore.updateEvent(eventData.id, eventData)
            if (updated) {
                showFeedbackMessage('事件更新成功', 'success')
            }
        } else {
            // 新增模式
            const added = calendarStore.addEvent(eventData)
            if (added) {
                showFeedbackMessage('事件添加成功', 'success')
            }
        }
        showEventForm.value = false
        editingEvent.value = null

        // 强制刷新视图
        nextTick(() => {
            console.log('事件保存后刷新视图')
        })
    } catch (error) {
        console.error('保存事件失败:', error)
        showFeedbackMessage('保存事件失败', 'error')
    }
}

// 编辑事件（从详情页面）
const handleEditEvent = (event) => {
    editingEvent.value = event
    showEventForm.value = true
    showEventDetail.value = false
}

// 删除事件
const handleDeleteEvent = (eventId) => {
    if (confirm('确定要删除这个事件吗？此操作不可撤销。')) {
        const deleted = calendarStore.deleteEvent(eventId)
        if (deleted) {
            showFeedbackMessage('事件删除成功', 'success')
            showEventDetail.value = false
        } else {
            showFeedbackMessage('删除事件失败', 'error')
        }
    }
}

// 显示操作反馈
const showFeedbackMessage = (message, type = 'success') => {
    feedbackMessage.value = message
    feedbackType.value = type
    showFeedback.value = true

    setTimeout(() => {
        showFeedback.value = false
    }, 3000)
}

// 初始化
onMounted(() => {
    selectedDate.value = new Date()
    console.log('HomeView 初始化完成')
    console.log('当前事件:', calendarStore.events)
})
</script>

<style scoped>
.home {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
    position: relative;
}

.calendar-nav {
    background: white;
    border-bottom: 1px solid #eee;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
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
    font-size: 14px;
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
    flex: 1;
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
    font-size: 14px;
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

.fab-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 100;
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
    display: flex;
    align-items: center;
    justify-content: center;
}

.fab:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(33, 150, 243, 0.5);
}

/* 反馈消息 */
.feedback-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideDown 0.3s ease;
}

.feedback-message.success {
    background: #4caf50;
}

.feedback-message.error {
    background: #f44336;
}

.feedback-message.info {
    background: #2196f3;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translate(-50%, -20px);
    }

    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}
</style>