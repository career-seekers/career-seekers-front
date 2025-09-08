<template>
  <div class="documents-page">
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/expert/competencies" class="breadcrumb-link">
            <i class="pi pi-briefcase"></i>
            Компетенции
          </router-link>
          <i class="pi pi-chevron-right breadcrumb-separator"></i>
          <span class="breadcrumb-current">{{ competencyName }}</span>
        </div>
        <h1 class="page-title">Документы компетенции</h1>
        <p class="page-subtitle">{{ competencyDescription }}</p>
      </div>
    </div>

    <!-- Статистика -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-file-text"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ documentsStats.total }}</div>
            <div class="stat-label">Всего документов</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-upload"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ documentsStats.uploaded }}</div>
            <div class="stat-label">Загружено</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-download"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ documentsStats.downloads }}</div>
            <div class="stat-label">Скачиваний</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ documentsStats.recent }}</div>
            <div class="stat-label">За последнюю неделю</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Загрузка документов -->
    <div class="upload-section">
      <div class="upload-card">
        <div class="upload-header">
          <h3 class="upload-title">
            <i class="pi pi-upload"></i>
            Загрузить документы
          </h3>
        </div>
        <div class="upload-content">
          <FileUpload 
            mode="basic" 
            name="documents[]" 
            :url="uploadUrl"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png"
            :maxFileSize="10000000"
            :multiple="true"
            @upload="onUpload"
            @select="onFileSelect"
            chooseLabel="Выбрать файлы"
            class="file-upload"
          />
          <div class="upload-info">
            <p class="upload-text">Поддерживаемые форматы: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, PNG</p>
            <p class="upload-text">Максимальный размер файла: 10 МБ</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section">
      <div class="search-group">
        <InputText 
          v-model="searchQuery" 
          placeholder="Поиск по названию документа..."
          class="search-input"
        />
        <i class="pi pi-search search-icon"></i>
      </div>
      <div class="filter-group">
        <Dropdown 
          v-model="selectedType" 
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Все типы"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <Dropdown 
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
            <i :class="getFileIcon(document.type)"></i>
          </div>
          <div class="document-info">
            <h3 class="document-name">{{ document.name }}</h3>
            <p class="document-type">{{ document.typeLabel }}</p>
            <div class="document-meta">
              <span class="document-size">{{ document.size }}</span>
              <span class="document-date">{{ document.uploadDate }}</span>
            </div>
          </div>
          <div class="document-actions">
            <Button 
              icon="pi pi-download" 
              class="p-button-text p-button-sm"
              @click="downloadDocument(document)"
              v-tooltip="'Скачать'"
            />
            <Button 
              icon="pi pi-eye" 
              class="p-button-text p-button-sm"
              @click="previewDocument(document)"
              v-tooltip="'Предварительный просмотр'"
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
          <div class="document-description">
            <p>{{ document.description }}</p>
          </div>
          
          <div class="document-stats">
            <div class="stat-item">
              <i class="pi pi-download"></i>
              <span>{{ document.downloads }} скачиваний</span>
            </div>
            <div class="stat-item">
              <i class="pi pi-eye"></i>
              <span>{{ document.views }} просмотров</span>
            </div>
            <div class="stat-item">
              <i class="pi pi-clock"></i>
              <span>{{ document.lastAccess }}</span>
            </div>
          </div>
          
          <div class="document-tags">
            <span 
              v-for="tag in document.tags" 
              :key="tag"
              class="document-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог предварительного просмотра -->
    <Dialog 
      v-model:visible="showPreviewDialog" 
      :header="selectedDocument?.name || 'Предварительный просмотр'"
      :modal="true"
      :style="{ width: '800px' }"
    >
      <div v-if="selectedDocument" class="document-preview">
        <div class="preview-info">
          <div class="preview-meta">
            <div class="meta-item">
              <span class="meta-label">Тип:</span>
              <span class="meta-value">{{ selectedDocument.typeLabel }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Размер:</span>
              <span class="meta-value">{{ selectedDocument.size }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Загружен:</span>
              <span class="meta-value">{{ selectedDocument.uploadDate }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Скачиваний:</span>
              <span class="meta-value">{{ selectedDocument.downloads }}</span>
            </div>
          </div>
          <div class="preview-description">
            <h4>Описание</h4>
            <p>{{ selectedDocument.description }}</p>
          </div>
        </div>
        
        <div class="preview-content">
          <div v-if="isImageFile(selectedDocument.type)" class="image-preview">
            <img :src="selectedDocument.previewUrl" :alt="selectedDocument.name" />
          </div>
          <div v-else class="file-preview">
            <i :class="getFileIcon(selectedDocument.type)" class="preview-icon"></i>
            <p>Предварительный просмотр недоступен для данного типа файла</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Закрыть" 
          icon="pi pi-times" 
          class="p-button-text"
          @click="closePreview"
        />
        <Button 
          label="Скачать" 
          icon="pi pi-download" 
          class="p-button-primary"
          @click="downloadDocument(selectedDocument)"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'

export default {
  name: 'ExpertDocuments',
  components: {
    Button,
    Dialog,
    FileUpload,
    InputText,
    Dropdown
  },
  data() {
    return {
      searchQuery: '',
      selectedType: null,
      selectedStatus: null,
      showPreviewDialog: false,
      selectedDocument: null,
      uploadUrl: '/api/upload', // Замените на реальный URL
      competencyName: 'Анализ данных',
      competencyDescription: 'Изучение основ анализа данных и визуализации',
      typeOptions: [
        { label: 'Презентация', value: 'presentation' },
        { label: 'Документ', value: 'document' },
        { label: 'Таблица', value: 'spreadsheet' },
        { label: 'Изображение', value: 'image' },
        { label: 'PDF', value: 'pdf' }
      ],
      statusOptions: [
        { label: 'Опубликован', value: 'published' },
        { label: 'Черновик', value: 'draft' },
        { label: 'На модерации', value: 'moderation' }
      ],
      documentsStats: {
        total: 24,
        uploaded: 18,
        downloads: 156,
        recent: 8
      },
      documents: [
        {
          id: 1,
          name: 'Введение в анализ данных.pdf',
          type: 'pdf',
          typeLabel: 'PDF документ',
          size: '2.3 МБ',
          uploadDate: '10.12.2024',
          description: 'Основные понятия и методы анализа данных для начинающих',
          downloads: 45,
          views: 78,
          lastAccess: '2 дня назад',
          tags: ['учебный материал', 'основы'],
          status: 'published',
          previewUrl: '/preview/1'
        },
        {
          id: 2,
          name: 'Практические задания.xlsx',
          type: 'spreadsheet',
          typeLabel: 'Таблица Excel',
          size: '1.8 МБ',
          uploadDate: '08.12.2024',
          description: 'Набор практических заданий для закрепления материала',
          downloads: 32,
          views: 56,
          lastAccess: '1 день назад',
          tags: ['задания', 'практика'],
          status: 'published',
          previewUrl: '/preview/2'
        },
        {
          id: 3,
          name: 'Визуализация данных.pptx',
          type: 'presentation',
          typeLabel: 'Презентация PowerPoint',
          size: '5.2 МБ',
          uploadDate: '05.12.2024',
          description: 'Слайды по созданию графиков и дашбордов',
          downloads: 28,
          views: 42,
          lastAccess: '3 дня назад',
          tags: ['презентация', 'визуализация'],
          status: 'published',
          previewUrl: '/preview/3'
        },
        {
          id: 4,
          name: 'Примеры кода Python.txt',
          type: 'document',
          typeLabel: 'Текстовый документ',
          size: '0.5 МБ',
          uploadDate: '03.12.2024',
          description: 'Готовые примеры кода для анализа данных',
          downloads: 51,
          views: 89,
          lastAccess: '1 день назад',
          tags: ['код', 'python', 'примеры'],
          status: 'published',
          previewUrl: '/preview/4'
        }
      ]
    }
  },
  computed: {
    filteredDocuments() {
      let filtered = this.documents
      
      // Поиск по названию
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(d => d.name.toLowerCase().includes(query))
      }
      
      // Фильтр по типу
      if (this.selectedType) {
        filtered = filtered.filter(d => d.type === this.selectedType)
      }
      
      // Фильтр по статусу
      if (this.selectedStatus) {
        filtered = filtered.filter(d => d.status === this.selectedStatus)
      }
      
      return filtered
    }
  },
  methods: {
    getFileIcon(type) {
      const icons = {
        'pdf': 'pi pi-file-pdf',
        'document': 'pi pi-file-word',
        'presentation': 'pi pi-file-powerpoint',
        'spreadsheet': 'pi pi-file-excel',
        'image': 'pi pi-image',
        'text': 'pi pi-file'
      }
      return icons[type] || 'pi pi-file'
    },
    isImageFile(type) {
      return type === 'image'
    },
    onFileSelect(event) {
      console.log('Выбраны файлы:', event.files)
    },
    onUpload(event) {
      console.log('Загрузка завершена:', event)
      // Обновить список документов
    },
    downloadDocument(document) {
      console.log('Скачивание документа:', document.name)
      // Логика скачивания
    },
    previewDocument(document) {
      this.selectedDocument = document
      this.showPreviewDialog = true
    },
    closePreview() {
      this.showPreviewDialog = false
      this.selectedDocument = null
    },
    deleteDocument(document) {
      console.log('Удаление документа:', document.name)
      // Логика удаления
    },
    resetFilters() {
      this.searchQuery = ''
      this.selectedType = null
      this.selectedStatus = null
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

.header-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #ff9800;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.3s ease;
}

.breadcrumb-link:hover {
  color: #f57c00;
}

.breadcrumb-separator {
  color: #6c757d;
  font-size: 0.8rem;
}

.breadcrumb-current {
  color: #6c757d;
  font-weight: 500;
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

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.upload-section {
  margin-bottom: 2rem;
}

.upload-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.upload-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
}

.upload-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.upload-content {
  padding: 1.5rem;
}

.file-upload {
  margin-bottom: 1rem;
}

.upload-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.upload-text {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
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

.search-group {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding-right: 2.5rem;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
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
  border-radius: 8px;
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
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.document-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.document-content {
  padding: 1.5rem;
}

.document-description {
  margin-bottom: 1.5rem;
}

.document-description p {
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

.document-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.stat-item i {
  color: #ff9800;
}

.document-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.document-tag {
  background: #f8f9fa;
  color: #2c3e50;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e9ecef;
}

/* Диалог предварительного просмотра */
.document-preview {
  padding: 1rem 0;
}

.preview-info {
  margin-bottom: 2rem;
}

.preview-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.meta-label {
  color: #6c757d;
  font-weight: 500;
}

.meta-value {
  color: #2c3e50;
  font-weight: 500;
}

.preview-description h4 {
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.preview-description p {
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

.preview-content {
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.file-preview {
  padding: 3rem;
  color: #6c757d;
}

.preview-icon {
  font-size: 4rem;
  color: #ff9800;
  margin-bottom: 1rem;
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
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-group {
    min-width: auto;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .document-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .document-actions {
    justify-content: center;
  }
  
  .document-stats {
    justify-content: center;
  }
  
  .preview-meta {
    grid-template-columns: 1fr;
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
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .document-content {
    padding: 1rem;
  }
  
  .document-stats {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>
