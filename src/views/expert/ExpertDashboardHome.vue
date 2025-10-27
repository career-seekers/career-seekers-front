<template>
  <div
    v-if="user !== null"
    class="dashboard-home"
  >
    <div class="page-header">
      <h1 class="page-title">
        Добро пожаловать, {{ user.firstName }}!
      </h1>
      <p class="page-subtitle">
        Управляйте компетенциями и участниками
      </p>
    </div>

    <div class="dashboard-grid">
      <!-- Информация об эксперте -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user" />
            Информация об эксперте
          </h3>
          <Button
            v-tooltip="'Редактировать'"
            icon="pi pi-pencil"
            style="background: white;"
            class="p-button-text p-button-sm"
            @click="$emit('openSettings', true)"
          />
        </div>
        <div class="card-content">
          <div class="data-section">
            <h4 class="section-title">
              Персональные данные
            </h4>
            <div class="data-item">
              <span class="data-label">ФИО:</span>
              <span class="data-value">{{
                `${user.lastName} ${user.firstName} ${user.patronymic}`
              }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ user.email }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ FormatManager.formatMobileNumberFromDTO(user.mobileNumber) }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Должность:</span>
              <span class="data-value">{{
                currentExpert?.expertDocuments?.post ? currentExpert?.expertDocuments?.post : "Не указано"
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Компетенции -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-briefcase" />
            Мои компетенции
          </h3>
        </div>
        <div class="card-content">
          <div class="competencies-grid">
            <div
              v-for="competence in competencies"
              :key="competence.id"
              class="competence-card"
              @click="goToCompetence(competence.id)"
            >
              <div class="competence-header">
                <h4 class="competence-name">
                  {{ competence.name }}
                </h4>
                <div class="competence-ages-container">
                  <span
                    v-for="item in competence.ageCategories"
                    :key="item.id"
                    class="competence-age"
                  >
                    {{ ageGroups.find(group => group.value === item.ageCategory)?.label }}
                  </span>
                </div>
              </div>
              <div class="competence-content">
                <div class="competence-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{
                      getTotalParticipants(competence)
                    }}</span>
                    <span class="stat-label">Участников</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{
                      competence.documents.length || 0
                    }}</span>
                    <span class="stat-label">Документов</span>
                  </div>
                </div>

                <!-- Отображение мест по возрастным категориям -->
                <div class="age-places-section">
                  <div class="age-places-title">
                    Места по возрастам:
                  </div>
                  <div class="age-places-list">
                    <div
                      v-for="ageCategory in competence.ageCategories"
                      :key="ageCategory.id"
                      class="age-place-item"
                    >
                      <span class="age-label">
                        {{ ageGroups.find(group => group.value === ageCategory.ageCategory)?.label }}
                      </span>
                      <span class="places-count">
                        {{
                          ageCategory.maxParticipantsCount === null || ageCategory.maxParticipantsCount === 0
                            ? 'Не ограничено'
                            : ageCategory.maxParticipantsCount + ' мест'
                        }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="competence-actions">
                  <!--                  <Button-->
                  <!--                    label="Участники"-->
                  <!--                    icon="pi pi-users"-->
                  <!--                    class="p-button-sm p-button-outlined"-->
                  <!--                    @click.stop="goToParticipants(competence.id)"-->
                  <!--                  />-->
                  <Button
                    label="Документы"
                    icon="pi pi-file-text"
                    class="p-button-sm p-button-outlined w-full"
                    @click.stop="goToDocuments(competence.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <Button
              label="Все компетенции"
              icon="pi pi-list"
              class="p-button-outlined"
              @click="goToAllCompetencies"
            />
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <!--      <div class="info-card">-->
      <!--        <div class="card-header">-->
      <!--          <h3 class="card-title">-->
      <!--            <i class="pi pi-chart-bar"></i>-->
      <!--            Общая статистика-->
      <!--          </h3>-->
      <!--        </div>-->
      <!--        <div class="card-content">-->
      <!--          <div class="stats-grid">-->
      <!--            <div class="stat-item">-->
      <!--              <div class="stat-number">{{ competencies.length }}</div>-->
      <!--              <div class="stat-label">Компетенций</div>-->
      <!--            </div>-->
      <!--            <div class="stat-item">-->
      <!--              <div class="stat-number">{{-->
      <!--                  competencies.reduce((acc, competence) => competence.participantsCount + acc, 0)-->
      <!--                }}</div>-->
      <!--              <div class="stat-label">Участников</div>-->
      <!--            </div>-->
      <!--            <div class="stat-item">-->
      <!--              <div class="stat-number">{{ totalStats.events }}</div>-->
      <!--              <div class="stat-label">Событий</div>-->
      <!--            </div>-->
      <!--            <div class="stat-item">-->
      <!--              <div class="stat-number">{{ totalStats.documents }}</div>-->
      <!--              <div class="stat-label">Документов</div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->


      <!-- Быстрые действия -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-bolt" />
            Быстрые действия
          </h3>
        </div>
        <div class="card-content">
          <div class="quick-actions">
            <!--            <Button -->
            <!--              label="Создать событие" -->
            <!--              icon="pi pi-calendar-plus"-->
            <!--              class="p-button-primary"-->
            <!--              @click="createEvent"-->
            <!--            />-->
            <Button
              label="Загрузить документ"
              icon="pi pi-upload"
              :disabled="competencies.length === 0"
              class="p-button-primary"
              @click="addDocument"
            />
            <!--            <Button -->
            <!--              label="Просмотреть события" -->
            <!--              icon="pi pi-calendar"-->
            <!--              class="p-button-outlined"-->
            <!--              @click="viewEvents"-->
            <!--            />-->
            <Button
              label="Управление компетенциями"
              icon="pi pi-cog"
              class="p-button-outlined"
              @click="manageCompetencies"
            />
          </div>
        </div>
      </div>

      <!-- Последние события -->
      <!--      <div class="info-card">-->
      <!--        <div class="card-header">-->
      <!--          <h3 class="card-title">-->
      <!--            <i class="pi pi-clock"></i>-->
      <!--            Последние события-->
      <!--          </h3>-->
      <!--        </div>-->
      <!--        <div class="card-content">-->
      <!--          <div class="events-list">-->
      <!--            <div v-for="event in recentEvents" :key="event.id" class="event-item">-->
      <!--              <div class="event-icon">-->
      <!--                <i :class="event.icon"></i>-->
      <!--              </div>-->
      <!--              <div class="event-content">-->
      <!--                <div class="event-title">{{ event.title }}</div>-->
      <!--                <div class="event-competence">{{ event.competence }}</div>-->
      <!--                <div class="event-date">{{ event.date }}</div>-->
      <!--              </div>-->
      <!--              <div class="event-status" :class="event.statusClass">-->
      <!--                {{ event.status }}-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
    </div>

    <!--    Модальное окно для загрузки документов конкретной компетенции-->
    <Dialog
      v-model:visible="showCompetenceDocModal"
      header="Загрузить документ"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="competence-form">
        <div
          class="form-field"
          style="gap: 0.5rem"
        >
          <label
            for="competenceList"
            class="field-label"
          >Компетенция *</label>
          <Dropdown
            id="competenceList"
            v-model="selectedCompetence"
            :options="competencies"
            option-label="name"
            placeholder="Не выбран"
            class="competence-dropdown w-full"
            :class="{ 'p-invalid': !selectedCompetence }"
          >
            <template #value="{ value }">
              {{ value ? value.name : "Не выбран" }}
            </template>
          </Dropdown>
          <small
            v-if="!selectedCompetence"
            class="p-error"
          >{{
            errors.selectedCompetence
          }}</small>
        </div>

        <div
          class="form-field"
          style="gap: 0.5rem"
        >
          <label
            for="competenceList"
            class="field-label"
          >Тип документа *</label>
          <Dropdown
            id="competenceList"
            v-model="selectedDoctype"
            :options="DocumentTypes"
            option-value="value"
            option-label="label"
            placeholder="Не выбран"
            class="competence-dropdown w-full"
            :class="{ 'p-invalid': !selectedDoctype }"
          />
          <small
            v-if="!selectedDoctype"
            class="p-error"
          >{{
            errors.selectedDoctype
          }}</small>
        </div>

        <div
          class="form-field"
          style="gap: 0.5rem"
        >
          <label
            for="competenceList"
            class="field-label"
          >Возрастная группа *</label>
          <Dropdown
            v-model="selectedAge"
            :options="ageGroups"
            option-label="label"
            option-value="value"
            placeholder="Возрастная группа"
            class="filter-dropdown filter-upload"
            :class="{ 'p-invalid': !selectedAge }"
          />
          <small
            v-if="!selectedAge"
            class="p-error"
          >{{ errors.selectedAge
          }}</small>
        </div>

        <div
          class="form-field"
          style="gap: 0.5rem"
        >
          <label
            for="competenceDocument"
            class="field-label"
          >Документ *</label>
          <FileUpload
            id="competenceDocument"
            mode="basic"
            accept=".pdf, .docx, .xlsx"
            :max-file-size="5000000"
            choose-label="Выберите файл"
            class="w-full"
            :class="{ 'p-invalid': errors.competenceDocument }"
            @select="onDocumentSelect"
            @remove="onDocumentRemove"
          />
          <small
            v-if="errors.competenceDocument"
            class="p-error"
          >{{
            errors.competenceDocument
          }}</small>
          <small class="p-text-secondary">Поддерживаемые форматы: PDF, DOCX, XLSX (максимум 5 МБ)</small>
        </div>
      </div>

      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelLoad"
        />
        <Button
          label="Загрузить"
          icon="pi pi-check"
          class="p-button-primary"
          @click="uploadDocument"
        />
      </template>
    </Dialog>

    <!-- Toast уведомление -->
    <ToastPopup
      v-if="errors.toastPopup.title && errors.toastPopup.message"
      :content="errors.toastPopup"
    />
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import {
  CompetenceResolver,
} from "@/api/resolvers/competence/competence.resolver";
import Dialog from "primevue/dialog";
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
import Dropdown from "primevue/dropdown";
import { FileType } from "@/api/resolvers/files/file.resolver";
import { CompetenceDocumentsResolver } from "@/api/resolvers/competenceDocuments/competence-documents.resolver";
import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
import type {UserOutputDto} from "@/api/resolvers/user/dto/output/user-output.dto.ts";
import {UserResolver} from "@/api/resolvers/user/user.resolver.ts";
import { useDocumentTypes } from '@/shared/UseDocumentTypes.ts';
import { useUserStore } from '@/stores/userStore.ts';
import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
import ToastPopup from '@/components/ToastPopup.vue';
import { FormatManager } from '@/utils/FormatManager.ts';
import { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';

export default {
  name: "ExpertDashboardHome",
  components: {
    FileUpload,
    Dropdown,
    Dialog,
    Button,
    ToastPopup,
  },
emits: ['openSettings'],
  data() {
    return {
      userStore: useUserStore(),
      DocumentTypes: useDocumentTypes,
      ageGroups: useAgeGroups,
      selectedDoctype: null as null | FileType,
      showCompetenceDocModal: false,
      selectedCompetence: null as CompetenceOutputDto | null,
      competencies: [] as CompetenceOutputDto[],
      selectedDocument: null as null | File,
      selectedAge: null as null | AgeCategories,
      errors: {
        toastPopup: {
          title: "",
          message: "",
        },
        ageCategory: "",
        competenceDocument: "",
        selectedCompetence: "",
        selectedDoctype: "",
        selectedDocument: "",
        selectedAge: "",
      },
      currentExpert: null as UserOutputDto | null,
      usersResolver: new UserResolver(),
    };
  },
  computed: {
    FormatManager() {
      return FormatManager
    },
    user() {
      return this.userStore.user
    }
  },
  async mounted() {
    await this.getCurrentExpert();
    if (this.user !== null) {
      const competenceResolver = new CompetenceResolver();
      const response = await competenceResolver.getAllByExpertId(this.user.id);
      if (response.status === 200 && typeof response.message !== "string") {
        this.competencies = response.message;
      }
    }
  },

  methods: {
    async getCurrentExpert() {
      if (this.user !== null) {
        const res = await this.usersResolver.getById(this.user.id)

        if (res.status === 200) {
          this.currentExpert = res.message as UserOutputDto;
        } else {
          this.errors.toastPopup = {
            title: res.status.toString(),
            message: res.message.toString(),
          };
        }
      }
    },

    goToCompetence(competenceId: number) {
      this.$router.push(`/expert/competencies/${competenceId}`);
    },
    goToDocuments(competenceId: number) {
      this.$router.push(`/expert/documents/${competenceId}`);
    },
    goToAllCompetencies() {
      this.$router.push("/expert/competencies");
    },
    async uploadDocument() {
      let isValid = true;
      if (this.selectedCompetence == null) {
        this.errors.selectedCompetence = "Выберите компетенцию";
        isValid = false;
      }
      if (this.selectedDocument == null) {
        this.errors.competenceDocument = "Выберите документ";
        isValid = false;
      }
      if (this.selectedDoctype == null) {
        this.errors.selectedDoctype = "Выберите тип документа";
        isValid = false;
      }
      if (this.selectedAge == null) {
        this.errors.selectedAge = "Выберите возрастную группу";
        isValid = false;
      }
      if (isValid && this.user !== null) {
        const competenceDocumentsResolver = new CompetenceDocumentsResolver();
        const response = await competenceDocumentsResolver.create({
          documentType: this.selectedDoctype!!,
          document: this.selectedDocument!!,
          ageCategory: this.selectedAge!,
          userId: this.user.id,
          directionId: this.selectedCompetence!!.id,
        });
        if (response.status !== 200) {
          this.errors.toastPopup = {
            title: response.status.toString(),
            message: response.message.toString(),
          };
        } else {
          this.errors.toastPopup = {
            title: "Успешно!",
            message: "Документ был успешно загружен"
          };
          this.showCompetenceDocModal = false;
          setTimeout(() => {
            this.errors.toastPopup = {
              title: "",
              message: "",
            };
          }, 6000);
        }
      }
    },
    cancelLoad() {
      this.showCompetenceDocModal = false;
      if (!this.errors.toastPopup.title && !this.errors.toastPopup.message) {
        this.errors.toastPopup = {
          title: "",
          message: "",
        };
      }
    },
    addDocument() {
      this.errors.toastPopup = {
        title: "",
        message: "",
      };
      this.showCompetenceDocModal = true;
    },
    manageCompetencies() {
      this.$router.push("/expert/competencies");
    },
    onDocumentSelect(event: FileUploadSelectEvent) {
      this.selectedDocument = event.files[0];
    },
    onDocumentRemove() {
      this.selectedDocument = null;
      this.errors.selectedDocument = "";
    },
    getTotalParticipants(competence: CompetenceOutputDto) {
      if (!competence.ageCategories) return 0;
      return competence.ageCategories.reduce((total, ageCategory) => {
        return total + (ageCategory.currentParticipantsCount || 0);
      }, 0);
    },

  },
};
</script>

<style scoped>
.dashboard-home {
  max-width: 1200px;
  margin: 0 auto;
  animation: slideInRight 0.4s ease-out;
  width: 100%;
  box-sizing: border-box;
}

.form-field {
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
}

.form-field label {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.info-card {
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
  max-height: 30rem;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.info-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.card-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.card-content::-webkit-scrollbar {
  width: 6px;
}

.card-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.card-content::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 3px;
}

.card-content::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

.data-section {
  margin-bottom: 1.5rem;
}

.data-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.data-item:last-child {
  border-bottom: none;
}

.data-label {
  color: #6c757d;
  font-weight: 500;
  min-width: 120px;
}

.data-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

/* Компетенции */
.competencies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: stretch;
}

.competence-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 280px;
  max-height: 30rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.competence-card:hover {
  background: #fff3e0;
  border-color: #ff9800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}

.competence-header {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.competence-name {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.competence-ages-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.competence-age {
  color: #6c757d;
  font-size: 0.9rem;
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  display: inline-block;
}

.competence-stats {
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.2rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  line-height: 1;
}

.competence-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-right: 4px;
}

.competence-content::-webkit-scrollbar {
  width: 4px;
}

.competence-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.competence-content::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 2px;
}

.competence-content::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

.competence-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  flex-shrink: 0;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 1rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-actions {
  text-align: center;
  margin-top: 1rem;
}


/* Быстрые действия */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .dashboard-home {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .info-card {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0;
    max-height: 20rem;
  }

  .card-content {
    padding: 1rem;
  }

  .competencies-grid {
    grid-template-columns: 1fr;
  }

  .competence-actions {
    flex-direction: column;
  }

  .competence-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-item {
    flex: none;
    width: 100%;
  }

  .competence-card {
    height: 250px;
  }

  .quick-actions {
    gap: 0.5rem;
  }

  .stat-number {
    font-size: 1rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .dashboard-home {
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

  .card-content {
    padding: 0.75rem;
  }

  .competence-card {
    padding: 0.75rem;
  }

  .competence-actions {
    gap: 0.25rem;
  }

  .competence-card {
    height: 220px;
  }

  .stat-item {
    padding: 0.75rem;
  }

  .stat-number {
    font-size: 1rem;
  }
}

/* Стили для отображения мест по возрастным категориям */
.age-places-section {
  margin: 0.75rem 0;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.age-places-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.4rem;
}

.age-places-list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.age-place-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0;
  font-size: 0.75rem;
}

.age-label {
  color: #6c757d;
  font-weight: 500;
}

.places-count {
  color: #ff9800;
  font-weight: 600;
}
</style>
