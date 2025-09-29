<script lang="ts">
  import { type PropType } from 'vue';
  import type {
    CompetenceDocumentsOutputDto
  } from '@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto.ts';
  import apiConf from '@/api/api.conf.ts';
  import { useDocumentTypes } from '@/shared/UseDocumentTypes.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { CompetenceDocumentsResolver } from '@/api/resolvers/competenceDocuments/competence-documents.resolver.ts';
  import Button from 'primevue/button';
  import Paginator from 'primevue/paginator';

  export type VerifyStatus = "ACCEPTED" | "REJECTED" | "UNCHECKED";
  export default {
    name: 'DocsToVerifyList',
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
        type: Array as PropType<CompetenceDocumentsOutputDto[]>,
        required: true,
      },
      experts: {
        type: Array as PropType<UserOutputDto[]>,
        required: true,
      }
    },
    emits: ['update'],
    data() {
      return {
        userResolver: new UserResolver(),
        competenceDocumentsResolver: new CompetenceDocumentsResolver(),
        documentTypes: useDocumentTypes,
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
      viewDocument(doc: CompetenceDocumentsOutputDto) {
        window.open(`${apiConf.endpoint}/file-service/v1/files/view/${doc.documentId}`, "_blank");
      },
      downloadDocument(doc: CompetenceDocumentsOutputDto) {
        window.location.href = `${apiConf.endpoint}/file-service/v1/files/download/${doc.documentId}`;
      },
      documentExpert(document: CompetenceDocumentsOutputDto) {
        return this.experts.find((expert) => expert.id === document.userId);
      },
      async verifyDocument(doc: CompetenceDocumentsOutputDto, status: boolean) {
        const response = await this.competenceDocumentsResolver.verify(doc.id, status)
        if (response.status === 200) this.$emit('update');
      },
      async deleteDocument(document: CompetenceDocumentsOutputDto) {
        if (
          confirm(`Вы уверены, что хотите удалить документ "${document.documentId}"?`)
        ) {
          const response = await this.competenceDocumentsResolver.delete(
            document.id,
          );
          if (response.status === 200) this.$emit('update');
        }
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
              documentTypes.find((type) => type.value === document.documentType)?.label
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Возрастная группа:</span>
            <span class="detail-value">
              {{
                ageGroups.find(group => document.ageCategory === group.value)?.label
              }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Дата загрузки:</span>
            <span class="detail-value">{{
              document.createdAt.substring(0, 10)
            }}</span>
          </div>
          <div
            class="detail-item"
          >
            <span class="detail-label">Компетенция:</span>
            <span class="detail-value">{{
              document.direction?.name
            }}</span>
          </div>
        </div>

        <div
          class="mentor-info"
        >
          <h4 class="mentor-title">
            Связанный эксперт:
          </h4>
          <p
            v-if="documentExpert(document)"
            class="mentor-name"
          >
            {{
              documentExpert(document)?.lastName +
                " " +
                documentExpert(document)?.firstName +
                " " +
                documentExpert(document)?.patronymic
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
          v-if="document.verified === null"
          class="verify"
        >
          <Button
            icon="pi pi-check"
            style="background: white"
            label="Принять"
            class="p-button-text p-button-sm p-button-success"
            @click="verifyDocument(document, true)"
          />
          <Button
            icon="pi pi-times"
            style="background: white"
            label="Отклонить"
            class="p-button-text p-button-sm p-button-danger"
            @click="verifyDocument(document, false)"
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
</style>