<template>
  <div class="dashboard-home">
    <div class="page-header">
      <h1 class="page-title">Добро пожаловать, {{ UserState.firstName }}!</h1>
      <p class="page-subtitle">Управляйте площадкой и главными экспертами</p>
    </div>

    <div class="dashboard-grid">
      <!-- Информация о кураторе -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user"></i>
            Информация о кураторе
          </h3>
        </div>
        <div class="card-content">
          <div class="data-section">
            <h4 class="section-title">Персональные данные</h4>
            <div class="data-item">
              <span class="data-label">ФИО:</span>
              <span class="data-value">{{
                  UserState.lastName + " " + UserState.firstName + " " + UserState.patronymic
                }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ UserState.email }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ UserState.mobileNumber }}</span>
            </div>
<!--            <div class="data-item">-->
<!--              <span class="data-label">Должность:</span>-->
<!--              <span class="data-value">{{ UserState.position }}</span>-->
<!--            </div>-->
          </div>
        </div>
      </div>

      <!-- Информация о площадке -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-building"></i>
            Информация о площадке
          </h3>
          <div class="status-badge" :class="venueStatusClass">
            {{ venueStatusText }}
          </div>
        </div>
        <div class="card-content">
          <div class="data-section">
            <div class="data-item">
              <span class="data-label">Название:</span>
              <span class="data-value">{{ venueData.fullName }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Адрес:</span>
              <span class="data-value">{{ venueData.address }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Веб-сайт:</span>
              <span class="data-value">{{ venueData.website ? venueData.website : 'Не указан' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Статус модерации:</span>
              <span class="data-value">{{ venueData.verified ? 'Подтверждено' : 'На модерации' }}</span>
            </div>
          </div>
          
          <div class="card-actions">
            <Button 
              label="Редактировать информацию" 
              icon="pi pi-pencil"
              class="p-button-outlined"
              @click="editVenueInfo"
            />
          </div>
        </div>
      </div>

      <!-- Статистика главных экспертов -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-users"></i>
            Эксперты и Компетенции
          </h3>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ experts.length }}</div>
              <div class="stat-label">Всего экспертов</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ competencies.length }}</div>
              <div class="stat-label">Компетенций</div>
            </div>
          </div>
          
          <div class="card-actions">
            <Button 
              label="Управление экспертами" 
              icon="pi pi-cog"
              class="p-button-outlined"
              @click="goToExperts"
            />
          </div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-bolt"></i>
            Быстрые действия
          </h3>
        </div>
        <div class="card-content">
          <div class="quick-actions">
            <Button 
              label="Добавить главного эксперта" 
              icon="pi pi-user-plus"
              class="p-button-primary"
              @click="addExpert"
            />
            <Button 
              label="Просмотреть документы" 
              icon="pi pi-file-text"
              class="p-button-outlined"
              @click="viewDocuments"
            />
          </div>
        </div>
      </div>

      <!-- Диалог добавления/редактирования эксперта -->
      <Dialog
          v-model:visible="showAddExpertDialog"
          header="Добавить главного эксперта"
          :modal="true"
          :style="{ width: '600px' }"
      >
        <div class="expert-form">
          <div class="form-field">
            <label for="fullName">ФИО *</label>
            <InputText
                id="fullName"
                v-model="expertForm.fullName"
                placeholder="Введите ФИО эксперта"
                :class="{ 'p-invalid': !expertForm.fullName }"
            />
            <small v-if="errors.fullName" class="p-error">{{ errors.fullName }}</small>
          </div>

          <div class="form-field">
            <label for="birthDate">Дата рождения *</label>
            <InputMask
                id="birthDate"
                v-model="expertForm.birthDate"
                mask="99.99.9999"
                class="w-full"
                placeholder="дд.мм.гггг"
                :class="{ 'p-invalid': !expertForm.birthDate }"
            />
            <small v-if="errors.birthDate" class="p-error">{{ errors.birthDate }}</small>
          </div>

          <div class="form-field">
            <label for="email">Email *</label>
            <InputText
                id="email"
                type="email"
                v-model="expertForm.email"
                placeholder="Введите email"
                :class="{ 'p-invalid': !expertForm.email }"
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>

          <div class="form-field">
            <label for="parentPhone" class="field-label">Контактный телефон *</label>
            <InputMask
                id="parentPhone"
                v-model="expertForm.phone"
                mask="+7 (999) 999-99-99"
                placeholder="+7 (___) ___-__-__"
                class="w-full"
                :class="{ 'p-invalid': !expertForm.phone }"
            />
            <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
          </div>
        </div>

        <template #footer>
          <Button
              label="Отмена"
              icon="pi pi-times"
              class="p-button-text"
              @click="cancelEdit"
          />
          <Button
              label="Сохранить"
              icon="pi pi-check"
              class="p-button-primary"
              @click="saveExpert"
          />
        </template>
      </Dialog>

<!--      &lt;!&ndash; Последние обновления &ndash;&gt;-->
<!--      <div class="info-card">-->
<!--        <div class="card-header">-->
<!--          <h3 class="card-title">-->
<!--            <i class="pi pi-clock"></i>-->
<!--            Последние обновления-->
<!--          </h3>-->
<!--        </div>-->
<!--        <div class="card-content">-->
<!--          <div class="updates-list">-->
<!--            <div v-for="update in recentUpdates" :key="update.id" class="update-item">-->
<!--              <div class="update-icon">-->
<!--                <i :class="update.icon"></i>-->
<!--              </div>-->
<!--              <div class="update-content">-->
<!--                <div class="update-text">{{ update.text }}</div>-->
<!--                <div class="update-time">{{ update.time }}</div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
    </div>
    <ToastPopup :content="errors.toastPopup"/>
  </div>
</template>

<script lang="ts">
import Button from 'primevue/button'
import {UserState} from "../../../state/UserState";
import {PlatformResolver} from "@/api/resolvers/platform/platform.resolver.js";
import {PlatformOutputDto} from "@/api/resolvers/platform/dto/output/platform-output.dto.js";
import ToastPopup from "@/components/ToastPopup.vue";
import {UserResolver} from "@/api/resolvers/user/user.resolver";
import {CompetenceResolver} from "@/api/resolvers/competence/competence.resolver";
import {UserOutputDto} from "@/api/resolvers/user/dto/output/user-output.dto";
import {CompetenceOutputDto} from "@/api/resolvers/competence/dto/output/competence-output.dto";
import {Roles} from "../../../state/UserState.types";
import {UpdateUserInputDto} from "@/api/resolvers/user/dto/input/update-user-input.dto";
import {UserInputDto} from "@/api/resolvers/user/dto/input/user-input.dto";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import InputMask from "primevue/inputmask";

export default {
  name: 'TutorDashboardHome',
  components: {
    InputText,
    Dialog,
    InputMask,
    ToastPopup,
    Button
  },
  data() {
    return {
      platformResolver: new PlatformResolver(),
      userResolver: new UserResolver(),
      competenceResolver: new CompetenceResolver(),
      experts: [] as UserOutputDto[],
      competencies: [] as CompetenceOutputDto[],
      showAddExpertDialog: false,
      expertForm: {
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
      },
      venueData: {
        id: null,
        fullName: '',
        shortName: '',
        address: '',
        email: '',
        website: '',
        verified: false,
        userId: UserState.id
      } as PlatformOutputDto,
      errors: {
        toastPopup: {
          title: '',
          message: ''
        },
        fullName: '',
        shortName: '',
        address: '',
        email: '',
        phone: '',
        birthDate: '',
      },
      recentUpdates: [
        {
          id: 1,
          icon: 'pi pi-user-plus',
          text: 'Добавлен новый главный эксперт: Сидоров А.В.',
          time: '1 час назад'
        },
        {
          id: 2,
          icon: 'pi pi-file-upload',
          text: 'Загружен документ: Лицензия на образовательную деятельность',
          time: '3 часа назад'
        },
        {
          id: 3,
          icon: 'pi pi-check-circle',
          text: 'Информация о площадке отправлена на модерацию',
          time: '1 день назад'
        },
        {
          id: 4,
          icon: 'pi pi-user-edit',
          text: 'Обновлены данные эксперта: Козлов П.С.',
          time: '2 дня назад'
        }
      ]
    }
  },
  computed: {
    UserState() {
      return UserState
    },
    venueStatusClass() {
      if (!this.venueData.verified) return 'status-pending'
      return 'status-approved'
    },
    venueStatusText() {
      if (!this.venueData.verified) return 'На модерации'
      return 'Одобрен'
    },
    dateOfBirthFormatted() {
      const [day, month, year] = this.expertForm.birthDate.split('.');
      const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)))
      return date.toISOString()
    },
    mobileNumberFormatted() {
      return this.expertForm.phone.replaceAll(/\s|-|\(|\)|/g, '')
    },
  },
  methods: {
    goToExperts() {
      this.$router.push('/tutor/experts')
    },
    addExpert() {
      this.expertForm = {
        fullName: "",
        email: "",
        phone: "",
        birthDate: ""
      }
      this.showAddExpertDialog = true
    },
    cancelEdit() {
      this.expertForm = {
        fullName: '',
        email: '',
        phone: '',
        birthDate: ''
      }
      this.showAddExpertDialog = false
    },
    async saveExpert() {
      if (!this.validateForm()) {
        return
      }
      const newExpert: UserInputDto = {
        lastName: this.expertForm.fullName.split(' ')[0],
        firstName: this.expertForm.fullName.split(' ')[1],
        patronymic: this.expertForm.fullName.split(' ')[2],
        email: this.expertForm.email,
        mobileNumber: this.mobileNumberFormatted,
        password: "Expert$pa33word",
        role: Roles.EXPERT,
        dateOfBirth: this.dateOfBirthFormatted,
        avatarId: null
      }

      const response = await this.userResolver.create(newExpert)
      if (response.status === 200) {
        this.cancelEdit()
      } else {
        this.errors.toastPopup = {
          title: response.status,
          message: response.message
        }
      }
    },
    validateForm() {
      let isValid = true

      if (!this.expertForm.fullName.trim()) {
        this.errors.fullName = 'ФИО обязательно'
        isValid = false
      }

      if (!this.expertForm.email.trim()) {
        this.errors.email = 'email обязателен'
        isValid = false
      }

      if (!this.expertForm.phone.trim()) {
        this.errors.phone = 'Номер телефона обязателен'
        isValid = false
      }

      if (!this.expertForm.birthDate.trim()) {
        this.errors.birthDate = 'Дата рождения обязательна'
        isValid = false
      }

      return isValid
    },
    editVenueInfo() {
      this.$router.push('/tutor/venue-info')
    },
    uploadDocuments() {
      this.$router.push('/tutor/documents')
    },
    viewDocuments() {
      this.$router.push('/tutor/documents')
    },
    sendForModeration() {
      // Логика отправки на модерацию
      console.log('Отправка на модерацию')
      this.venueData.moderationStatus = 'На модерации'
    },
    async loadPlatform() {
      const response = await this.platformResolver.getByUserId(UserState.id)
      if (response.status === 200) {
        this.venueData = response.message
      }
    },
    async loadExperts() {
      const response = await this.userResolver.getAllByRole(Roles.EXPERT)
      if (response.status === 200) {
        this.experts = response.message
      }
    },
    async loadCompetencies() {
      const response = await this.competenceResolver.getAllByUserId(UserState.id)
      if (response.status === 200) {
        this.competencies = response.message
      }
    }
  },
  async mounted() {
    this.isLoading = true
    await this.loadExperts()
    await this.loadPlatform()
    await this.loadCompetencies()
    this.isLoading = false
  }
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
  font-family: 'BIPS', sans-serif;
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
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
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
