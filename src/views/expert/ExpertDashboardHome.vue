<template>
  <div class="dashboard-home">
    <div class="page-header">
      <h1 class="page-title">Добро пожаловать, {{ UserState.firstName }}!</h1>
      <p class="page-subtitle">Управляйте компетенциями и участниками</p>
    </div>

    <div class="dashboard-grid">
      <!-- Информация об эксперте -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user"></i>
            Информация об эксперте
          </h3>
        </div>
        <div class="card-content">
          <div class="data-section">
            <h4 class="section-title">Персональные данные</h4>
            <div class="data-item">
              <span class="data-label">ФИО:</span>
              <span class="data-value">{{
                `${UserState.lastName} ${UserState.firstName} ${UserState.patronymic}`
                }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ UserState.email }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ UserState.mobileNumber }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Должность:</span>
              <span class="data-value">{{ UserState.position ? UserState.position : 'Не указано' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Компетенции -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-briefcase"></i>
            Мои компетенции
          </h3>
        </div>
        <div class="card-content">
          <div class="competencies-grid">
        <div 
          v-for="competence in competencies"
          :key="competence.id"
          class="competence-card"
          @click="goToCompetence(competence.id)"
        >
          <div class="competence-header">
            <h4 class="competence-name">{{ competence.name }}</h4>
            <div class="competence-age">{{ competence.ageRange }}</div>
          </div>
          <div class="competence-content">
            <div class="competence-stats">
              <div class="stat-item">
                <span class="stat-number">{{ competence.participantsCount }}</span>
                <span class="stat-label">Участников</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ competence.eventsCount }}</span>
                <span class="stat-label">Событий</span>
              </div>
            </div>
            <div class="competence-actions">
              <Button 
                label="Участники" 
                icon="pi pi-users"
                class="p-button-sm p-button-outlined"
                @click.stop="goToParticipants(competence.id)"
              />
              <Button 
                label="Документы" 
                icon="pi pi-file-text"
                class="p-button-sm p-button-outlined"
                @click.stop="goToDocuments(competence.id)"
              />
            </div>
          </div>
        </div>
          </div>
          
          <div class="card-actions">
            <Button 
              label="Все компетенции" 
              icon="pi pi-list"
              class="p-button-outlined"
              @click="goToAllCompetencies"
            />
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-chart-bar"></i>
            Общая статистика
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ totalStats.competencies }}</div>
              <div class="stat-label">Компетенций</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ totalStats.participants }}</div>
              <div class="stat-label">Участников</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ totalStats.events }}</div>
              <div class="stat-label">Событий</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ totalStats.documents }}</div>
              <div class="stat-label">Документов</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-bolt"></i>
            Быстрые действия
          </h3>
        </div>
        <div class="card-content">
          <div class="quick-actions">
            <Button 
              label="Создать событие" 
              icon="pi pi-calendar-plus"
              class="p-button-primary"
              @click="createEvent"
            />
            <Button 
              label="Загрузить документ" 
              icon="pi pi-upload"
              class="p-button-outlined"
              @click="uploadDocument"
            />
            <Button 
              label="Просмотреть события" 
              icon="pi pi-calendar"
              class="p-button-outlined"
              @click="viewEvents"
            />
            <Button 
              label="Управление компетенциями" 
              icon="pi pi-cog"
              class="p-button-outlined"
              @click="manageCompetencies"
            />
          </div>
        </div>
      </div>

      <!-- Последние события -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-clock"></i>
            Последние события
          </h3>
        </div>
        <div class="card-content">
          <div class="events-list">
            <div v-for="event in recentEvents" :key="event.id" class="event-item">
              <div class="event-icon">
                <i :class="event.icon"></i>
              </div>
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-competence">{{ event.competence }}</div>
                <div class="event-date">{{ event.date }}</div>
              </div>
              <div class="event-status" :class="event.statusClass">
                {{ event.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Button from 'primevue/button'
import {UserState} from "../../../state/UserState";

export default {
  name: 'ExpertDashboardHome',
  components: {
    Button
  },
  data() {
    return {
      expertData: {
        fullName: 'Петров Игорь Сергеевич',
        email: 'i.petrov@expert.ru',
        phone: '+7 (999) 765-43-21',
        specialization: 'Data Science и машинное обучение'
      },
      competencies: [
        {
          id: 1,
          name: 'Анализ данных',
          ageRange: '14-17 лет',
          participantsCount: 12,
          eventsCount: 3
        },
        {
          id: 2,
          name: 'Искусственный интеллект',
          ageRange: '16-18 лет',
          participantsCount: 8,
          eventsCount: 2
        },
        {
          id: 3,
          name: 'Машинное обучение',
          ageRange: '15-18 лет',
          participantsCount: 15,
          eventsCount: 4
        }
      ],
      totalStats: {
        competencies: 3,
        participants: 35,
        events: 9,
        documents: 24
      },
      recentEvents: [
        {
          id: 1,
          title: 'Мастер-класс по нейронным сетям',
          competence: 'Искусственный интеллект',
          date: '15.12.2024, 14:00',
          status: 'Запланировано',
          statusClass: 'status-planned',
          icon: 'pi pi-calendar'
        },
        {
          id: 2,
          title: 'Практическое занятие по анализу данных',
          competence: 'Анализ данных',
          date: '12.12.2024, 10:00',
          status: 'Проведено',
          statusClass: 'status-completed',
          icon: 'pi pi-check-circle'
        },
        {
          id: 3,
          title: 'Введение в машинное обучение',
          competence: 'Машинное обучение',
          date: '10.12.2024, 16:00',
          status: 'Проведено',
          statusClass: 'status-completed',
          icon: 'pi pi-check-circle'
        }
      ]
    }
  },
  computed: {
    UserState() {
      return UserState
    },
    expertName() {
      return this.expertData.fullName.split(' ')[1] || 'Эксперт'
    }
  },
  methods: {
    goToCompetence(competenceId) {
      this.$router.push(`/expert/competencies`)
    },
    goToParticipants(competenceId) {
      this.$router.push(`/expert/participants/${competenceId}`)
    },
    goToDocuments(competenceId) {
      this.$router.push(`/expert/documents/${competenceId}`)
    },
    goToAllCompetencies() {
      this.$router.push('/expert/competencies')
    },
    createEvent() {
      this.$router.push('/expert/events')
    },
    uploadDocument() {
      // Логика загрузки документа
      console.log('Загрузка документа')
    },
    viewEvents() {
      this.$router.push('/expert/events')
    },
    manageCompetencies() {
      this.$router.push('/expert/competencies')
    }
  }
}
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
  font-family: 'BIPS', sans-serif;
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
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  width: 100%;
  max-width: 100%;
  max-height: 30rem;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.info-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.card-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
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
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.card-content::-webkit-scrollbar {
  width: 6px;
}

.card-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.card-content::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 3px;
}

.card-content::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
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

/* Компетенции */
.competencies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: stretch;
}

.competence-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 280px;
  max-height: 30rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.competence-card:hover {
  background: #fff3e0;
  border-color: #ff9800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}

.competence-header {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.competence-name {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.competence-age {
  color: #6c757d;
  font-size: 0.9rem;
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  display: inline-block;
}

.competence-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.competence-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  max-height: 180px;
  padding-right: 4px;
}

.competence-content::-webkit-scrollbar {
  width: 4px;
}

.competence-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.competence-content::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 2px;
}

.competence-content::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

.competence-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  flex-shrink: 0;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
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

.card-actions {
  text-align: center;
  margin-top: 1rem;
}

/* Быстрые действия */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* События */
.events-list {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.event-item:last-child {
  border-bottom: none;
}

.event-icon {
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

.event-content {
  flex: 1;
}

.event-title {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.event-competence {
  color: #6c757d;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.event-date {
  color: #6c757d;
  font-size: 0.8rem;
}

.event-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-planned {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-completed {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
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
    max-height: 20rem;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .competencies-grid {
    grid-template-columns: 1fr;
  }
  
  .competence-actions {
    flex-direction: column;
  }
  
  .competence-card {
    height: 250px;
  }
  
  .competence-content {
    max-height: 150px;
  }
  
  .quick-actions {
    gap: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .dashboard-home {
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
  
  .card-content {
    padding: 0.75rem;
  }
  
  .competence-card {
    padding: 0.75rem;
  }
  
  .competence-actions {
    gap: 0.25rem;
  }
  
  .competence-card {
    height: 220px;
  }
  
  .competence-content {
    max-height: 120px;
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
}
</style>