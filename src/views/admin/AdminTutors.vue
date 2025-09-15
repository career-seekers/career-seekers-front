<template>
  <div class="mentors-page">
    <div class="page-header">
      <h1 class="page-title">
        Кураторы
      </h1>
      <p class="page-subtitle">
        Управление кураторами
      </p>
    </div>

    <!-- Список экспертов -->
    <div class="experts-grid">
      <div
        v-for="tutor in tutors"
        :key="tutor.id"
        class="expert-card"
      >
        <div class="expert-header">
          <div class="expert-avatar">
            <i class="pi pi-user" />
          </div>
          <div class="expert-info">
            <h3 class="expert-name">
              {{
                tutor.lastName +
                  " " +
                  tutor.firstName +
                  " " +
                  tutor.patronymic
              }}
            </h3>
            <p class="expert-position">
              {{ tutor.tutorDocuments !== null ? 'Подтверждено' : 'Не подтверждено' }}
            </p>
          </div>
          <div class="expert-actions">
            <Button
              v-tooltip="'Удалить'"
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              style="background: white"
              @click="deleteTutor(tutor)"
            />
          </div>
        </div>

        <div class="expert-content">
          <div class="expert-details">
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ tutor.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{
                reformatPhone(tutor.mobileNumber)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Должность:</span>
              <span class="detail-value">{{
                tutor.tutorDocuments 
                  ? tutor.tutorDocuments.post
                  : "Не указано"
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Образовательное учреждение:</span>
              <span class="detail-value">{{
                tutor.tutorDocuments
                  ? tutor.tutorDocuments.institution
                  : "Не указано"
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
  import ToastPopup from '@/components/ToastPopup.vue';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { Roles } from '@/state/UserState.types.ts';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import Button from 'primevue/button';

  export default {
    name: 'AdminTutors',
    components: {
      ToastPopup,
      Button,

    },
    data() {
      return {
        userResolver: new UserResolver(),
        
        tutors: [] as UserOutputDto[],
        isEditing: false,
        
        errors: {
          toastPopup: {
            title: "",
            message: ""
          }
        }
      }
    },
    async beforeMount() { await this.loadTutors(); },
    methods: {
      reformatPhone(phone: string) {
        return `${phone.substring(0, 2)} (${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8, 10)}-${phone.substring(10, 12)}`;
      },
      async loadTutors() {
        const response = await this.userResolver.getAllByRole(Roles.TUTOR)
        if (typeof response.message !== "string") {
          this.tutors = response.message
        }
      },
      async deleteTutor(tutor: UserOutputDto) {
        if (
          confirm(`Вы уверены, что хотите удалить куратора ${tutor.firstName}?`)
        ) {
          const response = await this.userResolver.delete(tutor.id);
          if (response.status === 200) {
            await this.loadTutors();
          } else {
            this.errors.toastPopup = {
              title: response.status.toString(),
              message: response.message,
            };
          }
        }
      }
    }
  };
</script>

<style scoped>
  .experts-page {
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
    text-align: right;
  }

  .experts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .expert-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease;
  }

  .expert-card:hover {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
    border: 2px solid #ff9800;
  }

  .expert-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .expert-avatar {
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

  .expert-info {
    flex: 1;
  }

  .expert-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .expert-position {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .expert-actions {
    display: flex;
    gap: 0.5rem;
  }

  .expert-content {
    padding: 1.5rem;
  }

  .expert-details {
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

  .competencies-section {
    margin-bottom: 1.5rem;
  }

  .competencies-title {
    color: #2c3e50;
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    border-bottom: 2px solid #ff9800;
    padding-bottom: 0.25rem;
  }

  .competencies-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .competence-tag {
    background: #f8f9fa;
    color: #2c3e50;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid #e9ecef;
  }

  .expert-status {
    text-align: center;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-active {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
    border: 1px solid #28a745;
  }

  .status-pending {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid #ffc107;
  }

  .status-inactive {
    background: rgba(108, 117, 125, 0.2);
    color: #6c757d;
    border: 1px solid #6c757d;
  }

  /* Форма */
  .expert-form {
    padding: 1rem 0;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
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

  /* Мобильные стили */
  @media (max-width: 768px) {
    .experts-page {
      padding: 0 1rem;
      max-width: 100%;
      width: 100%;
    }

    .experts-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .expert-header {
      padding: 1rem;
      flex-direction: column;
      text-align: center;
    }

    .expert-avatar {
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
    }

    .expert-content {
      padding: 1rem;
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: 0.75rem;
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

  /* Очень маленькие экраны */
  @media (max-width: 480px) {
    .experts-page {
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

    .expert-header {
      padding: 0.75rem;
    }

    .expert-avatar {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .expert-name {
      font-size: 1rem;
    }

    .expert-position {
      font-size: 0.8rem;
    }

    .expert-content {
      padding: 0.75rem;
    }

    .competence-tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
    }
  }
</style>
