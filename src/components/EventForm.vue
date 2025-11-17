<!-- src/components/EventForm.vue - 完整样式版本 -->
<template>
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>{{ isEditMode ? '编辑事件' : '添加事件' }}</h3>
                <button class="close-btn" @click="closeModal">×</button>
            </div>

            <form @submit.prevent="handleSubmit" class="event-form">
                <!-- 编辑模式下显示事件ID -->
                <div v-if="isEditMode" class="form-group">
                    <label>事件ID</label>
                    <input :value="formData.id" type="text" disabled class="disabled-field">
                    <div class="field-hint">事件ID不可修改</div>
                </div>

                <div class="form-group">
                    <label>标题 <span class="required">*</span></label>
                    <input v-model="formData.title" type="text" placeholder="输入事件标题" required
                        :class="{ 'error-field': showErrors && !formData.title }">
                    <div v-if="showErrors && !formData.title" class="error-message">
                        标题是必填项
                    </div>
                </div>

                <div class="form-group">
                    <label>描述</label>
                    <textarea v-model="formData.description" placeholder="输入事件描述" rows="3"></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>开始时间 <span class="required">*</span></label>
                        <input v-model="formData.startTime" type="datetime-local" required
                            :class="{ 'error-field': showErrors && !formData.startTime }">
                    </div>

                    <div class="form-group">
                        <label>结束时间 <span class="required">*</span></label>
                        <input v-model="formData.endTime" type="datetime-local" required
                            :class="{ 'error-field': showErrors && !formData.endTime }">
                    </div>
                </div>

                <div v-if="showErrors && (!formData.startTime || !formData.endTime)" class="error-message">
                    开始时间和结束时间是必填项
                </div>

                <div v-if="timeError" class="time-error-message">
                    ⚠️ {{ timeError }}
                </div>

                <div class="form-group">
                    <label>颜色</label>
                    <div class="color-picker">
                        <div v-for="color in colorOptions" :key="color"
                            :class="['color-option', { 'color-option-selected': formData.color === color }]"
                            :style="{ backgroundColor: color }" @click="formData.color = color"></div>
                    </div>
                </div>

                <!-- 改进的提醒设置 -->
                <div class="form-group">
                    <label>提醒设置</label>
                    <div class="reminder-section">
                        <select v-model="formData.reminder" @change="onReminderChange">
                            <option value="无">无提醒</option>
                            <option value="事件发生时">事件发生时</option>
                            <option value="5分钟前">5分钟前</option>
                            <option value="15分钟前">15分钟前</option>
                            <option value="30分钟前">30分钟前</option>
                            <option value="1小时前">1小时前</option>
                            <option value="1天前">1天前</option>
                        </select>

                        <div v-if="formData.reminder !== '无' && formData.startTime" class="reminder-preview">
                            <div class="reminder-info">
                                <span class="reminder-icon">⏰</span>
                                <span class="reminder-text">
                                    将在 <strong>{{ calculateReminderTime() }}</strong> 提醒您
                                </span>
                            </div>
                        </div>

                        <div v-if="!isNotificationSupported" class="browser-warning">
                            ⚠️ 您的浏览器不支持系统通知，将使用弹窗提醒
                        </div>
                    </div>
                </div>

                <!-- 编辑模式下的额外信息 -->
                <div v-if="isEditMode" class="edit-info-section">
                    <div class="info-item">
                        <span class="info-label">创建时间:</span>
                        <span class="info-value">{{ formatDate(formData.createdAt) }}</span>
                    </div>
                    <div v-if="formData.updatedAt" class="info-item">
                        <span class="info-label">最后更新:</span>
                        <span class="info-value">{{ formatDate(formData.updatedAt) }}</span>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" @click="closeModal">
                        取消
                    </button>
                    <button type="submit" class="btn btn-primary">
                        {{ isEditMode ? '更新事件' : '创建事件' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { format, isAfter, parseISO, addMinutes, addHours, addDays } from 'date-fns'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    event: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:show', 'save'])

// 判断是否为编辑模式
const isEditMode = computed(() => !!props.event)

// 检查浏览器通知支持
const isNotificationSupported = ref('Notification' in window)

// 表单数据
const formData = reactive({
    id: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    color: '#3498db',
    reminder: '无',
    createdAt: null,
    updatedAt: null
})

// 表单验证
const showErrors = ref(false)
const timeError = ref('')

// 颜色选项
const colorOptions = [
    '#3498db', // 蓝色
    '#e74c3c', // 红色
    '#2ecc71', // 绿色
    '#f39c12', // 橙色
    '#9b59b6', // 紫色
    '#1abc9c'  // 青绿色
]

// 初始化表单数据（新增模式）
const initFormData = () => {
    const now = new Date()
    const startTime = new Date(now.getTime() + 60 * 60 * 1000) // 1小时后
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 再1小时后

    formData.id = ''
    formData.title = ''
    formData.description = ''
    formData.startTime = formatDateTimeLocal(startTime)
    formData.endTime = formatDateTimeLocal(endTime)
    formData.color = '#3498db'
    formData.reminder = '无'
    formData.createdAt = null
    formData.updatedAt = null

    showErrors.value = false
    timeError.value = ''
}

// 填充表单数据（编辑模式）
const fillFormData = () => {
    if (props.event) {
        formData.id = props.event.id
        formData.title = props.event.title
        formData.description = props.event.description || ''
        formData.startTime = formatDateTimeLocal(new Date(props.event.startTime))
        formData.endTime = formatDateTimeLocal(new Date(props.event.endTime))
        formData.color = props.event.color || '#3498db'
        formData.reminder = props.event.reminder || '无'
        formData.createdAt = props.event.createdAt
        formData.updatedAt = props.event.updatedAt
    }

    showErrors.value = false
    timeError.value = ''
}

// 格式化日期时间用于datetime-local输入
const formatDateTimeLocal = (date) => {
    return date.toISOString().slice(0, 16)
}

// 格式化日期显示
const formatDate = (date) => {
    if (!date) return '未知'
    return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

// 计算提醒时间显示
const calculateReminderTime = () => {
    if (!formData.startTime) return ''

    const startTime = parseISO(formData.startTime)
    let reminderTime

    switch (formData.reminder) {
        case '事件发生时':
            reminderTime = startTime
            break
        case '5分钟前':
            reminderTime = addMinutes(startTime, -5)
            break
        case '15分钟前':
            reminderTime = addMinutes(startTime, -15)
            break
        case '30分钟前':
            reminderTime = addMinutes(startTime, -30)
            break
        case '1小时前':
            reminderTime = addHours(startTime, -1)
            break
        case '1天前':
            reminderTime = addDays(startTime, -1)
            break
        default:
            return ''
    }

    return format(reminderTime, 'yyyy年MM月dd日 HH:mm')
}

// 提醒设置变化处理
const onReminderChange = () => {
    // 可以在这里添加额外的逻辑
    console.log('提醒设置改为:', formData.reminder)
}

// 验证表单
const validateForm = () => {
    showErrors.value = true
    timeError.value = ''

    // 基本验证
    if (!formData.title || !formData.startTime || !formData.endTime) {
        return false
    }

    // 时间验证
    const startTime = parseISO(formData.startTime)
    const endTime = parseISO(formData.endTime)

    if (!isAfter(endTime, startTime)) {
        timeError.value = '结束时间必须晚于开始时间'
        return false
    }

    return true
}

// 提交表单
const handleSubmit = () => {
    if (!validateForm()) {
        return
    }

    const eventData = { ...formData }

    // 如果是编辑模式，添加更新时间
    if (isEditMode.value) {
        eventData.updatedAt = new Date()
    } else {
        eventData.createdAt = new Date()
    }

    emit('save', eventData)

    // 重置表单（只在新增模式）
    if (!isEditMode.value) {
        initFormData()
    }
}

// 关闭模态框
const closeModal = () => {
    emit('update:show', false)
}

// 监听show属性变化
watch(() => props.show, (newVal) => {
    if (newVal) {
        if (isEditMode.value) {
            fillFormData()
        } else {
            initFormData()
        }
    }
})

// 监听event属性变化
watch(() => props.event, (newEvent) => {
    if (newEvent) {
        fillFormData()
    }
})

onMounted(() => {
    // 检查通知权限状态
    if (isNotificationSupported.value) {
        console.log('通知权限状态:', Notification.permission)
    }
})
</script>

<style scoped>
/* 模态框基础样式 */
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
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: auto;
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

/* 表单样式 */
.event-form {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #333;
    font-size: 14px;
}

.required {
    color: #e74c3c;
}

input,
textarea,
select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
    transition: all 0.2s;
    font-family: inherit;
}

input:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

textarea {
    resize: vertical;
    min-height: 80px;
}

.disabled-field {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
}

.field-hint {
    font-size: 12px;
    color: #6c757d;
    margin-top: 4px;
}

/* 错误状态 */
.error-field {
    border-color: #e74c3c !important;
}

.error-message {
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
}

.time-error-message {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 16px;
    color: #856404;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 颜色选择器 */
.color-picker {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.color-option {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid transparent;
    transition: all 0.2s;
}

.color-option:hover {
    transform: scale(1.1);
}

.color-option-selected {
    border-color: #333;
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 提醒设置 */
.reminder-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.reminder-preview {
    background: #e8f4fd;
    border: 1px solid #b6e0fe;
    border-radius: 6px;
    padding: 12px;
}

.reminder-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #2c3e50;
}

.reminder-icon {
    font-size: 16px;
}

.reminder-text {
    flex: 1;
}

.reminder-text strong {
    color: #3498db;
}

.browser-warning {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 12px;
    color: #856404;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 编辑信息部分 */
.edit-info-section {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 16px;
    border-left: 4px solid #3498db;
}

.info-item {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 6px;
}

.info-label {
    color: #666;
    font-weight: 500;
}

.info-value {
    color: #333;
    font-family: monospace;
}

/* 表单操作按钮 */
.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    min-width: 100px;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.btn-secondary {
    background: #95a5a6;
    color: white;
}

.btn-secondary:hover {
    background: #7f8c8d;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(149, 165, 166, 0.3);
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
        width: 95%;
        margin: 10px;
    }

    .event-form {
        padding: 20px;
    }

    .form-row {
        grid-template-columns: 1fr;
        gap: 0;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }

    .color-picker {
        justify-content: center;
    }
}

/* 日期时间输入框的特定样式 */
input[type="datetime-local"] {
    font-family: inherit;
}

/* 选择框样式 */
select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 8px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 32px;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar {
    width: 6px;
}

.modal-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>