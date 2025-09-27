<template>
  <div class="competencies-selection">
    <div class="page-header">
      <h1 class="page-title">
        Выбор компетенций
      </h1>
      <p class="page-subtitle">
        Выберите до 3 компетенций, подходящих по возрасту вашего ребенка
      </p>
      <div class="selection-info">
        <span class="selection-counter">
          Выбрано: {{ selectedCompetencies.length }}/3
        </span>
        <div
          v-if="selectedCompetencies.length >= 3"
          class="selection-limit"
        >
          <i class="pi pi-info-circle" />
          <span>Достигнут лимит выбора компетенций</span>
        </div>
      </div>
    </div>
    <div class="filters-section">
      <div class="filter-group">
        <Dropdown
          id="ageFilter"
          v-model="selectedChild"
          :options="children"
          class="filter-dropdown"
        >
          <template #option="slotProps">
            {{ slotProps.option.lastName }} {{ slotProps.option.firstName }}
            {{ slotProps.option.patronymic }}
          </template>
          <template #value="{ value }">
            {{
              value
                ? `${value.lastName} ${value.firstName} ${value.patronymic}`
                : "Ребёнок не выбран"
            }}
          </template>
        </Dropdown>
      </div>
      <div class="filter-group">
        <Button
          label="Сбросить фильтр"
          icon="pi pi-refresh"
          class="p-button-text p-button-sm"
          @click="resetFilters"
        />
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
            <i class="pi pi-briefcase" />
          </div>
          <div
            v-if="isSelected(competence.id)"
            class="selection-indicator"
          >
            <i class="pi pi-check" />
          </div>
        </div>

        <div class="card-content">
          <h3 class="competence-title">
            {{ competence.name }}
          </h3>
          <p class="competence-description">
            {{ competence.shortDescription }}
          </p>
          <div class="competence-meta">
            <span class="age-range">
              <i class="pi pi-calendar" />
              {{ competence.ageRange }}
            </span>
            <span class="duration">
              <i class="pi pi-clock" />
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
      <div
        v-if="selectedCompetence"
        class="competence-details"
      >
        <div class="details-header">
          <div class="competence-image">
            <img
              :src="selectedCompetence.image"
              :alt="selectedCompetence.name"
            >
          </div>
          <div class="details-meta">
            <div class="meta-item">
              <i class="pi pi-calendar" />
              <span>Возраст: {{ selectedCompetence.ageRange }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-clock" />
              <span>Длительность: {{ selectedCompetence.duration }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-users" />
              <span>Формат: {{ selectedCompetence.format }}</span>
            </div>
          </div>
        </div>

        <div class="details-content">
          <h4>Описание</h4>
          <p>{{ selectedCompetence.description }}</p>

          <h4>Навыки и компетенции</h4>
          <ul class="skills-list">
            <li
              v-for="skill in selectedCompetence.skills"
              :key="skill"
            >
              {{ skill }}
            </li>
          </ul>

          <h4>Контакты главного эксперта</h4>
          <div class="mentor-contacts">
            <div class="contact-item">
              <i class="pi pi-user" />
              <span>{{ competenceExpert(selectedCompetence.expertId).name }}</span>
            </div>
            <div class="contact-item">
              <i class="pi pi-envelope" />
              <span>{{ competenceExpert(selectedCompetence.expertId).email }}</span>
            </div>
            <div class="contact-item">
              <i class="pi pi-phone" />
              <span>{{ competenceExpert(selectedCompetence.expertId).phone }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts">
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import Dropdown from 'primevue/dropdown';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { AgeCategories, CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import type { ChildOutputDto } from '@/api/resolvers/user/dto/output/child-output.dto.ts';
  import { useUserStore } from '@/stores/userStore.ts';

  export default {
  name: "ParentCompetenciesSelection",
  components: {
    Button,
    Dialog,
    Dropdown
  },
  data: function() {
    return {
      showDetailsDialog: false,

      selectedCompetencies: [] as CompetenceOutputDto[],
      selectedCompetence: null as CompetenceOutputDto | null,
      selectedChild: null as ChildOutputDto | null,

      competencies: [] as CompetenceOutputDto[],
      competenceResolver: new CompetenceResolver(),
      ageGroups: useAgeGroups,
      userStore: useUserStore(),

      children: null as ChildOutputDto[] | null
    };
  },
  async beforeMount() {
    await this.loadCompetencies()
    if (this.userStore.user !== null)
      this.children = this.userStore.user.children
  },
  methods: {
    async loadCompetencies() {
      if (this.userStore.user === null) return
      this.selectedChild = this.userStore.user.children[0]
      const ageCategory = this.getAgeGroupByAge(
        this.calculateAge(this.selectedChild.dateOfBirth), this.selectedChild.isPupil
      )
      console.log(ageCategory)
      if (!ageCategory) return
      const response = await this.competenceResolver.getByAgeCategory(ageCategory.value)
      if (typeof response.message === 'string' || response.status !== 200) return
      this.competencies = response.message
    },
    resetFilters() {
      this.selectedChild = null
    },
    isSelected(competenceId: number) {
      return this.selectedCompetencies.some((c) => c.id === competenceId);
    },

    toggleCompetence(competence: CompetenceOutputDto) {
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

    showCompetenceDetails(competence: CompetenceOutputDto) {
      this.selectedCompetence = competence;
      this.showDetailsDialog = true;
    },

    saveSelection() {
      if (this.selectedCompetencies.length === 0) {
        return;
      }
    },
    calculateAge(birthDate: string) {
      const birth = new Date(birthDate.substring(0, 10));
      const onDate = new Date(2026, 1, 14)

      let age = onDate.getFullYear() - birth.getFullYear();
      let monthDiff = onDate.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && onDate.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    },
    getAgeGroupByAge(age: number, learningClass: number) {
      if (age === 7) {
        return this.ageGroups
          .find(group => learningClass > 0
            ? group.value === AgeCategories.EARLY_SCHOOL
            : group.value === AgeCategories.PRESCHOOL
          )
      }
      this.ageGroups.forEach(group => {
        const edges = group.label.split(" ")[0].split("-")
        const min = parseInt(edges[0]);
        const max = parseInt(edges[1]);
        if (min <= age && age <= max) return group.label
      })
    }
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

.filter-dropdown {
  width: 100%;
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
