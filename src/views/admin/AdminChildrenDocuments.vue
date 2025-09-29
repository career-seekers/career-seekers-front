<template>
  <div class="children-documents-page">
    <div class="page-header">
      <h1 class="page-title">
        <i class="pi pi-users" />
        Документы участников
      </h1>
      <p class="page-subtitle">Управление участием детей в чемпионате</p>
    </div>

    <div v-if="paginatedChildren.length > 0" class="children-grid">
      <div
        v-for="child in paginatedChildren"
        :key="child.id"
        class="child-card"
      >
        <div class="child-header">
          <div class="child-icon">
            <i class="pi pi-user" />
          </div>
          <div class="child-info">
            <h3 class="child-name">
              {{ getChildFullName(child) }}
            </h3>
          </div>
        </div>

        <div class="child-content">
          <div class="child-details">
            <div class="detail-item">
              <span class="detail-label">ФИО:</span>
              <span class="detail-value">{{ getChildFullName(child) }}</span>
            </div>
            <div class="detail-item" v-if="child.childDocuments?.ageCategory">
              <span class="detail-label">Возрастная группа:</span>
              <span class="detail-value">{{ getAgeGroupLabel(child.childDocuments.ageCategory) }}</span>
            </div>
            <div class="detail-item" v-if="child.childDocuments?.learningClass">
              <span class="detail-label">Класс:</span>
              <span class="detail-value">{{ child.childDocuments.learningClass }} класс</span>
            </div>
            <div class="detail-item" v-if="child.dateOfBirth">
              <span class="detail-label">Дата рождения:</span>
              <span class="detail-value">{{ formatDate(child.dateOfBirth) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Родитель:</span>
              <span class="detail-value">{{ getParentFullName(child.user) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ child.user.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{ child.user.mobileNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Документов:</span>
              <span class="detail-value">{{ getChildDocumentsCount(child) }}</span>
            </div>
          </div>

          <div class="verify">
            <Button
              icon="pi pi-check"
              style="background: white"
              label="Принять"
              class="p-button-text p-button-sm p-button-success"
              @click="approveChildParticipation(child.id)"
            />
            <Button
              icon="pi pi-times"
              style="background: white"
              label="Отклонить"
              class="p-button-text p-button-sm p-button-danger"
              @click="rejectChildParticipation(child.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-users" style="font-size: 3rem; color: #6c757d;"></i>
      <h3>Нет данных о детях</h3>
      <p>Документы детей не найдены</p>
    </div>

    <!-- Пагинация -->
    <div class="pagination-container" v-if="totalRecords > itemsPerPage">
      <Paginator
        :rows="itemsPerPage"
        :totalRecords="totalRecords"
        :first="currentPage * itemsPerPage"
        @page="onPageChange"
        :rowsPerPageOptions="[8, 16, 24]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      />
    </div>

    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import Paginator from "primevue/paginator";
import ToastPopup from "@/components/ToastPopup.vue";
import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
import ApiResolver from "@/utils/ApiResolver";
import Tooltip from 'primevue/tooltip';

interface ChildDocuments {
  id: number;
  snilsNumber: string;
  snilsId: number;
  studyingPlace: string;
  studyingCertificateId: number;
  learningClass: number;
  ageCategory: string;
  trainingGround: string;
  additionalStudyingCertificateId: number;
  parentRole: string;
  consentToChildPdpId: number;
  birthCertificateId: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  role: string;
  avatarId: number;
  verified: boolean;
  isMentor: boolean;
  tutorId: number | null;
  telegramLink: {
    id: number;
    tgLink: string;
  };
}

interface Child {
  id: number;
  lastName: string;
  firstName: string;
  patronymic: string;
  dateOfBirth: string;
  childDocuments: ChildDocuments;
  user: User;
  mentor: User;
}

export default {
  name: "AdminChildrenDocuments",
  components: {
    Button,
    Paginator,
    ToastPopup,
  },
  directives: {
    'tooltip': Tooltip
  },
  data() {
    return {
      ageGroups: useAgeGroups,
      children: [] as Child[],
      currentPage: 0,
      itemsPerPage: 8,
      errors: {
        toastPopup: {
          title: "",
          message: "",
        },
      },
    };
  },
  computed: {
    totalRecords() {
      return this.children.length;
    },
    paginatedChildren() {
      const start = this.currentPage * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.children.slice(start, end);
    },
  },
  async mounted() {
    await this.loadChildren();
  },
  methods: {
    async loadChildren() {
      try {
        console.log('Loading children documents...');
        const apiResolver = new ApiResolver("users-service/v1/children");
        const response = await apiResolver.request<null, { message: Child[] }>(
          "",
          "GET",
          null,
          localStorage.getItem("access_token") || undefined
        );
        
        console.log('Children response:', response);
        
        if (response.status === 200 && response.message) {
          this.children = response.message;
          console.log('Children loaded:', this.children);
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

    getChildFullName(child: Child) {
      return `${child.lastName} ${child.firstName} ${child.patronymic}`;
    },

    getParentFullName(user: User) {
      return `${user.lastName} ${user.firstName} ${user.patronymic}`;
    },

    formatDate(dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    },

    getAgeGroupLabel(age: string) {
      const ageGroup = this.ageGroups.find(ag => ag.value === age);
      return ageGroup ? ageGroup.label : age;
    },

    getChildDocumentsCount(child: Child) {
      if (!child.childDocuments) return 0;
      
      let count = 0;
      if (child.childDocuments.snilsId) count++;
      if (child.childDocuments.studyingCertificateId) count++;
      if (child.childDocuments.additionalStudyingCertificateId) count++;
      if (child.childDocuments.consentToChildPdpId) count++;
      if (child.childDocuments.birthCertificateId) count++;
      
      return count;
    },

    previewFile(fileId: number) {
      const fileUrl = `/file-service/v1/files/view/${fileId}`;
      window.open(fileUrl, '_blank');
    },

    async approveChildParticipation(childId: number) {
      try {
        console.log(`Approving child participation ${childId}`);
        // Здесь должен быть API вызов для одобрения участия ребенка
        // const response = await this.approveChildAPI(childId);
        
        this.errors.toastPopup = {
          title: "Успех",
          message: "Участие ребенка в чемпионате одобрено",
        };
      } catch (error) {
        console.error('Error approving child participation:', error);
        this.errors.toastPopup = {
          title: "Ошибка",
          message: "Не удалось одобрить участие ребенка",
        };
      }
    },

    async rejectChildParticipation(childId: number) {
      try {
        console.log(`Rejecting child participation ${childId}`);
        // Здесь должен быть API вызов для отклонения участия ребенка
        // const response = await this.rejectChildAPI(childId);
        
        this.errors.toastPopup = {
          title: "Успех",
          message: "Участие ребенка в чемпионате отклонено",
        };
      } catch (error) {
        console.error('Error rejecting child participation:', error);
        this.errors.toastPopup = {
          title: "Ошибка",
          message: "Не удалось отклонить участие ребенка",
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
.children-documents-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  animation: slideInRight 0.4s ease-out;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
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

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 4rem;
}

.child-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.child-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.child-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.child-icon {
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

.child-info {
  flex: 1;
}

.child-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}


.child-content {
  padding: 1.5rem;
}

.child-details {
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #495057;
}

.empty-state p {
  margin: 0;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .children-documents-page {
    padding: 1rem;
  }

  .children-grid {
    grid-template-columns: 1fr;
  }

  .child-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .child-icon {
    align-self: flex-start;
  }

  .document-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .child-actions {
    flex-direction: column;
  }
}
</style>