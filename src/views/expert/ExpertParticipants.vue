<template>
  <div class="participants-page">
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/expert/competencies" class="breadcrumb-link">
            <i class="pi pi-briefcase"></i>
            Компетенции
          </router-link>
          <i class="pi pi-chevron-right breadcrumb-separator"></i>
          <span class="breadcrumb-current">{{ competenceName }}</span>
        </div>
        <h1 class="page-title">Участники компетенции</h1>
        <p class="page-subtitle">{{ competenceDescription }}</p>
      </div>
    </div>

    <!-- Статистика -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ participantsStats.total }}</div>
            <div class="stat-label">Всего участников</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ participantsStats.active }}</div>
            <div class="stat-label">Активных</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-trophy"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ participantsStats.completed }}</div>
            <div class="stat-label">Завершили</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ participantsStats.events }}</div>
            <div class="stat-label">Событий</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section">
      <div class="search-group">
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по имени или email..."
          class="search-input"
        />
        <i class="pi pi-search search-icon"></i>
      </div>
      <div class="filter-group">
        <Dropdown
          v-model="selectedStatus"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Все статусы"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <Dropdown
          v-model="selectedAge"
          :options="ageOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Все возрасты"
          class="filter-dropdown"
        />
      </div>
    </div>

    <!-- Список участников -->
    <div class="participants-grid">
      <div
        v-for="participant in filteredParticipants"
        :key="participant.id"
        class="participant-card"
      >
        <div class="participant-header">
          <div class="participant-avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="participant-info">
            <h3 class="participant-name">{{ participant.fullName }}</h3>
            <p class="participant-age">{{ participant.age }} лет</p>
            <div class="participant-status" :class="participant.statusClass">
              {{ participant.status }}
            </div>
          </div>
          <div class="participant-actions">
            <Button
              icon="pi pi-eye"
              class="p-button-text p-button-sm"
              @click="viewProfile(participant)"
              v-tooltip="'Просмотреть профиль'"
            />
            <Button
              icon="pi pi-envelope"
              class="p-button-text p-button-sm"
              @click="sendMessage(participant)"
              v-tooltip="'Отправить сообщение'"
            />
          </div>
        </div>

        <div class="participant-content">
          <div class="participant-details">
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ participant.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{ participant.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Родитель:</span>
              <span class="detail-value">{{ participant.parentName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Дата регистрации:</span>
              <span class="detail-value">{{
                participant.registrationDate
              }}</span>
            </div>
          </div>

          <div class="participant-progress">
            <h4 class="progress-title">Прогресс обучения</h4>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: participant.progress + '%' }"
              ></div>
            </div>
            <div class="progress-text">
              {{ participant.progress }}% завершено
            </div>
          </div>

          <div class="participant-achievements">
            <h4 class="achievements-title">Достижения</h4>
            <div class="achievements-list">
              <span
                v-for="achievement in participant.achievements"
                :key="achievement"
                class="achievement-badge"
              >
                {{ achievement }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог профиля участника -->
    <Dialog
      v-model:visible="showProfileDialog"
      :header="selectedParticipant?.fullName || 'Профиль участника'"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedParticipant" class="profile-details">
        <div class="profile-section">
          <h4>Контактная информация</h4>
          <div class="contact-info">
            <div class="contact-item">
              <i class="pi pi-envelope"></i>
              <span>{{ selectedParticipant.email }}</span>
            </div>
            <div class="contact-item">
              <i class="pi pi-phone"></i>
              <span>{{ selectedParticipant.phone }}</span>
            </div>
            <div class="contact-item">
              <i class="pi pi-user"></i>
              <span>{{ selectedParticipant.parentName }}</span>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h4>Статистика участия</h4>
          <div class="participation-stats">
            <div class="stat-item">
              <div class="stat-number">
                {{ selectedParticipant.eventsAttended }}
              </div>
              <div class="stat-label">Событий посетил</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ selectedParticipant.tasksCompleted }}
              </div>
              <div class="stat-label">Заданий выполнил</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ selectedParticipant.progress }}%</div>
              <div class="stat-label">Прогресс</div>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h4>Последняя активность</h4>
          <p>{{ selectedParticipant.lastActivity }}</p>
        </div>
      </div>

      <template #footer>
        <Button
          label="Закрыть"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeProfile"
        />
        <Button
          label="Отправить сообщение"
          icon="pi pi-envelope"
          class="p-button-primary"
          @click="sendMessage(selectedParticipant)"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";

export default {
  name: "ExpertParticipants",
  components: {
    Button,
    Dialog,
    InputText,
    Dropdown,
  },
  data() {
    return {
      searchQuery: "",
      selectedStatus: null,
      selectedAge: null,
      showProfileDialog: false,
      selectedParticipant: null,
      competenceName: "Анализ данных",
      competenceDescription: "Изучение основ анализа данных и визуализации",
      statusOptions: [
        { label: "Активный", value: "active" },
        { label: "Приостановлен", value: "paused" },
        { label: "Завершил", value: "completed" },
      ],
      ageOptions: [
        { label: "14 лет", value: 14 },
        { label: "15 лет", value: 15 },
        { label: "16 лет", value: 16 },
        { label: "17 лет", value: 17 },
        { label: "18 лет", value: 18 },
      ],
      participantsStats: {
        total: 12,
        active: 8,
        completed: 3,
        events: 5,
      },
      participants: [
        {
          id: 1,
          fullName: "Иванов Петр Сергеевич",
          age: 16,
          email: "p.ivanov@student.ru",
          phone: "+7 (999) 123-45-67",
          parentName: "Иванова Мария Петровна",
          registrationDate: "15.10.2024",
          status: "Активный",
          statusClass: "status-active",
          progress: 75,
          achievements: ["Первые шаги", "Аналитик данных"],
          eventsAttended: 4,
          tasksCompleted: 8,
          lastActivity: "12.12.2024 - выполнил задание по визуализации",
        },
        {
          id: 2,
          fullName: "Петрова Анна Дмитриевна",
          age: 17,
          email: "a.petrova@student.ru",
          phone: "+7 (999) 234-56-78",
          parentName: "Петров Дмитрий Иванович",
          registrationDate: "20.10.2024",
          status: "Активный",
          statusClass: "status-active",
          progress: 60,
          achievements: ["Первые шаги"],
          eventsAttended: 3,
          tasksCompleted: 6,
          lastActivity: "10.12.2024 - посетила мастер-класс",
        },
        {
          id: 3,
          fullName: "Сидоров Алексей Владимирович",
          age: 15,
          email: "a.sidorov@student.ru",
          phone: "+7 (999) 345-67-89",
          parentName: "Сидорова Елена Петровна",
          registrationDate: "05.11.2024",
          status: "Завершил",
          statusClass: "status-completed",
          progress: 100,
          achievements: [
            "Первые шаги",
            "Аналитик данных",
            "Мастер визуализации",
          ],
          eventsAttended: 5,
          tasksCompleted: 12,
          lastActivity: "08.12.2024 - завершил финальный проект",
        },
        {
          id: 4,
          fullName: "Козлова Елена Сергеевна",
          age: 16,
          email: "e.kozlova@student.ru",
          phone: "+7 (999) 456-78-90",
          parentName: "Козлов Сергей Александрович",
          registrationDate: "12.11.2024",
          status: "Приостановлен",
          statusClass: "status-paused",
          progress: 30,
          achievements: ["Первые шаги"],
          eventsAttended: 1,
          tasksCompleted: 2,
          lastActivity: "25.11.2024 - последняя активность",
        },
      ],
    };
  },
  computed: {
    filteredParticipants() {
      let filtered = this.participants;

      // Поиск по имени или email
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.fullName.toLowerCase().includes(query) ||
            p.email.toLowerCase().includes(query),
        );
      }

      // Фильтр по статусу
      if (this.selectedStatus) {
        const statusMap = {
          active: "Активный",
          paused: "Приостановлен",
          completed: "Завершил",
        };
        filtered = filtered.filter(
          (p) => p.status === statusMap[this.selectedStatus],
        );
      }

      // Фильтр по возрасту
      if (this.selectedAge) {
        filtered = filtered.filter((p) => p.age === this.selectedAge);
      }

      return filtered;
    },
  },
  methods: {
    viewProfile(participant) {
      this.selectedParticipant = participant;
      this.showProfileDialog = true;
    },
    closeProfile() {
      this.showProfileDialog = false;
      this.selectedParticipant = null;
    },
    sendMessage(participant) {
      console.log("Отправка сообщения участнику:", participant.fullName);
      // Логика отправки сообщения
    },
  },
};
</script>

<style scoped>
.participants-page {
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

.header-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #ff9800;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.3s ease;
}

.breadcrumb-link:hover {
  color: #f57c00;
}

.breadcrumb-separator {
  color: #6c757d;
  font-size: 0.8rem;
}

.breadcrumb-current {
  color: #6c757d;
  font-weight: 500;
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

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.filters-section {
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.search-group {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding-right: 2.5rem;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-group label {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.filter-dropdown {
  width: 100%;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.participant-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.participant-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.participant-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.participant-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.participant-info {
  flex: 1;
}

.participant-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.participant-age {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.participant-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: white;
  color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: inline-block;
}

.status-active {
  background: white;
  color: #28a745;
  border: 1px solid #28a745;
}

.status-paused {
  background: white;
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-completed {
  background: white;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.participant-actions {
  display: flex;
  gap: 0.5rem;
}

.participant-content {
  padding: 1.5rem;
}

.participant-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
  min-width: 100px;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

.participant-progress {
  margin-bottom: 1.5rem;
}

.progress-title {
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9800, #f57c00);
  transition: width 0.3s ease;
}

.progress-text {
  color: #6c757d;
  font-size: 0.9rem;
  text-align: center;
}

.participant-achievements {
  margin-bottom: 0;
}

.achievements-title {
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.achievements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.achievement-badge {
  background: #f8f9fa;
  color: #2c3e50;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e9ecef;
}

/* Диалог профиля */
.profile-details {
  padding: 1rem 0;
}

.profile-section {
  margin-bottom: 2rem;
}

.profile-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6c757d;
}

.contact-item i {
  color: #ff9800;
  width: 20px;
}

.participation-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .participants-page {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
  }

  .participants-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-group {
    min-width: auto;
  }

  .filter-group {
    min-width: auto;
  }

  .participant-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .participant-actions {
    justify-content: center;
  }

  .participation-stats {
    grid-template-columns: 1fr;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .participants-page {
    padding: 0 0.5rem;
    max-width: 100%;
    width: 100%;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .participant-content {
    padding: 1rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .detail-value {
    text-align: left;
  }
}
</style>
