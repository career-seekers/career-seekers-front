<script setup lang="ts">

import Button from "primevue/button";
import {computed, ref, watch} from "vue";

const props = defineProps<{
  content: {
    title: string;
    message: string;
  }
}>()

const propCopy = computed(() => ({...props.content}))
const showToast = ref(true)
const closeToast = () => showToast.value = false

watch(() => propCopy.value, () => showToast.value = true )
</script>

<template>
  <div v-if="
      showToast && content && content.title && content.message &&
      content.title !== '' && content.message !== ''
    " class="toast">
    <div class="toast-content">
      <div class="toast-icon">
        <i class="pi pi-info-circle"></i>
      </div>
      <div class="toast-text">
        <h4 class="toast-title">{{ content.title }}</h4>
        <p class="toast-message">{{ content.message }}</p>
      </div>
      <button class="toast-close" @click="closeToast">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 2000;
  max-width: 400px;
  animation: slideInRight 0.3s ease-out;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #ff9800;
}

.toast-icon {
  color: #ff9800;
  font-size: 1.2rem;
  margin-top: 0.1rem;
}

.toast-text {
  flex: 1;
}

.toast-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.toast-message {
  margin: 0;
  font-size: 0.8rem;
  color: #6c757d;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-top: -0.25rem;
}

.toast-close:hover {
  background: #f8f9fa;
  color: #ff9800;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media screen and (max-width: 768px) {
  .toast {
    top: 0.75rem;
    right: 0.75rem;
    max-width: calc(100vw - 1.5rem);
  }

  .toast-content {
    padding: 0.75rem;
  }

  .toast-title {
    font-size: 0.85rem;
  }

  .toast-message {
    font-size: 0.75rem;
  }
}

@media screen and (max-width: 480px) {
  .toast {
    top: 0.5rem;
    right: 0.5rem;
    max-width: calc(100vw - 1rem);
  }

  .toast-content {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .toast-title {
    font-size: 0.8rem;
  }

  .toast-message {
    font-size: 0.7rem;
  }
}
</style>