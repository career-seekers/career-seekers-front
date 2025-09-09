<template>
  <div class="dashboard-container">
    <!-- Мобильная кнопка меню -->
    <div class="mobile-menu-toggle" @click="toggleSidebar" v-if="isMobile">
      <i class="pi pi-bars"></i>
    </div>

    <!-- Сайдбар -->
    <div class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <img src="@/assets/logo.png" alt="Logo" class="sidebar-logo" />
        <h2 class="sidebar-title">Личный кабинет куратора</h2>
        <button class="sidebar-close" @click="toggleSidebar" v-if="isMobile">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/tutor/dashboard" class="nav-link" :class="{ active: $route.path === '/tutor/dashboard' }" @click="closeSidebarOnMobile">
              <i class="pi pi-home"></i>
              <span>Главная</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tutor/experts" class="nav-link" :class="{ active: $route.path === '/tutor/experts' }" @click="closeSidebarOnMobile">
              <i class="pi pi-users"></i>
              <span>Главные эксперты</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tutor/competencies" class="nav-link" :class="{ active: $route.path === '/tutor/competencies' }" @click="closeSidebarOnMobile">
              <i class="pi pi-briefcase"></i>
              <span>Компетенции</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tutor/documents" class="nav-link" :class="{ active: $route.path === '/tutor/documents' }" @click="closeSidebarOnMobile">
              <i class="pi pi-file"></i>
              <span>Документы</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tutor/venue-info" class="nav-link" :class="{ active: $route.path === '/tutor/venue-info' }" @click="closeSidebarOnMobile">
              <i class="pi pi-building"></i>
              <span>Информация о площадке</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="sidebar-footer">
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
        <transition name="dashboard-page" mode="out-in" appear>
          <component :is="Component" :key="route.name" />
        </transition>
      </router-view>
      
      <!-- Футер -->
      <footer class="dashboard-footer">
        <p class="footer-text">Академия Технического Творчества и Цифровых Технологий</p>
      </footer>
    </div>
  </div>
</template>

<script>
import Button from 'primevue/button'
import {clearUserState} from "../../../state/UserState";

export default {
  name: 'TutorDashboard',
  components: {
    Button
  },
  data() {
    return {
      sidebarOpen: false,
      isMobile: false
    }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    logout() {
      clearUserState()
      this.$router.push('/login')
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
      if (!this.isMobile) {
        this.sidebarOpen = false
      }
    },
    closeSidebarOnMobile() {
      if (this.isMobile) {
        this.sidebarOpen = false
      }
    }
  }
}
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
  font-family: 'BIPS', sans-serif;
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

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  padding-bottom: 80px;
  min-height: 100vh;
  background-color: white;
  background-image: url('@/assets/bg2.png');
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
    padding-bottom: 70px;
    background-attachment: scroll;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .dashboard-footer {
    left: 0;
    padding: 1rem;
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
    padding-bottom: 60px;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .dashboard-footer {
    padding: 0.75rem;
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
