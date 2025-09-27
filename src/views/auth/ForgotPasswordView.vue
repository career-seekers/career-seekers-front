<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="forgot-password-header">
        <div class="logo-container">
          <img
            src="@/assets/logo.png"
            alt="Career Seekers Logo"
            class="logo"
          >
        </div>
        <h1 class="forgot-password-title">
          Восстановление пароля
        </h1>
        <div class="divider" />
      </div>

      <div class="forgot-password-content">
        <!-- Этап 1: Ввод email -->
        <div v-if="currentStep === 1" class="step-container">
          <div class="step-info">
            <div class="step-number">1</div>
            <div class="step-text">
              <h3>Введите email</h3>
              <p>Укажите email, который использовался при регистрации</p>
            </div>
          </div>
          
          <form @submit.prevent="handleEmailSubmit" class="forgot-password-form">
            <div class="field">
              <label for="email" class="field-label">Email</label>
              <InputText
                id="email"
                v-model="emailForm.email"
                type="email"
                placeholder="Введите ваш email"
                class="w-full"
                :class="{ 'p-invalid': errors.email }"
              />
              <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            </div>

            <Button
              type="submit"
              label="Отправить код"
              class="w-full submit-button"
              :loading="isLoading"
            />
          </form>
        </div>

        <!-- Этап 2: Ввод кода подтверждения -->
        <div v-if="currentStep === 2" class="step-container">
          <div class="step-info">
            <div class="step-number">2</div>
            <div class="step-text">
              <h3>Введите код подтверждения</h3>
              <p>Мы отправили код на {{ emailForm.email }}</p>
            </div>
          </div>
          
          <form @submit.prevent="handleCodeSubmit" class="forgot-password-form">
            <div class="field">
              <label for="code" class="field-label">Код подтверждения</label>
              <InputText
                id="code"
                v-model="codeForm.code"
                placeholder="Введите код из письма"
                class="w-full"
                :class="{ 'p-invalid': errors.code }"
                maxlength="6"
              />
              <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
            </div>

            <div class="button-group">
              <Button
                type="button"
                label="Назад"
                class="back-button"
                @click="goToPreviousStep"
              />
              <Button
                type="submit"
                label="Подтвердить"
                class="submit-button"
                :loading="isLoading"
              />
            </div>
          </form>
        </div>

        <!-- Этап 3: Новый пароль -->
        <div v-if="currentStep === 3" class="step-container">
          <div class="step-info">
            <div class="step-number">3</div>
            <div class="step-text">
              <h3>Создайте новый пароль</h3>
              <p>Придумайте надежный пароль для вашего аккаунта</p>
            </div>
          </div>
          
          <form @submit.prevent="handlePasswordSubmit" class="forgot-password-form">
            <div class="field">
              <label for="newPassword" class="field-label">Новый пароль</label>
              <Password
                id="newPassword"
                v-model="passwordForm.newPassword"
                placeholder="Введите новый пароль"
                class="w-full"
                :class="{ 'p-invalid': errors.newPassword }"
                :feedback="true"
                toggle-mask
              />
              <small v-if="errors.newPassword" class="p-error">{{ errors.newPassword }}</small>
            </div>

            <div class="field">
              <label for="confirmPassword" class="field-label">Подтвердите пароль</label>
              <Password
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                placeholder="Подтвердите новый пароль"
                class="w-full"
                :class="{ 'p-invalid': errors.confirmPassword }"
                :feedback="false"
                toggle-mask
              />
              <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
            </div>

            <div class="button-group">
              <Button
                type="button"
                label="Назад"
                class="back-button"
                @click="goToPreviousStep"
              />
              <Button
                type="submit"
                label="Сбросить пароль"
                class="submit-button"
                :loading="isLoading"
              />
            </div>
          </form>
        </div>

        <!-- Этап 4: Успех -->
        <div v-if="currentStep === 4" class="step-container success-container">
          <div class="success-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h3 class="success-title">Пароль успешно изменен!</h3>
          <p class="success-message">Теперь вы можете войти в систему с новым паролем</p>
          <Button
            label="Войти в систему"
            class="w-full submit-button"
            @click="goToLogin"
          />
        </div>

        <div class="back-to-login">
          <router-link to="/login" class="back-link">
            <i class="pi pi-arrow-left"></i>
            Вернуться к входу
          </router-link>
        </div>
      </div>
    </div>
    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import { AuthResolver } from "@/api/resolvers/auth/auth.resolver";
import ToastPopup from "@/components/ToastPopup.vue";
import router from '@/router';

export default {
  name: "ForgotPasswordView",
  components: {
    ToastPopup,
    InputText,
    Password,
    Button,
  },
  data() {
    return {
      currentStep: 1,
      isLoading: false,
      emailForm: {
        email: "",
      },
      codeForm: {
        code: "",
      },
      passwordForm: {
        newPassword: "",
        confirmPassword: "",
      },
      errors: {
        email: "",
        code: "",
        newPassword: "",
        confirmPassword: "",
        toastPopup: {
          title: "",
          message: "",
        },
      },
    };
  },
  methods: {
    validateEmail() {
      this.errors.email = "";

      if (!this.emailForm.email) {
        this.errors.email = "Email обязателен";
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.emailForm.email)) {
        this.errors.email = "Введите корректный email";
        return false;
      }

      return true;
    },

    validateCode() {
      this.errors.code = "";

      if (!this.codeForm.code) {
        this.errors.code = "Код подтверждения обязателен";
        return false;
      }

      if (this.codeForm.code.length !== 6) {
        this.errors.code = "Код должен содержать 6 цифр";
        return false;
      }

      return true;
    },

    validatePassword() {
      this.errors.newPassword = "";
      this.errors.confirmPassword = "";

      if (!this.passwordForm.newPassword) {
        this.errors.newPassword = "Новый пароль обязателен";
        return false;
      }

      if (this.passwordForm.newPassword.length < 5) {
        this.errors.newPassword = "Пароль должен содержать минимум 5 символов";
        return false;
      }

      if (!this.passwordForm.confirmPassword) {
        this.errors.confirmPassword = "Подтверждение пароля обязательно";
        return false;
      }

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.errors.confirmPassword = "Пароли не совпадают";
        return false;
      }

      return true;
    },

    async handleEmailSubmit() {
      if (!this.validateEmail()) return;

      this.isLoading = true;
      this.errors.toastPopup = {
        title: '',
        message: '',
      };

      const authResolver = new AuthResolver();
      try {
        const response = await authResolver.forgotPassword({
          email: this.emailForm.email.toLowerCase(),
        });

        if (typeof response.message === 'string') {
          this.errors.toastPopup = {
            title: `Ошибка #${response.status}`,
            message: response.message,
          };
        } else {
          this.currentStep = 2;
        }
      } catch (error) {
        this.errors.toastPopup = {
          title: "Ошибка",
          message: "Произошла ошибка при отправке кода. Попробуйте еще раз.",
        };
      }
      this.isLoading = false;
    },

    async handleCodeSubmit() {
      if (!this.validateCode()) return;

      this.isLoading = true;
      this.errors.toastPopup = {
        title: '',
        message: '',
      };

      const authResolver = new AuthResolver();
      try {
        const response = await authResolver.verifyCode({
          email: this.emailForm.email.toLowerCase(),
          code: this.codeForm.code,
        });

        if (typeof response.message === 'string') {
          this.errors.toastPopup = {
            title: `Ошибка #${response.status}`,
            message: response.message,
          };
        } else {
          this.currentStep = 3;
        }
      } catch (error) {
        this.errors.toastPopup = {
          title: "Ошибка",
          message: "Неверный код подтверждения. Попробуйте еще раз.",
        };
      }
      this.isLoading = false;
    },

    async handlePasswordSubmit() {
      if (!this.validatePassword()) return;

      this.isLoading = true;
      this.errors.toastPopup = {
        title: '',
        message: '',
      };

      const authResolver = new AuthResolver();
      try {
        const response = await authResolver.resetPassword({
          email: this.emailForm.email.toLowerCase(),
          code: this.codeForm.code,
          newPassword: this.passwordForm.newPassword,
          confirmPassword: this.passwordForm.confirmPassword,
        });

        if (typeof response.message === 'string') {
          this.errors.toastPopup = {
            title: `Ошибка #${response.status}`,
            message: response.message,
          };
        } else {
          this.currentStep = 4;
        }
      } catch (error) {
        this.errors.toastPopup = {
          title: "Ошибка",
          message: "Произошла ошибка при сбросе пароля. Попробуйте еще раз.",
        };
      }
      this.isLoading = false;
    },

    goToPreviousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },

    goToLogin() {
      router.push('/login');
    },
  },
};
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.forgot-password-card {
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

.forgot-password-header {
  text-align: center;
  padding: 2rem 2rem 0 2rem;
  flex-shrink: 0;
  background: white;
  border-radius: 12px 12px 0 0;
}

.divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #e0e0e0 20%,
    #e0e0e0 80%,
    transparent 100%
  );
  margin: 1.5rem 0 0 0;
}

.forgot-password-content {
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

.forgot-password-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  font-family: "BIPS", sans-serif;
}

.step-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 1rem;
}

.step-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #ff9800;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-text h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.step-text p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeInUp 0.6s ease-out both;
}

.field:nth-child(1) {
  animation-delay: 0.4s;
}

.field:nth-child(2) {
  animation-delay: 0.5s;
}

.field:nth-child(3) {
  animation-delay: 0.6s;
}

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

.submit-button {
  margin-top: 0.5rem;
  height: 3rem;
  font-size: 1rem;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.back-button {
  flex: 1;
  height: 3rem;
  font-size: 1rem;
  font-weight: 500;
  background: #6c757d;
  border-color: #6c757d;
}

.back-button:hover {
  background: #5a6268;
  border-color: #5a6268;
}

.submit-button {
  flex: 2;
  height: 3rem;
  font-size: 1rem;
  font-weight: 500;
}

.success-container {
  text-align: center;
  padding: 2rem 0;
}

.success-icon {
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 1rem;
}

.success-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.success-message {
  color: #6c757d;
  margin: 0 0 2rem 0;
  font-size: 1rem;
  line-height: 1.5;
}

.back-to-login {
  margin-top: 2rem;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #ff9800;
}

/* Кастомный скроллбар */
.forgot-password-content::-webkit-scrollbar {
  width: 8px;
}

.forgot-password-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
  margin: 8px 0;
}

.forgot-password-content::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.forgot-password-content::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}

/* Кнопки на всю ширину на десктопе */
.p-button {
  width: 100%;
  justify-content: center;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .forgot-password-container {
    padding: 1rem;
  }

  .forgot-password-card {
    margin: 0;
    border-radius: 12px;
  }

  .forgot-password-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .forgot-password-content {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }

  .forgot-password-title {
    font-size: 1.5rem;
  }

  .field {
    margin-bottom: 1.25rem;
  }

  .field-label {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .button-group {
    flex-direction: column;
    gap: 0.75rem;
  }

  .back-button,
  .submit-button {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1rem;
    font-size: 1rem;
  }

  .p-inputtext,
  .p-password-input {
    padding: 0.875rem;
    font-size: 1rem;
  }

  .step-info {
    flex-direction: column;
    text-align: center;
  }

  .step-number {
    align-self: center;
  }
}
</style>
