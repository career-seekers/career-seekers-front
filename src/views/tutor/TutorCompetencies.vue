<template>
  <ToastPopup :content="errors.toastPopup" />
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
      <div
        class="filter-group"
        style="margin-left: auto"
      >
        <Button
          label="Добавить компетенцию"
          icon="pi pi-plus"
          class="p-button-primary right"
          @click="addCompetence"
        />
      </div>
    </div>

    <div
      v-if="isLoading"
    >
      <ProgressSpinner style="width: 100%; height: 5rem; margin-top: 5rem" />
    </div>
    <!-- Список компетенций -->
    <CompetenciesList
      v-else-if="filteredCompetencies.length > 0"
      :competencies="filteredCompetencies"
      @open-competence="(competenceId) => viewDetails(competenceId)"
      @edit-competence="(competence) => editCompetence(competence)"
      @delete-competence="(competence) => deleteCompetence(competence)"
      @toggle-competence="(competenceId, ageCategory) => refreshCompetence(competenceId, ageCategory)"
    />
    <div v-else>
      <p>Компетенции не найдены</p>
    </div>

    <!-- Диалог добавления/редактирования эксперта -->
    <Dialog
      v-model:visible="showAddCompetenceDialog"
      :header="isEditing ? 'Редактировать компетенцию' : 'Добавить компетенцию'"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="competence-form">
        <div class="form-field">
          <label for="name">Название *</label>
          <InputText
            id="name"
            v-model="competenceForm.name"
            placeholder="Введите название компетенции"
            :class="{ 'p-invalid': !competenceForm.name }"
          />
          <small
            v-if="errors.name"
            class="p-error"
          >{{ errors.name }}</small>
        </div>

        <div class="form-field">
          <label for="name">Описание *</label>
          <Textarea
            id="name"
            v-model="competenceForm.description"
            placeholder="Введите описание компетенции"
            :class="{ 'p-invalid': !competenceForm.description }"
          />
          <small
            v-if="errors.description"
            class="p-error"
          >{{
            errors.description
          }}</small>
        </div>

        <div class="form-field">
          <label
            for="competenceAgeFilter"
            class="field-label"
          >Возрастная категория *</label>
          <MultiSelect
            id="competenceAgeFilter"
            v-model="competenceForm.ageCategory"
            :options="ageGroups"
            option-label="label"
            option-value="value"
            placeholder="Все возраста"
            class="filter-dropdown"
            :class="{ 'p-invalid': !competenceForm.ageCategory || competenceForm.ageCategory.length === 0 }"
          />
          <small
            v-if="errors.ageCategory"
            class="p-error"
          >{{
            errors.ageCategory
          }}</small>
        </div>

        <div class="form-field">
          <label
            for="competenceExpertList"
            class="field-label"
          >Главный эксперт *</label>
          <Dropdown
            id="competenceExpertList"
            v-model="competenceForm.expert"
            :options="experts"
            placeholder="Не выбран"
            class="filter-dropdown"
            :class="{ 'p-invalid': !competenceForm.expert }"
          >
            <template #option="slotProps">
              {{ slotProps.option.lastName }} {{ slotProps.option.firstName }}
              {{ slotProps.option.patronymic }}
            </template>
            <template #value="{ value }">
              {{
                value
                  ? `${value.lastName} ${value.firstName} ${value.patronymic}`
                  : "Не выбран"
              }}
            </template>
          </Dropdown>
          <small
            v-if="errors.ageCategory"
            class="p-error"
          >{{
            errors.ageCategory
          }}</small>
        </div>
      </div>

      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelEdit"
        />
        <Button
          :label="isEditing ? 'Сохранить' : 'Добавить'"
          icon="pi pi-check"
          class="p-button-primary"
          @click="saveCompetence"
        />
      </template>
    </Dialog>

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
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import MultiSelect from 'primevue/multiselect';
import type {CompetenceOutputDto} from "@/api/resolvers/competence/dto/output/competence-output.dto.ts";
import {UserResolver} from "@/api/resolvers/user/user.resolver";
import type {UserOutputDto} from "@/api/resolvers/user/dto/output/user-output.dto.ts";
import ToastPopup from "@/components/ToastPopup.vue";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import {
  CompetenceResolver,
} from "@/api/resolvers/competence/competence.resolver";
import { useUserStore } from '@/stores/userStore.ts';
import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
import CompetenceDetailsDialog from '@/components/dialogs/CompetenceDetailsDialog.vue';
import ProgressSpinner from 'primevue/progressspinner';
import CompetenciesList from '@/components/CompetenciesList.vue';
import { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';
import type { AgeCategoryOutputDto } from '@/api/resolvers/ageCategory/age-category-output.dto.ts';

export default {
  name: "ExpertCompetencies",
  components: {
    CompetenciesList,
    CompetenceDetailsDialog,
    ToastPopup,
    Button,
    Dialog,
    InputText,
    Textarea,
    Dropdown,
    MultiSelect,
    ProgressSpinner
  },
  data() {
    return {
      user: useUserStore().user,
      competenceResolver: new CompetenceResolver(),
      userResolver: new UserResolver(),
      experts: [] as UserOutputDto[],
      selectedAge: [] as AgeCategories[],
      oldAgeCategories: [] as AgeCategories[],
      showDetailsDialog: false,
      selectedCompetence: undefined as undefined | CompetenceOutputDto,
      showAddCompetenceDialog: false,
      isEditing: false,
      editingCompetenceId: null as null | number,
      errors: {
        toastPopup: {
          title: "",
          message: "",
        },
        name: "",
        description: "",
        ageCategory: "",
        expert: "",
      },
      competenceForm: {
        id: null as number | null,
        name: "",
        description: "",
        ageCategory: [] as AgeCategories[],
        expert: undefined as UserOutputDto | undefined,
      },
      isLoading: false,
      ageGroups: useAgeGroups,
      competencies: [] as CompetenceOutputDto[],
    };
  },
  computed: {
    filteredCompetencies() {
      let filtered = this.competencies;

      if (this.selectedAge && this.selectedAge.length > 0) {
        filtered = filtered.filter((competence: CompetenceOutputDto) =>
            competence.ageCategories.some(ageDto =>
                this.selectedAge.includes(ageDto.ageCategory)
            )
        );
      }

      return filtered;
    },
  },
  async mounted() {
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

    refreshCompetence(competenceId: number, ageCategory: AgeCategoryOutputDto) {
      const ageCategoryToRefresh = this.competencies
        .find(competence => competence.id === competenceId)?.ageCategories
        .find(category => category.id === ageCategory.id)
      if (ageCategoryToRefresh) ageCategoryToRefresh.isDisabled = ageCategory.isDisabled
    },

    addCompetence() {
      this.competenceForm = {
        id: null,
        name: "",
        description: "",
        ageCategory: [] as AgeCategories[],
        expert: undefined,
      };
      this.showAddCompetenceDialog = true;
    },

    editCompetence(competence: CompetenceOutputDto) {
      this.isEditing = true;
      this.editingCompetenceId = competence.id;
      this.oldAgeCategories = competence.ageCategories.map(item => item.ageCategory)

      this.competenceForm = {
        id: this.editingCompetenceId,
        expert: this.experts.find(
            (expert: UserOutputDto) => expert.id === competence.expertId,
        ),
        ageCategory: competence.ageCategories.map(item => item.ageCategory),
        name: competence.name,
        description: competence.description,
      };
      console.log(this.competenceForm);
      this.showAddCompetenceDialog = true;
    },

    async deleteCompetence(competence: CompetenceOutputDto) {
      if (
          confirm(
              `Вы уверены, что хотите удалить компетенцию ${competence.name}?`,
          )
      ) {
        const response = await this.competenceResolver.delete(competence.id);
        if (response.status === 200) {
          await this.loadCompetencies();
        } else {
          this.errors.toastPopup = {
            title: response.status.toString(),
            message: response.message,
          };
        }
      }
    },

    cancelEdit() {
      this.isEditing = false;
      this.editingCompetenceId = null;
      this.competenceForm = {
        id: null,
        name: "",
        description: "",
        ageCategory: [] as AgeCategories[],
        expert: undefined,
      };
      this.showAddCompetenceDialog = false;
    },

    async saveCompetence() {
      if (this.user !== null) {
        const dataNoAgeCategories = {
          id: this.competenceForm.id,
          userId: this.user.id,
          expertId: this.competenceForm.expert!.id,
          name: this.competenceForm.name,
          description: this.competenceForm.description,
          ageCategory: this.competenceForm.ageCategory!,
        };
        const response = this.isEditing
          ? await this.competenceResolver.update({
            ...dataNoAgeCategories,
            ageCategory: JSON.stringify(this.competenceForm.ageCategory) === JSON.stringify(this.oldAgeCategories)
              ? null
              : this.competenceForm.ageCategory
          })
          : await this.competenceResolver.create({
            ...dataNoAgeCategories,
            ageCategory: this.competenceForm.ageCategory!,
          });

        if (typeof response.message === "string") {
          this.errors.toastPopup = {
            title: response.status.toString(),
            message: response.message,
          };
        }
        this.cancelEdit();
        await this.loadCompetencies();
      }
    },

    async loadCompetencies() {
      this.isLoading = true
      if (this.user !== null) {
        const competenceResponse = await this.competenceResolver.getAllByUserId(
          this.user.id,
        );
        if (competenceResponse.status === 200 && typeof competenceResponse.message !== "string") {
          this.competencies = competenceResponse.message;
        } else {
          this.errors.toastPopup = {
            title: competenceResponse.status.toString(),
            message: competenceResponse.message.toString(),
          };
        }

        const expertResponse = await this.userResolver.getAllByTutorId(this.user.id);
        if (expertResponse.status == 200 && typeof expertResponse.message !== "string") {
          this.experts = expertResponse.message;
        } else {
          this.errors.toastPopup = {
            title: expertResponse.status.toString(),
            message: expertResponse.message.toString(),
          };
        }
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

.form-field {
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
}

.form-field label {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
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
