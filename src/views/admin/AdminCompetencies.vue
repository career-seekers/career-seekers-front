<template>
  <div class="competencies-page">
    <ToastPopup :content="errors.toastPopup" />
    <div class="page-header">
      <h1 class="page-title">
        Компетенции
      </h1>
      <p class="page-subtitle">
        Управление компетенциями
      </p>
    </div>

    <!-- Фильтры -->
    <div class="filters-section sticky-filters">
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
        <label for="ageFilter">Поиск компетенции</label>
        <InputText
          id="competence"
          v-model="filterCompetenceName"
          placeholder="Введите название"
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
    <div
      v-if="isLoading"
    >
      <ProgressSpinner style="width: 100%; height: 5rem; margin-top: 5rem" />
    </div>
    <CompetenciesList
      v-else-if="paginatedCompetencies.length > 0"
      :competencies="paginatedCompetencies"
      @open-competence="(competenceId) => viewDetails(competenceId)"
      @edit-competence="(competence) => editCompetence(competence)"
      @delete-competence="(competence) => deleteCompetence(competence)"
      @manage-places="(competence) => managePlaces(competence)"
      @toggle-competence="(competenceId, ageCategory) => refreshCompetence(competenceId, ageCategory)"
    />
    <div v-else>
      <p>Компетенции не найдены</p>
    </div>

    <!-- Обычная пагинация (скрывается при скролле) -->
    <div class="pagination-container">
      <Paginator
        v-if="filteredCompetencies.length > 0 && !isLoading"
        :first="currentPage * itemsPerPage"
        :rows="itemsPerPage"
        :total-records="totalRecords"
        :rows-per-page-options="[8, 16, 24, 32]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="onPageChange"
      />
    </div>


    <!-- Диалог редактирования компетенции -->
    <Dialog
      v-if="selectedCompetence"
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
            :options="filteredExperts(selectedCompetence)"
            placeholder="Не выбран"
            class="filter-dropdown"
            :class="{ 'p-invalid': !competenceForm.expert }"
          >
            <template #option="slotProps">
              {{ slotProps.option.firstName }} {{ slotProps.option.lastName }}
              {{ slotProps.option.patronymic }}
            </template>
            <template #value="{ value }">
              {{
                value
                  ? `${value.firstName} ${value.lastName} ${value.patronymic}`
                  : "Не выбран"
              }}
            </template>
          </Dropdown>
          <small
            v-if="errors.expert"
            class="p-error"
          >{{
            errors.expert
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

    <!-- Диалог управления местами -->
    <Dialog
      v-model:visible="showPlacesDialog"
      :header="`Управление местами: ${selectedCompetence?.name || ''}`"
      :modal="true"
      :closable="true"
      class="places-dialog"
      :style="{ width: '600px' }"
      @update:visible="closePlacesDialog()"
    >
      <div
        v-if="selectedCompetence"
        class="places-management"
      >
        <div class="places-info">
          <p class="places-description">
            Установите максимальное количество мест для каждого возрастного периода компетенции.
          </p>
        </div>

        <div class="places-list">
          <div
            v-for="ageCategory in selectedCompetence.ageCategories"
            :key="ageCategory.id"
            class="place-item"
          >
            <div class="place-age-info">
              <div class="age-label">
                {{ ageGroups.find(group => group.value === ageCategory.ageCategory)?.label }}
              </div>
              <div class="current-places">
                Текущее: {{ ageCategory.maxParticipantsCount || 'Не установлено' }}
              </div>
            </div>
            <div class="place-input-group">
              <InputNumber
                v-model="placesForm[ageCategory.ageCategory]"
                :min="0"
                :max="1000"
                placeholder="Максимум мест"
                class="place-input"
              />
              <Button
                icon="pi pi-check"
                class="p-button-sm"
                :disabled="placesForm[ageCategory.ageCategory] == null || placesForm[ageCategory.ageCategory] < 0"
                @click="savePlaceForAge(ageCategory.ageCategory)"
              />
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
  import InputNumber from 'primevue/inputnumber';
  import MultiSelect from 'primevue/multiselect';
  import Paginator from 'primevue/paginator';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import ToastPopup from '@/components/ToastPopup.vue';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import type {
    UpdateCompetencePlacesInputDto,
  } from '@/api/resolvers/competence/dto/input/competence-places-input.dto.ts';
  import ProgressSpinner from 'primevue/progressspinner';
  import CompetenceDetailsDialog from '@/components/dialogs/CompetenceDetailsDialog.vue';
  import CompetenciesList from '@/components/CompetenciesList.vue';
  import { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';
  import type { AgeCategoryOutputDto } from '@/api/resolvers/ageCategory/age-category-output.dto.ts';

  export default {
    name: "AdminCompetencies",
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
      InputNumber,
      Paginator,
      ProgressSpinner
    },
    data() {
      return {
        competenceResolver: new CompetenceResolver(),
        userResolver: new UserResolver(),
        experts: [] as UserOutputDto[],
        selectedAge: [] as AgeCategories[],
        showDetailsDialog: false,
        selectedCompetence: undefined as undefined | CompetenceOutputDto,
        showAddCompetenceDialog: false,
        showPlacesDialog: false,
        isEditing: false,
        isLoading: false,
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
        placesForm: {} as Record<AgeCategories, number>,
        ageGroups: useAgeGroups,
        competencies: [] as CompetenceOutputDto[],
        oldAgeCategories: [] as AgeCategories[],
        filterCompetenceName: null as string | null,
        // Пагинация
        currentPage: 0,
        itemsPerPage: 8,
      };
    },
    computed: {
      filteredCompetencies() {
        let filtered = this.competencies;

        if (this.selectedAge && this.selectedAge.length > 0) {
          filtered = filtered.filter(competence =>
              competence.ageCategories.some(ageDto =>
                  this.selectedAge.includes(ageDto.ageCategory)
              )
          );
        }

        if (this.filterCompetenceName && this.filterCompetenceName.length > 0) {
          const loweredFilter = this.filterCompetenceName.toLowerCase();
          filtered = filtered.filter(competence =>
              competence.name.toLowerCase().includes(loweredFilter)
          );
        }

        return filtered.toSorted((a, b) => b.id - a.id);
      },

      paginatedCompetencies() {
        const start = this.currentPage * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return [...this.filteredCompetencies]
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(start, end);
      },

      totalRecords() {
        return this.filteredCompetencies.length;
      },
    },
    async mounted() {
      await this.loadCompetencies();
    },
    methods: {
      filteredExperts(competence: CompetenceOutputDto) {
        return this.experts.filter((expert) => {
          return expert.tutorId === competence.userId
        })
      },
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
      editCompetence(competence: CompetenceOutputDto) {
        this.isEditing = true;
        this.editingCompetenceId = competence.id;
        this.selectedCompetence = competence;
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
        const noAgeCategoryData = {
          id: this.competenceForm.id,
          userId: this.competenceForm.expert!.tutorId!,
          expertId: this.competenceForm.expert!.id,
          name: this.competenceForm.name,
          description: this.competenceForm.description,
        };
        const response = this.isEditing
          ? await this.competenceResolver.update({
            ...noAgeCategoryData,
            ageCategory: JSON.stringify(this.competenceForm.ageCategory) === JSON.stringify(this.oldAgeCategories)
              ? null
              : this.competenceForm.ageCategory
          })
          : await this.competenceResolver.create({
            ...noAgeCategoryData,
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
      },

      async loadCompetencies() {
        try {
          this.isLoading = true
          const competenceResponse = await this.competenceResolver.getAll();
          if (competenceResponse.status === 200 && typeof competenceResponse.message !== "string") {
            this.competencies = competenceResponse.message;
          } else {
            this.errors.toastPopup = {
              title: competenceResponse.status.toString(),
              message: competenceResponse.message.toString(),
            };
          }
        } catch (error) {
          this.errors.toastPopup = {
            title: "Ошибка",
            message: "Не удалось загрузить компетенции",
          };
        }

        const expertResponse = await this.userResolver.getAll();
        if (expertResponse.status == 200 && typeof expertResponse.message !== "string") {
          this.experts = expertResponse.message;
        } else {
          this.errors.toastPopup = {
            title: expertResponse.status.toString(),
            message: expertResponse.message.toString(),
          };
        }
        this.isLoading = false
      },

      // Методы для управления местами
      managePlaces(competence: CompetenceOutputDto) {
        this.selectedCompetence = competence;
        this.placesForm = {} as Record<AgeCategories, number>;
        // Инициализируем форму текущими значениями
        competence.ageCategories.forEach(ageCategory => {
          this.placesForm[ageCategory.ageCategory] = ageCategory.maxParticipantsCount || 0;
        });
        this.showPlacesDialog = true;
      },

      closePlacesDialog() {
        this.showPlacesDialog = false;
        this.selectedCompetence = undefined;
        this.placesForm = {} as Record<AgeCategories, number>;
      },

      async savePlaceForAge(ageCategory: AgeCategories) {
        if (!this.selectedCompetence || this.placesForm[ageCategory] < 0) return;

        try {
          const response = await this.competenceResolver.updateCompetencePlaces({
            id: this.selectedCompetence.ageCategories.find(
                item => item.ageCategory === ageCategory
            )?.id,
            maxParticipantsCount: this.placesForm[ageCategory],
          } as UpdateCompetencePlacesInputDto);

          if (response.status === 200) {
            this.errors.toastPopup = {
              title: "Успех",
              message: "Количество мест успешно обновлено",
            };
            // Обновляем данные в selectedCompetence
            const ageCategoryObj = this.selectedCompetence.ageCategories.find(ac => ac.ageCategory === ageCategory);
            if (ageCategoryObj) {
              ageCategoryObj.maxParticipantsCount = this.placesForm[ageCategory];
            }
          } else {
            this.errors.toastPopup = {
              title: `Ошибка #${response.status}`,
              message: response.message as string,
            };
          }
        } catch (error) {
          this.errors.toastPopup = {
            title: "Ошибка",
            message: "Произошла ошибка при сохранении мест",
          };
        }
      },
      onPageChange(event: any) {
        this.currentPage = event.page;
        this.itemsPerPage = event.rows;
        // Плавная прокрутка к началу списка
        this.$nextTick(() => {
          const grid = this.$el.querySelector('.competencies-grid');
          if (grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
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

  /* Sticky фильтры */
  .sticky-filters {
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }

  .sticky-filters:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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



  .age-label {
    color: #6c757d;
    font-weight: 500;
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

  /* Стили для диалога управления местами */
  .places-management {
    padding: 1rem 0;
  }

  .places-info {
    margin-bottom: 1.5rem;
  }

  .places-description {
    color: #6c757d;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
  }

  .places-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .place-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .place-age-info {
    flex: 1;
  }

  .age-label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .current-places {
    color: #6c757d;
    font-size: 0.85rem;
  }

  .place-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .place-input {
    width: 80px !important;
    flex-shrink: 0;
    max-width: 80px !important;
  }

  .place-input :deep(.p-inputnumber-input) {
    width: 80px !important;
    max-width: 80px !important;
  }

  @media (max-width: 768px) {
    .place-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .place-input-group {
      width: 100%;
      justify-content: space-between;
    }

    .place-input {
      width: 70px !important;
      flex-shrink: 0;
      max-width: 70px !important;
    }

    .place-input :deep(.p-inputnumber-input) {
      width: 70px !important;
      max-width: 70px !important;
    }
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

/* Стили для пагинации */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  transition: opacity 0.3s ease;
}
</style>
