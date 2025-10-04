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
              <span class="data-value">{{ user ? `${user.lastName} ${user.firstName} ${user.patronymic}` : 'Загрузка...' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ user?.email || 'Загрузка...' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ user?.mobileNumber ? FormatManager.formatMobileNumberFromDTO(user.mobileNumber) : 'Загрузка...' }}</span>
            </div>
            <!-- <div class="data-item">
              <span class="data-label">Статус:</span>
              <span class="data-value">{{ user?.verified ? 'Подтверждён' : 'Не подтверждён' }}</span>
            </div> -->
          </div>
        </div>
      </div>

      <!-- Список детей -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-header-content">
            <h3 class="card-title">
              <i class="pi pi-users" />
              Мои участники
            </h3>
            <Button
              label="Поделиться ссылкой"
              icon="pi pi-share-alt"
              class="p-button-sm header-button"
              @click="generateParentLink"
            />
          </div>
        </div>
        <div class="card-content">
          <div class="participants-preview">
            <p class="preview-text">
              Всего участников: {{ user?.menteeChildren?.length || 0 }}
            </p>
            <div
              v-if="user?.menteeChildren && user.menteeChildren.length > 0"
              class="participants-list"
            >
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
                      Возраст: {{ FormatManager.calculateAge(child.dateOfBirth) }} лет
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
            <div
              v-else
              class="empty-state"
            >
              <i class="pi pi-users empty-icon" />
              <p class="empty-text">
                У вас пока нет участников
              </p>
              <p class="empty-subtitle">
                Поделитесь ссылкой с родителями для привлечения участников
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Компетенции участников -->
      <div
        v-if="user?.menteeChildren && user.menteeChildren.length > 0"
        class="info-card"
      >
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-star" />
            Компетенции участников
          </h3>
        </div>
        <div class="card-content">
          <div class="competencies-section competencies-scrollable">
            <div 
              v-for="child in user.menteeChildren" 
              :key="child.id"
              class="child-competencies"
            >
              <h4 class="child-name">
                {{ `${child.lastName} ${child.firstName} ${child.patronymic}` }}
              </h4>
              <div
                v-if="getCompetenciesByChildId(child.id).length > 0"
                class="competencies-list"
              >
                <div 
                  v-for="competence in getCompetenciesByChildId(child.id)"
                  :key="competence.id"
                  class="competence-item"
                  @click="openCompetenceDialog(competence.direction.id)"
                >
                  <div class="competence-icon">
                    <i class="pi pi-star" />
                  </div>
                  <div class="competence-info">
                    <div class="competence-name">
                      {{ competence.direction.name }}
                    </div>
                    <div class="competence-description">
                      {{ competence.direction.description }}
                    </div>
                    <div class="competence-expert">
                      <i class="pi pi-user" />
                      Главный эксперт: {{ expertNames.get(competence.direction.expertId) || `ID ${competence.direction.expertId}` }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="no-competencies"
              >
                <i class="pi pi-info-circle" />
                <span>Участник пока не зарегистрирован ни на одну компетенцию</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <CompetenceDialog
      v-if="selectedCompetence"
      :selected-competence-prop="selectedCompetence!"
      :show-details-dialog-prop="showDetailsDialog"
      @update:show-details-dialog="(show) => showDetailsDialog = show"
    />

    <!-- Диалог для отображения ссылки -->
    <Dialog
      v-model:visible="showLinkDialog"
      header="Ссылка для родителей"
      :modal="true"
      :style="{ width: '500px' }"
      class="link-dialog"
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
import { FormatManager } from '@/utils/FormatManager.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
import type {
  ChildCompetenciesOutputDto
} from '@/api/resolvers/childCompetencies/dto/output/child-competencies-output.dto.ts';
import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
import CompetenceDialog from '@/components/dialogs/CompetenceDetailsDialog.vue';
import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
import { MentorLinksResolver } from '@/api/resolvers/mentorLinks/mentor-links.resolver.ts';
import type { MentorLinkOutputDto } from '@/api/resolvers/mentorLinks/dto/output/mentor-link-output.dto.ts';

export default {
  name: "MentorDashboardHome",
  components: {
    CompetenceDialog,
    Button,
    Dialog,
    InputText,
  },
  emits: ["openSettings"],
  data() {
    return {
      userStore: useUserStore(),
      childCompetenciesResolver: new ChildCompetenciesResolver(),
      competenceResolver: new CompetenceResolver(),
      userResolver: new UserResolver(),
      mentorLinksResolver: new MentorLinksResolver(),
      showLinkDialog: false,
      generatedLink: "",
      loading: false,
      showDetailsDialog: false,
      selectedCompetence: null as CompetenceOutputDto | null,
      childCompetencies: [] as {
        child: ChildOutputDto,
        competencies: ChildCompetenciesOutputDto[]
      }[],
      expertsCache: new Map<number, UserOutputDto>(),
      expertNames: new Map<number, string>()
    };
  },
  computed: {
    FormatManager() {
      return FormatManager
    },
    user() {
      return this.userStore.user;
    },
    MentorName() {
      return this.user?.firstName || "Наставник";
    },
    menteeChildren() {
      return this.user?.menteeChildren
    }
  },
  watch: {
    menteeChildren: {
      handler() {
        // Перезагружаем компетенции при изменении списка детей
        this.loadAllChildrenCompetencies();
      },
      deep: true
    }
  },
  async mounted() {
    // Загружаем компетенции для всех детей при монтировании компонента
    await this.loadAllChildrenCompetencies();
  },
  methods: {
    async openCompetenceDialog(competenceId: number) {
      console.log('Opening competence dialog for ID:', competenceId);
      if (this.selectedCompetence === null || this.selectedCompetence.id !== competenceId) {
        const response = await this.competenceResolver.getById(competenceId)
        console.log('Competence response:', response);
        if (typeof response.message === "string" || response.status !== 200) {
          console.error('Failed to load competence:', response);
          return;
        }
        this.selectedCompetence = response.message
        console.log('Selected competence set:', this.selectedCompetence);
      }
      this.showDetailsDialog = true;
      console.log('Dialog should be visible now. showDetailsDialog:', this.showDetailsDialog);
    },
    getCompetenciesByChildId(childId: number) {
      const competencies = this.childCompetencies.find(row => row.child.id === childId)?.competencies
      return competencies ? competencies : []
    },
    async loadCompetenciesByChild(child: ChildOutputDto) {
      const response = await this.childCompetenciesResolver.getByChildId(child.id)
      if (typeof response.message === "string" || response.status !== 200) return
      this.childCompetencies.push({
        child: child,
        competencies: response.message
      })
    },
    getChildCompetenciesCount(childId: number): number {
      return this.getCompetenciesByChildId(childId).length;
    },
    async getExpertName(expertId: number): Promise<string> {
      // Проверяем кэш
      if (this.expertsCache.has(expertId)) {
        const expert = this.expertsCache.get(expertId)!;
        return `${expert.lastName} ${expert.firstName} ${expert.patronymic}`;
      }

      try {
        // Загружаем данные эксперта
        const response = await this.userResolver.getById(expertId);
        if (typeof response.message === "string" || response.status !== 200) {
          return `ID ${expertId}`;
        }

        const expert = response.message;
        // Сохраняем в кэш
        this.expertsCache.set(expertId, expert);
        return `${expert.lastName} ${expert.firstName} ${expert.patronymic}`;
      } catch (error) {
        console.error('Ошибка при загрузке эксперта:', error);
        return `ID ${expertId}`;
      }
    },
    async loadAllChildrenCompetencies() {
      if (!this.user?.menteeChildren) return;

      this.loading = true;
      try {
        const promises = this.user.menteeChildren.map(child =>
          this.loadCompetenciesByChild(child));
        await Promise.all(promises);

        // Загружаем имена экспертов для всех компетенций
        await this.loadExpertNames();
      } catch (error) {
        console.error('Ошибка при загрузке компетенций:', error);
      } finally {
        this.loading = false;
      }
    },
    async loadExpertNames() {
      const expertIds = new Set<number>();
      
      // Собираем все уникальные ID экспертов
      this.childCompetencies.forEach(row => {
        row.competencies.forEach(competence => {
          expertIds.add(competence.direction.expertId);
        });
      });

      // Загружаем имена экспертов
      const promises = Array.from(expertIds).map(async (expertId) => {
        if (!this.expertNames.has(expertId)) {
          const expertName = await this.getExpertName(expertId);
          this.expertNames.set(expertId, expertName);
        }
      });

      await Promise.all(promises);
    },
    async generateParentLink() {
      if (this.userStore.user) {
        try {
          // Сначала пытаемся получить существующую ссылку
          const existingLinkResponse = await this.mentorLinksResolver.getByUserId(this.userStore.user.id);
          
          if (existingLinkResponse.status === 200 && typeof existingLinkResponse.message !== "string") {
            // Ссылка уже существует, показываем её
            this.generatedLink = `${window.location.origin}/link/${existingLinkResponse.message.biscuit}`;
            this.showLinkDialog = true;
            return;
          }
          
          // Если ссылки нет, создаём новую
          const response = await this.mentorLinksResolver.create({
            userId: this.userStore.user.id
          });
          
          if (response.status !== 200 && typeof response.message === "string") {
            // Проверяем, не является ли ошибка "ссылка уже существует"
            const errorMessage = response.message;
            if (errorMessage && errorMessage.includes('уже существует')) {
              // Пытаемся получить существующую ссылку ещё раз
              const retryResponse = await this.mentorLinksResolver.getByUserId(this.userStore.user.id);
              if (retryResponse.status === 200 && typeof retryResponse.message !== "string") {
                this.generatedLink = `${window.location.origin}/link/${retryResponse.message.biscuit}`;
                this.showLinkDialog = true;
                return;
              }
            }
            alert('Ошибка при создании ссылки: ' + errorMessage);
            return;
          }
          
          // Используем biscuit для создания ссылки
          this.generatedLink = `${window.location.origin}/link/${(response.message as MentorLinkOutputDto).biscuit}`;
          this.showLinkDialog = true;
        } catch (error) {
          console.error('Ошибка при создании ссылки:', error);
          alert('Не удалось создать ссылку');
        }
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
  display: flex;
  justify-content: space-between;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  flex: 1;
}

.card-title i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.header-button {
  background: white !important;
  color: #ff9800 !important;
  border: 2px solid white !important;
  font-weight: 600 !important;
}

.header-button:hover {
  background: #f8f9fa !important;
  color: #f57c00 !important;
  border-color: #f8f9fa !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

/* Адаптивные стили для скролла */
@media (max-width: 768px) {
  .competencies-scrollable {
    max-height: 300px;
  }
  
  .card-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .competencies-scrollable {
    max-height: 250px;
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

.competencies-scrollable {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Кастомный скроллбар для WebKit браузеров */
.competencies-scrollable::-webkit-scrollbar {
  width: 6px;
}

.competencies-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.competencies-scrollable::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 3px;
}

.competencies-scrollable::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.competence-item:hover {
  background: #e3f2fd;
  border-left-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
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
  transition: all 0.3s ease;
}

.competence-item:hover .competence-icon {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  transform: scale(1.1);
}

.competence-info {
  flex: 1;
}

.competence-name {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.competence-item:hover .competence-name {
  color: #2196f3;
}

.competence-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.competence-item:hover .competence-description {
  color: #1976d2;
}

.competence-expert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff9800;
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.competence-item:hover .competence-expert {
  color: #1976d2;
}

.competence-expert i {
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.competence-item:hover .competence-expert i {
  color: #1976d2;
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

/* Стили для модальных окон */
.p-dialog {
  z-index: 1000;
}

.p-dialog-mask {
  z-index: 999;
}

/* Стили для диалога ссылки */
.link-dialog .p-dialog {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.link-dialog .p-dialog-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 1.5rem;
}

.link-dialog .p-dialog-content {
  padding: 1.5rem;
  background: #fafafa;
}

/* Мобильные стили для диалогов */
@media (max-width: 768px) {
  .p-dialog {
    width: 95vw !important;
    max-width: 95vw !important;
    margin: 1rem;
  }
  
  .link-dialog .p-dialog-header,
  .link-dialog .p-dialog-content {
    padding: 1rem;
  }
  
  /* Hover эффекты для touch устройств */
  .competence-item:active {
    background: #e3f2fd;
    border-left-color: #2196f3;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  }
  
  .competence-item:active .competence-icon {
    background: linear-gradient(135deg, #2196f3, #1976d2);
    transform: scale(1.05);
  }
  
  .competence-item:active .competence-name {
    color: #2196f3;
  }
  
  .competence-item:active .competence-description {
    color: #1976d2;
  }
  
  .competence-item:active .competence-expert,
  .competence-item:active .competence-expert i {
    color: #1976d2;
  }
}
</style>
