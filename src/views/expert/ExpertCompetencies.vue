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
          placeholder="Все возраста"
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


    <div v-if="isLoading">
      <ProgressSpinner style="width: 100%; height: 5rem; margin-top: 5rem" />
    </div>
    <!-- Список компетенций -->
    <CompetenciesList
      v-else-if="filteredCompetencies.length > 0"
      :competencies="filteredCompetencies"
      @open-competence="(competenceId) => viewDetails(competenceId)"
    />
    <div v-else>
      <p>Компетенции не найдены</p>
    </div>

    <!-- Диалог подробной информации -->
    <CompetenceDetailsDialog
      v-if="selectedCompetence"
      :selected-competence-prop="selectedCompetence"
      :show-details-dialog-prop="showDetailsDialog"
      @update:show-details-dialog="(val) => showDetailsDialog = val"
    />
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import type { CompetenceOutputDto } from "@/api/resolvers/competence/dto/output/competence-output.dto.ts";
import {
  CompetenceResolver,
} from "@/api/resolvers/competence/competence.resolver";
import MultiSelect from 'primevue/multiselect';
import { useUserStore } from '@/stores/userStore.ts';
import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
import ProgressSpinner from 'primevue/progressspinner';
import CompetenceDetailsDialog from '@/components/dialogs/CompetenceDetailsDialog.vue';
import CompetenciesList from '@/components/CompetenciesList.vue';
import { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';

export default {
  name: "ExpertCompetencies",
  components: {
    CompetenciesList,
    CompetenceDetailsDialog,
    Button,
    MultiSelect,
    ProgressSpinner
  },
  data() {
    return {
      user: useUserStore().user,
      selectedAge: [] as AgeCategories[],
      showDetailsDialog: false,
      selectedCompetence: undefined as CompetenceOutputDto | undefined,
      ageGroups: useAgeGroups,
      isLoading: false,
      competencies: [] as CompetenceOutputDto[],
    };
  },
  computed: {
    filteredCompetencies() {
      let filtered = this.competencies;

      if (this.selectedAge.length > 0) {
        filtered = filtered.filter(
          (competence) => competence.ageCategories.some(age => this.selectedAge?.includes(age.ageCategory)));
      }

      return filtered;
    },
  },
  async beforeMount() {
    await this.loadCompetencies();
  },
  methods: {
    viewDetails(competenceId: number) {
      this.selectedCompetence = this.competencies.find(
        (c) => c.id === competenceId,
      );
      this.showDetailsDialog = true;
    },
    resetFilters() {
      this.selectedAge = [];
    },
    async loadCompetencies() {
      this.isLoading = true
      if (this.user !== null) {
        const competenceResolver = new CompetenceResolver();
        const response = await competenceResolver.getAllByExpertId(this.user.id);
        if (response.status === 200 && typeof response.message !== "string")
          this.competencies = response.message;
      }
      this.isLoading = false
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

/* Мобильные стили */
@media (max-width: 768px) {
  .competencies-page {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
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
}
</style>
