<!-- src/App.vue -->
<template>
  <div id="app">
    <HomeView />
  </div>
</template>

<script setup>
import HomeView from './views/HomeView.vue'
</script>

<style>
/* 全局基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #24292f;
  background-color: #ffffff;
  overflow: hidden;
  /* 防止整个页面滚动 */
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 按钮基础样式 */
button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  outline: none;
}

button:focus-visible {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

/* 输入框基础样式 */
input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
  outline: none;
}

input:focus,
textarea:focus,
select:focus {
  outline: 2px solid #2196f3;
  outline-offset: 1px;
}

/* 禁用文本选择 */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 动画工具类 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-10px);
}
</style>