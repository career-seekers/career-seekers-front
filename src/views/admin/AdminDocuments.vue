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
      <TabPanel header="Необработанные">
        <DocsToVerifyList
          :documents="filterDocs(uncheckedDocuments)"
          :experts="experts"
          verify-status="UNCHECKED"
          @update="loadCompetencies"
        />
      </TabPanel>
      <TabPanel header="Принятые">
        <DocsToVerifyList
          :documents="filterDocs(acceptedDocuments)"
          :experts="experts"
          verify-status="ACCEPTED"
          @update="loadCompetencies"
        />
      </TabPanel>
      <TabPanel header="Отклоненные">
        <DocsToVerifyList
          :documents="filterDocs(rejectedDocuments)"
          :experts="experts"
          verify-status="REJECTED"
          @update="loadCompetencies"
        />
      </TabPanel>
    </TabView>

    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import {FileResolver, FileType} from "@/api/resolvers/files/file.resolver";
import {AgeCategories, CompetenceResolver} from '@/api/resolvers/competence/competence.resolver';
import ToastPopup from "@/components/ToastPopup.vue";
import {UserResolver} from "@/api/resolvers/user/user.resolver";
import type {
  CompetenceDocumentsOutputDto
} from "@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto.ts";
import type {CompetenceOutputDto} from "@/api/resolvers/competence/dto/output/competence-output.dto.ts";
import {CompetenceDocumentsResolver} from "@/api/resolvers/competenceDocuments/competence-documents.resolver";
import type {DocumentsOutputDto} from '@/api/resolvers/competence/dto/output/documents-output.dto.ts';
import {useDocumentTemplates} from '@/shared/UseDocumentTemplates.ts';
import {useDocumentTypes} from '@/shared/UseDocumentTypes.ts';
import DocumentsTemplates from '@/components/DocumentsTemplates.vue';
import {useAgeGroups} from '@/shared/UseAgeGroups.ts';
import DocsToVerifyList from '@/components/DocsToVerifyList.vue';
import type {UserOutputDto} from "@/api/resolvers/user/dto/output/user-output.dto.ts";
import {Roles} from "@/state/UserState.types.ts";

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
        DocumentTemplates: useDocumentTemplates,
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
        // Активный таб
        activeTab: 0,
        isSticky: false,
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
        const result = this.documents
          .filter(doc => doc.verified === null)
          .sort((a, b) => b.id - a.id);
        console.log('Unchecked documents:', result);
        console.log('Total documents:', this.documents.length);
        return result;
      },
      availableAges() {
        const ageOrder = new Map(this.ageGroups.map((group, index) => [group.value, index]));
        return [...new Set(this.documents.map(doc => doc.ageCategory))].toSorted((a, b) => {
          return ageOrder.get(a)!! - ageOrder.get(b)!!;
        });
      }
    },
    async mounted() {
      console.log('AdminDocuments mounted');
      console.log('CompetenceResolver:', this.competenceResolver);
      console.log('UserResolver:', this.userResolver);
      try {
        await this.loadCompetencies();
        console.log('loadCompetencies completed successfully in AdminDocuments');
      } catch (error) {
        console.error('Error in loadCompetencies in AdminDocuments:', error);
      }
      try {
        await this.loadExperts();
        console.log('loadExperts completed successfully in AdminDocuments');
      } catch (error) {
        console.error('Error in loadExperts in AdminDocuments:', error);
      }
    },
    methods: {
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


      handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const stickyContainer = this.$el.querySelector('.custom-sticky-container');
        
        if (stickyContainer) {
          const containerRect = stickyContainer.getBoundingClientRect();
          // Активируем sticky когда контейнер достигает верха экрана
          this.isSticky = containerRect.top <= 0;
        }
      },

      async loadCompetencies() {
        try {
          console.log('Loading competencies in AdminDocuments...');
          console.log('Access token in AdminDocuments:', localStorage.getItem("access_token"));
          const response = await this.competenceResolver.getAll();
          console.log('Competence response in AdminDocuments:', response);
          console.log('Competence response status in AdminDocuments:', response.status);
          console.log('Competence response message in AdminDocuments:', response.message);
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
          console.log('Documents loaded:', this.documents);
          console.log('Competencies loaded:', this.competencies);
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

  /* Sticky фильтры */
  .sticky-filters {
    position: sticky;
    top: 0;
    z-index: 100;
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

  /* Кастомный sticky контейнер для табов */
  .custom-sticky-container {
    position: relative;
    z-index: 98;
    background: white;
    transition: all 0.3s ease;
  }

  .custom-sticky-container.sticky {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 8px 8px;
  }

  .custom-sticky-container.sticky:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
