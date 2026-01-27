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
        Управляйте всеми основными аспектами сервиса
      </p>
    </div>

    <div class="dashboard-grid">
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user"/>
            Профиль
          </h3>
          <Button
              v-tooltip="'Редактировать'"
              icon="pi pi-pencil"
              style="background: white;"
              class="p-button-text"
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
                  user.lastName +
                  " " +
                  user.firstName +
                  " " +
                  user.patronymic
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
              <span class="data-value">Администратор</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-book"/>
            Отчеты
          </h3>
        </div>
        <div class="card-content">
          <div class="buttons-container">
            <Button
                label="Полная выгрузка данных об участниках чемпионата"
                icon="pi pi-download"
                :loading="isParticipantsReportLoading"
                @click="downloadAllChildrenReport"
            />
            <Button
                label="Выгрузка данных о событиях"
                icon="pi pi-download"
                :loading="isEventReportLoading"
                @click="downloadEventsReport"
            />
          </div>
        </div>
      </div>

      <StatisticsInfoCard :first-data-value="statisticsStore.getDirectionDocsCount"
                          :second-data-value="statisticsStore.getLastDocumentUpload?.toString().substring(0, 10)"
                          card-header="Данные о документах"
                          first-data-label="Всего документов"
                          second-data-label="Последняя загрузка"
                          action-button-label="Управление документами"
                          redirect-to="/admin/documents"/>

      <StatisticsInfoCard :first-data-value="statisticsStore.getExpertsInfo?.count"
                          :second-data-value="statisticsStore.getExpertsInfo?.verified"
                          card-header="Данные об экспертах"
                          first-data-label="Всего экспертов"
                          second-data-label="Верифицированных"
                          action-button-label="Управление экспертами"
                          redirect-to="/admin/experts"/>

      <StatisticsInfoCard :first-data-value="statisticsStore.getTutorsInfo?.count"
                          :second-data-value="statisticsStore.getTutorsInfo?.verified"
                          card-header="Данные о кураторах"
                          first-data-label="Всего кураторов"
                          second-data-label="Верифицированных"
                          action-button-label="Управление кураторами"
                          redirect-to="/admin/tutors"/>

      <StatisticsInfoCard :first-data-value="statisticsStore.getPlatformsCount"
                          :second-data-value="statisticsStore.getVerifiedPlatformsCount"
                          card-header="Данные о площадках"
                          first-data-label="Всего площадок"
                          second-data-label="Верифицированных"
                          action-button-label="Управление кураторами"
                          redirect-to="/admin/venues"/>

      <StatisticsInfoCard :first-data-value="statisticsStore.getDirectionsCount"
                          :second-data-value="statisticsStore.getDirectionsWithoutDocs"
                          card-header="Данные о компетенциях"
                          first-data-label="Всего компетенций"
                          second-data-label="Без документов"
                          action-button-label="Управление компетенциями"
                          redirect-to="/admin/competencies"/>

      <StatisticsInfoCard :first-data-value="statisticsStore.getEventsCount"
                          :second-data-value="statisticsStore.getVerifiedEventsCount"
                          card-header="Данные о событиях"
                          first-data-label="Всего событий"
                          second-data-label="Верифицированных событий"
                          action-button-label="Управление событиями"
                          redirect-to="/admin/events"/>

      <StatisticsInfoCard :first-data-value="statisticsStore.getUsersInfo?.count"
                          :second-data-value="statisticsStore.getChildrenCount"
                          card-header="Данные об участниках"
                          first-data-label="Всего родителей"
                          second-data-label="Всего детей"
                          action-button-label="Управление участниками"
                          redirect-to="/admin/users"/>

      <StatisticsInfoCard :first-data-value="statisticsStore.getMentorsInfo?.count"
                          :second-data-value="statisticsStore.getMentorsInfo?.verified"
                          card-header="Данные о наставниках"
                          first-data-label="Всего наставников"
                          second-data-label="Верифицированных"
                          action-button-label="Управление наставниками"
                          redirect-to="/admin/mentors"/>

    </div>
  </div>
</template>

<script lang="ts">
import Button from 'primevue/button';
import router from '@/router';
import {useUserStore} from '@/stores/userStore.ts';
import {FormatManager} from '@/utils/FormatManager.ts';
import ProgressSpinner from 'primevue/progressspinner';
import {getExtensionFromMimeType} from '@/shared/UseMimeTypes.ts';
import {ReportResolver} from '@/api/resolvers/reports/report.resolver.ts';
import {statisticsStore} from "@/stores/statisticsStore.ts";
import StatisticsInfoCard from "@/views/shared/StatisticsInfoCard.vue";

export default {
  name: 'AdminDashboardHome',
  components: {
    StatisticsInfoCard,
    Button,
    ProgressSpinner
  },
  emits: ['openSettings'],
  data: function () {
    return {
      userStore: useUserStore(),
      statisticsStore: statisticsStore(),

      reportResolver: new ReportResolver(),

      isParticipantsReportLoading: false,
      isEventReportLoading: false,
    };
  },
  computed: {
    FormatManager() {
      return FormatManager
    },
    user() {
      return this.userStore.user
    },
  },
  methods: {
    router() {
      return router
    },

    async downloadAllChildrenReport() {
      this.isParticipantsReportLoading = true
      try {
        const blobResponse = await this.reportResolver.getAllChildrenReports()
        const url = window.URL.createObjectURL(blobResponse);
        const extension = getExtensionFromMimeType(blobResponse.type)
        const a = document.createElement('a');
        a.href = url;
        a.download = `Полная выгрузка данных об участниках чемпионата.${extension}`
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Ошибка при загрузке отчета:', error);
        alert('Не удалось загрузить отчет. Пожалуйста, попробуйте еще раз позже.');
      } finally {
        this.isParticipantsReportLoading = false;
      }
    },

    async downloadEventsReport() {
      this.isEventReportLoading = true
      try {
        const blobResponse = await this.reportResolver.getEventsReport()
        const url = window.URL.createObjectURL(blobResponse);
        const extension = getExtensionFromMimeType(blobResponse.type)
        const a = document.createElement('a');
        a.href = url;
        a.download = `Выгрузка данных о событиях.${extension}`
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Ошибка при загрузке отчета:', error);
        alert('Не удалось загрузить отчет. Пожалуйста, попробуйте еще раз позже.');
      } finally {
        this.isEventReportLoading = false;
      }
    }
  },
}
</script>

<style scoped>
.dashboard-home {
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
  transition: box-shadow 0.3s ease,
  border-color 0.3s ease;
  width: 100%;
  max-width: 100%;
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
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    margin: -1rem 0;
  }
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
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  align-items: flex-start;
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
  flex-shrink: 0;
}

.data-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-word;
}

/* Быстрые действия */
.form-field label {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .dashboard-home {
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
  }

  .page-subtitle {
    color: #6c757d;
    margin: 0;
    font-size: 1.1rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  .card-content {
    padding: 1rem;
  }

  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .data-value {
    text-align: left;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .dashboard-home {
    padding: 0 0.5rem;
    max-width: 100%;
    width: 100%;
  }

  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
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
    }

    .card-header {
      padding: 1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .card-content {
      padding: 1rem;
    }

    .data-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .data-value {
      text-align: left;
    }
  }

  /* Очень маленькие экраны */
  @media (max-width: 480px) {
    .dashboard-home {
      padding: 0 0.5rem;
      max-width: 100%;
      width: 100%;
    }

    .dashboard-grid {
      gap: 0.75rem;
      width: 100%;
      max-width: 100%;
      padding: 0;
      margin: 0;
    }

    .page-title {
      font-size: 1.3rem;
    }

    .page-subtitle {
      font-size: 0.9rem;
    }

    .info-card {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box;
      margin: 0;
    }

    .card-header {
      padding: 0.75rem;
    }

    .card-title {
      font-size: 1rem;
    }

    .card-content {
      padding: 0.75rem;
    }

    .data-item {
      padding: 0.5rem 0;
    }

    .data-label {
      font-size: 0.85rem;
    }

    .data-value {
      font-size: 0.9rem;
    }
  }
}
</style>
