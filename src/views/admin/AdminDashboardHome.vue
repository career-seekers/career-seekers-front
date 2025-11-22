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
            <i class="pi pi-file"/>
            Данные о документах
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
                v-if="statisticsStore.getDirectionDocsCount != null"
                class="stat-item"
            >
              <div class="stat-number">
                {{ statisticsStore.getDirectionDocsCount }}
              </div>
              <div class="stat-label">
                Всего документов
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
            <div
                v-if="statisticsStore.getLastDocumentUpload != null"
                class="stat-item"
            >
              <div class="stat-number">
                {{ statisticsStore.getLastDocumentUpload.toString().substring(0, 10) }}
              </div>
              <div class="stat-label">
                Последняя загрузка
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
          </div>

          <div class="card-actions">
            <Button
                label="Управление документами"
                icon="pi pi-cog"
                class="p-button-outlined"
                @click="router().push('/admin/documents')"
            />
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
          <div>
            <Button
                label="Полная выгрузка данных об участниках чемпионата"
                icon="pi pi-download"
                :loading="isLoading"
                @click="downloadAllChildrenReport"
            />
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-users"/>
            Данные об экспертах
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
                v-if="expertsStatistics"
                class="stat-item"
            >
              <div class="stat-number">
                {{ expertsStatistics.count }}
              </div>
              <div class="stat-label">
                Всего экспертов
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
            <div
                v-if="expertsStatistics"
                class="stat-item"
            >
              <div class="stat-number">
                {{ expertsStatistics.verified }}
              </div>
              <div class="stat-label">
                Верифицированных
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
          </div>

          <div class="card-actions">
            <Button
                label="Управление экспертами"
                icon="pi pi-cog"
                class="p-button-outlined"
                @click="router().push('/admin/experts')"
            />
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-users"/>
            Данные о кураторах
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
                v-if="tutorsStatistics"
                class="stat-item"
            >
              <div class="stat-number">
                {{ tutorsStatistics.count }}
              </div>
              <div class="stat-label">
                Всего кураторов
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
            <div
                v-if="tutorsStatistics"
                class="stat-item"
            >
              <div class="stat-number">
                {{ tutorsStatistics.verified }}
              </div>
              <div class="stat-label">
                Верифицированных
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
          </div>

          <div class="card-actions">
            <Button
                label="Управление кураторами"
                icon="pi pi-cog"
                class="p-button-outlined"
                @click="router().push('/admin/tutors')"
            />
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-building"/>
            Данные о площадках
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
                v-if="statisticsStore.getPlatformsCount != null"
                class="stat-item"
            >
              <div class="stat-number">
                {{ statisticsStore.getPlatformsCount }}
              </div>
              <div class="stat-label">
                Всего площадок
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
            <div
                v-if="statisticsStore.getVerifiedPlatformsCount != null"
                class="stat-item"
            >
              <div class="stat-number">
                {{ statisticsStore.getVerifiedPlatformsCount }}
              </div>
              <div class="stat-label">
                Верифицированных
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
          </div>

          <div class="card-actions">
            <Button
                label="Управление площадками"
                icon="pi pi-cog"
                class="p-button-outlined"
                @click="router().push('/admin/venues')"
            />
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-briefcase"/>
            Данные о компетенциях
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
                v-if=" statisticsStore.getDirectionsCount != null"
                class="stat-item"
            >
              <div class="stat-number">
                {{ statisticsStore.getDirectionsCount }}
              </div>
              <div class="stat-label">
                Всего компетенций
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
            <div
                v-if="statisticsStore.directionsWithoutDocs != null"
                class="stat-item"
            >
              <div class="stat-number">
                {{ statisticsStore.directionsWithoutDocs }}
              </div>
              <div class="stat-label">
                Без документов
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
          </div>

          <div class="card-actions">
            <Button
                label="Управление компетенциями"
                icon="pi pi-cog"
                class="p-button-outlined"
                @click="router().push('/admin/competencies')"
            />
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-users"/>
            Данные об участниках
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
                v-if="usersStatistics"
                class="stat-item"
            >
              <div class="stat-number">
                {{ usersStatistics.count }}
              </div>
              <div class="stat-label">
                Всего родителей
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
            <div
                v-if="childrenCount"
                class="stat-item"
            >
              <div class="stat-number">
                {{ childrenCount }}
              </div>
              <div class="stat-label">
                Всего детей
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
          </div>

          <div class="card-actions">
            <Button
                label="Управление участниками"
                icon="pi pi-cog"
                class="p-button-outlined"
                @click="router().push('/admin/users')"
            />
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-users"/>
            Данные о наставниках
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
                v-if="mentorsStatistics"
                class="stat-item"
            >
              <div class="stat-number">
                {{ mentorsStatistics.count }}
              </div>
              <div class="stat-label">
                Всего наставников
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
            <div
                v-if="mentorsStatistics"
                class="stat-item"
            >
              <div class="stat-number">
                {{ mentorsStatistics.verified }}
              </div>
              <div class="stat-label">
                Верифицированных
              </div>
            </div>
            <div
                v-else
                class="stat-item"
            >
              <ProgressSpinner
                  class="spinner"
                  style="display: flex; max-height: 3.5rem"
              />
            </div>
          </div>

          <div class="card-actions">
            <Button
                label="Управление наставниками"
                icon="pi pi-cog"
                class="p-button-outlined"
                @click="router().push('/admin/mentors')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Button from 'primevue/button';
import router from '@/router';
import {useUserStore} from '@/stores/userStore.ts';
import {FormatManager} from '@/utils/FormatManager.ts';
import ProgressSpinner from 'primevue/progressspinner';
import {UsersStatisticsResolver} from "@/api/resolvers/statistic/users-statistics.resolver.ts";
import type {UsersStatisticsOutputDto} from "@/api/resolvers/statistic/dto/output/users-statistics-output.dto.ts";
import {getExtensionFromMimeType} from '@/shared/UseMimeTypes.ts';
import {ReportResolver} from '@/api/resolvers/reports/report.resolver.ts';
import {statisticsStore} from "@/stores/statisticsStore.ts";

export default {
  name: 'AdminDashboardHome',
  components: {
    Button,
    ProgressSpinner
  },
  emits: ['openSettings'],
  data: function () {
    return {
      userStore: useUserStore(),
      statisticsStore: statisticsStore(),
      usersStatisticsResolver: new UsersStatisticsResolver(),
      reportResolver: new ReportResolver(),

      tutorsStatistics: null as null | UsersStatisticsOutputDto,
      expertsStatistics: null as null | UsersStatisticsOutputDto,
      mentorsStatistics: null as null | UsersStatisticsOutputDto,
      usersStatistics: null as null | UsersStatisticsOutputDto,
      childrenCount: null as null | number,

      isLoading: false,
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
  async beforeMount() {
    this.isLoading = true;
    const [
      tutorsInfo,
      expertsInfo,
      mentorsInfo,
      usersInfo,
      childrenCount,
    ] = await Promise.all([
      this.usersStatisticsResolver.getTutorsInfo(),
      this.usersStatisticsResolver.getExpertsInfo(),
      this.usersStatisticsResolver.getMentorsInfo(),
      this.usersStatisticsResolver.getUsersInfo(),
      this.usersStatisticsResolver.getChildrenCount(),
    ]);

    this.tutorsStatistics = tutorsInfo.message;
    this.expertsStatistics = expertsInfo.message;
    this.mentorsStatistics = mentorsInfo.message;
    this.usersStatistics = usersInfo.message;
    this.childrenCount = childrenCount.message;

    this.isLoading = false;
  },
  methods: {
    router() {
      return router
    },

    async downloadAllChildrenReport() {
      this.isLoading = true
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
        this.isLoading = false;
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

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.card-actions {
  text-align: center;
  margin-top: 1rem;
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

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-number {
    font-size: 1.5rem;
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
    padding: 1rem;

    button {
      height: 2rem;
      width: auto;
      aspect-ratio: 1;
    }
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

  .stats-grid {
    gap: 0.5rem;
    margin-bottom: 0;
  }

  .stat-item {
    padding: 0.75rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }
}
</style>
