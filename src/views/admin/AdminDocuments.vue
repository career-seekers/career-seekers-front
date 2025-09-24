<template>
  <div class="documents-page">
    <div class="page-header">
      <h1 class="page-title">
        Документы
      </h1>
      <p class="page-subtitle">
        Управление документами компетенций
      </p>
    </div>

    <DocumentsTemplates />

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

      <!-- Фильтры -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="typeFilter">Тип документа:</label>
          <Dropdown
            id="typeFilter"
            v-model="selectedType"
            :options="DocumentTypes"
            option-label="label"
            option-value="value"
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
              {{ slotProps ? slotProps.option.name : "Не выбран" }}
            </template>
            <template #value="{ value }">
              {{ value ? value.name : "Все компетенции" }}
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
              Документ №{{ document.id }}
            </h3>
          </div>
          <div class="document-actions">
            <Button
              v-tooltip="'Просмотреть'"
              icon="pi pi-eye"
              style="background: white;"
              class="p-button-text p-button-sm"
              @click="viewDocument(document)"
            />
            <Button
              v-tooltip="'Скачать'"
              icon="pi pi-download"
              style="background: white"
              class="p-button-text p-button-sm"
              @click="downloadDocument(document)"
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
              <span class="detail-label">Тип:</span>
              <span class="detail-value">{{
                DocumentTypes.find((type) => type.value === document.documentType)?.label
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Дата загрузки:</span>
              <span class="detail-value">{{
                document.createdAt.substring(0, 10)
              }}</span>
            </div>
            <div
              v-if="document"
              class="detail-item"
            >
              <span class="detail-label">Компетенция:</span>
              <span class="detail-value">{{
                documentCompetence(document)?.name
              }}</span>
            </div>
          </div>

          <div
            v-if="documentExpert(document)"
            class="mentor-info"
          >
            <h4 class="mentor-title">
              Связанный эксперт:
            </h4>
            <p class="mentor-name">
              {{
                documentExpert(document)?.lastName +
                  " " +
                  documentExpert(document)?.firstName +
                  " " +
                  documentExpert(document)?.patronymic
              }}
            </p>
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

    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
  import Button from "primevue/button";
  import Dialog from "primevue/dialog";
  import Dropdown from "primevue/dropdown";
  import { FileResolver, FileType } from "@/api/resolvers/files/file.resolver";
  import { AgeCategories, CompetenceResolver } from '@/api/resolvers/competence/competence.resolver';
  import ToastPopup from "@/components/ToastPopup.vue";
  import { UserResolver } from "@/api/resolvers/user/user.resolver";
  import type { CompetenceDocumentsOutputDto } from "@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto.ts";
  import type { CompetenceOutputDto } from "@/api/resolvers/competence/dto/output/competence-output.dto.ts";
  import { CompetenceDocumentsResolver } from "@/api/resolvers/competenceDocuments/competence-documents.resolver";
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import type { DocumentsOutputDto } from '@/api/resolvers/competence/dto/output/documents-output.dto.ts';
  import apiConf from '@/api/api.conf.ts';
  import { DocumentTemplates } from '@/shared/DocumentTemplates.ts';
  import { DocumentTypes } from '@/shared/DocumentTypes.ts';
  import DocumentsTemplates from '@/components/DocumentsTemplates.vue';

  export default {
    name: "AdminDocuments",
    components: {
      DocumentsTemplates,
      ToastPopup,
      Button,
      Dialog,
      Dropdown,
    },
    data() {
      return {
        fileResolver: new FileResolver(),
        filePreview: null,
        competenceResolver: new CompetenceResolver(),
        userResolver: new UserResolver(),
        showUploadDialog: false,
        showLinkDialog: false,
        selectedDocument: null as CompetenceDocumentsOutputDto | null,
        selectedType: null as null | FileType,
        selectedCompetence: localStorage.getItem("selectedCompetence")
          ? JSON.parse(localStorage.getItem("selectedCompetence") as string)
          : (null as CompetenceOutputDto | null),
        documents: [] as CompetenceDocumentsOutputDto[],
        competencies: [] as CompetenceOutputDto[],
        experts: [] as UserOutputDto[],
        DocumentTemplates,
        DocumentTypes,
        errors: {
          toastPopup: {
            title: "",
            message: "",
          },
        },
        ageGroups: [
          {value: AgeCategories.EARLY_PRESCHOOL, label: "4-5 лет"},
          {value: AgeCategories.PRESCHOOL, label: "6-7 лет"},
          {value: AgeCategories.EARLY_SCHOOL, label: "7-8 лет"},
          {value: AgeCategories.SCHOOL, label: "9-11 лет"},
          {value: AgeCategories.HIGH_SCHOOL, label: "12-13 лет"},
        ],
        selectedAge: null as null | AgeCategories,
        showPreviewDialog: false,
        competenceDocumentsResolver: new CompetenceDocumentsResolver(),
      };
    },
    computed: {
      filteredDocuments() {
        let filtered = this.documents;

        if (this.selectedType) {
          filtered = filtered.filter(
            (doc) => doc.documentType === this.selectedType,
          );
        }

        if (this.selectedCompetence) {
          filtered = filtered.filter(
            (doc) => this.selectedCompetence === this.documentCompetence(doc),
          );
        }

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
    async mounted() {
      await this.loadCompetencies();
    },
    methods: {
      documentCompetence(document: DocumentsOutputDto): CompetenceOutputDto | undefined {
        return this.competencies.find((competence: CompetenceOutputDto) =>
          competence.documents.some((doc) => doc.id === document.id),
        );
      },
      documentExpert(document: CompetenceDocumentsOutputDto) {
        return this.experts.find((expert) => expert.id === document.userId);
      },
      viewDocument(doc: CompetenceDocumentsOutputDto) {
        this.selectedDocument = doc;
        window.open(`${apiConf.endpoint}/file-service/v1/files/view/${doc.documentId}`, "_blank");
      },
      downloadDocument(doc: CompetenceDocumentsOutputDto) {
        window.location.href = `${apiConf.endpoint}/file-service/v1/files/download/${doc.documentId}`;
      },
      async deleteDocument(document: CompetenceDocumentsOutputDto) {
        if (
          confirm(`Вы уверены, что хотите удалить документ "${document.documentId}"?`)
        ) {
          const response = await this.competenceDocumentsResolver.delete(
            document.id,
          );
          if (response.status === 200) {
            this.competencies = [];
            this.documents = [];
            this.experts = [];
            await this.loadCompetencies();
          }
        }
      },
      resetFilters() {
        this.selectedType = null;
        this.selectedCompetence = null;
      },
      async loadCompetencies() {
        const response = await this.competenceResolver.getAll();
        if (response.status === 200 && typeof response.message !== "string") {
          response.message.forEach((competence) => {
            if (competence.documents.length > 0) {
              this.competencies.push(competence);
              competence.documents.forEach(async (document) => {
                this.documents.push({
                  createdAt: document.createdAt,
                  direction: {
                    ageCategories: competence.ageCategories,
                    description: competence.description,
                    iconId: competence.iconId,
                    id: competence.id,
                    name: competence.name,
                    userId: competence.userId
                  },
                  documentType: document.documentType,
                  ageCategory: document.ageCategory,
                  id: document.id,
                  userId: document.userId,
                  documentId: document.documentId
                });
                const response = await this.userResolver.getById(document.userId);
                if (response.status === 200 && typeof response.message !== "string") {
                  this.experts.push(response.message);
                }
              });
            }
          });
        }
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
