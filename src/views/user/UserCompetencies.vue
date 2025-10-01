<template>
  <div
    v-if="selectedChildCompetencies && children !== null"
    class="competencies-selection"
  >
    <div class="page-header">
      <h1 class="page-title">
        Выбор компетенций
      </h1>
      <p class="page-subtitle">
        Выберите до 3 компетенций, подходящих по возрасту вашего ребенка
      </p>
      <div class="selection-info">
        <span class="selection-counter">
          Выбрано: {{ selectedChildCompetencies.competencies.length }}/3
        </span>
        <div
          v-if="selectedChildCompetencies.competencies.length >= 3"
          class="selection-limit"
        >
          <i class="pi pi-info-circle" />
          <span>Достигнут лимит выбора компетенций</span>
        </div>
        <Button
          class="p-button save-btn"
          label="Сохранить"
          icon="pi pi-save"
          :disabled="!needToSave || selectedChildAssignedCompetenciesTemp.length > 0"
          @click="assignToCompetencies"
        />
      </div>
    </div>
    <div class="filters-section">
      <div class="filter-group">
        <label for="childFilter">Выберите ребёнка:</label>
        <Dropdown
          id="childFilter"
          v-model="selectedChild"
          :options="children"
          class="filter-dropdown"
          @change="loadCompetencies"
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
        <label for="searchInput">Поиск компетенций:</label>
        <InputText
          id="searchInput"
          v-model="searchQuery"
          placeholder="Введите название или описание..."
          class="search-input"
          @input="filterCompetencies"
        />
      </div>
      
      <div class="filter-group">
        <Button
          label="Сбросить фильтры"
          icon="pi pi-refresh"
          class="p-button-text p-button-sm reset-btn"
          @click="resetFilters"
        />
      </div>
    </div>

    <div class="competencies-grid">
      <TransitionGroup name="competence-card" tag="div" class="competencies-grid">
        <div
          v-for="competence in paginatedCompetencies"
          :key="competence.id"
          class="competence-card"
          :class="{
            selected: isSelected(competence.id),
            disabled:
              !isSelected(competence.id) && selectedChildCompetencies.competencies.length >= 3,
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
            {{ competence.description.length > 150
              ? competence.description.substring(0, 120) + "..."
              : competence.description
            }}
          </p>
          <div class="competence-meta">
            <span class="age-range">
              <i class="pi pi-calendar" />
              {{ competenceAgeCategories(competence) }}
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
      </TransitionGroup>
    </div>
    
    <!-- Пагинация -->
    <div v-if="totalPages > 1" class="pagination-section">
      <div class="pagination-info">
        Показано {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredCompetencies.length) }} из {{ filteredCompetencies.length }} компетенций
      </div>
      <div class="pagination-controls">
        <Button
          label="Предыдущая"
          icon="pi pi-angle-left"
          class="p-button-outlined p-button-sm"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        />
        
        <div class="page-numbers">
          <Button
            v-for="page in visiblePages"
            :key="page"
            :label="page.toString()"
            :class="{
              'p-button': page === currentPage,
              'p-button-outlined': page !== currentPage
            }"
            class="p-button-sm page-btn"
            @click="goToPage(page)"
          />
        </div>
        
        <Button
          label="Следующая"
          icon="pi pi-angle-right"
          icon-pos="right"
          class="p-button-outlined p-button-sm"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        />
      </div>
    </div>
    
    <CompetenceDialog
      v-if="selectedCompetence !== null"
      :selected-competence-prop="selectedCompetence"
      :show-details-dialog-prop="showDetailsDialog"
      @update:show-details-dialog="(show) => showDetailsDialog = show"
    />
  </div>
</template>

<script lang="ts">
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import InputText from 'primevue/inputtext';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
  import { useUserStore } from '@/stores/userStore.ts';
  import CompetenceDialog from '@/views/shared/CompetenceDialog.vue';
  import { FormatManager } from '@/utils/FormatManager.ts';
  import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
  import type {
    ChildCompetenciesOutputDto
  } from '@/api/resolvers/childCompetencies/dto/output/child-competencies-output.dto.ts';
  import router from '@/router';

  export default {
    name: "UserCompetencies",
    components: {
      CompetenceDialog,
      Button,
      Dropdown,
      InputText
    },
    data: function() {
      return {
        showDetailsDialog: false,
        selectedCompetencies: [] as {
          child: ChildOutputDto,
          competencies: CompetenceOutputDto[]
        }[],
        selectedCompetence: null as CompetenceOutputDto | null,
        selectedChild: null as ChildOutputDto | null,

        selectedChildAssignedCompetenciesTemp: [] as ChildCompetenciesOutputDto[],
        selectedChildAssignedCompetencies: [] as ChildCompetenciesOutputDto[],

        competencies: [] as CompetenceOutputDto[],
        competenceResolver: new CompetenceResolver(),
        ageGroups: useAgeGroups,
        userStore: useUserStore(),

        children: null as ChildOutputDto[] | null,
        childCompetenciesResolver: new ChildCompetenciesResolver(),

        needToSave: false,
        
        // Поиск и фильтрация
        searchQuery: '',
        filteredCompetencies: [] as CompetenceOutputDto[],
        
        // Пагинация
        currentPage: 1,
        itemsPerPage: 9,
      };
    },
    computed: {
      selectedChildCompetencies() {
        return this.selectedCompetencies.find(row => row.child.id === this.selectedChild?.id)
      },
      
      // Пагинация
      totalPages() {
        return Math.ceil(this.filteredCompetencies.length / this.itemsPerPage);
      },
      
      paginatedCompetencies() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredCompetencies.slice(start, end);
      },
      
      visiblePages() {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(this.totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
          start = Math.max(1, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        return pages;
      }
    },
    watch: {
      selectedChild() {
        this.loadCompetenciesByChild()
      },
      selectedChildCompetencies(newVal, oldVal) {
        if (JSON.stringify(newVal) != JSON.stringify(oldVal) && oldVal !== undefined) {
          this.needToSave = true
        }
      }
    },
    async beforeMount() {
      if (this.userStore.user === null) return
      if (this.userStore.user.children.length === 0) {
        await router.push("/")
        return
      }
      this.selectedChild = this.userStore.user.children[0]
      this.children = this.userStore.user.children
      this.children?.forEach(child => {
        this.selectedCompetencies.push({
          child: child,
          competencies: []
        });
      })
      await this.loadCompetencies()
    },
    methods: {
      async loadCompetencies() {
        this.competencies = []
        if (this.selectedChild === null) return
        const ageCategory = FormatManager.getAgeGroupByAge(
          FormatManager.calculateAge(this.selectedChild.dateOfBirth), this.selectedChild?.childDocuments!.learningClass
        )
        if (!ageCategory) return
        const response = await this.competenceResolver.getByAgeCategory(ageCategory.value)
        if (typeof response.message === 'string' || response.status !== 200) return
        this.competencies = response.message
        this.filterCompetencies()
      },
      async loadCompetenciesByChild() {
        if (this.selectedChild === null) return
        const response = await this.childCompetenciesResolver.getByChildId(this.selectedChild.id)
        if (typeof response.message === "string" || response.status !== 200) return
        this.selectedChildAssignedCompetencies = response.message
        this.selectedChildAssignedCompetenciesTemp = response.message
      },
      isSelected(competenceId: number) {
        return this.selectedCompetencies
          .find(row => row.child.id === this.selectedChild?.id)?.competencies
          .some(competence => competence.id === competenceId)
          || this.selectedChildAssignedCompetencies.some(competence => competence.direction.id === competenceId)
      },
      toggleCompetence(competence: CompetenceOutputDto) {
        if (this.selectedChild === null) return
        const childId = this.selectedChild.id
        const selectedChildRow = this.selectedCompetencies.find(row => row.child.id === childId)
        const noSelectedChildCompetencies = [...this.selectedCompetencies
          .filter(row => row.child.id !== childId)]
        if (!this.isSelected(competence.id) && selectedChildRow && selectedChildRow.competencies.length < 3) {
          const competencies = selectedChildRow
              ? selectedChildRow.competencies : []
          noSelectedChildCompetencies.push({
            child: this.selectedChild,
            competencies: [
              ...competencies,
              competence
            ]
          })
        } else {
          this.selectedChildAssignedCompetencies = [...this.selectedChildAssignedCompetencies
            .filter(comp => comp.direction.id !== competence.id)]
          noSelectedChildCompetencies.push({
            child: this.selectedChild,
            competencies: selectedChildRow
              ? selectedChildRow.competencies.filter(comp => comp.id !== competence.id)
              : []
          })
        }
        this.selectedCompetencies = noSelectedChildCompetencies
      },

      async showCompetenceDetails(competence: CompetenceOutputDto) {
        if (this.selectedCompetence !== competence) {
          this.selectedCompetence = competence;
        }
        this.showDetailsDialog = true;
      },
      competenceAgeCategories(competence: CompetenceOutputDto) {
        return competence.ageCategories.map(category => {
          return this.ageGroups.find(group => group.value === category.ageCategory)?.label
        }).join(", ")
      },
      async assignToCompetencies() {
        this.selectedCompetencies.map(async childCompetencies => {
          if (this.selectedChild === null) return
          const ageCategory = FormatManager.getAgeGroupByAge(
            FormatManager.calculateAge(childCompetencies.child.dateOfBirth),
            this.selectedChild.childDocuments!.learningClass
          )
          for (const competence of childCompetencies.competencies) {
            const ageCategoryId = competence.ageCategories
              .find(category => category.ageCategory === ageCategory?.value)?.id
            if (!ageCategoryId) return
            const response = await this.childCompetenciesResolver.create({
              childId: childCompetencies.child.id,
              directionId: competence.id,
              directionAgeCategoryId: ageCategoryId
            })
            if (response.status !== 200) console.log(response.message)
          }
        })
      },
      
      // Поиск и фильтрация
      filterCompetencies() {
        if (!this.searchQuery.trim()) {
          this.filteredCompetencies = [...this.competencies];
        } else {
          const query = this.searchQuery.toLowerCase();
          this.filteredCompetencies = this.competencies.filter(competence => 
            competence.name.toLowerCase().includes(query) ||
            competence.description.toLowerCase().includes(query)
          );
        }
        this.currentPage = 1; // Сброс на первую страницу при фильтрации
      },
      
      resetFilters() {
        this.searchQuery = '';
        this.filterCompetencies();
      },
      
      // Пагинация
      goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
        }
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

.save-btn {
  margin-left: auto;
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

.search-input {
  width: 100%;
}

.reset-btn {
  align-self: flex-end;
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
  display: flex;
  flex-direction: column;
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
.age-range i,
.duration i {
  color: #ff9800;
}

.card-footer {
  display: flex;
  margin-top: auto;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

/* Пагинация */
.pagination-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
  text-align: center;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  min-width: 40px;
  height: 40px;
}

/* Анимации для карточек */
.competence-card-enter-active,
.competence-card-leave-active {
  transition: all 0.3s ease;
}

.competence-card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.competence-card-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.competence-card-move {
  transition: transform 0.3s ease;
}

/* Анимация при фильтрации */
.competencies-grid {
  transition: all 0.3s ease;
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
  
  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-numbers {
    justify-content: center;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
}
</style>
