<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition
          :name="shouldAnimate(route.path) ? 'page' : ''"
          mode="out-in"
      >
        <component
          :is="Component"
          :key="getTopLevelPath(route.path)"
        />
      </transition>
    </router-view>

    <!-- Пасхалка с конфетти из гусей -->
    <GooseConfetti ref="gooseConfetti"/>
  </div>
</template>

<script lang="ts">
import {socketService} from "@/utils/SocketService.ts";
import {statisticsStore} from "@/stores/statisticsStore.ts";
import type {EventServiceStatistics} from "@/api/dto/statistics/EventServiceStatistics.ts";

import apiConf from "@/api/api.conf.ts";
import easterEggMixin from "@/mixins/easterEgg.js";
import GooseConfetti from "@/components/GooseConfetti.vue";
import type {UsersServiceStatistics} from "@/api/dto/statistics/UsersServiceStatistics.ts";

export default {
  name: "App",

  components: {
    GooseConfetti,
  },

  data() {
    return {
      statisticsStore: statisticsStore(),

      eventsServiceSocketConnected: false,
      usersServiceSocketConnected: false,
    }
  },

  mixins: [easterEggMixin],

  beforeMount() {
    socketService.connect(
        'events-service',
        `${apiConf.socketEndpoint}/events-service/websocket`,
        {Authorization: `Bearer ${localStorage.getItem('access_token')}`},
        () => {
          this.eventsServiceSocketConnected = true;

          socketService.subscribe(
              "events-service",
              '/events-service/topic/statistics',
              (msg: any) => {
                this.eventsServiceSocketConnected = true;
                const data: EventServiceStatistics = JSON.parse(msg.body)

                this.statisticsStore.updateEventsServiceStatistics(data)
              }
          );

          this.requestEventsServiceStatistics()
        },
        () => {
          this.eventsServiceSocketConnected = false;
        }
    );

    socketService.connect(
        'users-service',
        `${apiConf.socketEndpoint}/users-service/websocket`,
        {Authorization: `Bearer ${localStorage.getItem('access_token')}`},
        () => {
          this.usersServiceSocketConnected = true;

          socketService.subscribe(
              "users-service",
              '/users-service/topic/statistics',
              (msg: any) => {
                this.usersServiceSocketConnected = true;
                const data: UsersServiceStatistics = JSON.parse(msg.body)

                this.statisticsStore.updateUsersServiceStatistics(data)
              }
          );

          this.requestUsersServiceStatistics()
        },
        () => {
          this.usersServiceSocketConnected = false;
        }
    );
  },

  mounted() {
    window.addEventListener(
        "trigger-goose-confetti",
        this.triggerGooseConfetti,
    );
  },

  beforeUnmount() {
    socketService.disconnect("events-service");
    socketService.disconnect("users-service");

    window.removeEventListener(
        "trigger-goose-confetti",
        this.triggerGooseConfetti,
    );
  },

  methods: {
    getTopLevelPath(path: string) {
      const segments = path.split('/').filter(Boolean);
      const res = segments[0] || 'root';
      return res
    },
    shouldAnimate(path: string) {
      return (
          !path.startsWith("/admin") &&
          !path.startsWith("/expert") &&
          !path.startsWith("/user") &&
          !path.startsWith("/mentor") &&
          !path.startsWith("/tutor")
      );
    },

    triggerGooseConfetti() {
      if (this.$refs.gooseConfetti) {
        this.$refs.gooseConfetti.triggerConfetti();
      }
    },

    requestEventsServiceStatistics() {
      if (this.eventsServiceSocketConnected) {
        socketService.send(
            'events-service',
            '/events-service/app/getStatistics',
            {}
        );
      }
    },

    requestUsersServiceStatistics() {
      if (this.usersServiceSocketConnected) {
        socketService.send(
            'users-service',
            '/users-service/app/getStatistics',
            {}
        )
      }
    }
  },
};
</script>

<style>
#app {
  font-family: "Inter",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background-image: url("@/assets/bg1.png");
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
