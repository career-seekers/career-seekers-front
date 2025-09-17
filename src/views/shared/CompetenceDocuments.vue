<template>
  <div
    class="documents-page"
    :style="documents.length > 0 ? 'min-height: 150vh;' : ''"
  >
    <div class="page-header">
      <div
        v-if="competence"
        class="header-content"
      >
        <div class="breadcrumb">
          <router-link
            to="/expert/competencies"
            class="breadcrumb-link"
          >
            <i class="pi pi-briefcase" />
            Компетенции
          </router-link>
          <i class="pi pi-chevron-right breadcrumb-separator" />
          <span class="breadcrumb-current">{{ competence.name }}</span>
        </div>
        <h1 class="page-title">
          Документы компетенции
        </h1>
        <p class="page-subtitle">
          {{ competence.description }}
        </p>
      </div>
    </div>

    <!-- Статистика -->
    <!--    <div class="stats-section">-->
    <!--      <div class="stats-grid">-->
    <!--        <div class="stat-card">-->
    <!--          <div class="stat-icon">-->
    <!--            <i class="pi pi-file-text"></i>-->
    <!--          </div>-->
    <!--          <div class="stat-content">-->
    <!--            <div class="stat-number">{{ documentsStats.total }}</div>-->
    <!--            <div class="stat-label">Всего документов</div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="stat-card">-->
    <!--          <div class="stat-icon">-->
    <!--            <i class="pi pi-upload"></i>-->
    <!--          </div>-->
    <!--          <div class="stat-content">-->
    <!--            <div class="stat-number">{{ documentsStats.uploaded }}</div>-->
    <!--            <div class="stat-label">Загружено</div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="stat-card">-->
    <!--          <div class="stat-icon">-->
    <!--            <i class="pi pi-download"></i>-->
    <!--          </div>-->
    <!--          <div class="stat-content">-->
    <!--            <div class="stat-number">{{ documentsStats.downloads }}</div>-->
    <!--            <div class="stat-label">Скачиваний</div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="stat-card">-->
    <!--          <div class="stat-icon">-->
    <!--            <i class="pi pi-clock"></i>-->
    <!--          </div>-->
    <!--          <div class="stat-content">-->
    <!--            <div class="stat-number">{{ documentsStats.recent }}</div>-->
    <!--            <div class="stat-label">За последнюю неделю</div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->

    <div class="docs">
      <!--    Шаблоны документов-->
      <div class="upload-section">
        <div class="upload-card">
          <div class="upload-header">
            <h3 class="upload-title">
              <i class="pi pi-file-edit" />
              Шаблоны документов
            </h3>
          </div>
          <div class="download-content">
            <div class="download-list">
              <div
                v-for="template in docTemplates"
                :key="template.link"
                class="download-info"
              >
                <p class="download-text">
                  {{ template.label }}
                </p>
                <a
                  class="p-button p-button-primary download-link"
                  :href="`/docs/${template.link}`"
                  :download="`${template.label}.${template.link.split('.')[1]}`"
                >
                  Скачать
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Загрузка документов -->
      <div class="upload-section">
        <div class="upload-card">
          <div class="upload-header">
            <h3 class="upload-title">
              <i class="pi pi-upload" />
              Загрузить документы
            </h3>
          </div>
          <div class="upload-content">
            <Dropdown
              v-model="uploadingType"
              :options="docTypes"
              option-label="label"
              option-value="value"
              placeholder="Тип документа"
              class="filter-dropdown filter-upload"
            />
            <Dropdown
              v-model="uploadingAge"
              :options="ageGroups"
              option-label="label"
              option-value="value"
              placeholder="Возрастная группа"
              class="filter-dropdown filter-upload"
            />
            <FileUpload
              :key="uploadKey"
              mode="basic"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png"
              :max-file-size="10000000"
              :multiple="false"
              choose-label="Выбрать файл"
              class="file-upload"
              @select="onDocumentSelect"
            />
            <div class="upload-info">
              <p class="upload-text">
                Поддерживаемые форматы: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT,
                JPG, PNG
              </p>
              <p class="upload-text">
                Максимальный размер файла: 10 МБ
              </p>
            </div>
            <Button
              type="submit"
              label="Загрузить"
              class="p-button-outlined submit-upload"
              :disabled="uploadingType === null || uploadingDocument === null || uploadingAge === null"
              @click="uploadDocument"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="availableAges.length > 0"
      class="settings-section"
    >
      <div class="filters-section flex column-gap-5">
        <Button
          v-for="age in availableAges"
          :key="age"
          :class="selectedAge === age ? 'p-button' : 'p-button-outlined'"
          :label="ageGroups.find(group => group.value === age)?.label"
          @click="selectedAge = age"
        />
      </div>

      <!-- Фильтры и поиск -->
      <div class="filters-section">
        <div class="filter-group">
          <Dropdown
            v-model="selectedType"
            :options="docTypes"
            option-label="label"
            option-value="value"
            placeholder="Все типы"
            class="filter-dropdown"
          />
        </div>
        <div class="filter-group" style="margin-left: auto">
          <Button
            label="Сбросить фильтры"
            icon="pi pi-refresh"
            class="p-button-text p-button-sm"
            @click="resetFilters"
          />
        </div>
      </div>
    </div>

    <!-- Список документов -->
    <div class="documents-grid">
      <div
        v-for="document in filteredDocuments"
        :key="document.id"
        class="document-card"
      >
        <div class="document-header">
          <div class="document-icon">
            <i class="pi pi-file" />
          </div>
          <div class="document-info">
            <h3 class="document-name">
              {{ docTypes.find(docType => docType.value === document.documentType)?.label }}
            </h3>
            <p class="document-type">
              {{ docTypes.find(docType => docType.value === document.documentType)?.value }}
            </p>
            <div class="document-meta">
              <span class="document-size">#{{ document.documentId }}</span>
              <span class="document-date">{{ document.createdAt.substring(0, 10) }}</span>
            </div>
          </div>
          <div class="document-actions">
            <Button
              v-tooltip="'Скачать'"
              icon="pi pi-download"
              style="background: white"
              class="p-button-text p-button-sm"
              @click="downloadDocument(document)"
            />
            <Button
              v-tooltip="'Предварительный просмотр'"
              icon="pi pi-eye"
              style="background: white"
              class="p-button-text p-button-sm"
              @click="previewDocument(document)"
            />
            <Button
              v-tooltip="'Удалить'"
              icon="pi pi-trash"
              style="background: white"
              class="p-button-text p-button-sm p-button-danger"
              @click="deleteDocument(document)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Button from "primevue/button";
  import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
  import Dropdown from "primevue/dropdown";
  import { FileType } from '@/api/resolvers/files/file.resolver.ts';
  import type { DocumentsOutputDto } from '@/api/resolvers/competence/dto/output/documents-output.dto.ts';
  import { CompetenceDocumentsResolver } from '@/api/resolvers/competenceDocuments/competence-documents.resolver.ts';
  import { UserState } from '@/state/UserState.ts';
  import { AgeCategories, CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { ref } from 'vue';
  import apiConf from '@/api/api.conf.ts';
  import type {
    CompetenceDocumentsOutputDto
  } from '@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto.ts';

  export default {
    name: "CompetenceDocuments",
    components: {
      Button,
      FileUpload,
      Dropdown,
    },
    props: {
      competenceId: {
        type: String,
        required: true,
      }
    },
    data() {
      return {
        uploadKey: ref(0),
        selectedType: null as null | FileType,
        selectedDocument: null as null | DocumentsOutputDto,
        uploadingType: null,
        uploadingDocument: null as null | File,
        competence: null as null | CompetenceOutputDto,
        competenceResolver: new CompetenceResolver(),
        competenceDocumentsResolver: new CompetenceDocumentsResolver(),
        docTypes: [
          { label: "Конкурсное задание", value: FileType.TASK },
          { label: "Критерии оценок", value: FileType.CRITERIA },
          { label: "Итоговая ведомость", value: FileType.STATEMENT },
          { label: "Конкурсное задание финала", value: FileType.FINAL_TASK },
          { label: "Критерии оценок финала", value: FileType.FINAL_CRITERIA },
          { label: "Итоговая ведомость", value: FileType.FINAL_STATEMENT },
          { label: "Полное описание компетенции", value: FileType.DESCRIPTION },
        ],
        uploadingAge: null as AgeCategories | null,
        selectedAge: null as AgeCategories | null,
        docTemplates: [
          { label: "Конкурсное задание ОЧНОГО отборочного этапа", link: "task_offline_template.docx" },
          { label: "Конкурсное задание ОНЛАЙН отборочного этапа", link: "task_online_template.docx" },
          { label: "Лист регистрации для очных мероприятий", link: "registration_list_offline_events_template.docx" },
          { label: "Критерии оценки", link: "criteria_template.xlsx" },
        ],
        ageGroups: [
          {value: AgeCategories.EARLY_PRESCHOOL, label: "4-5 лет"},
          {value: AgeCategories.PRESCHOOL, label: "6-7 лет"},
          {value: AgeCategories.EARLY_SCHOOL, label: "7-8 лет"},
          {value: AgeCategories.SCHOOL, label: "9-11 лет"},
          {value: AgeCategories.HIGH_SCHOOL, label: "12-13 лет"},
        ],
        documents: [] as CompetenceDocumentsOutputDto[],
      };
    },
    computed: {
      apiConf() {
        return apiConf
      },
      filteredDocuments() {
        let filtered = this.documents;
        // Фильтр по типу
        if (this.selectedType) {
          filtered = filtered.filter((d) => d.documentType === this.selectedType);
        }
        // Фильтр по возрастной группе
        if (this.selectedAge) {
          filtered = filtered.filter((d) => d.ageCategory === this.selectedAge);
        }
        return filtered;
      },
      availableAges() {
        const ageOrder = new Map(this.ageGroups.map((group, index) => [group.value, index]));
        return [...new Set(this.documents.map(doc => doc.ageCategory))].toSorted((a, b) => {
          return ageOrder.get(a)!! - ageOrder.get(b)!!;
        });
      }
    },
    async beforeMount() {
      const response = await this.competenceResolver.getById(parseInt(this.$props.competenceId));
      if (typeof response.message !== "string") {
        this.competence = response.message;
        await this.loadDocuments()
      }
    },
    methods: {
      async loadDocuments() {
        this.documents = []
        const response = await this.competenceDocumentsResolver
          .getAllByCompetenceId(parseInt(this.$props.competenceId))
        if (typeof response.message !== "string") {
          this.documents = response.message
          this.selectedAge = this.availableAges.length > 0
            ? this.availableAges[0]
            : null
        }
      },
      async uploadDocument() {
        if (!this.uploadingDocument || !this.uploadingType || !UserState.id) {
          alert("Пожалуйста, выберите документ, тип документа и убедитесь, что вы авторизованы.");
          return;
        }
        const response = await this.competenceDocumentsResolver.create({
          document: this.uploadingDocument,
          ageCategory: this.uploadingAge!,
          documentType: this.uploadingType,
          userId: UserState.id,
          directionId: parseInt(this.$props.competenceId),
        })
        if (typeof response.message !== "string") {
          this.uploadingType = null
          this.uploadingDocument = null
          this.uploadKey++
          this.uploadingAge = null
          await this.loadDocuments()
        }
      },
      onDocumentSelect(event: FileUploadSelectEvent) {
        this.uploadingDocument = event.files[0];
        console.log("Выбраны файлы:", event.files);
      },
      downloadDocument(doc: DocumentsOutputDto) {
        const a = document.createElement("a");
        a.href = `${apiConf.endpoint}/file-service/v1/files/download/${doc.documentId}`
        document.body.appendChild(a);
        a.click()
        document.body.removeChild(a);
      },
      previewDocument(doc: DocumentsOutputDto) {
        this.selectedDocument = doc;
        const a = document.createElement("a");
        a.href = `${apiConf.endpoint}/file-service/v1/files/view/${doc.documentId}`
        a.target = "_blank";
        document.body.appendChild(a);
        a.click()
        document.body.removeChild(a);
      },
      async deleteDocument(document: DocumentsOutputDto) {
        const response = await this.competenceDocumentsResolver.delete(document.id)
        if (response.status === 200) {
          await this.loadDocuments()
        }
      },
      resetFilters() {
        this.selectedType = null;
      },
    },
  };
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
    font-family: "BIPS", sans-serif;
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
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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

  .docs, .settings-section {
    display: grid;
    gap: 1.5rem;
    column-gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));

    .upload-section {
      width: 100%;
      height: 57vh;
      margin-bottom: 2rem;
    }
  }

  .download-content {
    padding: 1.5rem 0.4rem;
    height: 80%;
    overflow: hidden;
  }

  .download-list {
    height: 100%;
    padding: 0 1.1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.5rem;
    overflow: scroll;
  }

  .download-info {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 1.5rem;
    border-radius: 10px;
    background: #f8f9fa;

    .download-text {
      font-size: 1rem;
      width: 55%;
      height: min-content;
      margin: 0;
    }

    .download-link {
      text-decoration: none;
      font-weight: 500
    }
  }

  .upload-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    height: 100%
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem;
    height: 80%;
  }

  .file-upload {
    margin-bottom: 1rem;
  }

  :deep(.p-button.p-fileupload-choose) {
    width: 100%;
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
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease;
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
