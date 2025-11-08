<template>
  <div class="events-page">
    <div class="page-header">
      <div class="title">
        <h1 class="page-title">
          События
        </h1>
        <p class="page-subtitle">
          Создание и управление событиями по компетенциям
        </p>
      </div>
      <Button
        label="Создать событие"
        icon="pi pi-calendar-plus"
        class="p-button-primary"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Фильтры -->
    <div
      v-if="competenceId !== null"
      class="filters-section"
    >
      <div class="filter-group">
        <Dropdown
          v-model="selectedCompetency"
          :options="competencyOptions"
          option-label="label"
          option-value="value"
          placeholder="Все компетенции"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <Dropdown
          v-model="selectedStatus"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Все статусы"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <Calendar
          v-model="selectedDate"
          placeholder="Выберите дату"
          date-format="dd.mm.yy"
          class="filter-calendar"
        />
      </div>
      <div class="filter-group">
        <Button
          label="Сбросить фильтры"
          icon="pi pi-refresh"
          class="p-button-text p-button-sm"
          @click="resetFilters"
        />
      </div>
    </div>

    <!-- Список событий -->
    <div class="events-grid">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="event-card"
      >
        <div class="event-header">
          <div class="event-info">
            <h3 class="event-title">
              {{ event.title }}
            </h3>
            <p class="event-competency">
              {{ event.competency }}
            </p>
            <div class="event-meta">
              <span class="event-date">
                <i class="pi pi-calendar" />
                {{ event.date }}
              </span>
              <span class="event-time">
                <i class="pi pi-clock" />
                {{ event.time }}
              </span>
              <span class="event-location">
                <i class="pi pi-map-marker" />
                {{ event.location }}
              </span>
            </div>
          </div>
        </div>

        <div class="event-content">
          <div class="event-description">
            <p>{{ event.description }}</p>
          </div>

          <div class="event-actions">
            <Button
              label="Редактировать"
              icon="pi pi-pencil"
              class="p-button-outlined p-button-sm"
              @click="editEvent(event)"
            />
            <Button
              label="Дублировать"
              icon="pi pi-copy"
              class="p-button-outlined p-button-sm"
              @click="duplicateEvent(event)"
            />
            <Button
              label="Удалить"
              icon="pi pi-trash"
              class="p-button-outlined p-button-sm p-button-danger"
              @click="deleteEvent(event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог создания/редактирования события -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="isEditing ? 'Редактировать событие' : 'Создать новое событие'"
      :modal="true"
      :style="{ width: '800px' }"
    >
      <div class="event-form">
        <div class="form-row">
          <div class="form-group">
            <label for="eventTitle">Название события *</label>
            <InputText
              id="eventTitle"
              v-model="eventForm.title"
              placeholder="Введите название события"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="eventCompetency">Компетенция *</label>
            <Dropdown
              id="eventCompetency"
              v-model="eventForm.competencyId"
              :options="competencyOptions"
              option-label="label"
              option-value="value"
              placeholder="Выберите компетенцию"
              class="form-dropdown"
            />
          </div>
          <div class="form-group">
            <label for="eventType">Тип события *</label>
            <Dropdown
              id="eventType"
              v-model="eventForm.type"
              :options="eventTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="Выберите тип"
              class="form-dropdown"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="eventDate">Дата проведения *</label>
            <Calendar
              id="eventDate"
              v-model="eventForm.date"
              date-format="dd.mm.yy"
              placeholder="Выберите дату"
              class="form-calendar"
            />
          </div>
          <div class="form-group">
            <label for="eventTime">Время проведения *</label>
            <InputText
              id="eventTime"
              v-model="eventForm.time"
              placeholder="Например: 14:00"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="eventLocation">Место проведения *</label>
            <InputText
              id="eventLocation"
              v-model="eventForm.location"
              placeholder="Адрес или ссылка на онлайн-встречу"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="eventOnline">Тип проведения</label>
            <Dropdown
              id="eventOnline"
              v-model="eventForm.isOnline"
              :options="locationTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="Выберите тип"
              class="form-dropdown"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="eventDescription">Описание события *</label>
            <Textarea
              id="eventDescription"
              v-model="eventForm.description"
              placeholder="Подробное описание события"
              :rows="4"
              class="form-textarea"
            />
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">
            Настройки рассылки
          </h4>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="emailSubject">Тема письма *</label>
              <InputText
                id="emailSubject"
                v-model="eventForm.emailSubject"
                placeholder="Тема письма для рассылки"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="emailBody">Текст письма *</label>
              <Editor
                id="emailBody"
                v-model="eventForm.emailBody"
                placeholder="Текст письма для рассылки"
                :rows="6"
                class="form-editor"
                editor-style="height: 200px"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="sendDate">Дата отправки</label>
              <Calendar
                id="sendDate"
                v-model="eventForm.sendDate"
                date-format="dd.mm.yy"
                placeholder="Выберите дату отправки"
                class="form-calendar"
              />
            </div>
            <div class="form-group">
              <label for="sendTime">Время отправки</label>
              <InputText
                id="sendTime"
                v-model="eventForm.sendTime"
                placeholder="Например: 09:00"
                class="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeCreateDialog"
        />
        <Button
          :label="isEditing ? 'Сохранить изменения' : 'Создать событие'"
          icon="pi pi-check"
          class="p-button-primary"
          @click="saveEvent"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
  import Button from 'primevue/button'
  import Dialog from 'primevue/dialog'
  import InputText from 'primevue/inputtext'
  import Textarea from 'primevue/textarea'
  import Dropdown from 'primevue/dropdown'
  import Calendar from 'primevue/calendar'
  import Editor from 'primevue/editor'

  export default {
    name: 'CompetenciesEvents',
    components: {
      Button,
      Dialog,
      InputText,
      Textarea,
      Dropdown,
      Calendar,
      Editor
    },
    props: {
      competenceId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        showCreateDialog: false,
        isEditing: false,
        selectedCompetency: null,
        selectedStatus: null,
        selectedDate: null,
        editorModules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image']
          ]
        },
        editorFormats: [
          'bold', 'italic', 'underline', 'strike',
          'blockquote', 'code-block',
          'header', 'list', 'script',
          'indent', 'direction', 'size',
          'color', 'background', 'font',
          'align', 'clean', 'link', 'image'
        ],
        eventForm: {
          title: '',
          competencyId: null,
          type: null,
          date: null,
          time: '',
          location: '',
          isOnline: false,
          description: '',
          emailSubject: '',
          emailBody: '<p>Добро пожаловать на наше событие!</p><p>Мы рады пригласить вас на мероприятие, которое состоится в указанную дату и время.</p><p>С уважением,<br>Команда организаторов</p>',
          sendDate: null,
          sendTime: ''
        },
        competencyOptions: [
          { label: 'Анализ данных', value: 1 },
          { label: 'Искусственный интеллект', value: 2 },
          { label: 'Машинное обучение', value: 3 }
        ],
        statusOptions: [
          { label: 'Опубликовано', value: 'published' },
          { label: 'На модерации', value: 'moderation' },
          { label: 'Черновик', value: 'draft' },
          { label: 'Отменено', value: 'cancelled' }
        ],
        eventTypeOptions: [
          { label: 'Мастер-класс', value: 'masterclass' },
          { label: 'Лекция', value: 'lecture' },
          { label: 'Практическое занятие', value: 'practice' },
          { label: 'Встреча', value: 'meeting' },
          { label: 'Экзамен', value: 'exam' }
        ],
        locationTypeOptions: [
          { label: 'Офлайн', value: false },
          { label: 'Онлайн', value: true }
        ],
        eventsStats: {
          total: 12,
          published: 8,
          pending: 3,
          participants: 156
        },
        events: [
          {
            id: 1,
            title: 'Мастер-класс по нейронным сетям',
            competency: 'Искусственный интеллект',
            competencyId: 2,
            type: 'masterclass',
            date: '15.12.2024',
            time: '14:00',
            location: 'Аудитория 301, корпус А',
            isOnline: false,
            description: 'Практическое занятие по созданию и обучению нейронных сетей для решения задач классификации изображений.',
            status: 'Опубликовано',
            statusClass: 'status-published',
            participantsCount: 25,
            emailsSent: 25,
            views: 45
          },
          {
            id: 2,
            title: 'Практическое занятие по анализу данных',
            competency: 'Анализ данных',
            competencyId: 1,
            type: 'practice',
            date: '12.12.2024',
            time: '10:00',
            location: 'https://meet.google.com/abc-defg-hij',
            isOnline: true,
            description: 'Работа с реальными данными, создание визуализаций и построение дашбордов.',
            status: 'Опубликовано',
            statusClass: 'status-published',
            participantsCount: 18,
            emailsSent: 18,
            views: 32
          },
          {
            id: 3,
            title: 'Введение в машинное обучение',
            competency: 'Машинное обучение',
            competencyId: 3,
            type: 'lecture',
            date: '10.12.2024',
            time: '16:00',
            location: 'Аудитория 205, корпус Б',
            isOnline: false,
            description: 'Теоретические основы машинного обучения, типы алгоритмов и их применение.',
            status: 'На модерации',
            statusClass: 'status-moderation',
            participantsCount: 0,
            emailsSent: 0,
            views: 8
          }
        ]
      }
    },
    computed: {
      filteredEvents() {
        let filtered = this.events

        // Фильтр по компетенции
        if (this.selectedCompetency) {
          filtered = filtered.filter(e => e.competencyId === this.selectedCompetency)
        }

        // Фильтр по статусу
        if (this.selectedStatus) {
          const statusMap = {
            'published': 'Опубликовано',
            'moderation': 'На модерации',
            'draft': 'Черновик',
            'cancelled': 'Отменено'
          }
          filtered = filtered.filter(e => e.status === statusMap[this.selectedStatus])
        }

        // Фильтр по дате
        if (this.selectedDate) {
          // Логика фильтрации по дате
          // filtered = filtered.filter(e => e.date === this.selectedDate)
        }

        return filtered
      }
    },
    methods: {
      editEvent(event) {
        this.isEditing = true
        this.eventForm = { ...event }
        this.showCreateDialog = true
      },
      duplicateEvent(event) {
        this.isEditing = false
        this.eventForm = {
          ...event,
          id: null,
          title: event.title + ' (копия)',
          status: 'Черновик'
        }
        this.showCreateDialog = true
      },
      deleteEvent(event) {
        console.log('Удаление события:', event.title)
        // Логика удаления
      },
      saveEvent() {
        console.log('Сохранение события:', this.eventForm)
        // Логика сохранения
        this.closeCreateDialog()
      },
      closeCreateDialog() {
        this.showCreateDialog = false
        this.isEditing = false
        this.resetForm()
      },
      resetForm() {
        this.eventForm = {
          title: '',
          competencyId: null,
          type: null,
          date: null,
          time: '',
          location: '',
          isOnline: false,
          description: '',
          emailSubject: '',
          emailBody: '<p>Добро пожаловать на наше событие!</p><p>Мы рады пригласить вас на мероприятие, которое состоится в указанную дату и время.</p><p>С уважением,<br>Команда организаторов</p>',
          sendDate: null,
          sendTime: ''
        }
      },
      resetFilters() {
        this.selectedCompetency = null
        this.selectedStatus = null
        this.selectedDate = null
      }
    }
  }
</script>

<style scoped>
  .events-page {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
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

  .filter-dropdown,
  .filter-calendar {
    width: 100%;
  }

  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .event-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
  }

  .event-card:hover {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
    border: 2px solid #ff9800;
  }

  .event-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .event-info {
    flex: 1;
  }

  .event-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .event-competency {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .event-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .event-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .event-meta i {
    width: 16px;
    text-align: center;
  }

  .event-content {
    padding: 1.5rem;
  }

  .event-description {
    margin-bottom: 1.5rem;
  }

  .event-description p {
    color: #6c757d;
    line-height: 1.5;
    margin: 0;
  }

  .stat-item i {
    color: #ff9800;
  }

  .event-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  /* Форма события */
  .event-form {
    padding: 1rem 0;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  .form-group label {
    color: #2c3e50;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .form-input,
  .form-dropdown,
  .form-calendar,
  .form-textarea,
  .form-editor {
    width: 100%;
  }

  .form-editor {
    border: 1px solid #ced4da;
    border-radius: 6px;
    overflow: hidden;
  }

  .form-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid #e9ecef;
  }

  .section-title {
    color: #2c3e50;
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    border-bottom: 2px solid #ff9800;
    padding-bottom: 0.5rem;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {
    .events-page {
      padding: 0 1rem;
      max-width: 100%;
      width: 100%;
    }

    .events-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .filters-section {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-group {
      min-width: auto;
    }

    .event-header {
      flex-direction: column;
      gap: 1rem;
    }

    .event-meta {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-editor {
      min-height: 150px;
    }

    .event-actions {
      justify-content: center;
    }
  }

  /* Очень маленькие экраны */
  @media (max-width: 480px) {
    .events-page {
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

    .event-content {
      padding: 1rem;
    }


    .form-editor {
      min-height: 120px;
    }
  }
</style>