<!-- src/components/DayEventsModal.vue -->
<template>
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>{{ formatDateTitle(selectedDate) }} 的事件</h3>
                <button class="close-btn" @click="closeModal">×</button>
            </div>

            <div class="events-list">
                <div v-for="event in events" :key="event.id" class="event-item" @click="selectEvent(event)">
                    <div class="event-color" :style="{ backgroundColor: event.color }"></div>
                    <div class="event-info">
                        <div class="event-title">{{ event.title }}</div>
                        <div class="event-time">{{ formatEventTime(event) }}</div>
                        <div v-if="event.description" class="event-description">
                            {{ event.description }}
                        </div>
                    </div>
                    <div class="event-actions">
                        <button class="action-btn" @click.stop="editEvent(event)" title="编辑">
                            ✏️
                        </button>
                    </div>
                </div>

                <div v-if="events.length === 0" class="empty-state">
                    <div class="empty-icon">📅</div>
                    <div class="empty-text">这一天没有事件</div>
                    <button class="add-event-btn" @click="addEvent">添加事件</button>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-primary" @click="addEvent">
                    + 添加新事件
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { format, isSameDay } from 'date-fns'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    selectedDate: {
        type: Date,
        default: null
    },
    events: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:show', 'event-selected', 'edit-event', 'add-event'])

// 格式化日期标题
const formatDateTitle = (date) => {
    if (!date) return ''
    return format(date, 'yyyy年MM月dd日')
}

// 格式化事件时间
const formatEventTime = (event) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)

    if (isSameDay(start, end)) {
        return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
    } else {
        return `${format(start, 'MM/dd HH:mm')} - ${format(end, 'MM/dd HH:mm')}`
    }
}

// 关闭模态框
const closeModal = () => {
    emit('update:show', false)
}

// 选择事件
const selectEvent = (event) => {
    emit('event-selected', event)
}

// 编辑事件
const editEvent = (event) => {
    emit('edit-event', event)
}

// 添加事件
const addEvent = () => {
    emit('add-event', props.selectedDate)
    closeModal()
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.2s ease;
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
}

.modal-header h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #f5f5f5;
    color: #666;
}

.events-list {
    flex: 1;
    overflow-y: auto;
    padding: 0;
}

.event-item {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    transition: background-color 0.2s;
    gap: 12px;
}

.event-item:hover {
    background: #f8f9fa;
}

.event-item:last-child {
    border-bottom: none;
}

.event-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.event-info {
    flex: 1;
    min-width: 0;
}

.event-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    font-size: 14px;
}

.event-time {
    font-size: 12px;
    color: #666;
    margin-bottom: 2px;
}

.event-description {
    font-size: 12px;
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.event-actions {
    flex-shrink: 0;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    transition: background-color 0.2s;
    font-size: 14px;
}

.action-btn:hover {
    background: #f0f0f0;
}

.empty-state {
    text-align: center;
    padding: 40px 24px;
    color: #666;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.empty-text {
    font-size: 16px;
    margin-bottom: 20px;
}

.add-event-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.add-event-btn:hover {
    background: #2980b9;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
    flex-shrink: 0;
}

.btn {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    width: 100%;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
}

/* 动画 */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>