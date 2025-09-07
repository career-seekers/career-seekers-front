<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition 
        :name="shouldAnimate(route.path) ? 'page' : ''" 
        mode="out-in"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    
    <!-- Пасхалка с конфетти из гусей -->
    <GooseConfetti ref="gooseConfetti" />
  </div>
</template>

<script>
import GooseConfetti from '@/components/GooseConfetti.vue'
import easterEggMixin from '@/mixins/easterEgg.js'

export default {
  name: 'App',
  components: {
    GooseConfetti
  },
  mixins: [easterEggMixin],
  mounted() {
    // Слушаем событие для запуска конфетти через глобальный event bus
    window.addEventListener('trigger-goose-confetti', this.triggerGooseConfetti)
    // console.log('Easter egg listener mounted')
  },
  beforeUnmount() {
    window.removeEventListener('trigger-goose-confetti', this.triggerGooseConfetti)
  },
  methods: {
    shouldAnimate(path) {
      // Анимируем только страницы входа/регистрации, не дашборд
      return !path.startsWith('/parent') && 
             !path.startsWith('/mentor') &&
             !path.startsWith('/tutor')
    },
    triggerGooseConfetti() {
      // console.log('App received trigger event')
      if (this.$refs.gooseConfetti) {
        this.$refs.gooseConfetti.triggerConfetti()
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background-image: url('@/assets/bg1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

body {
  margin: 0;
  padding: 0;
}

/* Анимации переходов между страницами */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* Глобальные стили для PrimeVue overlay компонентов */
:deep(.p-overlaypanel) {
  z-index: 1000 !important;
}

:deep(.p-dropdown-panel) {
  z-index: 1000 !important;
}

:deep(.p-password-panel) {
  z-index: 1000 !important;
}

:deep(.p-calendar-panel) {
  z-index: 1000 !important;
}

/* Адаптивные стили для модальных окон */
@media (max-width: 768px) {
  :deep(.p-dialog) {
    width: 90vw !important;
    max-width: 500px !important;
    margin: 1rem !important;
  }
  
  :deep(.p-dialog-content) {
    padding: 1rem !important;
  }
  
  :deep(.p-dialog-header) {
    padding: 1rem !important;
  }
  
  :deep(.p-dialog-title) {
    font-size: 1.1rem !important;
  }
}

@media (max-width: 480px) {
  :deep(.p-dialog) {
    width: 95vw !important;
    max-width: none !important;
    margin: 0.5rem !important;
  }
  
  :deep(.p-dialog-content) {
    padding: 0.75rem !important;
  }
  
  :deep(.p-dialog-header) {
    padding: 0.75rem !important;
  }
  
  :deep(.p-dialog-title) {
    font-size: 1rem !important;
  }
}

/* Анимации для дашборда */
.dashboard-page-enter-active {
  transition: all 0.4s ease-out;
}

.dashboard-page-leave-active {
  transition: all 0.3s ease-in;
}

.dashboard-page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.dashboard-page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.dashboard-page-enter-to,
.dashboard-page-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
