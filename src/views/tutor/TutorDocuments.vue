<template>
  <div class="documents-page">
    <div class="page-header">
      <h1 class="page-title">Документы</h1>
      <p class="page-subtitle">Управление документами, подтверждающими экспертность</p>
    </div>

    <!-- Фильтры -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="typeFilter">Тип документа:</label>
        <Dropdown 
          id="typeFilter"
          v-model="selectedType" 
          :options="docTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Все типы"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <label for="statusFilter">Компетенция:</label>
        <Dropdown 
          id="statusFilter"
          v-model="selectedCompetence"
          :options="competencies"
          :disabled="competencies.length === 0"
          placeholder="Все компетенции"
          class="filter-dropdown"
        >
          <template #option="slotProps">
            {{ slotProps ? slotProps.option.name : 'Не выбран' }}
          </template>
          <template #value="{ value }">
            {{ value ? value.name : 'Все компетенции' }}
          </template>
        </Dropdown>
      </div>
      <div class="filter-group">
        <Button 
          label="Сбросить фильтры" 
          icon="pi pi-refresh"
          class="p-button-text p-button-sm"
          @click="resetFilters"
        />
      </div>
    </div>

    <!-- Список документов -->
    <div class="documents-grid">
      <div v-for="document in filteredDocuments" :key="document.id" class="document-card">
        <div class="document-header">
          <div class="document-icon">
            <i class="pi pi-file"></i>
          </div>
          <div class="document-info">
            <h3 class="document-name">Документ №{{ document.id }}</h3>
          </div>
          <div class="document-actions">
            <Button
              icon="pi pi-eye"
              style="background: white;"
              class="p-button-text p-button-sm"
              @click="viewDocument(document)"
              v-tooltip="'Просмотреть'"
            />
            <Button 
              icon="pi pi-download"
              style="background: white;"
              class="p-button-text p-button-sm"
              @click="downloadDocument(document)"
              v-tooltip="'Скачать'"
            />
            <Button 
              icon="pi pi-trash"
              style="background: white;"
              class="p-button-text p-button-sm p-button-danger"
              @click="deleteDocument(document)"
              v-tooltip="'Удалить'"
            />
          </div>
        </div>
        
        <div class="document-content">
          <div class="document-details">
            <div class="detail-item">
              <span class="detail-label">Тип:</span>
              <span class="detail-value">{{ docTypes.find(type => type.value === document.documentType).label }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Дата загрузки:</span>
              <span class="detail-value">{{ document.createdAt.substring(0, 10) }}</span>
            </div>
            <div v-if="document" class="detail-item">
              <span class="detail-label">Компетенция:</span>
              <span class="detail-value">{{ documentCompetence(document).name }}</span>
            </div>
          </div>
          
          <div v-if="documentExpert(document)" class="mentor-info">
            <h4 class="mentor-title">Связанный эксперт:</h4>
            <p class="mentor-name">{{
                documentExpert(document).lastName + " "
                + documentExpert(document).firstName + " "
                + documentExpert(document).patronymic
              }}</p>
          </div>
        </div>
      </div>
    </div>

    <Dialog
        v-if="selectedDocument"
        v-model:visible="showPreviewDialog"
        :header="'Документ №' + selectedDocument.id"
        :modal="true"
        :style="{ width: '800px' }"
    >
      <div>
        {{  }}
      </div>

      <template #footer>
        <Button
            label="Закрыть"
            icon="pi pi-times"
            class="p-button-text"
            @click="showPreviewDialog = false"
        />
        <!--        <Button -->
        <!--          label="Участники" -->
        <!--          icon="pi pi-users" -->
        <!--          class="p-button-primary"-->
        <!--          @click="goToParticipants(selectedCompetence?.id)"-->
        <!--        />-->
      </template>
    </Dialog>

    <ToastPopup :content="errors.toastPopup"/>
  </div>
</template>

<script lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'
import {FileType} from "@/api/resolvers/files/file.resolver";
import {CompetenceResolver} from "@/api/resolvers/competence/competence.resolver";
import { UserState} from "../../../state/UserState";
import ToastPopup from "@/components/ToastPopup.vue";
import {UserResolver} from "@/api/resolvers/user/user.resolver";
import {
  CompetenceDocumentsOutputDto
} from "@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto";
import {CompetenceOutputDto} from "@/api/resolvers/competence/dto/output/competence-output.dto";

export default {
  name: 'TutorDocuments',
  components: {
    ToastPopup,
    Button,
    Dialog,
    InputText,
    Dropdown,
    Textarea,
    FileUpload
  },
  data() {
    return {
      competenceResolver: new CompetenceResolver(),
      userResolver: new UserResolver(),
      showUploadDialog: false,
      showLinkDialog: false,
      selectedDocument: null as CompetenceDocumentsOutputDto | null,
      selectedType: null,
      selectedCompetence: localStorage.getItem('selectedCompetence')
          ? JSON.parse(localStorage.getItem('selectedCompetence'))
          : null,
      documents: [] as CompetenceDocumentsOutputDto[],
      competencies: [],
      experts: [],
      docTypes: [
        { label: "Конкурсное задание", value: FileType.TASK },
        { label: "Критерии оценок", value: FileType.CRITERIA },
        { label: "Итоговая ведомость", value: FileType.STATEMENT },
        { label: "Конкурсное задание финала", value: FileType.FINAL_TASK },
        { label: "Критерии оценок финала", value: FileType.FINAL_CRITERIA },
        { label: "Итоговая ведомость", value: FileType.FINAL_STATEMENT },
        { label: "Полное описание компетенции", value: FileType.DESCRIPTION },
      ],
      errors: {
        toastPopup: {
          title: '',
          message: ''
        }
      },
      showPreviewDialog: false
    }
  },
  computed: {
    filteredDocuments() {
      let filtered = this.documents
      
      if (this.selectedType) {
        filtered = filtered.filter(doc => doc.type === this.selectedType)
      }
      
      if (this.selectedCompetence) {
        filtered = filtered.filter()
      }
      
      return filtered
    }
  },
  methods: {
    documentCompetence(document: CompetenceDocumentsOutputDto) {

      return this.competencies.find((competence: CompetenceOutputDto) =>
          competence.documents.some(doc => doc.id === document.id)
      );

    },
    documentExpert(document) {
      return this.experts.find(expert => expert.id === document.userId)
    },
    viewDocument(document) {
      this.selectedDocument = document
      this.showPreviewDialog = true
    },
    downloadDocument(document) {
      console.log('Скачивание документа:', document.name)
    },
    deleteDocument(document) {
      if (confirm(`Вы уверены, что хотите удалить документ "${document.name}"?`)) {
        const index = this.documents.findIndex(d => d.id === document.id)
        if (index > -1) {
          this.documents.splice(index, 1)
        }
      }
    },
    resetFilters() {
      this.selectedType = null
      this.selectedCompetence = null
    },
    async loadCompetencies() {
      const response = await this.competenceResolver.getAllByUserId(UserState.id)
      if (response.status === 200 && typeof response.message !== 'string') {
        response.message.forEach(competence => {
          if (competence.documents.length > 0) {
            this.competencies.push(competence)
            this.documents.push(...competence.documents)
            competence.documents.forEach(async (document) => {
              const response = await this.userResolver.getById(document.userId)
              if (response.status === 200) {
                this.experts.push(response.message)
              }
            })
          }
        })
      }
    }
  },
  async mounted() {
    await this.loadCompetencies()
    localStorage.removeItem('selectedCompetence')
  }
}
</script>

<style scoped>
.documents-page {
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
  font-family: 'BIPS', sans-serif;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.page-actions {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.document-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.document-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.document-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.document-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
}

.document-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.document-type {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.document-content {
  padding: 1.5rem;
}

.document-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
  min-width: 100px;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-verified {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-rejected {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.expert-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.expert-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.expert-name {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
}

/* Формы */
.upload-form,
.link-form {
  padding: 1rem 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-field label {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .documents-page {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .documents-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .document-header {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }
  
  .document-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .document-content {
    padding: 1rem;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-value {
    text-align: left;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .documents-page {
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
  
  .document-header {
    padding: 0.75rem;
  }
  
  .document-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .document-name {
    font-size: 1rem;
  }
  
  .document-type {
    font-size: 0.8rem;
  }
  
  .document-content {
    padding: 0.75rem;
  }
  
  .expert-info {
    padding: 0.75rem;
  }
}
</style>
