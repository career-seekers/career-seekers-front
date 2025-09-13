<template>
  <div class="dashboard-home">
    <div class="page-header">
      <h1 class="page-title">
        Добро пожаловать, {{ MentorName }}!
      </h1>
      <p class="page-subtitle">
        Управляйте участниками и отслеживайте их прогресс
      </p>
    </div>

    <div class="dashboard-grid">
      <!-- Информация о наставнике -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user" />
            Информация о наставнике
          </h3>
        </div>
        <div class="card-content">
          <div class="data-section">
            <h4 class="section-title">
              Персональные данные
            </h4>
            <div class="data-item">
              <span class="data-label">ФИО:</span>
              <span class="data-value">{{ MentorData.fullName }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ MentorData.email }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ MentorData.phone }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Telegram:</span>
              <span class="data-value">{{ MentorData.telegram }}</span>
            </div>
          </div>

          <div class="data-section">
            <h4 class="section-title">
              Профессиональная информация
            </h4>
            <div class="data-item">
              <span class="data-label">Специализация:</span>
              <span class="data-value">{{ MentorData.specialization }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Опыт работы:</span>
              <span class="data-value">{{ MentorData.experience }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Статус:</span>
              <span class="data-value">{{ MentorData.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика участников -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-users" />
            Статистика участников
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">
                {{ participantsStats.total }}
              </div>
              <div class="stat-label">
                Всего участников
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ participantsStats.active }}
              </div>
              <div class="stat-label">
                Активных
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ participantsStats.competencies }}
              </div>
              <div class="stat-label">
                Компетенций
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ participantsStats.stage2 }}
              </div>
              <div class="stat-label">
                Прошли во 2 этап
              </div>
            </div>
          </div>

          <div class="stats-actions">
            <Button
              label="Управление участниками"
              icon="pi pi-cog"
              class="p-button-outlined"
              @click="goToParticipants"
            />
          </div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-bolt" />
            Быстрые действия
          </h3>
        </div>
        <div class="card-content">
          <div class="quick-actions">
            <Button
              label="Добавить участника"
              icon="pi pi-user-plus"
              class="p-button-primary"
              @click="addParticipant"
            />
            <Button
              label="Изменить состав"
              icon="pi pi-pencil"
              class="p-button-outlined"
              @click="editParticipants"
            />
            <Button
              label="Связаться с родителями"
              icon="pi pi-envelope"
              class="p-button-outlined"
              @click="contactParents"
            />
            <Button
              label="Просмотреть сертификаты"
              icon="pi pi-certificate"
              class="p-button-outlined"
              @click="viewCertificates"
            />
          </div>
        </div>
      </div>

      <!-- Последние обновления -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-clock" />
            Последние обновления
          </h3>
        </div>
        <div class="card-content">
          <div class="updates-list">
            <div
              v-for="update in recentUpdates"
              :key="update.id"
              class="update-item"
            >
              <div class="update-icon">
                <i :class="update.icon" />
              </div>
              <div class="update-content">
                <div class="update-text">
                  {{ update.text }}
                </div>
                <div class="update-time">
                  {{ update.time }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";

export default {
  name: "MentorDashboardHome",
  components: {
    Button,
  },
  data() {
    return {
      MentorData: {
        fullName: "Смирнов Алексей Владимирович",
        email: "a.smirnov@mentor.ru",
        phone: "+7 (999) 987-65-43",
        telegram: "@alex_mentor",
        specialization: "Веб-разработка и дизайн",
        experience: "5 лет",
        status: "Активный наставник",
      },
      participantsStats: {
        total: 8,
        active: 6,
        competencies: 12,
        stage2: 3,
      },
      recentUpdates: [
        {
          id: 1,
          icon: "pi pi-user-plus",
          text: "Добавлен новый участник: Иванов Петр",
          time: "2 часа назад",
        },
        {
          id: 2,
          icon: "pi pi-trophy",
          text: "Петров Анна прошла во второй этап",
          time: "1 день назад",
        },
        {
          id: 3,
          icon: "pi pi-envelope",
          text: "Получено сообщение от родителя",
          time: "2 дня назад",
        },
        {
          id: 4,
          icon: "pi pi-certificate",
          text: "Выдан сертификат участнику",
          time: "3 дня назад",
        },
      ],
    };
  },
  computed: {
    MentorName() {
      return this.MentorData.fullName.split(" ")[1] || "Наставник";
    },
  },
  methods: {
    goToParticipants() {
      this.$router.push("/mentor/participants");
    },
    addParticipant() {
      // Логика добавления участника
      console.log("Добавление участника");
    },
    editParticipants() {
      // Логика изменения состава
      console.log("Изменение состава участников");
    },
    contactParents() {
      // Логика связи с родителями
      console.log("Связь с родителями");
    },
    viewCertificates() {
      this.$router.push("/mentor/my-certificates");
    },
  },
};
</script>

<style scoped>
.dashboard-home {
  max-width: 1200px;
  margin: 0 auto;
  animation: slideInRight 0.4s ease-out;
  width: 100%;
  box-sizing: border-box;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.info-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.card-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.card-content {
  padding: 1.5rem;
}

.data-section {
  margin-bottom: 1.5rem;
}

.data-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.data-item:last-child {
  border-bottom: none;
}

.data-label {
  color: #6c757d;
  font-weight: 500;
  min-width: 120px;
}

.data-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.stats-actions {
  text-align: center;
}

/* Быстрые действия */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Обновления */
.updates-list {
  max-height: 300px;
  overflow-y: auto;
}

.update-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.update-item:last-child {
  border-bottom: none;
}

.update-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.update-content {
  flex: 1;
}

.update-text {
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.update-time {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .dashboard-home {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .info-card {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0;
  }

  .card-header {
    padding: 1rem;
  }

  .card-content {
    padding: 1rem;
  }

  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .data-value {
    text-align: left;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .quick-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .update-item {
    padding: 0.5rem 0;
  }

  .update-icon {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .dashboard-home {
    padding: 0 0.5rem;
    max-width: 100%;
    width: 100%;
  }

  .dashboard-grid {
    gap: 0.75rem;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .info-card {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
    margin: 0;
  }

  .card-header {
    padding: 0.75rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-content {
    padding: 0.75rem;
  }

  .data-item {
    padding: 0.5rem 0;
  }

  .data-label {
    font-size: 0.85rem;
  }

  .data-value {
    font-size: 0.9rem;
  }

  .stats-grid {
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0.75rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .quick-actions {
    flex-direction: column;
    gap: 0.4rem;
  }

  .update-item {
    padding: 0.4rem 0;
  }

  .update-icon {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }

  .update-text {
    font-size: 0.8rem;
  }

  .update-time {
    font-size: 0.7rem;
  }
}
</style>
