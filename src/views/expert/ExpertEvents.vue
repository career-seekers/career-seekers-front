<template>
  <div class="events-page">
    <div class="page-header">
      <h1 class="page-title">События и рассылки</h1>
      <p class="page-subtitle">
        Создание и управление событиями по компетенциям
      </p>
    </div>

    <!-- Статистика -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ eventsStats.total }}</div>
            <div class="stat-label">Всего событий</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ eventsStats.published }}</div>
            <div class="stat-label">Опубликовано</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ eventsStats.pending }}</div>
            <div class="stat-label">На модерации</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ eventsStats.participants }}</div>
            <div class="stat-label">Участников</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Создание события -->
    <div class="create-section">
      <div class="create-card">
        <div class="create-header">
          <h3 class="create-title">
            <i class="pi pi-plus"></i>
            Создать новое событие
          </h3>
        </div>
        <div class="create-content">
          <Button
            label="Создать событие"
            icon="pi pi-calendar-plus"
            class="p-button-primary"
            @click="showCreateDialog = true"
          />
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="filters-section">
      <div class="filter-group">
        <Dropdown
          v-model="selectedCompetence"
          :options="competenceOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Все компетенции"
          class="filter-dropdown"
        />
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
        <Calendar
          v-model="selectedDate"
          placeholder="Выберите дату"
          dateFormat="dd.mm.yy"
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
      <div v-for="event in filteredEvents" :key="event.id" class="event-card">
        <div class="event-header">
          <div class="event-info">
            <h3 class="event-title">{{ event.title }}</h3>
            <p class="event-competence">{{ event.competence }}</p>
            <div class="event-meta">
              <span class="event-date">
                <i class="pi pi-calendar"></i>
                {{ event.date }}
              </span>
              <span class="event-time">
                <i class="pi pi-clock"></i>
                {{ event.time }}
              </span>
              <span class="event-location">
                <i class="pi pi-map-marker"></i>
                {{ event.location }}
              </span>
            </div>
          </div>
          <div class="event-status" :class="event.statusClass">
            {{ event.status }}
          </div>
        </div>

        <div class="event-content">
          <div class="event-description">
            <p>{{ event.description }}</p>
          </div>

          <div class="event-stats">
            <div class="stat-item">
              <i class="pi pi-users"></i>
              <span>{{ event.participantsCount }} участников</span>
            </div>
            <div class="stat-item">
              <i class="pi pi-envelope"></i>
              <span>{{ event.emailsSent }} писем отправлено</span>
            </div>
            <div class="stat-item">
              <i class="pi pi-eye"></i>
              <span>{{ event.views }} просмотров</span>
            </div>
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
            <label for="eventCompetence">Компетенция *</label>
            <Dropdown
              id="eventCompetence"
              v-model="eventForm.competenceId"
              :options="competenceOptions"
              optionLabel="label"
              optionValue="value"
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
              optionLabel="label"
              optionValue="value"
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
              dateFormat="dd.mm.yy"
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
              optionLabel="label"
              optionValue="value"
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
          <h4 class="section-title">Настройки рассылки</h4>

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
                editorStyle="height: 200px"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="sendDate">Дата отправки</label>
              <Calendar
                id="sendDate"
                v-model="eventForm.sendDate"
                dateFormat="dd.mm.yy"
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
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Editor from "primevue/editor";

export default {
  name: "ExpertEvents",
  components: {
    Button,
    Dialog,
    InputText,
    Textarea,
    Dropdown,
    Calendar,
    Editor,
  },
  data() {
    return {
      showCreateDialog: false,
      isEditing: false,
      selectedCompetence: null,
      selectedStatus: null,
      selectedDate: null,
      editorModules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ header: 1 }, { header: 2 }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ align: [] }],
          ["clean"],
          ["link", "image"],
        ],
      },
      editorFormats: [
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "code-block",
        "header",
        "list",
        "script",
        "indent",
        "direction",
        "size",
        "color",
        "background",
        "font",
        "align",
        "clean",
        "link",
        "image",
      ],
      eventForm: {
        title: "",
        competenceId: null,
        type: null,
        date: null,
        time: "",
        location: "",
        isOnline: false,
        description: "",
        emailSubject: "",
        emailBody:
          "<p>Добро пожаловать на наше событие!</p><p>Мы рады пригласить вас на мероприятие, которое состоится в указанную дату и время.</p><p>С уважением,<br>Команда организаторов</p>",
        sendDate: null,
        sendTime: "",
      },
      competenceOptions: [
        { label: "Анализ данных", value: 1 },
        { label: "Искусственный интеллект", value: 2 },
        { label: "Машинное обучение", value: 3 },
      ],
      statusOptions: [
        { label: "Опубликовано", value: "published" },
        { label: "На модерации", value: "moderation" },
        { label: "Черновик", value: "draft" },
        { label: "Отменено", value: "cancelled" },
      ],
      eventTypeOptions: [
        { label: "Мастер-класс", value: "masterclass" },
        { label: "Лекция", value: "lecture" },
        { label: "Практическое занятие", value: "practice" },
        { label: "Встреча", value: "meeting" },
        { label: "Экзамен", value: "exam" },
      ],
      locationTypeOptions: [
        { label: "Офлайн", value: false },
        { label: "Онлайн", value: true },
      ],
      eventsStats: {
        total: 12,
        published: 8,
        pending: 3,
        participants: 156,
      },
      events: [
        {
          id: 1,
          title: "Мастер-класс по нейронным сетям",
          competence: "Искусственный интеллект",
          competenceId: 2,
          type: "masterclass",
          date: "15.12.2024",
          time: "14:00",
          location: "Аудитория 301, корпус А",
          isOnline: false,
          description:
            "Практическое занятие по созданию и обучению нейронных сетей для решения задач классификации изображений.",
          status: "Опубликовано",
          statusClass: "status-published",
          participantsCount: 25,
          emailsSent: 25,
          views: 45,
        },
        {
          id: 2,
          title: "Практическое занятие по анализу данных",
          competence: "Анализ данных",
          competenceId: 1,
          type: "practice",
          date: "12.12.2024",
          time: "10:00",
          location: "https://meet.google.com/abc-defg-hij",
          isOnline: true,
          description:
            "Работа с реальными данными, создание визуализаций и построение дашбордов.",
          status: "Опубликовано",
          statusClass: "status-published",
          participantsCount: 18,
          emailsSent: 18,
          views: 32,
        },
        {
          id: 3,
          title: "Введение в машинное обучение",
          competence: "Машинное обучение",
          competenceId: 3,
          type: "lecture",
          date: "10.12.2024",
          time: "16:00",
          location: "Аудитория 205, корпус Б",
          isOnline: false,
          description:
            "Теоретические основы машинного обучения, типы алгоритмов и их применение.",
          status: "На модерации",
          statusClass: "status-moderation",
          participantsCount: 0,
          emailsSent: 0,
          views: 8,
        },
      ],
    };
  },
  methods: {
    editEvent(event) {
      this.isEditing = true;
      this.eventForm = { ...event };
      this.showCreateDialog = true;
    },
    duplicateEvent(event) {
      this.isEditing = false;
      this.eventForm = {
        ...event,
        id: null,
        title: event.title + " (копия)",
        status: "Черновик",
      };
      this.showCreateDialog = true;
    },
    deleteEvent(event) {
      console.log("Удаление события:", event.title);
      // Логика удаления
    },
    saveEvent() {
      console.log("Сохранение события:", this.eventForm);
      // Логика сохранения
      this.closeCreateDialog();
    },
    closeCreateDialog() {
      this.showCreateDialog = false;
      this.isEditing = false;
      this.resetForm();
    },
    resetForm() {
      this.eventForm = {
        title: "",
        competenceId: null,
        type: null,
        date: null,
        time: "",
        location: "",
        isOnline: false,
        description: "",
        emailSubject: "",
        emailBody:
          "<p>Добро пожаловать на наше событие!</p><p>Мы рады пригласить вас на мероприятие, которое состоится в указанную дату и время.</p><p>С уважением,<br>Команда организаторов</p>",
        sendDate: null,
        sendTime: "",
      };
    },
    resetFilters() {
      this.selectedCompetence = null;
      this.selectedStatus = null;
      this.selectedDate = null;
    },
  },
  computed: {
    filteredEvents() {
      let filtered = this.events;

      // Фильтр по компетенции
      if (this.selectedCompetence) {
        filtered = filtered.filter(
          (e) => e.competenceId === this.selectedCompetence,
        );
      }

      // Фильтр по статусу
      if (this.selectedStatus) {
        const statusMap = {
          published: "Опубликовано",
          moderation: "На модерации",
          draft: "Черновик",
          cancelled: "Отменено",
        };
        filtered = filtered.filter(
          (e) => e.status === statusMap[this.selectedStatus],
        );
      }

      // Фильтр по дате
      if (this.selectedDate) {
        // Логика фильтрации по дате
        // filtered = filtered.filter(e => e.date === this.selectedDate)
      }

      return filtered;
    },
  },
};
</script>

<style scoped>
.events-page {
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

.create-section {
  margin-bottom: 2rem;
}

.create-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.create-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
}

.create-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.create-content {
  padding: 1.5rem;
  text-align: center;
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
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
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

.event-competence {
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

.event-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: white;
  color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.status-published {
  background: white;
  color: #28a745;
  border: 1px solid #28a745;
}

.status-moderation {
  background: white;
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-draft {
  background: white;
  color: #6c757d;
  border: 1px solid #6c757d;
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

.event-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
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

.form-editor .p-editor-content {
  border: none;
}

.form-editor .p-editor-toolbar {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.5rem;
}

.form-editor .p-editor-toolbar .p-button {
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
}

.form-editor .p-editor-content .p-editor-container {
  border: none;
}

.form-editor .p-editor-content .p-editor-container .p-editor {
  border: none;
  min-height: 150px;
}

.form-editor .ql-tooltip.ql-editing .ql-tooltip-editor {
  font-family: "Inter", sans-serif;
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

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
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

  .form-editor .p-editor-content .p-editor-container .p-editor {
    min-height: 120px;
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

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .event-content {
    padding: 1rem;
  }

  .event-stats {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .form-editor {
    min-height: 120px;
  }

  .form-editor .p-editor-content .p-editor-container .p-editor {
    min-height: 100px;
  }

  .form-editor .p-editor-toolbar {
    padding: 0.25rem;
  }

  .form-editor .p-editor-toolbar .p-button {
    margin-right: 0.125rem;
    margin-bottom: 0.125rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
