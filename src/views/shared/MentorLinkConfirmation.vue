<template>
  <div class="confirmation-page">
    <div class="confirmation-container">
      <div
        v-if="isLoading"
        class="loading-container"
      >
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner" />
        </div>
        <p class="loading-text">
          Загрузка...
        </p>
      </div>
      
      <div v-else>
        <div class="success-icon">
          <i class="pi pi-check-circle" />
        </div>
        
        <h1 class="confirmation-title">
          Готово!
        </h1>
        
        <p class="confirmation-message">
          Теперь вы можете указать <strong>{{ mentorName }}</strong> в качестве наставника для своего ребенка.
        </p>
      
        <div class="mentor-info-card">
          <div class="mentor-avatar">
            <i class="pi pi-user" />
          </div>
          <div class="mentor-details">
            <h3 class="mentor-name">
              {{ mentorName }}
            </h3>
          </div>
        </div>
      
        <div class="action-buttons">
          <Button
            label="Вернуться в личный кабинет"
            icon="pi pi-home"
            class="p-button-primary w-full"
            @click="confirmMentorLink"
          />
          <Button
            label="Отменить привязку"
            icon="pi pi-times"
            class="p-button-outlined w-full"
            @click="$router.push(`/${userStore.user?.role.toLowerCase()}/dashboard`)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import { useUserStore } from '@/stores/userStore.ts';
import { Roles } from '@/state/UserState.types.ts';
import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
import { MentorLinksResolver } from '@/api/resolvers/mentorLinks/mentor-links.resolver.ts';

export default {
  name: "MentorLinkConfirmation",
  components: {
    Button,
  },
  data() {
    return {
      userStore: useUserStore(),
      userResolver: new UserResolver(),
      mentorLinksResolver: new MentorLinksResolver(),
      mentorId: null as number | null,
      mentorName: "",
      isLoading: true,
    };
  },
  async mounted() {
    await this.checkAuthAndRole();
  },
  methods: {
    async checkAuthAndRole() {
      if (this.userStore.user !== null) {
        if (this.userStore.user?.role === Roles.USER) {
          console.log('User is parent, loading mentor data...');
          await this.loadMentorData();
        } else {
          console.log('User is not parent, redirecting to dashboard...');
          this.redirectToUserDashboard();
        }
      } else {
        this.redirectToLogin();
      }
    },
    
    async loadMentorData() {
      // Получаем biscuit из URL
      const biscuit = this.$route.params.id as string;
      console.log('Biscuit from URL:', biscuit);
      if (biscuit) {
        try {
          // Получаем данные наставника по biscuit
          await this.loadMentorInfoByBiscuit(biscuit);
        } catch (error) {
          console.error('Ошибка при получении данных наставника:', error);
          this.$router.push('/login');
        }
      } else {
        console.log('No biscuit found, redirecting to login');
        this.$router.push('/login');
      }
    },
    
    async loadMentorInfoByBiscuit(biscuit: string) {
      try {
        console.log('Loading mentor info by biscuit:', biscuit);
        
        // Получаем данные наставника по biscuit
        const response = await this.mentorLinksResolver.getByBiscuit(biscuit);
        
        console.log('API Response:', response);
        console.log('Response status:', response.status);
        console.log('Response message:', response.message);
        
        if (response.status === 200) {
          const mentorLink = response.message;
          
          console.log('Full mentor data from API:', mentorLink);
          
          // Сохраняем ID наставника
          this.mentorId = mentorLink.user.id;
          
          // Формируем полное имя наставника
          this.mentorName = `${mentorLink.user.lastName} ${mentorLink.user.firstName} ${mentorLink.user.patronymic}`;
          
          console.log('Final mentor info:', {
            id: this.mentorId,
            name: this.mentorName
          });
          
          // Наставник найден, переходим к подтверждению
          console.log('Mentor found, proceeding to confirmation');
          
        } else {
          console.log('API failed or returned string, redirecting to login');
          this.$router.push('/login');
          return;
        }
        
      } catch (error) {
        console.error('Error loading mentor info by biscuit:', error);
        this.$router.push('/login');
        return;
      }
      
      this.isLoading = false;
      console.log('Mentor info loaded, isLoading set to false');
    },
    
    redirectToLogin() {
      // Сохраняем текущую ссылку для возврата после авторизации
      const currentPath = this.$route.fullPath;
      console.log('Saving return path:', currentPath);
      localStorage.setItem('returnAfterLogin', currentPath);
      console.log('Saved to localStorage:', localStorage.getItem('returnAfterLogin'));
      
      // Редиректим на страницу авторизации
      this.$router.push('/login');
    },
    
    redirectToUserDashboard() {
      // Редиректим на дашборд пользователя в зависимости от его роли
      if (this.userStore.user) {
        const role = this.userStore.user.role.toLowerCase();
        this.$router.push(`/${role}/dashboard`);
      } else {
        this.$router.push('/login');
      }
    },
    async confirmMentorLink() {
      if (this.mentorId && this.userStore.user) {
        try {
          const strMentorIds = localStorage.getItem("mentorIds")
          const mentorIds = (strMentorIds as string | null) !== null
            ? JSON.parse(strMentorIds as string) as number[]
            : []
          localStorage.setItem('mentorIds', JSON.stringify([...mentorIds, this.mentorId]));
          this.$router.push('/user/dashboard');
        } catch (error) {
          console.error('Ошибка при подтверждении связи с наставником:', error);
          alert('Не удалось установить связь с наставником');
        }
      }
    },
  }
};
</script>

<style scoped>
.confirmation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.confirmation-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
  max-width: 600px;
  width: 100%;
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4caf50, #45a049);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem auto;
  animation: bounceIn 0.8s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.success-icon i {
  font-size: 2.5rem;
  color: white;
}

.confirmation-title {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  font-family: "BIPS", sans-serif;
}

.confirmation-message {
  color: #6c757d;
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.mentor-info-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid #ff9800;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  text-align: left;
}

.mentor-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mentor-avatar i {
  font-size: 1.5rem;
  color: white;
}

.mentor-details {
  flex: 1;
}

.mentor-name {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}


.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .confirmation-page {
    padding: 1rem;
  }

  .confirmation-container {
    padding: 2rem;
  }

  .confirmation-title {
    font-size: 2rem;
  }

  .confirmation-message {
    font-size: 1.1rem;
  }

  .mentor-info-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .confirmation-container {
    padding: 1.5rem;
  }

  .confirmation-title {
    font-size: 1.8rem;
  }

  .confirmation-message {
    font-size: 1rem;
  }

  .success-icon {
    width: 60px;
    height: 60px;
  }

  .success-icon i {
    font-size: 2rem;
  }

  .mentor-avatar {
    width: 50px;
    height: 50px;
  }

  .mentor-avatar i {
    font-size: 1.2rem;
  }

  .mentor-name {
    font-size: 1.1rem;
  }
}

/* Стили для загрузки */
.loading-container {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-spinner i {
  font-size: 1.5rem;
  color: white;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.loading-text {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
}
</style>
