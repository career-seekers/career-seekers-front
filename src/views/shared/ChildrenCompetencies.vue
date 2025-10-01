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
          icon="pi pi-save"
          :loading="loading"
          @click="assignToCompetencies"
        />
      </div>
    </div>
    <div class="filters-section">
      <div class="filter-group">
        <Dropdown
          v-model="selectedCompetence"
          :options="agedCompetencies"
          dropdown
          option-label="name"
          placeholder="Все компетенции"
          class="filter-dropdown"
          :disabled="competencies.length === 0"
          @change="filterCompetencies"
        />
        <Dropdown
          id="ageFilter"
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
        <Button
          class="p-button-outlined save-btn"
          label="Сбросить компетенцию"
          icon="pi pi-refresh"
          @click="resetFilters"
        />
      </div>
    </div>

    <div class="competencies-grid">
      <div
        v-for="competence in filteredCompetencies"
        :key="competence.id"
        class="competence-card"
        :class="{
          selected: isSelected(competence.id),
          disabled:
            !isSelected(competence.id) &&
            getSelectedCompetencies().length >= 3,
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
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
  import { useUserStore } from '@/stores/userStore.ts';
  import CompetenceDialog from '@/views/shared/CompetenceDialog.vue';
  import { FormatManager } from '@/utils/FormatManager.ts';
  import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
  import router from '@/router';
  import { Roles } from '@/state/UserState.types.ts';
  import AutoComplete from 'primevue/autocomplete';

  export default {
    name: "ChildrenCompetencies",
    components: {
      CompetenceDialog,
      Button,
      Dropdown
    },
    data() {
      return {
        showDetailsDialog: false,
        selectedCompetence: null as CompetenceOutputDto | null,
        selectedChild: null as ChildOutputDto | null,

        competencies: [] as CompetenceOutputDto[],
        filteredCompetencies: [] as CompetenceOutputDto[],
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

        childCompetenciesResolver: new ChildCompetenciesResolver(),

        needToSave: false,
        loading: false,
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
        return FormatManager.getAgeGroupByAge(
          FormatManager.calculateAge(this.selectedChild.dateOfBirth),
          this.selectedChild.childDocuments.learningClass
        )
      },
      agedCompetencies() {
        const competencies = [...this.competencies]
        return competencies.filter(competence => competence.ageCategories
          .some(category => category.ageCategory === this.selectedAgeCategory?.value)
        ).sort((a, b) => a.name.localeCompare(b.name))
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
      resetFilters() {
        this.selectedCompetence = null
        this.filterCompetencies()
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
      filterCompetencies() {
        this.filteredCompetencies = this.selectedCompetence !== null
          ? this.agedCompetencies.filter(competence => competence.name === this.selectedCompetence?.name)
          : this.agedCompetencies
      },
      assignedOutput(arr: {
        child: ChildOutputDto,
        competencies: {
          competenceId: number;
          ageCategoryId: number;
          id: number;
        }[]
      }[]) {
        return arr.map(assign => {
          return {
            childId: assign.child.id,
            competencies: assign.competencies.map((competence) => {
              return {
                id: competence.id,
                competenceId: competence.competenceId,
                ageCategoryId: competence.ageCategoryId
              }
            })
          }
        })
      },
      getSelectedCompetencies() {
        return this.assignedCompetencies.find(assign =>
          JSON.stringify(assign.child) === JSON.stringify(this.selectedChild))?.competencies ?? []
      },
      async loadCompetencies() {
        const response = await this.competenceResolver.getAll()
        this.competencies = []
        if (typeof response.message === "string" || response.status !== 200) return
        this.competencies = response.message
        this.filterCompetencies({ query: "" })
      },
      isSelected(competenceId: number) {
        return this.getSelectedCompetencies()
          ?.find(comp => comp.competenceId === competenceId)
      },
      toggleCompetence(competence: CompetenceOutputDto) {
        if (this.selectedChildIndex < 0 ||
          this.selectedChild === null) return
        const competencies = this.assignedCompetencies[this.selectedChildIndex].competencies
        if (this.isSelected(competence.id)) {
          this.assignedCompetencies[this.selectedChildIndex] = {
            child: this.selectedChild,
            competencies: competencies.filter(comp => comp.competenceId !== competence.id)
          }
        } else if (this.getSelectedCompetencies().length < 3) {
          const ageCategoryId = competence.ageCategories
            .find(category => category.ageCategory === this.selectedAgeCategory?.value)?.id
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
        this.loading = true
        for (const assign of this.assignedCompetenciesCopy) {
          for (const relation of assign.competencies) {
            await this.childCompetenciesResolver.deleteById(relation.id)
          }
        }
        for (const assign of this.assignedCompetencies) {
          for (const relation of assign.competencies) {
            const response = await this.childCompetenciesResolver.create({
              childId: assign.child.id,
              directionId: relation.competenceId,
              directionAgeCategoryId: relation.ageCategoryId
            })
            if (typeof response.message !== "string" && response.status === 200) {
              relation.id = response.message.id
            }
          }
        }
        this.assignedCompetenciesCopy = [...this.assignedCompetencies]
        this.loading = false
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


  /* Мобильные стили */
  @media (max-width: 768px) {
    .competencies-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .filter-group {
      flex-direction: column;
    }

    .page-title {
      font-size: 1.5rem;
    }
  }
</style>
