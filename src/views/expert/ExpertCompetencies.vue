<template>
  <div class="competencies-page">
    <div class="page-header">
      <h1 class="page-title">
        Мои компетенции
      </h1>
      <p class="page-subtitle">
        Управление компетенциями и участниками
      </p>
    </div>

    <!-- Фильтры -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="ageFilter">Возрастная группа:</label>
        <MultiSelect
          id="ageFilter"
          v-model="selectedAge"
          :options="ageGroups"
          option-label="label"
          option-value="value"
          placeholder="Все возрасты"
          class="filter-dropdown"
        />
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

    <!-- Список компетенций -->
    <div class="competencies-grid">
      <div
        v-for="competence in filteredCompetencies"
        :key="competence.id"
        class="competence-card"
      >
        <div class="competence-header">
          <div class="competence-info">
            <h3 class="competence-name">
              {{ competence.name }}
            </h3>
            <div class="competence-ages-container">
              <span
                v-for="item in competence.ageCategories"
                :key="item.id"
                class="competence-age"
              >
                {{ ageGroups.find(group => group.value === item.ageCategory)?.label }}
              </span>
            </div>
            <div class="competence-description">
              {{
                competence.description.length > 30
                  ? competence.description.substring(0, 30) + "..."
                  : competence.description
              }}
            </div>
          </div>
        </div>

        <div class="competence-stats">
          <div class="stat-item">
            <div class="stat-number">
              {{ competence.participantsCount }}
            </div>
            <div class="stat-label">
              Участников
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-number">
              -
            </div>
            <div class="stat-label">
              Событий
            </div>
          </div>
        </div>

        <div class="competence-actions">
          <!--          <Button -->
          <!--            label="Участники" -->
          <!--            icon="pi pi-users"-->
          <!--            class="p-button-outlined"-->
          <!--            @click="goToParticipants(competence.id)"-->
          <!--          />-->
          <Button
            label="Документы"
            icon="pi pi-file-text"
            class="p-button-outlined"
            @click="goToDocuments(competence.id)"
          />
          <!--          <Button -->
          <!--            label="События" -->
          <!--            icon="pi pi-calendar"-->
          <!--            class="p-button-outlined"-->
          <!--            @click="goToEvents(competence.id)"-->
          <!--          />-->
          <Button
            label="Подробнее"
            icon="pi pi-eye"
            class="p-button-primary"
            @click="viewDetails(competence.id)"
          />
        </div>
      </div>
    </div>

    <!-- Диалог подробной информации -->
    <Dialog
      v-model:visible="showDetailsDialog"
      :header="selectedCompetence?.name || 'Компетенция'"
      :modal="true"
      :style="{ width: '800px' }"
    >
      <div
        v-if="selectedCompetence"
        class="competence-details"
      >
        <div class="detail-section">
          <h4>Описание компетенции</h4>
          <p>{{ selectedCompetence.description }}</p>
        </div>

        <div class="detail-section">
          <h4>Статистика</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">
                {{ selectedCompetence.participantsCount }}
              </div>
              <div class="stat-label">
                Участников
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                <span
                  v-for="item in selectedCompetence?.ageCategories"
                  :key="item.id"
                  class="competence-age"
                >
                  {{ ageGroups.find(group => group.value === item.ageCategory)?.label }}
                </span>
              </div>
              <div class="stat-label">
                лет
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ 0 }}
              </div>
              <div class="stat-label">
                Событий
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ selectedCompetence.documents.length }}
              </div>
              <div class="stat-label">
                Документов
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          label="Закрыть"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeDetails"
        />
        <!--        <Button -->
        <!--          label="Участники" -->
        <!--          icon="pi pi-users" -->
        <!--          class="p-button-primary"-->
        <!--          @click="goToParticipants(selectedCompetence?.id)"-->
        <!--        />-->
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import type { CompetenceOutputDto } from "@/api/resolvers/competence/dto/output/competence-output.dto.ts";
import {
  AgeCategories,
  CompetenceResolver,
} from "@/api/resolvers/competence/competence.resolver";
import { UserState } from "@/state/UserState";
import MultiSelect from 'primevue/multiselect';

export default {
  name: "ExpertCompetencies",
  components: {
    Button,
    MultiSelect,
    Dialog,
  },
  data() {
    return {
      selectedAge: [] as AgeCategories[],
      showDetailsDialog: false,
      selectedCompetence: undefined as CompetenceOutputDto | undefined,
      ageGroups: [
        { value: AgeCategories.EARLY_PRESCHOOL, label: "4-5 лет" },
        { value: AgeCategories.PRESCHOOL, label: "6-7 лет" },
        { value: AgeCategories.EARLY_SCHOOL, label: "7-8 лет" },
        { value: AgeCategories.SCHOOL, label: "9-11 лет" },
        { value: AgeCategories.HIGH_SCHOOL, label: "12-13 лет" },
      ],
      competencies: [] as CompetenceOutputDto[],
    };
  },
  computed: {
    filteredCompetencies() {
      let filtered = this.competencies;

      if (this.selectedAge.length > 0) {
        filtered = filtered.filter(
          (competence) => competence.ageCategories.filter(age => this.selectedAge?.includes(age.ageCategory)).length > 0
        );
      }
      console.log(this.selectedAge)

      return filtered;
    },
  },
  async mounted() {
    await this.loadCompetencies();
  },
  methods: {
    goToParticipants(competenceId: number) {
      this.$router.push(`/expert/participants/${competenceId}`);
    },
    goToDocuments(competenceId: number) {
      this.$router.push(`/expert/documents/${competenceId}`);
    },
    goToEvents(competenceId: number) {
      this.$router.push(`/expert/events${competenceId}`);
    },
    viewDetails(competenceId: number) {
      this.selectedCompetence = this.competencies.find(
        (c) => c.id === competenceId,
      );
      this.showDetailsDialog = true;
    },
    closeDetails() {
      this.showDetailsDialog = false;
      this.selectedCompetence = undefined;
    },
    resetFilters() {
      this.selectedAge = [];
    },
    async loadCompetencies() {
      const competenceResolver = new CompetenceResolver();
      const response = await competenceResolver.getAllByExpertId(UserState.id!);
      if (response.status === 200 && typeof response.message !== "string")
        this.competencies = response.message;
    },
  },
};
</script>

<style scoped>
.competencies-page {
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
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.competence-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease,
    transform 0.3s ease;
}

.competence-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
  transform: translateY(-2px);
}

.competence-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.competence-info {
  flex: 1;
}

.competence-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.competence-age {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.competence-description {
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
}

.competence-status {
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

.competence-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
}

.stat-item {
  text-align: center;
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

.competence-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  flex-wrap: wrap;
}

/* Диалог подробной информации */
.competence-details {
  padding: 1rem 0;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.detail-section p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.detail-section ul {
  color: #6c757d;
  padding-left: 1.5rem;
  margin: 0;
}

.detail-section li {
  margin-bottom: 0.5rem;
}

.program-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.program-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #ff9800;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.step-description {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .competencies-page {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
  }

  .competencies-grid {
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

  .competence-header {
    flex-direction: column;
    gap: 1rem;
  }

  .competence-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 1rem;
  }

  .competence-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .competencies-page {
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

  .competence-header {
    padding: 1rem;
  }

  .competence-name {
    font-size: 1.1rem;
  }

  .competence-stats {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .competence-actions {
    padding: 0.75rem 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
