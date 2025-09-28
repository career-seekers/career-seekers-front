<script setup lang="ts">
import Button from "primevue/button";
import { computed, ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  content: {
    title: string;
    message: string;
  };
}>();

const propCopy = computed(() => ({ ...props.content }));
const showToast = ref(true);
const isClosing = ref(false);
const progressWidth = ref(100);
let progressInterval: NodeJS.Timeout | null = null;
let closeTimeout: NodeJS.Timeout | null = null;

const closeToast = () => {
  isClosing.value = true;
  clearProgress();
  // Даем время для анимации fade out
  setTimeout(() => {
    showToast.value = false;
  }, 300);
};

const startProgress = () => {
  progressWidth.value = 100;
  isClosing.value = false;
  
  // Очищаем предыдущие таймеры
  if (progressInterval) clearInterval(progressInterval);
  if (closeTimeout) clearTimeout(closeTimeout);
  
  // Запускаем анимацию прогресса
  progressInterval = setInterval(() => {
    progressWidth.value -= 2; // 100% / 50 интервалов = 2% за интервал
  }, 100); // Обновляем каждые 100мс, итого 5 секунд
  
  // Закрытие через 5 секунд
  closeTimeout = setTimeout(() => {
    closeToast();
  }, 5000);
};

const clearProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
};

watch(
  () => propCopy.value,
  () => {
    showToast.value = true;
    startProgress();
  },
);

onMounted(() => {
  if (showToast.value) {
    startProgress();
  }
});

onUnmounted(() => {
  clearProgress();
});
</script>

<template>
  <div
    v-if="
      showToast &&
        content &&
        content.title &&
        content.message &&
        content.title !== '' &&
        content.message !== ''
    "
    class="toast"
    :class="{ 'toast-closing': isClosing }"
  >
    <div class="toast-content">
      <div class="toast-icon">
        <i class="pi pi-info-circle" />
      </div>
      <div class="toast-text">
        <h4 class="toast-title">
          {{ content.title }}
        </h4>
        <p class="toast-message">
          {{ content.message }}
        </p>
      </div>
      <Button
        class="toast-close"
        @click="closeToast"
      >
        <i class="pi pi-times" />
      </Button>
    </div>
    <div class="toast-progress">
      <div 
        class="toast-progress-bar"
        :style="{ width: progressWidth + '%' }"
      />
    </div>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  max-width: 400px;
  animation: slideInRight 0.3s ease-out;
  transition: all 0.3s ease-out;
}

.toast-closing {
  animation: fadeOut 0.3s ease-out forwards;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 8px 8px 0 0;
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

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
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

.toast-progress {
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff9800, #f57c00);
  transition: width 0.1s linear;
  border-radius: 0 0 8px 8px;
}
</style>
