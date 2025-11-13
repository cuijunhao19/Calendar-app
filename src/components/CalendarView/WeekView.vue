<!-- src/components/CalendarView/WeekView.vue -->
<template>
    <div class="week-view">
        <div class="week-header">
            <div class="time-header"></div>
            <div v-for="day in weekDays" :key="day.date.toString()"
                :class="['day-header', { today: day.isToday, selected: day.isSelected }]">
                <div class="weekday">{{ day.weekday }}</div>
                <div class="date">{{ day.date.getDate() }}</div>
            </div>
        </div>

        <div class="week-body">
            <div class="time-column">
                <div v-for="hour in hours" :key="hour" class="time-slot">
                    {{ formatHour(hour) }}
                </div>
            </div>

            <div class="days-column">
                <div v-for="day in weekDays" :key="day.date.toString()" class="day-column">
                    <div v-for="hour in hours" :key="hour" class="hour-slot" @click="createEvent(day.date, hour)">
                        <div v-for="event in getEventsForHour(day.date, hour)" :key="event.id" class="event-block"
                            :style="{
                                backgroundColor: event.color,
                                top: getEventPosition(event),
                                height: getEventHeight(event)
                            }" @click.stop="selectEvent(event)">
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
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isToday,
    isSameDay,
    setHours,
    setMinutes,
    isWithinInterval
} from 'date-fns'

const props = defineProps({
    currentDate: {
        type: Date,
        required: true
    },
    events: {
        type: Array,
        default: () => []
    },
    selectedDate: {
        type: Date,
        default: null
    }
})

const emit = defineEmits(['day-selected', 'event-selected', 'create-event'])

// 生成一周的日期
const weekDays = computed(() => {
    const start = startOfWeek(props.currentDate, { weekStartsOn: 0 })
    const end = endOfWeek(props.currentDate, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start, end })

    return days.map(date => ({
        date,
        weekday: format(date, 'EEE'),
        isToday: isToday(date),
        isSelected: props.selectedDate && isSameDay(date, props.selectedDate)
    }))
})

// 生成时间槽（7:00 - 22:00）
const hours = computed(() => {
    return Array.from({ length: 16 }, (_, i) => i + 7)
})

// 格式化小时显示
const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`
}

// 获取指定日期和时间的事件
const getEventsForHour = (date, hour) => {
    return props.events.filter(event => {
        const eventDate = new Date(event.startTime)
        return isSameDay(eventDate, date) && eventDate.getHours() === hour
    })
}

// 计算事件在时间轴上的位置（基于分钟）
const getEventPosition = (event) => {
    const start = new Date(event.startTime)
    const minutes = start.getMinutes()
    return `${(minutes / 60) * 100}%`
}

// 计算事件高度（基于持续时间）
const getEventHeight = (event) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    const duration = (end - start) / (1000 * 60) // 分钟
    return `${(duration / 60) * 100}%`
}

// 格式化事件时间显示
const formatEventTime = (event) => {
    const start = new Date(event.startTime)
    return format(start, 'HH:mm')
}

// 创建新事件
const createEvent = (date, hour) => {
    const startTime = setMinutes(setHours(date, hour), 0)
    const endTime = setMinutes(setHours(date, hour + 1), 0)
    emit('create-event', { date, startTime, endTime })
}

// 选择事件
const selectEvent = (event) => {
    emit('event-selected', event)
}
</script>

<style scoped>
.week-view {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.week-header {
    display: grid;
    grid-template-columns: 60px repeat(7, 1fr);
    border-bottom: 1px solid #eee;
    background: white;
}

.time-header {
    padding: 10px;
    border-right: 1px solid #eee;
}

.day-header {
    padding: 10px;
    text-align: center;
    border-right: 1px solid #eee;
    cursor: pointer;
}

.day-header.today {
    background: #e3f2fd;
    color: #2196f3;
}

.day-header.selected {
    background: #bbdefb;
    border-bottom: 2px solid #2196f3;
}

.weekday {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
}

.date {
    font-size: 18px;
    font-weight: bold;
}

.week-body {
    flex: 1;
    display: grid;
    grid-template-columns: 60px 1fr;
    overflow: auto;
}

.time-column {
    background: #fafafa;
}

.time-slot {
    height: 80px;
    border-bottom: 1px solid #eee;
    padding: 5px;
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: start;
    justify-content: end;
}

.days-column {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-left: 1px solid #eee;
}

.day-column {
    border-right: 1px solid #eee;
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
    left: 2px;
    right: 2px;
    border-radius: 4px;
    padding: 4px;
    color: white;
    font-size: 12px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.event-title {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.event-time {
    font-size: 10px;
    opacity: 0.9;
}
</style>