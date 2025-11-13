<!-- src/components/EventForm.vue -->
<template>
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
        <div class="modal-content">
            <div class="modal-header">
                <h3>添加事件</h3>
                <button class="close-btn" @click="$emit('update:show', false)">×</button>
            </div>

            <form @submit.prevent="handleSubmit" class="event-form">
                <div class="form-group">
                    <label>标题 *</label>
                    <input v-model="formData.title" type="text" placeholder="输入事件标题" required>
                </div>

                <div class="form-group">
                    <label>描述</label>
                    <textarea v-model="formData.description" placeholder="输入事件描述" rows="3"></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>开始时间 *</label>
                        <input v-model="formData.startTime" type="datetime-local" required>
                    </div>

                    <div class="form-group">
                        <label>结束时间 *</label>
                        <input v-model="formData.endTime" type="datetime-local" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>颜色</label>
                    <div class="color-picker">
                        <div v-for="color in colorOptions" :key="color"
                            :class="['color-option', { selected: formData.color === color }]"
                            :style="{ backgroundColor: color }" @click="formData.color = color"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label>提醒</label>
                    <select v-model="formData.reminder">
                        <option value="无">无</option>
                        <option value="事件发生时">事件发生时</option>
                        <option value="5分钟前">5分钟前</option>
                        <option value="15分钟前">15分钟前</option>
                        <option value="30分钟前">30分钟前</option>
                        <option value="1小时前">1小时前</option>
                        <option value="1天前">1天前</option>
                    </select>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
                        取消
                    </button>
                    <button type="submit" class="btn-primary">
                        保存
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:show', 'save'])

// 表单数据
const formData = reactive({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    color: '#3498db',
    reminder: '无'
})

// 颜色选项
const colorOptions = [
    '#3498db', // 蓝色
    '#e74c3c', // 红色
    '#2ecc71', // 绿色
    '#f39c12', // 橙色
    '#9b59b6', // 紫色
    '#1abc9c'  // 青绿色
]

// 初始化时间
const initFormData = () => {
    const now = new Date()
    const startTime = new Date(now.getTime() + 60 * 60 * 1000) // 1小时后
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 再1小时后

    formData.startTime = formatDateTimeLocal(startTime)
    formData.endTime = formatDateTimeLocal(endTime)
    formData.title = ''
    formData.description = ''
    formData.color = '#3498db'
    formData.reminder = '无'
}

// 格式化日期时间用于datetime-local输入
const formatDateTimeLocal = (date) => {
    return date.toISOString().slice(0, 16)
}

// 提交表单
const handleSubmit = () => {
    emit('save', { ...formData })
    initFormData()
}

// 监听show属性变化
watch(() => props.show, (newVal) => {
    if (newVal) {
        initFormData()
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

.color-option.selected {
    border-color: #333;
    transform: scale(1.1);
}

.form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary {
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
</style>