<!-- src/components/DataManagementModal.vue -->
<template>
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>数据管理</h3>
                <button class="close-btn" @click="closeModal">×</button>
            </div>

            <div class="data-management-content">
                <!-- 数据备份部分 -->
                <div class="management-section">
                    <h4>数据备份</h4>
                    <p class="section-description">导出您的日历数据作为备份</p>
                    <button class="btn btn-primary export-btn" @click="handleExport">
                        📥 导出数据
                    </button>
                </div>

                <!-- 数据恢复部分 -->
                <div class="management-section">
                    <h4>数据恢复</h4>
                    <p class="section-description">从备份文件恢复日历数据</p>
                    <div class="import-section">
                        <input type="file" ref="fileInput" accept=".json" @change="handleFileSelect" class="file-input">
                        <button class="btn btn-secondary" @click="triggerFileInput">
                            📁 选择文件
                        </button>
                        <div v-if="selectedFile" class="selected-file">
                            已选择: {{ selectedFile.name }}
                        </div>
                    </div>
                    <button class="btn btn-primary import-btn" :disabled="!selectedFile" @click="handleImport">
                        📤 导入数据
                    </button>
                </div>

                <!-- 危险操作部分 -->
                <div class="management-section danger-section">
                    <h4>⚠️ 危险操作</h4>
                    <p class="section-description warning-text">
                        此操作将永久删除所有日历数据，包括所有事件和设置
                    </p>
                    <button class="btn btn-danger" @click="handleClearData">
                        🗑️ 清除所有数据
                    </button>
                </div>

                <!-- 提醒状态 -->
                <div class="management-section">
                    <h4>提醒设置</h4>
                    <div class="notification-status">
                        <div class="status-item">
                            <span class="status-label">浏览器通知:</span>
                            <span class="status-value" :class="notificationStatusClass">
                                {{ notificationStatusText }}
                            </span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">活跃提醒:</span>
                            <span class="status-value">{{ activeRemindersCount }} 个</span>
                        </div>
                        <button v-if="!isNotificationGranted" class="btn btn-sm btn-primary"
                            @click="requestNotificationPermission">
                            启用通知
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { reminderService } from '@/utils/reminder'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:show', 'export-data', 'import-data', 'clear-data'])

const fileInput = ref(null)
const selectedFile = ref(null)

// 计算通知状态
const isNotificationGranted = computed(() => {
    return 'Notification' in window && Notification.permission === 'granted'
})

const notificationStatusText = computed(() => {
    if (!('Notification' in window)) return '不支持'
    switch (Notification.permission) {
        case 'granted': return '已启用'
        case 'denied': return '已拒绝'
        default: return '未设置'
    }
})

const notificationStatusClass = computed(() => {
    if (!('Notification' in window)) return 'status-disabled'
    switch (Notification.permission) {
        case 'granted': return 'status-enabled'
        case 'denied': return 'status-disabled'
        default: return 'status-pending'
    }
})

const activeRemindersCount = computed(() => {
    return reminderService.getActiveReminders().length
})

// 触发文件选择
const triggerFileInput = () => {
    fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/json') {
        selectedFile.value = file
    } else {
        alert('请选择有效的JSON文件')
        selectedFile.value = null
    }
}

// 处理导出
const handleExport = () => {
    emit('export-data')
    closeModal()
}

// 处理导入
const handleImport = () => {
    if (selectedFile.value) {
        emit('import-data', selectedFile.value)
        selectedFile.value = null
        if (fileInput.value) {
            fileInput.value.value = ''
        }
    }
}

// 处理清除数据
const handleClearData = () => {
    if (confirm('⚠️ 确定要清除所有数据吗？此操作不可撤销！所有事件和设置都将被删除。')) {
        emit('clear-data')
    }
}

// 请求通知权限
const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission()
        console.log('通知权限请求结果:', permission)
    } catch (error) {
        console.error('请求通知权限失败:', error)
    }
}

// 关闭模态框
const closeModal = () => {
    selectedFile.value = null
    if (fileInput.value) {
        fileInput.value.value = ''
    }
    emit('update:show', false)
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
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.data-management-content {
    padding: 24px;
}

.management-section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f0f0f0;
}

.management-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.management-section h4 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
}

.section-description {
    margin: 0 0 16px 0;
    color: #666;
    font-size: 14px;
    line-height: 1.4;
}

.warning-text {
    color: #dc3545;
}

.btn {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-1px);
}

.btn-secondary {
    background: #95a5a6;
    color: white;
}

.btn-secondary:hover {
    background: #7f8c8d;
}

.btn-danger {
    background: #e74c3c;
    color: white;
}

.btn-danger:hover {
    background: #c0392b;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.btn-sm {
    padding: 8px 16px;
    font-size: 12px;
}

.export-btn,
.import-btn {
    width: 100%;
    justify-content: center;
}

.import-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.file-input {
    display: none;
}

.selected-file {
    background: #e8f4fd;
    border: 1px solid #b6e0fe;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 12px;
    color: #2c3e50;
}

.danger-section {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 8px;
    padding: 20px;
    margin: 24px -24px;
}

.notification-status {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
}

.status-label {
    color: #666;
    font-size: 14px;
}

.status-value {
    font-size: 14px;
    font-weight: 500;
}

.status-enabled {
    color: #28a745;
}

.status-disabled {
    color: #dc3545;
}

.status-pending {
    color: #ffc107;
}

/* 响应式设计 */
@media (max-width: 600px) {
    .modal-content {
        margin: 10px;
        max-width: calc(100% - 20px);
    }

    .data-management-content {
        padding: 20px;
    }

    .danger-section {
        margin: 20px -20px;
        padding: 16px;
    }
}
</style>