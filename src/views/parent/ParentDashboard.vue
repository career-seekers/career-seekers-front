<template>
  <div class="dashboard-container">
    <!-- Мобильная кнопка меню -->
    <div
      v-if="isMobile"
      class="mobile-menu-toggle"
      @click="toggleSidebar"
    >
      <i class="pi pi-bars" />
    </div>

    <!-- Сайдбар -->
    <div
      class="sidebar"
      :class="{ 'sidebar-open': sidebarOpen }"
    >
      <div class="sidebar-header">
        <img
          src="@/assets/logo.png"
          alt="Logo"
          class="sidebar-logo"
        >
        <h2 class="sidebar-title">
          Личный кабинет
        </h2>
        <button
          v-if="isMobile"
          class="sidebar-close"
          @click="toggleSidebar"
        >
          <i class="pi pi-times" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link
              to="/parent/dashboard"
              class="nav-link"
              :class="{ active: $route.path === '/parent/dashboard' }"
              @click="closeSidebarOnMobile"
            >
              <i class="pi pi-home" />
              <span>Главная</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/parent/competencies"
              class="nav-link"
              :class="{ active: $route.path === '/parent/competencies' }"
              @click="closeSidebarOnMobile"
            >
              <i class="pi pi-list" />
              <span>Выбор компетенций</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/parent/my-competencies"
              class="nav-link"
              :class="{ active: $route.path === '/parent/my-competencies' }"
              @click="closeSidebarOnMobile"
            >
              <i class="pi pi-star" />
              <span>Мои компетенции</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/parent/achievements"
              class="nav-link"
              :class="{ active: $route.path === '/parent/achievements' }"
              @click="closeSidebarOnMobile"
            >
              <i class="pi pi-trophy" />
              <span>Мои достижения</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <!-- Ссылка-приглашение -->
        <div
          v-if="showInviteLink"
          class="invite-section"
        >
          <div class="invite-header">
            <h4 class="invite-title">
              Пригласить участника
            </h4>
            <button
              class="invite-toggle"
              @click="toggleInviteLink"
            >
              <i class="pi pi-times" />
            </button>
          </div>
          <div class="invite-content">
            <p class="invite-text">
              Поделитесь ссылкой для регистрации:
            </p>
            <div class="invite-link-container">
              <input
                ref="inviteLinkInput"
                type="text"
                :value="inviteLink"
                readonly
                class="invite-link-input"
              >
              <Button
                v-tooltip="'Скопировать ссылку'"
                icon="pi pi-copy"
                class="p-button-sm p-button-outlined"
                @click="copyInviteLink"
              />
            </div>
          </div>
        </div>

        <!-- Кнопка показа ссылки-приглашения -->
        <div
          v-else
          class="invite-toggle-section"
        >
          <Button
            label="Показать ссылку-приглашение"
            icon="pi pi-share-alt"
            class="p-button-text p-button-sm"
            @click="toggleInviteLink"
          />
        </div>

        <Button
          label="Выйти"
          icon="pi pi-sign-out"
          class="p-button-text p-button-danger"
          @click="logout"
        />
      </div>
    </div>

    <!-- Основной контент -->
    <div class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition
          name="dashboard-page"
          mode="out-in"
          appear
        >
          <component
            :is="Component"
            :key="route.name"
          />
        </transition>
      </router-view>

      <!-- Футер -->
      <footer class="dashboard-footer">
        <p class="footer-text">
          Региональный чемпионат «Искатели профессий» <b>|</b>
          <a href="https://t.me/career_seekers_help">Техническая поддержка</a>
        </p>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import ToastPopup from "@/components/ToastPopup.vue";

export default {
  name: "ParentDashboard",
  components: {
    ToastPopup,
    Button,
  },
  data() {
    return {
      sidebarOpen: false,
      isMobile: false,
      showInviteLink: false,
      showTestToast: true,
      inviteLink: "https://career-seekers.ru/register?ref=parent123",
    };
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
  methods: {
    async logout() {
      // await clearUserState();
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.sidebarOpen = false;
      }
    },
    closeSidebarOnMobile() {
      if (this.isMobile) {
        this.sidebarOpen = false;
      }
    },
    toggleInviteLink() {
      this.showInviteLink = !this.showInviteLink;
    },
    async copyInviteLink() {
      try {
        await navigator.clipboard.writeText(this.inviteLink);
        // Можно добавить уведомление об успешном копировании
        console.log("Ссылка скопирована в буфер обмена");
      } catch (error) {
        // Fallback для старых браузеров
        this.$refs.inviteLinkInput.select();
        document.execCommand("copy");
        console.log("Ссылка скопирована в буфер обмена (fallback)");
      }
    },
    closeTestToast() {
      this.showTestToast = false;
    },
  },
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: white;
}

.sidebar {
  width: 280px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 1000;
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
}

.sidebar-logo {
  max-width: 80px;
  height: auto;
  margin-bottom: 1rem;
}

.sidebar-title {
  color: #2c3e50;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  font-family: "BIPS", sans-serif;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #6c757d;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #ff9800;
}

.nav-link.active {
  background-color: #fff3e0;
  color: #ff9800;
  border-left-color: #ff9800;
  font-weight: 500;
}

.nav-link i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* Стили для ссылки-приглашения */
.invite-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.invite-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.invite-toggle {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.invite-toggle:hover {
  background: #e9ecef;
  color: #ff9800;
}

.invite-text {
  margin: 0 0 0.75rem 0;
  font-size: 0.8rem;
  color: #6c757d;
}

.invite-link-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.invite-link-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.8rem;
  background: white;
  color: #2c3e50;
}

.invite-toggle-section {
  margin-bottom: 1rem;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  padding-bottom: 80px; /* Резерв для фиксированного футера */
  min-height: 100vh;
  background-color: white;
  background-image: url("@/assets/bg2.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.dashboard-footer {
  position: fixed;
  bottom: 0;
  left: 280px;
  right: 0;
  padding: 1.5rem 2rem;
  text-align: center;
  border-top: 1px solid #e9ecef;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.footer-text {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;

  b {
    margin: 0 1rem;
  }

  a {
    color: darkcyan;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  a:hover {
    color: #ff9800;
  }
}

/* Стили для тестового тоста */
.test-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1001;
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

/* Мобильная кнопка меню */
.mobile-menu-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
  background: #f57c00;
  transform: scale(1.05);
}

/* Кнопка закрытия сайдбара */
.sidebar-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.sidebar-close:hover {
  background: #f8f9fa;
  color: #ff9800;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    background: white !important;
  }

  .sidebar.sidebar-open {
    left: 0;
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 4rem;
    padding-bottom: 70px; /* Резерв для фиксированного футера */
    background-attachment: scroll;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .dashboard-footer {
    left: 0;
    padding: 1rem;
  }

  .footer-text {
    font-size: 0.8rem;
  }

  .sidebar-header {
    padding: 1rem;
    position: relative;
  }

  .sidebar-logo {
    max-width: 60px;
  }

  .sidebar-title {
    font-size: 1.1rem;
  }

  .nav-link {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .nav-link i {
    font-size: 1rem;
  }

  .sidebar-footer {
    padding: 1rem;
  }

  .invite-section {
    padding: 0.75rem;
  }

  .invite-title {
    font-size: 0.85rem;
  }

  .invite-text {
    font-size: 0.75rem;
  }

  .invite-link-input {
    font-size: 0.75rem;
    padding: 0.4rem;
  }

  .test-toast {
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

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .mobile-menu-toggle {
    top: 0.75rem;
    left: 0.75rem;
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }

  .sidebar {
    width: 100%;
    left: -100%;
    background: white !important;
  }

  .main-content {
    padding: 0.75rem;
    padding-top: 3.5rem;
    padding-bottom: 60px; /* Резерв для фиксированного футера */
    max-width: 100vw;
    overflow-x: hidden;
  }

  .dashboard-footer {
    padding: 0.75rem;
  }

  .footer-text {
    font-size: 0.75rem;
  }

  .sidebar-header {
    padding: 0.75rem;
  }

  .sidebar-logo {
    max-width: 50px;
  }

  .sidebar-title {
    font-size: 1rem;
  }

  .nav-link {
    padding: 0.65rem 0.75rem;
    font-size: 0.85rem;
  }

  .nav-link i {
    font-size: 0.9rem;
    margin-right: 0.5rem;
  }

  .sidebar-footer {
    padding: 0.75rem;
  }

  .invite-section {
    padding: 0.5rem;
  }

  .invite-title {
    font-size: 0.8rem;
  }

  .invite-text {
    font-size: 0.7rem;
  }

  .invite-link-input {
    font-size: 0.7rem;
    padding: 0.35rem;
  }

  .test-toast {
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

/* Анимации переходов между страницами дашборда */
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
