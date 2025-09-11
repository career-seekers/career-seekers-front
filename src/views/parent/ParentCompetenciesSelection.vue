<template>
  <div class="competencies-selection">
    <div class="page-header">
      <h1 class="page-title">Выбор компетенций</h1>
      <p class="page-subtitle">
        Выберите до 3 компетенций, подходящих по возрасту вашего ребенка
      </p>
      <div class="selection-info">
        <span class="selection-counter">
          Выбрано: {{ selectedCompetencies.length }}/3
        </span>
        <div v-if="selectedCompetencies.length >= 3" class="selection-limit">
          <i class="pi pi-info-circle"></i>
          <span>Достигнут лимит выбора компетенций</span>
        </div>
      </div>
    </div>

    <div class="competencies-grid">
      <div
        v-for="competence in competencies"
        :key="competence.id"
        class="competence-card"
        :class="{
          selected: isSelected(competence.id),
          disabled:
            !isSelected(competence.id) && selectedCompetencies.length >= 3,
        }"
        @click="toggleCompetence(competence)"
      >
        <div class="card-header">
          <div class="competence-icon">
            <i :class="competence.icon"></i>
          </div>
          <div class="selection-indicator" v-if="isSelected(competence.id)">
            <i class="pi pi-check"></i>
          </div>
        </div>

        <div class="card-content">
          <h3 class="competence-title">{{ competence.name }}</h3>
          <p class="competence-description">
            {{ competence.shortDescription }}
          </p>
          <div class="competence-meta">
            <span class="age-range">
              <i class="pi pi-calendar"></i>
              {{ competence.ageRange }}
            </span>
            <span class="duration">
              <i class="pi pi-clock"></i>
              {{ competence.duration }}
            </span>
          </div>
        </div>

        <div class="card-footer">
          <Button
            label="Подробнее"
            icon="pi pi-info-circle"
            class="p-button-text p-button-sm"
            @click.stop="showCompetenceDetails(competence)"
          />
        </div>
      </div>
    </div>

    <div class="selection-actions">
      <Button
        label="Сохранить выбор"
        icon="pi pi-save"
        class="p-button-primary p-button-lg"
        :disabled="selectedCompetencies.length === 0"
        @click="saveSelection"
      />
    </div>

    <!-- Диалог с подробной информацией о компетенции -->
    <Dialog
      v-model:visible="showDetailsDialog"
      :header="selectedCompetence?.name"
      modal
      :style="{ width: '90vw', maxWidth: '500px' }"
      class="competence-dialog"
    >
      <div v-if="selectedCompetence" class="competence-details">
        <div class="details-header">
          <div class="competence-image">
            <img
              :src="selectedCompetence.image"
              :alt="selectedCompetence.name"
            />
          </div>
          <div class="details-meta">
            <div class="meta-item">
              <i class="pi pi-calendar"></i>
              <span>Возраст: {{ selectedCompetence.ageRange }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-clock"></i>
              <span>Длительность: {{ selectedCompetence.duration }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-users"></i>
              <span>Формат: {{ selectedCompetence.format }}</span>
            </div>
          </div>
        </div>

        <div class="details-content">
          <h4>Описание</h4>
          <p>{{ selectedCompetence.description }}</p>

          <h4>Навыки и компетенции</h4>
          <ul class="skills-list">
            <li v-for="skill in selectedCompetence.skills" :key="skill">
              {{ skill }}
            </li>
          </ul>

          <h4>Контакты главного эксперта</h4>
          <div class="mentor-contacts">
            <div class="contact-item">
              <i class="pi pi-user"></i>
              <span>{{ selectedCompetence.mentor.name }}</span>
            </div>
            <div class="contact-item">
              <i class="pi pi-envelope"></i>
              <span>{{ selectedCompetence.mentor.email }}</span>
            </div>
            <div class="contact-item">
              <i class="pi pi-phone"></i>
              <span>{{ selectedCompetence.mentor.phone }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Button from "primevue/button";
import Dialog from "primevue/dialog";

export default {
  name: "ParentCompetenciesSelection",
  components: {
    Button,
    Dialog,
  },
  data() {
    return {
      selectedCompetencies: [],
      showDetailsDialog: false,
      selectedCompetence: null,
      competencies: [
        {
          id: 1,
          name: "Веб-дизайн и разработка",
          shortDescription: "Создание современных веб-сайтов и приложений",
          description:
            "Компетенция включает в себя создание пользовательских интерфейсов, верстку, программирование на современных технологиях и оптимизацию веб-приложений.",
          ageRange: "14-16 лет",
          duration: "2 дня",
          format: "Индивидуальное",
          icon: "pi pi-desktop",
          image: "/api/placeholder/400/200",
          skills: [
            "HTML/CSS",
            "JavaScript",
            "Responsive Design",
            "UI/UX Design",
            "Frameworks (React, Vue)",
          ],
          mentor: {
            name: "Петров Иван Сергеевич",
            email: "i.petrov@mentor.ru",
            phone: "+7 (999) 111-22-33",
          },
        },
        {
          id: 2,
          name: "Мобильная разработка",
          shortDescription: "Разработка мобильных приложений для iOS и Android",
          description:
            "Создание нативных и кроссплатформенных мобильных приложений с использованием современных технологий и фреймворков.",
          ageRange: "16-18 лет",
          duration: "3 дня",
          format: "Командное",
          icon: "pi pi-mobile",
          image: "/api/placeholder/400/200",
          skills: [
            "Swift/Kotlin",
            "React Native",
            "Flutter",
            "Mobile UI/UX",
            "API Integration",
          ],
          mentor: {
            name: "Сидорова Мария Александровна",
            email: "m.sidorova@mentor.ru",
            phone: "+7 (999) 222-33-44",
          },
        },
        {
          id: 3,
          name: "Кибербезопасность",
          shortDescription: "Защита информационных систем и данных",
          description:
            "Изучение методов защиты информации, выявление уязвимостей и создание безопасных систем.",
          ageRange: "16-18 лет",
          duration: "2 дня",
          format: "Индивидуальное",
          icon: "pi pi-shield",
          image: "/api/placeholder/400/200",
          skills: [
            "Network Security",
            "Penetration Testing",
            "Cryptography",
            "Incident Response",
            "Security Auditing",
          ],
          mentor: {
            name: "Козлов Дмитрий Владимирович",
            email: "d.kozlov@mentor.ru",
            phone: "+7 (999) 333-44-55",
          },
        },
        {
          id: 4,
          name: "Искусственный интеллект",
          shortDescription: "Разработка AI-решений и машинное обучение",
          description:
            "Создание интеллектуальных систем, работа с данными и алгоритмами машинного обучения.",
          ageRange: "16-18 лет",
          duration: "3 дня",
          format: "Командное",
          icon: "pi pi-cog",
          image: "/api/placeholder/400/200",
          skills: [
            "Python",
            "Machine Learning",
            "Neural Networks",
            "Data Analysis",
            "TensorFlow/PyTorch",
          ],
          mentor: {
            name: "Новикова Елена Игоревна",
            email: "e.novikova@mentor.ru",
            phone: "+7 (999) 444-55-66",
          },
        },
        {
          id: 5,
          name: "3D-моделирование",
          shortDescription: "Создание трехмерных моделей и анимации",
          description:
            "Работа с 3D-графикой, создание моделей, текстур и анимации для различных областей применения.",
          ageRange: "14-16 лет",
          duration: "2 дня",
          format: "Индивидуальное",
          icon: "pi pi-box",
          image: "/api/placeholder/400/200",
          skills: ["Blender", "3ds Max", "Maya", "Texturing", "Animation"],
          mentor: {
            name: "Морозов Андрей Петрович",
            email: "a.morozov@mentor.ru",
            phone: "+7 (999) 555-66-77",
          },
        },
        {
          id: 6,
          name: "Робототехника",
          shortDescription: "Создание и программирование роботов",
          description:
            "Разработка роботизированных систем, программирование микроконтроллеров и создание автоматизированных решений.",
          ageRange: "12-16 лет",
          duration: "2 дня",
          format: "Командное",
          icon: "pi pi-cog",
          image: "/api/placeholder/400/200",
          skills: [
            "Arduino",
            "Raspberry Pi",
            "C++",
            "Electronics",
            "Mechanics",
          ],
          mentor: {
            name: "Волков Сергей Николаевич",
            email: "s.volkov@mentor.ru",
            phone: "+7 (999) 666-77-88",
          },
        },
      ],
    };
  },
  methods: {
    isSelected(competenceId) {
      return this.selectedCompetencies.some((c) => c.id === competenceId);
    },

    toggleCompetence(competence) {
      if (this.isSelected(competence.id)) {
        // Убираем из выбранных
        this.selectedCompetencies = this.selectedCompetencies.filter(
          (c) => c.id !== competence.id,
        );
      } else if (this.selectedCompetencies.length < 3) {
        // Добавляем к выбранным
        this.selectedCompetencies.push(competence);
      }
    },

    showCompetenceDetails(competence) {
      this.selectedCompetence = competence;
      this.showDetailsDialog = true;
    },

    saveSelection() {
      if (this.selectedCompetencies.length === 0) {
        return;
      }

      // Сохраняем выбор (здесь будет API вызов)
      console.log(
        "Сохранение выбранных компетенций:",
        this.selectedCompetencies,
      );

      // Показываем уведомление об успехе
      this.$toast.add({
        severity: "success",
        summary: "Успешно",
        detail: `Выбрано ${this.selectedCompetencies.length} компетенций`,
        life: 3000,
      });

      // Переходим к странице "Мои компетенции"
      this.$router.push("/parent/my-competencies");
    },
  },
};
</script>

<style scoped>
.competencies-selection {
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
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.selection-counter {
  background: #ff9800;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.selection-limit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e74c3c;
  font-size: 0.9rem;
  font-weight: 500;
}

.competencies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.competence-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.competence-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.competence-card.selected {
  border: 2px solid #ff9800;
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
}

.competence-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.selection-indicator {
  width: 30px;
  height: 30px;
  background: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.card-content {
  padding: 1.5rem;
}

.competence-title {
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.competence-description {
  color: #6c757d;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.competence-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.age-range,
.duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
}

.age-range i,
.duration i {
  color: #ff9800;
}

.card-footer {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.selection-actions {
  text-align: center;
  padding: 2rem 0;
}

.competence-details {
  max-height: 70vh;
  overflow-y: auto;
}

.details-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.competence-image {
  flex-shrink: 0;
}

.competence-image img {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.details-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
}

.meta-item i {
  color: #ff9800;
  width: 16px;
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

.mentor-contacts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
}

.contact-item i {
  color: #ff9800;
  width: 16px;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .competencies-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .selection-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .details-header {
    flex-direction: column;
  }

  .competence-image img {
    width: 100%;
    height: 150px;
  }
}
</style>
