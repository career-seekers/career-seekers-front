<template>
  <div class="achievements">
    <div class="page-header">
      <h1 class="page-title">Мои достижения</h1>
      <p class="page-subtitle">Достижения вашего ребенка в чемпионате</p>
    </div>

    <div class="coming-soon">
      <div class="coming-soon-content">
        <i class="pi pi-trophy coming-soon-icon"></i>
        <h2 class="coming-soon-title">Раздел в разработке</h2>
        <p class="coming-soon-text">
          Здесь будут отображаться все достижения вашего ребенка: сертификаты,
          дипломы, награды и результаты участия в чемпионате.
        </p>
        <div class="coming-soon-features">
          <div class="feature-item">
            <i class="pi pi-certificate"></i>
            <span>Сертификаты участника</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-award"></i>
            <span>Дипломы и награды</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-chart-line"></i>
            <span>Статистика участия</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-download"></i>
            <span>Скачивание документов</span>
          </div>
        </div>
        <Button
          label="Вернуться на главную"
          icon="pi pi-home"
          class="p-button-primary"
          @click="goHome"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Button from "primevue/button";

export default {
  name: "ParentAchievements",
  components: {
    Button,
  },
  methods: {
    goHome() {
      this.$router.push("/parent/dashboard");
    },
  },
};
</script>

<style scoped>
.achievements {
  max-width: 1200px;
  margin: 0 auto;
  animation: slideInRight 0.4s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
  font-family: "BIPS", sans-serif;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.coming-soon {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.coming-soon-content {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
}

.coming-soon-icon {
  font-size: 5rem;
  color: #ff9800;
  margin-bottom: 2rem;
}

.coming-soon-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.coming-soon-text {
  color: #6c757d;
  margin: 0 0 2rem 0;
  font-size: 1.1rem;
  line-height: 1.6;
}

.coming-soon-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  color: #495057;
  font-weight: 500;
}

.feature-item i {
  font-size: 1.5rem;
  color: #ff9800;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .coming-soon-title {
    font-size: 1.5rem;
  }

  .coming-soon-features {
    grid-template-columns: 1fr;
  }
}
</style>
