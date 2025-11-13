<!-- src/components/CalendarView/DayView.vue - 简化修复版本 -->
<template>
    <div class="day-view">
        <div class="day-header">
            <h2>{{ formattedDate }}</h2>
            <div class="weekday">{{ weekday }}</div>
        </div>

        <div class="day-timeline">
            <div class="time-column">
                <div v-for="hour in hours" :key="hour" class="time-slot">
                    <span class="time-label">{{ formatHour(hour) }}</span>
                </div>
            </div>

            <div class="events-column">
                <div v-for="hour in hours" :key="hour" class="hour-slot" @click="createEvent(hour)">
                    <div v-for="event in getEventsForHour(hour)" :key="event.id" class="event-block" :style="{
                        backgroundColor: event.color,
                        top: getEventPosition(event),
                        height: getEventHeight(event)
                    }" @click.stop="selectEvent(event)">
                        <div class="event-content">
                            <div class="event-title">{{ event.title }}</div>
                            <div class="event-time">{{ formatEventTime(event) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, isSameDay, setHours, setMinutes } from 'date-fns'

const props = defineProps({
    currentDate: {
        type: Date,
        required: true
    },
    events: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['event-selected', 'create-event'])

// 格式化日期显示
const formattedDate = computed(() => {
    return format(props.currentDate, 'yyyy年MM月dd日')
})

const weekday = computed(() => {
    return format(props.currentDate, 'EEEE')
})

// 时间槽（7:00 - 21:00）
const hours = computed(() => {
    return Array.from({ length: 15 }, (_, i) => i + 7)
})

// 获取当天的事件 - 简化版本
const dayEvents = computed(() => {
    console.log('日视图 - 所有事件:', props.events)
    const filtered = props.events.filter(event => {
        const eventDate = new Date(event.startTime)
        const isSame = isSameDay(eventDate, props.currentDate)
        console.log(`事件 "${event.title}":`, eventDate, '同一天:', isSame)
        return isSame
    })
    console.log('日视图 - 过滤后事件:', filtered)
    return filtered
})

// 获取指定小时的事件
const getEventsForHour = (hour) => {
    const events = dayEvents.value.filter(event => {
        const eventHour = new Date(event.startTime).getHours()
        return eventHour === hour
    })
    console.log(`小时 ${hour} 的事件:`, events.length)
    return events
}

// 格式化小时显示
const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`
}

// 计算事件位置和高度
const getEventPosition = (event) => {
    const start = new Date(event.startTime)
    const minutes = start.getMinutes()
    return `${(minutes / 60) * 100}%`
}

const getEventHeight = (event) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    const duration = (end - start) / (1000 * 60) // 分钟
    return `${Math.max((duration / 60) * 100, 25)}%` // 最小高度25%
}

// 格式化事件时间
const formatEventTime = (event) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
}

// 创建事件
const createEvent = (hour) => {
    const startTime = setMinutes(setHours(props.currentDate, hour), 0)
    const endTime = setMinutes(setHours(props.currentDate, hour + 1), 0)
    emit('create-event', { date: props.currentDate, startTime, endTime })
}

// 选择事件
const selectEvent = (event) => {
    emit('event-selected', event)
}

// 调试辅助函数
const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return format(date, 'HH:mm')
}
</script>

<style scoped>
.day-view {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.day-header {
    padding: 20px;
    background: white;
    border-bottom: 1px solid #eee;
}

.day-header h2 {
    margin: 0 0 8px 0;
    color: #333;
}

.weekday {
    color: #666;
    font-size: 16px;
}

.day-timeline {
    flex: 1;
    display: grid;
    grid-template-columns: 80px 1fr;
    overflow: auto;
}

.time-column {
    background: #fafafa;
    border-right: 1px solid #eee;
}

.time-slot {
    height: 80px;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: start;
    justify-content: end;
    padding: 8px;
}

.time-label {
    font-size: 12px;
    color: #666;
}

.events-column {
    position: relative;
}

.hour-slot {
    height: 80px;
    border-bottom: 1px solid #f5f5f5;
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s;
}

.hour-slot:hover {
    background: #f8f9fa;
}

.event-block {
    position: absolute;
    left: 4px;
    right: 4px;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    z-index: 2;
}

.event-content {
    padding: 8px;
}

.event-title {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 2px;
}

.event-time {
    font-size: 12px;
    opacity: 0.9;
}

/* 调试信息 */
.debug-info {
    padding: 16px;
    background: #f8f9fa;
    border-top: 1px solid #ddd;
    font-size: 12px;
}

.debug-info h4 {
    margin: 0 0 8px 0;
    color: #333;
}

.event-debug {
    padding: 2px 0;
    border-bottom: 1px solid #eee;
}
</style>