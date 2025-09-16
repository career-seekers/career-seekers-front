<template>
  <div class="documents-page">
    <div class="page-header">
      <h1 class="page-title">
        Документы
      </h1>
      <p class="page-subtitle">
        Управление документами, подтверждающими экспертность
      </p>
    </div>

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

    <!-- Фильтры -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="typeFilter">Тип документа:</label>
        <Dropdown
          id="typeFilter"
          v-model="selectedType"
          :options="docTypes"
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
                docTypes.find((type) => type.value === document.documentType)?.label
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
import { CompetenceResolver } from "@/api/resolvers/competence/competence.resolver";
import { UserState } from "@/state/UserState";
import ToastPopup from "@/components/ToastPopup.vue";
import { UserResolver } from "@/api/resolvers/user/user.resolver";
import type { CompetenceDocumentsOutputDto } from "@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto.ts";
import type { CompetenceOutputDto } from "@/api/resolvers/competence/dto/output/competence-output.dto.ts";
import { CompetenceDocumentsResolver } from "@/api/resolvers/competenceDocuments/competence-documents.resolver";
import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
import type { DocumentsOutputDto } from '@/api/resolvers/competence/dto/output/documents-output.dto.ts';
import apiConf from '@/api/api.conf.ts';

export default {
  name: "TutorDocuments",
  components: {
    ToastPopup,
    Button,
    Dialog,
    Dropdown,
  },
  props: {
    competenceId: {
      type: String,
      required: false,
      default: undefined
    }
  },
  data: function () {
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
      docTypes: [
        { label: "Конкурсное задание отборочного этапа", value: FileType.TASK },
        { label: "Критерии оценок отборочного этапа", value: FileType.CRITERIA },
        { label: "Итоговая ведомость отборочного этапа", value: FileType.STATEMENT },
        { label: "Конкурсное задание финала", value: FileType.FINAL_TASK },
        { label: "Критерии оценок финала", value: FileType.FINAL_CRITERIA },
        { label: "Итоговая ведомость", value: FileType.FINAL_STATEMENT },
        { label: "Полное описание компетенции", value: FileType.DESCRIPTION },
      ],
      docTemplates: [
        { label: "Конкурсное задание ОЧНОГО отборочного этапа", link: "task_offline_template.docx" },
        { label: "Конкурсное задание ОНЛАЙН отборочного этапа", link: "task_online_template.docx" },
        { label: "Лист регистрации для очных мероприятий", link: "registration_list_offline_events_template.docx" },
        { label: "Критерии оценки", link: "criteria_template.xlsx" },
      ],
      errors: {
        toastPopup: {
          title: "",
          message: "",
        },
      },
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

      return filtered;
    },
  },
  async mounted() {
    await this.loadCompetencies();
  },
  methods: {
    documentCompetence(document: DocumentsOutputDto): CompetenceOutputDto | undefined {
      const competence = this.competencies.find((competence: CompetenceOutputDto) =>
        competence.documents.some((doc) => doc.id === document.id),
      );
      if (competence) return competence;
      return undefined
    },
    documentExpert(document: CompetenceDocumentsOutputDto) {
      return this.experts.find((expert) => expert.id === document.userId);
    },
    viewDocument(doc: CompetenceDocumentsOutputDto) {
      this.selectedDocument = doc;
      const a = document.createElement("a");
      a.href = `${apiConf.endpoint}/file-service/v1/files/view/${doc.documentId}`
      a.target = "_blank";
      document.body.appendChild(a);
      a.click()
      document.body.removeChild(a);
    },
    downloadDocument(doc: CompetenceDocumentsOutputDto) {
      const a = document.createElement("a");
      a.href = `${apiConf.endpoint}/file-service/v1/files/download/${doc.documentId}`
      document.body.appendChild(a);
      a.click()
      document.body.removeChild(a);
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
      const response = await this.competenceResolver.getAllByUserId(
        UserState.id!,
      );
      if (response.status === 200 && typeof response.message !== "string") {
        response.message.forEach((competence) => {
          if (this.$props.competenceId && competence.id === parseInt(this.$props.competenceId))
            this.selectedCompetence = competence;
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

.upload-section {
  height: 40vh;
  margin-bottom: 2rem;
  width: 100%;
}

.download-content {
  padding: 1.5rem 0.4rem;
  height: 80%;
  overflow: hidden;
}

.download-list {
  height: 100%;
  padding: 0 1.1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(324px, 1fr));
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
}

.download-link {
  text-decoration: none;
  font-weight: 500
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
