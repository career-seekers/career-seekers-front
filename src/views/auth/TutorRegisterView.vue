<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-container">
          <img src="@/assets/logo.png" alt="Career Seekers Logo" class="logo" />
        </div>
        <h1 class="register-title">Регистрация куратора</h1>
        <div class="divider"></div>
      </div>
      
      <div class="register-content">
        <form @submit.prevent="handleRegister" class="register-form">
        <div class="field">
          <label for="fullName" class="field-label">ФИО *</label>
          <InputText
            id="fullName"
            v-model="registerForm.fullName"
            placeholder="Введите ваше полное имя"
            class="w-full"
            :class="{ 'p-invalid': errors.fullName }"
          />
          <small v-if="errors.fullName" class="p-error">{{ errors.fullName }}</small>
        </div>

        <div class="field">
          <label for="parentBirthDate" class="field-label">Дата рождения *</label>
          <InputMask
              id="parentBirthDate"
              v-model="registerForm.birthDate"
              mask="99.99.9999"
              placeholder="дд.мм.гггг"
              class="w-full"
              :class="{ 'p-invalid': errors.birthDate }"
          />
          <small v-if="errors.birthDate" class="p-error">{{ errors.birthDate }}</small>
        </div>

        <div class="field">
          <label for="educationalInstitution" class="field-label">Образовательное учреждение *</label>
          <InputText
            id="educationalInstitution"
            v-model="registerForm.educationalInstitution"
            placeholder="Введите название учебного заведения"
            class="w-full"
            :class="{ 'p-invalid': errors.educationalInstitution }"
          />
          <small v-if="errors.educationalInstitution" class="p-error">{{ errors.educationalInstitution }}</small>
        </div>

        <div class="field">
          <label for="position" class="field-label">Должность *</label>
          <InputText
            id="position"
            v-model="registerForm.position"
            placeholder="Введите вашу должность"
            class="w-full"
            :class="{ 'p-invalid': errors.position }"
          />
          <small v-if="errors.position" class="p-error">{{ errors.position }}</small>
        </div>

        <div class="field">
          <label for="telegramLink" class="field-label">Ссылка на Telegram *</label>
            <InputText
                id="relationship"
                v-model="registerForm.telegramLink"
                placeholder="Например, @telegram_username"
                class="w-full"
                @blur="validateTelegramLink"
                :class="{ 'p-invalid': errors.telegramLink }"
            />
          <small v-if="errors.telegramLink" class="p-error">{{ errors.telegramLink }}</small>
        </div>

        <div class="field">
          <label for="phone" class="field-label">Контактный телефон *</label>
          <InputMask
            id="phone"
            v-model="registerForm.phone"
            mask="+7 (999) 999-99-99"
            placeholder="+7 (___) ___-__-__"
            class="w-full"
            :class="{ 'p-invalid': errors.phone }"
          />
          <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
        </div>

        <div class="field">
          <label for="email" class="field-label">Адрес электронной почты *</label>
          <InputText
            id="email"
            v-model="registerForm.email"
            type="email"
            placeholder="example@email.com"
            class="w-full"
            :class="{ 'p-invalid': errors.email }"
            @blur="validateEmail"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <div class="field">
          <label for="password" class="field-label">Пароль *</label>
          <Password
            id="password"
            v-model="registerForm.password"
            placeholder="Введите пароль"
            class="w-full"
            :class="{ 'p-invalid': errors.password }"
            :feedback="true"
            toggleMask
            weakLabel="Слабый"
            mediumLabel="Средний"
            strongLabel="Надежный"
            promptLabel="Введите пароль"
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <div class="field">
          <label for="confirmPassword" class="field-label">Подтверждение пароля *</label>
          <Password
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            placeholder="Подтвердите пароль"
            class="w-full"
            :class="{ 'p-invalid': errors.confirmPassword }"
            :feedback="false"
            toggleMask
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
        </div>

        <div class="field">
          <label for="consentFile" class="field-label">Согласие на обработку персональных данных *</label>
          <FileUpload
            id="consentFile"
            mode="basic"
            accept=".pdf,.doc,.docx"
            :maxFileSize="5000000"
            chooseLabel="Выберите файл"
            class="w-full"
            :class="{ 'p-invalid': errors.consentFile }"
            @select="onFileSelect"
            @remove="onFileRemove"
          />
          <small v-if="errors.consentFile" class="p-error">{{ errors.consentFile }}</small>
          <small class="p-text-secondary">Поддерживаемые форматы: PDF, DOC, DOCX (максимум 5 МБ)</small>
        </div>

        <div class="field">
          <div class="flex align-items-center">
            <Checkbox
              id="agreement"
              v-model="registerForm.agreement"
              :binary="true"
              :class="{ 'p-invalid': errors.agreement }"
            />
            <label for="agreement" class="ml-2 agreement-label">
              Я согласен с 
              <a href="#" class="link" @click.prevent="showTerms">условиями использования</a>
              и 
              <a href="#" class="link" @click.prevent="showPrivacy">политикой конфиденциальности</a>
            </label>
          </div>
          <small v-if="errors.agreement" class="p-error">{{ errors.agreement }}</small>
        </div>

        <Button
          type="submit"
          label="Зарегистрироваться"
          class="w-full register-button"
          :loading="isLoading"
        />

        <div class="login-link">
          <p>Уже есть аккаунт? 
            <router-link to="/login" class="link">Войти</router-link>
          </p>
        </div>
        </form>
      </div>
    </div>

    <!-- Диалог условий использования -->
    <Dialog v-model:visible="showTermsDialog" modal header="Условия использования" :style="{ width: '90vw', maxWidth: '500px' }" class="terms-dialog">
      <p>Здесь будут условия использования сервиса...</p>
    </Dialog>

    <!-- Диалог политики конфиденциальности -->
    <Dialog v-model:visible="showPrivacyDialog" modal header="Политика конфиденциальности" :style="{ width: '90vw', maxWidth: '500px' }" class="privacy-dialog">
      <p>Здесь будет политика конфиденциальности...</p>
    </Dialog>

    <ToastPopup :content="errors.toastPopup"/>
  </div>
</template>

<script lang="ts">
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import Password from 'primevue/password'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import ToastPopup from "@/components/ToastPopup.vue";
import {AuthResolver} from "@/api/resolvers/auth/auth.resolver.js";
import {UserRegistrationDto} from "@/api/resolvers/auth/dto/input/register-input.dto.js";
import {RegistrationData, Roles, TutorStateInterface} from "../../../state/UserState.types.js";
import {FileManager} from "@/utils/FileManager";

export default {
  name: 'TutorRegisterView',
  components: {
    ToastPopup,
    InputText,
    InputMask,
    Password,
    Button,
    FileUpload,
    Checkbox,
    Dialog
  },
  data() {
    return {
      isLoading: false,
      showTermsDialog: false,
      showPrivacyDialog: false,
      registerForm: {
        fullName: '',
        birthDate: '',
        educationalInstitution: '',
        position: '',
        telegramLink: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        consentFile: null,
        agreement: false
      },
      errors: {
        toastPopup: {
          title: '',
          message: '',
        },
        fullName: '',
        birthDate: '',
        educationalInstitution: '',
        position: '',
        telegramLink: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        consentFile: '',
        agreement: ''
      }
    }
  },
  computed: {
    mobileNumberFormatted() {
      return this.registerForm.phone.replaceAll(/\s|-|\(|\)|/g, '')
    },
    dateOfBirthFormatted() {
      const [day, month, year] = this.registerForm.birthDate.split('.');
      const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)))
      return date.toISOString()
    },
    telegramLinkFormatted() {
      return this.registerForm.telegramLink.replace("@", "https://t.me/")
    }
  },
  methods: {
    validateTelegramLink() {
      if (this.registerForm.telegramLink && !/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(this.registerForm.telegramLink)) {
        this.errors.telegramLink = 'Введите корректную ссылку'
      } else this.errors.telegramLink = ''
    },
    validateEmail() {
      if (this.registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerForm.email)) {
        this.errors.email = 'Введите корректный email'
      } else {
        this.errors.email = ''
      }
    },

    validateForm() {
      Object.keys(this.errors).forEach(key => {
        this.errors[key] = ''
      })

      let isValid = true

      // Проверка ФИО
      if (!this.registerForm.fullName.trim()) {
        this.errors.fullName = 'ФИО обязательно'
        isValid = false
      } else if (this.registerForm.fullName.trim().split(' ').length < 2) {
        this.errors.fullName = 'Введите полное имя (имя и фамилию)'
        isValid = false
      }

      //Проверка даты рождения
      if (!this.registerForm.birthDate.trim()) {
        this.errors.birthDate = 'Дата рождения обязательна'
        isValid = false
      }

      // Проверка образовательного учреждения
      if (!this.registerForm.educationalInstitution.trim()) {
        this.errors.educationalInstitution = 'Образовательное учреждение обязательно'
        isValid = false
      }

      // Проверка должности
      if (!this.registerForm.position.trim()) {
        this.errors.position = 'Должность обязательна'
        isValid = false
      }

      //Проверка телеграм ссылки
      if (!this.registerForm.telegramLink.trim()) {
        this.errors.telegramLink = 'Ссылка обязательна для связи'
        isValid = false
      } else if (!/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(this.registerForm.telegramLink)) {
        this.errors.telegramLink = 'Введите корректную ссылку'
        isValid = false
      }

      // Проверка телефона
      if (!this.registerForm.phone) {
        this.errors.phone = 'Телефон обязателен'
        isValid = false
      } else if (this.registerForm.phone.replace(/\D/g, '').length !== 11) {
        this.errors.phone = 'Введите корректный номер телефона'
        isValid = false
      }

      // Проверка email
      if (!this.registerForm.email) {
        this.errors.email = 'Email обязателен'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerForm.email)) {
        this.errors.email = 'Введите корректный email'
        isValid = false
      }

      // Проверка пароля
      if (!this.registerForm.password) {
        this.errors.password = 'Пароль обязателен'
        isValid = false
      } else if (this.registerForm.password.length < 8) {
        this.errors.password = 'Пароль должен содержать минимум 8 символов'
        isValid = false
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.registerForm.password)) {
        this.errors.password = 'Пароль должен содержать заглавные и строчные буквы, а также цифры'
        isValid = false
      }

      // Проверка подтверждения пароля
      if (!this.registerForm.confirmPassword) {
        this.errors.confirmPassword = 'Подтверждение пароля обязательно'
        isValid = false
      } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.errors.confirmPassword = 'Пароли не совпадают'
        isValid = false
      }

      // Проверка файла согласия
      if (!this.registerForm.consentFile) {
        this.errors.consentFile = 'Необходимо загрузить согласие на обработку персональных данных'
        isValid = false
      }

      // Проверка согласия с условиями
      if (!this.registerForm.agreement) {
        this.errors.agreement = 'Необходимо согласиться с условиями использования'
        isValid = false
      }

      return isValid
    },

    onFileSelect(event) {
      const file = event.files[0]
      if (file) {
        // Проверяем размер файла (5 МБ)
        if (file.size > 5000000) {
          this.errors.consentFile = 'Размер файла не должен превышать 5 МБ'
          return
        }

        // Проверяем тип файла
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowedTypes.includes(file.type)) {
          this.errors.consentFile = 'Поддерживаются только файлы PDF, DOC и DOCX'
          return
        }

        this.registerForm.consentFile = file
        this.errors.consentFile = ''
      }
    },

    onFileRemove() {
      this.registerForm.consentFile = null
      this.errors.consentFile = ''
    },

    async handleRegister() {
      if (!this.validateForm()) return
      this.errors.toastPopup = {
        title: '',
        message: ''
      }
      this.isLoading = true

      try {
        const authResolver = new AuthResolver()
        const response = await authResolver.preRegister({
          email: this.registerForm.email,
          mobileNumber: this.mobileNumberFormatted
        })
        if (response.status !== 200) {
          this.errors.toastPopup = {
            title: `Ошибка #${response.status}`,
            message: response.message
          }
        } else {
          const fileManager = new FileManager()
          const registrationData: RegistrationData<
              UserRegistrationDto,
              TutorStateInterface
          > = {
            dto: {
              type: "UserRegistrationDto",
              verificationCode: "",
              lastName: this.registerForm.fullName.split(' ')[0],
              firstName: this.registerForm.fullName.split(' ')[1],
              patronymic: this.registerForm.fullName.split(' ')[2],
              dateOfBirth: this.dateOfBirthFormatted,
              email: this.registerForm.email,
              mobileNumber: this.mobileNumberFormatted,
              password: this.registerForm.password,
              role: Roles.TUTOR,
              uuid: ""
            },
            extra: {
              post: this.registerForm.position,
              institution: this.registerForm.educationalInstitution,
              consentFileName: await fileManager.saveFileToCache(this.registerForm.consentFile)
            }
          }
          localStorage.setItem("dataToVerify", JSON.stringify(registrationData))
          localStorage.setItem("telegramLink", JSON.stringify(this.telegramLinkFormatted))
          this.$router.push({
            path: '/email-confirmation',
            query: {email: this.registerForm.email}
          })
        }
      } catch (error) {
        console.error('Ошибка регистрации:', error)
      } finally {
        this.isLoading = false
      }
    },

    showTerms() {
      this.showTermsDialog = true
    },

    showPrivacy() {
      this.showPrivacyDialog = true
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.8s ease-out 0.2s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-header {
  text-align: center;
  padding: 2rem 2rem 0 2rem;
  flex-shrink: 0;
  background: white;
  border-radius: 12px 12px 0 0;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e0e0e0 20%, #e0e0e0 80%, transparent 100%);
  margin: 1.5rem 0 0 0;
}

.register-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem 2rem;
  scrollbar-width: thin;
  scrollbar-color: #ff9800 #f1f1f1;
}

.logo-container {
  margin-bottom: 1.5rem;
}

.logo {
  max-width: 120px;
  height: auto;
  object-fit: contain;
}

.register-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  font-family: 'BIPS', sans-serif;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeInUp 0.6s ease-out both;
}

.field:nth-child(1) { animation-delay: 0.4s; }
.field:nth-child(2) { animation-delay: 0.5s; }
.field:nth-child(3) { animation-delay: 0.6s; }
.field:nth-child(4) { animation-delay: 0.7s; }
.field:nth-child(5) { animation-delay: 0.8s; }
.field:nth-child(6) { animation-delay: 0.9s; }
.field:nth-child(7) { animation-delay: 1.0s; }
.field:nth-child(8) { animation-delay: 1.1s; }
.field:nth-child(9) { animation-delay: 1.2s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.field-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.register-button {
  margin-top: 0.5rem;
  height: 3rem;
  font-size: 1rem;
  font-weight: 500;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link p {
  margin: 0;
  color: #6c757d;
}

.agreement-label {
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.4;
}

.link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}

:deep(.p-fileupload) {
  width: 100%;
}

:deep(.p-fileupload-buttonbar) {
  background: transparent;
  border: none;
  padding: 0;
}

:deep(.p-fileupload-content) {
  display: none;
}

:deep(.p-fileupload .p-button) {
  background: transparent;
  border: 2px solid #ff9800;
  color: #ff9800;
  width: 100%;
  transition: all 0.3s ease;
}

:deep(.p-fileupload .p-button:hover) {
  background: #ff9800;
  color: white;
  border-color: #ff9800;
}

:deep(.p-fileupload .p-button:focus) {
  box-shadow: 0 0 0 0.2rem rgba(255, 152, 0, 0.25);
}

/* Кнопки на всю ширину на десктопе */
.p-button {
  width: 100%;
  justify-content: center;
}

:deep(.p-checkbox) {
  margin-right: 0.5rem;
}

/* Кастомный скроллбар */
.register-content::-webkit-scrollbar {
  width: 8px;
}

.register-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
  margin: 8px 0;
}

.register-content::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.register-content::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }
  
  .register-card {
    margin: 0;
    border-radius: 12px;
  }
  
  .register-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .register-content {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }
  
  .register-title {
    font-size: 1.5rem;
  }
  
  .field {
    margin-bottom: 1.25rem;
  }
  
  .field-label {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  
  /* Кнопки на всю ширину */
  .p-button {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1rem;
    font-size: 1rem;
  }
  
  /* Поля ввода */
  .p-inputtext,
  .p-password-input {
    padding: 0.875rem;
    font-size: 1rem;
  }
  
  /* FileUpload на мобильных */
  :deep(.p-fileupload .p-button) {
    width: 100%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0.75rem 1rem;
  }
  
  :deep(.p-fileupload .p-button-label) {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }
  
  /* Диалоги на мобильных */
  :deep(.p-dialog) {
    width: 95vw !important;
    margin: 1rem;
  }
}

</style>
