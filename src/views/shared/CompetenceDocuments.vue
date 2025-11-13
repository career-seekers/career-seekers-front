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
      <DocumentsTemplates :expanded="true" />

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
              :options="DocumentTypes"
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

    <!-- Toast уведомление -->
    <ToastPopup
      v-if="toastContent.title && toastContent.message"
      :content="toastContent"
    />

    <!-- Диалог подтверждения -->
    <ConfirmationModal ref="confirmationModal" />

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
            :options="DocumentTypes"
            option-label="label"
            option-value="value"
            placeholder="Все типы"
            class="filter-dropdown"
          />
        </div>
        <div
          class="filter-group"
          style="margin-left: auto"
        >
          <Button
            label="Сбросить фильтры"
            icon="pi pi-refresh"
            class="p-button-text p-button-sm"
            @click="resetFilters"
          />
        </div>
      </div>
    </div>

    <!-- Табы для документов -->
    <TabView class="documents-tabs">
      <TabPanel header="Проверены">
        <div
          v-if="acceptedDocuments.length === 0"
          class="empty-state"
        >
          <i
            class="pi pi-file-o"
            style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"
          />
          <h3>Нет проверенных документов</h3>
          <p>Документы, которые прошли проверку</p>
        </div>
        <div
          v-else
          class="documents-grid"
        >
          <div
            v-for="document in acceptedDocuments"
            :key="document.id"
            class="document-card"
          >
            <div class="document-header">
              <div class="document-icon">
                <i class="pi pi-file" />
              </div>
              <div class="document-info">
                <h3 class="document-name">
                  {{ DocumentTypes.find(docType => docType.value === document.documentType)?.label }}
                </h3>
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
            
            <div class="document-content">
              <div class="document-details">
                <div class="detail-item">
                  <span class="detail-label">Тип документа:</span>
                  <span class="detail-value">{{ DocumentTypes.find(docType => docType.value === document.documentType)?.label }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Возрастная группа:</span>
                  <span class="detail-value">{{ ageGroups.find(group => document.ageCategory === group.value)?.label }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Дата загрузки:</span>
                  <span class="detail-value">{{ document.createdAt.substring(0, 10) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">ID документа:</span>
                  <span class="detail-value">#{{ document.documentId }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      
      <TabPanel header="На проверке">
        <div
          v-if="uncheckedDocuments.length === 0"
          class="empty-state"
        >
          <i
            class="pi pi-file-o"
            style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"
          />
          <h3>Нет документов на проверке</h3>
          <p>Документы, ожидающие проверки</p>
        </div>
        <div
          v-else
          class="documents-grid"
        >
          <div
            v-for="document in uncheckedDocuments"
            :key="document.id"
            class="document-card"
          >
            <div class="document-header">
              <div class="document-icon">
                <i class="pi pi-file" />
              </div>
              <div class="document-info">
                <h3 class="document-name">
                  {{ DocumentTypes.find(docType => docType.value === document.documentType)?.label }}
                </h3>
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
            
            <div class="document-content">
              <div class="document-details">
                <div class="detail-item">
                  <span class="detail-label">Тип документа:</span>
                  <span class="detail-value">{{ DocumentTypes.find(docType => docType.value === document.documentType)?.label }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Возрастная группа:</span>
                  <span class="detail-value">{{ ageGroups.find(group => document.ageCategory === group.value)?.label }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Дата загрузки:</span>
                  <span class="detail-value">{{ document.createdAt.substring(0, 10) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">ID документа:</span>
                  <span class="detail-value">#{{ document.documentId }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      
      <TabPanel header="Отклоненные">
        <div
          v-if="rejectedDocuments.length === 0"
          class="empty-state"
        >
          <i
            class="pi pi-file-o"
            style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"
          />
          <h3>Нет отклоненных документов</h3>
          <p>Документы, которые были отклонены</p>
        </div>
        <div
          v-else
          class="documents-grid"
        >
          <div
            v-for="document in rejectedDocuments"
            :key="document.id"
            class="document-card"
          >
            <div class="document-header">
              <div class="document-icon">
                <i class="pi pi-file" />
              </div>
              <div class="document-info">
                <h3 class="document-name">
                  {{ DocumentTypes.find(docType => docType.value === document.documentType)?.label }}
                </h3>
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
            
            <div class="document-content">
              <div class="document-details">
                <div class="detail-item">
                  <span class="detail-label">Тип документа:</span>
                  <span class="detail-value">{{ DocumentTypes.find(docType => docType.value === document.documentType)?.label }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Возрастная группа:</span>
                  <span class="detail-value">{{ ageGroups.find(group => document.ageCategory === group.value)?.label }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Дата загрузки:</span>
                  <span class="detail-value">{{ document.createdAt.substring(0, 10) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">ID документа:</span>
                  <span class="detail-value">#{{ document.documentId }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script lang="ts">
  import Button from "primevue/button";
  import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
  import Dropdown from "primevue/dropdown";
  import TabView from "primevue/tabview";
  import TabPanel from "primevue/tabpanel";
  import { FileType } from '@/api/resolvers/files/file.resolver.ts';
  import type { DocumentsOutputDto } from '@/api/resolvers/competence/dto/output/documents-output.dto.ts';
  import { CompetenceDocumentsResolver } from '@/api/resolvers/competenceDocuments/competence-documents.resolver.ts';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { ref } from 'vue';
  import apiConf from '@/api/api.conf.ts';
  import type {
    CompetenceDocumentsOutputDto
  } from '@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto.ts';
  import { useDocumentTypes } from '@/shared/UseDocumentTypes.ts';
  import { useUserStore } from '@/stores/userStore.ts';
  import DocumentsTemplates from '@/components/DocumentsTemplates.vue';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import ToastPopup from '@/components/ToastPopup.vue';
  import ConfirmationModal from '@/components/ConfirmationModal.vue';

  import { AgeCategories } from '@/api/resolvers/ageCategory/dto/types.d';

  export default {
    name: "CompetenceDocuments",
    components: {
      DocumentsTemplates,
      Button,
      FileUpload,
      Dropdown,
      ToastPopup,
      ConfirmationModal,
      TabView,
      TabPanel,
    },
    props: {
      competenceId: {
        type: String,
        required: true,
      }
    },
    data() {
      return {
        user: useUserStore().user,
        DocumentTypes: useDocumentTypes,
        uploadKey: ref(0),
        selectedType: null as null | FileType,
        selectedDocument: null as null | DocumentsOutputDto,
        uploadingType: null,
        uploadingDocument: null as null | File,
        competence: null as null | CompetenceOutputDto,
        competenceResolver: new CompetenceResolver(),
        competenceDocumentsResolver: new CompetenceDocumentsResolver(),
        uploadingAge: null as AgeCategories | null,
        selectedAge: null as AgeCategories | null,
        ageGroups: useAgeGroups,
        documents: [] as CompetenceDocumentsOutputDto[],
        toastContent: {
          title: "",
          message: "",
        },
      };
    },
    computed: {
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
      },
      acceptedDocuments() {
        return this.filteredDocuments
          .filter(doc => doc.verified === true)
          .sort((a, b) => b.id - a.id);
      },
      uncheckedDocuments() {
        return this.filteredDocuments
          .filter(doc => doc.verified === null)
          .sort((a, b) => b.id - a.id);
      },
      rejectedDocuments() {
        return this.filteredDocuments
          .filter(doc => doc.verified === false)
          .sort((a, b) => b.id - a.id);
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
        if (!this.uploadingDocument || !this.uploadingType || this.user === null) {
          this.toastContent = {
            title: "Ошибка",
            message: "Пожалуйста, выберите документ, тип документа и убедитесь, что вы авторизованы."
          };
          return;
        }
        const response = await this.competenceDocumentsResolver.create({
          document: this.uploadingDocument,
          ageCategory: this.uploadingAge!,
          documentType: this.uploadingType,
          userId: this.user.id,
          directionId: parseInt(this.$props.competenceId),
        })
        if (typeof response.message !== "string") {
          this.uploadingType = null
          this.uploadingDocument = null
          this.uploadKey++
          this.uploadingAge = null
          await this.loadDocuments()
          // Показываем уведомление об успешной загрузке
          this.toastContent = {
            title: "Успешно!",
            message: "Документ был успешно загружен"
          };
          console.log("Toast показан:", this.toastContent);
        } else {
          // Показываем уведомление об ошибке
          this.toastContent = {
            title: "Ошибка",
            message: response.message
          };
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
      deleteDocument(document: DocumentsOutputDto) {
        const documentTypeLabel = this.DocumentTypes.find(docType => docType.value === document.documentType)?.label || 'документ';
        
        this.$refs.confirmationModal.showDeleteConfirmation(
          document,
          documentTypeLabel,
          async () => {
            try {
              const response = await this.competenceDocumentsResolver.delete(document.id);
              if (response.status === 200) {
                await this.loadDocuments();
                // Показываем уведомление об успешном удалении
                this.toastContent = {
                  title: "Успешно!",
                  message: "Документ был успешно удален"
                };
                console.log("Toast показан:", this.toastContent);
              } else {
                // Показываем уведомление об ошибке
                this.toastContent = {
                  title: "Ошибка",
                  message: "Не удалось удалить документ"
                };
              }
            } catch (error) {
              console.error("Ошибка при удалении документа:", error);
              this.toastContent = {
                title: "Ошибка",
                message: "Произошла ошибка при удалении документа"
              };
            }
          }
        );
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
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .document-card:hover {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
    border: 2px solid #ff9800;
  }

  .document-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .document-icon {
    width: 40px;
    height: 40px;
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
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .document-details {
    flex: 1;
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

  /* Стили для табов документов */
  .documents-tabs {
    margin-top: 2rem;
  }

  .documents-tabs :deep(.p-tabview-nav) {
    background: transparent;
    border-radius: 0;
    padding: 0.5rem 0;
  }

  .documents-tabs :deep(.p-tabview-nav li) {
    margin-right: 0.5rem;
  }

  .documents-tabs :deep(.p-tabview-nav li .p-tabview-nav-link) {
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .documents-tabs :deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
    background: #ff9800;
    color: white;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  }

  .documents-tabs :deep(.p-tabview-panels) {
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6c757d;
    font-size: 1.1rem;
  }

  .empty-state h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .empty-state p {
    margin: 0;
    font-size: 1rem;
  }

  .document-description p {
    color: #6c757d;
    line-height: 1.5;
    margin: 0;
  }

  .stat-item i {
    color: #ff9800;
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

  .image-preview img {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

    .filters-section {
      flex-direction: column;
      align-items: stretch;
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

    .document-content {
      padding: 1rem;
    }
  }
</style>
