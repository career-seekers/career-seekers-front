<template>
  <div class="mentors-page">
    <div class="page-header">
      <h1 class="page-title">Главные эксперты</h1>
      <p class="page-subtitle">Управление главными экспертами и их компетенциями</p>
    </div>

    <!-- Кнопка добавления эксперта -->
    <div class="page-actions">
      <Button 
        label="Добавить главного эксперта" 
        icon="pi pi-user-plus"
        class="p-button-primary"
        @click="addExpert"
      />
    </div>

    <!-- Список экспертов -->
    <div class="experts-grid">
      <div v-for="expert in experts" :key="expert.id" class="expert-card">
        <div class="expert-header">
          <div class="expert-avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="expert-info">
            <h3 class="expert-name">{{
                expert.lastName + " " + expert.firstName + " " + expert.patronymic
              }}</h3>
            <p class="expert-position">{{ expert.expertDocuments }}</p>
          </div>
          <div class="expert-actions">
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              style="background: white;"
              @click="editExpert(expert)"
              v-tooltip="'Редактировать'"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              style="background: white;"
              @click="deleteExpert(expert)"
              v-tooltip="'Удалить'"
            />
          </div>
        </div>
        
        <div class="expert-content">
          <div class="expert-details">
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ expert.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{ reformatPhone(expert.mobileNumber) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Должность:</span>
              <span class="detail-value">{{ expert.expertDocuments ? expert.expertDocuments.post : 'Не указано'}}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Образовательное учреждение:</span>
              <span class="detail-value">{{ expert.expertDocuments ? expert.expertDocuments.institution : 'Не указано'}}</span>
            </div>
          </div>
          
          <div class="competencies-section">
            <h4 class="competencies-title">Компетенции:</h4>
            <div class="competencies-list">
              <span 
                v-for="competence in expertCompetencies.find(exComp => exComp.expertId === expert.id)?.competencies"
                :key="competence.id"
                class="competence-tag"
              >
                {{ competence.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог добавления/редактирования эксперта -->
    <Dialog 
      v-model:visible="showAddExpertDialog" 
      :header="isEditing ? 'Редактировать эксперта' : 'Добавить главного эксперта'"
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
          :label="isEditing ? 'Сохранить' : 'Добавить'" 
          icon="pi pi-check" 
          class="p-button-primary"
          @click="saveExpert"
        />
      </template>
    </Dialog>
    <ToastPopup :content="errors.toastPopup"/>
  </div>
</template>

<script lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputMask from "primevue/inputmask";
import MultiSelect from 'primevue/multiselect'
import Textarea from 'primevue/textarea'
import {UserResolver} from "@/api/resolvers/user/user.resolver.js";
import ToastPopup from "@/components/ToastPopup.vue";
import {UserOutputDto} from "@/api/resolvers/user/dto/output/user-output.dto";
import {Roles} from "../../../state/UserState.types";
import {UserInputDto} from "@/api/resolvers/user/dto/input/user-input.dto";
import {UpdateUserInputDto} from "@/api/resolvers/user/dto/input/update-user-input.dto";
import {CompetenceOutputDto} from "@/api/resolvers/competence/dto/output/competence-output.dto";
import {CompetenceResolver} from "@/api/resolvers/competence/competence.resolver";

export default {
  name: 'TutorExperts',
  components: {
    ToastPopup,
    Button,
    Dialog,
    InputText,
    MultiSelect,
    Textarea,
    InputMask
  },
  data() {
    return {
      oldMail: '',
      showAddExpertDialog: false,
      isEditing: false,
      editingExpertId: null,
      expertForm: {
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
      },
      availableCompetencies: [
        { id: 1, name: 'Веб-разработка' },
        { id: 2, name: 'Мобильная разработка' },
        { id: 3, name: 'Дизайн интерфейсов' },
        { id: 4, name: 'Анализ данных' },
        { id: 5, name: 'Кибербезопасность' },
        { id: 6, name: 'Искусственный интеллект' },
        { id: 7, name: 'Робототехника' },
        { id: 8, name: '3D-моделирование' }
      ],
      errors: {
        toastPopup: {
          title: '',
          message: ''
        },
        email: '',
        fullName: '',
        birthDate: '',
        phone: ''
      },
      expertCompetencies: [] as {
        expertId: number,
        competencies: CompetenceOutputDto[]
      }[],
      experts: [] as UserOutputDto[],
      userResolver: new UserResolver(),
      competenceResolver: new CompetenceResolver(),
    }
  },
  computed: {
    dateOfBirthFormatted() {
      const [day, month, year] = this.expertForm.birthDate.split('.');
      const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)))
      return date.toISOString()
    },
    mobileNumberFormatted() {
      return this.expertForm.phone.replaceAll(/\s|-|\(|\)/g, '')
    },
  },
  methods: {
    addExpert() {
      this.expertForm = {
        fullName: "",
        email: "",
        phone: "",
        birthDate: ""
      }
      this.showAddExpertDialog = true
    },
    editExpert(expert: UserOutputDto) {
      this.isEditing = true
      this.editingExpertId = expert.id
      this.expertForm = {
        fullName: `${expert.lastName} ${expert.firstName} ${expert.patronymic}`,
        email: expert.email,
        phone: this.reformatPhone(expert.mobileNumber),
        birthDate: this.reformatDateOfBirth(expert.dateOfBirth)
      }
      this.oldMail = expert.email
      this.showAddExpertDialog = true
    },
    reformatDateOfBirth(date) {
      const [year, month, day] = date.substring(0, 10).split('-')
      return `${day}.${month}.${year}`
    },
    reformatPhone(phone) {
      return `${phone.substring(0, 2)} (${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8, 10)}-${phone.substring(10, 12)}`
    },
    async deleteExpert(expert: UserOutputDto) {
      if (confirm(`Вы уверены, что хотите удалить эксперта ${expert.firstName}?`)) {
        const response = await this.userResolver.delete(expert.id)
        if (response.status === 200) {
          await this.loadExperts()
        } else {
          this.errors.toastPopup = {
            title: response.status,
            message: response.message
          }
        }
      }
    },
    async saveExpert() {
      if (!this.validateForm()) {
        return
      }
      
      if (this.isEditing) {
        const expert = this.experts.find((ex: UserOutputDto) => ex.id === this.editingExpertId)
        if (expert) {
          const editedExpert: UpdateUserInputDto = {
            avatarId: expert.avatarId,
            dateOfBirth: this.dateOfBirthFormatted,
            email: this.expertForm.email,
            firstName: this.expertForm.fullName.split(' ')[1],
            lastName: this.expertForm.fullName.split(' ')[0],
            mobileNumber: this.mobileNumberFormatted,
            password: expert.password,
            patronymic: this.expertForm.fullName.split(' ')[2],
            role: Roles.EXPERT,
            id: this.editingExpertId
          }

          const response = await this.userResolver.update({
            ...editedExpert,
            email: editedExpert.email === this.oldMail
              ? undefined
              : editedExpert.email,
          })
          if (response.status === 200) {
            this.cancelEdit()
          } else {
            this.errors.toastPopup = {
              title: response.status,
              message: response.message
            }
          }
        }
      } else {
        const newExpert: UserInputDto = {
          lastName: this.expertForm.fullName.split(' ')[0],
          firstName: this.expertForm.fullName.split(' ')[1],
          patronymic: this.expertForm.fullName.split(' ')[2],
          email: this.expertForm.email,
          mobileNumber: this.mobileNumberFormatted,
          password: null,
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
      }
      await this.loadExperts()
    },
    cancelEdit() {
      this.isEditing = false
      this.editingExpertId = null
      this.expertForm = {
        fullName: '',
        email: '',
        phone: '',
        birthDate: ''
      }
      this.showAddExpertDialog = false
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
    async loadExperts() {
      const response = await this.userResolver.getAllByRole(Roles.EXPERT)
      if (response.status === 200) {
        this.experts = response.message
        for (const expert of this.experts) {
          const response = await this.competenceResolver.getAllByExpertId(expert.id)
          if (response.status === 200) {
            this.expertCompetencies.push({
              expertId: expert.id,
              competencies: response.message
            })
          }
        }
      } else {
        this.errors.toastPopup = {
          title: response.status,
          message: response.message
        }
      }
    }
  },
  async mounted() {
    await this.loadExperts()
  },
  watch: {
    showAddExpertDialog() {
      this.errors = {
        toastPopup: {
          title: '',
          message: ''
        }
      }
    }
  }
}
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
  font-family: 'BIPS', sans-serif;
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
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
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
