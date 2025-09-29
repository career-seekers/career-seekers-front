<template>
  <div class="dashboard-home">
    <div class="page-header">
      <h1 class="page-title">
        Добро пожаловать, {{ MentorName }}!
      </h1>
      <p class="page-subtitle">
        Управляйте участниками и отслеживайте их прогресс
      </p>
    </div>

    <div class="dashboard-grid">
      <!-- Информация о наставнике -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user" />
            Информация о наставнике
          </h3>
        </div>
        <div class="card-content">
          <div class="data-section">
            <h4 class="section-title">
              Персональные данные
            </h4>
            <div class="data-item">
              <span class="data-label">ФИО:</span>
              <span class="data-value">{{ user ? `${user.lastName} ${user.firstName} ${user.patronymic}` : 'Загрузка...' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ user?.email || 'Загрузка...' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ user?.mobileNumber ? formatMobileNumber(user.mobileNumber) : 'Загрузка...' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Статус:</span>
              <span class="data-value">{{ user?.verified ? 'Подтверждён' : 'Не подтверждён' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Список детей -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-users" />
            Мои участники
          </h3>
        </div>
        <div class="card-content">
          <div class="participants-preview">
            <p class="preview-text">
              Всего участников: {{ user?.menteeChildren?.length || 0 }}
            </p>
            <div v-if="user?.menteeChildren && user.menteeChildren.length > 0" class="participants-list">
              <div 
                v-for="child in user.menteeChildren" 
                :key="child.id"
                class="participant-item"
              >
                <div class="participant-info">
                  <div class="participant-name">
                    {{ `${child.lastName} ${child.firstName} ${child.patronymic}` }}
                  </div>
                  <div class="participant-details">
                    <span class="participant-age">
                      Возраст: {{ calculateAge(child.dateOfBirth) }} лет
                    </span>
                    <span class="participant-school">
                      {{ child.childDocuments?.studyingPlace || 'Школа не указана' }}
                    </span>
                  </div>
                </div>
                <div class="participant-competencies">
                  <div class="competencies-count">
                    Компетенций: {{ getChildCompetenciesCount(child.id) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="pi pi-users empty-icon" />
              <p class="empty-text">У вас пока нет участников</p>
              <p class="empty-subtitle">Поделитесь ссылкой с родителями для привлечения участников</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Компетенции участников -->
      <div class="info-card" v-if="user?.menteeChildren && user.menteeChildren.length > 0">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-star" />
            Компетенции участников
          </h3>
        </div>
        <div class="card-content">
          <div class="competencies-section">
            <div 
              v-for="child in user.menteeChildren" 
              :key="child.id"
              class="child-competencies"
            >
              <h4 class="child-name">
                {{ `${child.lastName} ${child.firstName} ${child.patronymic}` }}
              </h4>
              <div v-if="getChildCompetencies(child.id).length > 0" class="competencies-list">
                <div 
                  v-for="competence in getChildCompetencies(child.id)" 
                  :key="competence.id"
                  class="competence-item"
                >
                  <div class="competence-icon">
                    <i class="pi pi-star" />
                  </div>
                  <div class="competence-info">
                    <div class="competence-name">{{ competence.name }}</div>
                    <div class="competence-description">{{ competence.description }}</div>
                    <div class="competence-expert">
                      <i class="pi pi-user" />
                      Главный эксперт: ID {{ competence.expertId }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-competencies">
                <i class="pi pi-info-circle" />
                <span>Участник пока не зарегистрирован ни на одну компетенцию</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            <Button
              label="Сгенерировать ссылку для родителей"
              icon="pi pi-link"
              class="p-button-success"
              @click="generateParentLink"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог для отображения ссылки -->
    <Dialog
      v-model:visible="showLinkDialog"
      header="Ссылка для родителей"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="link-dialog-content">
        <p class="link-description">
          Поделитесь этой ссылкой с родителями, чтобы они могли выбрать вас в качестве наставника для своего ребенка:
        </p>
        <div class="link-container">
          <InputText
            v-model="generatedLink"
            readonly
            class="link-input"
          />
          <Button
            icon="pi pi-copy"
            class="p-button-outlined p-button-sm"
            @click="copyLink"
          />
        </div>
        <p class="link-note">
          <i class="pi pi-info-circle" />
          Родители смогут выбрать вас в качестве наставника для своих детей после перехода по ссылке
        </p>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { useUserStore } from '@/stores/userStore.ts';
import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';

export default {
  name: "MentorDashboardHome",
  components: {
    Button,
    Dialog,
    InputText,
  },
  data() {
    return {
      userStore: useUserStore(),
      competenceResolver: new CompetenceResolver(),
      showLinkDialog: false,
      generatedLink: "",
      childrenCompetencies: {} as Record<number, CompetenceOutputDto[]>,
      loading: false,
    };
  },
  computed: {
    user() {
      return this.userStore.user;
    },
    MentorName() {
      return this.user?.firstName || "Наставник";
    },
  },
  methods: {
    formatMobileNumber(number: string) {
      return `${number.substring(0, 2)}
              (${number.substring(2, 5)})
              ${number.substring(5, 8)}
              ${number.substring(8, 10)}
              -${number.substring(10, 12)}`;
    },
    calculateAge(birthDate: string) {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    },
    getChildCompetencies(childId: number): CompetenceOutputDto[] {
      return this.childrenCompetencies[childId] || [];
    },
    getChildCompetenciesCount(childId: number): number {
      return this.getChildCompetencies(childId).length;
    },
    async loadChildCompetencies(childId: number) {
      try {
        const response = await this.competenceResolver.getAllByUserId(childId);
        if (response.message && Array.isArray(response.message)) {
          this.childrenCompetencies[childId] = response.message;
        }
      } catch (error) {
        console.error('Ошибка при загрузке компетенций для ребенка:', error);
        this.childrenCompetencies[childId] = [];
      }
    },
    async loadAllChildrenCompetencies() {
      if (!this.user?.menteeChildren) return;
      
      this.loading = true;
      try {
        const promises = this.user.menteeChildren.map(child => 
          this.loadChildCompetencies(child.id)
        );
        await Promise.all(promises);
      } catch (error) {
        console.error('Ошибка при загрузке компетенций:', error);
      } finally {
        this.loading = false;
      }
    },
    generateParentLink() {
      if (this.userStore.user) {
        // Генерируем зашифрованный ID наставника
        const mentorId = this.userStore.user.id;
        const encryptedId = btoa(mentorId.toString()); 
        this.generatedLink = `${window.location.origin}/link/${encryptedId}`;
        this.showLinkDialog = true;
      }
    },
    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.generatedLink);
        // Показываем уведомление об успешном копировании
        alert('Ссылка скопирована в буфер обмена');
      } catch (err) {
        console.error('Ошибка при копировании ссылки:', err);
        alert('Не удалось скопировать ссылку');
      }
    },
  },
  async mounted() {
    // Загружаем компетенции для всех детей при монтировании компонента
    await this.loadAllChildrenCompetencies();
  },
  watch: {
    'user.menteeChildren': {
      handler() {
        // Перезагружаем компетенции при изменении списка детей
        this.loadAllChildrenCompetencies();
      },
      deep: true
    }
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

.stats-actions {
  text-align: center;
}

/* Быстрые действия */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
    flex-direction: column;
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

  .participant-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .participant-competencies {
    text-align: left;
    width: 100%;
  }

  .competence-item {
    flex-direction: column;
    gap: 0.75rem;
  }

  .competence-icon {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .child-competencies {
    margin-bottom: 1.5rem;
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
    flex-direction: column;
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

  .participant-item {
    padding: 0.75rem;
  }

  .participant-name {
    font-size: 0.9rem;
  }

  .participant-age,
  .participant-school {
    font-size: 0.8rem;
  }

  .competencies-count {
    font-size: 0.8rem;
  }

  .child-name {
    font-size: 1rem;
  }

  .competence-item {
    padding: 0.75rem;
  }

  .competence-icon {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }

  .competence-name {
    font-size: 0.9rem;
  }

  .competence-description {
    font-size: 0.8rem;
  }

  .competence-expert {
    font-size: 0.8rem;
  }

  .empty-icon {
    font-size: 2.5rem;
  }

  .empty-text {
    font-size: 0.9rem;
  }

  .empty-subtitle {
    font-size: 0.8rem;
  }
}

/* Стили для участников */
.participants-preview {
  text-align: center;
}

.preview-text {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.participants-list {
  margin-top: 1rem;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border-left: 3px solid #ff9800;
}

.participant-item:last-child {
  margin-bottom: 0;
}

.participant-info {
  flex: 1;
}

.participant-name {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.participant-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.participant-age,
.participant-school {
  color: #6c757d;
  font-size: 0.85rem;
}

.participant-competencies {
  text-align: right;
}

.competencies-count {
  color: #ff9800;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Стили для компетенций */
.competencies-section {
  margin-top: 1rem;
}

.child-competencies {
  margin-bottom: 2rem;
}

.child-competencies:last-child {
  margin-bottom: 0;
}

.child-name {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.competencies-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.competence-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #ff9800;
}

.competence-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.competence-info {
  flex: 1;
}

.competence-name {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.competence-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.competence-expert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff9800;
  font-size: 0.85rem;
  font-weight: 500;
}

.competence-expert i {
  font-size: 0.9rem;
}

.no-competencies {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #e9ecef;
  border-radius: 8px;
  color: #6c757d;
  font-size: 0.9rem;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  color: #adb5bd;
  font-size: 0.9rem;
  margin: 0;
}

/* Стили для диалога ссылки */
.link-dialog-content {
  padding: 1rem 0;
}

.link-description {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.link-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.link-input {
  flex: 1;
  font-family: monospace;
  font-size: 0.9rem;
}

.link-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #ff9800;
}

.link-note i {
  color: #ff9800;
  font-size: 1rem;
}
</style>
