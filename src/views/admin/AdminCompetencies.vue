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
    <div
      v-else-if="paginatedCompetencies.length > 0"
      class="competencies-grid"
    >
      <div
        v-for="competence in paginatedCompetencies"
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
                competence.description.length > 50
                  ? competence.description.substring(0, 50) + '...'
                  : competence.description
                    ? competence.description
                    : "Без описания"
              }}
            </div>
          </div>
        </div>

        <div class="competence-stats">
          <div class="stat-item">
            <div class="stat-number">
              {{ getTotalParticipants(competence) }}
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

        <!-- Отображение мест по возрастным категориям -->
        <div class="age-places-section">
          <div class="age-places-title">
            Места по возрастам:
          </div>
          <div class="age-places-list">
            <div
              v-for="ageCategory in competence.ageCategories"
              :key="ageCategory.id"
              class="age-place-item"
            >
              <span class="age-label">
                {{ ageGroups.find(group => group.value === ageCategory.ageCategory)?.label }}
              </span>
              <span class="places-count">
                {{ ageCategory.maxParticipantsCount || 0 }} мест
              </span>
            </div>
          </div>
        </div>

        <div class="competence-actions">
          <!--          <Button-->
          <!--            label="Участники"-->
          <!--            icon="pi pi-users"-->
          <!--            class="p-button-outlined"-->
          <!--            @click="goToParticipants(competence.id)"-->
          <!--          />-->
          <Button
            label="Места"
            icon="pi pi-users"
            class="p-button-outlined"
            @click="managePlaces(competence)"
          />
          <Button
            label="Документы"
            icon="pi pi-file-text"
            class="p-button-outlined"
            @click="goToDocuments(competence)"
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
          <div>
            <Button
              v-tooltip="'Редактировать'"
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              @click="editCompetence(competence)"
            />
            <Button
              v-tooltip="'Удалить'"
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              @click="deleteCompetence(competence)"
            />
          </div>
        </div>
      </div>
    </div>
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
    <CompetenceDialog
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
  import Button from "primevue/button";
  import Dialog from "primevue/dialog";
  import Dropdown from "primevue/dropdown";
  import InputNumber from "primevue/inputnumber";
  import MultiSelect from 'primevue/multiselect';
  import Paginator from "primevue/paginator";
  import type {CompetenceOutputDto} from "@/api/resolvers/competence/dto/output/competence-output.dto.ts";
  import {UserResolver} from "@/api/resolvers/user/user.resolver";
  import type {UserOutputDto} from "@/api/resolvers/user/dto/output/user-output.dto.ts";
  import ToastPopup from "@/components/ToastPopup.vue";
  import InputText from "primevue/inputtext";
  import Textarea from "primevue/textarea";
  import {
    AgeCategories,
    CompetenceResolver,
  } from "@/api/resolvers/competence/competence.resolver";
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import type {
    UpdateCompetencePlacesInputDto
  } from "@/api/resolvers/competence/dto/input/competence-places-input.dto.ts";
  import ProgressSpinner from 'primevue/progressspinner';
  import CompetenceDialog from '@/components/dialogs/CompetenceDetailsDialog.vue';

  export default {
    name: "AdminCompetencies",
    components: {
      CompetenceDialog,
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
        const result = [...this.filteredCompetencies]
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(start, end);
        console.log('Paginated competencies:', result);
        console.log('Total competencies:', this.competencies.length);
        console.log('Filtered competencies:', this.filteredCompetencies.length);
        return result;
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
      goToDocuments(competence: CompetenceOutputDto) {
        this.$router.push(`/admin/documents/${competence.id}`);
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
            console.log('Competencies loaded:', this.competencies);
          } else {
            console.error('Failed to load competencies:', competenceResponse);
            this.errors.toastPopup = {
              title: competenceResponse.status.toString(),
              message: competenceResponse.message.toString(),
            };
          }
        } catch (error) {
          console.error('Error loading competencies:', error);
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
      getTotalParticipants(competence: CompetenceOutputDto) {
        const totalParticipants = competence.ageCategories.reduce((sum, ageCategory) => {
          return sum + (ageCategory.currentParticipantsCount || 0);
        }, 0);
        return totalParticipants > 0 ? totalParticipants : '-';
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
    transition: box-shadow 0.3s ease,
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

  .competence-ages-container {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .competence-age {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    display: inline-block;
    margin-bottom: 0.5rem;
  }

  .places-count {
    color: #ff9800;
    font-weight: 600;
    margin-left: 0.25rem;
  }

  /* Стили для отображения мест по возрастным категориям */
  .age-places-section {
    margin: 1rem 0;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
  }

  .age-places-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .age-places-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .age-place-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    font-size: 0.8rem;
  }

  .age-label {
    color: #6c757d;
    font-weight: 500;
  }

  .competence-description {
    font-size: 0.9rem;
    opacity: 0.9;
    line-height: 1.4;
  }

  .competence-stats {
    display: flex;
    justify-content: space-between;
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
    justify-content: space-between;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    flex-wrap: wrap;
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

  .stat-item {
    flex: 1;
    text-align: center;
    min-width: 0;
  }

  .stat-number {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #6c757d;
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
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
    }

    .competence-actions {
      flex-direction: column;
      gap: 0.5rem;
    }

    .stat-item {
      flex: 1 1 calc(50% - 0.125rem);
      min-width: 0;
    }
  }

  /* Промежуточные экраны */
  @media (max-width: 500px) {

    .stat-item {
      flex: none;
      width: 100%;
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
      flex-direction: column;
      gap: 0.5rem;
    }

    .competence-actions {
      padding: 0.75rem 1rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
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



  /* Простые анимации для карточек */
  .competence-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .competence-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
</style>
