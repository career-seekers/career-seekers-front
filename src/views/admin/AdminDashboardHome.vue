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
            <i class="pi pi-user" />
            Информация об администраторе
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
            <i class="pi pi-users" />
            Информация о кураторах
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
              v-if="tutors.length > 0"
              class="stat-item"
            >
              <div class="stat-number">
                {{ tutors.length }}
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
              v-if="tutors.length > 0"
              class="stat-item"
            >
              <div class="stat-number">
                {{ tutors.filter(tutor => tutor.verified).length }}
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
            <i class="pi pi-users" />
            Информация о наставниках
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
              v-if="mentors.length > 0"
              class="stat-item"
            >
              <div class="stat-number">
                {{ mentors.length }}
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
              v-if="mentors.length > 0"
              class="stat-item"
            >
              <div class="stat-number">
                {{ mentors.filter(mentor => mentor.verified).length }}
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

      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-building" />
            Информация о площадках
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
              v-if="venuesCount != null"
              class="stat-item"
            >
              <div class="stat-number">
                {{ venuesCount }}
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
              v-if="venuesCount != null"
              class="stat-item"
            >
              <div class="stat-number">
                {{ verifiedVenuesCount }}
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
            <i class="pi pi-briefcase" />
            Информация о компетенциях
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
              v-if=" directionsCount != null"
              class="stat-item"
            >
              <div class="stat-number">
                {{ directionsCount }}
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
              v-if="directionsWithoutDocs != null"
              class="stat-item"
            >
              <div class="stat-number">
                {{ directionsWithoutDocs }}
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
            <i class="pi pi-users" />
            Информация об экспертах
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
              v-if="experts.length > 0"
              class="stat-item"
            >
              <div class="stat-number">
                {{ experts.length }}
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
              v-if="experts.length > 0"
              class="stat-item"
            >
              <div class="stat-number">
                {{ experts.filter(expert => expert.verified).length }}
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
            <i class="pi pi-file" />
            Информация о документах
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
              v-if="directionDocsCount != null"
              class="stat-item"
            >
              <div class="stat-number">
                {{ directionDocsCount }}
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
              v-if="lastDocumentUpload != null"
              class="stat-item"
            >
              <div class="stat-number">
                {{ lastDocumentUpload.toString().substring(0, 10) }}
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
            <i class="pi pi-users" />
            Информация об участниках
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div
              v-if="users.length > 0"
              class="stat-item"
            >
              <div class="stat-number">
                {{ users.length }}
              </div>
              <div class="stat-label">
                Родителей
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
              v-if="children.length > 0"
              class="stat-item"
            >
              <div class="stat-number">
                {{ children.length }}
              </div>
              <div class="stat-label">
                Детей
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
    </div>
  </div>
</template>

<script lang="ts">
  import Button from 'primevue/button';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import { Roles } from '@/state/UserState.types.ts';
  import router from '@/router';
  import { useUserStore } from '@/stores/userStore.ts';
  import { FormatManager } from '@/utils/FormatManager.ts';
  import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
  import ProgressSpinner from 'primevue/progressspinner';
  import {StatisticsResolver} from "@/api/resolvers/statistic/statistics.resolver.ts";
  import type {ChildOutputDto} from "@/api/resolvers/child/dto/output/child-output.dto.ts";

  export default {
    name: 'AdminDashboardHome',
    components: {
      Button,
      ProgressSpinner
    },
emits: ['openSettings'],
    data: function() {
      return {
        userStore: useUserStore(),
        userResolver: new UserResolver(),
        childResolver: new ChildResolver(),
        statisticsResolver: new StatisticsResolver(),

        users: [] as UserOutputDto[],
        tutors: [] as UserOutputDto[],
        mentors: [] as UserOutputDto[],
        experts: [] as UserOutputDto[],
        children: [] as ChildOutputDto[],

        venuesCount: null as number | null,
        verifiedVenuesCount: null as number | null,
        directionsCount: null as number | null,
        directionsWithoutDocs: null as number | null,
        directionDocsCount: null as number | null,
        lastDocumentUpload: null as Date | null,
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
      this.venuesCount = await this.statisticsResolver.getPlatformsCount()
      this.verifiedVenuesCount = await this.statisticsResolver.getVerifiedPlatformsCount()
      this.directionsCount = await this.statisticsResolver.getDirectionsCount()
      this.directionsWithoutDocs = await this.statisticsResolver.getDirectionsWithoutDocsCount()
      this.directionDocsCount = await this.statisticsResolver.getDirectionDocsCount()
      this.lastDocumentUpload = await this.statisticsResolver.getLastDocumentUpload()

      let response
      response = await this.userResolver.getAllByRole(Roles.TUTOR)
      if (typeof response.message !== 'string') {
        this.tutors = response.message
      }
      response = await this.userResolver.getAllByRole(Roles.MENTOR)
      if (typeof response.message !== 'string') {
        this.mentors = response.message
      }
      response = await this.userResolver.getAllByRole(Roles.EXPERT)
      if (typeof response.message !== 'string') {
        this.experts = response.message
      }
      response = await this.userResolver.getAllByRole(Roles.USER)
      if (typeof response.message !== 'string') {
        this.users = response.message
      }
      response = await this.childResolver.getAll()
      if (typeof response.message !== 'string') {
        this.children = response.message
      }
    },
    methods: {
      router() {
        return router
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
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
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

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-pending {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid #ffc107;
  }

  .status-approved {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
    border: 1px solid #28a745;
  }

  .status-rejected {
    background: rgba(220, 53, 69, 0.2);
    color: #dc3545;
    border: 1px solid #dc3545;
  }

  .card-content {
    padding: 1.5rem;
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
  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    margin: 1rem 0;
  }

  .form-field.full-width {
    grid-column: 1 / -1;
  }

  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  /* Обновления */
  .updates-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .update-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f3f4;
  }

  .update-item:last-child {
    border-bottom: none;
  }

  .update-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #ff9800, #f57c00);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .update-content {
    flex: 1;
  }

  .update-text {
    color: #2c3e50;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .update-time {
    color: #6c757d;
    font-size: 0.8rem;
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

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stat-number {
      font-size: 1.5rem;
    }

    .quick-actions {
      gap: 0.5rem;
    }

    .update-item {
      padding: 0.5rem 0;
    }

    .update-icon {
      width: 28px;
      height: 28px;
      font-size: 0.8rem;
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

    .stats-grid {
      gap: 0.5rem;
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

    .quick-actions {
      gap: 0.4rem;
    }

    .update-item {
      padding: 0.4rem 0;
    }

    .update-icon {
      width: 24px;
      height: 24px;
      font-size: 0.7rem;
    }

    .update-text {
      font-size: 0.8rem;
    }

    .update-time {
      font-size: 0.7rem;
    }
  }
</style>
