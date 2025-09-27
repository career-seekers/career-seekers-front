<template>
  <div
    v-if="user !== null"
    class="dashboard-home"
  >
    <div class="page-header">
      <h1 class="page-title">
        Добро пожаловать, {{ user.firstName }}!
      </h1>
      <p class="page-subtitle">
        Управляйте участием вашего ребенка в чемпионате
      </p>
    </div>

    <div class="dashboard-grid">
      <!-- Персональные данные -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user" />
            Персональные данные
          </h3>
        </div>
        <div class="card-content">
          <div class="data-section">
            <h4 class="section-title">
              Родитель
            </h4>
            <div class="data-item">
              <span class="data-label">ФИО:</span>
              <span class="data-value">
                {{ `${user.lastName} ${user.firstName} ${user.patronymic}` }}
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ user.mobileNumber }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ user.email }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Статус:</span>
              <span class="data-value">{{ user.verified ? 'Подтверждён' : 'Не подтверждён' }}</span>
            </div>
          </div>

<!--          <div class="data-section">-->
<!--            <h4 class="section-title">-->
<!--              Ребенок-->
<!--            </h4>-->
<!--            <div class="data-item">-->
<!--              <span class="data-label">ФИО:</span>-->
<!--              <span class="data-value">{{ childData.fullName }}</span>-->
<!--            </div>-->
<!--            <div class="data-item">-->
<!--              <span class="data-label">Дата рождения:</span>-->
<!--              <span class="data-value">{{ childData.birthDate }}</span>-->
<!--            </div>-->
<!--            <div class="data-item">-->
<!--              <span class="data-label">Класс:</span>-->
<!--              <span class="data-value">{{ childData.grade }}</span>-->
<!--            </div>-->
<!--          </div>-->
        </div>
      </div>

      <!-- Выбор компетенций -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-list" />
            Компетенции
          </h3>
        </div>
        <div class="card-content">
          <div
            v-if="!hasSelectedCompetencies"
            class="empty-state"
          >
            <i class="pi pi-exclamation-triangle empty-icon" />
            <p class="empty-text">
              Вы еще не выбрали компетенции
            </p>
            <Button
              label="Выбрать компетенции"
              icon="pi pi-plus"
              class="p-button-primary"
              @click="goToCompetencies"
            />
          </div>
          <div
            v-else
            class="competencies-preview"
          >
            <p class="preview-text">
              Выбрано компетенций: {{ selectedCompetenciesCount }}/3
            </p>

            <div class="selected-competencies">
              <div
                v-for="competence in selectedCompetencies"
                :key="competence.id"
                class="competence-item"
              >
                <div class="competence-icon">
                  <i :class="competence.icon" />
                </div>
                <div class="competence-info">
                  <h4 class="competence-name">
                    {{ competence.name }}
                  </h4>
                  <p class="competence-status">
                    {{ competence.status }}
                  </p>
                </div>
              </div>
            </div>

            <div class="competencies-actions">
              <Button
                label="Мои компетенции"
                icon="pi pi-star"
                class="p-button-outlined"
                @click="goToMyCompetencies"
              />
              <Button
                label="Изменить"
                icon="pi pi-pencil"
                class="p-button-text"
                @click="goToCompetencies"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import { useUserStore } from '@/stores/userStore.ts';

export default {
  name: "ParentDashboardHome",
  components: {
    Button,
  },
  data() {
    return {
      userStore: useUserStore()
    };
  },
  computed: {
    user() {
      return this.userStore.user
    },
  },
  async beforeMount() {

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

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6c757d;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.empty-subtitle {
  color: #adb5bd;
  margin: 0;
}

.competencies-preview {
  text-align: center;
}

.preview-text {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.mentor-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.mentor-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.mentor-details {
  flex: 1;
}

.mentor-name {
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.mentor-contact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.contact-item i {
  margin-right: 0.5rem;
  color: #ff9800;
  width: 16px;
}

/* Стили для выбранных компетенций */
.selected-competencies {
  margin: 1rem 0;
}

.competence-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border-left: 3px solid #ff9800;
}

.competence-item:last-child {
  margin-bottom: 0;
}

.competence-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.competence-info {
  flex: 1;
}

.competence-name {
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.competence-status {
  color: #6c757d;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
}

.competencies-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
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

  .mentor-info {
    flex-direction: column;
    text-align: center;
  }

  .competencies-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .competence-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
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

  .mentor-avatar {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }

  .mentor-name {
    font-size: 0.95rem;
  }

  .contact-item {
    font-size: 0.8rem;
  }

  .competence-item {
    padding: 0.5rem;
  }

  .competence-icon {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }

  .competence-name {
    font-size: 0.85rem;
  }

  .competence-status {
    font-size: 0.75rem;
  }

  .empty-state {
    padding: 1rem 0.25rem;
  }

  .empty-icon {
    font-size: 2rem;
  }

  .empty-text {
    font-size: 0.9rem;
  }

  .empty-subtitle {
    font-size: 0.8rem;
  }
}
</style>
