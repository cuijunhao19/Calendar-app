<!-- src/components/CalendarView/MonthView.vue -->
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
                    <div v-for="event in day.events.slice(0, 3)" :key="event.id" class="event-dot"
                        :style="{ backgroundColor: event.color }" :title="event.title"></div>
                    <div v-if="day.events.length > 3" class="more-events">
                        +{{ day.events.length - 3 }}
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

const emit = defineEmits(['day-selected'])

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const monthDays = computed(() => {
    const start = startOfWeek(startOfMonth(props.currentDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(props.currentDate), { weekStartsOn: 0 })

    return eachDayOfInterval({ start, end }).map(date => ({
        date,
        dayNumber: format(date, 'd'),
        isCurrentMonth: isSameMonth(date, props.currentDate),
        isToday: isToday(date),
        events: props.events.filter(event =>
            isSameDay(new Date(event.startTime), date)
        )
    }))
})

const isSelected = (date) => {
    return props.selectedDate && isSameDay(date, props.selectedDate)
}

const selectDay = (date) => {
    emit('day-selected', date)
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
    min-height: 100px;
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

.event-dot {
    height: 4px;
    border-radius: 2px;
    margin: 1px 0;
}

.more-events {
    font-size: 10px;
    color: #666;
    margin-top: 2px;
}
</style>