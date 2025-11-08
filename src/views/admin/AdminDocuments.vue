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

    <DocumentsTemplates :expanded="false" />

    <!-- Фильтры -->
    <div class="filters-section sticky-filters">
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
        <AutoComplete
          id="statusFilter"
          v-model="selectedCompetence"
          :suggestions="filteredCompetencies"
          dropdown
          field="name"
          placeholder="Все компетенции"
          class="filter-dropdown"
          :disabled="competencies.length === 0"
          @complete="filterCompetencies"
        >
          <template #item="slotProps">
            {{ slotProps ? formatCompetenceName(slotProps.item) : "Не выбран" }}
          </template>
          <template #option="slotProps">
            {{ slotProps ? formatCompetenceName(slotProps.option) : "Не выбран" }}
          </template>
        </AutoComplete>
      </div>
      <div
        v-if="availableAges.length > 0"
        class="filter-group"
      >
        <label>Возрастные группы:</label>
        <div class="age-buttons">
          <Button
            v-for="age in availableAges"
            :key="age"
            :class="selectedAge === age ? 'p-button' : 'p-button-outlined'"
            :label="ageGroups.find(group => group.value === age)?.label"
            size="small"
            @click="selectedAge = age"
          />
          <Button
            label="Сбросить возраст"
            icon="pi pi-refresh"
            class="p-button-text p-button-sm"
            @click="resetAge"
          />
        </div>
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
        >
          <DocsToVerifyList
            v-if="tab.documents.length > 0"
            :documents="filterDocs(tab.documents)"
            :experts="experts"
            :verify-status="tab.key === 'unchecked' ? 'UNCHECKED' : tab.key === 'accepted' ? 'ACCEPTED' : 'REJECTED'"
            @update="loadCompetencies"
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
  </div>
</template>

<script lang="ts">
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import TabView from 'primevue/tabview';
  import TabPanel from 'primevue/tabpanel';
  import { FileResolver, FileType } from '@/api/resolvers/files/file.resolver';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver';
  import ToastPopup from '@/components/ToastPopup.vue';
  import { UserResolver } from '@/api/resolvers/user/user.resolver';
  import type {
    CompetenceDocumentsOutputDto,
  } from '@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto.ts';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { CompetenceDocumentsResolver } from '@/api/resolvers/competenceDocuments/competence-documents.resolver';
  import type { DocumentsOutputDto } from '@/api/resolvers/competence/dto/output/documents-output.dto.ts';
  import { useDocumentTypes } from '@/shared/UseDocumentTypes.ts';
  import DocumentsTemplates from '@/components/DocumentsTemplates.vue';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import DocsToVerifyList from '@/components/lists/DocsToVerifyList.vue';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import { Roles } from '@/state/UserState.types.ts';
  import AutoComplete from 'primevue/autocomplete';
  import ConfirmDialog from 'primevue/confirmdialog';
  import { useConfirm } from 'primevue/useconfirm';
  import { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';
  import ProgressSpinner from 'primevue/progressspinner';

  interface TabConfig {
  key: string;
  header: string;
  documents: CompetenceDocumentsOutputDto[];
  hasDocuments: boolean;
}

export default {
  name: "AdminDocuments",
  components: {
    DocsToVerifyList,
    DocumentsTemplates,
    ToastPopup,
    Button,
    Dropdown,
    TabView,
    TabPanel,
    AutoComplete,
    ConfirmDialog,
    ProgressSpinner
  },
  data() {
    return {
      ageGroups: useAgeGroups,
      selectedType: null as null | FileType,
      selectedCompetence: localStorage.getItem("selectedCompetence")
          ? JSON.parse(localStorage.getItem("selectedCompetence") as string)
          : (null as CompetenceOutputDto | null),
      documents: [] as CompetenceDocumentsOutputDto[],
      experts: [] as UserOutputDto[],
      competencies: [] as CompetenceOutputDto[],
      filteredCompetencies: [] as CompetenceOutputDto[],
      DocumentTypes: useDocumentTypes,
      errors: {
        toastPopup: {
          title: "",
          message: "",
        },
      },
      selectedAge: null as null | AgeCategories,
      fileResolver: new FileResolver(),
      competenceResolver: new CompetenceResolver(),
      userResolver: new UserResolver(),
      competenceDocumentsResolver: new CompetenceDocumentsResolver(),
      activeTab: 0,
      isSticky: false,
      confirm: useConfirm(),
    };
  },
  computed: {
    rejectedDocuments() {
      return this.documents
          .filter(doc => doc.verified === false)
          .sort((a, b) => b.id - a.id);
    },
    acceptedDocuments() {
      return this.documents
          .filter(doc => doc.verified === true)
          .sort((a, b) => b.id - a.id);
    },
    uncheckedDocuments() {
      return this.documents
        .filter(doc => doc.verified === null)
        .sort((a, b) => b.id - a.id);
    },
    availableAges() {
      const ageOrder = new Map(this.ageGroups.map((group, index) => [group.value, index]));
      return [...new Set(this.documents.map(doc => doc.ageCategory))].toSorted((a, b) => {
        return ageOrder.get(a)!! - ageOrder.get(b)!!;
      });
    },
    // Определяем доступность табов на основе наличия документов
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
    }
  },
  watch: {
    // Автоматически переключаемся на первый доступный таб, если текущий стал недоступным
    tabsConfig: {
      handler(newTabsConfig: TabConfig[]) {
        const availableTabs = newTabsConfig.filter((tab: TabConfig) => tab.hasDocuments);
        if (availableTabs.length > 0) {
          // Если текущий активный таб недоступен, переключаемся на первый доступный
          const currentTab = newTabsConfig[this.activeTab];
          if (!currentTab || !currentTab.hasDocuments) {
            this.activeTab = 0; // Первый таб в отсортированном списке всегда доступен
          }
        }
      },
      immediate: true
    }
  },
  async mounted() {
    try {
      await this.loadCompetencies();
    } catch (error) {
      console.error('Error in loadCompetencies in AdminDocuments:', error);
    }
    try {
      await this.loadExperts();
    } catch (error) {
      console.error('Error in loadExperts in AdminDocuments:', error);
    }
  },
  methods: {
    filterCompetencies(event: { query: string }) {
      const query = event.query ? event.query.toLowerCase() : '';
      let filtered = [];
      if (!query.length) {
        filtered = [...this.competencies];
      } else {
        filtered = [...this.competencies].filter(competence =>
          this.formatCompetenceName(competence).toLowerCase().includes(query))
      }

      const uniqueByName = new Map();
      filtered.forEach(item => {
        if (!uniqueByName.has(item.id)) {
          uniqueByName.set(item.id, item);
        }
      });

      this.filteredCompetencies = [...uniqueByName.values()]
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    formatCompetenceName(competence: CompetenceOutputDto) {
        if (!competence) return '';
        const expert = this.experts.find(expert => expert.id === competence.expertId)
        return expert
          ? `${competence.name} (${expert?.lastName} ${expert?.firstName.substring(0, 1)}.${expert?.patronymic.substring(0, 1)}.)`
          : competence.name
      },
    documentCompetence(document: DocumentsOutputDto): CompetenceOutputDto | undefined {
      return this.competencies.find((competence: CompetenceOutputDto) =>
          competence.documents.some((doc) => doc.id === document.id),
      );
    },
    filterDocs(docs: CompetenceDocumentsOutputDto[]) {
      if (this.selectedType) {
        docs = docs.filter(
            (doc) => doc.documentType === this.selectedType,
        );
      }

      if (this.selectedCompetence) {
        docs = docs.filter(
            (doc) => this.selectedCompetence === this.documentCompetence(doc),
        );
      }

      if (this.selectedAge) {
        docs = docs.filter((d) => d.ageCategory === this.selectedAge);
      }

      return docs;
    },

    resetFilters() {
      this.selectedType = null;
      this.selectedCompetence = null;
      this.selectedAge = null;
    },

    resetAge() {
      this.selectedAge = null
    },
    async loadCompetencies() {
        try {
          const response = await this.competenceResolver.getAll();
          if (response.status === 200 && typeof response.message !== "string") {
          const docs = [] as CompetenceDocumentsOutputDto[];
          const competencies = [] as CompetenceOutputDto[]
          for (const competence of response.message) {
            if (competence.documents.length > 0) {
              competencies.push(competence);
              for (const document of competence.documents) {
                docs.push({
                  createdAt: document.createdAt,
                  verified: document.verified,
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
              }
            }
          }
          this.documents = docs
          this.competencies = competencies
        } else {
          console.error('Failed to load competencies in AdminDocuments:', response);
        }
      } catch (error) {
        console.error('Error loading competencies in AdminDocuments:', error);
        this.errors.toastPopup = {
          title: "Ошибка",
          message: "Не удалось загрузить компетенции",
        };
      }
    },

    async loadExperts() {
      const expResponse = await this.userResolver.getAllByRole(Roles.EXPERT);
      if (expResponse.status === 200 && typeof expResponse.message !== "string") {
        this.experts = expResponse.message;
      }

      const tutResponse = await this.userResolver.getAllByRole(Roles.TUTOR);
      if (tutResponse.status === 200 && typeof tutResponse.message !== "string") {
        this.experts = this.experts.concat(tutResponse.message);
      }
    },

    handleDeleteDocument(document: CompetenceDocumentsOutputDto) {
      this.confirm.require({
        message: `Вы уверены, что хотите удалить документ №${document.documentId}?`,
        header: 'Подтверждение удаления',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Отмена',
        acceptLabel: 'Удалить',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-text',
        accept: async () => {
          try {
            const response = await this.competenceDocumentsResolver.delete(
              document.id,
            );
            if (response.status === 200) {
              // Локально удаляем документ из списка без полной перезагрузки
              const documentIndex = this.documents.findIndex(doc => doc.id === document.id);
              if (documentIndex !== -1) {
                this.documents.splice(documentIndex, 1);
              }
              
              // Также удаляем документ из компетенций
              this.competencies.forEach(competence => {
                const docIndex = competence.documents.findIndex(doc => doc.id === document.id);
                if (docIndex !== -1) {
                  competence.documents.splice(docIndex, 1);
                }
              });
              
              // Удаляем компетенции без документов
              this.competencies = this.competencies.filter(competence => competence.documents.length > 0);
              
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
      document: CompetenceDocumentsOutputDto, 
      status: boolean, 
      success?: boolean,
      action?: string,
      actionPast?: string,
      showConfirm?: boolean 
    }) {
      if (data.showConfirm) {
        // Показываем диалог подтверждения
        this.confirm.require({
          message: `Вы уверены, что хотите ${data.action} документ №${data.document.documentId}?`,
          header: `Подтверждение ${data.action === 'принять' ? 'принятия' : 'отклонения'}`,
          icon: data.status ? 'pi pi-check-circle' : 'pi pi-times-circle',
          rejectLabel: 'Отмена',
          acceptLabel: data.action,
          acceptClass: data.status ? 'p-button-success' : 'p-button-danger',
          rejectClass: 'p-button-text',
          accept: async () => {
            try {
              const response = await this.competenceDocumentsResolver.verify(data.document.id, data.status);
              if (response.status === 200) {
                // Локально обновляем статус документа в основном массиве
                const documentIndex = this.documents.findIndex(doc => doc.id === data.document.id);
                if (documentIndex !== -1) {
                  this.documents[documentIndex].verified = data.status;
                }
                
                // Также обновляем статус в компетенциях
                this.competencies.forEach(competence => {
                  const docIndex = competence.documents.findIndex(doc => doc.id === data.document.id);
                  if (docIndex !== -1) {
                    competence.documents[docIndex].verified = data.status;
                  }
                });
                
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
        const documentIndex = this.documents.findIndex(doc => doc.id === data.document.id);
        if (documentIndex !== -1) {
          this.documents[documentIndex].verified = data.status;
        }
        
        // Также обновляем статус в компетенциях
        this.competencies.forEach(competence => {
          const docIndex = competence.documents.findIndex(doc => doc.id === data.document.id);
          if (docIndex !== -1) {
            competence.documents[docIndex].verified = data.status;
          }
        });
        
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
