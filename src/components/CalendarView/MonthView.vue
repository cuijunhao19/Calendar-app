<!-- src/components/CalendarView/MonthView.vue - 修复版本 -->
<template>
    <div class="month-view">
        <div class="calendar-header">
            <div class="weekdays">
                <div v-for="day in weekdays" :key="day" class="weekday">
                    {{ day }}
                </div>
            </div>
        </div>
        <div class="calendar-grid">
            <div v-for="day in monthDays" :key="day.date.toString()" :class="['calendar-day', {
                'current-month': day.isCurrentMonth,
                'today': day.isToday,
                'selected': isSelected(day.date),
                'has-events': day.events.length > 0
            }]" @click="selectDay(day.date)">
                <div class="day-number">{{ day.dayNumber }}</div>
                <div class="events-preview">
                    <div v-for="event in day.events.slice(0, 3)" :key="event.id" class="event-item"
                        :style="{ backgroundColor: event.color }" :title="event.title" @click.stop="selectEvent(event)">
                        <span class="event-title">{{ event.title }}</span>
                    </div>
                    <div v-if="day.events.length > 3" class="more-events"
                        @click.stop="showAllEvents(day.date, day.events)">
                        +{{ day.events.length - 3 }} 更多
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
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    isSameDay
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

const emit = defineEmits(['day-selected', 'event-selected', 'show-events'])

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const monthDays = computed(() => {
    const start = startOfWeek(startOfMonth(props.currentDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(props.currentDate), { weekStartsOn: 0 })

    const days = eachDayOfInterval({ start, end }).map(date => {
        const dayEvents = props.events.filter(event =>
            isSameDay(new Date(event.startTime), date)
        )

        console.log(`日期 ${format(date, 'yyyy-MM-dd')} 有 ${dayEvents.length} 个事件`)

        return {
            date,
            dayNumber: format(date, 'd'),
            isCurrentMonth: isSameMonth(date, props.currentDate),
            isToday: isToday(date),
            events: dayEvents
        }
    })

    console.log('月视图天数:', days.length, '总事件数:', props.events.length)
    return days
})

const isSelected = (date) => {
    return props.selectedDate && isSameDay(date, props.selectedDate)
}

const selectDay = (date) => {
    console.log('选择日期:', date)
    emit('day-selected', date)
}

const selectEvent = (event) => {
    console.log('选择事件:', event)
    emit('event-selected', event)
}

const showAllEvents = (date, events) => {
    console.log('显示所有事件:', date, events)
    emit('show-events', { date, events })
}
</script>

<style scoped>
.month-view {
    width: 100%;
    height: 100%;
}

.calendar-header {
    margin-bottom: 10px;
}

.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-weight: bold;
    color: #666;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.weekday {
    padding: 8px;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: #f0f0f0;
    border: 1px solid #f0f0f0;
}

.calendar-day {
    min-height: 120px;
    background: white;
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
}

.calendar-day:hover {
    background: #f8f9fa;
}

.calendar-day.current-month {
    background: white;
}

.calendar-day:not(.current-month) {
    background: #fafafa;
    color: #ccc;
}

.calendar-day.today {
    background: #e3f2fd;
}

.calendar-day.selected {
    background: #bbdefb;
    border: 2px solid #2196f3;
}

.day-number {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 4px;
}

.events-preview {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.event-item {
    padding: 2px 4px;
    border-radius: 3px;
    color: white;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.event-item:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.event-title {
    font-weight: bold;
}

.more-events {
    font-size: 10px;
    color: #666;
    margin-top: 2px;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
}

.more-events:hover {
    background: #f0f0f0;
}
</style>