<template>
  <div class="my-competencies">
    <div class="page-header">
      <h1 class="page-title">Мои компетенции</h1>
      <p class="page-subtitle">Управление выбранными компетенциями и отслеживание прогресса</p>
    </div>

    <div v-if="myCompetencies.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-list empty-icon"></i>
        <h3 class="empty-title">Компетенции не выбраны</h3>
        <p class="empty-text">Выберите компетенции для участия в чемпионате</p>
        <Button 
          label="Выбрать компетенции" 
          icon="pi pi-plus"
          class="p-button-primary"
          @click="goToSelection"
        />
      </div>
    </div>

    <div v-else class="competencies-list">
      <div 
        v-for="competence in myCompetencies"
        :key="competence.id"
        class="competence-item"
      >
        <div class="competence-header">
          <div class="competence-info">
            <div class="competence-icon">
              <i :class="competence.icon"></i>
            </div>
            <div class="competence-details">
              <h3 class="competence-name">{{ competence.name }}</h3>
              <div class="competence-meta">
                <span class="age-range">
                  <i class="pi pi-calendar"></i>
                  {{ competence.ageRange }}
                </span>
                <span class="duration">
                  <i class="pi pi-clock"></i>
                  {{ competence.duration }}
                </span>
                <span class="format">
                  <i class="pi pi-users"></i>
                  {{ competence.format }}
                </span>
              </div>
            </div>
          </div>
          <div class="competence-status">
            <Tag 
              :value="competence.status.text"
              :severity="competence.status.severity"
              class="status-tag"
            />
          </div>
        </div>

        <div class="competence-content">
          <div class="mentor-info">
            <h4 class="section-title">
              <i class="pi pi-user"></i>
              Контакты главного эксперта
            </h4>
            <div class="mentor-contacts">
              <div class="contact-item">
                <i class="pi pi-user"></i>
                <span class="contact-label">ФИО:</span>
                <span class="contact-value">{{ competence.mentor.name }}</span>
              </div>
              <div class="contact-item">
                <i class="pi pi-envelope"></i>
                <span class="contact-label">Email:</span>
                <span class="contact-value">{{ competence.mentor.email }}</span>
              </div>
              <div class="contact-item">
                <i class="pi pi-phone"></i>
                <span class="contact-label">Телефон:</span>
                <span class="contact-value">{{ competence.mentor.phone }}</span>
              </div>
            </div>
          </div>

          <div class="schedule-info">
            <h4 class="section-title">
              <i class="pi pi-calendar"></i>
              Расписание
            </h4>
            <div class="schedule-timeline">
              <div 
                v-for="event in competence.schedule"
                :key="event.id"
                class="timeline-item"
                :class="{ 
                  completed: event.status === 'completed',
                  current: event.status === 'current',
                  upcoming: event.status === 'upcoming'
                }"
              >
                <div class="timeline-marker">
                  <i :class="getEventIcon(event.status)"></i>
                </div>
                <div class="timeline-content">
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-date">{{ event.date }}</div>
                  <div v-if="event.description" class="event-description">{{ event.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="competence-actions">
            <Button 
              label="Подробнее" 
              icon="pi pi-info-circle"
              class="p-button-outlined p-button-sm"
              @click="showCompetenceDetails(competence)"
            />
            <Button 
              label="Изменить" 
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              @click="editCompetence(competence)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог с подробной информацией -->
    <Dialog 
      v-model:visible="showDetailsDialog" 
      :header="selectedCompetence?.name"
      modal
      :style="{ width: '90vw', maxWidth: '500px' }"
      class="competence-dialog"
    >
      <div v-if="selectedCompetence" class="competence-details">
        <div class="details-content">
          <h4>Описание</h4>
          <p>{{ selectedCompetence.description }}</p>
          
          <h4>Навыки и компетенции</h4>
          <ul class="skills-list">
            <li v-for="skill in selectedCompetence.skills" :key="skill">{{ skill }}</li>
          </ul>
          
          <h4>Текущий статус</h4>
          <div class="status-info">
            <Tag 
              :value="selectedCompetence.status.text"
              :severity="selectedCompetence.status.severity"
            />
            <p class="status-description">{{ selectedCompetence.status.description }}</p>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'

export default {
  name: 'ParentMyCompetencies',
  components: {
    Button,
    Tag,
    Dialog
  },
  data() {
    return {
      showDetailsDialog: false,
      selectedCompetence: null,
      myCompetencies: [
        {
          id: 1,
          name: 'Веб-дизайн и разработка',
          description: 'Компетенция включает в себя создание пользовательских интерфейсов, верстку, программирование на современных технологиях и оптимизацию веб-приложений.',
          ageRange: '14-16 лет',
          duration: '2 дня',
          format: 'Индивидуальное',
          icon: 'pi pi-desktop',
          skills: [
            'HTML/CSS',
            'JavaScript',
            'Responsive Design',
            'UI/UX Design',
            'Frameworks (React, Vue)'
          ],
          mentor: {
            name: 'Петров Иван Сергеевич',
            email: 'i.petrov@mentor.ru',
            phone: '+7 (999) 111-22-33'
          },
          status: {
            text: 'Участник',
            severity: 'info',
            description: 'Ваш ребенок зарегистрирован как участник данной компетенции'
          },
          schedule: [
            {
              id: 1,
              title: 'Регистрация',
              date: '15.01.2024',
              status: 'completed',
              description: 'Успешно завершена'
            },
            {
              id: 2,
              title: 'Отборочный тур',
              date: '20.02.2024',
              status: 'current',
              description: 'В процессе'
            },
            {
              id: 3,
              title: 'Полуфинал',
              date: '15.03.2024',
              status: 'upcoming',
              description: 'Ожидается'
            },
            {
              id: 4,
              title: 'Финал',
              date: '20.04.2024',
              status: 'upcoming',
              description: 'Ожидается'
            }
          ]
        },
        {
          id: 2,
          name: '3D-моделирование',
          description: 'Работа с 3D-графикой, создание моделей, текстур и анимации для различных областей применения.',
          ageRange: '14-16 лет',
          duration: '2 дня',
          format: 'Индивидуальное',
          icon: 'pi pi-box',
          skills: [
            'Blender',
            '3ds Max',
            'Maya',
            'Texturing',
            'Animation'
          ],
          mentor: {
            name: 'Морозов Андрей Петрович',
            email: 'a.morozov@mentor.ru',
            phone: '+7 (999) 555-66-77'
          },
          status: {
            text: 'Призер',
            severity: 'success',
            description: 'Поздравляем! Ваш ребенок стал призером в данной компетенции'
          },
          schedule: [
            {
              id: 1,
              title: 'Регистрация',
              date: '10.01.2024',
              status: 'completed',
              description: 'Успешно завершена'
            },
            {
              id: 2,
              title: 'Отборочный тур',
              date: '18.02.2024',
              status: 'completed',
              description: 'Успешно пройден'
            },
            {
              id: 3,
              title: 'Полуфинал',
              date: '10.03.2024',
              status: 'completed',
              description: 'Успешно пройден'
            },
            {
              id: 4,
              title: 'Финал',
              date: '15.04.2024',
              status: 'completed',
              description: 'Завершен - 2 место'
            }
          ]
        }
      ]
    }
  },
  methods: {
    goToSelection() {
      this.$router.push('/parent/competencies')
    },
    
    showCompetenceDetails(competence) {
      this.selectedCompetence = competence
      this.showDetailsDialog = true
    },
    
    editCompetence(competence) {
      // Переходим к странице выбора компетенций для редактирования
      this.$router.push('/parent/competencies')
    },
    
    getEventIcon(status) {
      switch (status) {
        case 'completed':
          return 'pi pi-check'
        case 'current':
          return 'pi pi-clock'
        case 'upcoming':
          return 'pi pi-calendar'
        default:
          return 'pi pi-circle'
      }
    }
  }
}
</script>

<style scoped>
.my-competencies {
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
  font-family: 'BIPS', sans-serif;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1.5rem;
}

.empty-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-text {
  color: #6c757d;
  margin: 0 0 2rem 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

.competencies-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.competence-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.competence-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.competence-header {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.competence-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.competence-icon {
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

.competence-details {
  flex: 1;
}

.competence-name {
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.competence-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.age-range,
.duration,
.format {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
}

.age-range i,
.duration i,
.format i {
  color: #ff9800;
}

.competence-status {
  flex-shrink: 0;
}

.status-tag {
  font-weight: 600;
}

.competence-content {
  padding: 1.5rem;
}

.section-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #ff9800;
}

.mentor-info {
  margin-bottom: 2rem;
}

.mentor-contacts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #495057;
}

.contact-item i {
  color: #ff9800;
  width: 16px;
}

.contact-label {
  font-weight: 500;
  min-width: 80px;
}

.contact-value {
  font-weight: 600;
}

.schedule-info {
  margin-bottom: 2rem;
}

.schedule-timeline {
  position: relative;
  padding-left: 2rem;
}

.schedule-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  z-index: 1;
}

.timeline-item.completed .timeline-marker {
  background: #28a745;
}

.timeline-item.current .timeline-marker {
  background: #ff9800;
}

.timeline-item.upcoming .timeline-marker {
  background: #6c757d;
}

.timeline-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #e9ecef;
}

.timeline-item.completed .timeline-content {
  border-left-color: #28a745;
}

.timeline-item.current .timeline-content {
  border-left-color: #ff9800;
}

.timeline-item.upcoming .timeline-content {
  border-left-color: #6c757d;
}

.event-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.event-date {
  color: #ff9800;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.event-description {
  color: #6c757d;
  font-size: 0.9rem;
}

.competence-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.competence-details {
  max-height: 70vh;
  overflow-y: auto;
}

.details-content h4 {
  color: #2c3e50;
  margin: 1.5rem 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.details-content p {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.skills-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.skills-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
  color: #495057;
}

.skills-list li:last-child {
  border-bottom: none;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-description {
  color: #6c757d;
  margin: 0;
  font-style: italic;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .competence-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .competence-info {
    flex-direction: column;
    text-align: center;
  }
  
  .competence-meta {
    justify-content: center;
  }
  
  .competence-actions {
    flex-direction: column;
  }
  
  .schedule-timeline {
    padding-left: 1.5rem;
  }
  
  .timeline-item {
    padding-left: 1.5rem;
  }
  
  .timeline-marker {
    left: -1.5rem;
    width: 25px;
    height: 25px;
  }
}
</style>
