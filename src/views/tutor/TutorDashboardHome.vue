<template>
  <div class="dashboard-home">
    <div class="page-header">
      <h1 class="page-title">Добро пожаловать, {{ TutorName }}!</h1>
      <p class="page-subtitle">Управляйте площадкой и главными экспертами</p>
    </div>

    <div class="dashboard-grid">
      <!-- Информация о кураторе -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user"></i>
            Информация о кураторе
          </h3>
        </div>
        <div class="card-content">
          <div class="data-section">
            <h4 class="section-title">Персональные данные</h4>
            <div class="data-item">
              <span class="data-label">ФИО:</span>
              <span class="data-value">{{ TutorData.fullName }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ TutorData.email }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ TutorData.phone }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Должность:</span>
              <span class="data-value">{{ TutorData.position }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Информация о площадке -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-building"></i>
            Информация о площадке
          </h3>
          <div class="status-badge" :class="venueStatusClass">
            {{ venueStatusText }}
          </div>
        </div>
        <div class="card-content">
          <div class="data-section">
            <div class="data-item">
              <span class="data-label">Название:</span>
              <span class="data-value">{{ venueData.name }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Адрес:</span>
              <span class="data-value">{{ venueData.address }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Описание:</span>
              <span class="data-value">{{ venueData.description }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Статус модерации:</span>
              <span class="data-value">{{ venueData.moderationStatus }}</span>
            </div>
          </div>
          
          <div class="card-actions">
            <Button 
              label="Редактировать информацию" 
              icon="pi pi-pencil"
              class="p-button-outlined"
              @click="editVenueInfo"
            />
          </div>
        </div>
      </div>

      <!-- Статистика главных экспертов -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-users"></i>
            Главные эксперты
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ expertsStats.total }}</div>
              <div class="stat-label">Всего экспертов</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ expertsStats.active }}</div>
              <div class="stat-label">Активных</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ expertsStats.competencies }}</div>
              <div class="stat-label">Компетенций</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ expertsStats.verified }}</div>
              <div class="stat-label">Проверенных</div>
            </div>
          </div>
          
          <div class="card-actions">
            <Button 
              label="Управление экспертами" 
              icon="pi pi-cog"
              class="p-button-outlined"
              @click="goToExperts"
            />
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
              label="Добавить главного эксперта" 
              icon="pi pi-user-plus"
              class="p-button-primary"
              @click="addExpert"
            />
            <Button 
              label="Загрузить документы" 
              icon="pi pi-upload"
              class="p-button-outlined"
              @click="uploadDocuments"
            />
            <Button 
              label="Просмотреть документы" 
              icon="pi pi-file-text"
              class="p-button-outlined"
              @click="viewDocuments"
            />
            <Button 
              label="Отправить на модерацию" 
              icon="pi pi-send"
              class="p-button-outlined"
              @click="sendForModeration"
              :disabled="!canSendForModeration"
            />
          </div>
        </div>
      </div>

      <!-- Последние обновления -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-clock"></i>
            Последние обновления
          </h3>
        </div>
        <div class="card-content">
          <div class="updates-list">
            <div v-for="update in recentUpdates" :key="update.id" class="update-item">
              <div class="update-icon">
                <i :class="update.icon"></i>
              </div>
              <div class="update-content">
                <div class="update-text">{{ update.text }}</div>
                <div class="update-time">{{ update.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Button from 'primevue/button'

export default {
  name: 'TutorDashboardHome',
  components: {
    Button
  },
  data() {
    return {
      TutorData: {
        fullName: 'Петрова Мария Ивановна',
        email: 'm.petrova@venue.ru',
        phone: '+7 (999) 123-45-67',
        position: 'Куратор образовательной площадки'
      },
      venueData: {
        name: 'Центр дополнительного образования "ТехноМир"',
        address: 'г. Москва, ул. Техническая, д. 15',
        description: 'Современный образовательный центр с оборудованными лабораториями для проведения соревнований по техническим компетенциям',
        moderationStatus: 'На модерации'
      },
      expertsStats: {
        total: 5,
        active: 4,
        competencies: 8,
        verified: 3
      },
      recentUpdates: [
        {
          id: 1,
          icon: 'pi pi-user-plus',
          text: 'Добавлен новый главный эксперт: Сидоров А.В.',
          time: '1 час назад'
        },
        {
          id: 2,
          icon: 'pi pi-file-upload',
          text: 'Загружен документ: Лицензия на образовательную деятельность',
          time: '3 часа назад'
        },
        {
          id: 3,
          icon: 'pi pi-check-circle',
          text: 'Информация о площадке отправлена на модерацию',
          time: '1 день назад'
        },
        {
          id: 4,
          icon: 'pi pi-user-edit',
          text: 'Обновлены данные эксперта: Козлов П.С.',
          time: '2 дня назад'
        }
      ]
    }
  },
  computed: {
    TutorName() {
      return this.TutorData.fullName.split(' ')[1] || 'Куратор'
    },
    venueStatusClass() {
      const status = this.venueData.moderationStatus.toLowerCase()
      if (status.includes('модерации')) return 'status-pending'
      if (status.includes('одобрена')) return 'status-approved'
      if (status.includes('отклонена')) return 'status-rejected'
      return 'status-pending'
    },
    venueStatusText() {
      return this.venueData.moderationStatus
    },
    canSendForModeration() {
      return this.venueData.moderationStatus === 'Черновик' || this.venueData.moderationStatus === 'Отклонена'
    }
  },
  methods: {
    goToExperts() {
      this.$router.push('/tutor/experts')
    },
    addExpert() {
      // Логика добавления эксперта
      console.log('Добавление главного эксперта')
    },
    editVenueInfo() {
      this.$router.push('/tutor/venue-info')
    },
    uploadDocuments() {
      this.$router.push('/tutor/documents')
    },
    viewDocuments() {
      this.$router.push('/tutor/documents')
    },
    sendForModeration() {
      // Логика отправки на модерацию
      console.log('Отправка на модерацию')
      this.venueData.moderationStatus = 'На модерации'
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-approved {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.status-rejected {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
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
  align-items: flex-start;
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
  flex-shrink: 0;
}

.data-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-word;
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
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
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
