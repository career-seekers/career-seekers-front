<template>
  <div class="documents-page">
    <div class="page-header">
      <h1 class="page-title">Документы</h1>
      <p class="page-subtitle">Управление документами, подтверждающими экспертность</p>
    </div>

    <!-- Кнопки действий -->
    <div class="page-actions">
      <Button 
        label="Загрузить документ" 
        icon="pi pi-upload"
        class="p-button-primary"
        @click="showUploadDialog = true"
      />
      <Button 
        label="Создать ссылку на ЛК эксперта" 
        icon="pi pi-link"
        class="p-button-outlined"
        @click="showLinkDialog = true"
      />
    </div>

    <!-- Фильтры -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="typeFilter">Тип документа:</label>
        <Dropdown 
          id="typeFilter"
          v-model="selectedType" 
          :options="documentTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Все типы"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <label for="statusFilter">Статус:</label>
        <Dropdown 
          id="statusFilter"
          v-model="selectedStatus" 
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Все статусы"
          class="filter-dropdown"
        />
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
            <i :class="getDocumentIcon(document.type)"></i>
          </div>
          <div class="document-info">
            <h3 class="document-name">{{ document.name }}</h3>
            <p class="document-type">{{ getDocumentTypeLabel(document.type) }}</p>
          </div>
          <div class="document-actions">
            <Button 
              icon="pi pi-eye" 
              class="p-button-text p-button-sm"
              @click="viewDocument(document)"
              v-tooltip="'Просмотреть'"
            />
            <Button 
              icon="pi pi-download" 
              class="p-button-text p-button-sm"
              @click="downloadDocument(document)"
              v-tooltip="'Скачать'"
            />
            <Button 
              icon="pi pi-pencil" 
              class="p-button-text p-button-sm"
              @click="editDocument(document)"
              v-tooltip="'Редактировать'"
            />
            <Button 
              icon="pi pi-trash" 
              class="p-button-text p-button-sm p-button-danger"
              @click="deleteDocument(document)"
              v-tooltip="'Удалить'"
            />
          </div>
        </div>
        
        <div class="document-content">
          <div class="document-details">
            <div class="detail-item">
              <span class="detail-label">Размер:</span>
              <span class="detail-value">{{ document.size }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Дата загрузки:</span>
              <span class="detail-value">{{ document.uploadDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Статус:</span>
              <span class="detail-value">
                <span class="status-badge" :class="document.statusClass">
                  {{ document.status }}
                </span>
              </span>
            </div>
            <div v-if="document.description" class="detail-item">
              <span class="detail-label">Описание:</span>
              <span class="detail-value">{{ document.description }}</span>
            </div>
          </div>
          
          <div v-if="document.mentorName" class="mentor-info">
            <h4 class="mentor-title">Связанный эксперт:</h4>
            <p class="mentor-name">{{ document.mentorName }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог загрузки документа -->
    <Dialog 
      v-model:visible="showUploadDialog" 
      header="Загрузить документ"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="upload-form">
        <div class="form-field">
          <label for="documentName">Название документа *</label>
          <InputText 
            id="documentName"
            v-model="uploadForm.name" 
            placeholder="Введите название документа"
            :class="{ 'p-invalid': !uploadForm.name }"
          />
        </div>
        
        <div class="form-field">
          <label for="documentType">Тип документа *</label>
          <Dropdown 
            id="documentType"
            v-model="uploadForm.type" 
            :options="documentTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Выберите тип документа"
            :class="{ 'p-invalid': !uploadForm.type }"
          />
        </div>
        
        <div class="form-field">
          <label for="mentorSelect">Связать с экспертом</label>
          <Dropdown 
            id="mentorSelect"
            v-model="uploadForm.mentorId"
            :options="mentors"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Выберите эксперта (необязательно)"
          />
        </div>
        
        <div class="form-field">
          <label for="documentDescription">Описание</label>
          <Textarea 
            id="documentDescription"
            v-model="uploadForm.description" 
            placeholder="Введите описание документа"
            rows="3"
          />
        </div>
        
        <div class="form-field">
          <label for="fileUpload">Файл *</label>
          <FileUpload 
            id="fileUpload"
            mode="basic"
            :auto="false"
            :multiple="false"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            :maxFileSize="10000000"
            @select="onFileSelect"
            chooseLabel="Выбрать файл"
            :class="{ 'p-invalid': !uploadForm.file }"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Отмена" 
          icon="pi pi-times" 
          class="p-button-text"
          @click="cancelUpload"
        />
        <Button 
          label="Загрузить" 
          icon="pi pi-upload" 
          class="p-button-primary"
          @click="uploadDocument"
        />
      </template>
    </Dialog>

    <!-- Диалог создания ссылки -->
    <Dialog 
      v-model:visible="showLinkDialog" 
      header="Создать ссылку на ЛК эксперта"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="link-form">
        <div class="form-field">
          <label for="MentorSelectLink">Эксперт *</label>
          <Dropdown 
            id="MentorSelectLink"
            v-model="linkForm.MentorId"
            :options="Mentors"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Выберите эксперта"
            :class="{ 'p-invalid': !linkForm.expertId }"
          />
        </div>
        
        <div class="form-field">
          <label for="linkTitle">Название ссылки *</label>
          <InputText 
            id="linkTitle"
            v-model="linkForm.title" 
            placeholder="Например: Публичный профиль эксперта"
            :class="{ 'p-invalid': !linkForm.title }"
          />
        </div>
        
        <div class="form-field">
          <label for="linkUrl">URL *</label>
          <InputText 
            id="linkUrl"
            v-model="linkForm.url" 
            placeholder="https://example.com/expert-profile"
            :class="{ 'p-invalid': !linkForm.url }"
          />
        </div>
        
        <div class="form-field">
          <label for="linkDescription">Описание</label>
          <Textarea 
            id="linkDescription"
            v-model="linkForm.description" 
            placeholder="Описание ссылки"
            rows="2"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Отмена" 
          icon="pi pi-times" 
          class="p-button-text"
          @click="cancelLink"
        />
        <Button 
          label="Создать" 
          icon="pi pi-link" 
          class="p-button-primary"
          @click="createLink"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'

export default {
  name: 'TutorDocuments',
  components: {
    Button,
    Dialog,
    InputText,
    Dropdown,
    Textarea,
    FileUpload
  },
  data() {
    return {
      showUploadDialog: false,
      showLinkDialog: false,
      selectedType: null,
      selectedStatus: null,
      uploadForm: {
        name: '',
        type: null,
        expertId: null,
        description: '',
        file: null
      },
      linkForm: {
        expertId: null,
        title: '',
        url: '',
        description: ''
      },
      documentTypes: [
        { label: 'Лицензия', value: 'license' },
        { label: 'Сертификат', value: 'certificate' },
        { label: 'Диплом', value: 'diploma' },
        { label: 'Справка', value: 'reference' },
        { label: 'Публичный профиль', value: 'profile' },
        { label: 'Другое', value: 'other' }
      ],
      statusOptions: [
        { label: 'Проверен', value: 'verified' },
        { label: 'На проверке', value: 'pending' },
        { label: 'Отклонен', value: 'rejected' }
      ],
      experts: [
        { id: 1, fullName: 'Смирнов Алексей Владимирович' },
        { id: 2, fullName: 'Козлова Елена Петровна' },
        { id: 3, fullName: 'Петров Игорь Сергеевич' }
      ],
      documents: [
        {
          id: 1,
          name: 'Лицензия на образовательную деятельность',
          type: 'license',
          size: '2.3 МБ',
          uploadDate: '15.12.2024',
          status: 'Проверен',
          statusClass: 'status-verified',
          description: 'Лицензия на осуществление образовательной деятельности',
          expertName: null
        },
        {
          id: 2,
          name: 'Публичный профиль эксперта - Смирнов А.В.',
          type: 'profile',
          size: 'Ссылка',
          uploadDate: '10.12.2024',
          status: 'Проверен',
          statusClass: 'status-verified',
          description: 'Профиль эксперта на сайте профессионального сообщества',
          expertName: 'Смирнов Алексей Владимирович'
        },
        {
          id: 3,
          name: 'Сертификат о повышении квалификации',
          type: 'certificate',
          size: '1.8 МБ',
          uploadDate: '08.12.2024',
          status: 'На проверке',
          statusClass: 'status-pending',
          description: 'Сертификат о прохождении курса повышения квалификации',
          expertName: 'Козлова Елена Петровна'
        },
        {
          id: 4,
          name: 'Справка о трудовой деятельности',
          type: 'reference',
          size: '1.2 МБ',
          uploadDate: '05.12.2024',
          status: 'Отклонен',
          statusClass: 'status-rejected',
          description: 'Справка с места работы о занимаемой должности',
          expertName: 'Петров Игорь Сергеевич'
        }
      ]
    }
  },
  computed: {
    filteredDocuments() {
      let filtered = this.documents
      
      if (this.selectedType) {
        filtered = filtered.filter(doc => doc.type === this.selectedType)
      }
      
      if (this.selectedStatus) {
        filtered = filtered.filter(doc => doc.statusClass === `status-${this.selectedStatus}`)
      }
      
      return filtered
    }
  },
  methods: {
    getDocumentIcon(type) {
      const icons = {
        license: 'pi pi-file-pdf',
        certificate: 'pi pi-certificate',
        diploma: 'pi pi-graduation-cap',
        reference: 'pi pi-file-text',
        profile: 'pi pi-link',
        other: 'pi pi-file'
      }
      return icons[type] || 'pi pi-file'
    },
    getDocumentTypeLabel(type) {
      const typeObj = this.documentTypes.find(t => t.value === type)
      return typeObj ? typeObj.label : type
    },
    viewDocument(document) {
      console.log('Просмотр документа:', document.name)
    },
    downloadDocument(document) {
      console.log('Скачивание документа:', document.name)
    },
    editDocument(document) {
      console.log('Редактирование документа:', document.name)
    },
    deleteDocument(document) {
      if (confirm(`Вы уверены, что хотите удалить документ "${document.name}"?`)) {
        const index = this.documents.findIndex(d => d.id === document.id)
        if (index > -1) {
          this.documents.splice(index, 1)
        }
      }
    },
    onFileSelect(event) {
      this.uploadForm.file = event.files[0]
    },
    uploadDocument() {
      if (!this.validateUploadForm()) {
        return
      }
      
      const newDocument = {
        id: Date.now(),
        name: this.uploadForm.name,
        type: this.uploadForm.type,
        size: this.uploadForm.file ? this.formatFileSize(this.uploadForm.file.size) : 'Ссылка',
        uploadDate: new Date().toLocaleDateString('ru-RU'),
        status: 'На проверке',
        statusClass: 'status-pending',
        description: this.uploadForm.description,
        expertName: this.uploadForm.expertId ? 
          this.experts.find(e => e.id === this.uploadForm.expertId)?.fullName : null
      }
      
      this.documents.push(newDocument)
      this.cancelUpload()
    },
    createLink() {
      if (!this.validateLinkForm()) {
        return
      }
      
      const newDocument = {
        id: Date.now(),
        name: this.linkForm.title,
        type: 'profile',
        size: 'Ссылка',
        uploadDate: new Date().toLocaleDateString('ru-RU'),
        status: 'На проверке',
        statusClass: 'status-pending',
        description: this.linkForm.description,
        expertName: this.experts.find(e => e.id === this.linkForm.expertId)?.fullName
      }
      
      this.documents.push(newDocument)
      this.cancelLink()
    },
    cancelUpload() {
      this.uploadForm = {
        name: '',
        type: null,
        expertId: null,
        description: '',
        file: null
      }
      this.showUploadDialog = false
    },
    cancelLink() {
      this.linkForm = {
        expertId: null,
        title: '',
        url: '',
        description: ''
      }
      this.showLinkDialog = false
    },
    resetFilters() {
      this.selectedType = null
      this.selectedStatus = null
    },
    validateUploadForm() {
      return this.uploadForm.name && this.uploadForm.type && this.uploadForm.file
    },
    validateLinkForm() {
      return this.linkForm.expertId && this.linkForm.title && this.linkForm.url
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Б'
      const k = 1024
      const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
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
