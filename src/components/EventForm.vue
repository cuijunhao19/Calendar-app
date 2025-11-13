<!-- src/components/EventForm.vue - 修复CSS版本 -->
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

                <div class="form-group">
                    <label>提醒</label>
                    <select v-model="formData.reminder">
                        <option value="无">无提醒</option>
                        <option value="事件发生时">事件发生时</option>
                        <option value="5分钟前">5分钟前</option>
                        <option value="15分钟前">15分钟前</option>
                        <option value="30分钟前">30分钟前</option>
                        <option value="1小时前">1小时前</option>
                        <option value="1天前">1天前</option>
                    </select>
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
import { ref, reactive, watch, computed } from 'vue'
import { format, isAfter, parseISO } from 'date-fns'

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
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    color: #333;
}

.event-form {
    padding: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
}

input,
textarea,
select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
}

input:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: #3498db;
}

.disabled-field {
    background-color: #f5f5f5;
    color: #666;
    cursor: not-allowed;
}

.required {
    color: #e74c3c;
}

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
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 16px;
    color: #856404;
    font-size: 14px;
}

.field-hint {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
}

.color-picker {
    display: flex;
    gap: 8px;
    margin-top: 5px;
}

.color-option {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid transparent;
    transition: all 0.2s;
}

.color-option-selected {
    border-color: #333;
    transform: scale(1.1);
}

.edit-info-section {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 20px;
    border-left: 4px solid #3498db;
}

.info-item {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 4px;
}

.info-label {
    color: #666;
    font-weight: 500;
}

.info-value {
    color: #333;
}

.form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
}

.btn-secondary {
    background: #95a5a6;
    color: white;
}

.btn-secondary:hover {
    background: #7f8c8d;
}

/* 响应式调整 */
@media (max-width: 600px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    .modal-content {
        width: 95%;
        margin: 10px;
    }
}
</style>