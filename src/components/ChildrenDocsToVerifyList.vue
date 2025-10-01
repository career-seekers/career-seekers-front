<script lang="ts">
  import { type PropType } from 'vue';import apiConf from '@/api/api.conf.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { CompetenceDocumentsResolver } from '@/api/resolvers/competenceDocuments/competence-documents.resolver.ts';
  import Button from 'primevue/button';
  import Paginator from 'primevue/paginator';
  import { useChildrenDocumentTypes } from '@/shared/UseChildrenDocumentTypes.ts';
  import type { DocsOutputFileUploadDto } from '@/api/resolvers/files/dto/output/docs-output-file-upload.dto.ts';

  export type VerifyStatus = "ACCEPTED" | "REJECTED" | "UNCHECKED";
  export type DocPerChild = {
    child: {
      id: number,
      lastName: string,
      firstName: string,
      patronymic: string,
      dateOfBirth: string,
      user: {
        id: number,
        firstName: string,
        lastName: string,
        patronymic: string,
      } | null,
    },
    document: DocsOutputFileUploadDto
  }
  export default {
    name: 'ChildrenDocsToVerifyList',
    components: {
      Button,
      Paginator,
    },
    props: {
      verifyStatus: {
        type: String as PropType<VerifyStatus>,
        required: true,
      },
      documents: {
        type: Array as PropType<DocPerChild[]>,
        required: true,
      },
    },
    emits: ['update', 'delete', 'verify'],
    data() {
      return {
        userResolver: new UserResolver(),
        competenceDocumentsResolver: new CompetenceDocumentsResolver(),
        documentTypes: useChildrenDocumentTypes,
        ageGroups: useAgeGroups,
        // Пагинация
        currentPage: 0,
        itemsPerPage: 8,
      }
    },
    computed: {
      statusTitle() {
        switch (this.$props.verifyStatus) {
          case 'ACCEPTED': return "Принятые"
          case 'REJECTED': return "Отклоненные"
          default: return "Необработанные"
        }
      },

      paginatedDocuments() {
        const start = this.currentPage * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const result = this.documents.slice(start, end);
        console.log('DocsToVerifyList - paginatedDocuments:', result);
        console.log('DocsToVerifyList - total documents:', this.documents.length);
        console.log('DocsToVerifyList - currentPage:', this.currentPage);
        console.log('DocsToVerifyList - itemsPerPage:', this.itemsPerPage);
        return result;
      },

      totalRecords() {
        return this.documents.length;
      }
    },
    mounted() {
      console.log('DocsToVerifyList mounted with documents:', this.documents);
      console.log('DocsToVerifyList props:', this.$props);
    },
    methods: {
      viewDocument(docId: number) {
        window.open(`${apiConf.endpoint}/file-service/v1/files/view/${docId}`, "_blank");
      },
      downloadDocument(docId: number) {
        window.location.href = `${apiConf.endpoint}/file-service/v1/files/download/${docId}`;
      },
      verifyDocument(doc: DocsOutputFileUploadDto, status: boolean) {
        const action = status ? 'принять' : 'отклонить';
        const actionPast = status ? 'принят' : 'отклонен';
        
        this.$emit('verify', { 
          document: doc, 
          status: status,
          action,
          actionPast,
          showConfirm: true 
        });
      },
      deleteDocument(document: DocsOutputFileUploadDto) {
        this.$emit('delete', document);
      },

      onPageChange(event: any) {
        this.currentPage = event.page;
        this.itemsPerPage = event.rows;
        // Плавная прокрутка к началу списка
        this.$nextTick(() => {
          const grid = this.$el.querySelector('.documents-grid');
          if (grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      },

    }
  };
</script>

<template>
  <!-- Заголовок убран, так как теперь используется в табах -->

  <div
    v-if="documents.length > 0"
    class="documents-grid"
  >
    <div
      v-for="document in paginatedDocuments"
      :key="document.document.id"
      class="document-card"
    >
      <div class="document-header">
        <div class="document-icon">
          <i class="pi pi-file" />
        </div>
        <div class="document-info">
          <h3 class="document-name">
            Документ №{{ document.document.id }}
          </h3>
        </div>
        <div class="document-actions">
          <Button
            v-tooltip="'Просмотреть'"
            icon="pi pi-eye"
            style="background: white;"
            class="p-button-text p-button-sm"
            @click="viewDocument(document.document.id)"
          />
          <Button
            v-tooltip="'Скачать'"
            icon="pi pi-download"
            style="background: white"
            class="p-button-text p-button-sm"
            @click="downloadDocument(document.document.id)"
          />
          <Button
            v-tooltip="'Удалить'"
            icon="pi pi-trash"
            style="background: white"
            class="p-button-text p-button-sm p-button-danger"
            @click="deleteDocument(document.document)"
          />
        </div>
      </div>

      <div class="document-content">
        <div class="document-details">
          <div class="detail-item">
            <span class="detail-label">Тип:</span>
            <span class="detail-value">{{
              documentTypes.find((type) => type.value === document.document.fileType)?.label
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Тип документа:</span>
            <span class="detail-value">
              {{
                document.document.contentType
              }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Дата загрузки:</span>
            <span class="detail-value">{{
              document.document.createdAt.substring(0, 10)
            }}</span>
          </div>
          <div
            class="detail-item"
          >
            <span class="detail-label">Родитель:</span>
            <span class="detail-value">{{
              `${document.child?.user?.lastName} ${document.child?.user?.firstName} ${document.child?.user?.patronymic}`
            }}</span>
          </div>
        </div>

        <div
          class="mentor-info"
        >
          <h4 class="mentor-title">
            Ребенок:
          </h4>
          <p
            v-if="document.child"
            class="mentor-name"
          >
            {{
              document.child?.lastName +
                " " +
                document.child?.firstName +
                " " +
                document.child?.patronymic
            }}
          </p>
          <p
            v-else
            class="mentor-name"
          >
            ...
          </p>
        </div>
        <div
          v-if="document.document.verified === null"
          class="verify"
        >
          <Button
            icon="pi pi-check"
            style="background: white"
            label="Принять"
            class="p-button-text p-button-sm p-button-success"
            @click="verifyDocument(document.document, true)"
          />
          <Button
            icon="pi pi-times"
            style="background: white"
            label="Отклонить"
            class="p-button-text p-button-sm p-button-danger"
            @click="verifyDocument(document.document, false)"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Обычная пагинация (скрывается при скролле) -->
  <div
    v-if="documents.length > 0"
    class="pagination-container"
  >
    <Paginator
      :first="currentPage * itemsPerPage"
      :rows="itemsPerPage"
      :total-records="totalRecords"
      :rows-per-page-options="[8, 16, 24, 32]"
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      @page="onPageChange"
    />
  </div>
</template>

<style scoped>
  .documents-grid-header {
    margin-bottom: 2rem;
  }

  .documents-grid-title {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 500;
    font-family: "BIPS", sans-serif;
  }

  .documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    width: 100%;
    margin-bottom: 4rem;
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
    width: 100%;
    max-width: 100%;
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

  .verify {
    display: flex;
    gap: 1.5rem;
    justify-content: flex-end;
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
  .document-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .document-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Стили для диалога подтверждения */
  :deep(.p-confirm-dialog) {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  :deep(.p-confirm-dialog .p-dialog-header) {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 1.5rem;
  }

  :deep(.p-confirm-dialog .p-dialog-title) {
    font-weight: 600;
    font-size: 1.1rem;
  }

  :deep(.p-confirm-dialog .p-dialog-content) {
    padding: 2rem 1.5rem;
    background: #f8f9fa;
  }

  :deep(.p-confirm-dialog .p-dialog-message) {
    color: #2c3e50;
    font-size: 1rem;
    line-height: 1.5;
    margin: 0;
  }

  :deep(.p-confirm-dialog .p-dialog-footer) {
    padding: 1rem 1.5rem 1.5rem;
    background: white;
    border-radius: 0 0 12px 12px;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  :deep(.p-confirm-dialog .p-button) {
    border-radius: 8px;
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    transition: all 0.3s ease;
  }

  :deep(.p-confirm-dialog .p-button-danger) {
    background: #dc3545;
    border-color: #dc3545;
  }

  :deep(.p-confirm-dialog .p-button-danger:hover) {
    background: #c82333;
    border-color: #bd2130;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }

  :deep(.p-confirm-dialog .p-button-text) {
    color: #6c757d;
    background: transparent;
    border: 1px solid #dee2e6;
  }

  :deep(.p-confirm-dialog .p-button-text:hover) {
    background: #f8f9fa;
    border-color: #adb5bd;
    color: #495057;
  }
</style>