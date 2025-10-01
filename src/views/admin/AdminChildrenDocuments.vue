<template>
  <div class="children-documents-page">
    <div class="page-header">
      <h1 class="page-title">
        <i class="pi pi-users" />
        Документы участников
      </h1>
      <p class="page-subtitle">
        Управление участием детей в чемпионате
      </p>
    </div>

    <!-- Фильтры -->
    <div class="filters-section sticky-filters">
      <div class="filter-group">
        <label for="typeFilter">Тип документа:</label>
        <Dropdown
          id="typeFilter"
          v-model="selectedDocumentType"
          :options="childrenDocumentsTypes"
          option-label="label"
          option-value="value"
          placeholder="Все типы"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <label for="statusFilter">Ребенок:</label>
        <AutoComplete
          id="statusFilter"
          v-model="selectedChild"
          :suggestions="filteredChildren"
          dropdown
          field="fullName"
          placeholder="Все дети"
          class="filter-dropdown"
          :disabled="children.length === 0"
          @complete="filterChildren"
        >
          <template #item="slotProps">
            {{
              slotProps
                ? getChildFullName(slotProps.item)
                : "Не выбран"
            }}
          </template>
          <template #option="slotProps">
            {{
              slotProps
                ? getChildFullName(slotProps.option)
                : "Не выбран"
            }}
          </template>
        </AutoComplete>
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

  <!-- Кастомный sticky контейнер для табов -->
  <div
    class="custom-sticky-container"
    :class="{ 'sticky': isSticky }"
  >
    <!-- Табы для документов -->
    <TabView
      v-model:active-index="activeTab"
      class="documents-tabs"
    >
      <TabPanel
        v-for="tab in tabsConfig"
        :key="tab.key"
        :header="tab.header"
        :disabled="!tab.hasDocuments"
        :class="{ 'disabled-tab': !tab.hasDocuments }"
      >
        <ChildrenDocsToVerifyList
          v-if="tab.documents.length > 0"
          :documents="filterDocs(tab.documents)"
          :verify-status="tab.key === 'unchecked' ? 'UNCHECKED' : tab.key === 'accepted' ? 'ACCEPTED' : 'REJECTED'"
          @update="loadChildrenDocuments"
          @delete="handleDeleteDocument"
          @verify="handleVerifyDocument"
        />
        <ProgressSpinner
          v-else
          style="width: 100%; margin-top: 10rem"
        />
      </TabPanel>
    </TabView>

    <ToastPopup :content="errors.toastPopup" />

    <!-- Диалог подтверждения удаления -->
    <ConfirmDialog />
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import ToastPopup from "@/components/ToastPopup.vue";
import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
import Tooltip from 'primevue/tooltip';
import { ChildDocumentsResolver } from '@/api/resolvers/childDocuments/child-documents.resolver.ts';
import type { ChildDocumentsOutputDto } from '@/api/resolvers/childDocuments/dto/output/child-documents-output.dto.ts';
import type { DocsOutputFileUploadDto } from '@/api/resolvers/files/dto/output/docs-output-file-upload.dto.ts';
import { FileResolver, FileType } from '@/api/resolvers/files/file.resolver.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
import { useChildrenDocumentTypes } from '@/shared/UseChildrenDocumentTypes.ts';
import { useConfirm } from 'primevue/useconfirm';
import ChildrenDocsToVerifyList, { type DocPerChild } from '@/components/ChildrenDocsToVerifyList.vue';
import Dropdown from 'primevue/dropdown';
import AutoComplete from 'primevue/autocomplete';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ConfirmDialog from 'primevue/confirmdialog';
import ProgressSpinner from 'primevue/progressspinner';

export default {
  name: "AdminChildrenDocuments",
  components: {
    ChildrenDocsToVerifyList,
    Button,
    Dropdown,
    AutoComplete,
    TabView,
    TabPanel,
    ConfirmDialog,
    ToastPopup,
    ProgressSpinner
  },
  directives: {
    'tooltip': Tooltip
  },
  data() {
    return {
      childrenDocumentsTypes: useChildrenDocumentTypes,
      selectedDocumentType: null as FileType | null,
      selectedChild: null as ChildOutputDto | null,
      files: [] as DocsOutputFileUploadDto[],
      documents: [] as DocPerChild[],
      childrenDocuments: [] as ChildDocumentsOutputDto[],
      filteredChildren: [] as ChildOutputDto[],
      childDocumentsResolver: new ChildDocumentsResolver(),
      fileResolver: new FileResolver(),
      ageGroups: useAgeGroups,
      currentPage: 0,
      itemsPerPage: 8,
      errors: {
        toastPopup: {
          title: "",
          message: "",
        },
      },
      activeTab: 0,
      isSticky: false,
      // Confirm dialog
      confirm: useConfirm(),
    };
  },
  computed: {
    children() {
      return [...new Set(this.childrenDocuments.map(doc => doc.child))]
    },
    rejectedDocuments() {
      return this.documents
        .filter(doc => doc.document.verified === false)
        .sort((a, b) => b.document.id - a.document.id);
    },
    acceptedDocuments() {
      return this.documents
        .filter(doc => doc.document.verified === true)
        .sort((a, b) => b.document.id - a.document.id);
    },
    uncheckedDocuments() {
      const result = this.documents
        .filter(doc => doc.document.verified === null)
        .sort((a, b) => b.document.id - a.document.id);
      console.log('Unchecked documents:', result);
      console.log('Total documents:', this.documents.length);
      return result;
    },
    tabsConfig() {
      const tabs = [
        {
          key: 'unchecked',
          header: 'Необработанные',
          documents: this.uncheckedDocuments,
          hasDocuments: this.uncheckedDocuments.length > 0
        },
        {
          key: 'accepted',
          header: 'Принятые',
          documents: this.acceptedDocuments,
          hasDocuments: this.acceptedDocuments.length > 0
        },
        {
          key: 'rejected',
          header: 'Отклоненные',
          documents: this.rejectedDocuments,
          hasDocuments: this.rejectedDocuments.length > 0
        }
      ];

      // Сортируем табы: сначала с документами, потом без документов
      return tabs.sort((a, b) => {
        if (a.hasDocuments && !b.hasDocuments) return -1;
        if (!a.hasDocuments && b.hasDocuments) return 1;
        return 0;
      });
    },
  },
  async mounted() {
    await this.loadFiles()
    await this.loadChildrenDocuments();
  },
  methods: {
    getChildFullName(child: ChildOutputDto) {
      return `${child.lastName} ${child.firstName} ${child.patronymic}`
    },
    filterChildren(event: { query: string }) {
      const query = event.query ? event.query.toLowerCase() : '';
      let filtered = [];
      if (!query.length) {
        filtered = [...this.children];
      } else {
        filtered = [...this.children].filter(child =>
          child.lastName.toLowerCase().includes(query) ||
          child.firstName.toLowerCase().includes(query) ||
          child.patronymic.toLowerCase().includes(query))
      }

      const uniqueByName = new Map();
      filtered.forEach(item => {
        if (!uniqueByName.has(item.id)) {
          uniqueByName.set(item.id, item);
        }
      });

      this.filteredChildren = [...uniqueByName.values()]
        .map(child => {
          return {
            ...child,
            fullName: this.getChildFullName(child)
          }
        })
        .sort((a, b) => a.lastName.localeCompare(b.lastName));
    },
    filterDocs(docs: DocPerChild[]) {
      if (this.selectedDocumentType) {
        docs = docs.filter(
          (doc) => doc.document.fileType === this.selectedDocumentType,
        );
      }

      if (this.selectedChild) {
        docs = docs.filter(
          (doc) => this.selectedChild?.id === doc.child.id,
        );
      }

      return docs;
    },

    resetFilters() {
      this.selectedDocumentType = null;
      this.selectedChild = null;
    },
    addChildDocument(docId: number, child: ChildOutputDto) {
      const doc = this.files.find(file => file.id === docId)
      if (doc !== undefined) {
        this.documents.push({
          child: child,
          document: doc
        });
      }
    },
    async loadFiles() {
      const response = await this.fileResolver.getAll()
      if ((response as CommonOutputDto<string>).message) return
      this.files = response as DocsOutputFileUploadDto[]
    },
    async loadChildrenDocuments() {
      try {
        const response = await this.childDocumentsResolver.getAll()
        
        if (response.status === 200 && typeof response.message !== "string") {
          this.childrenDocuments = response.message;
          for (const docs of this.childrenDocuments) {
            this.addChildDocument(docs.birthCertificateId, docs.child)
            this.addChildDocument(docs.snilsId, docs.child)
            this.addChildDocument(docs.studyingCertificateId, docs.child)
            this.addChildDocument(docs.additionalStudyingCertificateId, docs.child)
            this.addChildDocument(docs.consentToChildPdpId, docs.child)
          }
        } else {
          console.error('Failed to load children:', response);
          this.errors.toastPopup = {
            title: "Ошибка",
            message: "Не удалось загрузить данные о детях",
          };
        }
      } catch (error) {
        console.error('Error loading children:', error);
        this.errors.toastPopup = {
          title: "Ошибка",
          message: "Произошла ошибка при загрузке данных о детях",
        };
      }
    },
    handleDeleteDocument(document: DocsOutputFileUploadDto) {
      this.confirm.require({
        message: `Вы уверены, что хотите удалить документ №${document.id}?`,
        header: 'Подтверждение удаления',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Отмена',
        acceptLabel: 'Удалить',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-text',
        accept: async () => {
          try {
            const response = await this.fileResolver.deleteById(
              document.id,
            );
            if (response.status === 200) {
              // Локально удаляем документ из списка без полной перезагрузки
              const documentIndex = this.documents.findIndex(doc => doc.document.id === document.id);
              if (documentIndex !== -1) {
                this.documents.splice(documentIndex, 1);
              }

              // Показываем уведомление об успешном удалении
              this.errors.toastPopup = {
                title: "Успешно",
                message: "Документ удален успешно",
              };
            }
          } catch (error) {
            console.error('Ошибка при удалении документа:', error);
            this.errors.toastPopup = {
              title: "Ошибка",
              message: "Не удалось удалить документ",
            };
          }
        }
      });
    },

    handleVerifyDocument(data: {
      document: DocsOutputFileUploadDto,
      status: boolean,
      success?: boolean,
      action?: string,
      actionPast?: string,
      showConfirm?: boolean
    }) {
      if (data.showConfirm) {
        // Показываем диалог подтверждения
        this.confirm.require({
          message: `Вы уверены, что хотите ${data.action} документ №${data.document.id}?`,
          header: `Подтверждение ${data.action === 'принять' ? 'принятия' : 'отклонения'}`,
          icon: data.status ? 'pi pi-check-circle' : 'pi pi-times-circle',
          rejectLabel: 'Отмена',
          acceptLabel: data.action,
          acceptClass: data.status ? 'p-button-success' : 'p-button-danger',
          rejectClass: 'p-button-text',
          accept: async () => {
            try {
              const response = await this.fileResolver.verify(data.document.id, data.status);
              if (response.status === 200) {
                // Локально обновляем статус документа в основном массиве
                const documentIndex = this.documents.findIndex(doc => doc.document.id === data.document.id);
                if (documentIndex !== -1) {
                  this.documents[documentIndex].document.verified = data.status;
                }

                // Показываем уведомление об успешной верификации
                this.errors.toastPopup = {
                  title: "Успешно",
                  message: `Документ ${data.actionPast} успешно`,
                };
              } else {
                // Показываем уведомление об ошибке
                this.errors.toastPopup = {
                  title: "Ошибка",
                  message: "Не удалось обновить статус документа",
                };
              }
            } catch (error) {
              console.error('Ошибка при верификации документа:', error);
              this.errors.toastPopup = {
                title: "Ошибка",
                message: "Не удалось обновить статус документа",
              };
            }
          }
        });
      } else if (data.success) {
        // Локально обновляем статус документа в основном массиве
        const documentIndex = this.documents.findIndex(doc => doc.document.id === data.document.id);
        if (documentIndex !== -1) {
          this.documents[documentIndex].document.verified = data.status;
        }

        // Показываем уведомление об успешной верификации
        const action = data.status ? 'принят' : 'отклонен';
        this.errors.toastPopup = {
          title: "Успешно",
          message: `Документ ${action} успешно`,
        };
      } else {
        // Показываем уведомление об ошибке
        this.errors.toastPopup = {
          title: "Ошибка",
          message: "Не удалось обновить статус документа",
        };
      }
    },


    onPageChange(event: any) {
      this.currentPage = event.page;
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

  /* Обычные фильтры */
  .sticky-filters {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }

  .sticky-filters:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 150px;
  }

  .age-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .filter-group label {
    color: #2c3e50;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .filter-dropdown {
    width: 100%;
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

  /* Стили для недоступных табов */
  .documents-tabs :deep(.p-tabview-nav li.disabled-tab .p-tabview-nav-link) {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
    border: 1px solid #dee2e6;
  }

  .documents-tabs :deep(.p-tabview-nav li.disabled-tab .p-tabview-nav-link:hover) {
    background: #f8f9fa;
    color: #6c757d;
    transform: none;
    box-shadow: none;
  }

  .documents-tabs :deep(.p-tabview-nav li.disabled-tab) {
    order: 999; /* Перемещаем в конец */
  }

  /* Обычный контейнер для табов */
  .custom-sticky-container {
    position: relative;
    background: white;
    transition: all 0.3s ease;
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