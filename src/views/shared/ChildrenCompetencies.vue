<template>
  <div
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
          Выбрано: {{ getSelectedCompetencies().length }}/3
        </span>
        <div
          v-if="getSelectedCompetencies().length >= 3"
          class="selection-limit"
        >
          <i class="pi pi-info-circle" />
          <span>Достигнут лимит выбора компетенций</span>
        </div>
        <Button
          class="p-button save-btn"
          label="Сохранить"
          :disabled="
            assignsToDelete(selectedChild!.id).length === 0 &&
              assignsToCreate(selectedChild!.id).length === 0
          "
          icon="pi pi-save"
          :loading="loading"
          @click="assignToCompetencies"
        />
      </div>
    </div>
    <div class="filters-section">
      <div class="filter-group">
        <div class="filter-item">
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

        <div class="filter-item">
          <label for="competenceFilter">Фильтр по компетенции:</label>
          <AutoComplete
            id="competenceFilter"
            v-model="selectedCompetence"
            :suggestions="filteredCompetenceOptions"
            dropdown
            field="name"
            placeholder="Все компетенции"
            class="filter-dropdown"
            :disabled="competencies.length === 0"
            @complete="filterCompetencies"
          />
        </div>
        
        <div class="filter-item">
          <Button
            class="p-button-outlined reset-btn"
            label="Сбросить фильтры"
            icon="pi pi-refresh"
            @click="resetFilters"
          />
        </div>
      </div>
    </div>

    <div
      v-if="paginatedCompetencies.length > 0"
      class="competencies-grid"
    >
      <TransitionGroup
        name="competence-card"
        tag="div"
      >
        <div
          v-for="competence in paginatedCompetencies"
          :key="competence.id"
          class="competence-card"
          :class="{
            selected: isSelected(competence.id),
            disabled:
              (!isSelected(competence.id) &&
                getSelectedCompetencies().length >= 3) ||
              isChildAgeCategoryDisabled(competence)
          }"
          @click="toggleCompetence(competence)"
        >
          <div
            v-if="isChildAgeCategoryDisabled(competence)"
            class="closed"
          >
            Запись закрыта
          </div>
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
              :disabled="isChildAgeCategoryDisabled(competence)"
              label="Подробнее"
              icon="pi pi-info-circle"
              class="p-button-text p-button-sm"
              @click.stop="showCompetenceDetails(competence)"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>

    <ProgressSpinner
      v-else-if="loading"
      style="width: 100%; height: 5rem; margin-top: 5rem;"
    />
    <div
      v-else
      class="not-found-block"
    >
      <p>Компетенции не найдены</p>
    </div>
    
    <!-- Пагинация -->
    <div
      v-if="totalPages > 1"
      class="pagination-section"
    >
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
    
    <CompetenceDetailsDialog
      v-if="selectedCompetenceDetails !== null"
      :selected-competence-prop="selectedCompetenceDetails"
      :show-details-dialog-prop="showDetailsDialog"
      @update:show-details-dialog="(show) => showDetailsDialog = show"
    />
    
    <!-- Toast уведомления -->
    <ToastPopup
      v-if="toastContent.title && toastContent.message"
      :content="toastContent"
    />
  </div>
</template>

<script lang="ts">
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
  import { useUserStore } from '@/stores/userStore.ts';
  import CompetenceDetailsDialog from '@/components/dialogs/CompetenceDetailsDialog.vue';
  import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
  import router from '@/router';
  import { Roles } from '@/state/UserState.types.ts';
  import AutoComplete from 'primevue/autocomplete';
  import ToastPopup from '@/components/ToastPopup.vue';
  import ProgressSpinner from 'primevue/progressspinner';

  export default {
    name: "ChildrenCompetencies",
    components: {
      CompetenceDetailsDialog,
      Button,
      Dropdown,
      AutoComplete,
      ToastPopup,
      ProgressSpinner
    },
    data() {
      return {
        showDetailsDialog: false,
        selectedCompetence: null as CompetenceOutputDto | null,
        selectedChild: null as ChildOutputDto | null,

        competencies: [] as CompetenceOutputDto[],
        filteredCompetenceOptions: [] as CompetenceOutputDto[],
        assignedCompetencies: [] as {
          child: ChildOutputDto,
          competencies: {
            competenceId: number;
            ageCategoryId: number;
            id: number;
          }[]
        }[],
        assignedCompetenciesCopy: [] as {
          child: ChildOutputDto,
          competencies: {
            competenceId: number;
            ageCategoryId: number;
            id: number;
          }[]
        }[],
        competenceResolver: new CompetenceResolver(),
        ageGroups: useAgeGroups,
        userStore: useUserStore(),

        selectedCompetenceDetails: null as CompetenceOutputDto | null,
        childCompetenciesResolver: new ChildCompetenciesResolver(),

        needToSave: false,
        loading: false,
        
        // Поиск и фильтрация
        searchQuery: '',

        // Пагинация
        currentPage: 1,
        itemsPerPage: 9,
        
        // Toast уведомления
        toastContent: {
          title: '',
          message: ''
        },
      };
    },
    computed: {
      children() {
        const user = this.userStore?.user
        if (user === null) return []
        if (user.role === Roles.USER) return user.children
        return user.menteeChildren
      },
      selectedChildIndex() {
        return this.assignedCompetencies.findIndex(assign =>
          JSON.stringify(assign.child) === JSON.stringify(this.selectedChild))
      },
      selectedAgeCategory() {
        if (this.selectedChild === null ||
          this.selectedChild.childDocuments === null) return undefined
        return this.selectedChild.childDocuments.ageCategory
      },
      filteredCompetencies() {
        const selectedCompetenceName = this.selectedCompetence?.name
        return selectedCompetenceName !== undefined
          ? [...this.filteredCompetenceOptions].filter(competence =>
            competence.name === selectedCompetenceName)
          : [...this.filteredCompetenceOptions]
      },
      agedCompetencies() {
        const competencies = [...this.competencies]
        return competencies.filter(competence => competence.ageCategories
          .some(category => category.ageCategory === this.selectedAgeCategory)
        ).sort((a, b) => a.name.localeCompare(b.name))
      },
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
      selectedCompetence() {
        this.filterCompetencies({ query: ""})
      }
    },
    async beforeMount() {
      if (this.userStore.user === null) return
      if (this.children.length === 0) {
        await router.push("/")
        return
      }
      await this.fillAssigned()
      await this.loadCompetencies()

    },
    methods: {
      assignsToDelete(childId: number) {
        const selectedChildAssigns = this.assignedCompetencies
          .find(assign => assign.child.id === childId)
        const selectedChildAssignsCopy = this.assignedCompetenciesCopy
          .find(assign => assign.child.id === childId)

        return selectedChildAssignsCopy?.competencies
          .filter(competence => !selectedChildAssigns?.competencies
            .find(comp => comp.competenceId === competence.competenceId)
          ) || []
      },
      assignsToCreate(childId: number) {
        const selectedChildAssigns = this.assignedCompetencies
          .find(assign => assign.child.id === childId)
        const selectedChildAssignsCopy = this.assignedCompetenciesCopy
          .find(assign => assign.child.id === childId)

        return selectedChildAssigns?.competencies
          .filter(competence => !selectedChildAssignsCopy?.competencies
            .find(comp => comp.competenceId === competence.competenceId)
          ) || []
      },
      resetFilters() {
        this.selectedCompetence = null
        this.searchQuery = ''
        this.filterCompetencies({ query: ""})
      },
      isChildAgeCategoryDisabled(competence: CompetenceOutputDto) {
        return competence.ageCategories
          .find(category => category.ageCategory === this.selectedAgeCategory)?.isDisabled ?? false
      },
      async fillAssigned() {
        this.selectedChild = this.children[0]
        for (const child of this.children) {
          const response = await this.childCompetenciesResolver.getByChildId(child.id)
          this.assignedCompetenciesCopy.push({
            child: child,
            competencies: typeof response.message !== "string"
              ? response.message.map(childCompetence => {
                return {
                  ageCategoryId: childCompetence.directionAgeCategory.id,
                  competenceId: childCompetence.direction.id,
                  id: childCompetence.id
                }
              })
              : []
          })
          this.assignedCompetencies.push({
            child: child,
            competencies: typeof response.message !== "string"
              ? response.message.map(childCompetence => {
                return {
                  ageCategoryId: childCompetence.directionAgeCategory.id,
                  competenceId: childCompetence.direction.id,
                  id: childCompetence.id
                }
              })
              : []
          })
        }
      },
      filterCompetencies(event: { query: string }) {
        // Затем применяем поиск
        const query = event.query.length > 0
          ? event.query.toLowerCase()
          : this.selectedCompetence === null
            ? ""
            : this.selectedCompetence.name === undefined
              ? (this.selectedCompetence as unknown as string).toLowerCase()
              : ""
        const filtered = [...this.agedCompetencies].filter(competence =>
          competence.name.toLowerCase().includes(query)
        ).sort((a, b) => a.name.localeCompare(b.name));
        this.filteredCompetenceOptions = [...filtered];
        this.currentPage = 1; // Сброс на первую страницу при фильтрации
      },
      getSelectedCompetencies() {
        return this.assignedCompetencies.find(assign =>
          JSON.stringify(assign.child) === JSON.stringify(this.selectedChild))?.competencies ?? []
      },
      async loadCompetencies() {
        this.loading = true
        this.competencies = []
        const promises = this.children.map(child =>
          this.competenceResolver.getByAgeCategory(child!.childDocuments!.ageCategory)
        );
        const responses = await Promise.all(promises);
        for (const response of responses) {
          if (typeof response.message === "string" || response.status !== 200) continue
          this.competencies.push(...response.message
            .filter(competence => !this.competencies.some(comp => comp.id === competence.id))
          )
        }
        this.filterCompetencies({ query: "" })
        this.loading = false
      },
      isSelected(competenceId: number) {
        return this.getSelectedCompetencies()
          ?.find(comp => comp.competenceId === competenceId)
      },
      toggleCompetence(competence: CompetenceOutputDto) {
        if (this.selectedChildIndex < 0 || this.selectedChild === null ||
          competence.ageCategories
            .find(category => category.ageCategory === this.selectedAgeCategory)?.isDisabled
        ) return
        const competencies = this.assignedCompetencies[this.selectedChildIndex].competencies
        if (this.isSelected(competence.id)) {
          this.assignedCompetencies[this.selectedChildIndex] = {
            child: this.selectedChild,
            competencies: competencies.filter(comp => comp.competenceId !== competence.id)
          }
        } else if (this.getSelectedCompetencies().length < 3) {
          const ageCategoryId = competence.ageCategories
            .find(category => category.ageCategory === this.selectedAgeCategory)?.id
          if (!ageCategoryId) return
          this.assignedCompetencies[this.selectedChildIndex] = {
            child: this.selectedChild,
            competencies: [...competencies, {
              competenceId: competence.id,
              ageCategoryId: ageCategoryId,
              id: -1
            }]
          }
        }
      },

      async showCompetenceDetails(competence: CompetenceOutputDto) {
        if (this.selectedCompetenceDetails !== competence) {
          this.selectedCompetenceDetails = competence;
        }
        this.showDetailsDialog = true;
      },
      competenceAgeCategories(competence: CompetenceOutputDto) {
        return competence.ageCategories.map(category => {
          return this.ageGroups.find(group => group.value === category.ageCategory)?.label
        }).join(", ")
      },
      
      async assignToCompetencies() {
        this.loading = true
        try {
          for (const childAssign of this.assignedCompetencies) {
            for (const assign of this.assignsToDelete(childAssign.child.id)) {
              await this.childCompetenciesResolver.deleteById(assign.id)
            }
            const newAssigns = this.assignsToCreate(childAssign.child.id)
            if (newAssigns.length > 0) {
              for (const assign of newAssigns) {
                const response = await this.childCompetenciesResolver.create({
                  childId: childAssign.child.id,
                  directionId: assign.competenceId,
                  directionAgeCategoryId: assign.ageCategoryId
                })
                if (typeof response.message !== "string") {
                  const data = {
                    ageCategoryId: response.message.directionAgeCategory.id,
                    competenceId: response.message.direction.id,
                    id: response.message.id
                  }
                  const assign = this.assignedCompetencies.find(
                    a => a.child.id === childAssign.child.id
                  );
                  if (assign) {
                    const competence = assign.competencies.find(
                      c => c.competenceId === data.competenceId
                    );
                    if (competence) {
                      competence.id = data.id;
                    }
                  }
                  this.assignedCompetenciesCopy = [...this.assignedCompetencies]
                }
              }
            } else {
              const tempAssigns = [...this.assignedCompetencies]
              tempAssigns.forEach(assign => {
                assign.competencies.forEach(competence => {
                  competence.id = this.assignedCompetenciesCopy
                    .find(assignCopy => assignCopy.child.id === assign.child.id)
                    ?.competencies.find(competenceCopy => competenceCopy.competenceId === competence.competenceId)?.id ?? -1
                })
              })
              this.assignedCompetenciesCopy = [...tempAssigns]
            }
          }
          
          // Показываем уведомление об успешном сохранении
          this.toastContent = {
            title: 'Успешно сохранено',
            message: 'Компетенции успешно назначены ребёнку'
          };
        } catch (error) {
          // Показываем уведомление об ошибке
          this.toastContent = {
            title: 'Ошибка сохранения',
            message: 'Произошла ошибка при сохранении компетенций'
          };
        } finally {
          this.loading = false
        }
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
    gap: 1.5rem;
    min-width: 150px;
    flex-wrap: wrap;
    align-items: flex-end;
  }
  
  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 200px;
  }
  
  .reset-btn {
    align-self: flex-end;
    margin-bottom: 0;
  }


  .filter-group label {
    color: #2c3e50;
    font-weight: 500;
    font-size: 0.9rem;
  }


  .competencies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .not-found-block {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  /* Обеспечиваем правильную работу TransitionGroup с CSS Grid */
  .competencies-grid > div {
    display: contents;
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
    position: relative;
    transform: none;
    box-shadow: none;
    cursor: not-allowed;

    div {
      opacity: 0.6;
    }

    .closed {
      opacity: 1;
      position: absolute;
      right: 0;
      top: 0;
      padding: 2rem;
      color: #ff0000;
      font-weight: bold;
      z-index: 1;
    }
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

  /* Улучшенная анимация для CSS Grid */
  .competence-card {
    transition: all 0.3s ease;
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
    
    .competencies-grid > div {
      display: contents;
    }

    .filter-group {
      flex-direction: column;
      align-items: stretch;
    }
    
    .filter-item {
      min-width: auto;
    }
    
    .reset-btn {
      align-self: stretch;
      margin-top: 0.5rem;
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
  }
</style>
