<template>

  <ToastPopup :content="errors.toastPopup"/>
  <div class="competencies-page">
    <div class="page-header">
      <h1 class="page-title">Мои компетенции</h1>
      <p class="page-subtitle">Управление компетенциями и участниками</p>
    </div>

    <!-- Фильтры -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="ageFilter">Возрастная группа:</label>
        <Dropdown 
          id="ageFilter"
          v-model="selectedAge" 
          :options="ageGroups"
          optionLabel="label"
          optionValue="value"
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
      <div class="filter-group"
      style="margin-left: auto">
        <Button
            label="Добавить компетенцию"
            icon="pi pi-plus"
            class="p-button-primary right"
            @click="addCompetition"
        />
      </div>
    </div>

    <!-- Список компетенций -->
    <div class="competencies-grid">
      <div v-for="competency in filteredCompetencies" :key="competency.id" class="competency-card">
        <div class="competency-header">
          <div class="competency-info">
            <h3 class="competency-name">{{ competency.name }}</h3>
            <div class="competency-age">{{ ageGroups.find(group => group.value === competency.ageCategory) }}</div>
            <div class="competency-description">{{ competency.description }}</div>
          </div>
        </div>
        
        <div class="competency-stats">
          <div class="stat-item">
            <div class="stat-number">{{ competency.participantsCount }}</div>
            <div class="stat-label">Участников</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">-</div>
            <div class="stat-label">Событий</div>
          </div>
        </div>
        
        <div class="competency-actions">
          <Button 
            label="Участники" 
            icon="pi pi-users"
            class="p-button-outlined"
            @click="goToParticipants(competency.id)"
          />
          <Button 
            label="Документы" 
            icon="pi pi-file-text"
            class="p-button-outlined"
            @click="goToDocuments(competency.id)"
          />
          <Button 
            label="События" 
            icon="pi pi-calendar"
            class="p-button-outlined"
            @click="goToEvents(competency.id)"
          />
          <Button 
            label="Подробнее" 
            icon="pi pi-eye"
            class="p-button-primary"
            @click="viewDetails(competency.id)"
          />
        </div>
      </div>
    </div>

    <!-- Диалог добавления/редактирования эксперта -->
    <Dialog
        v-model:visible="showAddCompetitionDialog"
        :header="isEditing ? 'Редактировать компетенцию' : 'Добавить компетенцию'"
        :modal="true"
        :style="{ width: '600px' }"
    >
      <div class="competition-form">
        <div class="form-field">
          <label for="name">Название *</label>
          <InputText
              id="name"
              v-model="competitionForm.name"
              placeholder="Введите название компетенции"
              :class="{ 'p-invalid': !competitionForm.name }"
          />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>

        <div class="form-field">
          <label for="name">Описание *</label>
          <Textarea
              id="name"
              v-model="competitionForm.description"
              placeholder="Введите описание компетенции"
              :class="{ 'p-invalid': !competitionForm.description }"
          />
          <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
        </div>


        <div class="form-field">
          <label for="competitionAgeFilter" class="field-label">Возрастная категория *</label>
          <Dropdown
              id="competitionAgeFilter"
              v-model="competitionForm.ageCategory"
              :options="ageGroups"
              optionLabel="label"
              optionValue="value"
              placeholder="Все возрасты"
              class="filter-dropdown"
              :class="{ 'p-invalid': !competitionForm.ageCategory }"
          />
          <small v-if="errors.ageCategory" class="p-error">{{ errors.ageCategory }}</small>
        </div>

        <div class="form-field">
          <label for="competitionExpertList" class="field-label">Главный эксперт *</label>
          <Dropdown
              id="competitionExpertList"
              v-model="competitionForm.expert"
              :options="experts"
              placeholder="Не выбран"
              class="filter-dropdown"
              :class="{ 'p-invalid': !competitionForm.expert }"
          >
            <template #option="slotProps">
              {{ slotProps.option.firstName }} {{ slotProps.option.lastName }} {{ slotProps.option.patronymic }}
            </template>
            <template #value="{ value }">
              {{ value ? `${value.firstName} ${value.lastName} ${value.patronymic}` : 'Не выбран' }}
            </template>
          </Dropdown>
          <small v-if="errors.ageCategory" class="p-error">{{ errors.ageCategory }}</small>
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
            @click="saveCompetition"
        />
      </template>
    </Dialog>

    <!-- Диалог подробной информации -->
    <Dialog 
      v-model:visible="showDetailsDialog" 
      :header="selectedCompetency?.name || 'Компетенция'"
      :modal="true"
      :style="{ width: '800px' }"
    >
      <div v-if="selectedCompetency" class="competency-details">
        <div class="detail-section">
          <h4>Описание компетенции</h4>
          <p>{{ selectedCompetency.fullDescription }}</p>
        </div>
        
        <div class="detail-section">
          <h4>Требования к участникам</h4>
          <ul>
            <li v-for="requirement in selectedCompetency.requirements" :key="requirement">
              {{ requirement }}
            </li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h4>Программа обучения</h4>
          <div class="program-steps">
            <div 
              v-for="(step, index) in selectedCompetency.programSteps" 
              :key="index"
              class="program-step"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-title">{{ step.title }}</div>
                <div class="step-description">{{ step.description }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Статистика</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ selectedCompetency.participantsCount }}</div>
              <div class="stat-label">Участников</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ selectedCompetency.completedCount }}</div>
              <div class="stat-label">Завершили</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ selectedCompetency.eventsCount }}</div>
              <div class="stat-label">Событий</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ selectedCompetency.documentsCount }}</div>
              <div class="stat-label">Документов</div>
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
        <Button 
          label="Участники" 
          icon="pi pi-users" 
          class="p-button-primary"
          @click="goToParticipants(selectedCompetency?.id)"
        />
      </template>
    </Dialog>

  </div>
</template>

<script lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import {CompetitionOutputDto} from "@/api/resolvers/competition/dto/output/competition-output.dto";
import {AgeCategories, CompetitionResolver} from "@/api/resolvers/competition/competition.resolver";
import {UserState} from "../../../state/UserState";
import {CompetitionInputDto} from "@/api/resolvers/competition/dto/input/competition-input.dto";
import {UserResolver} from "@/api/resolvers/user/user.resolver";
import {Roles} from "../../../state/UserState.types";
import {UserOutputDto} from "@/api/resolvers/auth/dto/output/user-output.dto";
import ToastPopup from "@/components/ToastPopup.vue";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";

export default {
  name: 'ExpertCompetencies',
  components: {
    ToastPopup,
    Button,
    Dialog,
    InputText,
    Textarea,
    Dropdown
  },
  data() {
    return {
      competitionResolver: new CompetitionResolver(),
      userResolver: new UserResolver(),
      experts: [] as UserOutputDto[],
      userResolver: new UserResolver(),
      selectedAge: null as AgeCategories | null,
      showDetailsDialog: false,
      selectedCompetency: null,
      showAddCompetitionDialog: false,
      isEditing: false,
      editingCompetitionId: null,
      errors: {
        toastPopup: {
          title: '',
          message: '',
        },
        name: '',
        description: '',
        ageCategory: '',
        expert: '',
      },
      competitionForm: {
        name: '',
        description: '',
        ageCategory: null as AgeCategories | null,
        expert: null as UserOutputDto | null,
      },
      ageGroups: [
        { value: AgeCategories.EARLY_PRESCHOOL, label: "4-5" },
        { value: AgeCategories.PRESCHOOL, label: "6-7" },
        { value: AgeCategories.EARLY_SCHOOL, label: "7-8" },
        { value: AgeCategories.SCHOOL, label: "9-11" },
        { value: AgeCategories.HIGH_SCHOOL, label: "12-13" },
      ],
      competencies: [] as CompetitionOutputDto[]
    }
  },
  computed: {
    filteredCompetencies() {
      let filtered = this.competencies

      if (this.selectedAge) {
        filtered = filtered.filter(competition => competition.ageCategory == this.selectedAge)
      }
      
      return filtered
    },
  },
  methods: {
    goToParticipants(competencyId) {
      this.$router.push(`/expert/participants/${competencyId}`)
    },
    goToDocuments(competencyId) {
      this.$router.push(`/expert/documents/${competencyId}`)
    },
    goToEvents(competencyId) {
      this.$router.push('/expert/events')
    },
    viewDetails(competencyId) {
      this.selectedCompetency = this.competencies.find(c => c.id === competencyId)
      this.showDetailsDialog = true
    },
    closeDetails() {
      this.showDetailsDialog = false
      this.selectedCompetency = null
    },
    resetFilters() {
      this.selectedAge = null
    },
    addCompetition() {
      this.competitionForm = {
        name: "",
        description: "",
        ageCategory: null,
        expert: '',
      }
      this.showAddCompetitionDialog = true
    },
    cancelEdit() {
      this.isEditing = false
      this.editingCompetitionId = null
      this.competitionForm = {
        name: "",
        description: "",
        ageCategory: null,
        expert: '',
      }
      this.showAddCompetitionDialog = false
    },
    async saveCompetition() {
      const response = await this.competitionResolver.create({
        userId: UserState.id,
        expertId: this.competitionForm.expert.id,
        name: this.competitionForm.name,
        description: this.competitionForm.description,
        ageCategory: this.competitionForm.ageCategory,
      })
      if (typeof response.message === "string") {
        this.errors.toastPopup = {
          title: response.status,
          message: response.message
        }
      }
      this.cancelEdit()
      await this.loadCompetencies()
    },
    async loadCompetencies() {
      const competitionResponse = await this.competitionResolver.getByUserId(UserState.id)
      if (competitionResponse.status === 200) {
        this.competencies = competitionResponse.message
      } else {
        this.errors.toastPopup = {
          title: competitionResponse.status,
          message: competitionResponse.message,
        }
      }

      const expertResponse = await this.userResolver.getAllByRole(Roles.EXPERT)
      if (expertResponse.status == 200) {
        this.experts = expertResponse.message
      } else {
        this.errors.toastPopup = {
          title: expertResponse.status,
          message: expertResponse.message,
        }
      }
    }
  },
  async mounted() {
    await this.loadCompetencies()
  }
}
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
  font-family: 'BIPS', sans-serif;
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

.competency-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
}

.competency-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
  transform: translateY(-2px);
}

.competency-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.competency-info {
  flex: 1;
}

.competency-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.competency-age {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.competency-description {
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
}

.competency-status {
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

.competency-stats {
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

.competency-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  flex-wrap: wrap;
}

/* Диалог подробной информации */
.competency-details {
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
  
  .competency-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .competency-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .competency-actions {
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
  
  .competency-header {
    padding: 1rem;
  }
  
  .competency-name {
    font-size: 1.1rem;
  }
  
  .competency-stats {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .competency-actions {
    padding: 0.75rem 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
