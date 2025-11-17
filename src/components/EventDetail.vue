<!-- 在EventDetail.vue中添加农历信息 -->
<template>
    <div v-if="show && event" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>事件详情</h3>
                <button class="close-btn" @click="closeModal">×</button>
            </div>

            <div class="event-detail">
                <div class="event-color-bar" :style="{ backgroundColor: event.color }"></div>

                <div class="event-main-info">
                    <h2 class="event-title">{{ event.title }}</h2>

                    <div class="info-section">
                        <div class="info-item">
                            <span class="info-icon">📅</span>
                            <div class="info-content">
                                <div class="info-label">公历时间</div>
                                <div class="info-value">{{ formatEventTime(event) }}</div>
                            </div>
                        </div>

                        <!-- 添加农历时间 -->
                        <div class="info-item" v-if="lunarDate">
                            <span class="info-icon">🌙</span>
                            <div class="info-content">
                                <div class="info-label">农历时间</div>
                                <div class="info-value">{{ lunarDate }}</div>
                            </div>
                        </div>

                        <!-- 添加生肖信息 -->
                        <div class="info-item" v-if="zodiac">
                            <span class="info-icon">🐯</span>
                            <div class="info-content">
                                <div class="info-label">生肖</div>
                                <div class="info-value">{{ zodiac }}</div>
                            </div>
                        </div>

                        <div v-if="event.description" class="info-item">
                            <span class="info-icon">📝</span>
                            <div class="info-content">
                                <div class="info-label">描述</div>
                                <div class="info-value">{{ event.description }}</div>
                            </div>
                        </div>

                        <div class="info-item">
                            <span class="info-icon">⏰</span>
                            <div class="info-content">
                                <div class="info-label">提醒</div>
                                <div class="info-value">{{ event.reminder || '无提醒' }}</div>
                            </div>
                        </div>

                        <div class="info-item">
                            <span class="info-icon">🎨</span>
                            <div class="info-content">
                                <div class="info-label">颜色</div>
                                <div class="info-value">
                                    <div class="color-preview" :style="{ backgroundColor: event.color }"></div>
                                    {{ event.color }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-edit" @click="handleEdit">
                        <span class="btn-icon">✏️</span>
                        <span class="btn-text">编辑</span>
                    </button>
                    <button class="btn btn-delete" @click="handleDelete">
                        <span class="btn-icon">🗑️</span>
                        <span class="btn-text">删除</span>
                    </button>
                    <button class="btn btn-close" @click="closeModal">
                        <span class="btn-text">关闭</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, isSameDay } from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import LunarCalendar from '@/utils/lunar'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:show', 'edit', 'delete'])

const calendarStore = useCalendarStore()

// 计算当前选中的事件
const event = computed(() => calendarStore.selectedEvent)

// 计算农历信息
const lunarInfo = computed(() => {
    if (!event.value) return null
    const startDate = new Date(event.value.startTime)
    return LunarCalendar.solarToLunar(startDate)
})

const lunarDate = computed(() => {
    if (!lunarInfo.value) return ''
    return `${lunarInfo.value.lunarYearName} ${lunarInfo.value.lunarMonthName}${lunarInfo.value.lunarDayName}`
})

const zodiac = computed(() => {
    return lunarInfo.value?.zodiac || ''
})

// 格式化事件时间
const formatEventTime = (event) => {
    if (!event) return ''

    const start = new Date(event.startTime)
    const end = new Date(event.endTime)

    if (isSameDay(start, end)) {
        return `${format(start, 'yyyy年MM月dd日 HH:mm')} - ${format(end, 'HH:mm')}`
    } else {
        return `${format(start, 'yyyy年MM月dd日 HH:mm')} - ${format(end, 'yyyy年MM月dd日 HH:mm')}`
    }
}

// 关闭模态框
const closeModal = () => {
    emit('update:show', false)
    calendarStore.clearSelectedEvent()
}

// 处理编辑
const handleEdit = () => {
    if (event.value) {
        emit('edit', event.value)
    }
}

// 处理删除
const handleDelete = () => {
    if (event.value && confirm('确定要删除这个事件吗？此操作不可撤销。')) {
        emit('delete', event.value.id)
    }
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
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
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

.event-detail {
    position: relative;
}

.event-color-bar {
    height: 6px;
    width: 100%;
}

.event-main-info {
    padding: 24px;
}

.event-title {
    margin: 0 0 24px 0;
    font-size: 24px;
    font-weight: 700;
    color: #333;
    line-height: 1.3;
    word-break: break-word;
}

.info-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.info-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
    margin-top: 2px;
}

.info-content {
    flex: 1;
}

.info-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
    font-weight: 500;
}

.info-value {
    font-size: 16px;
    color: #333;
    line-height: 1.4;
}

.color-preview {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 8px;
    vertical-align: middle;
    border: 1px solid #eee;
}

.action-buttons {
    display: flex;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
    border-radius: 0 0 12px 12px;
}

.btn {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: center;
}

.btn-edit {
    background: #3498db;
    color: white;
}

.btn-edit:hover {
    background: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.btn-delete {
    background: #e74c3c;
    color: white;
}

.btn-delete:hover {
    background: #c0392b;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

.btn-close {
    background: white;
    color: #666;
    border: 1px solid #ddd;
}

.btn-close:hover {
    background: #f5f5f5;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon {
    font-size: 16px;
}

.btn-text {
    white-space: nowrap;
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

/* 响应式设计 */
@media (max-width: 600px) {
    .modal-overlay {
        padding: 10px;
    }

    .modal-content {
        max-width: 100%;
    }

    .event-main-info {
        padding: 20px;
    }

    .event-title {
        font-size: 20px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 8px;
    }

    .btn {
        flex: none;
    }
}
</style>