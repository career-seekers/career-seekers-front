<template>
  <div class="documents-page">
    <div class="page-header">
      <h1 class="page-title">
        <i class="pi pi-file-text" />
        Мои документы
      </h1>
      <p class="page-subtitle">
        Все загруженные документы по компетенциям
      </p>
    </div>

    <!-- Поиск по компетенции -->
    <div class="search-section">
      <div class="search-group">
        <label for="competenceSearch">Фильтр по компетенции:</label>
        <Dropdown
          id="competenceSearch"
          v-model="selectedCompetence"
          :options="competencies"
          option-label="name"
          option-value="id"
          placeholder="Выберите компетенцию"
          class="search-dropdown"
          @change="filterByCompetence"
        />
      </div>
      <div class="search-group">
        <Button
          label="Показать все"
          icon="pi pi-refresh"
          class="p-button-text p-button-sm"
          @click="showAllDocuments"
        />
      </div>
    </div>

    <!-- Кнопка для перехода к документам компетенций -->
    <div class="competence-documents-section">
      <div class="section-header">
        <h3 class="section-title">
          <i class="pi pi-briefcase" />
          Документы компетенций
        </h3>
        <p class="section-subtitle">
          Просмотр документов по конкретным компетенциям
        </p>
      </div>
      <div class="competence-list">
        <div
          v-for="competence in competencies"
          :key="competence.id"
          class="competence-item"
        >
          <div class="competence-info">
            <h4 class="competence-name">
              {{ competence.name }}
            </h4>
            <p class="competence-description">
              {{ competence.description }}
            </p>
            <div class="competence-meta">
              <span class="competence-ages">
                <i class="pi pi-users" />
                {{ competence.ageCategories.map(ac => FormatManager.getAgeGroupLabel(ac.ageCategory)).join(', ') }}
              </span>
              <span class="competence-docs-count">
                <i class="pi pi-file-text" />
                {{ getDocumentsCountForCompetence(competence.id) }} документов
              </span>
            </div>
          </div>
          <Button
            label="Документы компетенции"
            icon="pi pi-file-text"
            class="p-button-outlined"
            @click="goToCompetenceDocuments(competence.id)"
          />
        </div>
      </div>
    </div>
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
                <h4 class="document-name">
                  {{ getDocumentTypeLabel(document.documentType) }}
                </h4>
                <div class="document-meta">
                  <span class="document-age">{{ FormatManager.getAgeGroupLabel(document.ageCategory) }}</span>
                  <span class="document-date">{{ formatDate(document.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="document-actions">
              <Button
                v-tooltip="'Просмотреть'"
                icon="pi pi-eye"
                class="p-button-text p-button-sm"
                @click="viewDocument(document.documentId)"
              />
              <Button
                v-tooltip="'Скачать'"
                icon="pi pi-download"
                class="p-button-text p-button-sm"
                @click="downloadDocument(document.documentId)"
              />
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
                <h4 class="document-name">
                  {{ getDocumentTypeLabel(document.documentType) }}
                </h4>
                <div class="document-meta">
                  <span class="document-age">{{ FormatManager.getAgeGroupLabel(document.ageCategory) }}</span>
                  <span class="document-date">{{ formatDate(document.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="document-actions">
              <Button
                v-tooltip="'Просмотреть'"
                icon="pi pi-eye"
                class="p-button-text p-button-sm"
                @click="viewDocument(document.documentId)"
              />
              <Button
                v-tooltip="'Скачать'"
                icon="pi pi-download"
                class="p-button-text p-button-sm"
                @click="downloadDocument(document.documentId)"
              />
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
                <h4 class="document-name">
                  {{ getDocumentTypeLabel(document.documentType) }}
                </h4>
                <div class="document-meta">
                  <span class="document-age">{{ FormatManager.getAgeGroupLabel(document.ageCategory) }}</span>
                  <span class="document-date">{{ formatDate(document.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="document-actions">
              <Button
                v-tooltip="'Просмотреть'"
                icon="pi pi-eye"
                class="p-button-text p-button-sm"
                @click="viewDocument(document.documentId)"
              />
              <Button
                v-tooltip="'Скачать'"
                icon="pi pi-download"
                class="p-button-text p-button-sm"
                @click="downloadDocument(document.documentId)"
              />
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import type { CompetenceDocumentsOutputDto } from '@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto.ts';
import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
import { CompetenceDocumentsResolver } from "@/api/resolvers/competenceDocuments/competence-documents.resolver";
import { CompetenceResolver } from "@/api/resolvers/competence/competence.resolver";
import { FileType } from "@/api/resolvers/files/file.resolver";
import { useUserStore } from '@/stores/userStore.ts';
import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
import { useDocumentTypes } from '@/shared/UseDocumentTypes.ts';
import apiConf from '@/api/api.conf.ts';
import { FormatManager } from '@/utils/FormatManager.ts';

export default {
  name: "ExpertDocuments",
  components: {
    Button,
    Dropdown,
    TabView,
    TabPanel,
  },
  data() {
    return {
      user: useUserStore().user,
      allDocuments: [] as CompetenceDocumentsOutputDto[],
      competencies: [] as CompetenceOutputDto[],
      competenceDocumentsResolver: new CompetenceDocumentsResolver(),
      competenceResolver: new CompetenceResolver(),
      ageGroups: useAgeGroups,
      DocumentTypes: useDocumentTypes,
      selectedCompetence: null as number | null,
    };
  },
  computed: {
    FormatManager() {
      return FormatManager
    },
    filteredDocuments() {
      if (this.selectedCompetence) {
        return this.allDocuments.filter(doc => doc.direction.id === this.selectedCompetence);
      }
      return this.allDocuments;
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
  async mounted() {
    await this.loadAllDocuments();
    await this.loadCompetencies();
  },
  methods: {
    async loadAllDocuments() {
      if (this.user !== null) {
        try {
          const response = await this.competenceDocumentsResolver.getByUserId(this.user.id);
          if (response.status === 200 && typeof response.message !== "string") {
            this.allDocuments = response.message;
          }
        } catch (error) {
          console.error("Ошибка при загрузке документов:", error);
        }
      }
    },

    getDocumentTypeLabel(documentType: FileType) {
      const type = this.DocumentTypes.find(t => t.value === documentType);
      return type ? type.label : documentType;
    },

    formatDate(dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    viewDocument(documentId: number) {
      try {
        const a = document.createElement("a");
        a.href = `${apiConf.endpoint}/file-service/v1/files/view/${documentId}`;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log("Документ открыт для просмотра:", documentId);
      } catch (error) {
        console.error("Ошибка при открытии документа:", error);
      }
    },

    downloadDocument(documentId: number) {
      try {
        const a = document.createElement("a");
        a.href = `${apiConf.endpoint}/file-service/v1/files/download/${documentId}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log("Документ скачан:", documentId);
      } catch (error) {
        console.error("Ошибка при скачивании документа:", error);
      }
    },

    filterByCompetence() {
      // Фильтрация происходит автоматически через computed свойство
    },

    showAllDocuments() {
      this.selectedCompetence = null;
    },

    async loadCompetencies() {
      if (this.user !== null) {
        try {
          const response = await this.competenceResolver.getAllByExpertId(this.user.id);
          if (response.status === 200 && typeof response.message !== "string") {
            this.competencies = response.message;
          }
        } catch (error) {
          console.error("Ошибка при загрузке компетенций:", error);
        }
      }
    },

    getDocumentsCountForCompetence(competenceId: number) {
      return this.allDocuments.filter(doc => doc.direction.id === competenceId).length;
    },

    goToCompetenceDocuments(competenceId: number) {
      this.$router.push(`/expert/documents/${competenceId}`);
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



.page-header {
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
  font-family: "BIPS", sans-serif;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.search-section {
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.search-group label {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.search-dropdown {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
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
  transition: all 0.3s ease;
}

.document-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.document-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.document-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-name {
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.document-age {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
}

.document-date {
  font-size: 0.75rem;
}


.document-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: flex-end;
}

/* Стили для блока компетенций */
.competence-documents-section {
  margin-bottom: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 2rem;
}

.section-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-subtitle {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
}

.competence-list {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.competence-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.competence-item:hover {
  background: #fff3e0;
  border-color: #ff9800;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}

.competence-info {
  flex: 1;
  min-width: 0;
}

.competence-name {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.competence-description {
  color: #6c757d;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.competence-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.competence-ages,
.competence-docs-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.competence-ages i,
  .competence-docs-count i {
    color: #ff9800;
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


  .search-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-group {
    min-width: auto;
  }

  .document-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .document-name {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .document-actions {
    margin-top: 0.75rem;
    justify-content: flex-start;
  }

  .competence-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .competence-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
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

}
</style>
