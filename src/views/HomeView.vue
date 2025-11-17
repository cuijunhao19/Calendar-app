<!-- src/views/HomeView.vue - 修复样式版本 -->
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

                <!-- 提醒状态指示器 -->
                <div class="reminder-status" :class="{ 'enabled': isNotificationEnabled }">
                    <span class="status-icon">⏰</span>
                    <span class="status-text">{{ isNotificationEnabled ? '提醒已开启' : '提醒未开启' }}</span>
                </div>
            </div>

            <div class="view-switcher">
                <button v-for="view in views" :key="view.value"
                    :class="['view-btn', { active: viewMode === view.value }]" @click="switchView(view.value)">
                    {{ view.label }}
                </button>

                <!-- 农历切换按钮 -->
                <button class="view-btn lunar-toggle" :class="{ active: showLunar }" @click="toggleLunar">
                    <span class="lunar-icon">{{ showLunar ? '🌙' : '☀️' }}</span>
                    {{ showLunar ? '农历' : '公历' }}
                </button>

                <!-- 数据管理按钮 -->
                <button class="view-btn data-management" @click="showDataManagement = true">
                    数据管理
                </button>
            </div>
        </div>

        <!-- 日历视图 -->
        <div class="calendar-container">
            <MonthView v-if="viewMode === 'month'" :current-date="currentDate" :events="currentViewEvents"
                :selected-date="selectedDate" :show-lunar="showLunar" @day-selected="onDaySelected"
                @event-selected="onEventSelected" @show-events="onShowEvents" />

            <WeekView v-else-if="viewMode === 'week'" :current-date="currentDate" :events="currentViewEvents"
                :selected-date="selectedDate" @day-selected="onDaySelected" @event-selected="onEventSelected"
                @create-event="onCreateEvent" />

            <DayView v-else :current-date="currentDate" :events="currentViewEvents" :show-lunar="showLunar"
                @event-selected="onEventSelected" @create-event="onCreateEvent" />
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

        <!-- 日期事件列表 -->
        <DayEventsModal v-model:show="showDayEventsModal" :selected-date="selectedDateForModal"
            :events="selectedDateEvents" @event-selected="onEventSelected" @edit-event="handleEditEvent"
            @add-event="handleAddEventFromModal" />

        <!-- 数据管理模态框 -->
        <DataManagementModal v-model:show="showDataManagement" @export-data="handleExportData"
            @import-data="handleImportData" @clear-data="handleClearData" />

        <!-- 操作反馈 -->
        <div v-if="showFeedback" class="feedback-message" :class="feedbackType">
            {{ feedbackMessage }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { format, isSameDay } from 'date-fns'
import MonthView from '@/components/CalendarView/MonthView.vue'
import WeekView from '@/components/CalendarView/WeekView.vue'
import DayView from '@/components/CalendarView/DayView.vue'
import EventForm from '@/components/EventForm.vue'
import EventDetail from '@/components/EventDetail.vue'
import DayEventsModal from '@/components/DayEventsModal.vue'
import DataManagementModal from '@/components/DataManagementModal.vue'
import { reminderService } from '@/utils/reminder'

const calendarStore = useCalendarStore()

// 响应式数据
const showEventForm = ref(false)
const showEventDetail = ref(false)
const showDayEventsModal = ref(false)
const showDataManagement = ref(false)
const selectedDate = ref(null)
const selectedDateForModal = ref(null)
const editingEvent = ref(null)
const showFeedback = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const showLunar = ref(true) // 新增：控制农历显示

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

// 计算选中日期的事件
const selectedDateEvents = computed(() => {
    if (!selectedDateForModal.value) return []

    return calendarStore.events.filter(event =>
        isSameDay(new Date(event.startTime), selectedDateForModal.value)
    )
})

// 通知功能状态
const isNotificationEnabled = computed(() => {
    return reminderService.isPermissionGranted()
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

// 切换农历显示
const toggleLunar = () => {
    showLunar.value = !showLunar.value
    showFeedbackMessage(showLunar.value ? '已显示农历' : '已隐藏农历', 'info')
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
    calendarStore.setSelectedEvent(event)
    showEventDetail.value = true
}

// 显示日期所有事件（从月视图的"更多"点击）
const onShowEvents = ({ date, events }) => {
    selectedDateForModal.value = date
    showDayEventsModal.value = true
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
}

// 从日期事件模态框添加事件
const handleAddEventFromModal = (date) => {
    editingEvent.value = null
    selectedDate.value = date
    showEventForm.value = true
    showDayEventsModal.value = false
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
    showDayEventsModal.value = false
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

// 数据管理功能
const handleExportData = () => {
    const data = calendarStore.exportEvents()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calendar-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showFeedbackMessage('数据导出成功', 'success')
    showDataManagement.value = false
}

const handleImportData = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const success = calendarStore.importEvents(e.target.result)
            if (success) {
                showFeedbackMessage('数据导入成功', 'success')
            } else {
                showFeedbackMessage('数据导入失败，文件格式错误', 'error')
            }
        } catch (error) {
            showFeedbackMessage('数据导入失败', 'error')
        }
    }
    reader.readAsText(file)
    showDataManagement.value = false
}

const handleClearData = () => {
    const success = calendarStore.clearAllData()
    if (success) {
        showFeedbackMessage('所有数据已清除', 'success')
        showDataManagement.value = false
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

// 设置通知点击回调
const setupNotificationHandler = () => {
    reminderService.setOnNotificationClick((event) => {
        calendarStore.setSelectedEvent(event)
        showEventDetail.value = true
    })
}

// 初始化
onMounted(() => {
    selectedDate.value = new Date()
    setupNotificationHandler()
    console.log('HomeView 初始化完成')
    console.log('通知权限状态:', Notification.permission)
})
</script>

<style scoped>
/* 基础布局样式 */
.home {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航栏 */
.calendar-nav {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
    flex-shrink: 0;
}

.nav-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.nav-btn {
    padding: 8px 16px;
    border: 1px solid #d0d7de;
    background: #f6f8fa;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    color: #24292f;
    font-weight: 500;
}

.nav-btn:hover {
    background: #f3f4f6;
    border-color: #afb8c1;
}

.nav-btn span {
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.current-period {
    margin: 0;
    font-size: 18px;
    color: #1f2937;
    font-weight: 600;
    flex: 1;
    min-width: 200px;
}

/* 提醒状态指示器 */
.reminder-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    color: #6c757d;
    font-weight: 500;
    white-space: nowrap;
}

.reminder-status.enabled {
    background: #d1edff;
    border-color: #a3d5ff;
    color: #0066cc;
}

.status-icon {
    font-size: 14px;
}

.status-text {
    font-size: 12px;
}

/* 视图切换器 */
.view-switcher {
    display: flex;
    gap: 4px;
    background: #f6f8fa;
    padding: 4px;
    border-radius: 8px;
    border: 1px solid #e1e4e8;
}

.view-btn {
    padding: 8px 16px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    color: #656d76;
    font-weight: 500;
    white-space: nowrap;
}

.view-btn:hover {
    color: #1f2328;
    background: rgba(255, 255, 255, 0.8);
}

.view-btn.active {
    background: white;
    color: #1f2328;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 添加农历切换按钮样式 */
.lunar-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white !important;
}

.lunar-toggle:hover {
    background: linear-gradient(135deg, #5a6fd8, #6a4190) !important;
}

.lunar-toggle.active {
    background: linear-gradient(135deg, #f093fb, #f5576c) !important;
}

.lunar-icon {
    font-size: 14px;
}

/* 数据管理按钮 */
.data-management {
    margin-left: auto;
    background: #6c757d;
    color: white !important;
}

.data-management:hover {
    background: #5a6268 !important;
    color: white !important;
}

/* 日历容器 */
.calendar-container {
    flex: 1;
    overflow: auto;
    padding: 20px;
    background: #f8f9fa;
    min-height: 0;
    /* 允许收缩 */
}

/* 浮动操作按钮 */
.fab-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
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
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.fab:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(33, 150, 243, 0.5);
    background: #1976d2;
}

/* 反馈消息 */
.feedback-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideDown 0.3s ease;
    max-width: 90%;
    text-align: center;
    backdrop-filter: blur(10px);
}

.feedback-message.success {
    background: linear-gradient(135deg, #4caf50, #45a049);
    border: 1px solid #4caf50;
}

.feedback-message.error {
    background: linear-gradient(135deg, #f44336, #e53935);
    border: 1px solid #f44336;
}

.feedback-message.info {
    background: linear-gradient(135deg, #2196f3, #1976d2);
    border: 1px solid #2196f3;
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

/* 响应式设计 */
@media (max-width: 768px) {
    .calendar-nav {
        padding: 12px 16px;
    }

    .nav-controls {
        gap: 8px;
        margin-bottom: 12px;
    }

    .nav-btn {
        padding: 6px 12px;
        font-size: 13px;
    }

    .current-period {
        font-size: 16px;
        min-width: 150px;
    }

    .reminder-status {
        padding: 4px 8px;
        font-size: 11px;
    }

    .view-switcher {
        overflow-x: auto;
        padding: 3px;
    }

    .view-btn {
        padding: 6px 12px;
        font-size: 13px;
        min-width: 60px;
    }

    .calendar-container {
        padding: 12px;
    }

    .fab-container {
        bottom: 16px;
        right: 16px;
    }

    .fab {
        width: 48px;
        height: 48px;
        font-size: 20px;
    }

    .feedback-message {
        top: 10px;
        padding: 10px 16px;
        font-size: 14px;
    }
}

@media (max-width: 480px) {
    .nav-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .current-period {
        text-align: center;
        order: -1;
    }

    .reminder-status {
        align-self: center;
        order: 2;
    }

    .view-switcher {
        order: 3;
    }

    .calendar-nav {
        padding: 8px 12px;
    }

    .calendar-container {
        padding: 8px;
    }
}

/* 确保滚动条样式 */
.calendar-container::-webkit-scrollbar {
    width: 8px;
}

.calendar-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.calendar-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.calendar-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 全局重置可能影响布局的样式 */
:deep(*) {
    box-sizing: border-box;
}

:deep(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(#app) {
    height: 100vh;
    overflow: hidden;
}
</style>