<template>
  <div class="participants-page">
    <div class="page-header">
      <h1 class="page-title">
        Участники
      </h1>
      <p class="page-subtitle">
        Управление участниками и их родителями
      </p>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section">
      <div class="search-box">
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по имени или компетенции..."
          class="search-input"
        />
        <i class="pi pi-search search-icon" />
      </div>

      <div class="filter-buttons">
        <Button
          label="Все"
          :class="{ 'p-button-primary': activeFilter === 'all' }"
          @click="setFilter('all')"
        />
        <Button
          label="Активные"
          :class="{ 'p-button-primary': activeFilter === 'active' }"
          @click="setFilter('active')"
        />
        <Button
          label="Прошли во 2 этап"
          :class="{ 'p-button-primary': activeFilter === 'stage2' }"
          @click="setFilter('stage2')"
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
        <div class="card-header">
          <div class="participant-avatar">
            <i class="pi pi-user" />
          </div>
          <div class="participant-info">
            <h3 class="participant-name">
              {{ participant.name }}
            </h3>
            <div class="participant-status">
              <Tag
                :value="participant.status.text"
                :severity="participant.status.severity"
              />
            </div>
          </div>
          <div class="card-actions">
            <Button
              v-tooltip="'Редактировать'"
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              @click="editParticipant(participant)"
            />
            <Button
              v-tooltip="'Удалить'"
              icon="pi pi-times"
              class="p-button-text p-button-sm p-button-danger"
              @click="removeParticipant(participant)"
            />
          </div>
        </div>

        <div class="card-content">
          <!-- Информация о ребенке -->
          <div class="info-section">
            <h4 class="section-title">
              <i class="pi pi-user" />
              Информация о ребенке
            </h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Возраст:</span>
                <span class="info-value">{{ participant.age }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Класс:</span>
                <span class="info-value">{{ participant.grade }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Компетенция:</span>
                <span class="info-value">{{ participant.competence }}</span>
              </div>
            </div>
          </div>

          <!-- Информация о родителе -->
          <div class="info-section">
            <h4 class="section-title">
              <i class="pi pi-users" />
              Информация о родителе
            </h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">ФИО:</span>
                <span class="info-value">{{ participant.parent.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Телефон:</span>
                <span class="info-value">{{ participant.parent.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">{{ participant.parent.email }}</span>
              </div>
            </div>
          </div>

          <!-- Контакты главного эксперта -->
          <div class="info-section">
            <h4 class="section-title">
              <i class="pi pi-star" />
              Контакты главного эксперта
            </h4>
            <div class="mentor-info">
              <div class="Mentor-avatar">
                <i class="pi pi-user" />
              </div>
              <div class="Mentor-details">
                <div class="Mentor-name">
                  {{ participant.Mentor.name }}
                </div>
                <div class="Mentor-contacts">
                  <div class="contact-item">
                    <i class="pi pi-envelope" />
                    <span>{{ participant.Mentor.email }}</span>
                  </div>
                  <div class="contact-item">
                    <i class="pi pi-phone" />
                    <span>{{ participant.Mentor.phone }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Действия -->
          <div class="card-actions-bottom">
            <Button
              label="Связаться с родителем"
              icon="pi pi-envelope"
              class="p-button-outlined p-button-sm"
              @click="contactParent(participant)"
            />
            <Button
              label="Посмотреть прогресс"
              icon="pi pi-chart-line"
              class="p-button-outlined p-button-sm"
              @click="viewProgress(participant)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка добавления -->
    <div class="add-participant-section">
      <Button
        label="Добавить участника"
        icon="pi pi-user-plus"
        class="p-button-primary p-button-lg"
        @click="addParticipant"
      />
    </div>
  </div>
</template>

<script>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Tag from "primevue/tag";

export default {
  name: "MentorParticipants",
  components: {
    InputText,
    Button,
    Tag,
  },
  data() {
    return {
      searchQuery: "",
      activeFilter: "all",
      participants: [
        {
          id: 1,
          name: "Иванов Петр Антонович",
          age: "14 лет",
          grade: "8 класс",
          competence: "Веб-дизайн и разработка",
          status: {
            text: "Участник",
            severity: "info",
          },
          parent: {
            name: "Иванова Анна Петровна",
            phone: "+7 (999) 123-45-67",
            email: "anna.ivanova@email.com",
          },
          Mentor: {
            name: "Морозов Андрей Сергеевич",
            email: "a.morozov@mentor.ru",
            phone: "+7 (000) 555 66 77",
          },
        },
        {
          id: 2,
          name: "Петрова Анна Владимировна",
          age: "15 лет",
          grade: "9 класс",
          competence: "3D-моделирование",
          status: {
            text: "Прошла во 2 этап",
            severity: "success",
          },
          parent: {
            name: "Петров Владимир Иванович",
            phone: "+7 (999) 234-56-78",
            email: "v.petrov@email.com",
          },
          Mentor: {
            name: "Козлова Елена Михайловна",
            email: "e.kozlova@mentor.ru",
            phone: "+7 (000) 555 88 99",
          },
        },
        {
          id: 3,
          name: "Сидоров Максим Дмитриевич",
          age: "13 лет",
          grade: "7 класс",
          competence: "Программирование на Python",
          status: {
            text: "Активный",
            severity: "warning",
          },
          parent: {
            name: "Сидорова Ольга Николаевна",
            phone: "+7 (999) 345-67-89",
            email: "o.sidorova@email.com",
          },
          Mentor: {
            name: "Новиков Игорь Александрович",
            email: "i.novikov@mentor.ru",
            phone: "+7 (000) 555 11 22",
          },
        },
      ],
    };
  },
  computed: {
    filteredParticipants() {
      let filtered = this.participants;

      // Фильтр по статусу
      if (this.activeFilter === "active") {
        filtered = filtered.filter(
          (p) =>
            p.status.severity === "warning" || p.status.severity === "info",
        );
      } else if (this.activeFilter === "stage2") {
        filtered = filtered.filter((p) => p.status.severity === "success");
      }

      // Поиск
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.competence.toLowerCase().includes(query) ||
            p.parent.name.toLowerCase().includes(query),
        );
      }

      return filtered;
    },
  },
  methods: {
    setFilter(filter) {
      this.activeFilter = filter;
    },
    addParticipant() {
      console.log("Добавление участника");
    },
    editParticipant(participant) {
      console.log("Редактирование участника:", participant.name);
    },
    removeParticipant(participant) {
      console.log("Удаление участника:", participant.name);
    },
    contactParent(participant) {
      console.log("Связь с родителем:", participant.parent.name);
    },
    viewProgress(participant) {
      console.log("Просмотр прогресса:", participant.name);
    },
  },
};
</script>

<style scoped>
.participants-page {
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

/* Фильтры */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
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
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Сетка участников */
.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

.card-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.participant-avatar {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.participant-info {
  flex: 1;
}

.participant-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.participant-status {
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.card-content {
  padding: 1.5rem;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #6c757d;
  font-weight: 500;
  min-width: 100px;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

/* Информация об эксперте */
.Mentor-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.Mentor-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.Mentor-details {
  flex: 1;
}

.Mentor-name {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.Mentor-contacts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.contact-item i {
  color: #ff9800;
  width: 16px;
}

/* Действия */
.card-actions-bottom {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f3f4;
}

.add-participant-section {
  text-align: center;
  padding: 2rem 0;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .participants-page {
    padding: 0 1rem;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .search-box {
    max-width: none;
  }

  .filter-buttons {
    justify-content: center;
  }

  .participants-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card-header {
    padding: 0.75rem;
  }

  .participant-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .participant-name {
    font-size: 1rem;
  }

  .card-content {
    padding: 1rem;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-value {
    text-align: left;
  }

  .Mentor-info {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .card-actions-bottom {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .participants-page {
    padding: 0 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .participants-grid {
    gap: 0.75rem;
  }

  .card-header {
    padding: 0.5rem;
  }

  .participant-avatar {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }

  .participant-name {
    font-size: 0.9rem;
  }

  .card-content {
    padding: 0.75rem;
  }

  .section-title {
    font-size: 0.9rem;
  }

  .info-label {
    font-size: 0.85rem;
    min-width: 80px;
  }

  .info-value {
    font-size: 0.9rem;
  }

  .Mentor-info {
    padding: 0.75rem;
  }

  .Mentor-avatar {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }

  .Mentor-name {
    font-size: 0.9rem;
  }

  .contact-item {
    font-size: 0.8rem;
  }
}
</style>
